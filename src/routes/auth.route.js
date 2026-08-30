import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { registerLimiter, loginLimiter, otpLimiter, passwordResetLimiter } from "../middleware/ratelimit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema, verifyEmailSchema } from "../validators/auth.validator.js";
import { forgotPasswordSchema, resetPasswordSchema } from "../validators/password.validator.js";

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

export default authRouter;