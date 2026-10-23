# Version Evolution

How AuthORS evolved from a basic authentication starter into an enterprise-grade defense engine across four distinct architectural milestones.

---

## Evolution Timeline

### Version 1.0.0 — Baseline Architecture

The initial release established fundamental authentication mechanics:

- Single-pass SHA-256 password hashing with `crypto.createHash`
- Basic JSON Web Token (JWT) issuance
- 6-digit email OTP verification via Nodemailer
- MongoDB user documents with simple flag checks
- Single device session state

**Limitations identified**:
- SHA-256 is fast on GPUs — vulnerable to offline brute-force if the database leaks.
- Stolen refresh tokens had no detection mechanism.
- Single factor only (password + email).
- No request schema validation, brute-force rate limiting, or security headers.

---

### Version 1.5.0 — Middleware Hardening & Input Sanitization

Addressed immediate attack vectors (brute-force credential stuffing and malformed payloads) before expanding identity providers:

- **Upgraded password hashing**: Replaced single-pass SHA-256 with **Bcrypt** (12 salt rounds) to resist offline dictionary attacks.
- **Zod schema validation**: Strict runtime payload validation and sanitization for registration, login, and email verification.
- **Brute-force rate limiting**: Integrated `express-rate-limit` middleware on sensitive authentication endpoints to throttle automated attacks.
- **HTTP security headers**: Integrated `helmet` with 11+ defense directives (Clickjacking, MIME sniffing, XSS defense).
- **CORS configuration**: Whitelisted origin access with secure credential support.

---

### Version 2.0.0 — Identity Providers & Session Expansion

Expanded identity providers and credential recovery flows:

- Added **Google & GitHub OAuth 2.0** via Passport strategies with automatic verified email account linking.
- **Cryptographic password reset**: High-entropy 32-byte CSPRNG reset tokens with 15-minute MongoDB TTL auto-deletion.
- **Basic token rotation**: Introduction of rolling refresh tokens.
- **Architecture modularization**: Separated monolithic routes into specialized controllers, services, models, and validators.

---

### Version 3.0.0 — Enterprise Defense (Current)

A major architectural overhaul aligning the system with NIST SP 800-63B AAL2 and RFC security specifications:

- **Argon2id password hashing**: Upgraded to 19MB memory-hard hashing, with automatic lazy re-hashing of legacy Bcrypt passwords on login without requiring user password resets.
- **RFC 6819 token theft detection**: Every refresh token belongs to a lineage (`familyId`). If an already-used token is replayed, the entire family is revoked immediately.
- **RFC 6238 TOTP 2FA**: Time-based one-time passwords supporting Google Authenticator, Authy, and 1Password. Secrets are encrypted at rest with **AES-256-GCM**. Includes 10 single-use hashed recovery backup codes.
- **Pre-Auth Gate**: 2FA-enabled accounts receive a scoped 5-minute pre-auth token (`stage: 2FA_PENDING`). No session cookie or full API access is granted until the second factor is verified.
- **Immutable Security Audit Trail**: Append-only MongoDB collection tracking authentication successes, failures, token replay detections, and 2FA state changes with IP and User-Agent metadata (SOC 2 ready).
- **Multi-Device Revocation**: Added `/logout-all` kill switch and automatic session revocation on password change.

---

## Feature Comparison Matrix

| Security Area | Version 1.0.0 | Version 1.5.0 | Version 2.0.0 | Version 3.0.0 (Current) |
|:---|:---|:---|:---|:---|
| **Password Hashing** | SHA-256 (`crypto`) | Bcrypt (12 rounds) | Bcrypt (12 rounds) | **Argon2id (19MB memory-hard) + Lazy Rehash** |
| **Request Validation** | None | Zod Schemas | Zod Schemas | **Zod Schemas + Sanitization** |
| **Brute-Force Defense** | None | Basic rate limiters | Route limiters | **Granular Limiters on 5 sensitive routes** |
| **HTTP Headers & CORS** | Default Express | Helmet + Whitelist | Helmet + Whitelist | **Helmet (11+ Directives) + Strict CORS** |
| **Social Logins** | None | None | Google & GitHub OAuth | **Google & GitHub OAuth with Account Linking** |
| **Account Recovery** | Basic reset | Basic reset | 32-byte CSPRNG token | **32-byte CSPRNG + Multi-Device Session Wipe** |
| **Token Theft Mitigation** | None | None | Basic rotation | **RFC 6819 Token Family Lineage Invalidation** |
| **Two-Factor Auth** | None | None | None | **RFC 6238 TOTP + AES-256-GCM + 10 Hashed Backups** |
| **2FA Pre-Auth Gate** | None | None | None | **Scoped 5-Min Pre-Auth JWT (`2FA_PENDING`)** |
| **Audit Logging** | None | None | None | **Immutable MongoDB Audit Trail (SOC 2)** |
| **Session Control** | Single logout | Single logout | Single logout | **Single logout + `/logout-all` across devices** |
