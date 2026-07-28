# VortexDeep — admin preview (seeing the real site while the public sees "in preparation")

Plain-language notes. Nothing here is destructive.

## The idea in one picture

Two versions of the site get uploaded together:

```
web root/                     <- everyone lands here
  index.html, de/, check/ ...    "in preparation" notice, at EVERY address
  preview.php                    the doorman
  gate.php                       serves the real site to pass holders
  preview-secret.php             your key (never on GitHub)
  .htaccess                      routing rules
  _vd-live/                      THE REAL SITE — no public address at all
```

The public folder contains the notice and nothing else. The real site is in
`_vd-live/`, which Apache refuses to serve and which has no reachable URL. The
only way to see it is through `gate.php`, and only after it has checked your
pass.

**This fails in the safe direction.** If `.htaccess` goes missing during an
upload, the doorman disappears — and every visitor, including you, just sees the
notice. There is no failure mode where the real site accidentally goes public,
because the real site is not at a public address in the first place.

## Using it

Generate your key once:

```
npm run preview:key
```

It prints your private link and writes `public/preview-secret.php`. That file is
gitignored, so it never reaches GitHub, and `npm run deploy` copies it into the
upload set automatically.

Then:

| To do this | Open this |
| --- | --- |
| Start previewing | `https://vortexdeep.ch/preview.php?k=YOUR-KEY` |
| Browse the real site | any normal address — `/`, `/de`, `/check` … |
| Stop previewing | `https://vortexdeep.ch/preview.php?logout=1` |

The pass lasts 30 days and then expires by itself. Lost the link, or shared it
by accident? Run `npm run preview:key -- --force` and redeploy — that replaces
the key and cancels every pass immediately.

Treat the link like a password. Anyone who has it sees the real site.

## Publishing

```
npm run deploy
```

This builds **both** versions and assembles `deploy/`. Upload the *contents* of
`deploy/` to the Hostpoint web root.

**Turn on "show hidden files" in your FTP client.** `.htaccess` starts with a dot
and most clients hide it by default. Without it the preview won't work.

The old `npm run build` still exists and is unchanged. Use it when you are ready
to go fully public: set **Site status → Live** in Tina, run `npm run build`, and
upload `dist/` the normal way. At that point the preview gate is irrelevant —
`deploy` refuses to run while the status is "live", precisely so the two can't
be confused.

## What changed in the Fit Check (nothing you will notice)

The Fit Check itself is untouched: answer the questions, enter your details, see
the result on the page. No link is emailed to the visitor.

Two files from the *old* design — where a signed link was emailed and clicked to
reveal the result — were still sitting in the project:

- `public/confirm.php` — the old reveal page. Nothing linked to it.
- `public/fitcheck-secret.php` — the key that signed those links.

Both are deleted. `scripts/gen-fitcheck-profiles.mjs` no longer regenerates the
key on every build, which is what kept bringing it back.

## Security housekeeping done at the same time

- **Added `.gitignore`.** The project had none, which is why a real signing key
  was committed to a public repo. Keys are now excluded by name.
- **Untracked `dist/`.** Build output doesn't belong in version control, and the
  committed copy also contained the leaked key.
- **Added `public/.htaccess`.** Your docs referenced one, but it wasn't in the
  project. It now denies direct browser access to the internal PHP includes
  (`fitcheck-lib.php`, `fitcheck-profiles.gen.php`, `preview-lib.php`,
  `preview-secret.php`).
- **Dropped `admin/` from the deploy.** It was TinaCMS's development stub,
  importing from `localhost:4001`. It never worked on the server. Tina is
  unaffected locally.

### Still to do by hand

1. **The leaked key is still in Git history.** Removing the file removes it from
   the current version, not from past commits. Since nothing uses that key any
   more, the practical risk is now zero — but if you want it gone properly, the
   cleanest route is `git filter-repo` or simply making the repo private.
2. **Check Hostpoint** for a leftover `.htaccess`, password protection, or a
   domain redirect from earlier experiments. Anything left over will fight with
   the new rules.

## Stronger option, if your FTP allows it

By default `_vd-live/` sits inside the web root, protected by a deny-all rule.
If you can write one level *above* the web root, put it there instead — then it
is unreachable no matter what any config file says. Edit `preview-secret.php`:

```php
$VD_LIVE_DIR = __DIR__ . '/../_vd-live';
```

and move the folder accordingly.

## Files involved

| File | Job |
| --- | --- |
| `public/preview.php` | Issues and revokes your pass. |
| `public/gate.php` | Checks the pass, serves the real site from `_vd-live/`. |
| `public/preview-lib.php` | Shared logic: signing, path safety, file serving. |
| `public/preview-secret.php` | Your key. Gitignored. Server only. |
| `public/.htaccess` | Denies internal includes; routes pass holders to the gate. |
| `scripts/build-deploy.mjs` | Builds both versions, assembles `deploy/`. |
| `scripts/make-preview-key.mjs` | Creates or rotates the key. |
| `src/layouts/Layout.astro` | Unchanged behaviour, plus a `VD_SITE_STATUS` override so one codebase can produce both builds. |
