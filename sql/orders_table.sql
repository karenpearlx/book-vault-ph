-- Orders table for Book Vault PH
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/vmjhpjvveoaroruzmbla/sql)

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_contact TEXT,
  address TEXT,
  within_sc BOOLEAN DEFAULT false,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  books JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  payment_sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert orders (customers placing orders)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read orders (for order status page)
CREATE POLICY "Anyone can read orders" ON orders
  FOR SELECT USING (true);

-- Allow anyone to update orders (for "I've sent payment" button)
CREATE POLICY "Anyone can update orders" ON orders
  FOR UPDATE USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Add sale_status column to books if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'sale_status') THEN
    ALTER TABLE books ADD COLUMN sale_status TEXT DEFAULT 'available';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'quantity') THEN
    ALTER TABLE books ADD COLUMN quantity INTEGER DEFAULT 1;
  END IF;
END $$;

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
