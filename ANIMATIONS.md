# Animations

Every animation on the site is admin-toggleable from Tina, either in
**Site Settings → Animations** (global, applies everywhere) or on individual
**Process Flow** blocks in the Pages collection (per-section overrides). This
file documents every toggle and tunable field in one place, with its default
and where to find it.

Unless noted otherwise, all animations respect the visitor's OS/browser
`prefers-reduced-motion` setting.

---

## 1. Header logo ink-draw

**Where:** Site Settings → Animations → `Header logo draws itself in on load`
**Field:** `enableLogoAnimation` (boolean)
**Default:** **On** (opt-out — unset content keeps animating)

The header wordmark's SVG strokes draw themselves in on page load (a
`stroke-dashoffset` animation), rather than just fading in. Fires once per
full page load / hard navigation — it does not replay on Tina's live content
patches while editing.

Fixed timing (not admin-tunable):
- Outline draw: `1.3s ease forwards`
- Inner stroke: same, delayed `0.85s`
- Center dot fade-in: `0.35s ease forwards`, delayed `1.25s`

Off = logo appears instantly, no draw effect.

---

## 2. Breathing status dot

**Where:** Site Settings → Animations → `Breathing status dot beside the wordmark`
**Field:** `enableStatusDot` (boolean)
**Default:** **On** (opt-out)

A single 5px dot beside the wordmark, slowly pulsing in opacity and scale.
Renders identically on every language route (shared template for `/` and
`/de/`).

Fixed timing (not admin-tunable):
- Cycle: `3s ease-in-out infinite`
- Opacity: 0.25 → 0.85 → 0.25
- Scale: 1 → 1.5 → 1

Off = wordmark shown with no dot.

---

## 3. Process Flow connector animation

**Where:** Site Settings → Animations → **Process Flow Animation** (nested
group) → `Dots light up in sequence on Process Flow connectors`
**Field:** `processFlow.enabled` (boolean)
**Default:** **On** (opt-out)

Global on/off switch only. Off = every connector shows as a row of plain
static dots, no lighting sequence.

### Per-block tuning

Everything below lives on each **Process Flow** block itself (Pages
collection → a page → the block), not in Site Settings — every Process Flow
section on the site can look and pace differently.

| Field | Tina label | Default | Notes |
|---|---|---|---|
| `dotsPerConnector` | Dots between each step | 4 | Fewer = sparser, more = denser |
| `dotSize` | Dot size (px) | 3 | |
| `dotRestOpacity` | Resting dot opacity (0–1) | 0.14 | "Light grey" idle look |
| `dotPeakOpacity` | Lit dot opacity (0–1) | **0.85** | How dark a dot gets mid-flow — see note below |
| `flowSpeed` | Seconds per connector | 2 | How long the flow takes to cross one connector; controls overall pacing |
| `connectorGap` | Gap between dots (px) | 8 | Direct spacing between adjacent dots |
| `stepSpacing` | Space around each step label (px) | 12 | Padding on the connector-facing side of each label |

All connectors within one Process Flow block share a single master timing
cycle (`flowSpeed × number of connectors`) so only one dot is ever visibly
lit at a time, handing off connector to connector down the chain — not
several independent loops running at once.

> **Known doc/code mismatch:** the Tina field description for
> `dotPeakOpacity` currently reads "Default 0.9", but the actual fallback
> used in `SitePage.astro` (`defaultDotPeakOpacity`) is **0.85**. This file
> documents the real behavior (0.85). Worth a one-line fix in
> `tina/config.ts` to make the description match — flagging rather than
> silently changing it since it's outside this doc pass.

---

## 4. Case Study cascade reveal

**Where:** Site Settings → Animations → `Case Study fields reveal line-by-line`
**Field:** `enableCascadeReveal` (boolean)
**Default:** **On** (opt-out)

Case-study text fields (challenge / built / result, split on `|` into lines)
fade + rise into view one line at a time as the section scrolls into view,
rather than as a single block.

Fixed timing (not admin-tunable):
- Per-section reveal transition: `opacity`/`transform` `1.6s cubic-bezier(0.4,0,0.2,1)`, `0.15s` base delay
- Per-line stagger: starts at `0.25s`, `+0.14s` per subsequent line

Off = every line still gets the same fade + rise transition, but all lines
share one fixed delay — they arrive together as one block, same as every
other section on the page.

---

## 5. Text hover grow

**Where:** Site Settings → Animations → `Text lines grow slightly on hover`
**Field:** `enableTextHover` (boolean)
**Default:** **On** (opt-out)

Titles, subtitles, and body/case-study lines scale up slightly on hover.

Fixed timing (not admin-tunable):
- `transform: scale(1.045)` on hover
- Transition: `0.35s cubic-bezier(0.4,0,0.2,1)`
- Disabled entirely under `prefers-reduced-motion` regardless of this
  toggle's setting

Off = no hover effect on any text line.

---

## 6 & 7. Animated backgrounds (Depth Network / Planetary Systems)

**Where:** Site Settings → Animations → `Background style`
**Field:** `backgroundStyle` (select: `none` / `depth` / `planetary`)
**Default:** `none`

Only **one** of the two three.js backgrounds can run at a time — both are
WebGL renderers, and running both simultaneously would double the render
cost for no visual benefit. This is a single select, not two independent
booleans, specifically to make that impossible.

Both backgrounds:
- Load three.js via a runtime dynamic `import('three')`, only once their
  `<canvas>` element is confirmed to exist in the DOM — pages with
  `backgroundStyle: "none"` never download the three.js payload at all
  (~684 KB, code-split into its own chunk).
- Respect `prefers-reduced-motion`: the scene still renders once, but stops
  updating positions / doesn't loop.
- Sit `position: fixed`, full-viewport, `z-index: 0`, behind all page
  content. When either is active, the header/footer/content backgrounds
  automatically switch from opaque to a translucent version of the same
  theme color (70–82% depending on element) so the moving background shows
  through, rather than being hidden behind a solid panel.

### 6. Depth Network Background

**Where:** Site Settings → Animations → **Depth Network Background** (nested
group). Only used when Background style = "Depth network".

A field of slowly drifting points in real 3D space (perspective camera +
fog — distant points are naturally smaller and fade into the fog color, not
simulated via opacity), with faint lines drawn between any two points close
enough together.

| Field | Tina label | Default |
|---|---|---|
| `nodeCount` | Number of points | 90 |
| `connectDistance` | Connection distance | 5.4 |
| `lineOpacity` | Line opacity (0–1) | 0.16 |
| `nodeOpacity` | Point opacity (0–1) | 0.75 |
| `nodeColor` | Point colour override | *(empty — auto-matches theme text colour)* |
| `fogColor` | Fog colour override | *(empty — auto-matches theme background colour)* |

The drift volume (`BOUNDS`) scales with `nodeCount` (cube root), so raising
the point count gives a denser-looking field without needing to retune the
volume it drifts within. Connecting lines are recomputed every 8th frame,
not every frame, since the pairwise-distance check is cheap but doesn't need
to run 60×/sec.

### 7. Planetary Systems Background

**Where:** Site Settings → Animations → **Planetary Systems Background**
(nested group). Only used when Background style = "Planetary systems".

Small star-and-orbiting-planet clusters drifting through 3D space. Each
system's planets sit on their own randomly-tilted 3D orbital plane, so
orbits read as genuinely foreshortened ellipses seen from an angle, not flat
2D rings.

| Field | Tina label | Default |
|---|---|---|
| `systemCount` | Number of systems | 4 |
| `maxPlanets` | Max planets per system | 4 *(each system gets a random count from 1 up to this)* |
| `orbitMinRadius` | Orbit distance, minimum (0–1) | 0.35 |
| `orbitMaxRadius` | Orbit distance, maximum (0–1) | 1 |
| `starColor` | Star colour override | *(empty — auto-matches theme text colour; planets and orbit paths derive from this same colour at lower opacity)* |
| `pathOpacity` | Orbit path opacity (0–1) | 0.12 |

**Note:** this background's fog colour is **not** its own field — it reads
`depthBackground.fogColor` (the Depth Network group's fog override), a quirk
that predates the Task #4 field restructure and was carried over unchanged
rather than silently fixed. If you want Planetary Systems to have its own
independent fog colour, that's a small follow-up, not yet done.

### Mobile / low-power devices

There is currently **no automatic disabling** of either background based on
viewport size or device capability — that was evaluated and deliberately
rejected (see project history: an earlier pass gated on `window.innerWidth`
and `navigator.hardwareConcurrency`, but viewport width turned out to be a
poor proxy for device capability — e.g. a narrow-screen phone can easily
outperform a wide desktop browser window). The only performance controls
are:
- `prefers-reduced-motion`, respected automatically
- The manual `backgroundStyle` toggle, if a theme turns out to be too heavy
  for its actual audience

---

## Quick reference: all fields at a glance

**Site Settings → Animations (global):**

```
enableLogoAnimation          boolean   default: true
enableStatusDot              boolean   default: true
enableCascadeReveal          boolean   default: true
enableTextHover               boolean   default: true
backgroundStyle               select    default: "none"   (none | depth | planetary)

processFlow.enabled           boolean   default: true

depthBackground.nodeCount         number   default: 90
depthBackground.connectDistance   number   default: 5.4
depthBackground.lineOpacity       number   default: 0.16
depthBackground.nodeOpacity       number   default: 0.75
depthBackground.nodeColor         color    default: "" (theme text colour)
depthBackground.fogColor          color    default: "" (theme background colour)

planetarySystems.systemCount      number   default: 4
planetarySystems.maxPlanets       number   default: 4
planetarySystems.orbitMinRadius   number   default: 0.35
planetarySystems.orbitMaxRadius   number   default: 1
planetarySystems.starColor        color    default: "" (theme text colour)
planetarySystems.pathOpacity      number   default: 0.12
```

**Per Process Flow block (Pages collection):**

```
dotsPerConnector   number   default: 4
dotSize            number   default: 3
dotRestOpacity     number   default: 0.14
dotPeakOpacity     number   default: 0.85   (Tina label currently says 0.9 — see note above)
flowSpeed          number   default: 2
connectorGap       number   default: 8
stepSpacing        number   default: 12
```
