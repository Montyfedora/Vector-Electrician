// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them
// manually or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection.
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// ---------------------------------------------------------------------------
// Deployment target
// ---------------------------------------------------------------------------
// Outside the Lovable sandbox, the bundled config SKIPS the Nitro deploy plugin
// unless we explicitly enable it. We turn it on here and pick the preset from
// NITRO_PRESET so the SAME codebase can target multiple hosts:
//
//   • Vercel (default here):  NITRO_PRESET=vercel  -> writes .vercel/output
//   • Cloudflare:             NITRO_PRESET=cloudflare-module
//   • Local Node preview:     NITRO_PRESET=node-server
//
// Vercel sets NITRO_PRESET=vercel automatically for Nitro projects, but we also
// default to it so `npm run build` produces a Vercel-ready bundle everywhere.
const preset = process.env.NITRO_PRESET || "vercel";

// The Vercel preset REQUIRES Nitro's native .vercel/output layout. The bundled
// Lovable config otherwise forces output into ./dist, which Vercel won't read,
// so we restore the correct paths per preset.
const output =
  preset === "vercel"
    ? {
        dir: ".vercel/output",
        serverDir: ".vercel/output/functions/__server.func",
        publicDir: ".vercel/output/static",
      }
    : {
        dir: "dist",
        serverDir: "dist/server",
        publicDir: "dist/client",
      };

export default defineConfig({
  // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR
  // error wrapper) so branded 500 pages work on every host, not just Cloudflare.
  tanstackStart: {
    server: { entry: "server" },
  },
  // Force-enable the Nitro deploy plugin with the chosen preset + output layout.
  // Cast: the bundled config's type omits Nitro's `vercel` option, but Nitro
  // supports it at runtime (it's spread into the function's .vc-config.json).
  nitro: {
    preset,
    output,
    // Article generation calls Claude and can take 30–60s. Vercel's default
    // serverless timeout (10s on Hobby) kills it mid-request, which made the
    // funnel hang on "Finalizing your custom article…". Raise the function
    // timeout so generation has time to complete. 60s is the Hobby ceiling;
    // Pro/Enterprise can go higher.
    vercel: {
      functions: {
        maxDuration: 60,
      },
    },
  } as Record<string, unknown>,
});
