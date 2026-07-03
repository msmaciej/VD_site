// src/i18n/ui.ts
// Static UI labels that live in code, not in TinaCMS content files.
// Add a key here for any hardcoded string that appears in both languages.

export type Lang = 'en' | 'de';

export const ui: Record<Lang, Record<string, string>> = {
  en: {
    // Case study block
    caseStudyTag:  'Case Study',
    challenge:     'Challenge',
    built:         'What Was Built',
    result:        'Result',
    packageLabel:  'Package',
    timelineLabel: 'Timeline',
  },
  de: {
    // Case study block
    caseStudyTag:  'Fallstudie',
    challenge:     'Herausforderung',
    built:         'Was gebaut wurde',
    result:        'Ergebnis',
    packageLabel:  'Paket',
    timelineLabel: 'Zeitplan',
  },
};
