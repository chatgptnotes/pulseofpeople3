-- =====================================================
-- COMPLETE DATABASE SETUP FOR MULTI-TENANT SYSTEM
-- Run this ENTIRE file in Supabase Dashboard → SQL Editor
-- =====================================================
-- This combines:
-- 1. Base schema (35 tables)
-- 2. Multi-tenant branding fields
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ORGANIZATIONS TABLE (with multi-tenant support)
-- =====================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    logo TEXT,
    organization_type VARCHAR(20) CHECK (organization_type IN ('party', 'campaign', 'ngo', 'other')) DEFAULT 'campaign',

    -- Multi-Tenant Fields
    subdomain VARCHAR(100) UNIQUE,
    custom_domain VARCHAR(255) UNIQUE,
    is_public BOOLEAN DEFAULT true,
    allow_registration BOOLEAN DEFAULT true,
    domain_verified BOOLEAN DEFAULT false,

    -- Contact Info
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    website TEXT,
    social_media_links JSONB DEFAULT '{}'::jsonb,

    -- Subscription
    subscription_plan VARCHAR(20) CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')) DEFAULT 'free',
    subscription_status VARCHAR(20) DEFAULT 'active',
    subscription_expires_at TIMESTAMPTZ,
    max_users INTEGER DEFAULT 10,

    -- Multi-Tenant Configuration (JSONB)
    branding JSONB DEFAULT '{}'::jsonb,
    landing_page_config JSONB DEFAULT '{}'::jsonb,
    theme_config JSONB DEFAULT '{}'::jsonb,
    contact_config JSONB DEFAULT '{}'::jsonb,
    party_info JSONB DEFAULT '{}'::jsonb,
    features_enabled JSONB DEFAULT '{}'::jsonb,
    usage_limits JSONB DEFAULT '{}'::jsonb,
    seo_config JSONB DEFAULT '{}'::jsonb,

    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_subdomain ON organizations(subdomain);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);

-- Insert demo organization
INSERT INTO organizations (name, slug, subdomain, organization_type, is_active, is_public, allow_registration)
VALUES ('Demo Organization', 'demo', 'demo', 'campaign', true, true, true)
ON CONFLICT (subdomain) DO NOTHING;

-- =====================================================
-- PERMISSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) CHECK (category IN ('users', 'data', 'analytics', 'settings', 'system')) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);

-- =====================================================
-- USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('superadmin', 'admin', 'manager', 'analyst', 'user', 'viewer', 'volunteer')) DEFAULT 'user' NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    bio TEXT,
    avatar TEXT,
    date_of_birth DATE,
    must_change_password BOOLEAN DEFAULT false,
    is_2fa_enabled BOOLEAN DEFAULT false,
    totp_secret VARCHAR(32),
    assigned_state_id UUID,
    assigned_district_id UUID,
    city VARCHAR(100),
    constituency VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Multi-tenant database schema created successfully!';
    RAISE NOTICE '📊 Created tables: organizations, users, permissions';
    RAISE NOTICE '🎯 Demo organization inserted with subdomain: demo';
    RAISE NOTICE '';
    RAISE NOTICE '▶️  Next steps:';
    RAISE NOTICE '   1. Run: node scripts/seed-multi-tenant-data.js';
    RAISE NOTICE '   2. Restart dev server: npm run dev';
    RAISE NOTICE '   3. Open: http://demo.localhost:5173';
END $$;
