# The Book Vault PH — agent notes

Static site (plain HTML/CSS/JS, Supabase from the browser) served by `server.mjs` on port 8000. `vercel.json` carries the same routing for Vercel deploys.

The blog sections (/blog) are an OGTool-hosted blog behind a reverse proxy. See ogtool-blog.md for how to edit posts, theme it, and verify the setup. The proxy lives in `server.mjs` (and mirrored in `vercel.json`); it must forward the full path, never stripping the /blog prefix. The OGTool API key is stored in the environment as `OGTOOL_API_KEY` — never commit it or ship it client-side.
