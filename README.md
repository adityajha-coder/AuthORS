# 🛡️ AuthORS — High-End Production-Ready Authentication System (v1.5.0)

A secure, enterprise-grade authentication backend boilerplate built with **Node.js, Express, MongoDB (Mongoose), Bcrypt, Zod, Helmet, Express-Rate-Limit, JWT, and Nodemailer (Google OAuth2)**.

This system implements modern security best practices:
- **Dual-Token Architecture**: Short-lived Access Tokens (15m) + Long-lived Refresh Tokens (7d).
- **Password Hashing with Bcrypt**: Salted passwords using 12 computational work rounds.
- **Brute-Force Protection**: IP-based rate limiters on `/login`, `/register`, and `/verify-email`.
- **Request Validation with Zod**: Strict payload schemas and password complexity enforcement.
- **HTTP Security Headers with Helmet**: Built-in defense against Clickjacking, MIME-sniffing, and XSS.
- **CORS with Credentials**: Whitelisted origin access allowing secure `httpOnly` cookie transfer.
- **Session Management & Token Rotation**: Refresh tokens are SHA-256 hashed and stored in database sessions with IP and User-Agent tracking. Refreshing a token immediately rotates the refresh token.
- **`httpOnly`, `secure`, `sameSite: strict` Cookies**: Protection against XSS and CSRF token interception.
- **Email Verification via OTP**: 6-digit OTP sent via Gmail OAuth2, hashed with SHA-256 in MongoDB, with an automatic **10-minute TTL (Time-To-Live) auto-deletion**.
- **Multi-Device Revocation**: Invalidate a single session or all active sessions across all devices (`/logout-all`).

---

## New in v1.5.0 (Diff from v1.0.0)

| Security & Feature Area | Baseline Version 1.0.0 | Hardened Version 1.5.0 (Current) | Why It Matters |
| :--- | :--- | :--- | :--- |
| **Password Hashing** | SHA-256 (`crypto.createHash`) | **Bcrypt (12 Salt Rounds)** | SHA-256 is susceptible to GPU/rainbow-table brute forcing; Bcrypt uses slow, salted key derivation. |
| **Brute-Force Defense** | No rate limits | **Rate Limiting (`express-rate-limit`)** | Prevents 6-digit OTP guessing (max 3 tries) and credential stuffing on `/login` (max 5 tries). |
| **Payload Validation** | Basic manual checks | **Zod Schema Validation** | Enforces strong password complexity (min 8 chars, uppercase, number, special char) and trims/normalizes emails. |
| **HTTP Security Headers** | Default Express headers | **`helmet` Integration** | Injects 11+ security headers (HSTS, CSP, X-Frame-Options against clickjacking, X-Content-Type-Options). |
| **Cross-Origin Security** | Unconfigured CORS | **Strict CORS with `credentials: true`** | Enables secure cross-origin `httpOnly` cookie handling while blocking unauthorized domains. |

---

## 📁 Project Structure

```text
├── src/
│   ├── config/
│   │   ├── config.js               # Centralized environment variable validation
│   │   └── db.js                   # Mongoose database connection
│   ├── controllers/
│   │   └── auth.controller.js      # Controller logic (register, login, OTP, tokens, sessions)
│   ├── middleware/
│   │   ├── ratelimit.middleware.js # Rate limiters for login, register, and OTP verification
│   │   └── validate.middleware.js  # Generic Zod validation middleware
│   ├── models/
│   │   ├── user.model.js           # User schema (userName, email, password, verified)
│   │   ├── session.model.js        # Session schema (user, refreshTokenHash, ip, userAgent, revoked)
│   │   └── otp.model.js            # OTP schema with 10-min MongoDB TTL index
│   ├── routes/
│   │   └── auth.route.js           # Express auth routes with rate limiters & validators
│   ├── services/
│   │   └── email.service.js        # Nodemailer service using Google OAuth2
│   ├── utils/
│   │   └── utils.js                # 6-digit OTP generator & responsive HTML email template
│   ├── validators/
│   │   └── auth.validator.js       # Zod schemas for register, login, and verifyEmail
│   ├── app.js                      # Express app initialization, Helmet, CORS & middleware stack
│   └── server.js                   # Server entry point
├── .env.example                    # Environment variables template
├── package.json
├── LICENSE                         # ISC License
└── README.md
```

---

## Setup Guide

### 1. Installation

```bash
# Clone this exact version (v1.5.0) into your project
git clone --branch v1.5.0 https://github.com/adityajha-coder/AuthORS.git

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

Fill in the `.env` variables (see the [Process to Obtain All API Keys & Credentials](#process-to-obtain-all-api-keys--credentials) below).

### 3. Run the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
node src/server.js
```

---

## Process to Obtain All API Keys & Credentials

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

---

### 3. Google OAuth2 Gmail API (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_USER`)

Google no longer allows basic passwords for automated SMTP. Using **OAuth 2.0 with the Gmail API** is the official and most reliable method to send emails via Nodemailer.

#### Step A: Create a Project in Google Cloud Console
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top $\rightarrow$ **New Project**.
3. Name it (e.g. `Auth-Email-Service`) and click **Create**.

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
4. Click **Save and Continue** through **Scopes** (no extra scopes needed here).
5. Under **Test Users**:
   - Click **Add Users**.
   - Enter your Gmail address (the address you will send emails from).
6. Click **Save and Continue**.

#### Step D: Create OAuth 2.0 Credentials
1. In the left sidebar, click **Credentials**.
2. Click **+ Create Credentials $\rightarrow$ OAuth client ID**.
3. Choose:
   - **Application type**: `Web application`
   - **Name**: `Nodemailer Auth Client`
   - **Authorized redirect URIs**: Click **+ Add URI** and enter:
     ```text
     https://developers.google.com/oauthplayground
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

#### Step F: Update `.env`
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/auth_system?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key

GOOGLE_USER=your_email@gmail.com
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token

FRONTEND_URL=http://localhost:5173
```

---

## API Endpoints Reference

All endpoints are prefixed with `/api/auth`.

| Method | Endpoint | Rate Limit | Request Body Validation (Zod) | Auth Required |
| :--- | :--- | :---: | :--- | :---: |
| `POST` | `/api/auth/register` | 5 / hr | `userName` (3-15 chars, alphanumeric), `email`, `password` (min 8 chars, 1 uppercase, 1 number, 1 special char) | ❌ No |
| `POST` | `/api/auth/verify-email` | 3 / 10m | `email`, `otp` (exactly 6 digits) | ❌ No |
| `POST` | `/api/auth/login` | 5 / 15m | `email`, `password` | ❌ No |
| `GET` | `/api/auth/get-me` | None | None |  Yes (`Bearer <accessToken>`) |
| `GET` | `/api/auth/refresh-token` | None | None |  Yes (via Cookie) |
| `POST` | `/api/auth/logout` | None | None |  Yes (via Cookie) |
| `POST` | `/api/auth/logout-all` | None | None |  Yes (via Cookie) |

---

### Request & Response Examples (v1.5.0)

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

#### 2. Verify Email
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

// Success Response (200 OK)
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

#### 4. Get Current User Profile
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

#### 5. Refresh Access Token (Token Rotation)
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

#### 6. Logout Current Device
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

#### 7. Logout All Devices
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

## Integrate This in Future Projects

1. **Copy the `src/` folder** into your new project.
2. **Install the required packages**:
   ```bash
   npm install express mongoose dotenv jsonwebtoken cookie-parser morgan nodemailer bcrypt zod helmet cors express-rate-limit
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
   app.use(cors({
       origin: ["http://localhost:3000", "http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean),
       credentials: true
   }));

   app.use(express.json());
   app.use(cookieParser());

   // Routes
   app.use("/api/auth", authRouter);
   ```
4. **Copy `.env.example`** to `.env` and set your credentials.

---

## 📄 License
ISC License. Free to use and adapt for personal and commercial projects.
