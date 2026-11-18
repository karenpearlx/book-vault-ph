// Pushes The Book Vault PH's design to the OGTool-hosted blog (see ogtool-blog.md).
// Run after any redesign:  OGTOOL_API_KEY=... node scripts/ogtool-theme.mjs
// The theme applies instantly on the hosted blog — no deploy needed.

const API = process.env.OGTOOL_API_URL || 'https://app.ogtool.com/api';
const KEY = process.env.OGTOOL_API_KEY;
if (!KEY) {
  console.error('OGTOOL_API_KEY is not set (see ogtool-blog.md).');
  process.exit(1);
}

const SITE = 'https://www.thebookvaultph.com';

// Design tokens, copied from the :root block in index.html.
const T = {
  burgundy: '#4A1C2A',
  burgundyDeep: '#2E0F1A',
  night: '#1A0810',
  copper: '#FF9B00',
  copperSoft: '#FFAD33',
  cream: '#EEE0D9',
  creamWarm: '#F4E9D8',
  creamShadow: '#E8DAC0',
  ink: '#3A2018',
  inkSoft: '#6E5347',
  footer: '#3A1A22',
};

const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .29 0 0 0 0 .13 0 0 0 0 .09 0 0 0 .07 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const customThemeCss = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@300;400;500&display=swap');

/* ============================================================
   The Book Vault PH — cozy noir bookshop, applied to the blog.
   Tokens mirror :root in index.html.
   ============================================================ */
:root, .kea-theme {
  --bv-burgundy: ${T.burgundy};
  --bv-burgundy-deep: ${T.burgundyDeep};
  --bv-copper: ${T.copper};
  --bv-copper-soft: ${T.copperSoft};
  --bv-cream: ${T.cream};
  --bv-cream-warm: ${T.creamWarm};
  --bv-ink: ${T.ink};
  --bv-ink-soft: ${T.inkSoft};
  --bv-rule: rgba(74,28,42,.14);
  --bv-head: "Playfair Display", Georgia, serif;
  --bv-body: "Cormorant Garamond", Georgia, serif;
  --bv-mono: "DM Mono", ui-monospace, monospace;

  /* shadcn/Tailwind tokens the blog renders with */
  --background: ${T.cream};
  --foreground: ${T.ink};
  --card: ${T.creamWarm};
  --card-foreground: ${T.ink};
  --popover: ${T.creamWarm};
  --popover-foreground: ${T.ink};
  --primary: ${T.burgundy};
  --primary-foreground: ${T.cream};
  --secondary: ${T.creamShadow};
  --secondary-foreground: ${T.burgundy};
  --muted: ${T.creamShadow};
  --muted-foreground: ${T.inkSoft};
  --accent: ${T.copper};
  --accent-foreground: ${T.burgundyDeep};
  --border: var(--bv-rule);
  --input: var(--bv-rule);
  --ring: ${T.copper};
  --radius: 12px;

  --font-sans: var(--bv-body);
  --font-serif: var(--bv-head);
  --font-mono: var(--bv-mono);

  /* long-form post typography */
  --tw-prose-body: ${T.ink};
  --tw-prose-headings: ${T.burgundy};
  --tw-prose-lead: ${T.inkSoft};
  --tw-prose-links: ${T.burgundy};
  --tw-prose-bold: ${T.burgundy};
  --tw-prose-counters: ${T.inkSoft};
  --tw-prose-bullets: ${T.copper};
  --tw-prose-hr: var(--bv-rule);
  --tw-prose-quotes: ${T.burgundy};
  --tw-prose-quote-borders: ${T.copper};
  --tw-prose-captions: ${T.inkSoft};
  --tw-prose-code: ${T.burgundy};
  --tw-prose-pre-code: ${T.cream};
  --tw-prose-pre-bg: ${T.burgundyDeep};
  --tw-prose-th-borders: rgba(74,28,42,.28);
  --tw-prose-td-borders: var(--bv-rule);
}

html, body {
  background: var(--bv-cream);
  color: var(--bv-ink);
  font-family: var(--bv-body);
  font-size: 18px;
  line-height: 1.55;
}

/* the site's paper grain */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: .4;
  background-image: ${grain};
  mix-blend-mode: multiply;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--bv-head);
  font-weight: 400;
  color: var(--bv-burgundy);
  letter-spacing: -.01em;
  line-height: 1.12;
}
h1 { font-size: clamp(2.2rem, 5vw, 3.4rem); }
h2 { font-size: clamp(1.7rem, 3.5vw, 2.4rem); }
h3 { font-size: clamp(1.3rem, 2.5vw, 1.7rem); }
em { color: var(--bv-copper); }
h1 em, h2 em, h3 em { font-style: italic; font-weight: 500; }
strong { font-weight: 600; color: var(--bv-burgundy); }

a { color: var(--bv-burgundy); text-decoration-color: rgba(255,155,0,.5); text-underline-offset: 3px; }
a:hover { color: var(--bv-copper); }

/* ---------- header: the site's dark sticky nav ---------- */
header, .sticky.top-0 {
  background: rgba(26,8,16,.92) !important;
  border-bottom: 1px solid rgba(184,115,51,.18) !important;
  backdrop-filter: saturate(1.4) blur(12px);
}
header a, header span, .sticky.top-0 a, .sticky.top-0 span { color: var(--bv-cream) !important; }
header nav a, .sticky.top-0 nav a {
  font-family: var(--bv-mono);
  font-size: .7rem;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: rgba(253,248,243,.7) !important;
  border-bottom: 1px solid transparent;
  padding-bottom: 4px;
}
header nav a:hover, .sticky.top-0 nav a:hover {
  color: var(--bv-copper-soft) !important;
  border-bottom-color: var(--bv-copper-soft);
}
header img, .sticky.top-0 header img { max-height: 44px; width: auto; }

/* ---------- eyebrows, dates, meta (the site's DM Mono kicker) ---------- */
div:has(> time), div:has(> time) span, time, time ~ span, .uppercase {
  font-family: var(--bv-mono);
  letter-spacing: .18em;
  text-transform: uppercase;
  font-size: .68rem;
  color: var(--bv-ink-soft);
}

/* table of contents: readable body serif, copper for the active item */
aside a, details a, nav[aria-label] a { font-family: var(--bv-body); font-size: .95rem; line-height: 1.35; }
aside a:hover, details a:hover { color: var(--bv-copper); }

/* ---------- post cards ---------- */
article, .rounded-lg, .rounded-xl, .rounded-2xl, .border {
  border-color: var(--bv-rule);
}
article {
  background: var(--bv-cream-warm);
  border-radius: 12px;
  box-shadow: 0 18px 40px -18px rgba(46,15,26,.45), 0 4px 10px -4px rgba(46,15,26,.18);
}
article:hover { box-shadow: 0 24px 50px -18px rgba(46,15,26,.5); }

/* ---------- long-form content ---------- */
.prose { font-family: var(--bv-body); font-size: 1.12rem; line-height: 1.7; max-width: 72ch; }
.prose h2 { margin-top: 2.2em; }
.prose blockquote {
  font-style: italic;
  border-left: 3px solid var(--bv-copper);
  background: rgba(255,155,0,.06);
  padding: 2px 22px;
  border-radius: 0 8px 8px 0;
}
.prose code {
  font-family: var(--bv-mono);
  font-size: .82em;
  background: rgba(74,28,42,.08);
  padding: .15em .4em;
  border-radius: 5px;
}
.prose pre {
  background: var(--bv-burgundy-deep);
  color: var(--bv-cream);
  border: 1px solid rgba(184,115,51,.25);
  border-radius: 12px;
  font-family: var(--bv-mono);
  font-size: .85rem;
}
.prose pre code { background: none; color: inherit; }
.prose table { font-size: .95rem; border-collapse: collapse; }
.prose thead {
  background: var(--bv-burgundy);
  color: var(--bv-cream);
  font-family: var(--bv-mono);
  font-size: .66rem;
  letter-spacing: .18em;
  text-transform: uppercase;
}
.prose th { color: var(--bv-cream); padding: 12px 14px; }
.prose td { padding: 12px 14px; border-bottom: 1px solid var(--bv-rule); }
.prose tbody tr:nth-child(odd) { background: rgba(244,233,216,.55); }
.prose ul > li::marker { color: var(--bv-copper); }
.prose ol > li::marker { font-family: var(--bv-mono); color: var(--bv-ink-soft); font-size: .85em; }
.prose img { border-radius: 12px; box-shadow: 0 18px 40px -18px rgba(46,15,26,.45); }
.prose hr { border-color: var(--bv-rule); }

/* ---------- buttons / CTA ---------- */
button, .btn, a[role="button"], [class*="bg-primary"] {
  font-family: var(--bv-mono);
  font-size: .7rem;
  letter-spacing: .24em;
  text-transform: uppercase;
  border-radius: 999px;
}
[class*="bg-primary"] {
  background: var(--bv-copper) !important;
  color: var(--bv-burgundy-deep) !important;
  box-shadow: 0 12px 30px -10px rgba(216,154,85,.5);
}
[class*="bg-primary"]:hover { background: var(--bv-cream) !important; }

/* ---------- footer: the site's deep wine footer ---------- */
footer {
  background: ${T.footer} !important;
  color: var(--bv-cream);
  border-top: none !important;
}
footer a, footer p, footer span, footer li { color: rgba(253,248,243,.8) !important; font-size: 1rem; }
footer a:hover { color: var(--bv-copper) !important; }
footer h2, footer h3, footer h4, footer h5 {
  font-family: var(--bv-mono);
  font-size: .7rem;
  letter-spacing: .25em;
  text-transform: uppercase;
  color: var(--bv-copper) !important;
}
footer img { max-height: 56px; width: auto; }
`.trim();

const theme = {
  siteTitle: 'The Book Vault PH',
  siteTagline: 'Notes on pre-loved books, reading, and where to find both in the Philippines',
  ogSiteName: 'The Book Vault PH',
  logoUrl: `${SITE}/logo_transparent.png`,
  logoDarkUrl: `${SITE}/logo_transparent.png`,
  faviconUrl: `${SITE}/favicon.svg`,
  logoLink: `${SITE}/`,
  fontsConfig: {
    heading: 'Playfair Display',
    body: 'Cormorant Garamond',
    headingFont: 'Playfair Display',
    bodyFont: 'Cormorant Garamond',
    monoFont: 'DM Mono',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@300;400;500&display=swap',
  },
  // The blog renders header/footer as left/center/right block lists.
  // Block types: logo | link | cta.
  headerConfig: {
    left: { blocks: [{ type: 'logo' }] },
    center: {
      blocks: [
        { type: 'link', label: 'Browse', url: `${SITE}/browse` },
        { type: 'link', label: 'Coming Soon', url: `${SITE}/coming-soon` },
        { type: 'link', label: 'Blog', url: '/blog' },
        { type: 'link', label: 'Contact', url: `${SITE}/contact` },
      ],
    },
    right: { blocks: [{ type: 'cta' }] },
  },
  footerConfig: {
    left: { blocks: [{ type: 'logo' }] },
    center: {
      blocks: [
        { type: 'link', label: 'Browse the shelf', url: `${SITE}/browse` },
        { type: 'link', label: 'Coming soon', url: `${SITE}/coming-soon` },
        { type: 'link', label: 'How to order', url: `${SITE}/#howto` },
        { type: 'link', label: 'Contact', url: `${SITE}/contact` },
      ],
    },
    right: {
      blocks: [
        { type: 'link', label: 'Instagram', url: 'https://instagram.com/thebookvaultph', target: '_blank' },
        { type: 'link', label: 'Facebook', url: 'https://facebook.com/phthebookvault', target: '_blank' },
        { type: 'link', label: 'info@thebookvaultph.com', url: 'mailto:info@thebookvaultph.com' },
      ],
    },
  },
  globalCtaConfig: {
    enabled: true,
    text: 'Browse the shelf',
    url: `${SITE}/browse`,
  },
  customThemeCss,
};

const res = await fetch(`${API}/public-blog/theme`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(theme),
});
const body = await res.text();
console.log(res.status, body.slice(0, 1200));
if (!res.ok) process.exit(1);
