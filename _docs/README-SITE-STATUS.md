# VortexDeep — site status (in-preparation / maintenance switch)

Plain-language notes for pausing the public site behind a single notice, and
bringing it back. Nothing here is destructive; it's one dropdown + a rebuild.

## What it does

One setting — **Site Settings → "Site status"** in the Tina admin — has three
positions:

- **Live** — the normal site.
- **In preparation** — the whole public site is replaced by one full-screen
  notice: *"VortexDeep is in preparation and not yet commercially active — no
  customer orders, no invoicing, no revenue."* (DE + EN). This is the wording
  aimed at the RAV / Fachstelle Selbstständigkeit question.
- **Maintenance** — same idea, but the notice reads *"undergoing maintenance,
  back shortly"* (DE + EN).

When it's not Live, **every** address shows that one notice — home, `/de`,
`/check`, `/de/check`, `/data`, `/de/data`. Nothing else stays reachable, so a
visitor (or a caseworker typing the URL) can't reach the services / process /
Fit Check pages. The notice keeps the site's own animated background, so it
still looks like VortexDeep, just paused. It also sends `noindex, nofollow`
so search engines don't index the paused state.

## How to switch it

1. Open the Tina admin (`npm run admin`, then `/admin`), go to **Site Settings**.
2. Set **Site status** to Live / In preparation / Maintenance and save.
   - Prefer not to open the admin? Just edit `src/content/settings/site.json`
     and change `"siteStatus"` to `"live"`, `"preparation"`, or `"maintenance"`.
3. Rebuild: `npm run build`.
4. Upload the new `dist/` to Hostpoint (same as any other change).

That's the whole loop. To bring the site back, set it to **Live**, rebuild,
upload. The Tina admin at `/admin` is a static file and is **never** hidden by
this switch, so you can always get back in to flip it.

## Custom wording (optional)

**Site Settings → "Site status — custom wording"** has optional DE/EN fields for
each mode. Leave them empty to use the built-in defaults; fill only the lines
you want to change. The defaults already match the RAV wording, so you can
ship as-is.

## This vs. Hostpoint password protection

Two different things — use this, not password protection:

- **Password protection** shows visitors a browser login pop-up and nothing
  else. It doesn't display any message, and it was throwing Internal Server
  Errors on the `www` alias.
- **This switch** shows a clear, readable "in preparation / not commercially
  active" page that loads normally on both `vortexdeep.ch` and
  `www.vortexdeep.ch`. For the RAV purpose that's the better signal: an
  explicit non-operational statement rather than a locked door.

If you had earlier turned on Hostpoint password protection or changed the root
domain to a redirect, undo those first (protection OFF, domain back to normal
hosting) so this page is what actually shows.

## Files involved (for future reference)

- `src/content/settings/site.json` — holds the current `siteStatus` value.
- `tina/config.ts` — the dropdown + custom-wording fields in Site Settings.
- `src/layouts/Layout.astro` — the gate: every page renders through here, so it
  swaps in the notice when status isn't `live`.
- `src/components/SiteStatusScreen.astro` — the notice itself (both modes, both
  languages, reuses the site's animated background).

## Current state

Shipped set to **"preparation"** — so the first build+upload after these changes
will show the in-preparation notice. Flip to **"live"** when RAV/Fachstelle has
confirmed and you're ready to go public again.
