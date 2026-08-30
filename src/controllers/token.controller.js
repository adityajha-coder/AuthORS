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
        revoked: false
    });

    if (!session) {
        return res.status(401).json({
            message: "Invalid refresh token"
        });
    }

    const accessToken = jwt.sign(
        { id: decoded.id },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
        { id: decoded.id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const newRefreshTokenHash = hashSHA256(newRefreshToken);

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

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

    if (!session) {
        return res.status(400).json({
            message: "Invalid refresh token"
        });
    }

    session.revoked = true;
    await session.save();

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
