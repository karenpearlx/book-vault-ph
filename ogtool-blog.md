# OGTool blog: editing, theming, and verification

This site's blog is hosted by OGTool and served under this site's own domain through a reverse proxy. The proxy rewrites (NOT redirects) each blog section to the hosted blog, which treats the first path segment as the section. Rewrites must forward the FULL path: /<section>/<anything> reaches the blog as /<section>/<anything>, never with the section prefix stripped, or clicking a post breaks in the browser while a refresh works.

- Hosted blog origin (proxy target): https://5fe7639a-b520-40ec-90fb-bade1def9b2b.blogs.ogtool.com
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
3. Open the live blog at /blog on this site (or https://5fe7639a-b520-40ec-90fb-bade1def9b2b.blogs.ogtool.com/blog) and compare against the site.
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

- Never bypass the proxy by linking to https://5fe7639a-b520-40ec-90fb-bade1def9b2b.blogs.ogtool.com in user-facing pages; always link the blog as /blog on this site.
- Keep the blog sections crawlable; never add robots rules that block search or AI crawlers from them.
- The root robots.txt must keep one `Sitemap:` line per section pointing at `https://<this site's domain>/<section>/sitemap.xml`.
- To refresh this file: `curl -H "Authorization: Bearer $OGTOOL_API_KEY" https://app.ogtool.com/api/public-blog/agent-instructions`
