import { defineConfig } from "tinacms";

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

// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  branch: "main",
  clientId: null,
  token: null,
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "uploads", publicFolder: "public" } },
  schema: {
    collections: [
      // ── PAGES ──────────────────────────────────────────────────────────────
      {
        name: "page",
        label: "Pages",
        path: "src/content/pages",
        format: "json",
        fields: [
          {
            type: "object",
            list: true,
            name: "blocks",
            label: "Page Sections",
            ui: {
              // @ts-ignore
              itemProps: (item) => ({ label: item?.title || 'Section' }),
            },
            templates: [
              {
                name: "section",
                label: "Page Section",
                ui: {
                  itemProps: (item) => ({ label: item?.title || "Unnamed Section" }),
                },
                fields: [
                  // ── Section title ──────────────────────────────────────────
                  { type: "string",  name: "title",          label: "Title text" },
                  { type: "string",  name: "titleFont",      label: "Title — Font",   options: fontTypeOptions },
                  { type: "string",  name: "titleFontSize",  label: "Title — Size",   options: fontSizeOptions },
                  { type: "string",  name: "titleFontWeight",label: "Title — Weight", options: fontWeightOptions },

                  // ── Sub-title ──────────────────────────────────────────────
                  { type: "string",  name: "subTitle",          label: "Sub-title text" },
                  { type: "string",  name: "subTitleFont",      label: "Sub-title — Font",   options: fontTypeOptions },
                  { type: "string",  name: "subTitleFontSize",  label: "Sub-title — Size",   options: fontSizeOptions },
                  { type: "string",  name: "subTitleFontWeight",label: "Sub-title — Weight", options: fontWeightOptions },

                  // ── Body text ──────────────────────────────────────────────
                  { type: "string",  name: "content",       label: "Body text (use | for line breaks)", ui: { component: "textarea" } },
                  { type: "string",  name: "bodyFont",      label: "Body — Font",   options: fontTypeOptions },
                  { type: "string",  name: "fontSize",      label: "Body — Size",   options: fontSizeOptions },
                  { type: "string",  name: "fontWeight",    label: "Body — Weight", options: fontWeightOptions },

                  // ── Contact / other ────────────────────────────────────────
                  { type: "string",  name: "email",    label: "Contact Email (optional)" },
                  { type: "boolean", name: "showArt",  label: "Activate Art Gallery?" },
                  { type: "string",  name: "columns",  label: "Gallery columns", options: [
                    { label: "2 Columns", value: "grid-cols-2" },
                    { label: "3 Columns", value: "grid-cols-3" },
                    { label: "4 Columns", value: "grid-cols-4" },
                  ]},
                  { type: "boolean", name: "enabled",  label: "Section Enabled" },
                ],
              }
            ]
          }
        ]
      },

      // ── SITE SETTINGS ──────────────────────────────────────────────────────
      {
        name: "settings",
        label: "Site Settings",
        path: "src/content/settings",
        format: "json",
        fields: [
          // ── Hero: Main title ───────────────────────────────────────────────
          { type: "string", name: "siteName",         label: "Main title text (e.g. VortexDeep)" },
          { type: "string", name: "siteNameFont",     label: "Main title — Font",   options: fontTypeOptions },
          { type: "string", name: "siteNameFontSize", label: "Main title — Size", options: [
            { label: "XS — subtle wordmark",     value: "text-lg md:text-xl"   },
            { label: "S  — compact",             value: "text-2xl md:text-3xl" },
            { label: "M  — balanced (recommended)", value: "text-3xl md:text-4xl" },
            { label: "L  — prominent",           value: "text-4xl md:text-5xl" },
            { label: "XL — hero scale",          value: "text-6xl md:text-7xl lg:text-[6vw]" },
          ]},
          { type: "string", name: "siteNameFontWeight", label: "Main title — Weight", options: fontWeightOptions },

          // ── Hero: Subtitle ─────────────────────────────────────────────────
          { type: "string", name: "subSiteName",         label: "Subtitle text (e.g. Practical AI Workflows)" },
          { type: "string", name: "subSiteNameFont",     label: "Subtitle — Font",   options: fontTypeOptions },
          { type: "string", name: "subSiteNameFontSize", label: "Subtitle — Size", options: [
            { label: "XS — fine caption",             value: "text-xs md:text-sm"  },
            { label: "S  — small (recommended)",      value: "text-sm md:text-base"},
            { label: "M  — balanced",                 value: "text-base md:text-lg"},
            { label: "L  — prominent",                value: "text-lg md:text-xl"  },
            { label: "XL — large",                    value: "text-2xl md:text-3xl"},
          ]},
          { type: "string", name: "subSiteNameFontWeight", label: "Subtitle — Weight", options: fontWeightOptions },
          { type: "boolean", name: "showSubSiteNameOnly", label: "Show subtitle only (hide main title)" },

          // ── Header ────────────────────────────────────────────────────────
          { type: "string", name: "headerLayout", label: "Header Layout Style", options: [
            { label: "Centered (Links Below Title)", value: "centered" },
            { label: "Centered (Links Above Title)", value: "centered-top" },
            { label: "Left Aligned (Split)",         value: "split" },
          ]},
          { type: "string", name: "headerLinksFontSize", label: "Header Links Size", options: [
            { label: "9px",  value: "text-[9px]"  },
            { label: "11px", value: "text-[11px]" },
            { label: "14px", value: "text-[14px]" },
          ]},
          { type: "object", list: true, name: "navLinks", label: "Header Navigation Links",
            fields: [
              { type: "string", name: "label", label: "Link Label" },
              { type: "string", name: "url",   label: "URL (e.g. /check)" },
            ],
            ui: { itemProps: (item) => ({ label: item?.label || 'New Link' }) }
          },

          // ── Footer ────────────────────────────────────────────────────────
          { type: "string",  name: "footerText",     label: "Footer Text (overrides copyright)" },
          { type: "boolean", name: "showFooterLine", label: "Show separator line above footer" },
          { type: "string",  name: "footerTextFontSize",  label: "Footer text size", options: [
            { label: "9px (default)", value: "text-[9px]"  },
            { label: "11px",          value: "text-[11px]" },
          ]},
          { type: "object", list: true, name: "socialLinks", label: "Footer Social Links",
            fields: [
              { type: "string", name: "platform", label: "Platform (e.g. LinkedIn, Facebook)" },
              { type: "string", name: "url",      label: "Profile URL" },
            ],
            ui: { itemProps: (item) => ({ label: item?.platform || 'New Social Link' }) }
          },

          // ── Global appearance ──────────────────────────────────────────────
          { type: "string", name: "fontPreset", label: "Global Default Font", options: [
            { label: "Inter — Modern Sans",       value: "Inter"       },
            { label: "Lora — Elegant Serif",      value: "Lora"        },
            { label: "Space Mono — Monospace",    value: "Space Mono"  },
            { label: "Newsreader — Editorial",    value: "Newsreader"  },
            { label: "Custom Google Font",        value: "custom"      },
          ]},
          { type: "string",  name: "customFontName",        label: "Custom Font Name (if Custom selected)" },
          { type: "string",  name: "theme",                 label: "Theme", options: [
            { label: "Light", value: "light" },
            { label: "Dark",  value: "dark"  },
            { label: "Paper", value: "paper" },
          ]},
          { type: "string",  name: "baseTextColor",         label: "Global Text Colour",       ui: { component: "color" } },
          { type: "string",  name: "customBackgroundColor", label: "Custom Background Colour", ui: { component: "color" } },

          // ── Layout dimensions ─────────────────────────────────────────────
          { type: "string", name: "headerHeight", label: "Header Height", options: [
            { label: "Compact — 40px",           value: "40px" },
            { label: "Standard — 52px (recommended)", value: "52px" },
            { label: "Comfortable — 64px",       value: "64px" },
            { label: "Spacious — 80px",          value: "80px" },
          ]},
          { type: "string", name: "footerHeight", label: "Footer Height", options: [
            { label: "Compact — 36px",           value: "36px" },
            { label: "Standard — 44px (recommended)", value: "44px" },
            { label: "Comfortable — 56px",       value: "56px" },
            { label: "Spacious — 72px",          value: "72px" },
          ]},
          { type: "string", name: "headerInnerWidth", label: "Header Content Width", options: [
            { label: "Narrow — 480px",    value: "480px" },
            { label: "Balanced — 580px",  value: "580px" },
            { label: "Standard — 680px (recommended)", value: "680px" },
            { label: "Wide — 820px",      value: "820px" },
            { label: "Full width",        value: "100%"  },
          ]},
        ],
      },

      // ── ART GALLERY ────────────────────────────────────────────────────────
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
