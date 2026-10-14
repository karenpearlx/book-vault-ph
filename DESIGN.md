# Design guide

## Test override (2026-10-14) — deliberately off-brand, user-requested

Applied exactly as specified for a test; revert on request.

- Library heading (`.hero h1` on /browse): 64px, Comic Sans MS, #39FF14 (neon lime), on a solid #000 full-width banner (hero gradient removed).
- Book cards (`.book` on home, /browse, /coming-soon): 4px dashed #FF69B4 (hot pink) border, #fff background, 12px padding.

## Admin quick add (2026-10-14)

- Adding a book: one full-width solid #FF0000 "+ QUICK ADD" button at the top of the admin page (`.quick-add-btn`), opening a title-only form. Replaces the old "+ add new book" toolbar button; the full form remains for editing.
