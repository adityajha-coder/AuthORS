import crypto from "crypto";
import jwt from "jsonwebtoken";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import argon2 from "argon2";
import bcrypt from "bcrypt";
import config from "../config/config.js";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import {
    encryptAES256GCM,
    decryptAES256GCM,
    generateBackupCodes,
    hashSHA256,
} from "../utils/crypto.utils.js";
import { logSecurityEvent } from "../services/audit.service.js";


export async function setup2FA(req, res) {
    const user = await userModel.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA is already enabled for this account" });
    }

    // 1. Generate unencoded base32 secret
    const secret = generateSecret();

    // 2. Generate otpauth URI for Google Authenticator
    const otpauthURL = generateURI({
        issuer: "AuthORS",
        label: user.email,
        secret,
    });

    // 3. Generate QR code image Data URL
    const qrCodeDataURL = await QRCode.toDataURL(otpauthURL);

    // 4. Encrypt temporary secret at rest with AES-256-GCM
    user.twoFactorTempSecret = encryptAES256GCM(secret);
    await user.save();

    await logSecurityEvent({
        event: "2FA_ENROLL_INITIATED",
        user,
        status: "SUCCESS",
        req,
    });

    return res.status(200).json({
        message: "Scan this QR code with Google Authenticator",
        qrCode: qrCodeDataURL,
        manualEntryKey: secret,
    });
}


export async function enable2FA(req, res) {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ message: "Verification code is required" });
    }

    const user = await userModel.findById(req.user.id);
    if (!user || !user.twoFactorTempSecret) {
        return res.status(400).json({ message: "Please initiate 2FA setup first" });
    }

    const secret = decryptAES256GCM(user.twoFactorTempSecret);

    const verification = verifySync({
        token: code.toString().trim(),
        secret,
        epochTolerance: 30,
    });

    if (!verification?.valid) {
        await logSecurityEvent({
            event: "2FA_VERIFIED_FAILED",
            user,
            status: "FAILURE",
            req,
            details: { reason: "Invalid TOTP enrollment code" },
        });
        return res.status(400).json({ message: "Invalid verification code. Check your authenticator app." });
    }

    const { plainCodes, hashedCodes } = generateBackupCodes(10);

    // Activate 2FA
    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorTempSecret = null;
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = hashedCodes;
    user.twoFactorLastUsed = Math.floor(Date.now() / 30000);
    await user.save();

    await logSecurityEvent({
        event: "2FA_ENABLED",
        user,
        status: "SUCCESS",
        req,
    });

    return res.status(200).json({
        message: "2FA successfully enabled! Store these 10 backup codes in a safe place. They will only be shown once.",
        backupCodes: plainCodes,
    });
}


export async function verify2FA(req, res) {
    const { preAuthToken, code, backupCode } = req.body;

    if (!preAuthToken) {
        return res.status(400).json({ message: "Pre Auth token is required" });
    }

    if (!code && !backupCode) {
        return res.status(400).json({ message: "Either a 6-digit TOTP code or a backup code is required" });
    }

    let decoded;
    try {
        decoded = jwt.verify(preAuthToken, config.JWT_SECRET);
        if (decoded.stage !== "2FA_PENDING") {
            return res.status(401).json({ message: "Invalid authentication stage" });
        }
    } catch (err) {
        return res.status(401).json({ message: "Pre Auth token expired or invalid. Please log in again." });
    }

    const user = await userModel.findById(decoded.id);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA is not enabled for this user" });
    }

    // 1. Check TOTP Code
    if (code) {
        const secret = decryptAES256GCM(user.twoFactorSecret);

        // Replay protection within same 30s time
        const currentWindow = Math.floor(Date.now() / 30000);
        if (user.twoFactorLastUsed === currentWindow) {
            return res.status(400).json({ message: "This code was already used. Please wait for the next 30-second code." });
        }

        const verification = verifySync({
            token: code.toString().trim(),
            secret,
            epochTolerance: 30, 
        });

        if (!verification?.valid) {
            await logSecurityEvent({
                event: "2FA_VERIFIED_FAILED",
                user,
                status: "FAILURE",
                req,
                details: { method: "TOTP" },
            });
            return res.status(401).json({ message: "Invalid 2FA code" });
        }

        user.twoFactorLastUsed = currentWindow;
        await user.save();
    }

    // 2. Check Single-Use Backup Code
    if (backupCode) {
        const formattedCode = backupCode.trim().toUpperCase();
        const codeHash = hashSHA256(formattedCode);

        const matchingCode = user.twoFactorBackupCodes.find(
            (c) => c.codeHash === codeHash && !c.used
        );

        if (!matchingCode) {
            await logSecurityEvent({
                event: "2FA_VERIFIED_FAILED",
                user,
                status: "FAILURE",
                req,
                details: { method: "BACKUP_CODE" },
            });
            return res.status(401).json({ message: "Invalid or already used backup code" });
        }

        matchingCode.used = true;
        matchingCode.usedAt = new Date();
        await user.save();

        await logSecurityEvent({
            event: "2FA_BACKUP_CODE_USED",
            user,
            status: "WARNING",
            req,
        });
    }

    // 3. Issue Full Dual Tokens
    const refreshToken = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const refreshTokenHash = hashSHA256(refreshToken);
    const familyId = crypto.randomUUID();

    const session = await sessionModel.create({
        user: user._id,
        familyId,
        refreshTokenHash,
        isUsed: false,
        revoked: false,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    const accessToken = jwt.sign(
        {
            id: user._id,
            sessionId: session._id,
        },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await logSecurityEvent({
        event: "2FA_VERIFIED_SUCCESS",
        user,
        status: "SUCCESS",
        req,
        details: { familyId },
    });

    return res.status(200).json({
        message: "2FA verified! Login completed successfully.",
        user: {
            userName: user.userName,
            email: user.email,
        },
        accessToken,
    });
}


export async function disable2FA(req, res) {
    const { password, code } = req.body;
    const user = await userModel.findById(req.user.id);
    if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA is not active" });
    }

    let isAuthorized = false;

    // Verify via Password
    if (password && user.password) {
        if (user.password.startsWith("$argon2")) {
            isAuthorized = await argon2.verify(user.password, password);
        } else {
            isAuthorized = await bcrypt.compare(password, user.password);
        }
    }

    // Or Verify via Current TOTP Code
    if (!isAuthorized && code && user.twoFactorSecret) {
        const secret = decryptAES256GCM(user.twoFactorSecret);
        const verification = verifySync({
            token: code.toString().trim(),
            secret,
            epochTolerance: 30,
        });
        isAuthorized = verification?.valid;
    }

    if (!isAuthorized) {
        return res.status(401).json({ message: "Re-authentication failed. Provide your correct password or current 2FA code." });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorTempSecret = null;
    user.twoFactorBackupCodes = [];
    await user.save();

    await logSecurityEvent({
        event: "2FA_DISABLED",
        user,
        status: "WARNING",
        req,
    });

    return res.status(200).json({ message: "2FA has been successfully disabled." });
}


export async function regenerateBackupCodesController(req, res) {
    const { code, password } = req.body;
    const user = await userModel.findById(req.user.id);
    if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA must be enabled to generate backup codes" });
    }

    let isAuthorized = false;
    if (code && user.twoFactorSecret) {
        const secret = decryptAES256GCM(user.twoFactorSecret);
        const verification = verifySync({
            token: code.toString().trim(),
            secret,
            epochTolerance: 30,
        });
        isAuthorized = verification?.valid;
    } else if (password && user.password) {
        if (user.password.startsWith("$argon2")) {
            isAuthorized = await argon2.verify(user.password, password);
        } else {
            isAuthorized = await bcrypt.compare(password, user.password);
        }
    }

    if (!isAuthorized) {
        return res.status(401).json({ message: "Re-authentication failed. Provide your current 2FA code or password." });
    }

    const { plainCodes, hashedCodes } = generateBackupCodes(10);
    user.twoFactorBackupCodes = hashedCodes;
    await user.save();

    await logSecurityEvent({
        event: "2FA_BACKUP_CODES_REGENERATED",
        user,
        status: "SUCCESS",
        req,
    });

    return res.status(200).json({
        message: "Old backup codes invalidated. Here are your 10 new single-use backup codes:",
        backupCodes: plainCodes,
    });
}
