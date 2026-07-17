# VortexDeep — Website

The marketing site for **VortexDeep** — practical, human-in-the-loop AI automation
for small and mid-sized companies. Grounded in Zürich, Switzerland; serving clients
worldwide.

Live at **[vortexdeep.ch](https://vortexdeep.ch)** · EN at `/`, DE at `/de/`.

> **Note on history:** this repository began life from an Astro one-pager template
> (internally "ARTMJS / Zen Gallery"). It has since been rebuilt into the VortexDeep
> site. A few template artefacts may still linger in the tree (e.g. the legacy
> `art/` content collection and `ArtCard.astro`); they are inert and slated for
> removal. Nothing below refers to the old template — this README describes the
> site as it actually is today.

---

## 1. What this is & stack

A fast, content-managed marketing site with one interactive feature — the **Fit
Check** lead assessment. Static-first for speed and resilience; a thin PHP layer
on the host powers the Fit Check without any database.

- **Framework:** [Astro 4](https://astro.build) — static output, minimal client JS.
- **Styling:** Tailwind CSS. Default font preset: IBM Plex Mono; "deep" dark theme.
- **Content editing:** [TinaCMS](https://tina.io) — visual editing of page copy,
  settings, and Fit Check profile text via `npm run admin`.
- **Backgrounds:** Three.js animated backdrops (`DepthNetworkBackground`,
  `PlanetarySystemsBackground`).
- **Internationalisation:** built-in Astro i18n — `en` (default, no prefix) and
  `de` (under `/de/`).
- **Fit Check backend:** plain PHP files served from the host (see §5). No
  database, no session store — a signed, self-expiring token carries all state.
- **Hosting:** static `dist/` (HTML/CSS/JS **+ the PHP files**) is deployed to
  **Hostpoint** (Swiss hosting). PHP runs in the Hostpoint docroot.

---

## 2. Running it locally

Open **Terminal**, go to the project folder, then use the scripts below:

```bash
cd ~/Documents/_SITE/VD_site   # adjust to your actual path
npm install                    # first time, or after dependency changes
npm run dev                    # or: npm run admin  (site + CMS)
```

- Local site: `http://localhost:4321`
- Admin dashboard (with `npm run admin`): `http://localhost:4321/admin`
- Stop any running command with **Control + C**.

---

## 3. Available scripts

| Command                              | What it does                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `npm run dev`                        | Starts the local site at `http://localhost:4321`.                                                    |
| `npm run admin`                      | Starts the site **and** the TinaCMS dashboard at `/admin`.                                            |
| `npm run build`                      | **Final step.** Generates Fit Check profiles, then builds the static site into `dist/` for upload.    |
| `npm run preview`                    | Serves the built `dist/` locally to check the production output.                                      |
| `npm run tree`                       | Regenerates `site-tree.txt` — a map of the project structure.                                         |
| `npm run clean`                      | Reset button: clears TinaCMS generated files and restarts the dashboard.                              |
| `node scripts/verify-fitcheck.mjs`   | **Run after any Fit Check change.** Fails loudly if the reveal, team email, or leak rule regress.     |
| `Control + C`                        | Stops any command currently running in the Terminal.                                                  |

> **`npm run build` order matters.** It runs `scripts/gen-fitcheck-profiles.mjs`
> *first* (emitting `public/fitcheck-profiles.gen.php`), *then* `astro build` — so
> Astro copies the freshly generated PHP into `dist/` alongside the other PHP
> files. See §5.

---

## 4. Project structure

```
VD_site/
├── astro.config.mjs           # Astro config: site URL, EN/DE i18n, build options
├── tailwind.config.mjs        # Tailwind configuration
├── package.json               # Dependencies & scripts
├── site-tree.txt              # Generated project map (npm run tree)
│
├── tina/
│   ├── config.ts              # TinaCMS schema & admin configuration
│   └── fitcheck-schema.ts     # Fit Check collection schema
│
├── src/
│   ├── pages/
│   │   ├── index.astro        # EN home (one-pager engine)
│   │   ├── check.astro        # EN Fit Check page
│   │   └── de/                # DE home + Fit Check
│   ├── layouts/
│   │   └── Layout.astro       # Global shell, theme, fonts, backgrounds
│   ├── components/            # Hero, Fold, SitePage, LanguageSwitcher,
│   │                          # DepthNetworkBackground, PlanetarySystemsBackground …
│   ├── content/
│   │   ├── pages/             # Page block content (home.json, en/, de/)
│   │   ├── settings/site.json # Global settings: name, theme, nav, background
│   │   └── fitcheck/config.json  # SINGLE SOURCE OF TRUTH for Fit Check copy & profiles
│   ├── i18n/ui.ts             # UI string translations
│   └── utils/siteHelpers.ts   # Shared helpers
│
├── public/                    # Copied verbatim into dist/ at build time
│   ├── admin/                 # TinaCMS admin interface
│   ├── images/, uploads/      # Logos, backgrounds, drag-and-drop media
│   ├── send-check.php         # Fit Check: validate + email visitor a one-time link
│   ├── confirm.php            # Fit Check: reveal result + email the qualified lead
│   ├── fitcheck-lib.php       # Shared logic: HMAC-signed, self-expiring token
│   ├── fitcheck-profiles.gen.php  # GENERATED from config.json (do not hand-edit)
│   └── get-math.php           # Lightweight math challenge (anti-bot)
│
├── scripts/
│   ├── gen-fitcheck-profiles.mjs  # config.json → fitcheck-profiles.gen.php (fail-loud)
│   └── verify-fitcheck.mjs        # Guard: checks Fit Check invariants
│
└── _docs/                     # Internal engineering notes (not shipped)
    ├── README-FITCHECK.md         # How the Fit Check is wired
    ├── README-MAINTENANCE.md      # Read before touching dependencies
    └── …                          # Animations, guards, personas, fit matrix
```

---

## 5. The Fit Check (how it's wired)

The Fit Check at `/check` (EN) and `/de/check` (DE) is a short guided assessment.
It is deliberately built so that **sensitive logic and other people's data never
reach the browser**:

1. **Single source of truth.** All profile copy lives in
   `src/content/fitcheck/config.json` (editable in TinaCMS). `npm run build` runs
   `gen-fitcheck-profiles.mjs`, which generates `public/fitcheck-profiles.gen.php`.
   If a required field is missing, the build **fails loudly** rather than shipping
   empty copy.
2. **Verify, then reveal — two stages, no database.**
   - `send-check.php` validates the submission (math challenge, email format, a DNS
     check, honeypot/timing signals), then emails the **visitor** a one-time link
     and shows a "check your inbox" panel. The team is **not** emailed yet.
   - `confirm.php` (opened via that link) reveals the matched result **and** sends
     the qualified-lead email to the team — only now, because only the real inbox
     owner can click the link.
3. **The token is the state.** A compact, HMAC-signed, self-expiring token (30 min)
   carries the already-validated answers — no session store, no database. A visitor
   cannot alter it and nobody can forge one without the server's signing key.
4. **Nothing leaks.** The browser only ever sends *raw answers* and only ever
   receives *the matched result's text*. Scoring logic, profile names, and the
   other profiles' copy never reach the client.

> After **any** change near the Fit Check, run `node scripts/verify-fitcheck.mjs`.
> The full contract is in `_docs/README-FITCHECK.md` and the invariants doc.

---

## 6. Deploying

1. Run `npm run build`. This produces `dist/` containing the static site **and**
   the PHP files (`send-check.php`, `confirm.php`, `fitcheck-lib.php`,
   `fitcheck-profiles.gen.php`, `get-math.php`).
2. Upload the **contents of `dist/`** to the Hostpoint docroot (FTP). The PHP files
   must sit in the docroot so `confirm.php`/`send-check.php` resolve their includes
   via `__DIR__`.
3. Confirm the Fit Check end to end on the live domain (submit → inbox link →
   reveal → team email).

---

## 7. Maintenance guardrails (short version)

- **`@astrojs/sitemap` is pinned to exactly `3.2.1`** — 3.3+ requires Astro 5 and
  breaks this Astro 4 build. Don't bump it until you upgrade Astro.
- **Don't run `npm audit fix --force`.** It jumps major versions and is the most
  likely way to break the build. Most advisories are dev-tooling (TinaCMS/build)
  that never ships in `dist/`.
- **New dependency?** `npm install` first, *then* `npm run build`.
- Full notes: `_docs/README-MAINTENANCE.md`.

---

*vortexdeep.ch · info@vortexdeep.ch · Kanton Zürich, Switzerland — worldwide.*
