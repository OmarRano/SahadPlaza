/**
 * vite.config.ts — Root Vite configuration
 *
 * Architecture:
 *   - Express (server/_core/index.ts) starts the HTTP server
 *   - In development, Express calls setupVite() which embeds Vite as middleware
 *   - One process, one port (default 3000)
 *   - No separate "client dev server" needed — run `pnpm dev` from project root only
 *
 * Tailwind v3 via PostCSS (standard approach).
 * Removed private Manus plugins (vite-plugin-manus-runtime, jsxLocPlugin).
 */

import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@":       path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  // Vite's root is the client folder
  root:      path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),

  // Env files are loaded from the project root (where .env lives)
  envDir: path.resolve(import.meta.dirname),

  build: {
    outDir:     path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },

  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      // Allow imports from outside client/ (e.g. shared/)
      strict: false,
    },
  },

  css: {
    postcss: path.resolve(import.meta.dirname, "client/postcss.config.js"),
  },
});
