-- Phase 1: Database Schema for Organic Harvest Admin Dashboard

-- 1. Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value numeric NOT NULL,
    max_uses integer NOT NULL,
    used_count integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Add new columns to orders table
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS subtotal numeric,
    ADD COLUMN IF NOT EXISTS shipping_fee numeric,
    ADD COLUMN IF NOT EXISTS discount_applied numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS grand_total numeric,
    ADD COLUMN IF NOT EXISTS coupon_used text;

-- 3. Ensure products table has tags and category columns
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS tags text,
    ADD COLUMN IF NOT EXISTS category text;
