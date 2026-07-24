// In dev, requests go through Vite's proxy to localhost:3001 (see vite.config.js).
// In production the client and server are deployed separately, so set
// VITE_API_URL (e.g. https://your-server.up.railway.app) as a Vercel env var.
export const API_BASE = import.meta.env.VITE_API_URL || '';
