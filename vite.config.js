import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// The backend sets HTTP-only cookies. In development we proxy /api to the
// backend so the browser sees a single origin and cookies work without CORS.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_PROXY_TARGET || "http://localhost:8000";

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_DEV_PORT) || 3000,
      proxy: {
        "/api": { target, changeOrigin: true },
      },
    },
    preview: {
      port: Number(env.VITE_DEV_PORT) || 3000,
      proxy: {
        "/api": { target, changeOrigin: true },
      },
    },
  };
});
