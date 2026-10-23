# RFC 6819 — Token Theft Detection

Standard token rotation isn't enough. If an attacker steals a refresh token and uses it before the legitimate user, both sides end up with valid tokens. The system has no way to tell them apart.

RFC 6819 solves this with token family tracking.

---

## How it works

### Family-based token lineage

1. When a user logs in, the server creates a session with a unique `familyId` (UUID)
2. Every time a refresh token is rotated, the old token is marked `isUsed: true` and a new token is created in the same family
3. The entire chain — login → rotation → rotation → rotation — shares the same `familyId`

### The theft detection trigger

If a token marked `isUsed: true` shows up again, something is wrong. Either:
- An attacker is replaying a stolen token
- Or the legitimate user's token was intercepted

In either case, the server immediately:
- Revokes **every active session** in that family
- Clears the client's refresh cookie
- Returns `403 Forbidden`
- Logs a `TOKEN_REUSE_ATTACK_DETECTED` audit event

![RFC 6819 Token Theft Detection Flow](./assets/rfc6819_flow.png)

---

## Why simple rotation fails

Without family tracking, here's what happens when a token gets stolen:

1. User logs in → gets refresh token `T1`
2. Attacker steals `T1`
3. Attacker uses `T1` first → gets new token `T2a`
4. User uses `T1` later → gets new token `T2b`
5. Now both have valid tokens. The system can't distinguish them.

With family tracking:

1. User logs in → `T1` created with `familyId: abc`
2. Attacker steals `T1`
3. Attacker uses `T1` → `T1` marked `isUsed: true`, `T2a` created in family `abc`
4. User uses `T1` → server sees `isUsed: true` → **attack detected**
5. Server wipes all sessions in family `abc` → both attacker and user get logged out
6. User re-authenticates with their password (attacker can't)

---

## The tradeoff

The legitimate user gets logged out during an attack. That's intentional — it's better to force a re-login than to let an attacker maintain access indefinitely. The user still has their password (and 2FA). The attacker doesn't.

---

## Implementation details

- Family ID is a `crypto.randomUUID()` generated at login time
- Token hashes are stored as SHA-256 digests (the raw token never touches the database)
- The `isUsed` flag is set atomically during rotation
- Audit log captures the IP and user agent of the replay attempt
