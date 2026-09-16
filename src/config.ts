/**
 * Central runtime configuration.
 *
 * When the frontend and backend are deployed together (or Vite's dev proxy
 * is in front of them), relative "/api" calls just work.
 *
 * When they are deployed separately — e.g. this frontend on Netlify and the
 * Express backend on Render — a relative "/api/..." request resolves against
 * the Netlify origin, which has no such route, so every request 404s (this
 * is why login, register, and GitHub import silently failed in production).
 *
 * Setting VITE_API_URL at build time (Netlify → Site settings → Environment
 * variables) to the deployed backend's URL, e.g.
 *   VITE_API_URL=https://your-app.onrender.com/api
 * fixes this without touching any API route or behavior. If it's not set,
 * everything falls back to the previous "/api" relative behavior, so local
 * dev (via the Vite proxy) and same-origin deployments are unaffected.
 */
const rawBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

// Strip any trailing slash so callers can safely do `${API_BASE_URL}/path`.
export const API_BASE_URL = rawBase ? rawBase.replace(/\/+$/, '') : '/api';
