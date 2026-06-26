#!/usr/bin/env node
// Regenerate sitemap.xml with all books from Supabase
// Run: node scripts/gen-sitemap.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://vmjhpjvveoaroruzmbla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtamhwanZ2ZW9hcm9ydXptYmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxMDgsImV4cCI6MjA5NzE4NjEwOH0.32ehuFpEVO_H5OZi7oKrYGR3XyplP3kuWB_bDBrLTEM';
const BASE = 'https://thebookvaultph.com';

const slugify = s => String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/['']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const { data, error } = await sb.from('books').select('id,title,author,status').neq('status','sold');
if (error) { console.error(error); process.exit(1); }

const pages = [
  { loc: `${BASE}/`, freq: 'daily', pri: '1.0' },
  { loc: `${BASE}/browse`, freq: 'daily', pri: '0.9' },
  { loc: `${BASE}/coming-soon`, freq: 'weekly', pri: '0.8' },
  { loc: `${BASE}/blog`, freq: 'weekly', pri: '0.7' },
  { loc: `${BASE}/contact`, freq: 'monthly', pri: '0.5' },
];

const seen = new Set();
for (const b of data) {
  let s = slugify(b.title);
  if (seen.has(s)) s = slugify(`${b.title}-${b.author||''}`);
  if (!s || seen.has(s)) continue;
  seen.add(s);
  pages.push({ loc: `${BASE}/book?slug=${s}`, freq: 'weekly', pri: '0.6' });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url>\n    <loc>${p.loc}</loc>\n    <changefreq>${p.freq}</changefreq>\n    <priority>${p.pri}</priority>\n  </url>`).join('\n')}\n</urlset>\n`;

fs.writeFileSync('sitemap.xml', xml);
console.log(`Wrote sitemap with ${pages.length} URLs (${data.length} books)`);
