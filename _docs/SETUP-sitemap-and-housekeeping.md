# Drift-proof sitemap + housekeeping (matches your _docs/ layout)

## A. Drift-proof sitemap (replaces the hand-written one)
The sitemap is now AUTO-GENERATED on every build by the @astrojs/sitemap
integration — all real routes, EN/DE hreflang, /admin excluded. Add a page and
it appears automatically; it can't drift out of date.

Files changed:
- `astro.config.mjs`   — registers the sitemap integration (i18n + admin filter)
- `package.json`       — adds "@astrojs/sitemap": "3.2.1"  (EXACT pin — see note)
- `public/robots.txt`  — points at the generated /sitemap-index.xml

**Do these three things after copying the files in:**
1. `npm install`   (installs @astrojs/sitemap 3.2.1)
2. **Delete the old hand-written sitemap** so it doesn't linger as a stale
   duplicate:  remove `public/sitemap.xml` (and `dist/sitemap.xml`) from the repo.
3. `npm run build`, then upload `dist/`. You'll now have `dist/sitemap-index.xml`
   and `dist/sitemap-0.xml`.

> ⚠ VERSION PIN: keep it at exactly `3.2.1`, NOT `^3.2.1`. Version 3.3+ requires
> Astro 5; you're on Astro 4, and 3.3+ breaks the build (`_routes` undefined).
> When you upgrade Astro to 5 later, you can move to the latest sitemap.

## B. Corrected .gitignore (paths now point at _docs/)
`.gitignore` — updated so the internal artifacts match their new `_docs/` home,
plus node_modules / .astro / dist / the signing secret. Note: .gitignore only
stops FUTURE commits — files already committed stay until you untrack them
(GitHub web UI delete, or `git rm --cached ...`; commands are in the file).

## C. Guard updated for the move
`scripts/verify-fitcheck.mjs` — now finds the internal artifacts under `_docs/`
(by filename, so a future move won't blind it). Run: `node scripts/verify-fitcheck.mjs`.

## Still outstanding (unchanged by this drop)
The signing secret is still committed (`public/fitcheck-secret.php`,
`dist/fitcheck-secret.php`). The on-site Fit Check doesn't use it — simplest is
to delete it from the repo and the server. The guard will keep failing until
it's gone. (site-tree.txt is harmless — ignore it.)
