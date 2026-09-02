import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username must be unique"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email must be unique"]
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === "local";
        },
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true,
    },
    avatar: {
        type: String,
    },
    authProvider: {
        type: String,
        enum: ["local", "google", "github"],
        default: "local",
    },
    verified: {
        type: Boolean,
        default: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorSecret: {
        type: String,
        default: null,
    },
    twoFactorTempSecret: {
        type: String,
        default: null,
    },
    twoFactorLastUsed: {
        type: Number,
        default: 0,
    },
    twoFactorBackupCodes: [
        {
            codeHash: { type: String, required: true },
            used: { type: Boolean, default: false },
            usedAt: { type: Date, default: null },
        }
    ],
}, { timestamps: true });

const userModel = mongoose.model("users", userSchema)

export default userModel;