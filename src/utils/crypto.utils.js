import crypto from "crypto";
import config from "../config/config.js";

const ENCRYPTION_KEY = crypto.createHash("sha256").update(config.JWT_SECRET).digest();

export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashSHA256(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}

export function generateRandomToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString("hex");
}

export function encryptAES256GCM(text) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    // Format: iv:authTag:encrypted
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

  

//Decrypts AES-256-GCM ciphertext and validates authentication tag
export function decryptAES256GCM(encryptedPayload) {
    const [ivHex, authTagHex, encryptedText] = encryptedPayload.split(":");
    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        ENCRYPTION_KEY,
        Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

  

// generates 10 digit single use 8 char code

export function generateBackupCodes(count = 10) {
    const plainCodes = [];
    const hashedCodes = [];

    for (let i = 0; i < count; i++) {
        const plain = crypto.randomBytes(4).toString("hex").toUpperCase();
        plainCodes.push(plain);

        hashedCodes.push({

        codeHash: hashSHA256(plain),
        used: false,
        usedAt: null,
    });
    }

    return { plainCodes, hashedCodes };
}