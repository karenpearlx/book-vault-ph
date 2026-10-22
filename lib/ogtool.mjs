// OGTool blog API client.
// Every request carries the server-side API key and the blog's public base URL
// (so OGTool returns a ready-made `seo` object per post). Successful responses
// are cached in memory (and mirrored to a tmp file so a restart during an
// OGTool outage still has data); if a request fails, the last good response is
// served instead of crashing the page.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const OGTOOL_API_URL = (process.env.OGTOOL_API_URL || 'https://app.ogtool.com').replace(/\/+$/, '');
export const SITE_ORIGIN = (process.env.SITE_ORIGIN || 'https://thebookvaultph.com').replace(/\/+$/, '');
export const BLOG_BASE = (process.env.BLOG_BASE || `${SITE_ORIGIN}/blogs`).replace(/\/+$/, '');

const API_KEY = process.env.OGTOOL_API_KEY || '';
const FRESH_MS = 2 * 60 * 1000; // re-fetch after 2 min — keeps posts fresh well under the 5-minute cap
const CACHE_FILE = path.join(os.tmpdir(), 'bvph-ogtool-cache.json');

const cache = new Map();
try {
  const saved = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  for (const [k, v] of Object.entries(saved)) cache.set(k, v);
} catch { /* no saved cache yet */ }

let persistTimer = null;
function persist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try { fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(cache))); } catch { /* cache file is best-effort */ }
  }, 250);
}

async function cached(key, fetcher) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < FRESH_MS) return hit.v;
  try {
    const v = await fetcher();
    cache.set(key, { t: Date.now(), v });
    persist();
    return v;
  } catch (err) {
    if (hit) return hit.v; // stale beats down
    throw err;
  }
}

function apiFetch(pathname, params = {}) {
  const url = new URL(OGTOOL_API_URL + pathname);
  url.searchParams.set('base', BLOG_BASE);
  for (const [k, v] of Object.entries(params)) if (v != null) url.searchParams.set(k, String(v));
  return fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
}

// Published posts, newest first.
export function getPosts() {
  return cached('posts', async () => {
    const res = await apiFetch('/api/public-blog/posts');
    if (!res.ok) throw new Error(`OGTool posts API returned ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('OGTool posts API returned success:false');
    return data.posts || [];
  });
}

// One post by slug. Resolves to:
//   { kind: 'post', post }      — found
//   { kind: 'redirect', to }    — OGTool moved the slug; respond with a 301
//   { kind: 'notfound' }        — no such post
export function getPost(slug) {
  return cached(`post:${slug}`, async () => {
    const res = await apiFetch('/api/public-blog/posts', { slug });
    if (res.status === 404) {
      let body = null;
      try { body = await res.json(); } catch { /* non-JSON 404 body */ }
      if (body && body.redirectTo) return { kind: 'redirect', to: body.redirectTo };
      return { kind: 'notfound' };
    }
    if (!res.ok) throw new Error(`OGTool post API returned ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.post) return { kind: 'notfound' };
    return { kind: 'post', post: data.post };
  });
}

// Forwarded discovery files (sitemap.xml, rss.xml, llms.txt, future files).
// Returns { status, contentType, body: Buffer }. Only 2xx responses are cached;
// non-2xx statuses pass through so unknown names stay 404.
export async function getFile(apiPath) {
  const key = `file:${apiPath}`;
  const hit = cache.get(key);
  const decode = v => ({ status: v.status, contentType: v.contentType, body: Buffer.from(v.b64, 'base64') });
  if (hit && Date.now() - hit.t < FRESH_MS) return decode(hit.v);
  try {
    const res = await apiFetch(apiPath);
    const body = Buffer.from(await res.arrayBuffer());
    const out = {
      status: res.status,
      contentType: res.headers.get('content-type') || 'application/octet-stream',
      body,
    };
    if (res.ok) {
      cache.set(key, { t: Date.now(), v: { status: out.status, contentType: out.contentType, b64: body.toString('base64') } });
      persist();
    }
    return out;
  } catch (err) {
    if (hit) return decode(hit.v);
    throw err;
  }
}
