// tina/config.ts
import { defineConfig } from "tinacms";

// tina/fitcheck-schema.ts
var bilingualString = (name, label, description) => [
  { type: "string", name, label: `${label} (EN)`, description, ui: { component: "textarea" } },
  { type: "string", name: `${name}_de`, label: `${label} (DE)`, description }
];
var roleQuestionFields = [
  ...bilingualString("questionLabel", "Question text"),
  ...bilingualString("businessLabel", "Option \u2014 business owner/manager  [value: business]"),
  ...bilingualString("consultantLabel", "Option \u2014 consultant/agency  [value: consultant]"),
  ...bilingualString("curiousLabel", "Option \u2014 just curious  [value: curious]")
];
var categoryKeys = [
  { key: "comms", label: "Communication & Intake" },
  { key: "sales", label: "Lead & Sales Pipeline" },
  { key: "docs", label: "Document & Data Processing" },
  { key: "ops", label: "Internal Operations & Approvals" },
  { key: "reporting", label: "Reporting & Analytics" },
  { key: "content", label: "Content & Marketing" },
  { key: "several", label: "Several at once" }
];
var followupOptionFields = (n) => bilingualString(`option${n}`, `Follow-up option ${n}`);
var categoryQuestionFields = [
  ...bilingualString("questionLabel", "Q1 question text"),
  ...categoryKeys.map(({ key, label }) => ({
    type: "object",
    name: key,
    label: `Category \u2014 ${label}  [value: ${key}]`,
    fields: [
      ...bilingualString("buttonLabel", "Button text shown at Q1"),
      {
        type: "object",
        name: "followup",
        label: "Follow-up question (shown only if role = business)",
        fields: [
          ...bilingualString("questionLabel", "Follow-up question text"),
          ...key === "several" ? [] : [
            ...followupOptionFields(1),
            ...followupOptionFields(2),
            ...followupOptionFields(3),
            ...followupOptionFields(4)
          ]
        ]
      }
    ]
  }))
];
var timeQuestionFields = [
  ...bilingualString("questionLabel", "Q2 question text"),
  ...bilingualString("highLabel", "Option \u2014 more than 5h/week  [value: high]"),
  ...bilingualString("midLabel", "Option \u2014 1\u20135h/week  [value: mid]"),
  ...bilingualString("lowLabel", "Option \u2014 under 1h/week  [value: low]"),
  ...bilingualString("unsureLabel", "Option \u2014 spread across team  [value: unsure]")
];
var processQuestionFields = [
  ...bilingualString("questionLabel", "Q3 question text"),
  ...bilingualString("noneLabel", "Option \u2014 no process  [value: none]"),
  ...bilingualString("partialLabel", "Option \u2014 partial process  [value: partial]"),
  ...bilingualString("fullLabel", "Option \u2014 full process  [value: full]")
];
var goalQuestionFields = [
  ...bilingualString("questionLabel", "Q4 question text"),
  ...bilingualString("solveLabel", "Option \u2014 solve it  [value: solve]"),
  ...bilingualString("clarityLabel", "Option \u2014 get clarity  [value: clarity]"),
  ...bilingualString("exploreLabel", "Option \u2014 explore  [value: explore]"),
  ...bilingualString("compareLabel", "Option \u2014 compare  [value: compare]")
];
var shortCloseFields = [
  ...bilingualString("heading", "Heading"),
  ...bilingualString("body", "Body text"),
  ...bilingualString("ctaLabel", "Button text")
];
var profileKeys = ["fireFight", "refine", "build", "optimize"];
var profileFields = profileKeys.map((key) => ({
  type: "object",
  name: key,
  label: `Profile \u2014 ${key}`,
  fields: [
    ...bilingualString("name", "Display name"),
    ...bilingualString("tagline", "One-line tagline"),
    ...bilingualString("description", "Result paragraph")
  ]
}));
var resultSharedFields = [
  ...bilingualString("disclaimer", "Disclaimer text (shown under every profile)"),
  ...bilingualString("ctaLabel", "CTA button text")
];
var confirmPageFields = [
  ...bilingualString("emailSubject", "Verification email \u2014 subject"),
  ...bilingualString("emailBody", "Verification email \u2014 body ({{LINK}} = the link; ' | ' = new paragraph)"),
  ...bilingualString("confirmHeading", "Confirm page \u2014 heading"),
  ...bilingualString("confirmBody", "Confirm page \u2014 body"),
  ...bilingualString("confirmButton", "Confirm page \u2014 button"),
  ...bilingualString("resultTag", "Reveal page \u2014 small label above the result"),
  ...bilingualString("expiredHeading", "Expired-link page \u2014 heading"),
  ...bilingualString("expiredBody", "Expired-link page \u2014 body"),
  ...bilingualString("backLabel", "Expired-link page \u2014 back-to-check link")
];
var appearanceFields = [
  {
    type: "string",
    name: "fontPreset",
    label: "Fit Check Font",
    description: "Overrides the site's Global Default Font on the Fit Check page only. 'Inherit' follows Site Settings.",
    options: [
      { label: "Inherit site default", value: "" },
      { label: "IBM Plex Mono \u2014 Monospace", value: "IBM Plex Mono" },
      { label: "Inter \u2014 Modern Sans", value: "Inter" },
      { label: "Lora \u2014 Elegant Serif", value: "Lora" },
      { label: "Space Mono \u2014 Monospace", value: "Space Mono" },
      { label: "Newsreader \u2014 Editorial", value: "Newsreader" },
      { label: "Custom Google Font", value: "custom" }
    ]
  },
  { type: "string", name: "customFontName", label: "Custom Font Name (if Custom selected)" },
  {
    // Uses the SAME size-token scale as the rest of the site (see FONT_SIZES in
    // src/utils/siteHelpers.ts). The chosen token becomes a scale factor applied
    // to the Fit Check's type, so this page sizes consistently with everything
    // else instead of via its own separate multiplier.
    type: "string",
    name: "baseSize",
    label: "Fit Check Text Size",
    description: "Base text size for the Fit Check, from the site size scale. Larger tokens scale the whole page's type up proportionally.",
    options: [
      { label: "S \u2014 13px (compact)", value: "sm" },
      { label: "M \u2014 15px (default)", value: "base" },
      { label: "L \u2014 17px (larger)", value: "lg" },
      { label: "XL \u2014 20px (largest)", value: "xl" }
    ]
  }
];
var fitCheckCollection = {
  name: "fitCheck",
  label: "Fit Check",
  path: "src/content/fitcheck",
  format: "json",
  ui: {
    // Single fixed document, not a list — same UX as Site Settings.
    allowedActions: { create: false, delete: false }
  },
  fields: [
    {
      type: "boolean",
      name: "enabled",
      label: "Fit Check enabled \u2014 master switch",
      description: 'Off = the "Fit Check" link disappears from the site header nav, the "Start the Fit Check" button hides wherever it appears (incl. the home-page teaser section), and the /check and /de/check pages show a short "not available" notice instead of the quiz. On = fully available everywhere. This is the single switch for the whole feature \u2014 no other toggle needs to change.'
    },
    { type: "object", name: "appearance", label: "Appearance \u2014 font & text size", fields: appearanceFields },
    { type: "object", name: "roleQuestion", label: "Q0 \u2014 Role", fields: roleQuestionFields },
    { type: "object", name: "categoryQuestion", label: "Q1 \u2014 Category", fields: categoryQuestionFields },
    { type: "object", name: "timeQuestion", label: "Q2 \u2014 Time cost", fields: timeQuestionFields },
    { type: "object", name: "processQuestion", label: "Q3 \u2014 Process ownership", fields: processQuestionFields },
    { type: "object", name: "goalQuestion", label: "Q4 \u2014 Goal / intent", fields: goalQuestionFields },
    { type: "object", name: "shortClose", label: "Short close (role = consultant/curious)", fields: shortCloseFields },
    { type: "object", name: "profiles", label: "Result profiles", fields: profileFields },
    { type: "object", name: "resultShared", label: "Result \u2014 shared disclaimer & CTA", fields: resultSharedFields },
    { type: "object", name: "confirmPage", label: "Confirmation email & confirm page", fields: confirmPageFields }
  ]
};

// tina/config.ts
var fontTypeOptions = [
  { label: "Inherit global font", value: "" },
  { label: "Inter \u2014 Modern Sans", value: "Inter" },
  { label: "Lora \u2014 Elegant Serif", value: "Lora" },
  { label: "IBM Plex Mono \u2014 Monospace (7 weights)", value: "IBM Plex Mono" },
  { label: "Space Mono \u2014 Monospace (only 400 + 700)", value: "Space Mono" },
  { label: "Newsreader \u2014 Editorial Serif", value: "Newsreader" }
];
var fontSizeOptions = [
  { label: "2XS \u2014 9px (meta / attribution)", value: "2xs" },
  { label: "XS \u2014 11px (labels, tracked caps)", value: "xs" },
  { label: "S \u2014 13px (small label / step)", value: "sm" },
  { label: "M \u2014 15px (base body)", value: "base" },
  { label: "L \u2014 17px (body, recommended)", value: "lg" },
  { label: "XL \u2014 20px (large body)", value: "xl" },
  { label: "2XL \u2014 24px (statement)", value: "2xl" },
  { label: "3XL \u2014 28\u219234px (display)", value: "3xl" },
  { label: "4XL \u2014 34\u219244px (display)", value: "4xl" },
  { label: "5XL \u2014 44\u219256px (hero)", value: "5xl" },
  { label: "6XL \u2014 56\u219272px (hero)", value: "6xl" }
];
var fontWeightOptions = [
  { label: "Thin (100)", value: "font-thin" },
  { label: "Light (300)", value: "font-light" },
  { label: "Regular (400)", value: "font-normal" },
  { label: "Medium (500)", value: "font-medium" },
  { label: "Semibold (600)", value: "font-semibold" },
  { label: "Bold (700)", value: "font-bold" }
];
var noticeSizeOptions = [
  { label: "XS \u2014 10px", value: "10px" },
  { label: "S \u2014 11px", value: "11px" },
  { label: "M \u2014 12px", value: "12px" },
  { label: "L \u2014 13px", value: "13px" },
  { label: "XL \u2014 14px", value: "14px" }
];
var noticeWeightOptions = [
  { label: "Thin (100)", value: "100" },
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Semibold (600)", value: "600" },
  { label: "Bold (700)", value: "700" }
];
var cueStyleOptions = [
  { label: "Dot \u2014 one breathing dot (default, most subtle)", value: "dot" },
  { label: "Dots \u2014 a trio of dots (a little more explicit)", value: "dots" },
  { label: "Dot + word \u2014 dot beside a short word (clearest)", value: "dot-label" }
];
var pageTemplates = [
  {
    name: "section",
    label: "Page Section",
    ui: {
      itemProps: (item) => ({ label: item?.title || "Unnamed Section" })
    },
    fields: [
      { type: "string", name: "title", label: "Title text" },
      { type: "string", name: "titleFont", label: "Title \u2014 Font", options: fontTypeOptions },
      { type: "string", name: "titleFontSize", label: "Title \u2014 Size", options: fontSizeOptions },
      { type: "string", name: "titleFontWeight", label: "Title \u2014 Weight", options: fontWeightOptions },
      { type: "string", name: "subTitle", label: "Sub-title text" },
      { type: "string", name: "subTitleFont", label: "Sub-title \u2014 Font", options: fontTypeOptions },
      { type: "string", name: "subTitleFontSize", label: "Sub-title \u2014 Size", options: fontSizeOptions },
      { type: "string", name: "subTitleFontWeight", label: "Sub-title \u2014 Weight", options: fontWeightOptions },
      { type: "string", name: "content", label: "Body text (use | for line breaks)", ui: { component: "textarea" } },
      { type: "string", name: "bodyFont", label: "Body \u2014 Font", options: fontTypeOptions },
      { type: "string", name: "fontSize", label: "Body \u2014 Size", options: fontSizeOptions },
      { type: "string", name: "fontWeight", label: "Body \u2014 Weight", options: fontWeightOptions },
      // ── Visibility & folding ──────────────────────────────────────────────
      // The three "Show …" switches are ON unless you turn them off (a fresh
      // section with none of them touched shows everything, exactly as before).
      {
        type: "boolean",
        name: "showTitle",
        label: "Show the title",
        description: "On unless switched off. Off = hide the title on this section."
      },
      {
        type: "boolean",
        name: "showSubtitle",
        label: "Show the sub-title",
        description: "On unless switched off. Off = hide the sub-title on this section."
      },
      {
        type: "boolean",
        name: "showBody",
        label: "Show the body text",
        description: "On unless switched off. Off = hide the body on this section."
      },
      {
        type: "boolean",
        name: "foldBody",
        label: "Fold the body (reveal on click)",
        description: "Off = body shows straight away (normal). On = body starts hidden behind a small cue and opens when a visitor clicks it. Leave off for one-line sections and the contact block."
      },
      {
        type: "string",
        name: "cueStyle",
        label: "Reveal cue style",
        options: cueStyleOptions,
        description: "Only used when 'Fold the body' is on. How visible the click-to-open cue is."
      },
      {
        type: "string",
        name: "cueLabel",
        label: "Reveal cue word",
        description: "Only used with the 'Dot + word' cue. The short word beside the dot \u2014 e.g. More (EN) / Mehr (DE). Defaults to More/Mehr if left empty."
      },
      {
        type: "string",
        name: "cueLabelOpen",
        label: "Reveal cue word \u2014 open",
        description: "Only used with the 'Dot + word' cue. The word shown once open \u2014 e.g. Less (EN) / Weniger (DE). Defaults to Less/Weniger if left empty."
      },
      {
        type: "object",
        list: true,
        name: "groups",
        label: "Folding groups (optional)",
        description: "Higher-order areas shown on screen. Click one and its sub-areas unfold; the previously open one folds. Use INSTEAD of a long sub-title list.",
        ui: { itemProps: (item) => ({ label: item?.label || "Group" }) },
        fields: [
          { type: "string", name: "label", label: "Group label" },
          {
            type: "string",
            name: "intro",
            label: "Group description (one line, optional)",
            description: "Shown under the group name when it opens.",
            ui: { component: "textarea" }
          },
          {
            type: "boolean",
            name: "showIntro",
            label: "Show this group's description",
            description: "Off = hide just this group's description, keep its name. (Needs the master 'Show group descriptions' on.)"
          },
          {
            type: "object",
            list: true,
            name: "items",
            label: "Sub-areas",
            ui: { itemProps: (item) => ({ label: item?.label || "Sub-area" }) },
            fields: [
              { type: "string", name: "label", label: "Sub-area label" },
              {
                type: "string",
                name: "problem",
                label: "Problem (1-2 sentences, optional)",
                ui: { component: "textarea" }
              },
              {
                type: "string",
                name: "handled",
                label: "What we do + what stays with you (optional)",
                ui: { component: "textarea" }
              },
              {
                type: "boolean",
                name: "showCopy",
                label: "Show this sub-area's description",
                description: "Off = show just the name. Use to keep 2-3 flagship items per group and leave the rest as names. (Needs the master 'Show sub-area descriptions' on.)"
              }
            ]
          }
        ]
      },
      {
        type: "boolean",
        name: "showGroupIntros",
        label: "Show group descriptions (master)",
        description: "Master switch for the one-line description under each group name."
      },
      {
        type: "boolean",
        name: "showItemCopy",
        label: "Show sub-area descriptions (master)",
        description: "Master switch for the problem / what-we-do text under each sub-area."
      },
      // ── Card grid (optional) ───────────────────────────────────────────────
      // The always-visible counterpart to "Folding groups": a handful of short
      // points that should all read at a glance, no click required. Use for
      // 3-6 short points; use Folding groups instead once there's real depth
      // to tuck away (problem/handled copy, more than ~6 items).
      {
        type: "object",
        list: true,
        name: "cards",
        label: "Card grid (optional)",
        description: "A small set of always-visible cards \u2014 index number, short title, one line. Use INSTEAD of stacked sentences for 3-6 short points that should all be readable at a glance, with nothing hidden behind a click. For long or many-item lists, use 'Folding groups' above instead.",
        ui: { itemProps: (item) => ({ label: item?.title || "Card" }) },
        fields: [
          { type: "string", name: "title", label: "Card title (a few words)" },
          { type: "string", name: "line", label: "One line", ui: { component: "textarea" } }
        ]
      },
      { type: "string", name: "cardColumns", label: "Card grid columns", options: [
        { label: "2 Columns", value: "grid-cols-2" },
        { label: "3 Columns", value: "grid-cols-3" },
        { label: "4 Columns", value: "grid-cols-4" }
      ] },
      { type: "string", name: "cardGridSpacing", label: "Space above the card grid (optional, overrides site default)", options: [
        { label: "Default \u2014 inherit site-wide setting", value: "" },
        { label: "None \u2014 flush against sub-title", value: "mt-0" },
        { label: "Small", value: "mt-3" },
        { label: "Medium", value: "mt-6" },
        { label: "Large", value: "mt-10" }
      ] },
      { type: "string", name: "cardTitleFont", label: "Card title \u2014 Font (optional, overrides site default)", options: fontTypeOptions },
      { type: "string", name: "cardTitleFontSize", label: "Card title \u2014 Size (optional, overrides site default)", options: fontSizeOptions },
      { type: "string", name: "cardTitleFontWeight", label: "Card title \u2014 Weight (optional, overrides site default)", options: fontWeightOptions },
      { type: "string", name: "cardLineFont", label: "Card line \u2014 Font (optional, overrides site default)", options: fontTypeOptions },
      { type: "string", name: "cardLineFontSize", label: "Card line \u2014 Size (optional, overrides site default)", options: fontSizeOptions },
      { type: "string", name: "cardLineFontWeight", label: "Card line \u2014 Weight (optional, overrides site default)", options: fontWeightOptions },
      {
        type: "string",
        name: "meta",
        label: "Meta line (optional)",
        description: "Small, quiet line under the body \u2014 location, signature. Sized with the contact links, not the body copy."
      },
      { type: "string", name: "email", label: "Contact Email (optional)" },
      {
        type: "string",
        name: "phone",
        label: "Contact Phone (optional)",
        description: "Renders as a tap-to-call link. Leave empty until a company number exists \u2014 do not publish a private mobile."
      },
      // ── Optional link button (same style as the Fit Check button) ─────────
      {
        type: "string",
        name: "ctaLabel",
        label: "Button label (optional)",
        description: "Leave empty for no button. Fill in to show a link button under this section \u2014 e.g. 'How we handle your data'."
      },
      {
        type: "string",
        name: "ctaUrl",
        label: "Button link (optional)",
        description: "Where the button goes \u2014 e.g. /data. A '/\u2026' link is prefixed with /de automatically on the German site. A '/data' button hides itself automatically when the Data Page is switched off."
      },
      { type: "boolean", name: "showArt", label: "Activate Art Gallery?" },
      { type: "string", name: "columns", label: "Gallery columns", options: [
        { label: "2 Columns", value: "grid-cols-2" },
        { label: "3 Columns", value: "grid-cols-3" },
        { label: "4 Columns", value: "grid-cols-4" }
      ] },
      { type: "boolean", name: "enabled", label: "Section Enabled" }
    ]
  },
  {
    name: "processFlow",
    label: "Process Flow",
    ui: {
      itemProps: (item) => ({ label: item?.title || "Process Flow" })
    },
    fields: [
      { type: "string", name: "title", label: "Section Title" },
      { type: "string", name: "titleFont", label: "Title \u2014 Font", options: fontTypeOptions },
      { type: "string", name: "titleFontSize", label: "Title \u2014 Size", options: fontSizeOptions },
      { type: "string", name: "titleFontWeight", label: "Title \u2014 Weight", options: fontWeightOptions },
      {
        type: "string",
        name: "subTitle",
        label: "Sub-title (above the steps)",
        description: "Says what the flow is FOR. Use | for line breaks; a segment of only dots renders as a drawn divider."
      },
      { type: "string", name: "subTitleFont", label: "Sub-title \u2014 Font", options: fontTypeOptions },
      { type: "string", name: "subTitleFontSize", label: "Sub-title \u2014 Size", options: fontSizeOptions },
      { type: "string", name: "subTitleFontWeight", label: "Sub-title \u2014 Weight", options: fontWeightOptions },
      { type: "string", name: "orientation", label: "Arrow Direction", options: [
        { label: "Vertical \u2193  (stacked)", value: "vertical" },
        { label: "Horizontal \u2192 (inline)", value: "horizontal" }
      ] },
      { type: "string", name: "stepFont", label: "Steps \u2014 Font", options: fontTypeOptions },
      { type: "string", name: "stepFontSize", label: "Steps \u2014 Size", options: fontSizeOptions },
      { type: "string", name: "stepFontWeight", label: "Steps \u2014 Weight", options: fontWeightOptions },
      {
        type: "object",
        list: true,
        name: "steps",
        label: "Process Steps",
        fields: [
          { type: "string", name: "label", label: "Step Label" },
          { type: "string", name: "font", label: "Override Font (optional)", options: fontTypeOptions },
          { type: "string", name: "fontSize", label: "Override Size (optional)", options: fontSizeOptions },
          { type: "string", name: "fontWeight", label: "Override Weight (optional)", options: fontWeightOptions }
        ],
        ui: { itemProps: (item) => ({ label: item?.label || "Step" }) }
      },
      // ── Connector dot animation ────────────────────────────────────────
      {
        type: "number",
        name: "dotsPerConnector",
        label: "Dots between each step",
        description: "Default 4. Fewer dots = sparser, cleaner look; more = denser."
      },
      {
        type: "number",
        name: "dotSize",
        label: "Dot size (px)",
        description: "Default 3."
      },
      {
        type: "number",
        name: "dotRestOpacity",
        label: "Resting dot opacity (0\u20131)",
        description: "Default 0.14. Lower = lighter grey at rest."
      },
      {
        type: "number",
        name: "dotPeakOpacity",
        label: "Lit dot opacity (0\u20131)",
        description: "Default 0.9. How dark a dot gets as the flow passes through it."
      },
      {
        type: "number",
        name: "flowSpeed",
        label: "Seconds per connector",
        description: "Default 2. How long the flow takes to cross each connector \u2014 controls overall pacing."
      },
      {
        type: "number",
        name: "connectorGap",
        label: "Gap between dots (px)",
        description: "Default 8. Direct spacing between adjacent dots."
      },
      {
        type: "number",
        name: "stepSpacing",
        label: "Space around each step label (px)",
        description: "Default 12. Padding on the side facing the connector \u2014 the main driver of total distance between step texts (combined with the dot gap above)."
      },
      {
        type: "string",
        name: "content",
        label: "Explainer text (use | for line breaks)",
        description: "Optional. Sits under the drawn steps. A segment made only of dots (... / .. / .) renders as a drawn dot divider.",
        ui: { component: "textarea" }
      },
      { type: "string", name: "fontSize", label: "Explainer \u2014 Size", options: fontSizeOptions },
      { type: "string", name: "fontWeight", label: "Explainer \u2014 Weight", options: fontWeightOptions },
      {
        type: "string",
        name: "ctaLabel",
        label: "Button label (optional)",
        description: "e.g. Start the Fit Check. Leave empty for no button."
      },
      {
        type: "string",
        name: "ctaUrl",
        label: "Button link (optional)",
        description: "e.g. /check \u2014 the /de prefix is added automatically on the German page."
      },
      // ── Visibility & folding ──────────────────────────────────────────────
      // "Show …" switches are ON unless turned off. Two independent folds are
      // possible: the steps, and the explainer text. Normally you'd use one.
      {
        type: "boolean",
        name: "showTitle",
        label: "Show the title",
        description: "On unless switched off."
      },
      {
        type: "boolean",
        name: "showSubtitle",
        label: "Show the sub-title (above the steps)",
        description: "On unless switched off."
      },
      {
        type: "boolean",
        name: "showBody",
        label: "Show the explainer text",
        description: "On unless switched off."
      },
      {
        type: "boolean",
        name: "foldProcess",
        label: "Fold the steps (reveal on click)",
        description: "Off = steps show straight away (normal). On = the steps start hidden behind a small cue and open when a visitor clicks it."
      },
      {
        type: "boolean",
        name: "foldBody",
        label: "Fold the explainer text (reveal on click)",
        description: "Off = explainer shows straight away. On = it starts hidden behind the cue and opens on click."
      },
      {
        type: "string",
        name: "cueStyle",
        label: "Reveal cue style",
        options: cueStyleOptions,
        description: "Only used when one of the folds above is on. How visible the click-to-open cue is."
      },
      {
        type: "string",
        name: "cueLabel",
        label: "Reveal cue word",
        description: "Only used with the 'Dot + word' cue. Defaults to More/Mehr if left empty."
      },
      {
        type: "string",
        name: "cueLabelOpen",
        label: "Reveal cue word \u2014 open",
        description: "Only used with the 'Dot + word' cue. Shown once open. Defaults to Less/Weniger if left empty."
      },
      { type: "boolean", name: "enabled", label: "Section Enabled" }
    ]
  },
  {
    name: "caseStudy",
    label: "Case Study",
    ui: {
      itemProps: (item) => ({ label: item?.industry ? `Case Study \u2014 ${item.industry}` : "Case Study" })
    },
    fields: [
      {
        type: "string",
        name: "industry",
        label: "Industry / Sector",
        description: "e.g. International Trade"
      },
      {
        type: "string",
        name: "client",
        label: "Client name (optional)",
        description: "Only fill this in once the client has explicitly approved being named. Empty = anonymous case study, as before."
      },
      { type: "string", name: "location", label: "Location", description: "e.g. Switzerland" },
      {
        type: "string",
        name: "package",
        label: "Package Used",
        description: "e.g. Basic + AI Triage"
      },
      { type: "string", name: "timeline", label: "Timeline to Go-live", description: "e.g. 4 weeks" },
      {
        type: "string",
        name: "challenge",
        label: "Challenge",
        description: "The problem \u2014 no internal detail, no client specifics",
        ui: { component: "textarea" }
      },
      {
        type: "string",
        name: "built",
        label: "What Was Built",
        description: "High-level only \u2014 no tools, no routing logic",
        ui: { component: "textarea" }
      },
      {
        type: "string",
        name: "result",
        label: "Result",
        description: "Business outcome in plain language",
        ui: { component: "textarea" }
      },
      { type: "string", name: "titleFont", label: "Industry Title \u2014 Font", options: fontTypeOptions },
      { type: "string", name: "titleFontSize", label: "Industry Title \u2014 Size", options: fontSizeOptions },
      { type: "string", name: "titleFontWeight", label: "Industry Title \u2014 Weight", options: fontWeightOptions },
      { type: "string", name: "bodyFont", label: "Body Text \u2014 Font", options: fontTypeOptions },
      { type: "string", name: "bodyFontSize", label: "Body Text \u2014 Size", options: fontSizeOptions },
      { type: "string", name: "bodyFontWeight", label: "Body Text \u2014 Weight", options: fontWeightOptions },
      { type: "string", name: "labelFont", label: "Labels \u2014 Font", options: fontTypeOptions },
      { type: "string", name: "labelFontSize", label: "Labels \u2014 Size", options: fontSizeOptions },
      { type: "string", name: "labelFontWeight", label: "Labels \u2014 Weight", options: fontWeightOptions },
      { type: "string", name: "metaFont", label: "Meta Text \u2014 Font", options: fontTypeOptions },
      { type: "string", name: "metaFontSize", label: "Meta Text \u2014 Size", options: fontSizeOptions },
      { type: "boolean", name: "enabled", label: "Section Enabled" }
    ]
  },
  {
    name: "testimonial",
    label: "Testimonial",
    ui: {
      itemProps: (item) => ({ label: item?.attributionOrg ? `Testimonial \u2014 ${item.attributionOrg}` : "Testimonial" })
    },
    fields: [
      { type: "string", name: "quote", label: "Quote", ui: { component: "textarea" } },
      {
        type: "string",
        name: "attributionName",
        label: "Attribution \u2014 Name",
        description: "e.g. Management \u2014 avoid a full personal name unless the client has approved it"
      },
      { type: "string", name: "attributionOrg", label: "Attribution \u2014 Organization" },
      { type: "string", name: "quoteFontSize", label: "Quote \u2014 Size", options: fontSizeOptions },
      { type: "string", name: "quoteFontWeight", label: "Quote \u2014 Weight", options: fontWeightOptions },
      { type: "string", name: "metaFontSize", label: "Attribution \u2014 Size", options: fontSizeOptions },
      { type: "boolean", name: "enabled", label: "Section Enabled" }
    ]
  }
];
var pageFields = [
  {
    type: "object",
    list: true,
    name: "blocks",
    label: "Page Sections",
    ui: {
      // @ts-ignore
      itemProps: (item) => ({ label: item?.title || item?.industry || "Section" })
    },
    templates: pageTemplates
  }
];
var config_default = defineConfig({
  branch: "main",
  clientId: null,
  token: null,
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "uploads", publicFolder: "public" } },
  schema: {
    collections: [
      // ── PAGES (EN) ────────────────────────────────────────────────────────
      {
        name: "page",
        label: "Pages (EN)",
        path: "src/content/pages/en",
        format: "json",
        fields: pageFields
      },
      // ── PAGES (DE) ────────────────────────────────────────────────────────
      {
        name: "page_de",
        label: "Pages (DE)",
        path: "src/content/pages/de",
        format: "json",
        fields: pageFields
      },
      // ── SITE SETTINGS ─────────────────────────────────────────────────────
      {
        name: "settings",
        label: "Site Settings",
        path: "src/content/settings",
        format: "json",
        fields: [
          // ── Site status (maintenance / in-preparation gate) ───────────────
          // "live" = normal site. The other two swap the ENTIRE public site
          // (home, /check, /data, EN + DE) for one full-screen notice that
          // carries the same animated background. After changing this you must
          // run `npm run build` and upload dist/. The Tina admin (/admin) is
          // never gated, so you can always come back here and set it to Live.
          // See _docs/README-SITE-STATUS.md.
          {
            type: "string",
            name: "siteStatus",
            label: "Site status",
            description: "Live = site works normally. In preparation / Maintenance = the whole public site is replaced by ONE full-screen notice (with the same animated background), and no other page stays reachable. Remember: run a build and upload dist/ after changing this.",
            options: [
              { label: "Live \u2014 normal site", value: "live" },
              { label: "In preparation \u2014 not yet commercially active (RAV wording)", value: "preparation" },
              { label: "Maintenance \u2014 temporarily offline, back soon", value: "maintenance" }
            ]
          },
          {
            type: "object",
            name: "siteStatusContent",
            label: "Site status \u2014 custom wording (optional)",
            description: "Leave everything empty to use the built-in bilingual defaults. Fill only the lines you want to override.",
            fields: [
              { type: "string", name: "preparationBadge_de", label: "In preparation \u2014 badge (DE)" },
              { type: "string", name: "preparationBadge_en", label: "In preparation \u2014 badge (EN)" },
              { type: "string", name: "preparationMessage_de", label: "In preparation \u2014 message (DE)", ui: { component: "textarea" } },
              { type: "string", name: "preparationMessage_en", label: "In preparation \u2014 message (EN)", ui: { component: "textarea" } },
              { type: "string", name: "maintenanceBadge_de", label: "Maintenance \u2014 badge (DE)" },
              { type: "string", name: "maintenanceBadge_en", label: "Maintenance \u2014 badge (EN)" },
              { type: "string", name: "maintenanceMessage_de", label: "Maintenance \u2014 message (DE)", ui: { component: "textarea" } },
              { type: "string", name: "maintenanceMessage_en", label: "Maintenance \u2014 message (EN)", ui: { component: "textarea" } }
            ]
          },
          // ── Hero: Main title + Subtitle (EN + DE) ──────────────────────────
          { type: "object", name: "hero", label: "Hero (main title & subtitle)", fields: [
            { type: "string", name: "siteName", label: "Main title text (e.g. VortexDeep)" },
            { type: "string", name: "siteNameFont", label: "Main title \u2014 Font", options: fontTypeOptions },
            { type: "string", name: "siteNameFontSize", label: "Main title \u2014 Size", options: fontSizeOptions },
            { type: "string", name: "siteNameFontWeight", label: "Main title \u2014 Weight", options: fontWeightOptions },
            {
              type: "string",
              name: "subSiteName",
              label: "Subtitle (EN) \u2014 use | for line breaks",
              description: "e.g. Practical AI automation | for small business"
            },
            {
              type: "string",
              name: "subSiteName_de",
              label: "Subtitle (DE) \u2014 use | for line breaks",
              description: "e.g. Praktische KI-Automatisierung | f\xFCr KMU"
            },
            { type: "string", name: "subSiteNameFont", label: "Subtitle \u2014 Font", options: fontTypeOptions },
            { type: "string", name: "subSiteNameFontSize", label: "Subtitle \u2014 Size", options: fontSizeOptions },
            { type: "string", name: "subSiteNameFontWeight", label: "Subtitle \u2014 Weight", options: fontWeightOptions },
            { type: "string", name: "subSiteNameTracking", label: "Subtitle \u2014 Letter Spacing", options: [
              { label: "Tight  \u2014 0.25em", value: "tracking-[0.25em]" },
              { label: "Normal \u2014 0.5em", value: "tracking-[0.5em]" },
              { label: "Wide   \u2014 1.2em (matches page sections)", value: "tracking-[1.2em]" },
              { label: "Wider  \u2014 1.5em", value: "tracking-[1.5em]" }
            ] },
            { type: "boolean", name: "showSubSiteNameOnly", label: "Show subtitle only (hide main title)" }
          ] },
          // ── Notice banner (small strip under the header, on the live site) ─
          { type: "object", name: "noticeBanner", label: "Notice banner", fields: [
            { type: "boolean", name: "noticeBannerEnabled", label: "Show notice banner (small strip under the header)" },
            { type: "string", name: "noticeBannerText_en", label: "Notice banner text (EN)", description: "e.g. In preparation \u2014 leave empty or switch off to hide" },
            { type: "string", name: "noticeBannerText_de", label: "Notice banner text (DE)", description: "e.g. In Vorbereitung" },
            { type: "string", name: "noticeBannerBody_en", label: "Notice banner \u2014 longer explanation (EN, optional)", ui: { component: "textarea" }, description: "Shown as small text under the banner pill. Leave empty to show only the pill." },
            { type: "string", name: "noticeBannerBody_de", label: "Notice banner \u2014 longer explanation (DE, optional)", ui: { component: "textarea" } },
            { type: "string", name: "noticeBannerStyle", label: "Notice banner \u2014 style / placement", options: [
              { label: "Ribbon under header (flowing text)", value: "ribbon" },
              { label: "Stacked under header (no motion)", value: "stacked" },
              { label: "Pill only", value: "pill" }
            ] },
            { type: "string", name: "noticeBannerFlowSeconds", label: "Ribbon flow speed (ribbon style only)", options: [
              { label: "Very slow", value: "48" },
              { label: "Slow", value: "34" },
              { label: "Medium", value: "24" }
            ] },
            { type: "string", name: "noticeBannerDot", label: "Notice banner \u2014 dot", options: [
              { label: "Static glow (recommended)", value: "static" },
              { label: "Animated (pulsing)", value: "animated" },
              { label: "None", value: "none" }
            ] },
            { type: "string", name: "noticeBannerTextFontSize", label: "Notice banner \u2014 pill text size", options: noticeSizeOptions },
            { type: "string", name: "noticeBannerTextFontWeight", label: "Notice banner \u2014 pill text weight", options: noticeWeightOptions },
            { type: "string", name: "noticeBannerBodyFontSize", label: "Notice banner \u2014 longer text size", options: noticeSizeOptions },
            { type: "string", name: "noticeBannerBodyFontWeight", label: "Notice banner \u2014 longer text weight", options: noticeWeightOptions }
          ] },
          // ── Header ────────────────────────────────────────────────────────
          { type: "object", name: "header", label: "Header", fields: [
            { type: "string", name: "headerLayout", label: "Header Layout Style", options: [
              { label: "Centered (Links Below Title)", value: "centered" },
              { label: "Centered (Links Above Title)", value: "centered-top" },
              { label: "Left Aligned (Split)", value: "split" }
            ] },
            { type: "string", name: "headerLinksFontSize", label: "Header Links Size", options: fontSizeOptions },
            {
              type: "object",
              list: true,
              name: "navLinks",
              label: "Header Navigation Links",
              fields: [
                { type: "string", name: "label", label: "Link Label (EN)" },
                { type: "string", name: "label_de", label: "Link Label (DE)" },
                { type: "string", name: "url", label: "URL (e.g. /check) \u2014 /de is added automatically for DE" }
              ],
              ui: { itemProps: (item) => ({ label: item?.label || "New Link" }) }
            }
          ] },
          // ── Footer ────────────────────────────────────────────────────────
          { type: "object", name: "footer", label: "Footer", fields: [
            { type: "string", name: "footerText", label: "Footer Text (overrides copyright)" },
            { type: "boolean", name: "showFooterLine", label: "Show separator line above footer" },
            { type: "string", name: "footerTextFontSize", label: "Footer text size", options: fontSizeOptions },
            {
              type: "object",
              list: true,
              name: "socialLinks",
              label: "Footer Social Links",
              fields: [
                { type: "string", name: "platform", label: "Platform (e.g. LinkedIn, Facebook)" },
                { type: "string", name: "url", label: "Profile URL" }
              ],
              ui: { itemProps: (item) => ({ label: item?.platform || "New Social Link" }) }
            }
          ] },
          // ── TYPOGRAPHY — site-wide defaults by role (grouped) ───────────────
          // Set size + weight ONCE per role here and every page block inherits
          // it, so you don't hunt through each block. A block can still override
          // its own size/weight in the page editor; blank there = inherit these.
          {
            type: "object",
            name: "typography",
            label: "Typography \u2014 site-wide text defaults",
            description: "Titles, sub-titles and body text across all pages inherit these unless a block overrides them.",
            fields: [
              { type: "object", name: "title", label: "Titles (bold headings)", fields: [
                { type: "string", name: "font", label: "Font", options: fontTypeOptions },
                { type: "string", name: "size", label: "Size", options: fontSizeOptions },
                { type: "string", name: "weight", label: "Weight", options: fontWeightOptions },
                {
                  type: "boolean",
                  name: "uppercase",
                  label: "Uppercase",
                  description: "On = displayed in capitals (site look for titles/sub-titles by default). Off = shown exactly as typed. Content in Tina is never changed either way."
                }
              ] },
              { type: "object", name: "subTitle", label: "Sub-titles", fields: [
                { type: "string", name: "font", label: "Font", options: fontTypeOptions },
                { type: "string", name: "size", label: "Size", options: fontSizeOptions },
                { type: "string", name: "weight", label: "Weight", options: fontWeightOptions },
                {
                  type: "boolean",
                  name: "uppercase",
                  label: "Uppercase",
                  description: "On = displayed in capitals (site look for titles/sub-titles by default). Off = shown exactly as typed. Content in Tina is never changed either way."
                }
              ] },
              { type: "object", name: "body", label: "Body / main text", fields: [
                { type: "string", name: "font", label: "Font", options: fontTypeOptions },
                { type: "string", name: "size", label: "Size", options: fontSizeOptions },
                { type: "string", name: "weight", label: "Weight", options: fontWeightOptions },
                {
                  type: "boolean",
                  name: "uppercase",
                  label: "Uppercase",
                  description: "On = displayed in capitals (site look for titles/sub-titles by default). Off = shown exactly as typed. Content in Tina is never changed either way."
                }
              ] },
              { type: "object", name: "cardTitle", label: "Card titles (in a card grid)", fields: [
                { type: "string", name: "font", label: "Font", options: fontTypeOptions },
                { type: "string", name: "size", label: "Size", options: fontSizeOptions },
                { type: "string", name: "weight", label: "Weight", options: fontWeightOptions },
                {
                  type: "boolean",
                  name: "uppercase",
                  label: "Uppercase",
                  description: "On = displayed in capitals (site look for titles/sub-titles by default). Off = shown exactly as typed. Content in Tina is never changed either way."
                }
              ] },
              { type: "object", name: "cardLine", label: "Card lines (in a card grid)", fields: [
                { type: "string", name: "font", label: "Font", options: fontTypeOptions },
                { type: "string", name: "size", label: "Size", options: fontSizeOptions },
                { type: "string", name: "weight", label: "Weight", options: fontWeightOptions },
                {
                  type: "boolean",
                  name: "uppercase",
                  label: "Uppercase",
                  description: "On = displayed in capitals (site look for titles/sub-titles by default). Off = shown exactly as typed. Content in Tina is never changed either way."
                }
              ] }
            ]
          },
          // ── Global appearance ─────────────────────────────────────────────
          { type: "object", name: "appearance", label: "Global appearance", fields: [
            { type: "string", name: "fontPreset", label: "Global Default Font", options: [
              { label: "Inter \u2014 Modern Sans", value: "Inter" },
              { label: "Lora \u2014 Elegant Serif", value: "Lora" },
              { label: "Space Mono \u2014 Monospace", value: "Space Mono" },
              { label: "Newsreader \u2014 Editorial", value: "Newsreader" },
              { label: "Custom Google Font", value: "custom" }
            ] },
            { type: "string", name: "customFontName", label: "Custom Font Name (if Custom selected)" },
            { type: "boolean", name: "showLogo", label: "Show logo mark in header (alongside wordmark)" },
            { type: "string", name: "theme", label: "Theme", options: [
              { label: "Light \u2014 pure white", value: "light" },
              { label: "Dark  \u2014 pure black", value: "dark" },
              { label: "Paper \u2014 warm white", value: "paper" },
              { label: "Stone \u2014 warm grey", value: "stone" },
              { label: "Mist  \u2014 cool blue-grey", value: "mist" },
              { label: "Ink   \u2014 dark warm ground", value: "ink" },
              { label: "Sand  \u2014 dry neutral", value: "sand" },
              { label: "Deep  \u2014 constellation dark", value: "deep" }
            ] },
            { type: "string", name: "baseTextColor", label: "Global Text Colour", ui: { component: "color" } },
            { type: "string", name: "customBackgroundColor", label: "Custom Background Colour", ui: { component: "color" } },
            {
              type: "boolean",
              name: "enableThemeToggle",
              label: "Show visitor light/dark toggle (sun/moon icon)",
              description: 'When on, visitors see a sun/moon icon in the header. It always starts showing your Theme setting above ("Current"), correctly iconed as sun or moon depending on how light or dark that theme actually reads. A visitor can click through to a fixed plain white or fixed plain black view and back \u2014 those two fixed views never use your custom colours above, only your Theme setting does. Their choice is remembered for their next visit; turning this off here always shows everyone your Theme setting again, regardless of anything a visitor previously chose.'
            }
          ] },
          // ── Animations ────────────────────────────────────────────────────
          // General toggles default to ON when left unset (existing content
          // with no value for these fields keeps animating exactly as before
          // — this is opt-out, not opt-in, so nothing changes until someone
          // deliberately flips one off). backgroundStyle defaults to "none".
          //
          // The three background/flow-specific groups below render as
          // collapsible nested panels in Tina, rather than a flat list of
          // ~20 fields — each only matters when its feature is actually in
          // use (backgroundStyle set to match, or Process Flow animation on).
          { type: "object", name: "animations", label: "Animations", fields: [
            {
              type: "boolean",
              name: "enableLogoAnimation",
              label: "Header logo draws itself in on load",
              description: "Off = logo appears instantly, no ink-draw effect."
            },
            {
              type: "boolean",
              name: "enableStatusDot",
              label: "Breathing status dot beside the wordmark",
              description: "Off = wordmark shown with no dot."
            },
            {
              type: "boolean",
              name: "enableCascadeReveal",
              label: "Case Study fields reveal line-by-line",
              description: "Off = each field fades in as one block, same as other sections."
            },
            {
              type: "boolean",
              name: "enableTextHover",
              label: "Text lines grow slightly on hover",
              description: "Off = body text and case-study lines have no hover effect."
            },
            {
              type: "boolean",
              name: "enableCheckPageAnimations",
              label: "Fit Check page (/check): enable header animations",
              description: "Controls the logo ink-draw, breathing status dot, and page load-fade on the Fit Check page only \u2014 independent of the equivalent toggles above, which only affect the home page. Off by default (opt-in, not opt-out like every other toggle here): Fit Check is a conversion-focused page, and starts calm/instant rather than inheriting the home page's animate-by-default behaviour."
            },
            {
              type: "string",
              name: "backgroundStyle",
              label: "Background style",
              description: "Only one animated background can run at a time \u2014 both are three.js WebGL renderers, and running two simultaneously doubles the render cost for no visual benefit. Choose which one (if any) plays behind the whole page. Requires 'three' installed (npm install three).",
              options: [
                { label: "None", value: "none" },
                { label: "Depth network", value: "depth" },
                { label: "Planetary systems", value: "planetary" }
              ]
            },
            {
              type: "object",
              name: "processFlow",
              label: "Process Flow Animation",
              description: "Per-block tuning (dot count, size, speed, spacing) lives on each Process Flow section itself, in the Pages collection \u2014 this only controls whether the sequence-lighting effect runs at all.",
              fields: [
                {
                  type: "boolean",
                  name: "enabled",
                  label: "Dots light up in sequence on Process Flow connectors",
                  description: "Off = connectors shown as plain static dots."
                }
              ]
            },
            {
              type: "object",
              name: "depthBackground",
              label: "Depth Network Background",
              description: "Only used when Background style above is set to 'Depth network'.",
              fields: [
                {
                  type: "number",
                  name: "nodeCount",
                  label: "Number of points",
                  description: "Default 90. Higher = denser field, more render cost."
                },
                {
                  type: "number",
                  name: "connectDistance",
                  label: "Connection distance",
                  description: "Default 5.4. Higher = more lines drawn between points (denser web)."
                },
                {
                  type: "number",
                  name: "lineOpacity",
                  label: "Line opacity (0\u20131)",
                  description: "Default 0.16. How visible the connecting lines are."
                },
                {
                  type: "number",
                  name: "nodeOpacity",
                  label: "Point opacity (0\u20131)",
                  description: "Default 0.75. How visible the points themselves are."
                },
                {
                  type: "string",
                  name: "nodeColor",
                  label: "Point colour override",
                  description: "Leave empty to auto-match the theme's text colour.",
                  ui: { component: "color" }
                },
                {
                  type: "string",
                  name: "fogColor",
                  label: "Fog colour override",
                  description: "Leave empty to auto-match the theme's background colour. Also used as the fog colour for Planetary Systems, if that's the active background instead.",
                  ui: { component: "color" }
                }
              ]
            },
            {
              type: "object",
              name: "planetarySystems",
              label: "Planetary Systems Background",
              description: "Only used when Background style above is set to 'Planetary systems'.",
              fields: [
                {
                  type: "number",
                  name: "systemCount",
                  label: "Number of systems",
                  description: "Default 4."
                },
                {
                  type: "number",
                  name: "maxPlanets",
                  label: "Max planets per system",
                  description: "Default 4. Each system gets a random count from 1 up to this, for natural variety."
                },
                {
                  type: "number",
                  name: "orbitMinRadius",
                  label: "Orbit distance, minimum (0\u20131)",
                  description: "Default 0.35. Fraction of the base orbit size \u2014 how close the nearest planet can sit to its star."
                },
                {
                  type: "number",
                  name: "orbitMaxRadius",
                  label: "Orbit distance, maximum (0\u20131)",
                  description: "Default 1. How far the outermost planet can sit from its star."
                },
                {
                  type: "string",
                  name: "starColor",
                  label: "Star colour override",
                  description: "Leave empty to auto-match the theme's text colour. Planets and orbit paths derive from this same colour at lower opacity.",
                  ui: { component: "color" }
                },
                {
                  type: "number",
                  name: "pathOpacity",
                  label: "Orbit path opacity (0\u20131)",
                  description: "Default 0.12. How visible the faint orbit rings are."
                }
              ]
            }
          ] },
          // ── Layout dimensions ─────────────────────────────────────────────
          { type: "object", name: "layout", label: "Layout dimensions", fields: [
            { type: "string", name: "headerHeight", label: "Header Height", options: [
              { label: "Compact \u2014 40px", value: "40px" },
              { label: "Standard \u2014 52px (recommended)", value: "52px" },
              { label: "Comfortable \u2014 64px", value: "64px" },
              { label: "Spacious \u2014 80px", value: "80px" }
            ] },
            { type: "boolean", name: "matchFooterToHeader", label: "Match footer height to header (keep them equal)" },
            { type: "string", name: "footerHeight", label: "Footer Height (used only when the match toggle above is off)", options: [
              { label: "Compact \u2014 40px", value: "40px" },
              { label: "Standard \u2014 52px (recommended)", value: "52px" },
              { label: "Comfortable \u2014 64px", value: "64px" },
              { label: "Spacious \u2014 80px", value: "80px" }
            ] },
            { type: "string", name: "headerInnerWidth", label: "Header Content Width", options: [
              { label: "Narrow \u2014 480px", value: "480px" },
              { label: "Balanced \u2014 580px", value: "580px" },
              { label: "Standard \u2014 680px (recommended)", value: "680px" },
              { label: "Wide \u2014 820px", value: "820px" },
              { label: "Full width", value: "100%" }
            ] },
            {
              type: "string",
              name: "cardGridSpacing",
              label: "Card grid \u2014 default space above (from sub-title)",
              description: "Site-wide default for every 'Card grid' section. A section can still override this individually \u2014 blank there = inherit this.",
              options: [
                { label: "None \u2014 flush against sub-title", value: "mt-0" },
                { label: "Small", value: "mt-3" },
                { label: "Medium", value: "mt-6" },
                { label: "Large", value: "mt-10" }
              ]
            }
          ] },
          // ── SEO & structured data (EN + DE, LocalBusiness, JSON-LD) ────────
          { type: "object", name: "seo", label: "SEO & structured data", fields: [
            {
              type: "string",
              name: "siteUrl",
              label: "SEO: Site URL",
              description: "Full URL with no trailing slash \u2014 e.g. https://vortexdeep.ch"
            },
            {
              type: "string",
              name: "metaTitle",
              label: "SEO: Page Title (EN)",
              description: "Shown in Google results. 50\u201360 chars."
            },
            {
              type: "string",
              name: "metaTitle_de",
              label: "SEO: Page Title (DE)",
              description: "Shown in Google results for German page. 50\u201360 chars."
            },
            {
              type: "string",
              name: "metaDescription",
              label: "SEO: Meta Description (EN)",
              description: "120\u2013155 chars. Include 'Z\xFCrich' and what you do.",
              ui: { component: "textarea" }
            },
            {
              type: "string",
              name: "metaDescription_de",
              label: "SEO: Meta Description (DE)",
              description: "120\u2013155 chars f\xFCr die deutsche Seite.",
              ui: { component: "textarea" }
            },
            {
              type: "image",
              name: "ogImage",
              label: "SEO: Social Share Image",
              description: "1200\xD7630px recommended."
            },
            {
              type: "string",
              name: "founderName",
              label: "Founder name (JSON-LD)",
              description: "Shown to search engines as the company founder. Leave blank to omit."
            },
            {
              type: "string",
              name: "founderUrl",
              label: "Founder profile URL (e.g. LinkedIn)",
              description: "Only used inside structured data. Must be a full https:// URL."
            },
            {
              type: "boolean",
              name: "enableContentProtection",
              label: "Block copy / right-click / print",
              description: "Off is recommended: it never stops crawlers and it hurts accessibility and AI-search quoting."
            },
            { type: "string", name: "addressStreet", label: "Address: Street (for Google)" },
            { type: "string", name: "addressCity", label: "Address: City", description: "e.g. Z\xFCrich" },
            { type: "string", name: "addressPostal", label: "Address: Postal Code", description: "e.g. 8001" },
            { type: "string", name: "contactEmail", label: "Contact Email (for Google schema)" },
            { type: "string", name: "contactPhone", label: "Contact Phone (optional, for Google schema)" }
          ] }
        ]
      },
      // ── DATA PAGE (/data, /de/data content) ──────────────────────────────
      // One entry per language (en, de). "Enabled" off = the page is not built
      // at all (a direct URL just gets the normal not-found) AND its button on
      // the home page hides itself.
      {
        name: "dataPage",
        label: "Data Page (/data)",
        path: "src/content/dataPage",
        format: "json",
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "string",
            name: "lang",
            label: "Language (do not change)",
            description: "Which language route this is \u2014 en or de. Leave as-is."
          },
          {
            type: "boolean",
            name: "enabled",
            label: "Page enabled",
            description: "Off = the /data page is not built and its button on the home page disappears. On = the page exists and the button shows."
          },
          { type: "string", name: "eyebrow", label: "Small label (eyebrow)" },
          { type: "string", name: "heading", label: "Heading" },
          { type: "string", name: "intro", label: "Intro line", ui: { component: "textarea" } },
          {
            type: "object",
            list: true,
            name: "sections",
            label: "Sections",
            ui: { itemProps: (item) => ({ label: item?.heading || "(note)" }) },
            fields: [
              { type: "string", name: "heading", label: "Heading (leave empty for a plain note)" },
              { type: "string", name: "style", label: "Style", options: [
                { label: "Paragraphs", value: "prose" },
                { label: "Bulleted list", value: "list" },
                { label: "Boxed legal note", value: "note" }
              ] },
              {
                type: "string",
                name: "body",
                label: "Body \u2014 separate paragraphs / bullets with |",
                ui: { component: "textarea" }
              }
            ]
          },
          { type: "string", name: "contactEmail", label: "Contact email" }
        ]
      },
      // ── FIT CHECK (/check, /de/check content) ────────────────────────────
      fitCheckCollection,
      // ── ART GALLERY ───────────────────────────────────────────────────────
      {
        name: "art",
        label: "Art Gallery Items",
        path: "src/content/art",
        format: "json",
        fields: [
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "string", name: "year", label: "Year" },
          { type: "number", name: "price", label: "Price" },
          { type: "image", name: "image", label: "Art Image" },
          { type: "boolean", name: "enabled", label: "Visible" },
          { type: "boolean", name: "showTitle", label: "Show Title?" },
          { type: "boolean", name: "showPrice", label: "Show Price?" },
          { type: "boolean", name: "showLine", label: "Show Bottom Line?" }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
