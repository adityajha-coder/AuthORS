import { z } from "zod";

/* Password complexity :
min 8 chars , 1 uppercase, 1 lowercase, 1 number, 1 special char*/

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
    userName: z
        .string({required_error: "Username is required"})
        .trim()
        .min(3, "Username must be at least 3 characters long")
        .max(15, "Username cannot exceed 15 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contains letters, numbers, and underscores"),

    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address format"),

    password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters long")
        .regex(
            passwordRegex,
            "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)"
        ),
});

export const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address format"),

    password: z
        .string({ required_error: "Password is required" })
        .min(1, "Password cannot be empty"),
});

export const verifyEmailSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address format"),

    otp: z
        .string({ required_error: "OTP is required" })
        .trim()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d{6}$/, "OTP must only contain numbers"),
});