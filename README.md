# VortexDeep — website

The bilingual (EN / DE) marketing site for **VortexDeep** — practical AI
automation for small and mid-sized companies, from Zürich, Switzerland.

It is a statically-built Astro site with a TinaCMS admin for editing content, a
theme system, optional WebGL animated backgrounds, and an interactive **Fit
Check** tool backed by a few PHP endpoints on the host. English lives at `/`,
German at `/de/`.

> **Origin / history.** This project was bootstrapped from a small Astro + Tina
> "zen gallery" starter (the old *ARTMJS* one-pager) and has since been fully
> repurposed into the VortexDeep site. A few leftovers from that starter still
> exist and are harmless — the npm package name in `package.json` is still
> `artmjs-zen`, and there is an **optional** art-gallery block (`ArtCard`,
> `src/content/art/*`) that the homepage can switch on but normally doesn't.
> Treat *VortexDeep* as the subject of everything below; the gallery is just a
> feature that happens to be available.

---

## 1. Stack

- **Astro `^4.16`** — static site generator (output is plain HTML/CSS/JS).
- **Tailwind CSS `^3.4`** via `@astrojs/tailwind`.
- **TinaCMS `^1.6`** (`@tinacms/cli`) — the visual admin for editing content;
  used only in dev/admin, it does **not** ship to the live site.
- **three.js `^0.169`** — the animated backgrounds (depth network / planetary).
- **React 18** — a dependency of TinaCMS (the site itself is Astro, not React).
- **PHP** — small server-side endpoints for the Fit Check flow, run by Hostpoint.
- Native **Astro i18n** — `en` (default, at `/`) and `de` (at `/de/`).

Config: `astro.config.mjs` (site URL, Tailwind, i18n) and `tailwind.config.mjs`.

---

## 2. Commands

Run these from the project root (`npm install` once first).

| Command | What it does |
| --- | --- |
| `npm run dev` | Local preview at `http://localhost:4321` (no admin). |
| `npm run admin` | Site **plus** the TinaCMS admin at `http://localhost:4321/admin`. |
| `npm run build` | Generates Fit Check profiles, then builds the static site into `dist/`. |
| `npm run preview` | Serves the built `dist/` locally to check it before upload. |
| `npm run tree` | Regenerates `site-tree.txt` (a map of the project). |
| `npm run clean` | Resets Tina's generated files and restarts the admin. |
| `Ctrl + C` | Stops whatever is running in the terminal. |

`npm run build` = `node scripts/gen-fitcheck-profiles.mjs && astro build`. The
profile-generation step must run before the build, which is why it's baked into
the script.

---

## 3. Project structure

```
VD_site/
├── astro.config.mjs          # Astro config: site URL, Tailwind, EN/DE i18n
├── tailwind.config.mjs       # Tailwind config
├── package.json              # Dependencies & the scripts above
├── site-tree.txt             # Generated map (npm run tree)
│
├── src/
│   ├── pages/                # Routes (one folder = the URL structure)
│   │   ├── index.astro          # EN home  →  /
│   │   ├── check.astro          # EN Fit Check  →  /check
│   │   ├── [dataPage].astro     # EN data page  →  /data
│   │   └── de/                   # German mirror: /de, /de/check, /de/data
│   │
│   ├── components/
│   │   ├── SitePage.astro          # Assembles the main scroll page (EN + DE share it)
│   │   ├── Hero.astro              # Header / statement block
│   │   ├── Fold.astro              # Reveal-on-click ("fold") behaviour
│   │   ├── LanguageSwitcher.astro  # EN ⇄ DE toggle
│   │   ├── DepthNetworkBackground.astro     # three.js: drifting node field
│   │   ├── PlanetarySystemsBackground.astro # three.js: orbiting systems
│   │   ├── SiteStatusScreen.astro  # In-preparation / maintenance notice (see §7)
│   │   └── ArtCard.astro           # Optional art-gallery card (legacy feature)
│   │
│   ├── layouts/
│   │   └── Layout.astro         # Global <head>, SEO/OG, themes, and the site-status gate
│   │
│   ├── content/                # TinaCMS-editable data (JSON)
│   │   ├── settings/site.json     # Global settings: name, theme, backgrounds, site status…
│   │   ├── pages/{en,de}/*.json   # Home-page block configuration per language
│   │   ├── dataPage/{en,de}.json  # The /data page content + on/off switch
│   │   ├── fitcheck/config.json   # Fit Check configuration
│   │   └── art/*.json             # Optional gallery fragments (legacy)
│   │
│   ├── utils/siteHelpers.ts    # Theme colour table + font/colour helpers
│   ├── i18n/ui.ts              # Static UI labels that exist in both languages
│   └── env.d.ts
│
├── public/                   # Copied verbatim into dist/ (served as-is)
│   ├── admin/                   # Built TinaCMS admin (reachable at /admin)
│   ├── images/                  # Logos, favicons, background image
│   ├── favicon.svg, robots.txt, sitemap.xml
│   └── *.php                    # Fit Check server endpoints (see §6)
│
├── scripts/
│   ├── gen-fitcheck-profiles.mjs  # Runs during build (generates profile data)
│   └── verify-fitcheck.mjs        # Sanity-checks the Fit Check contract
│
├── tina/                     # TinaCMS schema
│   ├── config.ts                # All admin fields (Site Settings, page sections…)
│   └── __generated__/           # Auto-generated by Tina — do not hand-edit
│
├── _docs/                    # Plain-language operating notes (see §8)
└── dist/                     # Build output — this is what gets uploaded to Hostpoint
```

---

## 4. Editing content (TinaCMS)

Content is not hard-coded — it lives in `src/content/*` as JSON and is edited
through the Tina admin (`npm run admin` → `/admin`). The schema for every
editable field is defined in `tina/config.ts`.

Two languages are kept as parallel content: `pages/en/` and `pages/de/`,
`dataPage/en.json` and `dataPage/de.json`, plus `_de` sibling fields inside
`settings/site.json` (e.g. `subSiteName` / `subSiteName_de`). Static UI words
that appear in both languages (button labels, section tags) live in code at
`src/i18n/ui.ts`, not in Tina.

After any content change you must **rebuild and re-upload** — see §5. Editing in
Tina alone does not update the live site, because the live site is static.

---

## 5. Build & deploy (Hostpoint)

1. `npm run build` → produces `dist/`.
2. Upload the contents of `dist/` to the site's web root on Hostpoint
   (`~/www/vortexdeep.ch/`).
3. The `.php` files in `dist/` run server-side on Hostpoint (it supports PHP);
   the rest is static HTML/CSS/JS.

The site is static, so there is no Node server in production — Hostpoint just
serves files. That also means Tina's admin, `three`, and the whole `node_modules`
toolchain stay on your machine and never ship.

---

## 6. Fit Check

`/check` (and `/de/check`) is an interactive qualifier. Its content is
configured in `src/content/fitcheck/config.json` and its schema in
`tina/fitcheck-schema.ts`. Build-time data is produced by
`scripts/gen-fitcheck-profiles.mjs`; the PHP files in `public/` handle the
server side (`send-check.php`, `confirm.php`, `get-math.php`, plus
`fitcheck-lib.php` / `fitcheck-profiles.gen.php`).

**Rule of thumb:** after any change near the Fit Check, run
`node scripts/verify-fitcheck.mjs` — it fails loudly if the on-site reveal, the
team email, or the leak rule regress. Full contract: `_docs/README-FITCHECK-INVARIANTS.md`.

---

## 7. Site status — pausing the public site

**Site Settings → "Site status"** in Tina has three positions:

- **Live** — the normal site.
- **In preparation** — the entire public site is replaced by a single
  full-screen notice ("VortexDeep is in preparation and not yet commercially
  active — no customer orders, no invoicing, no revenue", DE + EN).
- **Maintenance** — the same, with "temporarily offline, back shortly" wording.

When it isn't Live, **every** route (home, `/de`, `/check`, `/data`, …) shows
that one notice — nothing else stays reachable — and the notice keeps the site's
own animated background and sends `noindex`. The Tina admin at `/admin` is never
gated, so you can always switch back to Live. Flip the setting (or edit
`siteStatus` in `src/content/settings/site.json`), then rebuild and upload.

Full how-to: `_docs/README-SITE-STATUS.md`. The moving parts are
`Layout.astro` (the gate) and `SiteStatusScreen.astro` (the notice).

---

## 8. Docs & guardrails (`_docs/`)

- `README-SITE-STATUS.md` — the in-preparation / maintenance switch (§7).
- `README-ANIMATIONS.md` — how the animation toggles and backgrounds behave.
- `README-FITCHECK.md` / `README-FITCHECK-INVARIANTS.md` — the Fit Check flow and
  the contract that must not regress.
- `README-GUARDS.md` — repo guards (e.g. the committed-secret check).
- `README-MAINTENANCE.md` — dependency hygiene. **Two pins that must not drift:**
  `@astrojs/sitemap` stays exactly `3.2.1` (3.3+ needs Astro 5), and never run
  `npm audit fix --force`. Read before touching dependencies.
- `SETUP-sitemap-and-housekeeping.md` — sitemap setup and housekeeping.
- `_VortexDeep_Personas_Canvas.md` and the fit-matrix images — strategy/reference.

---

## 9. Themes & backgrounds (quick reference)

Eight named themes (`light, dark, paper, stone, mist, ink, sand, deep`; default
is `deep`) defined in `src/layouts/Layout.astro` and `src/utils/siteHelpers.ts`,
with an optional visitor sun/moon toggle. One animated background can run at a
time — **Depth network** or **Planetary systems** (both three.js) — or none.
All of it is set in **Site Settings** without touching code.
