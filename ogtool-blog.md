# OGTool blog: editing, theming, and verification

This site's blog is hosted by OGTool and served under this site's own domain through a reverse proxy. The proxy rewrites (NOT redirects) each blog section to the hosted blog, which treats the first path segment as the section. Rewrites must forward the FULL path: /<section>/<anything> reaches the blog as /<section>/<anything>, never with the section prefix stripped, or clicking a post breaks in the browser while a refresh works.

- Hosted blog origin (proxy target): https://4d7aa697-410b-4ba5-8ff0-c4d5f3170b00.blogs.ogtool.com
- Blog sections on this site: /blog
- API base: https://app.ogtool.com/api
- Auth: every API request sends the header `Authorization: Bearer $OGTOOL_API_KEY`

The API key is stored in this site's environment or secret store as `OGTOOL_API_KEY`. Never commit it, print it, or ship it in client bundles. If it is missing or rejected (401), ask the site owner to regenerate it from OGTool's blog onboarding page; regenerating revokes the old key.

## Editing posts

Posts live in OGTool, not in this repo. Full CRUD at `https://app.ogtool.com/api/public-blog/posts`:

- `GET ?status=published&limit=50&offset=0` lists posts, newest first (`status=all` includes drafts)
- `GET ?slug=<slug>` or `GET ?id=<id>` fetches one post
- `POST` with `{ title, content, slug?, status? ("draft" or "published"), publishedAt?, ogTitle?, ogDescription?, ogImageUrl?, headerImageUrl?, targetKeyword? }` creates a post (`title` and `content` required; slug derives from the title when omitted)
- `PUT` with `{ id, ...fields }` updates a post
- `DELETE ?id=<id>` deletes a post

`content` is markdown that may embed raw HTML and custom elements. Post URLs are `/<section>/<slug>` on this site; slugs are stable, so never change a published post's slug without being asked.

New blogs start with three sample posts (slugs prefixed `sample-`). Delete them via the API once real posts are live.

## Lead magnets (quizzes, calculators, checkers inside posts)

A lead magnet is an interactive widget embedded in a post that collects the reader's email. Each one is a single self-contained HTML document (inline CSS and JS, styled to match this site) stored in OGTool:

- `GET https://app.ogtool.com/api/public-blog/lead-magnets` lists them; `GET ?slug=<slug>` returns one with its html
- `PUT` with `{ slug, name, html, isActive? }` creates or replaces one (slug: lowercase letters, digits, hyphens; html under 200 KB)
- `DELETE ?slug=<slug>` deletes one; `PUT { slug, isActive: false }` hides it everywhere without editing posts

Every response includes `embedTag`, e.g. `<leadmagnet data-props='{"slug":"pricing-calculator"}'></leadmagnet>`. Put that tag on its own line in a post's `content` (via the posts API) where the widget should appear.

Inside the widget, capture the email with:

```js
await window.ogtool.lead({ email, name, fields: { plan: "pro", seats: 12 } });
```

It resolves once the lead is saved and rejects with a readable message otherwise (show it to the reader). Leads land in this team's OGTool attribution dashboard with the magnet slug, the post, and `fields`. Rules for the html:

- It runs in a sandboxed iframe with no access to the blog page, cookies, or storage. Use `window.ogtool.lead()`, never your own form endpoint, so the lead is attributed
- Links open in a new tab by default; use `target="_top"` for a link that should navigate the reader's page (e.g. a sign-up button)
- `fetch` works only against APIs that allow any origin (CORS `*`), and never put secrets in the html
- The iframe grows to fit the content automatically; design mobile-first and keep it self-contained

## Theming the blog

The blog's look comes from a theme config OGTool applies instantly, with no deploy:

- `GET https://app.ogtool.com/api/public-blog/theme` returns the current theme
- `PUT https://app.ogtool.com/api/public-blog/theme` updates any of:
  - `customThemeCss`: a CSS string injected into every blog page. The main lever; use it for colors, fonts, spacing, and component overrides
  - `fontsConfig`: heading and body font families
  - `headerConfig` / `footerConfig`: navigation and footer links
  - `globalCtaConfig`: the blog-wide call to action
  - `siteTitle`, `siteTagline`, `ogSiteName`
  - `logoUrl`, `logoDarkUrl`, `faviconUrl`: public image URLs; OGTool downloads and hosts them
  - `logoLink`: where the logo points (usually this site's homepage)

Workflow for restyling (do this whenever the site is redesigned):

1. Extract the site's real design: primary and accent colors, background, heading and body fonts, logo, favicon, nav links, primary call to action.
2. `PUT` them to the theme endpoint.
3. Open the live blog at /blog on this site (or https://4d7aa697-410b-4ba5-8ff0-c4d5f3170b00.blogs.ogtool.com/blog) and compare against the site.
4. Iterate on `customThemeCss` until the blog visually matches. Changes apply on reload.

## Verifying the setup

After any change to the proxy, hosting, or domain, report in so OGTool re-checks everything:

```
curl -X POST https://app.ogtool.com/api/public-blog/verify \
  -H "Authorization: Bearer $OGTOOL_API_KEY" -H "Content-Type: application/json" \
  -d '{"blogUrl": "https://<this site's domain>/blog"}'
```

The response reports each test:

- `verified`: the overall result; must be true
- `proxyDetected`: must be true; false means the rewrite is redirecting instead of proxying, or not forwarding subpaths like __ogtool-verify
- `checks.blogIndex`: the page loads and serves this team's blog
- `checks.theme`: the theme has been customized via the theme API; false blocks verification for a proxied blog, so run the theming workflow above
- `checks.clientNavigation`: clicking a post works through the proxy; false means the rewrite strips the section prefix from subpaths, so fix the rules to forward the full path
- `checks.sitemap` / `checks.rss`: /blog/sitemap.xml and /blog/rss.xml resolve through the proxy
- `reason`: when verified is false, the plain-language cause and fix

A successful verify also points the blog's canonical URLs and sitemap at this site's domain, so always re-verify after a domain change. Safe to call repeatedly (rate limited to 10/minute).

## Rules

- Never bypass the proxy by linking to https://4d7aa697-410b-4ba5-8ff0-c4d5f3170b00.blogs.ogtool.com in user-facing pages; always link the blog as /blog on this site.
- Keep the blog sections crawlable; never add robots rules that block search or AI crawlers from them.
- The root robots.txt must keep one `Sitemap:` line per section pointing at `https://<this site's domain>/<section>/sitemap.xml`.
- To refresh this file: `curl -H "Authorization: Bearer $OGTOOL_API_KEY" https://app.ogtool.com/api/public-blog/agent-instructions`
