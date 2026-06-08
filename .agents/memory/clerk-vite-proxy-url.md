---
name: Clerk proxy URL in Vite production builds
description: How to correctly inject VITE_CLERK_PROXY_URL at production build time using REPLIT_DOMAINS
---

## Rule

To set `VITE_CLERK_PROXY_URL` for production Vite builds, assign to `process.env.VITE_CLERK_PROXY_URL` **before** the `defineConfig(...)` export in `vite.config.ts`. Do NOT use `define: { "import.meta.env.VITE_CLERK_PROXY_URL": ... }` — it conflicts with Vite's own `VITE_*` env-var processing pipeline and silently produces wrong or empty values.

```typescript
// vite.config.ts — before export default defineConfig({...})
if (process.env.NODE_ENV === "production" && process.env.REPLIT_DOMAINS && !process.env.VITE_CLERK_PROXY_URL) {
  const firstDomain = process.env.REPLIT_DOMAINS.split(",")[0].trim();
  process.env.VITE_CLERK_PROXY_URL = `https://${firstDomain}/api/__clerk`;
}
```

**Why:** `VITE_CLERK_PROXY_URL` is empty in dev (intentional) and must be auto-populated for prod. Replit's deploy system does NOT inject it automatically — it must be derived at build time from `REPLIT_DOMAINS`. Using `define` on `import.meta.env.*` keys creates a double-replacement conflict inside Vite.

**How to apply:** Any time Clerk is configured in a Replit Vite/React app and the production proxy URL needs to be set.
