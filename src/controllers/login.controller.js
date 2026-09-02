import bcrypt from "bcrypt";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import crypto from "crypto";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import { logSecurityEvent } from "../services/audit.service.js";
import { hashSHA256 } from "../utils/crypto.utils.js";


export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    if (!user.verified) {
        return res.status(401).json({
            message: "Email not verified"
        });
    }

    let isPasswordValid = false;
    if (user.password.startsWith("$argon2")) {
        isPasswordValid = await argon2.verify(user.password, password);
    } else {
        isPasswordValid = await bcrypt.compare(password, user.password);

        if(isPasswordValid){
            user.password = await argon2.hash(password, {
                type: argon2.argon2id,
            });
            await user.save();
        }
    }

    if (!isPasswordValid) {
        logSecurityEvent({
            event: "LOGIN_FAILED",
            email,
            user: user?._id,
            status: "FAILURE",
            req,
            details: { reason: "Invalid credentials" }
        });
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const refreshToken = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const refreshTokenHash = hashSHA256(refreshToken);

    const familyId = crypto.randomUUID();

    if (user.twoFactorEnabled) {
        const preAuthToken = jwt.sign(
            { id: user._id, stage: "2FA_PENDING" },
            config.JWT_SECRET,
            { expiresIn: "5m" }
        );
        return res.status(200).json({
            require2FA: true,
            preAuthToken,
            message: "Two-factor authentication required. Verify with your 6-digit code or backup code.",
        });
    }


    const session = await sessionModel.create({
        user: user._id,
        familyId,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    });

    const accessToken = jwt.sign(
        {
            id: user._id,
            sessionId: session._id
        },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    await logSecurityEvent({
        event: "LOGIN_SUCCESS",
        user,
        status: "SUCCESS",
        req,
        details: { familyId }
    });

    return res.status(200).json({
        message: "Logged in successfully",
        user: {
            userName: user.userName,
            email: user.email,
        },
        accessToken,
    });
}

export async function getMe(req, res) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    return res.status(200).json({
        message: "User fetched successfully",
        user: {
            userName: user.userName,
            email: user.email,
        }
    });
}
