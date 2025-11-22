-- =====================================================
-- MULTI-TENANT BRANDING MIGRATION
-- Adds subdomain routing and dynamic branding support
-- Generated: 2025-11-21
-- =====================================================

-- Add tenant branding fields to organizations table
ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS subdomain VARCHAR(100) UNIQUE,
    ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) UNIQUE,
    ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{
        "logo_url": "",
        "favicon_url": "",
        "primary_color": "#1976D2",
        "secondary_color": "#424242",
        "accent_color": "#FF9800",
        "text_color": "#212121",
        "background_color": "#FFFFFF",
        "header_bg_color": "#1976D2",
        "footer_bg_color": "#424242",
        "button_bg_color": "#1976D2",
        "button_hover_color": "#1565C0",
        "font_family": "Roboto, sans-serif",
        "logo_width": "200px",
        "logo_height": "60px"
    }'::jsonb,
    ADD COLUMN IF NOT EXISTS landing_page_config JSONB DEFAULT '{
        "hero_title": "Welcome to Our Platform",
        "hero_subtitle": "Empowering Political Campaigns with Data",
        "hero_image": "",
        "hero_cta_text": "Get Started",
        "hero_cta_url": "/register",
        "hero_secondary_cta_text": "Learn More",
        "hero_secondary_cta_url": "/about",
        "features": [],
        "testimonials": [],
        "stats": [],
        "about_section": "",
        "mission_statement": "",
        "vision_statement": ""
    }'::jsonb,
    ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{
        "header_style": "standard",
        "footer_style": "standard",
        "sidebar_style": "minimal",
        "card_style": "elevated",
        "border_radius": "4px",
        "shadow_level": "medium"
    }'::jsonb,
    ADD COLUMN IF NOT EXISTS contact_config JSONB DEFAULT '{
        "email": "",
        "phone": "",
        "address": "",
        "support_email": "",
        "support_phone": "",
        "facebook": "",
        "twitter": "",
        "instagram": "",
        "youtube": "",
        "linkedin": "",
        "whatsapp": ""
    }'::jsonb,
    ADD COLUMN IF NOT EXISTS party_info JSONB DEFAULT '{
        "party_name": "",
        "party_symbol": "",
        "founded_date": "",
        "leader_name": "",
        "leader_image": "",
        "ideology": "",
        "slogan": "",
        "manifesto_url": ""
    }'::jsonb,
    ADD COLUMN IF NOT EXISTS features_enabled JSONB DEFAULT '{
        "voter_database": true,
        "campaign_management": true,
        "sentiment_analysis": true,
        "field_reports": true,
        "whatsapp_bot": true,
        "social_media_monitoring": true,
        "analytics_dashboard": true,
        "maps": true,
        "bulk_upload": true,
        "notifications": true,
        "api_access": false
    }'::jsonb,
    ADD COLUMN IF NOT EXISTS usage_limits JSONB DEFAULT '{
        "max_users": 10,
        "max_storage_gb": 5,
        "max_api_calls_per_month": 10000,
        "max_sms_per_month": 1000,
        "max_email_per_month": 5000,
        "max_whatsapp_messages_per_month": 5000
    }'::jsonb,
    ADD COLUMN IF NOT EXISTS seo_config JSONB DEFAULT '{
        "meta_title": "",
        "meta_description": "",
        "meta_keywords": "",
        "og_image": "",
        "og_title": "",
        "og_description": ""
    }'::jsonb,
    ADD COLUMN IF NOT EXISTS custom_css TEXT,
    ADD COLUMN IF NOT EXISTS custom_js TEXT,
    ADD COLUMN IF NOT EXISTS analytics_tracking_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS allow_registration BOOLEAN DEFAULT true;

-- Create index on subdomain for fast lookups
CREATE INDEX IF NOT EXISTS idx_organizations_subdomain ON organizations(subdomain);
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain ON organizations(custom_domain);
CREATE INDEX IF NOT EXISTS idx_organizations_public ON organizations(is_public) WHERE is_public = true;

-- Add comment explaining the subdomain field
COMMENT ON COLUMN organizations.subdomain IS 'Unique subdomain for this tenant (e.g., bjp, tvk, congress). Used for routing: bjp.pulseofpeople.com';
COMMENT ON COLUMN organizations.custom_domain IS 'Custom domain if tenant has their own (e.g., bjp.party.in)';
COMMENT ON COLUMN organizations.branding IS 'Tenant-specific branding configuration (colors, logo, fonts)';
COMMENT ON COLUMN organizations.landing_page_config IS 'Landing page content and structure';
COMMENT ON COLUMN organizations.theme_config IS 'UI theme preferences (header style, card style, etc.)';
COMMENT ON COLUMN organizations.contact_config IS 'Contact information and social media links';
COMMENT ON COLUMN organizations.party_info IS 'Political party specific information';
COMMENT ON COLUMN organizations.features_enabled IS 'Feature flags for this tenant';
COMMENT ON COLUMN organizations.usage_limits IS 'Usage limits based on subscription plan';

-- =====================================================
-- FUNCTION: Get tenant by subdomain
-- =====================================================
CREATE OR REPLACE FUNCTION get_tenant_by_subdomain(p_subdomain VARCHAR)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    subdomain VARCHAR,
    custom_domain VARCHAR,
    logo TEXT,
    organization_type VARCHAR,
    branding JSONB,
    landing_page_config JSONB,
    theme_config JSONB,
    contact_config JSONB,
    party_info JSONB,
    features_enabled JSONB,
    usage_limits JSONB,
    subscription_plan VARCHAR,
    subscription_status VARCHAR,
    is_active BOOLEAN,
    is_public BOOLEAN,
    allow_registration BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        o.slug,
        o.subdomain,
        o.custom_domain,
        o.logo,
        o.organization_type,
        o.branding,
        o.landing_page_config,
        o.theme_config,
        o.contact_config,
        o.party_info,
        o.features_enabled,
        o.usage_limits,
        o.subscription_plan,
        o.subscription_status,
        o.is_active,
        o.is_public,
        o.allow_registration
    FROM organizations o
    WHERE (o.subdomain = p_subdomain OR o.custom_domain = p_subdomain)
        AND o.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Get tenant by custom domain
-- =====================================================
CREATE OR REPLACE FUNCTION get_tenant_by_domain(p_domain VARCHAR)
RETURNS UUID AS $$
DECLARE
    tenant_id UUID;
BEGIN
    SELECT id INTO tenant_id
    FROM organizations
    WHERE custom_domain = p_domain
        AND domain_verified = true
        AND is_active = true
    LIMIT 1;

    RETURN tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Validate subdomain uniqueness
-- =====================================================
CREATE OR REPLACE FUNCTION validate_subdomain(p_subdomain VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if subdomain is reserved
    IF p_subdomain IN ('www', 'app', 'api', 'admin', 'superadmin', 'demo', 'test', 'staging', 'dev', 'localhost', 'cdn', 'static', 'assets', 'media', 'storage') THEN
        RETURN FALSE;
    END IF;

    -- Check if subdomain is already taken
    IF EXISTS (SELECT 1 FROM organizations WHERE subdomain = p_subdomain) THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES for Multi-Tenant Access
-- =====================================================

-- Enable RLS on organizations if not already enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own organization
CREATE POLICY "Users can view their own organization"
    ON organizations
    FOR SELECT
    USING (
        id IN (
            SELECT organization_id
            FROM users
            WHERE auth_user_id = auth.uid()
        )
        OR is_public = true
    );

-- Policy: Only superadmins can insert organizations
CREATE POLICY "Superadmins can insert organizations"
    ON organizations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_user_id = auth.uid()
                AND role = 'superadmin'
        )
    );

-- Policy: Admins can update their own organization
CREATE POLICY "Admins can update their own organization"
    ON organizations
    FOR UPDATE
    USING (
        id IN (
            SELECT organization_id
            FROM users
            WHERE auth_user_id = auth.uid()
                AND role IN ('superadmin', 'admin')
        )
    );

-- Policy: Only superadmins can delete organizations
CREATE POLICY "Superadmins can delete organizations"
    ON organizations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_user_id = auth.uid()
                AND role = 'superadmin'
        )
    );

-- =====================================================
-- MIGRATION COMPLETE
-- New columns added: 13
-- Functions created: 3
-- RLS policies added: 4
-- =====================================================
