# OWASP Top 10 (2021) Mitigations

Here's how AuthORS addresses each category in the OWASP Top 10.

---

## Mitigation Matrix

| Category | Threat | AuthORS Defense |
|:---|:---|:---|
| **A01 — Broken Access Control** | Unauthorized access, privilege escalation, missing token checks | JWT Bearer validation middleware (`requireAuth`), scoped Pre-Auth tokens blocking unverified 2FA, session ownership enforcement |
| **A02 — Cryptographic Failures** | Weak hashing, plaintext secrets, predictable tokens | Argon2id (19MB memory-hard), AES-256-GCM for TOTP secrets, 32-byte CSPRNG reset tokens, SHA-256 token hashing |
| **A03 — Injection** | NoSQL injection via `{ "$gt": "" }` style payloads | Zod runtime parsing strips unknown keys and enforces types before controllers run. Mongoose strict casting prevents operator injection. |
| **A04 — Insecure Design** | Architectural flaws enabling replay attacks, no forensic trail | RFC 6819 token family tracking detects and wipes stolen sessions. Append-only audit trail for forensic analysis. |
| **A05 — Security Misconfiguration** | Default headers, permissive CORS, unencrypted cookies | Helmet (11+ headers), strict CORS whitelist with credentials, `httpOnly + secure + sameSite: strict` cookies, `.env` validation at startup |
| **A06 — Vulnerable Components** | Unpatched CVEs in dependencies | All dependencies are current and actively maintained — no known vulnerabilities |
| **A07 — Auth Failures** | Credential stuffing, OTP brute-forcing, session hijacking | Granular rate limiters on 5 routes, 30s TOTP replay rejection, MongoDB TTL auto-expiration, anti-enumeration responses |
| **A08 — Data Integrity Failures** | Forged cookies, modified tokens, untrusted data | HMAC-SHA256 JWT signature verification, GCM authentication tags on ciphertext, immutable audit logging |
| **A09 — Logging Failures** | Undetected attacks, missing audit records | Dedicated `audit_logs` collection with IP, userAgent, and event tracking for every auth action |
| **A10 — SSRF** | Server-side requests via open redirects | OAuth flows use only official Google/GitHub endpoints. Redirects locked to validated `FRONTEND_URL`. |
