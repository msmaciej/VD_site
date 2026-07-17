# VortexDeep — maintenance notes (read before touching dependencies)

Short, plain-language reminders so a future change doesn't quietly break a
working build. None of this is urgent; it's here so it isn't rediscovered the
hard way.

## Dependencies & `npm audit`

- **`npm audit` is just a report.** It changes nothing — safe to run any time to
  look at what it flags.
- **Do NOT run `npm audit fix --force`.** "Force" bumps packages across major
  versions (breaking changes allowed) and is the most likely way to break the
  build — e.g. jumping Astro or a plugin a major version.
- **`npm audit fix` (no --force)** usually only patches within allowed ranges,
  but it can still nudge versions and rewrite the lockfile. Given the pins below,
  don't run it casually — address advisories one at a time, deliberately.
- **The scary count is dev-tooling, not the live site.** Most/all advisories come
  from TinaCMS and build-time tooling that run on the laptop during `npm run
  build`. What ships is the static output in `dist/` (HTML/CSS/JS + PHP), which
  doesn't carry those packages. A "critical" in `npm audit` ≠ a hole a visitor
  can reach.

## Version pins that must not drift

- **`@astrojs/sitemap` is pinned to EXACTLY `3.2.1`** (no caret) in
  `package.json`. Version 3.3+ requires **Astro 5**; this project is on **Astro
  4**, and 3.3+ breaks the build (`_routes` undefined). Only move off 3.2.1 when
  you upgrade Astro to 5 — then take the latest sitemap at the same time.

## The rule that prevents the "cannot find module" scare

- Any time `astro.config.mjs` or `package.json` gains a new package, run
  **`npm install` first, then `npm run build`.** The install puts the dependency
  on disk; the build only uses it. A red "Cannot find module …" wall almost
  always just means "haven't installed yet."

## Fit Check — the one-line reminder

- After ANY change near the Fit Check, run **`node scripts/verify-fitcheck.mjs`**.
  It fails loudly if the on-site reveal, the team email, or the leak rule regress.
  Full contract: see `FITCHECK-INVARIANTS.md`.

## Still open (housekeeping, not blocking)

- The signing secret is still committed (`public/fitcheck-secret.php`,
  `dist/fitcheck-secret.php`). The on-site flow doesn't use it — cleanest is to
  delete it from the repo and the server. The guard flags it until it's gone.
