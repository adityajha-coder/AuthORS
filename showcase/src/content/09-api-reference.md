# API Reference

All routes are mounted under `/api/auth`. Protected routes expect an `Authorization: Bearer <accessToken>` header, and token refresh expects the `refreshToken` httpOnly cookie.

---

## Authentication & Registration

### POST `/api/auth/register`

Register a new account. Sends a 6-digit OTP to the provided email address (valid for 10 minutes).

**Rate Limit**: 5 requests / hour per IP

```json
// Request Body
{
  "name": "Aditya Jha",
  "email": "aditya@example.com",
  "password": "Password123!"
}
```

```json
// Response (201 Created)
{
  "success": true,
  "message": "Registration successful. Please verify your email with the OTP sent."
}
```

---

### POST `/api/auth/verify-email`

Verifies the 6-digit email OTP and activates the account.

**Rate Limit**: 3 attempts per OTP / 15 minutes

```json
// Request Body
{
  "email": "aditya@example.com",
  "otp": "492810"
}
```

```json
// Response (200 OK)
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

---

### POST `/api/auth/login`

Authenticates credentials using Argon2id.

- If **2FA is disabled**: Returns `accessToken` in body and sets `refreshToken` in an httpOnly cookie.
- If **2FA is enabled**: Returns a short-lived `preAuthToken` (valid for 5 minutes) with `requires2FA: true`. No session cookie is issued yet.

**Rate Limit**: 5 requests / 15 minutes per IP

```json
// Request Body
{
  "email": "aditya@example.com",
  "password": "Password123!"
}
```

```json
// Response without 2FA (200 OK)
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6718f4a2b9...",
    "name": "Aditya Jha",
    "email": "aditya@example.com",
    "is2FAEnabled": false
  }
}
```

```json
// Response with 2FA enabled (200 OK)
{
  "success": true,
  "requires2FA": true,
  "preAuthToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### GET `/api/auth/get-me`

Fetches the currently authenticated user's profile.

**Headers**: `Authorization: Bearer <accessToken>`

```json
// Response (200 OK)
{
  "success": true,
  "user": {
    "id": "6718f4a2b9...",
    "name": "Aditya Jha",
    "email": "aditya@example.com",
    "isEmailVerified": true,
    "is2FAEnabled": false
  }
}
```

---

### GET `/api/auth/refresh-token`

Rotates the refresh token (RFC 6819) and issues a new access token. Requires the `refreshToken` cookie.

If an already-used refresh token is presented, the system detects a token reuse attack, revokes the entire session family, and forces re-authentication.

```json
// Response (200 OK)
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST `/api/auth/logout`

Revokes the current session and clears the refresh token cookie.

```json
// Response (200 OK)
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST `/api/auth/logout-all`

Revokes all active sessions across all devices for the current user.

**Headers**: `Authorization: Bearer <accessToken>`

```json
// Response (200 OK)
{
  "success": true,
  "message": "All sessions revoked successfully"
}
```

---

## Password Recovery

### POST `/api/auth/forgot-password`

Generates a cryptographically secure 32-byte reset token (hashed with SHA-256 in MongoDB with a 15-minute TTL) and sends a reset link to the email.

**Rate Limit**: 3 requests / hour per IP

```json
// Request Body
{
  "email": "aditya@example.com"
}
```

```json
// Response (200 OK)
{
  "success": true,
  "message": "If that email exists in our system, a password reset link has been sent."
}
```

---

### POST `/api/auth/reset-password`

Validates the reset token and updates the password using Argon2id. Automatically revokes all existing sessions across all devices.

```json
// Request Body
{
  "token": "4f9b2d8e1a7c...",
  "newPassword": "NewSecurePassword456!"
}
```

```json
// Response (200 OK)
{
  "success": true,
  "message": "Password reset successfully. Please log in with your new credentials."
}
```

---

## Two-Factor Authentication (TOTP)

### POST `/api/auth/2fa/setup`

Generates a new TOTP secret (encrypted at rest with AES-256-GCM) and returns a QR code data URI for scanning in Google Authenticator or Authy.

**Headers**: `Authorization: Bearer <accessToken>`

```json
// Response (200 OK)
{
  "success": true,
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

---

### POST `/api/auth/2fa/enable`

Verifies a TOTP code against the pending secret and enables 2FA on the account. Returns 10 single-use recovery backup codes (stored as SHA-256 hashes).

**Headers**: `Authorization: Bearer <accessToken>`

```json
// Request Body
{
  "token": "481029"
}
```

```json
// Response (200 OK)
{
  "success": true,
  "message": "2FA enabled successfully",
  "backupCodes": [
    "a1b2-c3d4",
    "e5f6-g7h8",
    "i9j0-k1l2"
  ]
}
```

---

### POST `/api/auth/2fa/verify`

Exchanges a 5-minute `preAuthToken` and a valid TOTP code or backup code for full session access tokens.

**Rate Limit**: 5 attempts / 15 minutes per IP

```json
// Request Body (with TOTP)
{
  "preAuthToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "481029"
}

// Request Body (with backup code)
{
  "preAuthToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "backupCode": "a1b2-c3d4"
}
```

```json
// Response (200 OK)
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6718f4a2b9...",
    "name": "Aditya Jha",
    "email": "aditya@example.com",
    "is2FAEnabled": true
  }
}
```

---

### POST `/api/auth/2fa/disable`

Disables 2FA on the account. Requires the current password and a valid TOTP code.

**Headers**: `Authorization: Bearer <accessToken>`

```json
// Request Body
{
  "password": "Password123!",
  "token": "481029"
}
```

```json
// Response (200 OK)
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

---

### POST `/api/auth/2fa/regenerate-backup-codes`

Generates 10 new recovery backup codes, invalidating any previous unused codes. Requires the current password.

**Headers**: `Authorization: Bearer <accessToken>`

```json
// Request Body
{
  "password": "Password123!"
}
```

```json
// Response (200 OK)
{
  "success": true,
  "backupCodes": [
    "x1y2-z3a4",
    "b5c6-d7e8",
    "f9g0-h1i2"
  ]
}
```

---

## Social OAuth 2.0

### GET `/api/auth/google`

Initiates Google OAuth 2.0 authentication by redirecting the client to Google's consent screen (`scope: ["profile", "email"]`).

**Access**: Public

```json
// Response (302 Redirect)
{
  "success": true,
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=GOOGLE_CLIENT_ID&scope=profile%20email&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fgoogle%2Fcallback"
}
```

---

### GET `/api/auth/google/callback`

Google OAuth callback handler. Exchanges the authorization code for user profile info, automatically links to existing accounts with matching verified emails, and creates a new refresh token family.

Sets the `refreshToken` in an httpOnly cookie and redirects to the frontend with the `accessToken`.

**Query Parameters**:
- `code`: Authorization code from Google

```json
// Response (302 Redirect with Session)
{
  "success": true,
  "message": "Google authentication successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirectUrl": "http://localhost:5173/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6718f4a2b9...",
    "name": "Aditya Jha",
    "email": "aditya@gmail.com",
    "isEmailVerified": true
  }
}
```

---

### GET `/api/auth/github`

Initiates GitHub OAuth 2.0 authentication by redirecting the client to GitHub's consent screen (`scope: ["user:email"]`).

**Access**: Public

```json
// Response (302 Redirect)
{
  "success": true,
  "redirectUrl": "https://github.com/login/oauth/authorize?client_id=GITHUB_CLIENT_ID&scope=user%3Aemail&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fgithub%2Fcallback"
}
```

---

### GET `/api/auth/github/callback`

GitHub OAuth callback handler. Exchanges the authorization code, fetches verified primary emails, links or creates the local user account, and creates a new refresh token family.

Sets the `refreshToken` in an httpOnly cookie and redirects to the frontend with the `accessToken`.

**Query Parameters**:
- `code`: Authorization code from GitHub

```json
// Response (302 Redirect with Session)
{
  "success": true,
  "message": "GitHub authentication successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirectUrl": "http://localhost:5173/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6718f4a2b9...",
    "name": "Aditya Jha",
    "email": "aditya@github.com",
    "isEmailVerified": true
  }
}
```

