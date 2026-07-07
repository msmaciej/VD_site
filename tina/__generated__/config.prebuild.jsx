// tina/config.ts
import { defineConfig } from "tinacms";
var fontTypeOptions = [
  { label: "Inherit global font", value: "" },
  { label: "Inter \u2014 Modern Sans", value: "Inter" },
  { label: "Lora \u2014 Elegant Serif", value: "Lora" },
  { label: "Space Mono \u2014 Monospace", value: "Space Mono" },
  { label: "Newsreader \u2014 Editorial Serif", value: "Newsreader" }
];
var fontSizeOptions = [
  { label: "XS \u2014 9px", value: "text-[9px]" },
  { label: "S  \u2014 11px (recommended)", value: "text-[11px]" },
  { label: "M  \u2014 13px", value: "text-[13px]" },
  { label: "L  \u2014 15px", value: "text-[15px]" },
  { label: "XL \u2014 18px", value: "text-lg" }
];
var fontWeightOptions = [
  { label: "Thin (100)", value: "font-thin" },
  { label: "Light (300)", value: "font-light" },
  { label: "Regular (400)", value: "font-normal" },
  { label: "Medium (500)", value: "font-medium" },
  { label: "Semibold (600)", value: "font-semibold" },
  { label: "Bold (700)", value: "font-bold" }
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
      { type: "string", name: "email", label: "Contact Email (optional)" },
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
        description: "e.g. International Trade \u2014 never use client name"
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
          // ── Hero: Main title ──────────────────────────────────────────────
          { type: "string", name: "siteName", label: "Main title text (e.g. VortexDeep)" },
          { type: "string", name: "siteNameFont", label: "Main title \u2014 Font", options: fontTypeOptions },
          { type: "string", name: "siteNameFontSize", label: "Main title \u2014 Size", options: [
            { label: "XXS \u2014 match page sections (11px)", value: "text-[11px]" },
            { label: "XS \u2014 subtle wordmark", value: "text-lg md:text-xl" },
            { label: "S  \u2014 compact", value: "text-2xl md:text-3xl" },
            { label: "M  \u2014 balanced (recommended)", value: "text-3xl md:text-4xl" },
            { label: "L  \u2014 prominent", value: "text-4xl md:text-5xl" },
            { label: "XL \u2014 hero scale", value: "text-6xl md:text-7xl lg:text-[6vw]" }
          ] },
          { type: "string", name: "siteNameFontWeight", label: "Main title \u2014 Weight", options: fontWeightOptions },
          // ── Hero: Subtitle (EN + DE) ──────────────────────────────────────
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
          { type: "string", name: "subSiteNameFontSize", label: "Subtitle \u2014 Size", options: [
            { label: "XXS \u2014 match page sections (11px)", value: "text-[11px]" },
            { label: "XS \u2014 fine caption", value: "text-xs md:text-sm" },
            { label: "S  \u2014 small (recommended)", value: "text-sm md:text-base" },
            { label: "M  \u2014 balanced", value: "text-base md:text-lg" },
            { label: "L  \u2014 prominent", value: "text-lg md:text-xl" },
            { label: "XL \u2014 large", value: "text-2xl md:text-3xl" }
          ] },
          { type: "string", name: "subSiteNameFontWeight", label: "Subtitle \u2014 Weight", options: fontWeightOptions },
          { type: "string", name: "subSiteNameTracking", label: "Subtitle \u2014 Letter Spacing", options: [
            { label: "Tight  \u2014 0.25em", value: "tracking-[0.25em]" },
            { label: "Normal \u2014 0.5em", value: "tracking-[0.5em]" },
            { label: "Wide   \u2014 1.2em (matches page sections)", value: "tracking-[1.2em]" },
            { label: "Wider  \u2014 1.5em", value: "tracking-[1.5em]" }
          ] },
          { type: "boolean", name: "showSubSiteNameOnly", label: "Show subtitle only (hide main title)" },
          // ── Header ────────────────────────────────────────────────────────
          { type: "string", name: "headerLayout", label: "Header Layout Style", options: [
            { label: "Centered (Links Below Title)", value: "centered" },
            { label: "Centered (Links Above Title)", value: "centered-top" },
            { label: "Left Aligned (Split)", value: "split" }
          ] },
          { type: "string", name: "headerLinksFontSize", label: "Header Links Size", options: [
            { label: "9px", value: "text-[9px]" },
            { label: "11px", value: "text-[11px]" },
            { label: "14px", value: "text-[14px]" }
          ] },
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
          },
          // ── Footer ────────────────────────────────────────────────────────
          { type: "string", name: "footerText", label: "Footer Text (overrides copyright)" },
          { type: "boolean", name: "showFooterLine", label: "Show separator line above footer" },
          { type: "string", name: "footerTextFontSize", label: "Footer text size", options: [
            { label: "9px (default)", value: "text-[9px]" },
            { label: "11px", value: "text-[11px]" }
          ] },
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
          },
          // ── Global appearance ─────────────────────────────────────────────
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
          // ── Layout dimensions ─────────────────────────────────────────────
          { type: "string", name: "headerHeight", label: "Header Height", options: [
            { label: "Compact \u2014 40px", value: "40px" },
            { label: "Standard \u2014 52px (recommended)", value: "52px" },
            { label: "Comfortable \u2014 64px", value: "64px" },
            { label: "Spacious \u2014 80px", value: "80px" }
          ] },
          { type: "string", name: "footerHeight", label: "Footer Height", options: [
            { label: "Compact \u2014 36px", value: "36px" },
            { label: "Standard \u2014 44px (recommended)", value: "44px" },
            { label: "Comfortable \u2014 56px", value: "56px" },
            { label: "Spacious \u2014 72px", value: "72px" }
          ] },
          { type: "string", name: "headerInnerWidth", label: "Header Content Width", options: [
            { label: "Narrow \u2014 480px", value: "480px" },
            { label: "Balanced \u2014 580px", value: "580px" },
            { label: "Standard \u2014 680px (recommended)", value: "680px" },
            { label: "Wide \u2014 820px", value: "820px" },
            { label: "Full width", value: "100%" }
          ] },
          // ── SEO (EN + DE) ──────────────────────────────────────────────────
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
          // ── LocalBusiness (Google / JSON-LD) ──────────────────────────────
          { type: "string", name: "addressStreet", label: "Address: Street (for Google)" },
          { type: "string", name: "addressCity", label: "Address: City", description: "e.g. Z\xFCrich" },
          { type: "string", name: "addressPostal", label: "Address: Postal Code", description: "e.g. 8001" },
          { type: "string", name: "contactEmail", label: "Contact Email (for Google schema)" },
          { type: "string", name: "contactPhone", label: "Contact Phone (optional, for Google schema)" }
        ]
      },
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
