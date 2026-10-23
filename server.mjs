// The Book Vault PH web server.
// Serves the static site (mirroring the rewrites in vercel.json) plus the
// OGTool-hosted blog, reverse-proxied under /blog (see ogtool-blog.md).

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.disable('x-powered-by');

// OGTool-hosted blog, reverse-proxied (200 rewrite, never a redirect).
// The full path must reach the blog unchanged — its client-side navigation
// fetches /blog/<slug>.data, and stripping the prefix breaks post clicks.
const BLOG_ORIGIN = 'https://5fe7639a-b520-40ec-90fb-bade1def9b2b.blogs.ogtool.com';
async function proxyBlog(req, res, overridePath) {
  try {
    const hasBody = !['GET', 'HEAD'].includes(req.method);
    // Forward every request header except hop-by-hop ones; fetch sets Host
    // to the blog origin itself (its edge routes by Host).
    const fwd = {};
    const dropReq = new Set(['host', 'connection', 'content-length', 'accept-encoding', 'transfer-encoding']);
    for (const [k, v] of Object.entries(req.headers)) {
      if (!dropReq.has(k.toLowerCase())) fwd[k] = v;
    }
    fwd['x-forwarded-host'] = req.headers.host || '';
    fwd['x-forwarded-proto'] = 'https';
    const upstream = await fetch(BLOG_ORIGIN + (typeof overridePath === 'string' ? overridePath : req.originalUrl), {
      method: req.method,
      headers: fwd,
      ...(hasBody ? { body: req, duplex: 'half' } : {}),
      redirect: 'manual',
    });
    res.status(upstream.status);
    // Return every upstream header except ones that no longer apply
    // (fetch already decompressed the body).
    const dropRes = new Set(['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'location']);
    for (const [k, v] of upstream.headers.entries()) {
      if (!dropRes.has(k.toLowerCase())) res.append(k, v);
    }
    // Keep upstream redirects on this domain; never expose the ogtool.com URL.
    const loc = upstream.headers.get('location');
    if (loc) res.set('location', loc.replace(BLOG_ORIGIN, ''));
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    console.error('blog proxy error:', err);
    res.status(502).send('Blog temporarily unavailable. Please try again shortly.');
  }
}
app.all('/blog', proxyBlog);
app.all('/blog.data', proxyBlog);
// OGTool's verifier fetches <section>/__ogtool-verify expecting the JSON that
// the hosted blog only serves at its root verify route, so map it there.
app.all('/blog/__ogtool-verify', (req, res) => proxyBlog(req, res, '/__ogtool-verify'));
app.all('/blog/*', proxyBlog);
// OGTool's proxy-detection endpoint at the site root.
app.all('/__ogtool-verify', proxyBlog);

// The blog briefly lived at /blogs; keep old links working.
app.get(['/blogs', '/blogs/*'], (req, res) => res.redirect(301, '/blog'));

// Static-site rewrites (same table as vercel.json).
const send = file => (req, res) => res.sendFile(path.join(root, file));
app.get('/admin', send('admin.html'));
app.get('/browse', send('browse/index.html'));
app.get('/contact', send('contact/index.html'));
app.get('/coming-soon', send('coming-soon/index.html'));
app.get('/payment', send('payment/index.html'));
app.get('/order', send('order/index.html'));
app.get('/book/:id', send('book/index.html'));

app.use(express.static(root, { extensions: ['html'] }));
app.use((req, res) => res.status(404).send('Not found'));

const port = Number(process.env.PORT) || 8000;
app.listen(port, () => console.log(`The Book Vault PH listening on :${port}`));
