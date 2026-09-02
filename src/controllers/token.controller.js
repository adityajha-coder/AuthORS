import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { hashSHA256 } from "../utils/crypto.utils.js";


export async function refreshToken(req, res) {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({
            message: "Refresh token not found"
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }

    const refreshTokenHash = hashSHA256(token);

    const session = await sessionModel.findOne({
        refreshTokenHash,
    });

    if (!session) {
        return res.status(401).json({
            message: "Invalid refresh token"
        });
    }

    if(session.isUsed || session.revoked){
        await sessionModel.updateMany(
            {
                familyId: session.familyId,
                revoked: false,
            },
            {
                revoked: true,
            }
        );

        res.clearCookie("refreshToken")

        return res.status(403).json({
            message: "Suspicious activity detected. All active sessions for this device have been terminated for security. Please login again."
        });
    }

    session.isUsed = true;
    await session.save();

    const newRefreshToken = jwt.sign(
        { id: decoded.id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const newRefreshTokenHash = hashSHA256(newRefreshToken);

    const newSession = await sessionModel.create({
        user: session.user,
        familyId: session.familyId,
        refreshTokenHash: newRefreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        isUsed: false,
        revoked: false,
    })

    const accessToken = jwt.sign(
        { 
            id: decoded.id,
            sessionId: newSession._id,
        },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
        message: "Access token refreshed successfully",
        accessToken
    });
}

export async function logout(req, res) {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(400).json({
            message: "Refresh token not found"
        });
    }

    const refreshTokenHash = hashSHA256(token);

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    });

    if(session){
        await sessionModel.updateMany(
            {
                familyId: session.familyId,
                revoked: false
            },
            {
                revoked: true
            }
        );
    }

    res.clearCookie("refreshToken");

    return res.status(200).json({
        message: "Logged out successfully"
    });
}


export async function logoutALL(req, res) {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(400).json({
            message: "Refresh token not found"
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }

    await sessionModel.updateMany(
        {
            user: decoded.id,
            revoked: false
        },
        {
            revoked: true
        }
    );

    res.clearCookie("refreshToken");

    return res.status(200).json({
        message: "Logged out from all devices successfully"
    });
}
