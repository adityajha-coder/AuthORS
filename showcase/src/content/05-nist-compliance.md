# NIST SP 800-63B Compliance (AAL2)

AuthORS is built to align with NIST SP 800-63B Authenticator Assurance Level 2 (AAL2). Here's the point-by-point breakdown.

---

## Compliance Matrix

| NIST Requirement | What the spec says | How AuthORS handles it | Status |
|:---|:---|:---|:---:|
| **§ 5.1.1.1 — Password Length & Complexity** | Min 8 characters, support at least 64, no arbitrary truncation | Zod enforces ≥8 chars with uppercase, lowercase, numeric, and symbol rules. Argon2id has no length limit. | ✅ |
| **§ 5.1.1.2 — Password Storage** | Salted, hashed with a memory-hard KDF | Argon2id with 19,456 KB memory cost, unique cryptographic salts per hash | ✅ |
| **§ 5.1.4.1 — TOTP Authenticators** | RFC 6238 with 30s period, secret encrypted at rest, clock drift tolerance | AES-256-GCM encrypted secrets, ±1 step (30s) drift, 30s replay window rejection | ✅ |
| **§ 5.1.5 — Multi-Factor Auth** | Second factor required before issuing session tokens | Pre-Auth JWT gate (`stage: 2FA_PENDING`). No access/refresh tokens until 2FA passes. | ✅ |
| **§ 5.1.8.2 — Account Recovery** | High-entropy out-of-band recovery with immediate invalidation | 10 SHA-256 hashed backup codes (single-use). 32-byte CSPRNG reset tokens with 15-min TTL auto-purge. | ✅ |
| **§ 5.2.8 — Rate Limiting** | Limit consecutive failed attempts on endpoints | Granular IP-based sliding window limiters on login, register, verify-email, forgot-password, and 2fa/verify | ✅ |
| **§ 7.1 — Session Management** | Re-auth for sensitive actions, explicit session termination across devices | Single-device logout, logout-all kill switch, password change auto-revocation, RFC 6819 token family detection | ✅ |

---

## What AAL2 means in practice

AAL2 requires two distinct authentication factors and resistance to common online attacks. In AuthORS:

1. **Factor 1 (Knowledge)** — password verified against Argon2id hash
2. **Factor 2 (Possession)** — TOTP code from a phone authenticator app

The Pre-Auth gate ensures both factors are verified server-side before any session tokens are issued. A client can't bypass 2FA by ignoring a redirect.
