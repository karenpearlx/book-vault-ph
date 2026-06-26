-- =====================================================================
-- The Book Vault PH — Blog Admin Migration
-- Run this once in Supabase SQL editor.
-- Adds: primary_keyword column, blog_keywords table, blog_categories
-- table, updated_at trigger, and default seeds.
-- =====================================================================

-- 1. Primary keyword column on blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS primary_keyword TEXT;

-- 2. updated_at auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 3. blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all" ON blog_categories;
CREATE POLICY "Allow anon all" ON blog_categories FOR ALL USING (true) WITH CHECK (true);

INSERT INTO blog_categories (name, slug) VALUES
  ('Guides',  'guides'),
  ('Lists',   'lists'),
  ('Reviews', 'reviews'),
  ('Local',   'local')
ON CONFLICT (slug) DO NOTHING;

-- 4. blog_keywords table
CREATE TABLE IF NOT EXISTS blog_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  phase INT DEFAULT 1,
  status TEXT DEFAULT 'not_started',
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_keywords ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all" ON blog_keywords;
CREATE POLICY "Allow anon all" ON blog_keywords FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed keywords (only if table is empty)
INSERT INTO blog_keywords (keyword, phase)
SELECT k, p FROM (VALUES
  -- Phase 1: Brand Foundation (Days 1-10)
  ('the book vault ph online bookshop', 1),
  ('preloved books philippines online', 1),
  ('affordable books online philippines cod', 1),
  ('second hand books philippines delivery', 1),
  ('online bookshop san carlos city pangasinan', 1),
  ('free book delivery san carlos pangasinan', 1),
  ('preloved books pangasinan', 1),
  ('how to buy preloved books online philippines safely', 1),
  ('like new vs preloved books condition guide', 1),
  ('cod book delivery philippines jnt lbc', 1),
  -- Phase 2: Niche Capture (Days 11-25)
  ('best thriller books for beginners philippines', 2),
  ('psychological thriller books recommendation', 2),
  ('gothic horror books for beginners', 2),
  ('dark romance books recommendation philippines', 2),
  ('romance books like colleen hoover philippines', 2),
  ('ya books filipino readers love', 2),
  ('books like fourth wing philippines', 2),
  ('books like acotar philippines', 2),
  ('short thriller books under 300 pages', 2),
  ('spooky books to read philippines', 2),
  ('verity book review no spoilers', 2),
  ('best colleen hoover book to start with', 2),
  ('twisted series ana huang reading order', 2),
  ('thriller vs psychological suspense difference', 2),
  ('booktok starter pack new readers philippines', 2),
  -- Phase 3: Bigger / Harder (Days 26-35)
  ('where to buy affordable books online philippines', 3),
  ('best romance books philippines', 3),
  ('best thriller books philippines', 3),
  ('colleen hoover books ranked', 3),
  ('national bookstore vs preloved books philippines', 3),
  ('best ya books philippines', 3),
  ('booktok books philippines', 3),
  ('gothic horror books recommendation', 3),
  ('dark romance books philippines', 3),
  ('affordable books philippines under 300', 3)
) AS seed(k, p)
WHERE NOT EXISTS (SELECT 1 FROM blog_keywords);
