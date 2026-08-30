import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { registerLimiter, loginLimiter, otpLimiter, passwordResetLimiter } from "../middleware/ratelimit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema, verifyEmailSchema } from "../validators/auth.validator.js";
import { forgotPasswordSchema, resetPasswordSchema } from "../validators/password.validator.js";
import passport from "../config/passport.js";
import { handleSocialCallback } from "../controllers/social.controller.js";

const authRouter = Router();


/**
 * POST /api/auth/register
 */
authRouter.post("/register", registerLimiter, validate(registerSchema), authController.register)

/**
 * POST /api/auth/login
 */
authRouter.post("/login", loginLimiter, validate(loginSchema), authController.login)

/**
 * GET /api/auth/get-me
 */
authRouter.get("/get-me", authController.getMe)

/**
 * GET /api/auth/refresh-token
 */
authRouter.get("/refresh-token", authController.refreshToken)

/**
 * POST /api/auth/logout
 */
authRouter.post("/logout", authController.logout)

/**
 * POST /api/auth/logout-all
 */
authRouter.post("/logout-all", authController.logoutALL)

/**
 * POST /api/auth/verify-email
 */
authRouter.post("/verify-email", otpLimiter, validate(verifyEmailSchema), authController.verifyEmail)

/**
 * POST /api/auth/forget-password
 */
authRouter.post("/forgot-password", passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 */
authRouter.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

/**
 * GET /api/auth/google
 * Initiates Google OAuth 2.0 login consent screen
 */
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

/**
 * GET /api/auth/google/callback
 * Google OAuth 2.0 callback URL to exchange code for tokens & create session
 */
authRouter.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }),handleSocialCallback);

/**
 * GET /api/auth/github
 */
authRouter.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));

/**
 * GET /api/auth/github/callback
 */
authRouter.get("/github/callback", passport.authenticate("github", { session: false, failureRedirect: "/login" }), handleSocialCallback);

export default authRouter;