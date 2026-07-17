# Fit Check — invariants (read before changing anything)

This file exists because the Fit Check has been silently "improved" into a worse
shape more than once. Every rule below is deliberate and already tested. If a
change seems better, the job is to protect these, not replace them. After ANY
build, run the guard:

    node scripts/verify-fitcheck.mjs

It exits non-zero and names what broke. Wire it into the build if you want it
enforced automatically (see the end of this file).

---

## The flow (must stay this way)

1. **On-site reveal.** The visitor answers six questions, leaves an email, and
   their result appears **on the page immediately**. There is NO emailed
   confirmation link, no "check your inbox", no 30-minute window. `send-check.php`
   scores server-side and returns `{status:"ok", tagline, description, ...}`.

2. **The team gets the full picture on submit.** `send-check.php` emails
   `info@vortexdeep.ch` the full internal breakdown — BUCKET, PROFILE, the
   four-cell matrix with the landing cell marked, what the client saw, the six
   answers, and the AI-READY block — with **Reply-To set to the visitor**. The
   subject contains "Fit Check" so it files into the FITCHECK folder. This is the
   whole point: be prepared to reply to a real lead the moment it lands.

3. **LEAK RULE (never weaken).** Only the matched profile's **tagline +
   description** (plus the shared disclaimer + CTA) may reach the browser. The
   profile NAME, the bucket, the other three profiles' copy, and the scoring
   matrix are computed server-side and must NEVER appear in the built pages or
   JS. The guard scans for this.

4. **Bot signals are SOFT flags, not blocks.** Honeypot and timing only add a
   `FLAGGED:` line to the team email — they never reject a submission. The math
   captcha is the one hard gate. The MX/DNS email check and the note-field filter
   stay. A real visitor who trips a honeypot by autofill still gets through and
   still reaches the inbox.

Scoring lives in ONE place: `public/fitcheck-lib.php`
(`vd_calc_profile_key`, `vd_calc_bucket`, `vd_build_internal_email`). Don't
duplicate it.

---

## Secrets & internal material (currently exposed — fix these)

The repo is **public** and has **no .gitignore**. Three things need attention:

1. **Signing secret in the repo.** `public/fitcheck-secret.php` and
   `dist/fitcheck-secret.php` (a real 96-char HMAC key) are committed. The
   on-site flow does **not** use this key at all (only the retired link flow did),
   so the clean fix is: remove it from the repo, delete it from the server if
   nothing uses it, and — if you ever reuse it anywhere — rotate it first.

2. **Internal artifacts in a public repo.** `_VortexDeep-fit-matrix-internal.svg`,
   its `.png`, and `_VortexDeep_Personas_Canvas.md` are the very matrix and
   strategy the leak rule keeps out of the browser — but they're readable by
   anyone with repo access. They are NOT served by the site (not in `public/` or
   `dist/`), so this is purely a repo-visibility issue.

3. **The whole `dist/` is committed.** Fine to build from, but it means every
   deploy artifact (including the secret above) lives in the public repo.

**Simplest blanket fix:** make the GitHub repo **private**. That instantly closes
all three. Independently, removing the secret and the internal artifacts from
version control is good hygiene. A starter `.gitignore` is included.

---

## Retired: the verify-by-link flow

`public/confirm.php` is dormant (nothing links to it) and no longer required. You
can delete it and `fitcheck-secret.php` together to fully decommission the link
flow. Leaving `confirm.php` in place is harmless — it just 500s gracefully on any
old link.

---

## Enforce the guard automatically (optional)

In `package.json`, change the build script to run the check after the build:

    "build": "node scripts/gen-fitcheck-profiles.mjs && astro build && node scripts/verify-fitcheck.mjs"

Then a regression fails the build instead of shipping. (Left un-wired by default
so it doesn't surprise you — flip it on when you're ready.)
