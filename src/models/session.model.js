import mongoose from "mongoose";


const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [ true, "User is required" ]
    },
    familyId: {
        type: String,
        required: [true, "Family ID is required"],
        index: true,
    },
    refreshTokenHash: {
        type: String,
        required: [ true, "Refresh token hash is required"]
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    ip: {
        type: String,
        required: [ true, "IP is required"]
    },
    userAgent: {
        type: String,
        required: [ true, "User agent is required" ]
    },
    revoked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const sessionModel = mongoose.model("session", sessionSchema)

export default sessionModel