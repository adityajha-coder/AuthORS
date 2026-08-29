# 🛡️ High-End Production-Ready Authentication System

A secure, enterprise-grade authentication backend boilerplate built with **Node.js, Express, MongoDB (Mongoose), JWT, and Nodemailer (Google OAuth2)**.

This system implements modern security best practices:
- **Dual-Token Architecture**: Short-lived Access Tokens (15m) + Long-lived Refresh Tokens (7d).
- **Session Management & Token Rotation**: Refresh tokens are SHA-256 hashed and stored in database sessions with IP and User-Agent tracking. Refreshing a token immediately rotates the refresh token.
- **`httpOnly`, `secure`, `sameSite: strict` Cookies**: Protection against XSS and CSRF token interception.
- **Email Verification via OTP**: 6-digit OTP sent via Gmail OAuth2, hashed with SHA-256 in MongoDB, with an automatic **10-minute TTL (Time-To-Live) auto-deletion**.
- **Multi-Device Revocation**: Invalidate a single session or all active sessions across all devices (`/logout-all`).

---

## 📁 Project Structure

```text
├── src/
│   ├── config/
│   │   ├── config.js          # Centralized environment variable validation
│   │   └── db.js              # Mongoose database connection
│   ├── controllers/
│   │   └── auth.controller.js # Controller logic (register, login, OTP, tokens, sessions)
│   ├── models/
│   │   ├── user.model.js      # User schema (userName, email, password, verified)
│   │   ├── session.model.js   # Session schema (user, refreshTokenHash, ip, userAgent, revoked)
│   │   └── otp.model.js       # OTP schema with 10-min MongoDB TTL index
│   ├── routes/
│   │   └── auth.route.js      # Express auth routes
│   ├── services/
│   │   └── email.service.js   # Nodemailer service using Google OAuth2
│   ├── utils/
│   │   └── utils.js           # 6-digit OTP generator & responsive HTML email template
│   ├── app.js                 # Express app initialization & middleware stack
│   └── server.js              # Server entry point
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

---

## Setup Guide

### 1. Installation

```bash
# Clone or copy the auth module into your project
cd Auth-System

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in the `.env` variables (see the [API Keys & Credentials Guide](#-how-to-obtain-all-api-keys--credentials) below).

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
GOOGLE_USER=your_email@gmail.com
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret
GOOGLE_REFRESH_TOKEN=1//04your_refresh_token
```

---

## API Endpoints Reference

All endpoints are prefixed with `/api/auth`.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user & send 6-digit verification OTP | ❌ No |
| `POST` | `/api/auth/verify-email` | Verify email using 6-digit OTP & mark account active | ❌ No |
| `POST` | `/api/auth/login` | Log in user, issue access token & set refresh token cookie | ❌ No |
| `GET` | `/api/auth/get-me` | Fetch authenticated user details |  Yes (`Bearer <accessToken>`) |
| `GET` | `/api/auth/refresh-token` | Rotate refresh token & issue a new access token |  Yes (via Cookie) |
| `POST` | `/api/auth/logout` | Revoke current device session & clear cookie |  Yes (via Cookie) |
| `POST` | `/api/auth/logout-all` | Revoke all active sessions across all devices |  Yes (via Cookie) |

---

### Request & Response Examples

#### 1. Register User
`POST /api/auth/register`
```json
// Request Body
{
  "userName": "adityajha",
  "email": "adityajha@example.com",
  "password": "StrongPassword123!"
}

// Response (201 Created)
{
  "message": "User registered successfully",
  "user": {
    "userName": "adityajha",
    "email": "adityajha@example.com",
    "verified": false
  }
}
```

#### 2. Verify Email
`POST /api/auth/verify-email`
```json
// Request Body
{
  "email": "adityajha@example.com",
  "otp": "492817"
}

// Response (200 OK)
{
  "message": "Email verified successfully",
  "user": {
    "userName": "adityajha",
    "email": "adityajha@example.com",
    "verified": true
  }
}
```

#### 3. Login
`POST /api/auth/login`
```json
// Request Body
{
  "email": "adityajha@example.com",
  "password": "StrongPassword123!"
}

// Response (200 OK)
// Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
{
  "message": "Logged in successfully",
  "user": {
    "userName": "adityajha",
    "email": "adityajha@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Get Current User Profile
`GET /api/auth/get-me`
```http
Headers:
Authorization: Bearer <accessToken>

// Response (200 OK)
{
  "message": "User fetched successfully",
  "user": {
    "userName": "adityajha",
    "email": "adityajha@example.com"
  }
}
```

#### 5. Refresh Access Token
`GET /api/auth/refresh-token`
```http
Cookie: refreshToken=<refreshToken>

// Response (200 OK)
// Set-Cookie: refreshToken=<newRefreshToken>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
{
  "message": "Access token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 6. Logout Current Device
`POST /api/auth/logout`
```http
Cookie: refreshToken=<refreshToken>

// Response (200 OK)
// Set-Cookie: refreshToken=; Max-Age=0
{
  "message": "Logged out successfully"
}
```

#### 7. Logout All Devices
`POST /api/auth/logout-all`
```http
Cookie: refreshToken=<refreshToken>

// Response (200 OK)
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
   npm install express mongoose dotenv jsonwebtoken cookie-parser morgan nodemailer
   ```
3. **Mount the auth router** in your main `app.js`:
   ```javascript
   import express from "express";
   import cookieParser from "cookie-parser";
   import authRouter from "./routes/auth.route.js";

   const app = express();
   app.use(express.json());
   app.use(cookieParser());

   app.use("/api/auth", authRouter);
   ```
4. **Copy `.env.example`** to `.env` and set your credentials.

---

## 📄 License
ISC License. Free to use and adapt for personal and commercial projects.
