-- Add location columns to analytics table
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS country_code TEXT;

-- Index for location queries
CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics(country);
CREATE INDEX IF NOT EXISTS idx_analytics_city ON analytics(city);
