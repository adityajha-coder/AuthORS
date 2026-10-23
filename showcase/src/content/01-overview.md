# Overview

AuthORS is a production-ready authentication backend built with Node.js, Express, and MongoDB. It's not a tutorial project or a minimal starter — it's a fully layered defense engine designed to handle real-world attack vectors.

The system currently sits at **v3.0.0** and covers everything from memory-hard password hashing to token replay theft detection to TOTP two-factor authentication with AES-256-GCM encrypted secrets at rest.

---

## What It Provides

AuthORS delivers a complete authentication infrastructure out of the box, structured across core security and operational pillars:

### 1. Complete Identity & Authentication Lifecycle
- **User Registration & Email Verification**: Account creation validated with Zod schemas and verified via 6-digit email OTPs sent with Nodemailer (Google OAuth2 authenticated).
- **Argon2id Password Storage**: Memory-hard hashing (19MB cost) resistant to GPU/ASIC cracking, with zero-downtime lazy re-hashing from legacy Bcrypt on login.
- **Dual-Token Architecture**: Short-lived Access Tokens (15 min) for API calls + Long-lived Refresh Tokens (7 days) stored in `httpOnly`, `secure`, `sameSite: strict` cookies.
- **Social OAuth 2.0 Logins**: 1-click Google and GitHub login via Passport with automatic email verification and account linking to existing profiles.
- **Secure Password Reset**: High-entropy 32-byte CSPRNG reset tokens with 15-minute auto-expiry and automatic multi-device session revocation upon reset.

### 2. Multi-Factor Authentication (NIST AAL2)
- **RFC 6238 TOTP Two-Factor Auth**: Authenticator app integration (Google Authenticator, Authy, 1Password) with QR code generation and manual base32 setup keys.
- **AES-256-GCM Encryption at Rest**: Authenticated symmetric encryption for all TOTP shared secrets stored in the database.
- **Scoped Pre-Auth JWT Server Gate**: Post-password login grants only a 5-minute restricted token (`stage: 2FA_PENDING`). Full session access is withheld until the second factor is verified.
- **10 Single-Use Emergency Backup Codes**: SHA-256 hashed recovery codes generated on 2FA activation with instant single-use invalidation.

### 3. Session Security & Attack Defense
- **RFC 6819 Token Theft Detection**: Lineage tracking with session family IDs. Presenting an already-used refresh token triggers instant invalidation of the entire token family.
- **Multi-Device Revocation**: Dedicated `/api/auth/logout` (single device) and `/api/auth/logout-all` (all active sessions killed across devices).
- **Granular Brute-Force Rate Limiting**: Dedicated rate limiters on all 5 attack-sensitive endpoints (`/login`, `/register`, `/verify-email`, `/forgot-password`, `/2fa/verify`).
- **HTTP Defense Headers**: Helmet integration with 11+ security directives protecting against Clickjacking, MIME sniffing, and XSS.
- **Strict CORS with Credentials**: Whitelisted origin access allowing secure cross-origin cookie transfer.

### 4. Enterprise Forensics & Compliance
- **Immutable Security Audit Trail**: Append-only MongoDB collection recording all authentication events (logins, failed attempts, token replays, 2FA changes) with IP and user-agent metadata (SOC 2 ready).
- **Non-Blocking Architecture**: Async audit logging that never degrades user request latency.
- **Native MongoDB TTL Auto-Purging**: Automatic database cleanup for expired email OTPs (10 min) and password reset tokens (15 min).

---

## Who It's For

- **Backend Engineers & Teams**: Who need a production-hardened auth foundation without reinventing the wheel or paying third-party SaaS fees.
- **Security & Compliance Auditors**: Evaluating architecture against NIST SP 800-63B AAL2, OWASP Top 10 (2021), and SOC 2 audit trail standards.
- **Full-Stack Developers**: Tired of tutorial starters that omit token replay detection, server-side 2FA gating, and encrypted secret storage.

---

## Quick Links

- [Quick Start & Setup](./quickstart) — Get running locally in under 5 minutes
- [9-Layer Defense Model](./security-layers) — Deep dive into the request security pipeline
- [NIST AAL2 Compliance](./nist-compliance) — Full mapping against NIST SP 800-63B
- [RFC 6819 Token Theft](./rfc6819-token-defense) — How token family lineage detection works
- [RFC 6238 TOTP 2FA](./rfc6238-totp-2fa) — Two-factor auth and AES-256-GCM architecture
- [All Endpoints](./api-reference) — Complete REST API reference with JSON payloads
- [Version History](./version-history) — Progression from v1.0.0 through v3.0.0
