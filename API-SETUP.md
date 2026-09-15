# GundamDev — Complete API, Credentials & Secret Setup Guide

This guide details every external API, database credential, secret token, environment variable, and OAuth configuration required to run the **GundamDev** platform.

---

## 📋 Summary of Required Environment Files

| Location | Purpose | Exposed to Browser? |
|---|---|---|
| `.env` (Root) | Frontend public configuration | **YES** (Only non-sensitive variables prefixed with `VITE_`) |
| `server/.env` | Server secrets & provider keys | **NO** (Server-only secret storage) |

---

## 🔑 1. Cryptographic Master Keys (Server Secrets)

### 1.1 `JWT_SECRET`
- **Name / Purpose**: Secret signing key for user authentication tokens and OAuth state parameter verification.
- **Where to get it**: Self-generated cryptographic string.
- **What to create**: Run `openssl rand -hex 32` or generate a 64-character random string.
- **Exact `.env` Variable**: `JWT_SECRET`
- **Where to paste it**: `server/.env`
- **Example Format**: `JWT_SECRET="c8d4e2f9a1b3c5d7e9f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6"`
- **Required / Optional**: **REQUIRED**
- **What feature breaks if missing**: User login, registration, session persistence, and authorization middleware fail.

---

### 1.2 `VAULT_MASTER_KEY`
- **Name / Purpose**: Master encryption key for server-side AES-256-GCM encryption of user GitHub access tokens and project secret variables.
- **Where to get it**: Self-generated cryptographic key.
- **What to create**: Run `openssl rand -hex 32` or generate a 64-character random string.
- **Exact `.env` Variable**: `VAULT_MASTER_KEY`
- **Where to paste it**: `server/.env`
- **Example Format**: `VAULT_MASTER_KEY="a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"`
- **Required / Optional**: **REQUIRED**
- **What feature breaks if missing**: User GitHub tokens and project secret variables cannot be securely encrypted or decrypted at rest.

---

## 🗄 2. Database Credentials (Supabase / PostgreSQL)

### 2.1 `DATABASE_URL` / `SUPABASE_DATABASE_URL`
- **Name / Purpose**: Relational database URI for Supabase PostgreSQL database connections.
- **Where to get it**: [Supabase Dashboard](https://supabase.com/dashboard) → Select Project → **Project Settings** → **Database** → **Connection String** → **URI**.
- **What to create**: Create a new Supabase Project at [https://supabase.com](https://supabase.com).
- **Exact `.env` Variable**: `DATABASE_URL` (or `SUPABASE_DATABASE_URL`)
- **Where to paste it**: `server/.env`
- **Example Format**: `DATABASE_URL="postgres://postgres.ref:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"`
- **Required / Optional**: **REQUIRED** for cloud persistence (*Falls back to local disk-backed SQLite `server/data/gundamdev_relational.sqlite` if unconfigured*).
- **What feature breaks if missing**: Cloud multi-user relational database persistence fails; falls back to local SQLite engine.

---

## 🐙 3. GitHub OAuth & API Integration

### 3.1 `GITHUB_CLIENT_ID`
- **Name / Purpose**: Client identifier for GundamDev GitHub OAuth authentication.
- **Where to get it**: [GitHub Developer Settings](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**.
- **What to create**:
  - **Application Name**: `GundamDev Mobile Cloud IDE`
  - **Homepage URL**: `http://localhost:3000`
  - **Authorization Callback URL**: `http://localhost:5000/api/github/callback`
- **Exact `.env` Variable**: `GITHUB_CLIENT_ID`
- **Where to paste it**: `server/.env`
- **Example Format**: `GITHUB_CLIENT_ID="Ov23liXXXXXXXXXXXXXX"`
- **Required / Optional**: **REQUIRED** for GitHub features.
- **What feature breaks if missing**: User cannot authorize GitHub OAuth; repo listing, repository import, push, pull, and commit history fail.

---

### 3.2 `GITHUB_CLIENT_SECRET`
- **Name / Purpose**: Secret key used by backend server to exchange temporary OAuth authorization code for GitHub access token.
- **Where to get it**: [GitHub Developer Settings](https://github.com/settings/developers) → Select your OAuth App → **Generate a new client secret**.
- **What to create**: Click **Generate a new client secret** button.
- **Exact `.env` Variable**: `GITHUB_CLIENT_SECRET`
- **Where to paste it**: `server/.env`
- **Example Format**: `GITHUB_CLIENT_SECRET="4a8b1c2d3e4f567890abcdef1234567890abcdef"`
- **Required / Optional**: **REQUIRED** for GitHub features.
- **What feature breaks if missing**: Server-side OAuth code exchange fails during callback.

---

### 3.3 `GITHUB_CALLBACK_URL`
- **Name / Purpose**: Exact redirect URI where GitHub sends the user after authorization.
- **Where to get it**: Must match the exact URL registered in your GitHub OAuth App settings.
- **What to create**: Set to `http://localhost:5000/api/github/callback` for local development.
- **Exact `.env` Variable**: `GITHUB_CALLBACK_URL`
- **Where to paste it**: `server/.env` and GitHub OAuth App Settings.
- **Example Format**: `GITHUB_CALLBACK_URL="http://localhost:5000/api/github/callback"`
- **Required / Optional**: **REQUIRED**
- **What feature breaks if missing**: GitHub displays `redirect_uri_mismatch` error during login.

---

## ⚡ 4. Deployment Provider Credentials (Optional)

### 4.1 Netlify Provider (`NETLIFY_AUTH_TOKEN`)
- **Name / Purpose**: Personal Access Token for Netlify REST API deployment operations.
- **Where to get it**: [Netlify User Settings](https://app.netlify.com/user/settings) → **Applications** → **Personal Access Tokens**.
- **What to create**: Click **New access token** → Expiration: No Expiration.
- **Exact `.env` Variable**: `NETLIFY_AUTH_TOKEN`
- **Where to paste it**: `server/.env`
- **Example Format**: `NETLIFY_AUTH_TOKEN="nfp_a1b2c3d4e5f67890123456789abcdef"`
- **Required / Optional**: **OPTIONAL**
- **What feature breaks if missing**: Triggering production deployments to Netlify uses sandbox URL boundary mode.

---

### 4.2 Cloudflare Pages Provider (`CLOUDFLARE_API_TOKEN` & `CLOUDFLARE_ACCOUNT_ID`)
- **Name / Purpose**: Cloudflare API Token and Account ID for triggering deployments to Cloudflare Pages edge network.
- **Where to get it**:
  - **API Token**: [Cloudflare Dashboard Profile](https://dash.cloudflare.com/profile/api-tokens) → **Create Token** → **Cloudflare Pages** template.
  - **Account ID**: [Cloudflare Dashboard Overview](https://dash.cloudflare.com/) → Copy **Account ID** from right sidebar.
- **What to create**: Create API token with `Cloudflare Pages: Edit` permissions.
- **Exact `.env` Variables**:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
- **Where to paste it**: `server/.env`
- **Example Format**:
  ```env
  CLOUDFLARE_API_TOKEN="c2FtcGxlX2Nsb3VkZmxhcmVfYXBpX3Rva2VuXzEyMw"
  CLOUDFLARE_ACCOUNT_ID="1234567890abcdef1234567890abcdef"
  ```
- **Required / Optional**: **OPTIONAL**
- **What feature breaks if missing**: Deploying to Cloudflare Pages uses sandbox URL boundary mode.

---

## 💻 5. Application Server Configuration

### 5.1 Server Port (`PORT`)
- **Name / Purpose**: Port number for backend Express REST API server listener.
- **Exact `.env` Variable**: `PORT`
- **Where to paste it**: `server/.env`
- **Example Format**: `PORT=5000`
- **Required / Optional**: Optional (Defaults to `5000`).

---

### 5.2 Frontend Public App Name (`VITE_APP_NAME`)
- **Name / Purpose**: Public application branding name displayed in client browser tabs and headers.
- **Exact `.env` Variable**: `VITE_APP_NAME`
- **Where to paste it**: `.env` (Root directory)
- **Example Format**: `VITE_APP_NAME="GundamDev"`
- **Required / Optional**: Optional (Defaults to `"GundamDev"`).

---

## 📜 Complete `.env` Templates

### Frontend Configuration File: `.env` (Root)
```env
# GundamDev Public Frontend Configuration (NO SECRETS HERE)
VITE_APP_NAME="GundamDev"
```

### Backend Configuration File: `server/.env`
```env
# GundamDev Server Environment Configuration (NEVER EXPOSE TO CLIENT)
PORT=5000
DATABASE_URL="postgres://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Server Cryptographic Keys
JWT_SECRET="c8d4e2f9a1b3c5d7e9f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6"
VAULT_MASTER_KEY="a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"

# GitHub OAuth Application Credentials
GITHUB_CLIENT_ID="Ov23liXXXXXXXXXXXXXX"
GITHUB_CLIENT_SECRET="4a8b1c2d3e4f567890abcdef1234567890abcdef"
GITHUB_CALLBACK_URL="http://localhost:5000/api/github/callback"

# Optional Deployment Provider Credentials
NETLIFY_AUTH_TOKEN="nfp_a1b2c3d4e5f67890123456789abcdef"
CLOUDFLARE_API_TOKEN="c2FtcGxlX2Nsb3VkZmxhcmVfYXBpX3Rva2VuXzEyMw"
CLOUDFLARE_ACCOUNT_ID="1234567890abcdef1234567890abcdef"
```

---

## 🚀 Setup Checklist (From Zero → Fully Running)

1. [ ] **Clone/Open Project Directory**: `cd "D:\Antigravity IDE\prjects djs\GundumIDE"`
2. [ ] **Install Dependencies**: `npm install`
3. [ ] **Create Root `.env`**: Copy public configuration above.
4. [ ] **Create `server/.env`**: Copy backend server configuration above.
5. [ ] **Generate Secrets**: Set random strings for `JWT_SECRET` and `VAULT_MASTER_KEY`.
6. [ ] **Supabase DB Setup**:
   - Create project at [Supabase](https://supabase.com).
   - Go to **SQL Editor** → Run schema from `server/schema.sql`.
   - Copy URI to `DATABASE_URL` in `server/.env`.
7. [ ] **GitHub OAuth Setup**:
   - Register OAuth App at [GitHub Developer Settings](https://github.com/settings/developers).
   - Set Callback URL to `http://localhost:5000/api/github/callback`.
   - Copy Client ID & Client Secret to `server/.env`.
8. [ ] **Start Backend**: `npm run server` (*Port 5000*)
9. [ ] **Start Frontend**: `npm run dev` (*Port 3000*)
10. [ ] **Verify**: Open `http://localhost:3000`, register an account, create a workspace, and connect GitHub!
