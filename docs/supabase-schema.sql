-- Gamestacks Supabase Schema
-- This file contains all database tables for the Gamestacks platform

-- Enable UUID and extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================
-- USERS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  verification_token_expires_at TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_token_expires_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- Soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- ====================
-- USER PROFILES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  wallet_balance BIGINT DEFAULT 0, -- In Naira kobo (divide by 100 for Naira)
  total_spent BIGINT DEFAULT 0,
  games_purchased INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  country VARCHAR(2) DEFAULT 'NG',
  phone_number VARCHAR(20),
  whatsapp_number VARCHAR(20),
  preferred_delivery_method VARCHAR(50) DEFAULT 'digital', -- digital or home
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- ====================
-- GAMES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  category VARCHAR(100), -- Sports, Action, RPG, Strategy, Racing, Simulation
  genre VARCHAR(100),
  developer_name VARCHAR(255),
  publisher_name VARCHAR(255),
  price_naira INTEGER NOT NULL, -- In Naira (e.g., 2500 = ₦2,500)
  original_price_naira INTEGER, -- For discounts
  discount_percentage INTEGER DEFAULT 0,
  cover_image_url TEXT,
  screenshots_urls TEXT[], -- Array of image URLs
  rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  file_size_gb DECIMAL(5, 2), -- In GB
  download_link TEXT,
  installation_guide_url TEXT,
  system_requirements_cpu VARCHAR(255),
  system_requirements_ram VARCHAR(255),
  system_requirements_gpu VARCHAR(255),
  system_requirements_storage_gb VARCHAR(255),
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_offline BOOLEAN DEFAULT false, -- PC Offline verified
  is_new BOOLEAN DEFAULT false,
  release_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_games_category ON games(category);
CREATE INDEX idx_games_is_published ON games(is_published);
CREATE INDEX idx_games_is_featured ON games(is_featured);
CREATE INDEX idx_games_price_naira ON games(price_naira);

-- ====================
-- USER GAMES (Library)
-- ====================
CREATE TABLE IF NOT EXISTS user_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  license_key VARCHAR(255), -- Optional license key
  delivery_method VARCHAR(50) DEFAULT 'digital', -- digital or home
  delivery_status VARCHAR(50) DEFAULT 'pending', -- pending, delivered, played
  is_favourite BOOLEAN DEFAULT false,
  hours_played INTEGER DEFAULT 0,
  user_rating DECIMAL(3, 2),
  user_review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, game_id)
);

CREATE INDEX idx_user_games_user_id ON user_games(user_id);
CREATE INDEX idx_user_games_game_id ON user_games(game_id);

-- ====================
-- TRANSACTIONS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id),
  order_id VARCHAR(255) NOT NULL UNIQUE,
  amount_naira INTEGER NOT NULL, -- In Naira
  amount_kobo INTEGER NOT NULL, -- In Kobo (for Paystack)
  payment_method VARCHAR(50), -- paystack, bank_transfer, flutterwave
  paystack_reference VARCHAR(255), -- Paystack transaction reference
  paystack_access_code VARCHAR(255),
  paystack_auth_url TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, success, failed, cancelled
  transaction_type VARCHAR(50), -- game_purchase, wallet_topup, refund
  description TEXT,
  metadata JSONB, -- Store additional data
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_paystack_reference ON transactions(paystack_reference);

-- ====================
-- ORDERS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_number VARCHAR(255) NOT NULL UNIQUE, -- Order #ORD-2025-xxxxx
  items_count INTEGER DEFAULT 1,
  subtotal_naira INTEGER NOT NULL,
  transaction_fee_naira INTEGER DEFAULT 0,
  total_naira INTEGER NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_whatsapp VARCHAR(20),
  delivery_method VARCHAR(50), -- digital or home
  delivery_address TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, delivered, cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- ====================
-- ORDER ITEMS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id),
  game_title VARCHAR(255) NOT NULL,
  price_at_purchase INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ====================
-- REVIEWS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, game_id)
);

CREATE INDEX idx_reviews_game_id ON reviews(game_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- ====================
-- WISHLIST TABLE
-- ====================
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, game_id)
);

CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);

-- ====================
-- CART TABLE (Session-based, optional)
-- ====================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, game_id)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- ====================
-- AUDIT LOG TABLE
-- ====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(255),
  entity_id VARCHAR(255),
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ====================
-- Enable RLS (Row Level Security)
-- ====================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ====================
-- RLS POLICIES
-- ====================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own games
CREATE POLICY "Users can view own games" ON user_games
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Games are viewable by all (public)
CREATE POLICY "Games are public" ON games
  FOR SELECT USING (is_published = true);
