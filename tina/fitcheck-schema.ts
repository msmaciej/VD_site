// tina/fitcheck-schema.ts
//
// Fit Check content — editable in Tina, consumed by check.astro / de/check.astro.
//
// DESIGN PRINCIPLE — read before editing this file:
// Every option's underlying VALUE (business / consultant / curious, comms / sales /
// docs / ops / reporting / content / several, high / mid / low / unsure, none /
// partial / full, solve / clarity / explore / compare) is fixed as a field NAME
// below — never stored as editable text.
// calcBucket(), calcProfileKey(), and the category-follow-up matching in check.astro
// key off these exact values. Only the LABEL (what the visitor reads) is editable in
// Tina. This means someone can rewrite every question and answer on the page from the
// CMS without any risk of silently breaking the scoring logic or the category matching.
//
// Bilingual pattern follows the existing "settings" collection convention already used
// elsewhere in this repo: one shared document, EN fields plain, DE fields suffixed _de.
// (Not the separate page/page_de collection pattern — that's for repeatable page lists;
// this is a single fixed-shape config document, so it follows Site Settings instead.)

const bilingualString = (name: string, label: string, description?: string) => [
  { type: "string", name, label: `${label} (EN)`, description, ui: { component: "textarea" } },
  { type: "string", name: `${name}_de`, label: `${label} (DE)`, description },
];

// ── Q0 — Role ──────────────────────────────────────────────────────────────────
// value: business | consultant | curious   (drives calcBucket + the branch/skip logic)
const roleQuestionFields = [
  ...bilingualString("questionLabel", "Question text"),
  ...bilingualString("businessLabel", "Option — business owner/manager  [value: business]"),
  ...bilingualString("consultantLabel", "Option — consultant/agency  [value: consultant]"),
  ...bilingualString("curiousLabel", "Option — just curious  [value: curious]"),
];

// ── Q1 — Category, each with its own follow-up question ────────────────────────
// value per category: comms | sales | docs | ops | reporting | content | several
const categoryKeys = [
  { key: "comms", label: "Communication & Intake" },
  { key: "sales", label: "Lead & Sales Pipeline" },
  { key: "docs", label: "Document & Data Processing" },
  { key: "ops", label: "Internal Operations & Approvals" },
  { key: "reporting", label: "Reporting & Analytics" },
  { key: "content", label: "Content & Marketing" },
  { key: "several", label: "Several at once" },
];

const followupOptionFields = (n: number) =>
  bilingualString(`option${n}`, `Follow-up option ${n}`);

const categoryQuestionFields = [
  ...bilingualString("questionLabel", "Q1 question text"),
  ...categoryKeys.map(({ key, label }) => ({
    type: "object",
    name: key,
    label: `Category — ${label}  [value: ${key}]`,
    fields: [
      ...bilingualString("buttonLabel", "Button text shown at Q1"),
      {
        type: "object",
        name: "followup",
        label: "Follow-up question (shown only if role = business)",
        fields: [
          ...bilingualString("questionLabel", "Follow-up question text"),
          ...(key === "several"
            ? [] // "several" reuses the other 6 categories' buttonLabel as its options — no separate content needed
            : [
                ...followupOptionFields(1),
                ...followupOptionFields(2),
                ...followupOptionFields(3),
                ...followupOptionFields(4),
              ]),
        ],
      },
    ],
  })),
];

// ── Q2 — Time cost ──────────────────────────────────────────────────────────────
// value: high | mid | low | unsure   (drives calcProfileKey + calcBucket)
// Only the labels are editable here; the values above stay hardcoded in
// check.astro exactly like every other question, so the scoring can't break.
const timeQuestionFields = [
  ...bilingualString("questionLabel", "Q2 question text"),
  ...bilingualString("highLabel", "Option — more than 5h/week  [value: high]"),
  ...bilingualString("midLabel", "Option — 1–5h/week  [value: mid]"),
  ...bilingualString("lowLabel", "Option — under 1h/week  [value: low]"),
  ...bilingualString("unsureLabel", "Option — spread across team  [value: unsure]"),
];

// ── Q3 — Process ownership ──────────────────────────────────────────────────────
// value: none | partial | full
const processQuestionFields = [
  ...bilingualString("questionLabel", "Q3 question text"),
  ...bilingualString("noneLabel", "Option — no process  [value: none]"),
  ...bilingualString("partialLabel", "Option — partial process  [value: partial]"),
  ...bilingualString("fullLabel", "Option — full process  [value: full]"),
];

// ── Q4 — Goal / intent ──────────────────────────────────────────────────────────
// value: solve | clarity | explore | compare
const goalQuestionFields = [
  ...bilingualString("questionLabel", "Q4 question text"),
  ...bilingualString("solveLabel", "Option — solve it  [value: solve]"),
  ...bilingualString("clarityLabel", "Option — get clarity  [value: clarity]"),
  ...bilingualString("exploreLabel", "Option — explore  [value: explore]"),
  ...bilingualString("compareLabel", "Option — compare  [value: compare]"),
];

// ── Short close — role = consultant / curious skip straight here ───────────────
const shortCloseFields = [
  ...bilingualString("heading", "Heading"),
  ...bilingualString("body", "Body text"),
  ...bilingualString("ctaLabel", "Button text"),
];

// ── Result profiles — visitor-facing, shown after submit ───────────────────────
// Derived from time (high/mid/low/unsure) x process (none/partial/full):
//   FireFight = high time, no/partial process
//   Refine    = high time, full process
//   Build     = low/mid time, no/partial process
//   Optimize  = low/mid time, full process
// role = consultant/curious never sees a profile (they get shortClose instead).
const profileKeys = ["fireFight", "refine", "build", "optimize"];
const profileFields = profileKeys.map((key) => ({
  type: "object",
  name: key,
  label: `Profile — ${key}`,
  fields: [
    ...bilingualString("name", "Display name"),
    ...bilingualString("tagline", "One-line tagline"),
    ...bilingualString("description", "Result paragraph"),
  ],
}));

// ── Shared result framing — same for every profile, sits under the quadrant ────
// The disclaimer + CTA that make clear this is a starting point, not a verdict,
// and point toward a real Discovery conversation.
const resultSharedFields = [
  ...bilingualString("disclaimer", "Disclaimer text (shown under every profile)"),
  ...bilingualString("ctaLabel", "CTA button text"),
];

// ── Confirmation email + confirm page (verify-then-reveal) ─────────────────────
// The result is no longer shown the instant the email is typed. After the gate,
// the visitor is emailed a one-time link; opening it and tapping confirm reveals
// the result (on confirm.php) and notifies the team. These strings drive that
// email and that page. emailBody MUST contain the {{LINK}} placeholder — the
// build fails otherwise. " | " in emailBody becomes a blank line.
const confirmPageFields = [
  ...bilingualString("emailSubject", "Verification email — subject"),
  ...bilingualString("emailBody", "Verification email — body ({{LINK}} = the link; ' | ' = new paragraph)"),
  ...bilingualString("confirmHeading", "Confirm page — heading"),
  ...bilingualString("confirmBody", "Confirm page — body"),
  ...bilingualString("confirmButton", "Confirm page — button"),
  ...bilingualString("resultTag", "Reveal page — small label above the result"),
  ...bilingualString("expiredHeading", "Expired-link page — heading"),
  ...bilingualString("expiredBody", "Expired-link page — body"),
  ...bilingualString("backLabel", "Expired-link page — back-to-check link"),
];

// ── Intro screen — shown before Q0, currently the page's only entry point
// (previously none at all: /check opened directly on "Your role" with zero
// framing). Content mirrors what the home-page teaser already promises
// ("Six questions, about two minutes, leave an email, get a result") — this
// is where that promise is actually kept, right before someone commits,
// rather than on a page they've already left by the time they click through.
const introStepFields = [
  ...bilingualString("label", "Step label"),
];

const introFields = [
  { type: "boolean", name: "showIntro", label: "Show this screen before Q0",
    description: "Off = the quiz opens directly on \"Your role\", as it did before this screen existed. Also skipped automatically if Heading below is left empty, so an unfinished draft can't go live by accident." },
  ...bilingualString("heading", "Heading", "e.g. 'Is this a fit for you?'"),
  ...bilingualString("timing", "Timing line", "e.g. 'Six questions | About two minutes' — use | for a line break, same convention as everywhere else on the site."),
  {
    type: "object", list: true, name: "steps", label: "Step preview (what's asked, in order)",
    description: "A quick preview of the questions ahead — not the questions themselves (those are configured below, in Q0–Q4).",
    fields: introStepFields,
    ui: { itemProps: (item: any) => ({ label: item?.label || "Step" }) },
  },
  ...bilingualString("note", "Note under the steps", "e.g. explains the email + instant result."),
  ...bilingualString("beginLabel", "Button label", "e.g. 'Begin'"),
];

// ── Fit Check appearance (font & text size) ──────────────────────────────────
// Gives the Fit Check its OWN font controls in the CMS, independent of the
// site-wide Global Default Font. Leave the font on "Inherit" to follow Site
// Settings (the default, matching current behaviour). Text size is a single
// scale lever applied to the page's small uppercase type — the readability
// control for the "letters too small" issue, now editable without code.
const appearanceFields = [
  {
    type: "string", name: "fontPreset", label: "Fit Check Font",
    description: "Overrides the site's Global Default Font on the Fit Check page only. 'Inherit' follows Site Settings.",
    options: [
      { label: "Inherit site default",         value: ""             },
      { label: "IBM Plex Mono — Monospace",    value: "IBM Plex Mono"},
      { label: "Inter — Modern Sans",          value: "Inter"        },
      { label: "Lora — Elegant Serif",         value: "Lora"         },
      { label: "Space Mono — Monospace",       value: "Space Mono"   },
      { label: "Newsreader — Editorial",       value: "Newsreader"   },
      { label: "Custom Google Font",           value: "custom"       },
    ],
  },
  { type: "string", name: "customFontName", label: "Custom Font Name (if Custom selected)" },
  {
    // Uses the SAME size-token scale as the rest of the site (see FONT_SIZES in
    // src/utils/siteHelpers.ts). The chosen token becomes a scale factor applied
    // to the Fit Check's type, so this page sizes consistently with everything
    // else instead of via its own separate multiplier.
    type: "string", name: "baseSize", label: "Fit Check Text Size",
    description: "Base text size for the Fit Check, from the site size scale. Larger tokens scale the whole page's type up proportionally.",
    options: [
      { label: "S — 13px (compact)",  value: "sm"   },
      { label: "M — 15px (default)",  value: "base" },
      { label: "L — 17px (larger)",   value: "lg"   },
      { label: "XL — 20px (largest)", value: "xl"   },
    ],
  },
];

export const fitCheckCollection = {

  name: "fitCheck",
  label: "Fit Check",
  path: "src/content/fitcheck",
  format: "json",
  ui: {
    // Single fixed document, not a list — same UX as Site Settings.
    allowedActions: { create: false, delete: false },
  },
  fields: [
    { type: "boolean", name: "enabled", label: "Fit Check enabled — master switch",
      description: "Off = the \"Fit Check\" link disappears from the site header nav, the \"Start the Fit Check\" button hides wherever it appears (incl. the home-page teaser section), and the /check and /de/check pages show a short \"not available\" notice instead of the quiz. On = fully available everywhere. This is the single switch for the whole feature — no other toggle needs to change." },
    { type: "object", name: "appearance", label: "Appearance — font & text size", fields: appearanceFields },
    { type: "object", name: "introScreen", label: "Intro screen (shown before Q0)", fields: introFields },
    { type: "object", name: "roleQuestion", label: "Q0 — Role", fields: roleQuestionFields },
    { type: "object", name: "categoryQuestion", label: "Q1 — Category", fields: categoryQuestionFields },
    { type: "object", name: "timeQuestion", label: "Q2 — Time cost", fields: timeQuestionFields },
    { type: "object", name: "processQuestion", label: "Q3 — Process ownership", fields: processQuestionFields },
    { type: "object", name: "goalQuestion", label: "Q4 — Goal / intent", fields: goalQuestionFields },
    { type: "object", name: "shortClose", label: "Short close (role = consultant/curious)", fields: shortCloseFields },
    { type: "object", name: "profiles", label: "Result profiles", fields: profileFields },
    { type: "object", name: "resultShared", label: "Result — shared disclaimer & CTA", fields: resultSharedFields },
    { type: "object", name: "confirmPage", label: "Confirmation email & confirm page", fields: confirmPageFields },
  ],
};
