import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const forgotPasswordSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address format"),
});

export const resetPasswordSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address format"),

    token: z
        .string({ required_error: "Reset token is required" })
        .min(32, "Invalid or malformed reset token"),

    password: z
        .string({ required_error: "New password is required" })
        .min(8, "Password must be at least 8 characters long")
        .regex(
            passwordRegex,
            "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)"
        ),
});
