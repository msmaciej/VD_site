# Fit Check — questions, scoring & content pipeline

The Fit Check is the guided assessment at `/check` (EN) and `/de/check` (DE). A
visitor answers a short series of questions; the submission is scored
**server-side** in PHP; the visitor sees one short result; and the team gets a
qualified lead email.

This document is the single reference for how it is wired. For the general site
build/deploy story see [README.md](README.md).

> **One rule underpins everything below:** the visitor's browser only ever sends
> *raw answers* and only ever receives *the matched result's tagline and
> description*. The scoring logic, the profile names, the other profiles' text,
> and the internal lead bucket never reach the browser. This is deliberate — it
> keeps the methodology from being lifted by competitors or scrapers.

---

## 1. The questions the visitor sees

Six screens, in order. Five are numbered questions (Q0–Q4); the follow-up is a
conditional screen shown after the category pick.

| # | Screen | Values (fixed) | Editable in Tina |
|---|---|---|---|
| Q0 | **Role** | `business` / `consultant` / `curious` | labels only |
| Q1 | **Category** (area absorbing time) | `comms` `sales` `docs` `ops` `reporting` `content` `several` | labels only |
| — | **Follow-up** (per category) | context only — see §4 | labels only |
| Q2 | **Time cost** | `high` / `mid` / `low` / `unsure` | labels only |
| Q3 | **Process ownership** | `none` / `partial` / `full` | labels only |
| Q4 | **Goal / intent** | `solve` / `clarity` / `explore` / `compare` | labels only |

Only visitors who pick **`business`** at Q0 continue to the questions and the
contact gate. `consultant` / `curious` are shown the **short close** screen
(`shortClose` in config) and never submit. `send-check.php` re-checks
`role === business` anyway, because the endpoint is public and a raw POST could
be replayed with a different role.

### Labels are editable, values are not — and why

Every question's **label** (the text the visitor reads) is editable in TinaCMS.
Every question's **value** (`high`, `full`, `business`, …) is fixed in code — it
is a field *name* in `tina/fitcheck-schema.ts`, never editable text, and the
matching `data-val="…"` attributes are hardcoded in `check.astro` /
`de/check.astro`.

This split is intentional. The scoring functions branch on the exact value
strings. If a value were CMS-editable, someone renaming `high` → `urgent` in
Tina would silently break scoring with no error. So: **copy is editable; the
keys the logic depends on are not.** You can rewrite every question and answer
on the page from Tina without any risk to the scoring.

---

## 2. How the result is scored

Two independent calculations happen in `public/send-check.php`. **Only two of
the questions decide the visitor's result.**

### 2a. The profile — `calc_profile_key($time, $process)`

The visitor-facing result is **Time × Process only** — a 2×2:

| | **process = none / partial** | **process = full** |
|---|---|---|
| **time = high / unsure** (urgent) | **FireFight** | **Refine** |
| **time = mid / low** (manageable) | **Build** | **Optimize** |

- The four time values collapse to two rows: `high` and `unsure` are both
  treated as *urgent*; `mid` and `low` are *manageable*.
- The three process values collapse to two columns: `full` is *full*; `none`
  and `partial` are both a *process gap*.
- So the 12 possible (time × process) combinations resolve to exactly 4
  profiles.

That is the **entire** profile logic. Category, goal, role and the follow-up do
**not** affect which profile a visitor gets.

### 2b. The bucket — `calc_bucket($role, $category, $time, $process, $goal)`

The bucket is an **internal lead-quality signal**. It is used only in the team
email subject/body and is **never** sent to the visitor.

- `role !== business` → **`other`** (these never actually reach the email; they
  saw the short close instead).
- Otherwise **`lead`** when *all three* hold:
  - a real time cost (`time` is `high`, `mid`, or `unsure`) **or** multiple
    pain areas (`category === several`), **and**
  - a process gap (`process !== full`), **and**
  - an outcome intent (`goal` is `solve` or `clarity`).
- Otherwise → **`warm`**.

Note the deliberate asymmetry with the profile: for the **profile**, `mid` time
counts as *manageable*; for the **bucket**, `mid` still counts as a *real time
cost*. `low` counts as neither. These are separate judgments and are meant to
differ.

### What the visitor gets back

```json
{ "status": "ok", "profile": { "tagline": "…", "description": "…" } }
```

The matched profile's tagline and description only. **No profile name, no
bucket, no other profiles, no matrix.** The FireFight/Refine/Build/Optimize
naming is internal even for the visitor's own match.

### What the team gets

A plain-text email to `info@vortexdeep.ch` with the bucket, the profile name +
key, a glossary, a full matrix diagram (`build_matrix_diagram()` marks the
matched cell with `>>>`), the exact text the visitor saw, the contact details,
and all answers in both human-readable and machine-readable form. This email is
the one place all four quadrants and both bucket meanings are ever written out
together — safe, because it never leaves the script.

---

## 3. The content pipeline — one source of truth for profile copy

The four profiles' copy (name, tagline, description, EN + DE) lives in **exactly
one editable place**: the `profiles` section of
`src/content/fitcheck/config.json`, edited in Tina.

`send-check.php` does **not** contain its own copy. At build time it is
generated for PHP:

```
src/content/fitcheck/config.json          ← edit here (Tina)
        │
        │  node scripts/gen-fitcheck-profiles.mjs   (first step of `npm run build`)
        ▼
public/fitcheck-profiles.gen.php          ← GENERATED. do not edit by hand.
        │
        │  astro build copies public/* → dist/
        ▼
dist/fitcheck-profiles.gen.php            ← uploaded next to dist/send-check.php
        ▲
        │  require __DIR__ . '/fitcheck-profiles.gen.php';
public/send-check.php  →  dist/send-check.php
```

Because `send-check.php` and the generated include are copied into the same
directory and the `require` uses `__DIR__`, the path resolves in Hostpoint's
docroot wherever that docroot happens to be — no absolute paths.

**Editing profile text now is: change it in Tina → rebuild → upload `dist/`.**
There is nothing to mirror by hand. It is structurally impossible for the page
and the PHP to disagree, because the PHP is regenerated from the same file on
every build.

### Guards — fail loud, never silent

- **Build time:** if `config.json` is missing a profile key or any required
  field, `gen-fitcheck-profiles.mjs` throws and `npm run build` exits non-zero.
  It will never emit a PHP file with a blank tagline.
- **Run time:** if the generated include is missing or malformed at request
  time, `send-check.php` returns a clean `500` (`profiles_missing` /
  `profiles_invalid`) and logs it, rather than fataling on an undefined value or
  emailing blank copy.

### Why the profiles don't leak, even as a `.php` file in the web root

`fitcheck-profiles.gen.php` sits in the web root, but it is a PHP file: the
server *executes* it and it echoes nothing, so a direct request returns an empty
response — the source (names, all four profiles) is never served. As a second
layer, `public/.htaccess` denies direct web requests for that filename outright,
so even a hypothetical PHP-execution misconfiguration cannot serve its source.

---

## 4. The category follow-up

After Q1, each category shows a follow-up question to sharpen the lead context
(e.g. for `comms`: what's driving the workload?). `several` has no options of
its own — it reuses the other six categories' Q1 button labels as its options.

The follow-up answer is **context only**: it is recorded and included in the
team email, but it does **not** feed either the profile or the bucket.

---

## 5. Files

| File | Role |
|---|---|
| `src/content/fitcheck/config.json` | **Source of truth** — all question/answer copy + the four profiles, EN + DE. Edited in Tina. |
| `tina/fitcheck-schema.ts` | Tina schema. Defines which labels are editable; encodes the fixed values as field names. |
| `src/pages/check.astro`, `src/pages/de/check.astro` | The questionnaire UI. Reads labels from config; `data-val` values hardcoded. |
| `scripts/gen-fitcheck-profiles.mjs` | Build-time generator: config.json → PHP include. Fails the build on incomplete config. |
| `public/fitcheck-profiles.gen.php` | **Generated** PHP include (do not edit). `$PROFILES` for both languages. |
| `public/send-check.php` | Form handler + bot gates + **server-side scoring** + lead email. `require`s the generated include. |
| `public/get-math.php` | Session-based arithmetic bot gate issued before submit. |
| `public/.htaccess` | Denies direct web access to the generated include (defence in depth). |

---

## 6. Editing — quick reference

- **Change any question or answer wording (incl. Q2 time):** Tina → the
  relevant question → rebuild → upload `dist/`.
- **Change profile result copy:** Tina → *Result profiles* → rebuild → upload
  `dist/`. (No PHP edit — that's the whole point.)
- **Change which answers map to which profile / bucket:** edit
  `calc_profile_key()` / `calc_bucket()` in `public/send-check.php`. This is a
  deliberate code change, on purpose — the scoring matrix is intentionally *not*
  CMS-editable.
- **Add a new answer option to a question:** add the value in
  `check.astro`/`de/check.astro` (`data-val`) **and** the label field in
  `tina/fitcheck-schema.ts` + `config.json`, and handle the new value in the
  scoring functions if it should affect scoring.
