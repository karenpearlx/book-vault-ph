// Server-rendered HTML for the /blogs section (OGTool-powered blog).
// Layout, nav, footer, and styling are this site's own; all SEO head tags on
// post pages come straight from the post's OGTool `seo` object.

import { marked } from 'marked';
import { OGTOOL_API_URL, BLOG_BASE } from './ogtool.mjs';

const ATTRIBUTION_KEY = 'pk_attr_97ebfb7450b7e1e1597ecb721fea6c35';

marked.setOptions({ gfm: true }); // raw HTML in markdown passes through unescaped

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = iso => iso ? new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">`;

const OG_SCRIPTS = `<script src="${OGTOOL_API_URL}/blog-enhance.js" defer></script>
<script src="${OGTOOL_API_URL}/attribution.js" data-key="${ATTRIBUTION_KEY}" defer></script>`;

const NAV = `<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="brand"><span class="brand-word">The Book <em>Vault</em> PH</span></a>
    <button class="nav-burger" onclick="document.getElementById('navLinks').classList.toggle('open')" aria-label="Menu">☰</button>
    <div class="nav-links" id="navLinks">
      <a href="/">Home</a>
      <a href="/browse">Browse</a>
      <a href="/coming-soon">Coming Soon</a>
      <a href="/blogs">Blog</a>
      <a href="/contact">Contact</a>
    </div>
  </div>
</nav>`;

const FOOTER = `<footer class="footer">
  <div class="footer-inner">
    <div class="foot-brand">
      <h5>The Book Vault PH</h5>
      <p>Pre-loved books sold online from Negros Occidental. Message us on Instagram if you're hunting for a specific title.</p>
    </div>
    <div>
      <h5>Find us</h5>
      <ul>
        <li><a href="https://instagram.com/thebookvaultph" target="_blank" rel="noopener">Instagram · @thebookvaultph</a></li>
        <li><a href="https://facebook.com/phthebookvault" target="_blank" rel="noopener">Facebook · The Book Vault PH</a></li>
        <li><a href="mailto:info@thebookvaultph.com">info@thebookvaultph.com</a></li>
      </ul>
    </div>
    <div>
      <h5>Shop</h5>
      <ul>
        <li><a href="/browse">Browse the shelf</a></li>
        <li><a href="/coming-soon">Coming soon</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="copyline"><span>© ${new Date().getFullYear()} The Book Vault PH</span></div>
</footer>`;

const SHARED_CSS = `*,*::before,*::after{box-sizing:border-box;}
:root{
  --burgundy:#4A1C2A;--burgundy-deep:#1A0810;--burgundy-mid:#2E0F1A;
  --copper:#B87333;--copper-soft:#D8A355;--copper-bright:#FF9B00;
  --cream:#EEE0D9;--cream-warm:#F5EDE4;--ink:#3D2B24;--ink-soft:#8B7A66;
  --rule:rgba(74,28,42,.12);
}
html{scroll-behavior:smooth;}
.nav{position:sticky;top:0;z-index:50;background:rgba(26,8,16,.92);backdrop-filter:saturate(1.4) blur(12px);border-bottom:1px solid rgba(184,115,51,.18);}
.nav-inner{max-width:1280px;margin:0 auto;padding:14px 28px;display:flex;align-items:center;justify-content:center;gap:32px;}
.brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--cream);flex-shrink:0;}
.brand-word{font-family:"Playfair Display",serif;font-weight:500;font-size:1.15rem;letter-spacing:.01em;color:var(--cream);white-space:nowrap;}
.brand-word em{font-style:italic;color:var(--copper-soft);font-weight:500;}
.nav-links{display:flex;align-items:center;gap:24px;}
.nav-links a{font-family:"DM Mono",monospace;font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;color:rgba(253,248,243,.7);text-decoration:none;padding:6px 2px;border-bottom:1px solid transparent;transition:color .2s,border-color .2s;white-space:nowrap;}
.nav-links a:hover{color:var(--copper-soft);border-bottom-color:var(--copper-soft);}
.nav-burger{display:none;background:none;border:none;color:var(--cream);font-size:1.5rem;cursor:pointer;padding:4px 8px;}
@media (max-width:680px){
  .nav-burger{display:block;}
  .nav-inner{justify-content:flex-start;}
  .nav-links{display:none;position:absolute;top:100%;left:0;right:0;background:var(--burgundy-deep);flex-direction:column;padding:20px 28px;gap:0;border-top:1px solid rgba(253,248,243,.1);}
  .nav-links.open{display:flex;align-items:flex-start;}
  .nav-links.open a{padding:14px 0;border-bottom:1px solid rgba(184,115,51,.12);width:100%;text-align:left;}
  .brand-word{display:none;}
}
.footer{background:#3a1a22;padding:60px 28px 30px;border-top:1px solid rgba(216,154,85,.15);}
.footer-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:48px;}
@media (max-width:780px){.footer-inner{grid-template-columns:1fr;gap:32px;}}
.footer h5{font-family:"DM Mono",monospace;font-size:.7rem;letter-spacing:.25em;text-transform:uppercase;color:var(--copper-soft);margin:0 0 14px;}
.footer p{color:rgba(253,248,243,.8);font-size:1rem;line-height:1.6;font-style:italic;}
.footer a{color:var(--cream);font-size:1rem;line-height:1.6;text-decoration:none;}
.footer a:hover{color:var(--copper-soft);}
.footer ul{list-style:none;padding:0;margin:0;}
.footer li{margin-bottom:8px;}
.foot-brand p{color:rgba(253,248,243,.65);max-width:42ch;margin:0;line-height:1.6;}
.copyline{max-width:1280px;margin:48px auto 0;padding-top:24px;border-top:1px solid rgba(216,154,85,.15);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:"DM Mono",monospace;font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(253,248,243,.5);}`;

const INDEX_CSS = `${SHARED_CSS}
body{margin:0;font-family:"Cormorant Garamond",Georgia,serif;background:var(--burgundy-deep);color:var(--cream);line-height:1.6;}
.hero{position:relative;color:var(--cream);padding:110px 28px 90px;text-align:center;overflow:hidden;
  background:radial-gradient(ellipse 80% 60% at 20% 20%, rgba(184,115,51,.22), transparent 60%),
    radial-gradient(ellipse 70% 80% at 85% 80%, rgba(74,28,42,.7), transparent 65%),
    radial-gradient(ellipse 60% 50% at 50% 110%, rgba(216,154,85,.12), transparent 70%),
    linear-gradient(160deg, #2E0F1A 0%, #1A0810 55%, #240D16 100%);}
.hero .kicker{font-family:"DM Mono",monospace;font-size:.72rem;letter-spacing:.32em;text-transform:uppercase;color:var(--copper-soft);margin:0 0 18px;display:inline-flex;align-items:center;gap:14px;opacity:.9;}
.hero .kicker::before,.hero .kicker::after{content:"";width:36px;height:1px;background:var(--copper-soft);opacity:.5;}
.hero h1{font-family:"Playfair Display",serif;font-weight:400;font-size:clamp(2.4rem,5.5vw,3.8rem);margin:0 0 18px;line-height:1.05;letter-spacing:-.01em;}
.hero h1 em{font-style:italic;color:var(--copper-soft);}
.hero p{max-width:540px;margin:0 auto;color:rgba(253,248,243,.78);font-size:1.15rem;font-style:italic;}
.content-wrap{background:var(--cream-warm);}
.content{max-width:1100px;margin:0 auto;padding:80px 28px 100px;}
.blog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:32px;}
.blog-card{position:relative;display:flex;flex-direction:column;background:var(--burgundy);border:1px solid rgba(184,115,51,.2);border-radius:14px;overflow:hidden;text-decoration:none;color:var(--cream);box-shadow:0 8px 30px -12px rgba(0,0,0,.25);transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease;}
.blog-card:hover{transform:translateY(-5px);border-color:var(--copper);box-shadow:0 18px 45px -18px rgba(0,0,0,.35),0 0 0 1px rgba(184,115,51,.2);}
.blog-card-img{height:200px;position:relative;overflow:hidden;background:linear-gradient(135deg,#E8DDD5 0%,#D9CEC4 100%);display:flex;align-items:center;justify-content:center;font-size:3rem;color:var(--copper);border-bottom:1px solid rgba(74,28,42,.08);background-size:cover;background-position:center;}
.blog-card-body{padding:24px 24px 26px;flex:1;display:flex;flex-direction:column;}
.blog-card h3{font-family:"Playfair Display",serif;font-weight:500;font-size:1.3rem;color:var(--cream);margin:0 0 10px;line-height:1.3;}
.blog-card p{color:rgba(253,248,243,.75);font-size:1rem;margin:0;line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.blog-card-meta{margin-top:16px;padding-top:14px;border-top:1px dashed rgba(253,248,243,.2);font-family:"DM Mono",monospace;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:var(--copper-bright);opacity:.9;}
.blog-empty{text-align:center;padding:80px 24px;background:linear-gradient(160deg,rgba(74,28,42,.06) 0%,rgba(46,15,26,.1) 100%);border:1px solid rgba(184,115,51,.25);border-radius:16px;}
.empty-ornament{font-size:2rem;color:var(--copper);margin-bottom:16px;letter-spacing:.4em;opacity:.7;}
.empty-title{font-family:"Playfair Display",serif;font-style:italic;font-weight:400;font-size:1.7rem;color:var(--burgundy);margin:0 0 14px;}
.empty-quote{font-family:"Cormorant Garamond",serif;font-style:italic;color:var(--ink-soft);font-size:1.1rem;max-width:460px;margin:0 auto 8px;line-height:1.55;}`;

const POST_CSS = `${SHARED_CSS}
body{margin:0;font-family:"Cormorant Garamond",Georgia,serif;background:var(--cream);color:var(--ink);line-height:1.7;font-size:1.15rem;}
.hero-img{max-width:1100px;width:calc(100% - 56px);max-height:420px;object-fit:cover;display:block;margin:32px auto 0;border-radius:12px;}
.article{max-width:1100px;margin:0 auto;padding:48px 28px 80px;}
.crumb{font-family:"DM Mono",monospace;font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;color:var(--copper);margin-bottom:14px;}
.crumb a{color:var(--copper);text-decoration:none;}
.crumb a:hover{text-decoration:underline;}
h1.post-title{font-family:"Playfair Display",serif;font-weight:500;font-size:clamp(2rem,5vw,3rem);line-height:1.15;color:var(--burgundy);margin:0 0 18px;}
.post-meta{font-family:"DM Mono",monospace;font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-soft);display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px;padding-bottom:24px;border-bottom:1px solid var(--rule);}
.post-meta .byline{color:var(--copper);}
.post-layout{display:grid;grid-template-columns:250px minmax(0,1fr);gap:56px;align-items:start;}
.toc-side{position:sticky;top:90px;}
@media (max-width:900px){
  .post-layout{grid-template-columns:1fr;gap:0;}
  .toc-side{position:static;margin-bottom:36px;}
}
.og-toc{background:rgba(184,115,51,.07);border:1px solid rgba(184,115,51,.25);border-radius:12px;padding:20px 22px;}
.og-toc::before{content:"On this page";display:block;font-family:"DM Mono",monospace;font-size:.62rem;letter-spacing:.25em;text-transform:uppercase;color:var(--copper);margin-bottom:12px;}
.og-toc-list{list-style:none;margin:0;padding:0;}
.og-toc-list .og-toc-list{padding-left:16px;margin-top:4px;}
.og-toc-item{margin:0 0 8px;}
.og-toc-link{font-family:"Cormorant Garamond",serif;font-size:1.02rem;line-height:1.35;color:var(--ink);text-decoration:none;display:inline-block;border-bottom:1px solid transparent;transition:color .2s,border-color .2s;}
.og-toc-link:hover{color:var(--copper);border-bottom-color:var(--copper);}
.post-body{font-size:1.15rem;}
.post-body h1,.post-body h2,.post-body h3{font-family:"Playfair Display",serif;color:var(--burgundy);font-weight:500;line-height:1.25;margin:1.8em 0 .6em;}
.post-body h1{font-size:1.9rem;font-style:italic;}
.post-body h2{font-size:1.55rem;}
.post-body h3{font-size:1.25rem;}
.post-body p{margin:0 0 1.1em;}
.post-body a{color:var(--copper);}
.post-body img{max-width:100%;border-radius:8px;margin:1.5em 0;}
.post-body blockquote{margin:1.5em 0;padding:14px 22px;border-left:3px solid var(--copper);background:rgba(184,115,51,.06);font-style:italic;color:var(--burgundy);}
.post-body code{background:rgba(74,28,42,.08);padding:2px 6px;border-radius:3px;font-size:.92em;font-family:"DM Mono",monospace;}
.post-body pre{background:var(--burgundy-deep);color:var(--cream-warm);padding:16px 20px;border-radius:8px;overflow-x:auto;}
.post-body pre code{background:none;padding:0;color:inherit;}
.post-body ul,.post-body ol{padding-left:1.4em;margin:0 0 1.1em;}
.post-body li{margin-bottom:.4em;}
.post-body table{width:100%;border-collapse:collapse;margin:1.5em 0;font-size:.95rem;background:var(--cream-warm);border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,.06);}
.post-body thead{background:var(--burgundy);color:var(--cream);}
.post-body th{padding:14px 16px;text-align:left;font-family:"Playfair Display",serif;font-weight:500;}
.post-body td{padding:12px 16px;border-bottom:1px solid rgba(74,28,42,.1);}
.post-body tbody tr:last-child td{border-bottom:none;}
.post-body tbody tr:nth-child(even){background:rgba(74,28,42,.03);}
.post-body .embed-container{margin:1.5em 0;border-radius:10px;overflow:hidden;}
.post-body .embed-container iframe,.post-body iframe{max-width:100%;border:none;border-radius:10px;}
.post-body hr{border:none;border-top:1px solid var(--rule);margin:2em 0;}
.back-link{display:inline-block;margin-top:32px;font-family:"DM Mono",monospace;font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;color:var(--copper);text-decoration:none;}
.back-link:hover{text-decoration:underline;}
.notfound{text-align:center;padding:80px 20px;color:var(--ink-soft);font-style:italic;}`;

// Head tags for a post page. Everything here comes from the post's OGTool
// `seo` object as sent — never rebuilt locally.
function seoHead(seo = {}) {
  const tags = [];
  tags.push(`<title>${esc(seo.metaTitle)}</title>`);
  tags.push(`<meta name="description" content="${esc(seo.metaDescription)}">`);
  tags.push(`<link rel="canonical" href="${esc(seo.canonicalUrl)}">`);
  tags.push(`<meta property="og:type" content="article">`);
  tags.push(`<meta property="og:site_name" content="The Book Vault PH">`);
  tags.push(`<meta property="og:title" content="${esc(seo.metaTitle)}">`);
  tags.push(`<meta property="og:description" content="${esc(seo.metaDescription)}">`);
  tags.push(`<meta property="og:url" content="${esc(seo.canonicalUrl)}">`);
  if (seo.ogImageUrl) tags.push(`<meta property="og:image" content="${esc(seo.ogImageUrl)}">`);
  if (seo.publishedTime) tags.push(`<meta property="article:published_time" content="${esc(seo.publishedTime)}">`);
  if (seo.modifiedTime) tags.push(`<meta property="article:modified_time" content="${esc(seo.modifiedTime)}">`);
  tags.push(`<meta name="twitter:card" content="summary_large_image">`);
  tags.push(`<meta name="twitter:title" content="${esc(seo.metaTitle)}">`);
  tags.push(`<meta name="twitter:description" content="${esc(seo.metaDescription)}">`);
  if (seo.ogImageUrl) tags.push(`<meta name="twitter:image" content="${esc(seo.ogImageUrl)}">`);
  if (seo.jsonLd) {
    const ld = typeof seo.jsonLd === 'string' ? seo.jsonLd : JSON.stringify(seo.jsonLd);
    tags.push(`<script type="application/ld+json">${ld}</script>`);
  }
  if (seo.headHtml) tags.push(seo.headHtml); // verbatim; OGTool ships future tags through this
  return tags.join('\n');
}

function page({ head, css, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${head}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${FONTS}
${OG_SCRIPTS}
<style>${css}</style>
</head>
<body>
${NAV}
${body}
${FOOTER}
</body>
</html>`;
}

function card(p) {
  const img = p.headerImageUrl || p.ogImageUrl || (p.seo && p.seo.ogImageUrl) || '';
  const excerpt = p.ogDescription || (p.seo && p.seo.metaDescription) || '';
  const mins = p.seo && p.seo.readingTimeMinutes;
  const meta = [fmt(p.publishedAt), mins ? `${mins} min read` : '', p.authorName || '']
    .filter(Boolean).join(' · ');
  return `<a class="blog-card" href="/blogs/${encodeURIComponent(p.slug)}">
    <div class="blog-card-img"${img ? ` style="background-image:url('${esc(img)}')"` : ''}>${img ? '' : '📖'}</div>
    <div class="blog-card-body">
      <h3>${esc(p.title)}</h3>
      ${excerpt ? `<p>${esc(excerpt)}</p>` : ''}
      ${meta ? `<div class="blog-card-meta">${esc(meta)}</div>` : ''}
    </div>
  </a>`;
}

export function renderIndex(posts) {
  const grid = posts.length
    ? `<div class="blog-grid">${posts.map(card).join('')}</div>`
    : `<div class="blog-empty">
        <div class="empty-ornament">❦</div>
        <div class="empty-title">The shelves are still warming up</div>
        <p class="empty-quote">New posts land here soon. In the meantime, the shelf is open.</p>
      </div>`;
  const head = `<title>Blog — The Book Vault PH</title>
<meta name="description" content="Book reviews, reading lists, and bookish musings from The Book Vault PH.">
<link rel="canonical" href="${esc(BLOG_BASE)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="The Book Vault PH">
<meta property="og:title" content="Blog — The Book Vault PH">
<meta property="og:description" content="Book reviews, reading lists, and bookish musings.">
<meta property="og:url" content="${esc(BLOG_BASE)}">
<meta property="og:image" content="https://thebookvaultph.com/og-preview.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Blog — The Book Vault PH">
<meta name="twitter:description" content="Book reviews, reading lists, and bookish musings.">
<link rel="alternate" type="application/rss+xml" title="The Book Vault PH blog" href="/blogs/rss.xml">`;
  const body = `<section class="hero">
  <div class="hero-inner">
    <div class="kicker">The Reading Room</div>
    <h1>From the <em>Vault</em></h1>
    <p>Notes, lists, and whatever we're reading. Nothing fancy, just book talk.</p>
  </div>
</section>
<div class="content-wrap"><div class="content">${grid}</div></div>`;
  return page({ head, css: INDEX_CSS, body });
}

export function renderPost(post) {
  const html = marked.parse(post.content || '');
  const seo = post.seo || {};
  const meta = [
    post.authorName ? `<span class="byline">By ${esc(post.authorName)}</span>` : '',
    post.publishedAt ? `<span>${fmt(post.publishedAt)}</span>` : '',
    seo.readingTimeMinutes ? `<span>${seo.readingTimeMinutes} min read</span>` : '',
    post.updatedAt && post.publishedAt && (new Date(post.updatedAt) - new Date(post.publishedAt) > 86400000)
      ? `<span style="opacity:.7;">Updated ${fmt(post.updatedAt)}</span>` : '',
  ].filter(Boolean).join('');
  const body = `${post.headerImageUrl ? `<img class="hero-img" src="${esc(post.headerImageUrl)}" alt="${esc(post.title)}">` : ''}
<article class="article">
  <div class="crumb"><a href="/blogs">← Blog</a></div>
  <h1 class="post-title">${esc(post.title)}</h1>
  <div class="post-meta">${meta}</div>
  <div class="post-layout">
    <aside class="toc-side"><div data-og-toc></div></aside>
    <div class="post-body">${html}</div>
  </div>
  <a href="/blogs" class="back-link">← back to all posts</a>
</article>`;
  return page({ head: seoHead(seo), css: POST_CSS, body });
}

export function renderMessage(title, text, { backLink = true } = {}) {
  const head = `<title>${esc(title)} — The Book Vault PH</title>
<meta name="robots" content="noindex">`;
  const body = `<article class="article">
  <div class="notfound">${esc(text)}${backLink ? `<br><br><a class="back-link" href="/blogs">← back to the blog</a>` : ''}</div>
</article>`;
  return page({ head, css: POST_CSS, body });
}
