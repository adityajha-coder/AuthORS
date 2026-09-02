import jwt from "jsonwebtoken";
import config from "../config/config.js";
import crypto, { createPrivateKey } from "crypto";
import sessionModel from "../models/session.model.js";
import { hashSHA256 } from "../utils/crypto.utils.js";


export async function handleSocialCallback(req, res) {
    const user = req.user;

    if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3001"}/login?error=auth_failed`);
    }

    // 1. Issue Refresh Token (7 days)
    const refreshToken = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const refreshTokenHash = hashSHA256(refreshToken);

    const familyId = crypto.randomUUID();

    // 2. Create Session
    const session = await sessionModel.create({
        user: user._id,
        familyId,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    // 3. Issue Access Token (15m)
    const accessToken = jwt.sign(
        { id: user._id, sessionId: session._id },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    // 4. Set httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5. Redirect user to frontend dashboard with accessToken
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
}
