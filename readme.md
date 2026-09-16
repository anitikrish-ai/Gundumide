# Gundumide

> A modern browser-based development workspace for creating, importing, editing, previewing, and publishing web projects.

<div align="center">

**Build. Edit. Preview. Publish.**

A Vite + React + TypeScript frontend paired with an Express backend for project management, authentication, file editing, ZIP imports, workspace builds, and deployment workflows.

</div>

## ✨ Highlights

- 🧩 **Project workspace** — create and manage web projects from one interface.
- 📁 **File management** — work with project files and folders directly in the workspace.
- 📦 **ZIP import** — import existing projects with archive validation and path-traversal protection.
- 🖥️ **Live workspace** — build projects through the backend workspace engine.
- 🔐 **Authentication** — registration, login, JWT sessions, and protected API routes.
- 🐙 **GitHub integration** — project workflows can connect to GitHub through the backend.
- 🚀 **Publishing workflows** — deployment integrations are handled by the server-side deployment layer.
- 🎨 **Modern UI** — React, Tailwind CSS, Lucide icons, and Framer Motion.
- 🗄️ **Persistent project data** — users, projects, files, secrets, deployments, and workspace jobs are handled by the backend data layer.

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 + PostCSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Database | SQLite / PostgreSQL support |
| Authentication | JWT + bcryptjs |
| Archive handling | JSZip + Multer |
| Integrations | GitHub, Netlify, Cloudflare, Supabase |

## 📂 Project Structure

```text
Gundumide/
├── src/                  # React frontend
│   ├── components/       # UI and application views
│   ├── context/          # Auth, project and workspace state
│   ├── services/         # API/client services
│   ├── styles/           # Global styles
│   ├── theme/            # Theme configuration
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Application shell
│   └── main.tsx          # Frontend entry point
├── server/               # Express backend and data layer
├── dist/                 # Generated frontend production output
├── index.html            # Vite HTML entry
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
├── package.json          # Scripts and dependencies
├── SETUP.md              # General setup documentation
└── API-SETUP.md          # API/backend setup documentation
```

## 🚀 Local Development

### Requirements

- Node.js 20+ recommended
- npm
- A configured backend environment for authenticated/API features

### Install

```bash
npm install
```

### Start the frontend

```bash
npm run dev
```

The Vite development server runs on port `3000` and proxies `/api` requests to the local Express server on port `5000`.

### Start the backend

In another terminal:

```bash
npm run server
```

### Production build

```bash
npm run build
```

The frontend production build is generated in `dist/`.

## 🌐 Netlify Deployment

The included `netlify.toml` is configured for the Vite frontend:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback: routes are served through `index.html`
- Node runtime: Node 20

### Important backend note

Gundumide is **not frontend-only**. The Express server handles authentication, project APIs, ZIP processing, workspace/build execution, database access, and deployment operations.

Netlify can host the Vite frontend, but the existing Express backend should be deployed to a compatible Node.js backend service for the full application.

After deploying the backend, configure API routing so `/api/*` reaches that backend. Keep JWT, database, GitHub, Netlify, and Cloudflare secrets on the server only.

### Connecting the Netlify frontend to the Render (or other) backend

The frontend calls the backend through a single configurable base URL
(`src/config.ts`, reads `VITE_API_URL`). In Netlify, go to **Site settings →
Environment variables** and add:

```
VITE_API_URL=https://your-backend.onrender.com/api
```

Then trigger a redeploy (this is a build-time value, baked into the static
bundle, so it only takes effect on the next build). If it's left unset, the
app falls back to relative `/api/...` requests, which only work when the
frontend and backend share an origin — not the case for a Netlify + Render
split.

Also make sure the backend's `GITHUB_CALLBACK_URL` (set on Render) points at
the Render URL, e.g. `https://your-backend.onrender.com/api/github/callback`,
and that this exact URL is registered as the callback URL on your GitHub
OAuth App — a mismatch here is the most common reason "Connect GitHub" fails
in production even after the API routing above is fixed.

## 🔐 Environment Variables

Backend secrets are server-side only. Depending on enabled features, the backend may use:

```env
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
VAULT_MASTER_KEY=replace-with-a-long-random-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://your-backend.example.com/api/github/callback
NETLIFY_AUTH_TOKEN=your-netlify-token
CLOUDFLARE_API_TOKEN=your-cloudflare-token
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
```

Never commit real credentials or tokens to GitHub.

## 🛡️ Security

The backend includes protected API routes, JWT authentication, password hashing, archive path sanitization, upload limits, and server-side secret handling.

For production, use strong random secrets and keep the backend environment private.

## 📖 Documentation

- [`SETUP.md`](./SETUP.md) — project setup and configuration
- [`API-SETUP.md`](./API-SETUP.md) — API and integration setup

## 📜 Scripts

```text
npm run dev       Start Vite development server
npm run server    Start Express backend
npm run build     Type-check and create production frontend build
npm run lint      Run ESLint
npm run preview   Preview the production Vite build
```

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the build and lint checks.
5. Open a pull request with a clear description.

## 📄 License

No license file is currently declared in the repository. Until a license is added, the source should be treated as **all rights reserved**.

---

<div align="center">

Built with ❤️ by **anitikrish-ai**

</div>
