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
async function proxyBlog(req, res) {
  try {
    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const upstream = await fetch(BLOG_ORIGIN + req.originalUrl, {
      method: req.method,
      headers: {
        accept: req.headers.accept || '*/*',
        'accept-language': req.headers['accept-language'] || 'en',
        'user-agent': req.headers['user-agent'] || 'bookvaultph-proxy',
        'x-forwarded-host': req.headers.host || '',
        'x-forwarded-proto': 'https',
        ...(req.headers['content-type'] ? { 'content-type': req.headers['content-type'] } : {}),
      },
      ...(hasBody ? { body: req, duplex: 'half' } : {}),
      redirect: 'manual',
    });
    res.status(upstream.status);
    for (const h of ['content-type', 'cache-control', 'etag', 'last-modified']) {
      const v = upstream.headers.get(h);
      if (v) res.set(h, v);
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
