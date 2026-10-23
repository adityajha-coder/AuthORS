# Roadmap & Future Work

AuthORS has established core security defenses up to v3.0.0. The following items outline the planned roadmap for upcoming releases.

---

## Completed in v3.0.0

- [x] **Argon2id password hashing** — 19MB memory cost, resistance against GPU/ASIC attacks, and automatic lazy-rehash migration from legacy Bcrypt.
- [x] **RFC 6819 token theft detection** — family lineage tracking (`familyId`) with immediate revocation of compromised session trees upon token reuse.
- [x] **RFC 6238 TOTP 2FA** — support for Google Authenticator, Authy, and 1Password with AES-256-GCM encrypted secrets at rest and 10 single-use hashed recovery backup codes.
- [x] **Scoped Pre-Auth gate** — 5-minute pre-auth token requiring second-factor verification before any session cookie or full API access is granted.
- [x] **Immutable security audit trail** — append-only MongoDB collection tracking authentication successes, failures, token replaying, and 2FA changes (SOC 2 ready).
- [x] **Social authentication** — Google & GitHub OAuth 2.0 with automatic email verification and account linking.
- [x] **Cryptographic password recovery** — 32-byte CSPRNG reset tokens with 15-minute MongoDB TTL auto-purge and multi-device session revocation.
- [x] **Granular rate limiting** — independent sliding window limiters on login, register, verify-email, forgot-password, and 2fa/verify routes.
- [x] **Schema validation & sanitization** — Zod schemas enforcing password complexity, email normalization, and payload sanitization.
- [x] **Automated DevSecOps pipeline** — GitHub Actions CI matrix, Gitleaks secret scanning, GitHub CodeQL SAST analysis, and Dependabot supply chain monitoring.

---

## Planned for v3.1.0 & Beyond

### 1. Breached-Password Screening (NIST SP 800-63B)
Check candidate passwords against Have I Been Pwned's range-search API using k-Anonymity (transmitting only the first 5 characters of the SHA-1 hash) during registration and password resets. Rejects compromised passwords before they reach storage.

### 2. Passkeys & WebAuthn / FIDO2
Introduce phishing-resistant biometric and hardware security key login (Touch ID, Face ID, YubiKey) alongside existing password and OAuth flows, targeting NIST SP 800-63B Rev 4 AAL3 standards.

### 3. Adaptive Bot Protection & Account Throttling
Layer per-account failed-login counters with exponential backoff independent of source IP. Trigger challenges (such as Cloudflare Turnstile) after repeated failed attempts to prevent automated credential stuffing.

### 4. Device Profiling & Geo-Velocity Alerts
Track device signatures (`User-Agent`) and GeoIP locations to detect impossible travel velocity (e.g., logins from two distant cities within minutes). Dispatch automated email alerts with single-click session revocation links.

### 5. Asymmetric Token Signing (RS256 / EdDSA) & JWKS
Transition access token signing from symmetric HS256 to asymmetric private-key signing (RS256 or EdDSA). Expose a public JWKS endpoint (`/.well-known/jwks.json`) to allow internal microservices to verify tokens without sharing secret keys.

### 6. Real-Time Access Token Denylist (Redis)
Maintain an in-memory Redis set of revoked `jti` identifiers to allow instantaneous invalidation of access tokens during password resets and logout-all events, eliminating the 15-minute token lifetime exposure window.

### 7. Granular Session Management API
Surface active sessions to users through a dedicated endpoint (`GET /api/auth/sessions`) showing browser, operating system, IP location, and last active timestamp, with remote single-device termination (`DELETE /api/auth/sessions/:id`).
