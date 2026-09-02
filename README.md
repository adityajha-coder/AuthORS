# 🛡️ AuthORS — High-End Production-Ready Authentication System (v3.0.0)

[![Node.js Version](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-v4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Password Hashing](https://img.shields.io/badge/Cryptography-Argon2id-1E88E5?style=flat-square&logo=keycdn&logoColor=white)](https://www.argon2.com/)
[![2FA Standard](https://img.shields.io/badge/2FA-RFC_6238_TOTP-7B1FA2?style=flat-square&logo=googleauthenticator&logoColor=white)](https://datatracker.ietf.org/doc/html/rfc6238)
[![Token Defense](https://img.shields.io/badge/Token_Defense-RFC_6819-E65100?style=flat-square)](https://datatracker.ietf.org/doc/html/rfc6819)
[![Compliance](https://img.shields.io/badge/Compliance-NIST_AAL2_%7C_SOC_2-00C853?style=flat-square)](./SECURITY.md)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)

A secure, enterprise-grade authentication backend boilerplate built with **Node.js, Express, MongoDB (Mongoose), Argon2id, RFC 6238 TOTP 2FA, RFC 6819 Token Theft Detection, AES-256-GCM Cryptography, Zod, Helmet, Express-Rate-Limit, Passport (Google & GitHub OAuth), JWT, and Nodemailer (Google OAuth2)**.

> 📖 **Architecture & Threat Model**: For the complete 9-layer defense-in-depth security architecture, sequence flowcharts, NIST SP 800-63B AAL2 matrix, and OWASP Top 10 mitigation tables, see **[SECURITY.md](./SECURITY.md)**.

---

![AuthORS Security Architecture Pipeline](./assets/security_layers.png)

---

This system implements modern security best practices:

- **Memory-Hard Password Storage (Argon2id)**: 19MB memory-hard hashing with zero-downtime lazy-rehash from legacy Bcrypt.
- **RFC 6819 Refresh Token Reuse Detection**: Automatic token theft detection with session lineage tracking (`familyId`) and instant compromised family wipe.
- **TOTP Two-Factor Authentication (2FA)**: RFC 6238 compliant (Google Authenticator, Authy, 1Password) with **AES-256-GCM encryption at rest**, scoped Pre-Auth token gating, and 10 single-use hashed backup codes.
- **Immutable Security Audit Trail**: Append-only MongoDB collection logging all security lifecycle events (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `TOKEN_REUSE_ATTACK_DETECTED`, `2FA_ENABLED`, etc.) for SOC 2 compliance.
- **Dual-Token Architecture**: Short-lived Access Tokens (15m) + Long-lived Refresh Tokens (7d) in `httpOnly`, `secure`, `sameSite: strict` cookies.
- **Forgot & Reset Password Flow**: High-entropy 32-byte cryptographic reset tokens with a 15-minute MongoDB TTL auto-expiry and automatic multi-device session revocation.
- **Social Authentication (OAuth 2.0)**: 1-click Google & GitHub login via Passport with automatic email verification and account linking.
- **Granular Brute-Force Rate Limiting**: Dedicated rate limiters on `/login`, `/register`, `/verify-email`, `/forgot-password`, and `/2fa/verify`.
- **Request Validation with Zod**: Strict payload schemas, input sanitization, and password complexity enforcement.
- **HTTP Security Headers with Helmet**: Built-in defense against Clickjacking, MIME-sniffing, and XSS.
- **CORS with Credentials**: Whitelisted origin access allowing secure `httpOnly` cookie transfer.
- **Native MongoDB TTL Auto-Deletion**: 10-minute auto-deletion on OTPs and 15-minute auto-deletion on password resets.
- **Multi-Device Revocation**: Invalidate a single session or all active sessions across all devices (`/logout-all`).

---

## Version Evolution (v1.0.0 $\rightarrow$ v2.0.0 $\rightarrow$ v3.0.0)

| Security & Feature Area    | Baseline Version 1.0.0 | Hardened Version 2.0.0    | 🛡️ Version 3.0.0 (Current)                          | Why It Matters                                                     |
| :------------------------- | :--------------------- | :------------------------ | :-------------------------------------------------- | :----------------------------------------------------------------- |
| **Password Hashing**       | SHA-256 (`crypto`)     | Bcrypt (12 Salt Rounds)   | **Argon2id (19MB Memory-Hard) + Lazy Rehash**       | Immune to GPU/ASIC parallel cracking; zero-downtime migration.     |
| **Token Theft Mitigation** | None                   | Basic Rotation            | **RFC 6819 Token Family Lineage Invalidation**      | Instantly revokes all active sessions if an old token is replayed. |
| **Two-Factor Auth (2FA)**  | ❌ None                | ❌ None                   | **RFC 6238 TOTP + AES-256-GCM + 10 Hashed Backups** | Phishing-resistant second factor; encrypted secret keys at rest.   |
| **2FA Pre-Auth Gate**      | ❌ None                | ❌ None                   | **Scoped 5-Min Pre-Auth JWT (`2FA_PENDING`)**       | Impossible to bypass 2FA by ignoring client-side UI redirects.     |
| **Audit Logging**          | ❌ None                | ❌ None                   | **Immutable MongoDB Audit Trail (SOC 2)**           | Non-blocking forensic trail capturing IP, userAgent, and events.   |
| **Social Logins**          | ❌ None                | Google & GitHub OAuth 2.0 | **Google & GitHub OAuth 2.0 with Account Linking**  | 1-click login with pre-verified email linking.                     |
| **Account Recovery**       | Basic Reset            | 32-Byte CSPRNG            | **32-Byte CSPRNG + Multi-Device Session Wipe**      | 256-bit entropy token auto-invalidates all active sessions.        |
| **Brute-Force Defense**    | None                   | Rate Limiting             | **Granular Limiters on all 5 sensitive routes**     | Throttles credential stuffing, OTP guessing, and 2FA attacks.      |

---

## 📁 Project Structure

```text
├── assets/
│   ├── security_layers.png            # Enterprise 6-pillar security architecture diagram
│   ├── rfc6819_flow.png               # RFC 6819 token family replay theft diagram
│   └── totp_2fa_flow.png              # RFC 6238 TOTP 2FA & Pre-Auth flow diagram
├── src/
│   ├── config/
│   │   ├── config.js                  # Centralized environment variable validation
│   │   ├── db.js                      # Mongoose database connection
│   │   └── passport.js                # Google & GitHub OAuth 2.0 Passport strategies
│   ├── controllers/
│   │   ├── register.controller.js     # Argon2id registration & OTP email verification
│   │   ├── login.controller.js        # Login, Argon2id lazy-rehash & Pre-Auth 2FA gate
│   │   ├── twoFactor.controller.js    # TOTP setup, activation, 2FA verify, disable & backup codes
│   │   ├── token.controller.js        # RFC 6819 token rotation, single logout & logout-all
│   │   ├── password.controller.js     # Forgot password & secure password reset flow
│   │   ├── social.controller.js       # Social OAuth callback & session issuance
│   │   └── auth.controller.js         # Aggregator index re-exporting all controllers
│   ├── emails/
│   │   ├── otp.template.js            # Dedicated responsive HTML OTP email template
│   │   └── resetPassword.template.js  # Dedicated responsive HTML password reset email template
│   ├── middleware/
│   │   ├── auth.middleware.js         # Bearer Access Token verification middleware
│   │   ├── ratelimit.middleware.js    # Rate limiters for login, register, OTP, reset & 2FA
│   │   └── validate.middleware.js     # Generic Zod validation middleware
│   ├── models/
│   │   ├── user.model.js              # User schema (Argon2id password, 2FA fields, OAuth IDs)
│   │   ├── session.model.js           # Session schema (familyId, isUsed, refreshTokenHash, ip)
│   │   ├── auditLog.model.js          # Append-only security audit collection (indexed)
│   │   ├── otp.model.js               # OTP schema with 10-min MongoDB TTL index
│   │   └── passwordReset.model.js     # Password reset tokens with 15-min MongoDB TTL index
│   ├── routes/
│   │   └── auth.route.js              # Express auth routes with limiters & validators
│   ├── services/
│   │   ├── audit.service.js           # Non-blocking async security event logger
│   │   └── email.service.js           # Nodemailer service using Google OAuth2
│   ├── utils/
│   │   ├── crypto.utils.js            # AES-256-GCM crypto, SHA-256, OTP & Backup Code generators
│   │   └── utils.js                   # Utilities re-exporter
│   ├── validators/
│   │   ├── auth.validator.js          # Zod schemas for register, login, and verifyEmail
│   │   └── password.validator.js      # Zod schemas for forgotPassword and resetPassword
│   ├── app.js                         # Express app initialization, Helmet, CORS & middleware stack
│   └── server.js                      # Server entry point
├── SECURITY.md                        # Comprehensive 9-layer technical security documentation
├── .env.example                       # Environment variables template
├── package.json
├── LICENSE                            # ISC License
└── README.md
```

---

## Setup Guide

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/adityajha-coder/AuthORS.git

# Enter the project directory
cd AuthORS

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in the `.env` variables (see the [Process to Obtain & Update All API Keys & Credentials](#process-to-obtain--update-all-api-keys--credentials) below).

### 3. Run the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
node src/server.js
```

---

## 🌐 Where to Configure Frontend URLs (File-by-File Guide)

If you are connecting this backend to a frontend (React, Next.js, Vue, or HTML), here is the exact list of files where frontend URLs are handled:

### 1. In `.env` (Primary Location)

Set `FRONTEND_URL` to your frontend's host:

```env
# For local Vite frontend:
FRONTEND_URL=http://localhost:5173

# For local React / Next.js frontend:
# FRONTEND_URL=http://localhost:3000

# For deployed live website:
# FRONTEND_URL=https://your-production-app.com
```

### 2. How the Backend Files Use `FRONTEND_URL`:

- **`src/app.js` (CORS)**: Reads `process.env.FRONTEND_URL` to allow cross-origin cookies from your frontend.
- **`src/controllers/password.controller.js` (Password Reset Email)**: Uses `process.env.FRONTEND_URL` to construct the clickable reset link sent in emails:
  ```javascript
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
  ```
- **`src/controllers/social.controller.js` (Google & GitHub Redirect)**: Uses `process.env.FRONTEND_URL` to redirect the user back to your frontend dashboard with their access token:
  ```javascript
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  ```

---

## Process to Obtain & Update All API Keys & Credentials

### 1. MongoDB Connection URI (`MONGO_URI`)

You can use a local MongoDB instance or a free cloud cluster on **MongoDB Atlas**:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in or create a free account.
2. Click **Build a Database** and select the **M0 Free Shared Tier**.
3. Under **Security $\rightarrow$ Database Access**:
   - Click **Add New Database User**.
   - Set Authentication Method to **Password**. Choose a username and a strong password.
   - Set Database User Privileges to **Read and write to any database**.
4. Under **Security $\rightarrow$ Network Access**:
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) or add your current IP address.
5. Under **Database $\rightarrow$ Clusters**, click **Connect**:
   - Select **Drivers** (Node.js).
   - Copy the connection string:
     ```env
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/auth_system?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.

_💡 **How to update**: If you change your database password or switch to a new cluster, update the `MONGO_URI` string in `.env` and restart the server._

---

### 2. JWT Secret Key (`JWT_SECRET`)

To securely sign JWT access and refresh tokens, generate a cryptographically strong 256-bit secret string.

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated 64-character hexadecimal string and assign it to `JWT_SECRET` in your `.env`:

```env
JWT_SECRET=f4a7c89b2134567890abcdef1234567890abcdef1234567890abcdef12345678
```

_💡 **How to update**: Changing `JWT_SECRET` in `.env` will immediately invalidate all existing active JWT tokens across all users (forcing everyone to log in again)._

---

### 3. Google OAuth2 Credentials (for Email Sending & Google Login)

Google OAuth 2.0 handles both **Nodemailer automated emails** and **Google 1-Click Login**.

#### Step A: Create a Project in Google Cloud Console

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top $\rightarrow$ **New Project** $\rightarrow$ Name it `Auth-Email-Service` $\rightarrow$ Click **Create**.

#### Step B: Enable the Gmail API

1. In the search bar at the top, search for **Gmail API**.
2. Click **Gmail API** and click **Enable**.

#### Step C: Configure the OAuth Consent Screen

1. In the left sidebar, navigate to **APIs & Services $\rightarrow$ OAuth consent screen**.
2. Select **External** and click **Create**.
3. Fill in:
   - **App name**: `Auth System`
   - **User support email**: Select your Gmail.
   - **Developer contact email**: Enter your email address.
4. Click **Save and Continue** through **Scopes**.
5. Under **Test Users**:
   - Click **Add Users**.
   - Enter your Gmail address (the address you will send emails from).
6. Click **Save and Continue**.

#### Step D: Create OAuth 2.0 Credentials

1. In the left sidebar, click **Credentials**.
2. Click **+ Create Credentials $\rightarrow$ OAuth client ID**.
3. Choose:
   - **Application type**: `Web application`
   - **Name**: `AuthORS Web Client`
   - **Authorized redirect URIs**: Click **+ Add URI** and add BOTH:
     ```text
     https://developers.google.com/oauthplayground
     http://localhost:3001/api/auth/google/callback
     ```
4. Click **Create**.
5. Copy your **Client ID** and **Client Secret**:
   - `GOOGLE_CLIENT_ID=...`
   - `GOOGLE_CLIENT_SECRET=...`

#### Step E: Generate the Refresh Token via OAuth Playground

1. Open the [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground).
2. In the top-right corner, click the **Gear Icon (OAuth 2.0 configuration)**:
   - Check the box **"Use your own OAuth credentials"**.
   - Paste your **OAuth Client ID** and **OAuth Client Secret**.
3. On the left under **Step 1 Select & authorize APIs**:
   - Scroll down to **Gmail API v1**.
   - Select `https://mail.google.com/`.
   - Click **Authorize APIs**.
4. Log in with the **same Gmail account** you added as a test user and click **Continue** (allow permissions).
5. In **Step 2 Exchange authorization code for tokens**:
   - Click **Exchange authorization code for tokens**.
6. Copy the resulting **Refresh token**:
   - `GOOGLE_REFRESH_TOKEN=1//04...`

_💡 **How to update**: If you deploy your backend to production (e.g. `https://api.yourdomain.com`), go to Google Cloud Console $\rightarrow$ Credentials $\rightarrow$ Edit your OAuth Client ID $\rightarrow$ Add `https://api.yourdomain.com/api/auth/google/callback` to Authorized redirect URIs $\rightarrow$ Click Save._

---

### 4. GitHub OAuth Application Credentials

1. Open [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **New OAuth App** (or **Register a new application**).
3. Fill in:
   - **Application name**: `AuthORS`
   - **Homepage URL**: `http://localhost:3001`
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`
4. Click **Register application**.
5. Click **Generate a new client secret**.
6. Copy `Client ID` and `Client Secret` into your `.env`:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

_💡 **How to update**: When deploying to production, go to your GitHub OAuth App settings and update the Authorization callback URL to `https://api.yourdomain.com/api/auth/github/callback`._

---

### 📋 Complete `.env` Reference Template

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/auth_system?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key

GOOGLE_USER=your_email@gmail.com
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

FRONTEND_URL=http://localhost:5173
```

---

## API Endpoints Reference

All endpoints are prefixed with `/api/auth`.

| Method | Endpoint                                | Rate Limit | Request Body Validation / Requirements                                                                          |          Auth Required          |
| :----- | :-------------------------------------- | :--------: | :-------------------------------------------------------------------------------------------------------------- | :-----------------------------: |
| `POST` | `/api/auth/register`                    |   5 / hr   | `userName` (3-15 chars, alphanumeric), `email`, `password` (min 8 chars, 1 uppercase, 1 number, 1 special char) |              ❌ No              |
| `POST` | `/api/auth/verify-email`                |  3 / 10m   | `email`, `otp` (exactly 6 digits)                                                                               |              ❌ No              |
| `POST` | `/api/auth/login`                       |  5 / 15m   | `email`, `password`                                                                                             |              ❌ No              |
| `GET`  | `/api/auth/get-me`                      |    None    | None                                                                                                            | 🔒 Yes (`Bearer <accessToken>`) |
| `GET`  | `/api/auth/refresh-token`               |    None    | None                                                                                                            | 🔒 Yes (via `httpOnly` Cookie)  |
| `POST` | `/api/auth/logout`                      |    None    | None                                                                                                            | 🔒 Yes (via `httpOnly` Cookie)  |
| `POST` | `/api/auth/logout-all`                  |    None    | None                                                                                                            | 🔒 Yes (via `httpOnly` Cookie)  |
| `POST` | `/api/auth/forgot-password`             |   3 / hr   | `email` (valid email string)                                                                                    |              ❌ No              |
| `POST` | `/api/auth/reset-password`              |    None    | `email`, `token` (min 32 chars), `password` (min 8 chars, 1 uppercase, 1 number, 1 special char)                |              ❌ No              |
| `POST` | `/api/auth/2fa/setup`                   |    None    | None                                                                                                            | 🔒 Yes (`Bearer <accessToken>`) |
| `POST` | `/api/auth/2fa/enable`                  |    None    | `code` (6-digit TOTP code)                                                                                      | 🔒 Yes (`Bearer <accessToken>`) |
| `POST` | `/api/auth/2fa/verify`                  |   5 / 5m   | `preAuthToken`, `code` (TOTP) OR `backupCode`                                                                   |     ❌ No (Pre-Auth Token)      |
| `POST` | `/api/auth/2fa/disable`                 |    None    | `password` OR `code` (re-authentication)                                                                        | 🔒 Yes (`Bearer <accessToken>`) |
| `POST` | `/api/auth/2fa/regenerate-backup-codes` |    None    | `password` OR `code`                                                                                            | 🔒 Yes (`Bearer <accessToken>`) |
| `GET`  | `/api/auth/google`                      |    None    | None (Redirects to Google consent screen)                                                                       |              ❌ No              |
| `GET`  | `/api/auth/google/callback`             |    None    | OAuth code (Browser redirect)                                                                                   |              ❌ No              |
| `GET`  | `/api/auth/github`                      |    None    | None (Redirects to GitHub consent screen)                                                                       |              ❌ No              |
| `GET`  | `/api/auth/github/callback`             |    None    | OAuth code (Browser redirect)                                                                                   |              ❌ No              |

---

### Request & Response Examples (v3.0.0)

#### 1. Register User

`POST /api/auth/register`

```json
// Request Body
{
  "userName": "adityajha",
  "email": "aditya@example.com",
  "password": "StrongPassword123!"
}

// Success Response (201 Created)
{
  "message": "User registered successfully",
  "user": {
    "userName": "adityajha",
    "email": "aditya@example.com",
    "verified": false
  }
}
```

```json
// Validation Error Response (400 Bad Request) - e.g. Weak Password
{
  "message": "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)"
    }
  ]
}
```

```json
// Duplicate Error Response (409 Conflict)
{
  "message": "Email is already registered"
}
```

```json
// Rate Limit Error (429 Too Many Requests)
{
  "message": "Too many accounts created, please try again after an hour."
}
```

---

#### 2. Verify Email via OTP

`POST /api/auth/verify-email`

```json
// Request Body
{
  "email": "aditya@example.com",
  "otp": "492817"
}

// Success Response (200 OK)
{
  "message": "Email verified successfully",
  "user": {
    "userName": "adityajha",
    "email": "aditya@example.com",
    "verified": true
  }
}
```

```json
// Invalid OTP / Expired Response (400 Bad Request)
{
  "message": "Invalid OTP"
}
```

```json
// Rate Limit Error (429 Too Many Requests)
{
  "message": "Too many otp verification attempts, please request new otp or try again in 10 minutes."
}
```

---

#### 3. Login

`POST /api/auth/login`

```json
// Request Body
{
  "email": "aditya@example.com",
  "password": "StrongPassword123!"
}

// Success Response (Standard Login - 200 OK)
// Set-Cookie: refreshToken=<7d_JWT_Token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
{
  "message": "Logged in successfully",
  "user": {
    "userName": "adityajha",
    "email": "aditya@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

```json
// Success Response (When 2FA is Enabled on Account - 200 OK)
// Issues a short-lived 5-minute Pre-Auth Token (stage: "2FA_PENDING")
{
  "require2FA": true,
  "preAuthToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Two-factor authentication required. Verify with your 6-digit code or backup code."
}
```

```json
// Unverified Account Response (401 Unauthorized)
{
  "message": "Email not verified"
}
```

```json
// Invalid Credentials Response (401 Unauthorized)
{
  "message": "Invalid email or password"
}
```

```json
// Rate Limit Error (429 Too Many Requests)
{
  "message": "Too many login attempts. Please try again after 15 minutes."
}
```

---

#### 4. Forgot Password

`POST /api/auth/forgot-password`

```json
// Request Body
{
  "email": "aditya@example.com"
}

// Success Response (200 OK)
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

```json
// Rate Limit Error (429 Too Many Requests)
{
  "message": "Too many password reset requests. Please try again after an hour."
}
```

---

#### 5. Reset Password

`POST /api/auth/reset-password`

```json
// Request Body
{
  "email": "aditya@example.com",
  "token": "3a2d635651159aef4f5fafd55686b6b9636d53b044e58913932148acf078e97a",
  "password": "NewStrongPassword123!"
}

// Success Response (200 OK)
{
  "message": "Password reset successful. All active sessions have been revoked. Please log in with your new password."
}
```

```json
// Invalid / Expired Token Response (400 Bad Request)
{
  "message": "Invalid or expired password reset link"
}
```

---

#### 6. Social Logins (Google & GitHub)

In your frontend HTML / React application, create direct links to the trigger routes:

```html
<!-- Google Login Button -->
<a href="http://localhost:3001/api/auth/google">
  <button>Sign in with Google</button>
</a>

<!-- GitHub Login Button -->
<a href="http://localhost:3001/api/auth/github">
  <button>Sign in with GitHub</button>
</a>
```

**Callback Handling**: After authentication, the backend sets the `refreshToken` cookie and redirects the browser to:
`${FRONTEND_URL}/auth/callback?token=<accessToken>`

---

#### 7. Get Current User Profile

`GET /api/auth/get-me`

```http
Headers:
Authorization: Bearer <accessToken>

// Success Response (200 OK)
{
  "message": "User fetched successfully",
  "user": {
    "userName": "adityajha",
    "email": "aditya@example.com"
  }
}
```

```json
// Unauthorized Response (401 Unauthorized) - e.g. Expired Token
{
  "message": "Invalid or expired token"
}
```

---

#### 8. Refresh Access Token (Token Rotation)

`GET /api/auth/refresh-token`

```http
Cookie: refreshToken=<refreshToken>

// Success Response (200 OK)
// Set-Cookie: refreshToken=<newRotatedRefreshToken>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
{
  "message": "Access token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

```json
// Invalid Session / Token Error (401 Unauthorized)
{
  "message": "Invalid or expired refresh token"
}
```

---

#### 9. Logout Current Device

`POST /api/auth/logout`

```http
Cookie: refreshToken=<refreshToken>

// Success Response (200 OK)
// Set-Cookie: refreshToken=; Max-Age=0
{
  "message": "Logged out successfully"
}
```

---

#### 10. Logout All Devices

`POST /api/auth/logout-all`

```http
Cookie: refreshToken=<refreshToken>

// Success Response (200 OK)
// Set-Cookie: refreshToken=; Max-Age=0
{
  "message": "Logged out from all devices successfully"
}
```

---

#### 11. Setup Two-Factor Authentication (TOTP)

`POST /api/auth/2fa/setup`

```http
Headers:
Authorization: Bearer <accessToken>

// Success Response (200 OK)
{
  "message": "Scan this QR code with Google Authenticator",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAI...",
  "manualEntryKey": "47G74FGY2NVRB44U4QZ4L2R3MY4Q7A3X"
}
```

---

#### 12. Enable & Activate 2FA

`POST /api/auth/2fa/enable`

```http
Headers:
Authorization: Bearer <accessToken>
```

```json
// Request Body
{
  "code": "492108"
}

// Success Response (200 OK)
{
  "message": "2FA successfully enabled! Store these 10 backup codes in a safe place. They will only be shown once.",
  "backupCodes": [
    "A1B2C3D4",
    "E5F6G7H8",
    "I9J0K1L2",
    "M3N4O5P6",
    "Q7R8S9T0",
    "U1V2W3X4",
    "Y5Z6A7B8",
    "C9D0E1F2",
    "G3H4I5J6",
    "K7L8M9N0"
  ]
}
```

---

#### 13. Verify 2FA & Complete Login

`POST /api/auth/2fa/verify`

```json
// Request Body (Option A: 6-Digit Authenticator Code)
{
  "preAuthToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "831774"
}
```

```json
// Request Body (Option B: Single-Use Emergency Backup Code)
{
  "preAuthToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "backupCode": "A1B2C3D4"
}
```

```json
// Success Response (200 OK)
// Set-Cookie: refreshToken=<7d_JWT_Token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
{
  "message": "2FA verified! Login completed successfully.",
  "user": {
    "userName": "adityajha",
    "email": "aditya@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 14. Disable 2FA

`POST /api/auth/2fa/disable`

```http
Headers:
Authorization: Bearer <accessToken>
```

```json
// Request Body (Re-authenticate with current Password OR current TOTP Code)
{
  "password": "StrongPassword123!",
  "code": "492108"
}

// Success Response (200 OK)
{
  "message": "2FA has been successfully disabled."
}
```

---

#### 15. Regenerate Backup Codes

`POST /api/auth/2fa/regenerate-backup-codes`

```http
Headers:
Authorization: Bearer <accessToken>
```

```json
// Request Body (Re-authenticate with Password OR current TOTP Code)
{
  "password": "StrongPassword123!"
}

// Success Response (200 OK)
{
  "message": "Old backup codes invalidated. Here are your 10 new single-use backup codes:",
  "backupCodes": [
    "Z1Y2X3W4",
    "V5U6T7S8",
    "R9Q0P1O2",
    "N3M4L5K6",
    "J7I8H9G0",
    "F1E2D3C4",
    "B5A6Z7Y8",
    "X9W0V1U2",
    "T3S4R5Q6",
    "P7O8N9M0"
  ]
}
```

---

## Integrate This in Future Projects

1. **Copy the `src/` folder** into your new project.
2. **Install the required packages**:
   ```bash
   npm install express mongoose dotenv jsonwebtoken cookie-parser morgan nodemailer argon2 zod helmet cors express-rate-limit passport passport-google-oauth20 passport-github2 otplib qrcode
   ```
3. **Mount the auth router** in your main `app.js`:

   ```javascript
   import express from "express";
   import cookieParser from "cookie-parser";
   import helmet from "helmet";
   import cors from "cors";
   import authRouter from "./routes/auth.route.js";

   const app = express();

   // Security headers & CORS
   app.use(helmet());
   app.use(
     cors({
       origin: [
         "http://localhost:3000",
         "http://localhost:5173",
         process.env.FRONTEND_URL,
       ].filter(Boolean),
       credentials: true,
     }),
   );

   app.use(express.json());
   app.use(cookieParser());

   // Routes
   app.use("/api/auth", authRouter);
   ```

4. **Copy `.env.example`** to `.env` and set your credentials.


---

## 📄 License

ISC License. Free to use and adapt for personal and commercial projects.
