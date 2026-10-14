# Design Guide

User-stated design decisions. Read before any styling work.

| Token | Value | Applies to |
|---|---|---|
| `--heading-color` | `#FF0000` | Main page (homepage hero) `h1`, including its `em` accent |
| `--heading-size` | `32px` | Main page (homepage hero) `h1` font size |
| `--library-heading-color` | `#E11D48` | Library (browse page) `h1`, including its `em` accent. Token in `browse/index.html` |
| `--library-heading-size` | `32px` | Library (browse page) `h1` font size |
| `--font-book-title` | `Georgia, serif` | All book titles (cards, spines, detail views, wishlist, cart, order). Token in each page's `:root` |

Tokens live in the `:root` block of `index.html`.
