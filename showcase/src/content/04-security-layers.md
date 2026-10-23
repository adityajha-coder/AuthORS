# 9-Layer Security Architecture

AuthORS doesn't rely on a single security mechanism. It stacks 9 independent defense layers so that if one fails, the others still hold.

![Security Architecture Layers](./assets/security_layers.png)

---

## Layer 1: Network & HTTP Edge

### Helmet (Security Headers)

Express exposes `X-Powered-By: Express` by default — that's free reconnaissance for attackers. Helmet strips that and adds 11+ defensive headers:

- `X-Frame-Options: DENY` — blocks clickjacking via iframes
- `X-Content-Type-Options: nosniff` — prevents MIME-type confusion attacks
- `Strict-Transport-Security` — forces HTTPS for 180 days
- `X-XSS-Protection` — enables browser-level XSS filters

### CORS with Credentials

The auth system uses httpOnly cookies for refresh tokens, which means CORS has to be configured with `credentials: true` and an explicit origin whitelist. No wildcards — that would be a vulnerability.

Origins are validated against an allowlist from `FRONTEND_URL` + hardcoded dev URLs.

---

## Layer 2: Ingress Validation & Brute-Force Defense

### Rate Limiting

Every sensitive endpoint has its own limiter with a tuned window and threshold:

| Endpoint | Window | Max Requests | What it stops |
|:---|:---:|:---:|:---|
| `POST /login` | 15 min | 5 | Credential stuffing |
| `POST /register` | 1 hour | 5 | Account spam |
| `POST /verify-email` | 10 min | 3 | OTP brute-forcing |
| `POST /forgot-password` | 1 hour | 3 | Email flooding |
| `POST /2fa/verify` | 5 min | 5 | TOTP guessing |

### Zod Schema Validation

All input is parsed through Zod before hitting any controller logic. This catches type-coercion bugs, NoSQL injection payloads (like `{ "$gt": "" }`), and enforces password complexity (8+ chars, uppercase, lowercase, number, special char).

Emails are trimmed and lowercased to prevent duplicate accounts from case mismatches.

### Anti-User-Enumeration

The `/forgot-password` endpoint always returns the same `200 OK` response regardless of whether the email exists. Attackers can't harvest valid accounts.

---

## Layer 3: Password Cryptography

### Argon2id

The password hashing competition winner and OWASP's #1 recommendation. Configured with:

- **Memory**: 19,456 KB (~19MB per hash)
- **Time cost**: 2 iterations
- **Parallelism**: 1

This makes GPU/ASIC cracking economically infeasible — each guess needs 19MB of dedicated RAM.

| | Bcrypt | Argon2id (AuthORS) |
|:---|:---|:---|
| **Memory per hash** | ~4 KB | ~19 MB |
| **GPU resistance** | CPU-bound only | Memory-hard |
| **Max password length** | 72 bytes (truncates silently) | Unlimited |
| **OWASP status** | Legacy | Primary recommendation |

### Zero-Downtime Lazy Rehash

When a user logs in with an older Bcrypt hash (`$2b$`), the system verifies it with bcrypt, then silently re-hashes with Argon2id and updates the DB. No forced password resets, no migration scripts, no downtime.

---

## Layer 4: Token Architecture & Theft Detection

### Dual-Token Design

- **Access Token** (15 min) — stateless, sent via `Authorization: Bearer` header, kept in memory
- **Refresh Token** (7 days) — stored as SHA-256 hash in MongoDB sessions, delivered via httpOnly cookie

### Secure Cookie Flags

- `httpOnly: true` — JS can't read it, XSS can't steal it
- `secure: true` — only sent over HTTPS
- `sameSite: strict` — never sent on cross-site requests, kills CSRF

### RFC 6819 Token Family Invalidation

Every login creates a `familyId`. When you rotate a refresh token, the old one is marked `isUsed: true` and a new one is created in the same family.

If someone replays an already-used token (meaning it was stolen), the server immediately revokes every session in that family and returns `403 Forbidden`.

![RFC 6819 Token Theft Detection](./assets/rfc6819_flow.png)

---

## Layer 5: Two-Factor Authentication

### AES-256-GCM Encrypted Secrets

TOTP secret keys are never stored in plaintext. Each one is encrypted with AES-256-GCM using a random 96-bit IV and 128-bit auth tag before hitting MongoDB. Format: `iv:authTag:ciphertext`. Decrypted only in volatile memory during code validation.

### Pre-Auth Token Gate

When a 2FA-enabled account logs in successfully, the server does **not** return access or refresh tokens. Instead, it returns a short-lived Pre-Auth JWT (5 min, `stage: "2FA_PENDING"`). Full tokens are only issued after `/2fa/verify` passes.

This means even if someone intercepts the login response, they can't skip 2FA by ignoring the UI.

![TOTP 2FA & Pre-Auth Flow](./assets/totp_2fa_flow.png)

### Replay Protection

Each TOTP code is valid for one 30-second window. The server tracks `twoFactorLastUsed` — submitting the same code twice within its validity period is rejected.

### 10 Hashed Backup Codes

Generated during 2FA enrollment: 10 random 8-character alphanumeric codes, stored as SHA-256 hashes. Plaintext shown to the user once. Each code is single-use (`used: true` after consumption).

---

## Layer 6: Ephemeral Data & TTL Cleanup

### MongoDB TTL Indexes

Instead of running cron jobs to clean up expired data, the system uses native MongoDB TTL indexes:

- **OTPs** — auto-deleted after 10 minutes
- **Password reset tokens** — auto-deleted after 15 minutes

This runs in MongoDB's background engine thread. Zero application overhead, works even if Node.js restarts.

### High-Entropy Reset Tokens

Password reset links use `crypto.randomBytes(32)` — that's 256 bits of entropy (2^256 possible values). Brute-forcing is mathematically impossible. Tokens are consumed immediately on use.

---

## Layer 7: Social Authentication

### Passport.js (Google & GitHub)

OAuth 2.0 Authorization Code Flow. Social accounts are automatically marked as verified (the provider already verified the email).

If a user already has a local account and later clicks "Sign in with Google", the system links their Google ID to the existing account instead of creating a duplicate.

Username collisions from social display names are handled by appending a random suffix.

---

## Layer 8: Session Management

- **Single logout** — revokes only the current token family, clears the cookie
- **Logout all** — revokes every active session across all devices (`updateMany({ user: id }, { revoked: true })`)
- **Password reset** — automatically revokes all sessions. If you change your password, every logged-in device gets kicked out.

Each session records the client's IP and User-Agent for visibility.

---

## Layer 9: Audit Trail

A dedicated `audit_logs` collection records every security event:

- `LOGIN_SUCCESS`, `LOGIN_FAILED`
- `TOKEN_ROTATED`, `TOKEN_REUSE_ATTACK_DETECTED`
- `2FA_ENROLL_INITIATED`, `2FA_ENABLED`, `2FA_DISABLED`, `2FA_VERIFIED_SUCCESS`, `2FA_BACKUP_CODE_USED`
- `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_COMPLETED`
- `LOGOUT`, `LOGOUT_ALL`

Each entry captures: user ID, email, IP, userAgent, timestamp, and event-specific details.

The writes are non-blocking and wrapped in try/catch — audit logging never increases request latency or crashes an auth flow. Indexed with `{ user: 1, createdAt: -1 }` for fast lookups.

---

## Automated DevSecOps Pipeline

Security is integrated directly into the repository lifecycle across four automated gates:

- **GitHub Actions CI (`ci.yml`)**: Multi-version Node.js matrix testing (Node 20 & 22), syntax validation, and showcase frontend build checks on every push and pull request.
- **Gitleaks Secret Scanning (`gitleaks.yml`)**: Scans all commits and pull requests to prevent credentials, private keys, or API tokens from entering git history.
- **CodeQL Static Analysis (`codeql.yml`)**: GitHub's advanced semantic SAST engine running deep security queries for injection, tainted data flows, and OWASP Top 10 vulnerabilities.
- **Dependabot (`dependabot.yml`)**: Automated weekly supply chain security auditing for both root backend and showcase frontend dependencies.
