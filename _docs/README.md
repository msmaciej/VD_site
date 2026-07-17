# VortexDeep — vortexdeep.ch

Marketing site for **VortexDeep**: practical AI automation for small businesses (KMU) in Zürich, Switzerland.

Bilingual (DE / EN), statically generated, content-managed through TinaCMS, deployed as a plain folder of files to Hostpoint.

**Documentation:** this file (build, deploy, content model, structure) · [README-FITCHECK.md](README-FITCHECK.md) (Fit Check questions, scoring & pipeline) · [README-ANIMATIONS.md](README-ANIMATIONS.md) (every animation toggle & tunable).

---

## 1. Design philosophy

The site is built on a **zen-minimalist** foundation, inherited from the ARTMJS "Zen Gallery" Astro + Tina template it grew out of:

- **Monochromatic**, restrained palette; type and whitespace do the work.
- **"Ma" (negative space)** is intentional — the layout breathes.
- Motion is ambient, not decorative noise: the depth-network / planetary backgrounds and the process-flow dot animation are the only movement on the page.
- **KISS** — every block is a self-contained module that the admin can toggle on or off.

**Important caveat for a business site.** The template's original job was to make an art gallery feel contemplative; ambiguity was a feature. VortexDeep's job is to make a KMU owner understand, within seconds, *what we do, who it is for, and what to do next.* Zen restraint is kept as the **visual** language — it must never be applied to the **message**. In practice:

- Body copy stays in readable sentences, not fragments.
- Business-critical content (what we do, case study, contact) is never sacrificed to whitespace.
- Minimum readable type sizes apply to prose; the very small sizes (9px / 11px) belong to meta labels only.

The **art gallery** capability from the original template is retained and fully functional — it is simply **off by default**. It is available to switch on for any section that genuinely needs an image grid (visual case studies, workflow screenshots, diagrams). See §5.

---

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | **Astro 4** (static output) |
| Styling | **Tailwind CSS 3** |
| CMS | **TinaCMS 1.x** (local, file-based; edits write JSON into `src/content/`) |
| 3D / background | **three.js** (`DepthNetworkBackground`, `PlanetarySystemsBackground`) |
| Forms / backend | **PHP** (`public/*.php`) — runs on Hostpoint shared hosting, no Node server needed |
| i18n | Astro `i18n` config — **EN at `/`**, **DE at `/de/`** |
| Hosting | **Hostpoint** — upload the contents of `dist/` |

---

## 3. Running it

Requires Node.js (18+).

```bash
npm install
```

| Command | What it does |
|---|---|
| `npm run dev` | Local site at `http://localhost:4321` (no CMS). |
| `npm run admin` | Site **plus** the Tina admin dashboard at `http://localhost:4321/admin`. **Use this to edit content.** |
| `npm run build` | Regenerates the fit-check profile include, then compiles the site into `dist/`. **This is the deploy artifact.** |
| `npm run preview` | Serves the built `dist/` locally. |
| `npm run tree` | Regenerates `site-tree.txt`. |
| `npm run clean` | Deletes the generated Tina files and restarts the dashboard. |
| `Ctrl + C` | Stops whatever is running. |

> Note: PHP endpoints (`get-math.php`, `send-check.php`) do **not** run under `astro dev`. The fit-check form can only be tested end-to-end on the PHP host, or against a local PHP server.

---

## 4. Deployment

1. `npm run build`
2. Upload the **contents of `dist/`** to the Hostpoint web root.
3. `dist/` is committed to the repo, so what is in `dist/` on `main` should always equal what is live at vortexdeep.ch.

**Deployment rule:** content changes made in Tina only touch `src/content/*.json`. They are **not live until `npm run build` is run and `dist/` is re-uploaded**. Enabling a block in Tina and forgetting to rebuild is the single easiest mistake to make here — see §8.

---

## 5. Content model

All editable content lives in `src/content/` as JSON and is exposed in the Tina dashboard.

### Pages — `src/content/pages/en/home.json` and `.../de/home.json`

Each page is an ordered array of **blocks**. Every block has an `enabled` flag, so sections can be switched on/off without deleting them. EN and DE are **separate files** — a change to one does not change the other.

Available block templates (`_template`):

| `_template` | Purpose |
|---|---|
| `section` | Generic title / sub-title / body block. Also the block that can host the **art gallery** (`showArt: true` + `columns`). |
| `processFlow` | The animated Discovery → Scope → Solution → Build → Validation → Live flow. Vertical or horizontal. |
| `caseStudy` | Structured case study: industry, location, package, timeline, Challenge / What Was Built / Result. |
| `testimonial` | Client quote with name + organisation. |

**Text convention:** in `title`, `subTitle`, `content` and the site subtitle, a `|` character is rendered as a **line break**. This is a leftover of the gallery template's typographic style. It is fine for short taglines and stacked labels — it should **not** be used to fragment prose into disconnected words.

### Site settings — `src/content/settings/site.json`

Global: site name and subtitle (EN + DE), header/footer layout and heights, nav links, social links, font preset, theme, background style and its parameters, and the SEO / schema fields (`metaTitle`, `metaDescription`, `ogImage`, `siteUrl`, address, `contactEmail`, `contactPhone`).

### Fit Check — `src/content/fitcheck/config.json`

All question and answer copy for the `/check` (`/de/check`) tool, in both languages — every question (role, category + follow-up, time cost, process, goal) is label-editable here — plus the four result profiles (FireFight / Refine / Build / Optimize). Schema lives in `tina/fitcheck-schema.ts`. This file is the **single source of truth** for the profile copy: `send-check.php` consumes a generated include built from it, so it is never edited by hand in two places. See [README-FITCHECK.md](README-FITCHECK.md).

### Art gallery — `src/content/art/*.json`

One JSON file per image (title, year, price, image, visibility toggles), rendered by `ArtCard.astro` inside any `section` block with `showArt: true`. Retained from the template; unused on the current homepage but available whenever an image grid is the right answer.

### UI labels — `src/i18n/ui.ts`

Hard-coded bilingual strings that are **not** editable in Tina (e.g. "Case Study" / "Fallstudie", "Challenge" / "Herausforderung"). Add a key here for any new fixed label.

---

## 6. The Fit Check (`/check`)

A short guided assessment: role → pain category → follow-up → time cost → process maturity → goal.

- `public/get-math.php` — issues a simple arithmetic challenge, answer held in the PHP session. Bot gate.
- `public/send-check.php` — validates the gate, **scores the submission server-side**, emails the lead to `info@vortexdeep.ch`, and returns only the matched profile's tagline and description.

**Do not move scoring to the client.** By design, the browser sends only raw answers. The internal bucket (lead / warm / other) and the profile *names* (FireFight / Refine / Build / Optimize) are never sent to the visitor — only the matching tagline and description text. Keep it that way.

**Profile copy is single-source.** The profile text is **not** duplicated in `send-check.php` any more. It lives once in the `profiles` section of `src/content/fitcheck/config.json` (edited in Tina). At build time, `scripts/gen-fitcheck-profiles.mjs` (the first step of `npm run build`) generates `public/fitcheck-profiles.gen.php` from it, which `send-check.php` then `require`s. So editing profile text in Tina and rebuilding is enough — there is nothing to mirror by hand, and the page and the PHP cannot drift apart. If `config.json` is incomplete the build fails loudly rather than shipping blank copy.

> **Full details** — the six questions, the label-editable / value-fixed split, the exact Time × Process scoring matrix, the bucket logic, the generator pipeline and the guards — are documented in **[README-FITCHECK.md](README-FITCHECK.md)**.

---

## 7. Project structure

```
VD_site/
├── astro.config.mjs           # Astro + Tailwind + i18n (EN at /, DE at /de/)
├── tailwind.config.mjs
├── tina/
│   ├── config.ts              # Tina schema: blocks, pages (EN/DE), settings, art
│   └── fitcheck-schema.ts     # Tina schema: fit-check questions & profiles
├── scripts/
│   └── gen-fitcheck-profiles.mjs  # build-time: config.json → PHP profile include
├── src/
│   ├── content/               # ← all editable content (JSON)
│   │   ├── pages/en/home.json
│   │   ├── pages/de/home.json
│   │   ├── settings/site.json
│   │   ├── fitcheck/config.json
│   │   └── art/*.json
│   ├── components/
│   │   ├── SitePage.astro     # renders the block array — the core engine
│   │   ├── Hero.astro
│   │   ├── ArtCard.astro      # zen gallery card (optional, off by default)
│   │   ├── LanguageSwitcher.astro
│   │   ├── DepthNetworkBackground.astro
│   │   └── PlanetarySystemsBackground.astro
│   ├── layouts/Layout.astro   # global shell, theme, SEO tags
│   ├── i18n/ui.ts             # fixed bilingual labels
│   ├── utils/siteHelpers.ts
│   └── pages/
│       ├── index.astro        # EN home
│       ├── check.astro        # EN fit check
│       ├── de/index.astro     # DE home
│       └── de/check.astro     # DE fit check
├── public/
│   ├── .htaccess              # denies direct access to the generated include
│   ├── get-math.php           # bot-gate challenge
│   ├── send-check.php         # fit-check handler + server-side scoring
│   ├── fitcheck-profiles.gen.php  # GENERATED profile copy (do not edit)
│   ├── images/, uploads/      # logos, backgrounds, Tina media
│   ├── robots.txt
│   └── sitemap.xml
└── dist/                      # BUILD OUTPUT — this is what is live on Hostpoint
```

---

## 8. Known issues / to fix

- **`dist/` is stale.** The MG Redshift `caseStudy` and `testimonial` blocks are `"enabled": true` in both `src/content/pages/en/home.json` and `de/home.json`, but neither appears in `dist/index.html` or `dist/de/index.html`. **Run `npm run build` and re-upload `dist/`** — the case study is currently written but invisible to visitors.
- **`npm run clean` targets the wrong path.** The script removes `.tina/__generated__`, but the generated files live in `tina/__generated__` (no leading dot). It currently does nothing.
- **`package.json` still says `"name": "artmjs-zen"`.** Rename to `vortexdeep`.
- **`site-tree.txt` is stale** — it still lists the old gallery structure. Run `npm run tree`.
- **`contactPhone` is empty** in `site.json`. KMU visitors expect a phone number; it also feeds the Google `LocalBusiness` schema.
- **No Impressum / Datenschutz page** — expected for a Swiss business site.
- **Default locale is EN.** The target audience is Zürich KMU; consider making DE the default (`astro.config.mjs` → `defaultLocale: 'de'`) and serving EN at `/en/`.
- **Readability:** several blocks use `text-[13px]` for body prose and `text-[9px]` for attribution, and the header subtitle uses `tracking-[1.2em]`. Fine for meta labels, too small / too spaced for anything a prospect needs to actually read.

---

## 9. Editing checklist

1. `npm run admin`
2. Edit content at `http://localhost:4321/admin` (or edit the JSON in `src/content/` directly).
3. `npm run build` — this also regenerates `public/fitcheck-profiles.gen.php` from the fit-check config, so profile-text edits made in Tina take effect automatically. No manual PHP editing.
4. Upload the contents of `dist/` to Hostpoint.
5. Commit — including `dist/`.
