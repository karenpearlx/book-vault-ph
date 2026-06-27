-- Analytics table for traffic tracking
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  page TEXT,
  book_id UUID REFERENCES books(id),
  element TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);

-- Enable RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for tracking)
CREATE POLICY "Allow anon insert analytics" ON analytics FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated/anon reads for admin dashboard
CREATE POLICY "Allow read analytics" ON analytics FOR SELECT USING (true);
