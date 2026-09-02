import argon2 from "argon2";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import passwordResetModel from "../models/passwordReset.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateRandomToken, hashSHA256 } from "../utils/crypto.utils.js";
import { getPasswordResetHtml } from "../emails/resetPassword.template.js";


export async function forgotPassword(req, res) {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    // Anti-User Enumeration: Always return success message even if email is not found
    if (!user) {
        return res.status(200).json({
            message: "If an account with that email exists, a password reset link has been sent."
        });
    }

    await passwordResetModel.deleteMany({ user: user._id });

    const resetToken = generateRandomToken(32);
    const tokenHash = hashSHA256(resetToken);

    await passwordResetModel.create({
        user: user._id,
        tokenHash,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    try {
        await sendEmail(
            user.email,
            "Reset Your Password - AuthORS",
            `Click the link to reset your password: ${resetLink}`,
            getPasswordResetHtml(resetLink, user.userName)
        );

        return res.status(200).json({
            message: "If an account with that email exists, a password reset link has been sent."
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to send password reset email. Please try again later."
        });
    }
}


export async function resetPassword(req, res) {
    const { email, token, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid or expired password reset link" });
    }

    const tokenHash = hashSHA256(token);

    const resetDoc = await passwordResetModel.findOne({
        user: user._id,
        tokenHash,
    });

    if (!resetDoc) {
        return res.status(400).json({ message: "Invalid or expired password reset link" });
    }

    const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
    });

    user.password = hashedPassword;
    await user.save();

    await passwordResetModel.deleteMany({ user: user._id });

    await sessionModel.updateMany({ user: user._id, revoked: false }, { revoked: true });

    return res.status(200).json({
        message: "Password reset successful. Please log in with your new password."
    });
}
