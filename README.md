# VortexDeep

**Practical AI automation for small and mid-sized companies.**
From Zürich, Switzerland — worldwide.

Live site: [vortexdeep.ch](https://vortexdeep.ch) · Contact: info@vortexdeep.ch

---

## What VortexDeep is

VortexDeep builds and runs **AI-assisted workflows** that take repetitive
operational work off a company's plate — the reading, sorting, drafting and
filing that a team keeps redoing — while a person stays in control of every
decision.

The model is deliberately simple:

- **We take the repetitive slice.** Something arrives, it's read and sorted, a
  reply or an entry is drafted — and then held for you.
- **You keep the judgement.** The deciding, the researching, the final sign-off
  stay with you. Nothing is sent, paid or filed on its own.
- **No lock-in.** Workflows are built for your business and managed monthly. You
  can stop at the end of any month.
- **Your data stays yours.** Most of the build runs on samples. Your own data is
  used only to test before handover, then cleared — never stored, never shared.
- **One person.** The person who builds it is the person who answers the phone.

Delivery is phase-gated with written sign-off at each step:
**Discovery → Scope → Solution → Build → Validation → Live.**

## The work we take off you

Almost every task follows the same shape — *something arrives, it's read and
sorted, a draft is prepared and held for approval*. Clients start with the one
process that's costing them hours and grow from there. Current areas:

**Communication & Customers**
Communication & intake · Customer support · Scheduling & booking ·
Feedback & reviews.

**Sales & Growth**
Lead & sales pipeline · Content & marketing · E-commerce & fulfilment ·
Quotes & proposals · Renewals & retention.

**Documents & Finance**
Document & data processing · Finance & admin · Contracts & agreements ·
Procurement & suppliers · Compliance & filing.

**Operations & Insight**
Internal operations · Reporting & analytics · People & hiring ·
Quality & process monitoring · Knowledge & SOPs.

Some work is only ever *partly* automatable — where a person must investigate or
decide (a root-cause review, a hiring choice, a tax filing). In those cases
VortexDeep takes the measurable, repeatable part and says plainly where you stay
in charge.

## Who runs it

Maciek Szczech · Wald ZH, Switzerland. Twenty years of building and running
processes — process engineering and project management — now applied to AI
workflow automation. Target clients are owner-led SMEs (KMU), typically in and
around Kanton Zürich, with at least one repeatable, computer-based task that eats
several hours a week.

---

## About this repository

This repo contains the **VortexDeep marketing site** (`VD_site`): a bilingual
(EN/DE) one-pager plus a "Fit Check" questionnaire, built as a fast static site
with a visual CMS for editing content without touching code.

### Stack

- **[Astro](https://astro.build/)** — static site framework (the site engine).
- **[Tailwind CSS](https://tailwindcss.com/)** — styling.
- **[TinaCMS](https://tina.io/)** — visual/admin editing of page content, case
  studies, settings and the Fit Check config.
- **React** + **three.js** — the animated "depth" / planetary-system backgrounds.
- **PHP** — a small form handler (`public/send-check.php`) that receives Fit Check
  submissions.
- **Deployment** — the built `dist/` folder is published to Hostpoint.

### Content lives in `src/content/`

Editable content is data, not code — so most changes are made in the admin
dashboard or directly in these JSON files:

| Path | What it holds |
| --- | --- |
| `src/content/pages/en/home.json`, `.../de/home.json` | The page blocks: "What We Do", "The Work We Take Off You", case studies, phases, contact, etc. |
| `src/content/dataPage/en.json`, `de.json` | The `/data` page ("How we handle your data"). |
| `src/content/fitcheck/config.json` | The Fit Check engine — segments visitors by role × pain area × maturity × goal. |
| `src/content/settings/site.json` | Site name, taglines, theme, nav, contact details, SEO meta. |

### Running it locally

Open a terminal, `cd` into the project folder, then:

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the site at `http://localhost:4321`. |
| `npm run admin` | Starts the site **and** the TinaCMS admin at `/admin`. |
| `npm run build` | Generates Fit Check profiles, then compiles the site into `dist/`. |
| `npm run preview` | Serves the built `dist/` locally to check it before upload. |
| `npm run tree` | Regenerates `site-tree.txt`, a map of the project structure. |
| `npm run clean` | Clears the generated TinaCMS cache and restarts the admin. |
| `Ctrl + C` | Stops whatever is running in the terminal. |

### Project structure

```
VD_site/
├── src/
│   ├── components/     # Astro components (Hero, Fold, backgrounds, language switcher…)
│   ├── content/        # CMS-editable data (pages, dataPage, fitcheck, settings)
│   ├── layouts/        # Global layout, colours, fonts
│   └── pages/          # Route entry points (index, check, [dataPage]) in EN + /de
├── public/             # Static assets, uploads, and send-check.php (form handler)
├── tina/               # TinaCMS configuration and generated schema
├── dist/               # Build output (published to Hostpoint)
├── _docs/              # Internal notes (personas, maintenance, animations…)
└── package.json
```

> **Note:** `package.json` still carries the original template name
> (`artmjs-zen`) from the starter this site was built on. Renaming it is cosmetic
> and safe, but not required for the build.
