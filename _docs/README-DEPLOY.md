# VortexDeep — deploying & pausing the site (start here)

Plain-language guide to the whole publish workflow: going live, pausing behind
a notice, maintenance mode, and the private preview. Nothing here is
destructive — every mode is just a setting plus a rebuild plus an upload.

If you only read one deploy doc, read this one. For depth on two specific
pieces, see the companions:

- **[`README-SITE-STATUS.md`](./README-SITE-STATUS.md)** — the three modes and the wording shown to visitors.
- **[`README-PREVIEW.md`](./README-PREVIEW.md)** — the keyed private preview, its security model, and the exact file layout.

---

## The one idea that makes this simple

There are **two independent choices**, and one fact that removes the fear:

1. **Which mode** the site is in — decided by a single setting,
   `siteStatus` in `src/content/settings/site.json`
   (or Tina → **Site Settings → "Site status"**).

2. **How you ship it** — decided by which command you run:
   `npm run build` or `npm run deploy`.

3. **Nothing is live until you upload.** `dist/` and `deploy/` are just folders
   on your Mac. The live site is *only* whatever sits in the Hostpoint web
   root. Building, renaming, or deleting these folders locally never touches
   the server — the site changes only when you upload.

---

## The three modes

Set by `siteStatus` in `src/content/settings/site.json`:

| `siteStatus` | What every visitor sees |
| --- | --- |
| `live` | The real, full public site. |
| `preparation` | One full-screen notice on **every** page: *"VortexDeep is in preparation and not yet commercially active."* (DE + EN). This is the RAV / Fachstelle wording. |
| `maintenance` | Same idea, notice reads *"undergoing maintenance, back shortly."* (DE + EN). |

When it isn't `live`, **every** address shows the notice — `/`, `/de`,
`/check`, `/de/check`, `/data`, `/de/data`. Nothing else stays reachable. The
notice keeps the animated background and sends `noindex, nofollow`.

---

## The two build commands (where the site is created)

| Command | Creates | What it is | Use when |
| --- | --- | --- | --- |
| `npm run build` | `dist/` | **One** build. Bakes in exactly what `site.json` says. `live` → the full site; `preparation`/`maintenance` → the notice everywhere. No hidden site, no preview. | You want the public to see exactly the current mode — including going fully public. |
| `npm run deploy` | `deploy/` | **Two** builds. The public notice **plus** the real site hidden in `deploy/_vd-live/`, reachable only through your `preview.php?k=…` link. Refuses to run unless `site.json` is `preparation` or `maintenance`. | You want the public paused behind the notice, but you can preview the real site live on the server. |

`npm run deploy` deliberately **refuses when `site.json` is `live`** — that's the
`Site status is "live"… use npm run build instead` message. It exists so the
"paused + preview" and "fully public" paths can never be confused.

---

## Recipes

Set the mode either in Tina (**Site Settings → Site status**, save) or by
editing `"siteStatus"` in `src/content/settings/site.json` directly. Then:

### A. Go fully public (activate)

```
1. Set siteStatus: "live"
2. npm run build
3. Upload the CONTENTS of dist/ to the Hostpoint web root
```

### B. Pause — simple (notice only, no preview for you)

```
1. Set siteStatus: "preparation"   (or "maintenance")
2. npm run build
3. Upload the CONTENTS of dist/ to the Hostpoint web root
```

### C. Pause — with your private preview (soft-launch)

```
1. Set siteStatus: "preparation"   (or "maintenance")
2. npm run deploy
3. Upload the CONTENTS of deploy/ to the Hostpoint web root
   (turn ON "show hidden files" — the .htaccess files must arrive)
4. Visit your preview link to see the real site:
      https://vortexdeep.ch/preview.php?k=YOUR-KEY
   Incognito / anyone else still sees the notice.
```

### D. Switch modes / bring it back later

Same loop: change `siteStatus`, rebuild with the matching command from the
table, re-upload. To go from a paused soft-launch back to fully public, set
`live`, run `npm run build`, upload `dist/`. The Tina admin at `/admin` is a
static file and is **never** hidden by any mode, so you can always get back in.

---

## The preview key

Only relevant to recipe C (`npm run deploy`).

| Command | What it does |
| --- | --- |
| `npm run preview:key` | Creates your key once → writes `public/preview-secret.php`, prints your private preview link. `npm run deploy` copies this file into `deploy/` automatically. |
| `npm run preview:key -- --force` | **Rotates** the key: generates a new one and instantly invalidates every pass already issued (your "log out everywhere"). Re-deploy and re-upload afterwards. |

The pass lasts 30 days. To stop previewing in your own browser:
`https://vortexdeep.ch/preview.php?logout=1` (this clears *your* cookie; it does
**not** invalidate the key — only `--force` does). Treat the link like a
password.

`public/preview-secret.php` is **server-only** and must sit in the Hostpoint web
root next to `preview.php`. It must **never** be committed (see the warning
below). If it isn't in your `deploy/`, generate it once with `npm run preview:key`
and upload it by hand.

---

## Uploading to Hostpoint

- Upload the **contents** of the folder (`dist/` or `deploy/`), not the folder
  itself — otherwise the site lands under `/dist/`.
- **Turn on "show hidden files"** in your FTP/SFTP client. `.htaccess` starts
  with a dot and is hidden by default; without it the preview gate won't work.
- If you earlier turned on Hostpoint password protection or a root-domain
  redirect, undo those (protection OFF, domain back to normal hosting) so the
  built page is what actually shows.

---

## Prerequisites (one-time, per machine)

These must be true for the commands above to work:

- `package.json` must contain the `deploy` and `preview:key` scripts, e.g.

  ```json
  "deploy":       "node scripts/build-deploy.mjs",
  "preview:key":  "node scripts/make-preview-key.mjs"
  ```

- A preview key must exist for recipe C — run `npm run preview:key` once.

---

## ⚠️ Repo hygiene that still needs doing

As of this writing the pushed repository does **not** match the security
housekeeping described in `README-PREVIEW.md`. Until fixed, treat the current
preview key as public:

- There is **no `.gitignore`**, and `dist/`, `dist-OLD/`, and `deploy/` are all
  committed (build output does not belong in git).
- `public/preview-secret.php` and `public/fitcheck-secret.php` are **committed
  to a public repo** — the preview key is readable by anyone. **Rotate it**
  (`npm run preview:key -- --force`) and stop tracking the secrets.

Suggested one-time fix:

```
# add a .gitignore containing:  dist/  dist-OLD/  deploy/  *-secret.php  .build-*/
git rm -r --cached dist dist-OLD deploy
git rm --cached public/preview-secret.php public/fitcheck-secret.php
git commit -m "Stop tracking build output and secrets; add .gitignore"
npm run preview:key -- --force   # rotate the exposed key
```

Removing the files does not erase them from **past commits** — rotating the key
is what actually protects you. `git filter-repo` (or making the repo private)
is optional cleanup afterwards.

---

## Where everything lives

| Thing | Location |
| --- | --- |
| Current mode | `src/content/settings/site.json` → `siteStatus` |
| The gate (swaps in the notice) | `src/layouts/Layout.astro` |
| The notice screen | `src/components/SiteStatusScreen.astro` |
| Fully-public build | `dist/` (from `npm run build`) |
| Paused + preview build | `deploy/` (from `npm run deploy`) |
| Real site inside the deploy | `deploy/_vd-live/` (Apache-denied; served only via the gate) |
| Preview endpoints | `public/preview.php`, `public/gate.php`, `public/preview-lib.php` |
| Preview key (server-only) | `public/preview-secret.php` |
| Deploy / key scripts | `scripts/build-deploy.mjs`, `scripts/make-preview-key.mjs` |

---

*Companion docs: [`README-SITE-STATUS.md`](./README-SITE-STATUS.md) ·
[`README-PREVIEW.md`](./README-PREVIEW.md) ·
[`README-MAINTENANCE.md`](./README-MAINTENANCE.md)*
