# Design Guide

User-stated design decisions. Read before any styling work.

| Token | Value | Applies to |
|---|---|---|
| `--heading-color` | `#FF0000` | Main page (homepage hero) `h1`, including its `em` accent |
| `--heading-size` | `32px` | Main page (homepage hero) `h1` font size |
| `--library-heading-color` | `#FF6B00` | Library (browse page) `h1`, including its `em` accent. Token in `browse/index.html` |
| `--library-heading-size` | `56px` | Library (browse page) `h1` font size. Heading is also all caps (`text-transform:uppercase`) |
| `--book-card-border` | `3px solid #7C3AED` | Every book card (`.book`) on homepage, browse, coming-soon |
| `--book-card-radius` | `12px` | Book card corner rounding |
| `--font-book-title` | `Georgia, serif` | All book titles (cards, spines, detail views, wishlist, cart, order). Token in each page's `:root` |

Tokens live in the `:root` block of `index.html`.
