import { defineConfig } from "tinacms";
import { fitCheckCollection } from "./fitcheck-schema";

// ── Reusable option sets ──────────────────────────────────────────────────────

const fontTypeOptions = [
  { label: "Inherit global font", value: "" },
  { label: "Inter — Modern Sans", value: "Inter" },
  { label: "Lora — Elegant Serif", value: "Lora" },
  { label: "Space Mono — Monospace", value: "Space Mono" },
  { label: "Newsreader — Editorial Serif", value: "Newsreader" },
];

const fontSizeOptions = [
  { label: "XS — 9px",  value: "text-[9px]"  },
  { label: "S  — 11px (recommended)", value: "text-[11px]" },
  { label: "M  — 13px", value: "text-[13px]" },
  { label: "L  — 15px", value: "text-[15px]" },
  { label: "XL — 18px", value: "text-lg"     },
];

const fontWeightOptions = [
  { label: "Thin (100)",     value: "font-thin"     },
  { label: "Light (300)",    value: "font-light"    },
  { label: "Regular (400)",  value: "font-normal"   },
  { label: "Medium (500)",   value: "font-medium"   },
  { label: "Semibold (600)", value: "font-semibold" },
  { label: "Bold (700)",     value: "font-bold"     },
];

// ── Shared page section templates (used by both EN and DE collections) ────────

const pageTemplates = [
  {
    name: "section",
    label: "Page Section",
    ui: {
      itemProps: (item: any) => ({ label: item?.title || "Unnamed Section" }),
    },
    fields: [
      { type: "string",  name: "title",           label: "Title text" },
      { type: "string",  name: "titleFont",       label: "Title — Font",   options: fontTypeOptions },
      { type: "string",  name: "titleFontSize",   label: "Title — Size",   options: fontSizeOptions },
      { type: "string",  name: "titleFontWeight", label: "Title — Weight", options: fontWeightOptions },

      { type: "string",  name: "subTitle",           label: "Sub-title text" },
      { type: "string",  name: "subTitleFont",       label: "Sub-title — Font",   options: fontTypeOptions },
      { type: "string",  name: "subTitleFontSize",   label: "Sub-title — Size",   options: fontSizeOptions },
      { type: "string",  name: "subTitleFontWeight", label: "Sub-title — Weight", options: fontWeightOptions },

      { type: "string",  name: "content",    label: "Body text (use | for line breaks)", ui: { component: "textarea" } },
      { type: "string",  name: "bodyFont",   label: "Body — Font",   options: fontTypeOptions },
      { type: "string",  name: "fontSize",   label: "Body — Size",   options: fontSizeOptions },
      { type: "string",  name: "fontWeight", label: "Body — Weight", options: fontWeightOptions },

      { type: "string",  name: "email",   label: "Contact Email (optional)" },
      { type: "boolean", name: "showArt", label: "Activate Art Gallery?" },
      { type: "string",  name: "columns", label: "Gallery columns", options: [
        { label: "2 Columns", value: "grid-cols-2" },
        { label: "3 Columns", value: "grid-cols-3" },
        { label: "4 Columns", value: "grid-cols-4" },
      ]},
      { type: "boolean", name: "enabled", label: "Section Enabled" },
    ],
  },
  {
    name: "processFlow",
    label: "Process Flow",
    ui: {
      itemProps: (item: any) => ({ label: item?.title || "Process Flow" }),
    },
    fields: [
      { type: "string", name: "title",           label: "Section Title" },
      { type: "string", name: "titleFont",       label: "Title — Font",   options: fontTypeOptions },
      { type: "string", name: "titleFontSize",   label: "Title — Size",   options: fontSizeOptions },
      { type: "string", name: "titleFontWeight", label: "Title — Weight", options: fontWeightOptions },
      { type: "string", name: "orientation",     label: "Arrow Direction", options: [
        { label: "Vertical ↓  (stacked)",  value: "vertical"   },
        { label: "Horizontal → (inline)",  value: "horizontal" },
      ]},
      { type: "string", name: "stepFont",       label: "Steps — Font",   options: fontTypeOptions },
      { type: "string", name: "stepFontSize",   label: "Steps — Size",   options: fontSizeOptions },
      { type: "string", name: "stepFontWeight", label: "Steps — Weight", options: fontWeightOptions },
      {
        type: "object", list: true, name: "steps", label: "Process Steps",
        fields: [
          { type: "string", name: "label",      label: "Step Label" },
          { type: "string", name: "font",       label: "Override Font (optional)",   options: fontTypeOptions },
          { type: "string", name: "fontSize",   label: "Override Size (optional)",   options: fontSizeOptions },
          { type: "string", name: "fontWeight", label: "Override Weight (optional)", options: fontWeightOptions },
        ],
        ui: { itemProps: (item: any) => ({ label: item?.label || "Step" }) },
      },
      // ── Connector dot animation ────────────────────────────────────────
      { type: "number", name: "dotsPerConnector", label: "Dots between each step",
        description: "Default 4. Fewer dots = sparser, cleaner look; more = denser." },
      { type: "number", name: "dotSize", label: "Dot size (px)",
        description: "Default 3." },
      { type: "number", name: "dotRestOpacity", label: "Resting dot opacity (0–1)",
        description: "Default 0.14. Lower = lighter grey at rest." },
      { type: "number", name: "dotPeakOpacity", label: "Lit dot opacity (0–1)",
        description: "Default 0.9. How dark a dot gets as the flow passes through it." },
      { type: "number", name: "flowSpeed", label: "Seconds per connector",
        description: "Default 2. How long the flow takes to cross each connector — controls overall pacing." },
      { type: "number", name: "connectorGap", label: "Gap between dots (px)",
        description: "Default 8. Direct spacing between adjacent dots." },
      { type: "number", name: "stepSpacing", label: "Space around each step label (px)",
        description: "Default 12. Padding on the side facing the connector — the main driver of total distance between step texts (combined with the dot gap above)." },
      { type: "boolean", name: "enabled", label: "Section Enabled" },
    ],
  },
  {
    name: "caseStudy",
    label: "Case Study",
    ui: {
      itemProps: (item: any) => ({ label: item?.industry ? `Case Study — ${item.industry}` : "Case Study" }),
    },
    fields: [
      { type: "string",  name: "industry",  label: "Industry / Sector",
        description: "e.g. International Trade — never use client name" },
      { type: "string",  name: "location",  label: "Location", description: "e.g. Switzerland" },
      { type: "string",  name: "package",   label: "Package Used",
        description: "e.g. Basic + AI Triage" },
      { type: "string",  name: "timeline",  label: "Timeline to Go-live", description: "e.g. 4 weeks" },
      { type: "string",  name: "challenge", label: "Challenge",
        description: "The problem — no internal detail, no client specifics",
        ui: { component: "textarea" } },
      { type: "string",  name: "built",     label: "What Was Built",
        description: "High-level only — no tools, no routing logic",
        ui: { component: "textarea" } },
      { type: "string",  name: "result",    label: "Result",
        description: "Business outcome in plain language",
        ui: { component: "textarea" } },
      { type: "string",  name: "titleFont",       label: "Industry Title — Font",   options: fontTypeOptions },
      { type: "string",  name: "titleFontSize",   label: "Industry Title — Size",   options: fontSizeOptions },
      { type: "string",  name: "titleFontWeight", label: "Industry Title — Weight", options: fontWeightOptions },
      { type: "string",  name: "bodyFont",        label: "Body Text — Font",   options: fontTypeOptions },
      { type: "string",  name: "bodyFontSize",    label: "Body Text — Size",   options: fontSizeOptions },
      { type: "string",  name: "bodyFontWeight",  label: "Body Text — Weight", options: fontWeightOptions },
      { type: "string",  name: "labelFont",       label: "Labels — Font",   options: fontTypeOptions },
      { type: "string",  name: "labelFontSize",   label: "Labels — Size",   options: fontSizeOptions },
      { type: "string",  name: "labelFontWeight", label: "Labels — Weight", options: fontWeightOptions },
      { type: "string",  name: "metaFont",        label: "Meta Text — Font",   options: fontTypeOptions },
      { type: "string",  name: "metaFontSize",    label: "Meta Text — Size",   options: fontSizeOptions },
      { type: "boolean", name: "enabled",         label: "Section Enabled" },
    ],
  },
  {
    name: "testimonial",
    label: "Testimonial",
    ui: {
      itemProps: (item: any) => ({ label: item?.attributionOrg ? `Testimonial — ${item.attributionOrg}` : "Testimonial" }),
    },
    fields: [
      { type: "string",  name: "quote",           label: "Quote", ui: { component: "textarea" } },
      { type: "string",  name: "attributionName", label: "Attribution — Name",
        description: "e.g. Management — avoid a full personal name unless the client has approved it" },
      { type: "string",  name: "attributionOrg",  label: "Attribution — Organization" },
      { type: "string",  name: "quoteFontSize",   label: "Quote — Size",   options: fontSizeOptions },
      { type: "string",  name: "quoteFontWeight", label: "Quote — Weight", options: fontWeightOptions },
      { type: "string",  name: "metaFontSize",    label: "Attribution — Size", options: fontSizeOptions },
      { type: "boolean", name: "enabled",         label: "Section Enabled" },
    ],
  },
] as const;

// ── Collection fields list ────────────────────────────────────────────────────

const pageFields = [
  {
    type: "object",
    list: true,
    name: "blocks",
    label: "Page Sections",
    ui: {
      // @ts-ignore
      itemProps: (item) => ({ label: item?.title || item?.industry || 'Section' }),
    },
    templates: pageTemplates,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
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
        fields: pageFields as any,
      },

      // ── PAGES (DE) ────────────────────────────────────────────────────────
      {
        name: "page_de",
        label: "Pages (DE)",
        path: "src/content/pages/de",
        format: "json",
        fields: pageFields as any,
      },

      // ── SITE SETTINGS ─────────────────────────────────────────────────────
      {
        name: "settings",
        label: "Site Settings",
        path: "src/content/settings",
        format: "json",
        fields: [
          // ── Hero: Main title ──────────────────────────────────────────────
          { type: "string", name: "siteName",         label: "Main title text (e.g. VortexDeep)" },
          { type: "string", name: "siteNameFont",     label: "Main title — Font",   options: fontTypeOptions },
          { type: "string", name: "siteNameFontSize", label: "Main title — Size", options: [
            { label: "XXS — match page sections (11px)", value: "text-[11px]"                       },
            { label: "XS — subtle wordmark",             value: "text-lg md:text-xl"                },
            { label: "S  — compact",                     value: "text-2xl md:text-3xl"              },
            { label: "M  — balanced (recommended)",      value: "text-3xl md:text-4xl"              },
            { label: "L  — prominent",                   value: "text-4xl md:text-5xl"              },
            { label: "XL — hero scale",                  value: "text-6xl md:text-7xl lg:text-[6vw]"},
          ]},
          { type: "string", name: "siteNameFontWeight", label: "Main title — Weight", options: fontWeightOptions },

          // ── Hero: Subtitle (EN + DE) ──────────────────────────────────────
          { type: "string", name: "subSiteName",
            label: "Subtitle (EN) — use | for line breaks",
            description: "e.g. Practical AI automation | for small business" },
          { type: "string", name: "subSiteName_de",
            label: "Subtitle (DE) — use | for line breaks",
            description: "e.g. Praktische KI-Automatisierung | für KMU" },
          { type: "string", name: "subSiteNameFont",       label: "Subtitle — Font",   options: fontTypeOptions },
          { type: "string", name: "subSiteNameFontSize",   label: "Subtitle — Size", options: [
            { label: "XXS — 11px",                        value: "text-[11px]"         },
            { label: "XS  — 13px (match page sections)",  value: "text-[13px]"         },
            { label: "S   — small",                       value: "text-xs md:text-sm"  },
            { label: "M   — balanced",                    value: "text-sm md:text-base"},
            { label: "L   — prominent",                   value: "text-base md:text-lg"},
            { label: "XL  — large",                       value: "text-lg md:text-xl"  },
          ]},
          { type: "string",  name: "subSiteNameFontWeight",  label: "Subtitle — Weight", options: fontWeightOptions },
          { type: "string",  name: "subSiteNameTracking", label: "Subtitle — Letter Spacing", options: [
            { label: "Tight  — 0.25em", value: "tracking-[0.25em]" },
            { label: "Normal — 0.5em",  value: "tracking-[0.5em]"  },
            { label: "Wide   — 1.2em (matches page sections)", value: "tracking-[1.2em]" },
            { label: "Wider  — 1.5em",  value: "tracking-[1.5em]"  },
          ]},
          { type: "boolean", name: "showSubSiteNameOnly",    label: "Show subtitle only (hide main title)" },

          // ── Header ────────────────────────────────────────────────────────
          { type: "string", name: "headerLayout", label: "Header Layout Style", options: [
            { label: "Centered (Links Below Title)", value: "centered"     },
            { label: "Centered (Links Above Title)", value: "centered-top" },
            { label: "Left Aligned (Split)",         value: "split"        },
          ]},
          { type: "string", name: "headerLinksFontSize", label: "Header Links Size", options: [
            { label: "9px",  value: "text-[9px]"  },
            { label: "11px", value: "text-[11px]" },
            { label: "14px", value: "text-[14px]" },
          ]},
          { type: "object", list: true, name: "navLinks", label: "Header Navigation Links",
            fields: [
              { type: "string", name: "label",    label: "Link Label (EN)" },
              { type: "string", name: "label_de", label: "Link Label (DE)" },
              { type: "string", name: "url",      label: "URL (e.g. /check) — /de is added automatically for DE" },
            ],
            ui: { itemProps: (item: any) => ({ label: item?.label || 'New Link' }) },
          },

          // ── Footer ────────────────────────────────────────────────────────
          { type: "string",  name: "footerText",         label: "Footer Text (overrides copyright)" },
          { type: "boolean", name: "showFooterLine",     label: "Show separator line above footer" },
          { type: "string",  name: "footerTextFontSize", label: "Footer text size", options: [
            { label: "9px (default)", value: "text-[9px]"  },
            { label: "11px",          value: "text-[11px]" },
          ]},
          { type: "object", list: true, name: "socialLinks", label: "Footer Social Links",
            fields: [
              { type: "string", name: "platform", label: "Platform (e.g. LinkedIn, Facebook)" },
              { type: "string", name: "url",      label: "Profile URL" },
            ],
            ui: { itemProps: (item: any) => ({ label: item?.platform || 'New Social Link' }) },
          },

          // ── Global appearance ─────────────────────────────────────────────
          { type: "string", name: "fontPreset", label: "Global Default Font", options: [
            { label: "Inter — Modern Sans",    value: "Inter"      },
            { label: "Lora — Elegant Serif",   value: "Lora"       },
            { label: "Space Mono — Monospace", value: "Space Mono" },
            { label: "Newsreader — Editorial", value: "Newsreader" },
            { label: "Custom Google Font",     value: "custom"     },
          ]},
          { type: "string",  name: "customFontName",        label: "Custom Font Name (if Custom selected)" },
          { type: "boolean", name: "showLogo",              label: "Show logo mark in header (alongside wordmark)" },
          { type: "string",  name: "theme",                 label: "Theme", options: [
            { label: "Light — pure white",         value: "light" },
            { label: "Dark  — pure black",         value: "dark"  },
            { label: "Paper — warm white",         value: "paper" },
            { label: "Stone — warm grey",          value: "stone" },
            { label: "Mist  — cool blue-grey",     value: "mist"  },
            { label: "Ink   — dark warm ground",   value: "ink"   },
            { label: "Sand  — dry neutral",        value: "sand"  },
            { label: "Deep  — constellation dark", value: "deep"  },
          ]},
          { type: "string",  name: "baseTextColor",         label: "Global Text Colour",       ui: { component: "color" } },
          { type: "string",  name: "customBackgroundColor", label: "Custom Background Colour", ui: { component: "color" } },
          { type: "boolean", name: "enableThemeToggle",
            label: "Show visitor light/dark toggle (sun/moon icon)",
            description: "When on, visitors see a sun/moon icon in the header. It always starts showing your Theme setting above (\"Current\"), correctly iconed as sun or moon depending on how light or dark that theme actually reads. A visitor can click through to a fixed plain white or fixed plain black view and back — those two fixed views never use your custom colours above, only your Theme setting does. Their choice is remembered for their next visit; turning this off here always shows everyone your Theme setting again, regardless of anything a visitor previously chose." },

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
          { type: "boolean", name: "enableLogoAnimation",
            label: "Header logo draws itself in on load",
            description: "Off = logo appears instantly, no ink-draw effect." },
          { type: "boolean", name: "enableStatusDot",
            label: "Breathing status dot beside the wordmark",
            description: "Off = wordmark shown with no dot." },
          { type: "boolean", name: "enableCascadeReveal",
            label: "Case Study fields reveal line-by-line",
            description: "Off = each field fades in as one block, same as other sections." },
          { type: "boolean", name: "enableTextHover",
            label: "Text lines grow slightly on hover",
            description: "Off = body text and case-study lines have no hover effect." },
          { type: "boolean", name: "enableCheckPageAnimations",
            label: "Fit Check page (/check): enable header animations",
            description: "Controls the logo ink-draw, breathing status dot, and page load-fade on the Fit Check page only — independent of the equivalent toggles above, which only affect the home page. Off by default (opt-in, not opt-out like every other toggle here): Fit Check is a conversion-focused page, and starts calm/instant rather than inheriting the home page's animate-by-default behaviour." },
          { type: "string", name: "backgroundStyle",
            label: "Background style",
            description: "Only one animated background can run at a time — both are three.js WebGL renderers, and running two simultaneously doubles the render cost for no visual benefit. Choose which one (if any) plays behind the whole page. Requires 'three' installed (npm install three).",
            options: [
              { label: "None",              value: "none"      },
              { label: "Depth network",     value: "depth"     },
              { label: "Planetary systems", value: "planetary" },
            ]},

          { type: "object", name: "processFlow", label: "Process Flow Animation",
            description: "Per-block tuning (dot count, size, speed, spacing) lives on each Process Flow section itself, in the Pages collection — this only controls whether the sequence-lighting effect runs at all.",
            fields: [
              { type: "boolean", name: "enabled",
                label: "Dots light up in sequence on Process Flow connectors",
                description: "Off = connectors shown as plain static dots." },
            ]},

          { type: "object", name: "depthBackground", label: "Depth Network Background",
            description: "Only used when Background style above is set to 'Depth network'.",
            fields: [
              { type: "number", name: "nodeCount", label: "Number of points",
                description: "Default 90. Higher = denser field, more render cost." },
              { type: "number", name: "connectDistance", label: "Connection distance",
                description: "Default 5.4. Higher = more lines drawn between points (denser web)." },
              { type: "number", name: "lineOpacity", label: "Line opacity (0–1)",
                description: "Default 0.16. How visible the connecting lines are." },
              { type: "number", name: "nodeOpacity", label: "Point opacity (0–1)",
                description: "Default 0.75. How visible the points themselves are." },
              { type: "string", name: "nodeColor", label: "Point colour override",
                description: "Leave empty to auto-match the theme's text colour.",
                ui: { component: "color" } },
              { type: "string", name: "fogColor", label: "Fog colour override",
                description: "Leave empty to auto-match the theme's background colour. Also used as the fog colour for Planetary Systems, if that's the active background instead.",
                ui: { component: "color" } },
            ]},

          { type: "object", name: "planetarySystems", label: "Planetary Systems Background",
            description: "Only used when Background style above is set to 'Planetary systems'.",
            fields: [
              { type: "number", name: "systemCount", label: "Number of systems",
                description: "Default 4." },
              { type: "number", name: "maxPlanets", label: "Max planets per system",
                description: "Default 4. Each system gets a random count from 1 up to this, for natural variety." },
              { type: "number", name: "orbitMinRadius", label: "Orbit distance, minimum (0–1)",
                description: "Default 0.35. Fraction of the base orbit size — how close the nearest planet can sit to its star." },
              { type: "number", name: "orbitMaxRadius", label: "Orbit distance, maximum (0–1)",
                description: "Default 1. How far the outermost planet can sit from its star." },
              { type: "string", name: "starColor", label: "Star colour override",
                description: "Leave empty to auto-match the theme's text colour. Planets and orbit paths derive from this same colour at lower opacity.",
                ui: { component: "color" } },
              { type: "number", name: "pathOpacity", label: "Orbit path opacity (0–1)",
                description: "Default 0.12. How visible the faint orbit rings are." },
            ]},

          // ── Layout dimensions ─────────────────────────────────────────────
          { type: "string", name: "headerHeight", label: "Header Height", options: [
            { label: "Compact — 40px",                value: "40px" },
            { label: "Standard — 52px (recommended)", value: "52px" },
            { label: "Comfortable — 64px",            value: "64px" },
            { label: "Spacious — 80px",               value: "80px" },
          ]},
          { type: "string", name: "footerHeight", label: "Footer Height", options: [
            { label: "Compact — 36px",                value: "36px" },
            { label: "Standard — 44px (recommended)", value: "44px" },
            { label: "Comfortable — 56px",            value: "56px" },
            { label: "Spacious — 72px",               value: "72px" },
          ]},
          { type: "string", name: "headerInnerWidth", label: "Header Content Width", options: [
            { label: "Narrow — 480px",                      value: "480px" },
            { label: "Balanced — 580px",                    value: "580px" },
            { label: "Standard — 680px (recommended)",      value: "680px" },
            { label: "Wide — 820px",                        value: "820px" },
            { label: "Full width",                          value: "100%"  },
          ]},

          // ── SEO (EN + DE) ──────────────────────────────────────────────────
          { type: "string", name: "siteUrl",
            label: "SEO: Site URL",
            description: "Full URL with no trailing slash — e.g. https://vortexdeep.ch" },
          { type: "string", name: "metaTitle",
            label: "SEO: Page Title (EN)",
            description: "Shown in Google results. 50–60 chars." },
          { type: "string", name: "metaTitle_de",
            label: "SEO: Page Title (DE)",
            description: "Shown in Google results for German page. 50–60 chars." },
          { type: "string", name: "metaDescription",
            label: "SEO: Meta Description (EN)",
            description: "120–155 chars. Include 'Zürich' and what you do.",
            ui: { component: "textarea" } },
          { type: "string", name: "metaDescription_de",
            label: "SEO: Meta Description (DE)",
            description: "120–155 chars für die deutsche Seite.",
            ui: { component: "textarea" } },
          { type: "image",  name: "ogImage",
            label: "SEO: Social Share Image",
            description: "1200×630px recommended." },

          // ── LocalBusiness (Google / JSON-LD) ──────────────────────────────
          { type: "string", name: "addressStreet",  label: "Address: Street (for Google)" },
          { type: "string", name: "addressCity",    label: "Address: City",         description: "e.g. Zürich" },
          { type: "string", name: "addressPostal",  label: "Address: Postal Code",  description: "e.g. 8001" },
          { type: "string", name: "contactEmail",   label: "Contact Email (for Google schema)" },
          { type: "string", name: "contactPhone",   label: "Contact Phone (optional, for Google schema)" },
        ],
      },

      // ── FIT CHECK (/check, /de/check content) ────────────────────────────
      fitCheckCollection as any,

      // ── ART GALLERY ───────────────────────────────────────────────────────
      {
        name: "art",
        label: "Art Gallery Items",
        path: "src/content/art",
        format: "json",
        fields: [
          { type: "string",  name: "title",     label: "Title", isTitle: true, required: true },
          { type: "string",  name: "year",      label: "Year"  },
          { type: "number",  name: "price",     label: "Price" },
          { type: "image",   name: "image",     label: "Art Image" },
          { type: "boolean", name: "enabled",   label: "Visible"       },
          { type: "boolean", name: "showTitle", label: "Show Title?"   },
          { type: "boolean", name: "showPrice", label: "Show Price?"   },
          { type: "boolean", name: "showLine",  label: "Show Bottom Line?" },
        ],
      },
    ],
  },
});
