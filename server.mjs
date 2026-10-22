// The Book Vault PH web server.
// Serves the static site (mirroring the rewrites in vercel.json) plus the
// server-rendered /blogs section backed by the OGTool blog API.

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleBlogs } from './lib/blog-routes.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.disable('x-powered-by');

// OGTool blog: index, posts, and forwarded discovery files.
app.get('/blogs', handleBlogs);
app.get('/blogs/:segment', handleBlogs);
app.get('/llms.txt', handleBlogs);

// Static-site rewrites (same table as vercel.json).
const send = file => (req, res) => res.sendFile(path.join(root, file));
app.get('/admin', send('admin.html'));
app.get('/browse', send('browse/index.html'));
app.get('/contact', send('contact/index.html'));
app.get('/coming-soon', send('coming-soon/index.html'));
app.get('/payment', send('payment/index.html'));
app.get('/order', send('order/index.html'));
app.get('/book/:id', send('book/index.html'));
app.get('/blog/:slug', send('blog/post.html'));

app.use(express.static(root, { extensions: ['html'] }));
app.use((req, res) => res.status(404).send('Not found'));

const port = Number(process.env.PORT) || 8000;
app.listen(port, () => console.log(`The Book Vault PH listening on :${port}`));
