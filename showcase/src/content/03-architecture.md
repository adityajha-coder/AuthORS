# Project Structure

The codebase follows a clean separation — controllers handle logic, models define data, middleware enforces rules, and services do the heavy lifting behind the scenes.

---

## Directory layout

```text
├── assets/
│   ├── security_layers.png              # Security architecture diagram
│   ├── rfc6819_flow.png                 # Token theft detection flow
│   └── totp_2fa_flow.png               # TOTP 2FA sequence diagram
├── src/
│   ├── config/
│   │   ├── config.js                    # Env variable validation
│   │   ├── db.js                        # Mongoose connection
│   │   └── passport.js                  # Google & GitHub OAuth strategies
│   ├── controllers/
│   │   ├── auth.controller.js           # Re-exports all controllers
│   │   ├── register.controller.js       # Registration + OTP email
│   │   ├── login.controller.js          # Login + Argon2id lazy-rehash + 2FA gate
│   │   ├── twoFactor.controller.js      # TOTP setup, enable, verify, disable, backup codes
│   │   ├── token.controller.js          # Token rotation + logout + logout-all
│   │   ├── password.controller.js       # Forgot + reset password
│   │   └── social.controller.js         # OAuth callback + session creation
│   ├── emails/
│   │   ├── otp.template.js              # HTML email template for OTP
│   │   └── resetPassword.template.js    # HTML email template for password reset
│   ├── middleware/
│   │   ├── auth.middleware.js           # Bearer token verification
│   │   ├── ratelimit.middleware.js      # Route-specific rate limiters
│   │   └── validate.middleware.js       # Zod schema validation middleware
│   ├── models/
│   │   ├── user.model.js                # User schema (password, 2FA, OAuth IDs)
│   │   ├── session.model.js             # Session schema (familyId, token hash, IP)
│   │   ├── auditLog.model.js            # Audit log schema (event, actor, details)
│   │   ├── otp.model.js                 # OTP with 10-min TTL index
│   │   └── passwordReset.model.js       # Reset token with 15-min TTL index
│   ├── routes/
│   │   └── auth.route.js                # All route definitions with middleware chains
│   ├── services/
│   │   ├── audit.service.js             # Non-blocking audit event logger
│   │   └── email.service.js             # Nodemailer with Google OAuth2
│   ├── utils/
│   │   ├── crypto.utils.js              # AES-256-GCM, SHA-256, OTP & backup code generators
│   │   └── utils.js                     # Utility re-exporter
│   ├── validators/
│   │   ├── auth.validator.js            # Zod schemas for register, login, verify-email
│   │   └── password.validator.js        # Zod schemas for forgot/reset password
│   ├── app.js                           # Express setup (Helmet, CORS, middleware stack)
│   └── server.js                        # Entry point
├── SECURITY.md                          # Full security architecture documentation
├── TODO.md                              # Upgrade roadmap
├── .env.example                         # Environment template
└── package.json
```

---

## How it fits together

1. **Request comes in** → hits Helmet headers, CORS check, JSON parsing, cookie parsing
2. **Route matched** → rate limiter fires first, then Zod validation, then controller
3. **Controller logic** → uses models for DB ops, crypto utils for hashing/encryption, email service for sending
4. **Audit service** → logs the event non-blocking (never slows down the response)
5. **Response sent** → tokens in httpOnly cookies, data in JSON body

The key design choice: every piece of middleware and every service is independent. You can swap Nodemailer for Resend, or Mongoose for Prisma, without touching controller logic.
