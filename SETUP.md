# GundamDev — Comprehensive Setup & Architecture Guide

Welcome to **GundamDev** — a mobile-first, multi-user, persistent cloud development platform. This guide provides exact instructions for environment configuration, database setup, cryptographic secret generation, GitHub OAuth, deployment provider integration, local execution, and verification.

---

## 📋 System Requirements

Verify Node.js and npm versions before proceeding:
```bash
node -v  # Supported: Node.js v18.0.0+ / v20+ / v24+
npm -v   # Supported: npm v9.0.0+ / v10+
```

---

## 📁 1. Project Directory & Installation

Navigate to your project directory and install dependencies:
```bash
cd "D:\Antigravity IDE\prjects djs\GundumIDE"
npm install
```

---

## 🗄 2. Database Architecture (Supabase PostgreSQL vs Local Fallback)

GundamDev supports two database modes:

### Production Mode: Supabase PostgreSQL (Intended Architecture)
- **Engine**: Supabase PostgreSQL Cloud Database.
- **Connection Variable**: Set `DATABASE_URL` or `SUPABASE_DATABASE_URL` in `server/.env`.
- **Schema & Migrations**: Defined in [`server/schema.sql`](file:///d:/Antigravity%20IDE/prjects%20djs%20/GundumIDE/server/schema.sql).
- **Setup Instructions**:
  1. Create a project at [Supabase](https://supabase.com).
  2. Open **SQL Editor** → Run the SQL script in `server/schema.sql`.
  3. Go to **Project Settings** → **Database** → Copy the **URI Connection String**.
  4. Paste into `server/.env` as `DATABASE_URL`.

### Local Development Fallback: SQLite
- **Engine**: Disk-backed SQLite database via `better-sqlite3` ([`server/db.ts`](file:///d:/Antigravity%20IDE/prjects%20djs%20/GundumIDE/server/db.ts)).
- **Storage Location**: Auto-created at `server/data/gundamdev_relational.sqlite`.
- **Active When**: `DATABASE_URL` is empty or not set to a `postgres://` connection string.

---

## 🔑 3. Environment & Credentials Breakdown

### Frontend Configuration (`.env` in Root Directory)
*Contains **ONLY** public non-sensitive configuration exposed to the browser bundle.*

| Variable Name | Required/Optional | Description & Purpose | Where to Paste | Example Value |
|---|---|---|---|---|
| `VITE_APP_NAME` | Optional | Public app branding displayed in title bars | `.env` (Root) | `VITE_APP_NAME="GundamDev"` |

> [!CAUTION]
> **NEVER** expose `JWT_SECRET`, `VAULT_MASTER_KEY`, `GITHUB_CLIENT_SECRET`, or provider API keys in the root `.env` file or prefix them with `VITE_`.

---

### Backend Server Configuration (`server/.env` in `server/` Directory)
*Server-only environment variables. Never committed to Git or exposed to client browsers.*

| Credential / Variable | Required / Optional | Where to Obtain | Exact `.env` Variable Name | Where to Paste | Feature that Requires It |
|---|---|---|---|---|---|
| **Database Connection URI** | Required for Prod | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → Database | `DATABASE_URL` | `server/.env` | Persistent Supabase PostgreSQL multi-user storage |
| **JWT Signing Secret** | **REQUIRED** | Self-generated: Run `openssl rand -hex 32` | `JWT_SECRET` | `server/.env` | Server user authentication & session JWT verification |
| **Vault Encryption Key** | **REQUIRED** | Self-generated: Run `openssl rand -hex 32` | `VAULT_MASTER_KEY` | `server/.env` | AES-256-GCM encryption of stored GitHub tokens & secrets |
| **GitHub Client ID** | Required for Git | [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps | `GITHUB_CLIENT_ID` | `server/.env` | GitHub OAuth authorization flow |
| **GitHub Client Secret** | Required for Git | [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps | `GITHUB_CLIENT_SECRET` | `server/.env` | Server-side OAuth token exchange |
| **GitHub Callback URL** | **REQUIRED** | Must match exact backend route | `GITHUB_CALLBACK_URL` | `server/.env` & GitHub Settings | GitHub OAuth redirect verification |
| **Netlify Auth Token** | Optional | [Netlify User Settings](https://app.netlify.com/user/settings) → Personal Access Tokens | `NETLIFY_AUTH_TOKEN` | `server/.env` | Production edge deployments to Netlify |
| **Cloudflare API Token** | Optional | [Cloudflare Dashboard Profile](https://dash.cloudflare.com/profile/api-tokens) | `CLOUDFLARE_API_TOKEN` | `server/.env` | Production deployments to Cloudflare Pages |
| **Cloudflare Account ID** | Optional | [Cloudflare Dashboard Overview](https://dash.cloudflare.com/) | `CLOUDFLARE_ACCOUNT_ID` | `server/.env` | Cloudflare Pages account routing |
| **Server Listener Port** | Optional | Self-defined (Default: `5000`) | `PORT` | `server/.env` | Express REST API server port listener |

---

## 🐙 4. GitHub OAuth Application Registration

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**.
2. Configure settings:
   - **Application Name**: `GundamDev Mobile Cloud IDE`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization Callback URL**: `http://localhost:5000/api/github/callback`
3. Click **Register application**.
4. Copy **Client ID** → Paste into `GITHUB_CLIENT_ID` in `server/.env`.
5. Click **Generate a new client secret** → Paste into `GITHUB_CLIENT_SECRET` in `server/.env`.

---

## 🚀 5. Running GundamDev Locally

### Terminal 1: Backend Server Engine
Start the Node.js Express REST API server:
```bash
npm run server
```
*Listens on `http://localhost:5000`*

### Terminal 2: Frontend Web Client
Start the Vite development web server:
```bash
npm run dev
```
*Listens on `http://localhost:3000`*

---

## 🧪 6. Complete Verification Test Protocol

1. **Authentication & Multi-User Isolation**:
   - Open `http://localhost:3000`. Register account `alice@gundamdev.io`.
   - Create project `Alice Project`.
   - Open an incognito browser window and register `bob@gundamdev.io`.
   - Verify Bob's dashboard is empty and Bob cannot access Alice's project endpoint.

2. **File Persistence & Editor**:
   - Create a file `src/App.jsx` in Alice's workspace, edit content, and click **Save**.
   - Refresh browser; verify file content persists across reloads.

3. **Encrypted Secret Vault**:
   - In workspace, open **Secrets** tab. Add key `API_KEY` with value `sk_test_123`.
   - Verify value is encrypted on server (`aes-256-gcm`) and displayed as masked bullets `••••••••`.

4. **ZIP Archive Import Security**:
   - On dashboard, click **Import ZIP**.
   - Upload a `.zip` archive.
   - Verify path traversal checks reject unsafe paths (`..`, null-bytes) and extract cleanly to workspace database.

5. **Workspace Build & Instant Preview**:
   - In workspace, switch to **Preview** tab. Click **Run**.
   - Verify live preview iframe renders correctly and logs display in **Logs** tab.

---

## 🔧 7. Troubleshooting Guide

| Symptom | Probable Cause | Corrective Action |
|---|---|---|
| `better-sqlite3` build error | Missing C++ build tools on Windows | Run `npm rebuild better-sqlite3` or install VS Build Tools. |
| `GitHub OAuth Exchange Failed` | Mismatched callback URL | Ensure callback URL in GitHub App matches `http://localhost:5000/api/github/callback`. |
| `401 Unauthorized` | Expired session token | Re-login to issue a fresh JWT bearer token. |
| `EADDRINUSE: port 5000 in use` | Conflicting process | Set `PORT=5001` in `server/.env` or kill process on port 5000. |

---

## 📋 Credentials Checklist

Before starting the full platform, ensure you have obtained and set:

- [ ] **Generating cryptographic keys**: Run `openssl rand -hex 32` twice to create `JWT_SECRET` and `VAULT_MASTER_KEY`.
- [ ] **Supabase PostgreSQL URI**: From [Supabase Dashboard](https://supabase.com/dashboard) (for cloud production persistence).
- [ ] **GitHub OAuth Client ID & Secret**: From [GitHub Developer Settings](https://github.com/settings/developers).
- [ ] **Exact Callback URL set**: `http://localhost:5000/api/github/callback` in GitHub OAuth App settings.
- [ ] *(Optional)* **Netlify Personal Access Token**: From [Netlify User Settings](https://app.netlify.com/user/settings).
- [ ] *(Optional)* **Cloudflare API Token & Account ID**: From [Cloudflare Dashboard](https://dash.cloudflare.com/).
