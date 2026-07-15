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

## 0. The flow — verify, then reveal

The result is **not** shown the instant the visitor types an email. There are two
stages, so that the address has to be real *and* actually belong to the visitor
before any result appears or any lead reaches the inbox:

1. **Submit** (`send-check.php`). The gate validates the submission (math
   challenge, email format, a DNS check on the domain, honeypot/timing signals),
   then emails the **visitor** a one-time link. It shows a *"check your inbox"*
   panel — no result, and the team is **not** emailed yet.
2. **Confirm** (`confirm.php`). Opening the emailed link shows a single
   *"see my result"* button; pressing it reveals the matched result **and** sends
   the qualified-lead email to the team. Only now — because only a real inbox
   owner can click a link sent to that address.

This runs with **no session store and no database**. The link carries a compact,
HMAC-signed, self-expiring token (30 minutes) holding the already-validated
answers and contact details — the signed token *is* the state (see
`fitcheck-lib.php`). A visitor cannot alter it; nobody can forge one without the
server's signing key.

Two deliberate details:

- The confirm link renders a *button* on GET and only reveals/notifies on the
  button's POST. This defeats corporate mail link-scanners, which pre-fetch
  links (a GET) — a scanner can't press the button, so it can't confirm on the
  human's behalf.
- The math challenge stays a hard requirement at submit precisely because this
  endpoint now emails a visitor-supplied address; it's what stops the form being
  driven as a mass-mailer.

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

Two independent calculations happen in `public/fitcheck-lib.php` (called by `confirm.php` at reveal). **Only two of
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

At **submit**, the browser only learns the link is on its way:

```json
{ "status": "sent" }
```

The actual result is rendered server-side by `confirm.php` after the visitor
opens the emailed link and presses the button — as a small HTML page showing the
matched profile's **tagline and description only**. **No profile name, no
bucket, no other profiles, no matrix** ever reaches the browser, at either stage.
The FireFight/Refine/Build/Optimize naming is internal even for the visitor's own
match. (`confirm.php` styles itself from the site's current theme + font, both
emitted into the generated include at build time, so it matches `/check` without
hand-syncing.)

### What the team gets

A plain-text email to `info@vortexdeep.ch` — sent by **`confirm.php`**, i.e. only
after the address is confirmed — with the bucket, the profile name + key, a
glossary, a full matrix diagram (`vd_build_matrix_diagram()` marks the matched
cell with `>>>`), a `Confirmed: yes` line, the exact text the visitor saw, the
contact details, and all answers in both human-readable and machine-readable
form. Soft bot signals from the original submission travel in the token and, if
present, prefix the subject with `⚠` and add a `FLAGGED:` line — flagged, never
blocked. This email is the one place all four quadrants and both bucket meanings
are ever written out together — safe, because it never leaves the script.

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
| `public/fitcheck-profiles.gen.php` | **Generated** PHP include (do not edit). `$PROFILES` + `$RESULT_SHARED` + `$CONFIRM_UI` + `$FITCHECK_THEME`, both languages. |
| `public/fitcheck-lib.php` | Shared library `require_once`'d by both endpoints: HMAC token sign/verify, **server-side scoring** (`vd_calc_profile_key` / `vd_calc_bucket`), label maps, internal-email builder. One copy → no drift between stages. |
| `public/send-check.php` | **Stage 1** — bot gates + validation, signs a token, emails the visitor the confirmation link, returns `{"status":"sent"}`. No reveal, no team email. |
| `public/confirm.php` | **Stage 2** — verifies the link (GET → button; POST → reveal + team email), scores, renders the matched result. |
| `public/fitcheck-secret.php` | HMAC signing key. **Gitignored — never committed** (the repo is public). Auto-created by the generator if absent; **must** ship in the deploy set. |
| `public/get-math.php` | Session-based arithmetic bot gate issued before submit. |
| `public/.htaccess` | Denies direct web access to the three server-side includes (`*-profiles.gen.php`, `fitcheck-lib.php`, `fitcheck-secret.php`). |

---

## 6. Editing — quick reference

### Before you change a question: know the blast radius

Every change falls into one of three tiers. Identify the tier *first* — it tells
you how careful to be before you open a file, and whether the visitor's result
can be affected at all.

1. **Wording only** (any question label, any answer label, any result copy) —
   Tina + rebuild. **Cannot** affect scoring. Safe by construction. This is the
   large majority of edits.

2. **Time or Process — options/values** — these two questions are the *only*
   ones wired into the profile matrix (`calc_profile_key`, the 2×2 in §2).
   Rewording their labels is still tier 1 and safe. But **adding, removing, or
   re-mapping one of their answer options** is the one case that reaches the
   visitor's result — treat it as a deliberate process: check the 2×2, then
   update `vd_calc_profile_key()` in `fitcheck-lib.php` to handle the new value.

3. **Role / Category / Follow-up / Goal — options/values** — these **never**
   touch the profile the visitor sees. At most they affect the internal
   **bucket** (`calc_bucket`) and the lead email. So glance at `calc_bucket()`
   if you change their options, but the on-screen result is untouched either way
   — lower stakes than tier 2.

**The one rule to remember:** *only Time and Process feed the 2×2.* Everything
else is either pure copy (tier 1, safe) or bucket-only (tier 3, internal). If a
change doesn't touch Time or Process options, it cannot change what a visitor
sees as their result.

### By change type

- **Change any question or answer wording (incl. Q2 time):** Tina → the
  relevant question → rebuild → upload `dist/`.
- **Change profile result copy:** Tina → *Result profiles* → rebuild → upload
  `dist/`. (No PHP edit — that's the whole point.)
- **Change which answers map to which profile / bucket:** edit
  `vd_calc_profile_key()` / `vd_calc_bucket()` in `public/fitcheck-lib.php`. This is a
  deliberate code change, on purpose — the scoring matrix is intentionally *not*
  CMS-editable.
- **Add a new answer option to a question:** add the value in
  `check.astro`/`de/check.astro` (`data-val`) **and** the label field in
  `tina/fitcheck-schema.ts` + `config.json`, and handle the new value in the
  scoring functions if it should affect scoring.

---

## 7. Deploying & data protection

**Deploy set.** Upload the built `dist/` to the web root. Everything the two
stages need is already there because Astro copies `public/*` verbatim —
including the dotfile `.htaccess` and `fitcheck-secret.php`. If you deploy by
hand-picking files, don't forget those two.

**The signing key (`fitcheck-secret.php`).** It is deliberately **gitignored**,
because the GitHub repo is public and a leaked key would let anyone forge a
"confirmation" (reveal a result without owning the address, and trigger a team
email with arbitrary contents). `npm run build` auto-creates one if it's missing,
so a fresh clone still produces a deployable `dist/`. Rotating it is safe: replace
the string and redeploy — the only effect is that any confirmation links already
in flight (≤30 min old) stop verifying. If you build on a *different* machine, a
*different* key is generated there; deploy the whole `dist/` from one machine so
the key on the server is internally consistent.

**Email deliverability — the one thing to check before launch.** Before, `mail()`
only ever wrote to the internal `info@` inbox, so sender authentication barely
mattered. Now it also emails **external visitor inboxes** (the confirmation
link), which makes authentication for `vortexdeep.ch` the biggest deliverability
risk: if the mail isn't authenticated, a share of it lands in spam, the visitor
never clicks the link, and the whole verify-then-reveal flow silently breaks.
Three DNS-level standards prove the mail really came from us — **SPF** (which
servers may send as the domain), **DKIM** (a cryptographic signature on each
message), and **DMARC** (what receivers should do when SPF/DKIM fail). These are
DNS/mail-host settings, **not** code.

Because the domain *and* the hosting are both at **Hostpoint**, two of the three
are typically handled already, and the check is light:

- **SPF** — auto-generated and added for domains registered in the Hostpoint
  Control Panel. Already present unless the DNS is managed externally (in which
  case add Hostpoint's SPF, `redirect=spf.mail.hostpoint.ch`, at that provider).
- **DMARC** — Hostpoint applies a policy by default (**Quarantine**: failing
  mail goes to spam). Fine as a starting point; tighten to *Reject* later only if
  desired. Changed in the Control Panel; `None` isn't offered.
- **DKIM** — the one worth actively verifying, as it wasn't always on by default.
  Enable it in the Control Panel: **E-mail & Cloud Office → Display Cloud Office
  groups → select the group for the domain → Enhanced protection → Activate
  DKIM**. If Hostpoint also manages the DNS, that's the whole job; if the DNS is
  external, copy the DKIM records shown on that page into the external DNS zone.

**Pre-launch step:** in the Hostpoint Control Panel confirm DKIM is *active* (and
SPF/DMARC present) under *E-mail & Cloud Office → Enhanced protection*, then send
one real Fit Check submission and confirm the link email lands in the **inbox,
not spam**, at a Gmail *and* an Outlook address. A "DKIM record checker" tool
verifies the signature independently. Official refs:
`support.hostpoint.ch/en/technical/e-mail/e-mail-security/activate-dkim-for-externally-managed-domains`
and `hostpoint.ch/en/blog/e-mail-security-with-dkim-and-dmarc/`.

**Data protection (Swiss revDSG).** This design intentionally stores **no new
personal data**. There is still no database. The visitor's email lands in the
`info@` inbox exactly as before — that inbox is the only place it's retained. No
IP addresses, fingerprints, or hashes are logged or stored; the anti-abuse layer
is limited to the storage-free signals (math challenge, honeypot, timing, DNS
check) plus the fact that an unconfirmed address simply never becomes a lead. So
the confirm-then-reveal change *reduces* junk in the inbox without expanding the
retention footprint.

**One harmless edge.** Because the scheme is storage-free, pressing the confirm
button twice within the 30-minute window can send the team two notification
emails. That's the deliberate trade for having no session/DB; it's a duplicate,
nothing more.
