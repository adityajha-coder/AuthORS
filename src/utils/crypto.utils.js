import crypto from "crypto";

export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashSHA256(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}

export function generateRandomToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString("hex");
}
