// Request handlers for the /blogs section and the forwarded OGTool discovery
// files. Written against plain Node req/res so the same handlers serve both
// server.mjs (Express) and api/blogs.mjs (Vercel function).

import { getPosts, getPost, getFile } from './ogtool.mjs';
import { renderIndex, renderPost, renderMessage } from './blog-html.mjs';

// Dynamic content, lightly CDN-cacheable: 2 min shared cache keeps edits
// visible well inside the 5-minute freshness requirement.
const CACHE_CONTROL = 'public, max-age=0, s-maxage=120, stale-while-revalidate=600';

function sendHtml(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': CACHE_CONTROL });
  res.end(html);
}

async function serveIndex(res) {
  let posts;
  try {
    posts = await getPosts();
  } catch {
    // OGTool unreachable and nothing cached: friendly page, not a crash.
    return sendHtml(res, 503, renderMessage('Blog', 'The blog is catching its breath. Check back in a minute.', { backLink: false }));
  }
  sendHtml(res, 200, renderIndex(posts));
}

async function servePost(res, slug) {
  let result;
  try {
    result = await getPost(slug);
  } catch {
    return sendHtml(res, 503, renderMessage('Blog', 'This post is catching its breath. Check back in a minute.'));
  }
  if (result.kind === 'redirect') {
    res.writeHead(301, { Location: result.to, 'Cache-Control': CACHE_CONTROL });
    return res.end();
  }
  if (result.kind === 'notfound') {
    return sendHtml(res, 404, renderMessage('Not found', 'Post not found.'));
  }
  sendHtml(res, 200, renderPost(result.post));
}

// Forward an OGTool-served file unchanged (status, Content-Type, body).
async function serveFile(res, apiPath) {
  let file;
  try {
    file = await getFile(apiPath);
  } catch {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Temporarily unavailable');
  }
  res.writeHead(file.status, { 'Content-Type': file.contentType, 'Cache-Control': CACHE_CONTROL });
  res.end(file.body);
}

const NAMED_FILES = {
  'sitemap.xml': '/api/public-blog/sitemap.xml',
  'rss.xml': '/api/public-blog/rss.xml',
  'llms.txt': '/api/public-blog/llms.txt',
};

// Single entry point. Resolves what to serve from the query (?p=…, set by the
// Vercel route table) or, failing that, from the request path (Express).
export async function handleBlogs(req, res) {
  const url = new URL(req.url, 'http://local');
  const p = url.searchParams.get('p');
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (p === 'index' || (!p && pathname === '/blogs')) return serveIndex(res);
  if (p === 'llms' || (!p && pathname === '/llms.txt')) return serveFile(res, NAMED_FILES['llms.txt']);

  let segment = url.searchParams.get('path');
  if (!segment && pathname.startsWith('/blogs/')) segment = decodeURIComponent(pathname.slice('/blogs/'.length));
  if (!segment) return serveIndex(res);

  if (NAMED_FILES[segment]) return serveFile(res, NAMED_FILES[segment]);
  // Anything that looks like a file forwards to OGTool's catch-all, so new
  // discovery files ship without touching this repo. Unknown names 404 there.
  if (segment.includes('.')) return serveFile(res, `/api/public-blog/files/${encodeURIComponent(segment)}`);
  return servePost(res, segment);
}
