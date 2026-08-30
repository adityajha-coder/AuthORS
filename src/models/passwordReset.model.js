import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
    user: {
        type:
        mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "User refrence is required"],
    },
    tokenHash: {
        type: String,
        required: [true, "Token hash is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900, // 15 mintues(900s)
    }
});

const passwordResetModel = mongoose.model("password_resets", passwordResetSchema);

export default passwordResetModel;