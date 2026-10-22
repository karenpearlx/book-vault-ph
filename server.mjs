// Static file server for The Book Vault PH.
// Mirrors the routing in vercel.json so local/dev and production behave the same:
// filesystem first, then clean URLs (/browse -> browse/index.html, /admin -> admin.html),
// then the dynamic routes /book/:slug and /blog/:slug.

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { Readable } from 'node:stream';

const ROOT = resolve(import.meta.dirname);
const PORT = Number(process.env.PORT) || 8000;

// /blog is an OGTool-hosted blog served under this domain via reverse proxy.
// Forward the FULL path (never strip the /blog prefix) — the hosted blog's own
// URLs start with /blog and its client-side navigation fetches /blog/<slug>.data.
// Mirrored for Vercel in vercel.json; see ogtool-blog.md.
const BLOG_ORIGIN = 'https://3c092978-b4f0-42bc-a184-3690df0445cb.blogs.ogtool.com';

function isBlogPath(pathname) {
  return pathname === '/blog' || pathname === '/blog.data' || pathname.startsWith('/blog/');
}

async function proxyBlog(req, res, pathname, search) {
  const upstream = await fetch(BLOG_ORIGIN + pathname + search, {
    method: req.method,
    headers: {
      'accept': req.headers['accept'] || '*/*',
      'accept-language': req.headers['accept-language'] || '',
      'user-agent': req.headers['user-agent'] || '',
      'x-forwarded-host': req.headers['host'] || '',
      'x-forwarded-proto': 'https',
    },
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
    duplex: 'half',
    redirect: 'follow',
  });

  const headers = {};
  for (const [key, value] of upstream.headers) {
    // fetch already decompressed the body; let Node recompute framing.
    if (['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(key)) continue;
    headers[key] = value;
  }
  res.writeHead(upstream.status, headers);
  if (req.method === 'HEAD' || !upstream.body) {
    res.end();
    return;
  }
  Readable.fromWeb(upstream.body).pipe(res);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

async function fileAt(pathname) {
  const target = join(ROOT, normalize(pathname));
  if (target !== ROOT && !target.startsWith(ROOT + '/')) return null;
  try {
    const info = await stat(target);
    return info.isFile() ? target : null;
  } catch {
    return null;
  }
}

async function resolveFile(pathname) {
  if (pathname === '/') return fileAt('/index.html');

  const clean = pathname.replace(/\/+$/, '') || '/';

  return (
    (await fileAt(clean)) ||
    (await fileAt(`${clean}.html`)) ||
    (await fileAt(`${clean}/index.html`)) ||
    (/^\/book\/[^/]+$/.test(clean) ? await fileAt('/book/index.html') : null) ||
    (/^\/blog\/[^/]+$/.test(clean) ? await fileAt('/blog/post.html') : null)
  );
}

const server = createServer(async (req, res) => {
  let pathname, search;
  try {
    const url = new URL(req.url, 'http://localhost');
    pathname = decodeURIComponent(url.pathname);
    search = url.search;
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end('Bad request');
    return;
  }

  if (isBlogPath(pathname)) {
    try {
      await proxyBlog(req, res, pathname, search);
    } catch (err) {
      console.error('blog proxy error:', err);
      if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Blog is temporarily unavailable.');
    }
    return;
  }

  const file = await resolveFile(pathname);
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><meta charset="utf-8"><title>Not found</title><p>Page not found. <a href="/">Back to the shop</a>.</p>');
    return;
  }

  const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
  const cache = file.endsWith('.html') ? 'no-cache' : 'public, max-age=3600';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`The Book Vault PH running on http://0.0.0.0:${PORT}`);
});
