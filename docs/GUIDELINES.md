Follow these guideline:

SSR Auth methodology: Use @supabase/ssr clients stored in utils/supabase/server.ts and utils/supabase/client.ts, and always refresh sessions in the root middleware.ts via createMiddlewareClient (utils/supabase/middleware.ts) as outlined in Supabase’s Next.js Server‑Side Auth guide.

Project structure guideline: Pages & layouts live in src/app, feature APIs in src/app/api/\*, shared utilities in src/utils, global middleware at src/middleware.ts, static assets in public, and all root‑level configs (next.config.ts, flake.nix, etc.) stay at the repo root — Cursor can rely on this layout even as features grow.

Middleware path protection guideline: List all authenticated routes in a PROTECTED_PATHS array inside src/middleware.ts; refresh the Supabase session and enforce redirects only when the incoming pathname starts with one of those paths. Public pages like /, /login, etc. are implicitly excluded, so the matcher can be kept minimal (just filter static assets) or removed if not needed.

Styling guideline (Tailwind & component libraries): Keep base styles in src/app/globals.css; declare design tokens as CSS variables on :root (and dark mode overrides) and surface them via tailwind.config.ts theme.extend. Use Tailwind utility classes for layout & spacing; prefer shadcn/ui primitives for accessible, composable components and wrap them under src/components/ui/\*. When daisyUI is needed, enable only required themes in tailwind.config.ts and avoid mixing multiple libraries within a single feature. Always merge incoming className props with a local cn/clsx helper for predictable overrides.

Commit convention: follow Conventional Commits to power automated changelogs.

Environment variables: contract typed in env.d.ts; secrets only in .env.\*, never in code.

Documentation: keep high‑level docs in /docs and update GUIDELINES.md whenever patterns evolve.
