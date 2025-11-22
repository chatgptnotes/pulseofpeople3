# 🚀 Supabase Migration Guide - CRITICAL FIRST STEP

## ⚠️ IMPORTANT: Do This FIRST Before Running Any Code

This migration creates the `organizations` table in your Supabase database. Without this, the multi-tenant system cannot work.

---

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Open your web browser
2. Go to: **https://supabase.com/dashboard/project/iiefjgytmxrjbctfqxni/sql/new**
3. Login to your Supabase account if needed

### Step 2: Copy the Migration SQL

Open the file: `RUN_THIS_MIGRATION.sql` (in the `pulseofprojectfrontendonly` folder)

**OR** copy this SQL directly:

```sql
-- =====================================================
-- COMPLETE DATABASE SETUP FOR MULTI-TENANT SYSTEM
-- Run this ENTIRE file in Supabase Dashboard → SQL Editor
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
    RAISE NOTICE '   1. Run Django migrations';
    RAISE NOTICE '   2. Seed tenant data';
    RAISE NOTICE '   3. Start dev servers';
END $$;
```

### Step 3: Paste in SQL Editor

1. In the Supabase SQL Editor, **select all existing text** (if any) and delete it
2. **Paste** the entire SQL code from above
3. Make sure ALL the code is pasted (scroll down to verify)

### Step 4: Run the Migration

1. Click the green **"RUN"** button (bottom right corner of SQL editor)
2. Wait for execution to complete (should take 2-3 seconds)
3. Look for success messages in the output panel

### Step 5: Verify Migration Success

Open a terminal and run:

```bash
cd "pulseofprojectfrontendonly"
node scripts/check-tenants.js
```

**Expected Output:**
```
✅ organizations table EXISTS!
📊 Found records: 1
```

**If you see an error:**
```
❌ Error querying organizations table: Could not find the table 'public.organizations' in the schema cache
```

This means the migration didn't run. Go back to Step 1 and try again.

---

## Troubleshooting

### "Permission denied" error
- Make sure you're logged into Supabase with the correct account
- Verify you have admin access to project `iiefjgytmxrjbctfqxni`

### "Syntax error" message
- Make sure you copied the ENTIRE SQL file
- Check that no characters were lost during copy/paste
- Try copying the SQL again from `RUN_THIS_MIGRATION.sql`

### Table already exists
- If you see "table already exists" - that's OK! Migration was successful
- Proceed to verification step

---

## What This Migration Does

1. ✅ Creates `organizations` table with 25+ fields
2. ✅ Creates `permissions` table for RBAC
3. ✅ Creates `users` table linked to Supabase auth
4. ✅ Inserts "Demo" organization with subdomain `demo`
5. ✅ Creates indexes for fast queries
6. ✅ Sets up auto-update triggers

---

## Next Steps After Migration

Once the migration is successful:

1. ✅ Proceed with Django backend setup
2. ✅ Run Django migrations
3. ✅ Seed tenant data (BJP, TVK, Demo)
4. ✅ Start development servers
5. ✅ Test subdomain routing

---

## Need Help?

If you're stuck:
1. Check the Supabase logs in the dashboard
2. Verify your database connection
3. Make sure you're using the correct project ID
4. Try refreshing the Supabase dashboard

---

**Status**: ⏳ Waiting for you to complete this step

**After completion**: Run `node scripts/check-tenants.js` to verify

v1.0 - 2025-11-21
