import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    event: {
        type: String,
        required: [true, "Audit event type is required"],
        enum: [
            "LOGIN_SUCCESS",
            "LOGIN_FAILED",
            "REGISTER_INITIATED",
            "EMAIL_VERIFIED",
            "PASSWORD_RESET_REQUESTED",
            "PASSWORD_RESET_COMPLETED",
            "TOKEN_ROTATED",
            "TOKEN_REUSE_ATTACK_DETECTED",
            "LOGOUT",
            "LOGOUT_ALL",
            "OAUTH_LOGIN_SUCCESS",
            "2FA_ENROLL_INITIATED",
            "2FA_ENABLED",
            "2FA_DISABLED",
            "2FA_VERIFIED_SUCCESS",
            "2FA_VERIFIED_FAILED",
            "2FA_BACKUP_CODE_USED",
            "2FA_BACKUP_CODES_REGENERATED",
        ],
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
        index: true,
    },
    email: {
        type: String,
        default: null,
        index: true,
    },
    status: {
        type: String,
        enum: ["SUCCESS", "FAILURE", "WARNING", "CRITICAL"],
        required: true,
        index: true,
    },
    ip: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
        required: true,
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});

auditLogSchema.index({ user: 1, createdAt: -1 });

const auditLogModel = mongoose.model("audit_logs", auditLogSchema);

export default auditLogModel;
