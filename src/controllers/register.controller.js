import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOTP, hashSHA256 } from "../utils/crypto.utils.js";
import { getOTPHtml } from "../emails/otp.template.js";


export async function register(req, res) {
    const { userName, email, password } = req.body;

    const isAlreadyRegistered = await userModel.findOne({
        $or: [
            { userName },
            { email }
        ]
    });

    if (isAlreadyRegistered) {
        const isEmailTaken = isAlreadyRegistered.email === email;
        return res.status(409).json({
            message: isEmailTaken ? "Email is already registered" : "Username is already taken"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userModel.create({
        userName,
        email,
        password: hashedPassword
    });

    const otp = generateOTP();
    const otpHash = hashSHA256(otp);

    await otpModel.create({
        email,
        user: user._id,
        otpHash
    });

    try {
        await sendEmail(
            email,
            "OTP Verification - AuthORS",
            `Your OTP code is ${otp}`,
            getOTPHtml(otp)
        );
    } catch (emailError) {
        return res.status(500).json({
            message: "User created, but failed to send verification email. Please try logging in or requesting a new OTP."
        });
    }

    return res.status(201).json({
        message: "User registered successfully",
        user: {
            userName: user.userName,
            email: user.email,
            verified: user.verified
        }
    });
}

export async function verifyEmail(req, res) {
    const { otp, email } = req.body;

    const otpHash = hashSHA256(otp);

    const otpDoc = await otpModel.findOne({
        email,
        otpHash
    });

    if (!otpDoc) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }

    const user = await userModel.findByIdAndUpdate(
        otpDoc.user,
        { verified: true },
        { new: true }
    );

    await otpModel.deleteMany({
        user: otpDoc.user
    });

    return res.status(200).json({
        message: "Email verified successfully",
        user: {
            userName: user.userName,
            email: user.email,
            verified: user.verified
        }
    });
}
