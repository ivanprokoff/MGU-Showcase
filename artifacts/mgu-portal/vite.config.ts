import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

// In production, derive the Clerk proxy URL from REPLIT_DOMAINS so the static
// build knows where to forward Clerk FAPI requests. In dev, leave it empty —
// Clerk talks directly to its FAPI using the test key.
// NOTE: must assign to process.env so Vite picks it up through its own VITE_*
// env-var pipeline — using `define` for import.meta.env.* conflicts with that pipeline.
if (process.env.NODE_ENV === "production" && process.env.REPLIT_DOMAINS && !process.env.VITE_CLERK_PROXY_URL) {
  const firstDomain = process.env.REPLIT_DOMAINS.split(",")[0].trim();
  process.env.VITE_CLERK_PROXY_URL = `https://${firstDomain}/api/__clerk`;
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss({ optimize: false }),
    runtimeErrorOverlay(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Витрина услуг МГУ",
        short_name: "Витрина МГУ",
        description: "Витрина студенческих услуг МГУ им. М.В. Ломоносова",
        theme_color: "#1e3a5f",
        background_color: "#1e3a5f",
        display: "standalone",
        orientation: "portrait",
        start_url: basePath,
        scope: basePath,
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallback: null,
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
