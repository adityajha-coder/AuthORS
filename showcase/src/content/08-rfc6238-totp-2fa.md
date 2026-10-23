# RFC 6238 — TOTP Two-Factor Authentication

AuthORS implements time-based one-time passwords (TOTP) following RFC 6238. Compatible with Google Authenticator, Authy, 1Password, and any standard TOTP app.

---

## The setup flow

### Step 1: Generate secret

`POST /api/auth/2fa/setup` (requires access token)

The server generates a random Base32 secret, encrypts it with AES-256-GCM, and stores the ciphertext in the user document. The response includes a QR code (data URI) and the manual entry key.

The user hasn't committed yet — 2FA isn't active at this point.

### Step 2: Confirm with a code

`POST /api/auth/2fa/enable` with `{ "code": "492108" }`

The user scans the QR code with their authenticator app and enters the 6-digit code. If it's valid, 2FA is officially enabled and the server returns 10 single-use backup codes.

**These backup codes are shown exactly once.** They're stored as SHA-256 hashes — the server can't recover them later.

### Step 3: Login with 2FA

When a 2FA-enabled account logs in with valid credentials, the server does **not** return access/refresh tokens. Instead:

```json
{
  "require2FA": true,
  "preAuthToken": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Two-factor authentication required."
}
```

The `preAuthToken` is a scoped JWT with `{ stage: "2FA_PENDING" }` and a 5-minute TTL. It can't be used to access any protected endpoint.

`POST /api/auth/2fa/verify` with the pre-auth token + TOTP code → full access/refresh tokens issued.

![TOTP 2FA & Pre-Auth Flow](./assets/totp_2fa_flow.png)

---

## Security details

### Encryption at rest (AES-256-GCM)

The TOTP secret never sits in plaintext in MongoDB. Encryption uses:
- A 256-bit key derived from an environment variable
- A random 96-bit initialization vector per secret
- A 128-bit authentication tag for tamper detection

Stored format: `iv:authTag:ciphertext`

The secret is decrypted in volatile memory only when validating a code, then discarded.

### Clock drift tolerance

TOTP codes change every 30 seconds. To handle minor clock differences between the server and the user's phone, the system accepts codes from ±1 time step (effectively a 90-second window).

### Replay prevention

The server tracks `twoFactorLastUsed` timestamp. If the same valid code is submitted twice within its 30-second window, the second attempt is rejected.

### Backup codes

10 codes generated during enrollment:
- 8 characters each, alphanumeric
- Stored as SHA-256 hashes
- Each code is single-use — once consumed, it's marked `used: true`
- Can be regenerated via `POST /api/auth/2fa/regenerate-backup-codes` (requires re-authentication)

---

## Why the Pre-Auth gate matters

A lot of 2FA implementations are client-side only — the server returns full tokens after password verification and relies on the frontend to show a 2FA prompt. An attacker can just ignore the frontend and use the tokens directly.

AuthORS blocks this at the server level. Without completing `/2fa/verify`, you literally don't have an access token. There's no token to abuse.
