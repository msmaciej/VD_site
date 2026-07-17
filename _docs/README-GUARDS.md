# VortexDeep — Fit Check guards

Three additive files. Nothing in the Fit Check logic was changed to add these.

- `FITCHECK-INVARIANTS.md`      — the plain-language contract for the Fit Check.
- `scripts/verify-fitcheck.mjs` — an automated check that fails loudly if any
                                   invariant breaks. Run: `node scripts/verify-fitcheck.mjs`
- `.gitignore`                  — you had none; this stops the secret, dist/, and
                                   the internal artifacts being (re)committed.

## What the guard checks
- On-site reveal is intact (`send-check.php` returns a result, isn't a link gate).
- The team email is still built and sent.
- No profile copy / bucket / matrix leaks into the built pages or JS.
- Honeypot/timing stay soft flags.
- The signing secret isn't committed; internal artifacts aren't web-served.

Proven to work: it PASSES on the restored on-site flow and FAILS — naming the
exact problem — on the verify-by-link version and on the committed secret.

## Three things to fix in the repo (surfaced by the guard)
1. **Make the GitHub repo private** — simplest blanket fix; closes 2 and 3 at once.
2. **Remove the signing secret from the repo.** `public/fitcheck-secret.php` and
   `dist/fitcheck-secret.php` hold a real 96-char key. The on-site flow doesn't
   use it. Remove from version control (server-only), rotate if reused anywhere.
3. **Remove the internal matrix/personas files** from the public repo
   (`_VortexDeep-fit-matrix-internal.svg/.png`, `_VortexDeep_Personas_Canvas.md`)
   — or rely on making the repo private.

## Enforce automatically (optional)
Change the build script in package.json to:
`"build": "node scripts/gen-fitcheck-profiles.mjs && astro build && node scripts/verify-fitcheck.mjs"`
Then a regression fails the build instead of shipping.
