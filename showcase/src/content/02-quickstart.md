# Quick Start & Setup

Get AuthORS running locally in a few minutes.

---

## Installation

Clone the release version that fits your requirements:

| Version | Tag | Key Focus |
|:---|:---|:---|
| **v3.0.0** (Current) | `v3.0.0` | Argon2id, RFC 6819 token theft detection, RFC 6238 TOTP 2FA, Audit trail |
| **v2.0.0** | `v2.0.0` | Bcrypt, Google & GitHub OAuth 2.0, 32-byte CSPRNG reset |
| **v1.5.0** | `v1.5.0` | Bcrypt, Zod request validation, rate limiting, Helmet security headers |
| **v1.0.0** | `v1.0.0` | Single-pass SHA-256, Email OTP verification, basic JWT |

---

### v3.0.0 — Enterprise Defense

```bash
git clone -b v3.0.0 https://github.com/adityajha-coder/AuthORS.git
```

### v2.0.0 — Identity Expansion

```bash
git clone -b v2.0.0 https://github.com/adityajha-coder/AuthORS.git
```

### v1.5.0 — Middleware Hardening

```bash
git clone -b v1.5.0 https://github.com/adityajha-coder/AuthORS.git
```

### v1.0.0 — Baseline Starter

```bash
git clone -b v1.0.0 https://github.com/adityajha-coder/AuthORS.git
```

---

### Setup & Dependencies

After cloning, enter the project directory and install dependencies:

```bash
cd AuthORS
npm install
```

---

## Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Here's the full template:

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

## Getting each credential

### MongoDB URI

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — the free M0 tier works fine
2. Create a database user with read/write access
3. Under Network Access, allow your IP (or `0.0.0.0/0` for dev)
4. Grab the connection string from the Clusters → Connect → Drivers panel

### JWT Secret

Generate a random 256-bit hex string:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Changing this invalidates all existing tokens — everyone gets logged out.

### Google OAuth (for emails + Google login)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a project
2. Enable the **Gmail API**
3. Set up the OAuth consent screen (External, add your Gmail as test user)
4. Create an OAuth 2.0 Client ID (Web application)
5. Add these redirect URIs:
   - `https://developers.google.com/oauthplayground`
   - `http://localhost:3001/api/auth/google/callback`
6. Use [OAuth Playground](https://developers.google.com/oauthplayground) with your client credentials to get a refresh token for the Gmail API scope (`https://mail.google.com/`)

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → New OAuth App
2. Set Homepage URL to `http://localhost:3001`
3. Set callback URL to `http://localhost:3001/api/auth/github/callback`
4. Copy the Client ID and generate a Client Secret

---

## Running the server

```bash
# development (with hot reload)
npm run dev

# production
node src/server.js
```

The server starts on port `3001` by default.

---

## Connecting a frontend

The backend uses `FRONTEND_URL` in three places:

- **CORS** (`src/app.js`) — allows cross-origin cookie transfer from your frontend
- **Password reset emails** (`src/controllers/password.controller.js`) — builds the clickable reset link
- **OAuth redirects** (`src/controllers/social.controller.js`) — redirects back to your app after social login

Set `FRONTEND_URL` in `.env` to match wherever your frontend runs (`http://localhost:5173` for Vite, `http://localhost:3000` for Next.js, or your production domain).
