# Local host Subdomain Testing Guide

This guide explains how to test multi-tenant subdomains on your local development environment.

## Quick Start

### 1. Update Your Hosts File

Add subdomain entries to your system's hosts file:

**macOS/Linux:**
```bash
sudo nano /etc/hosts
```

**Windows:**
```
Open C:\Windows\System32\drivers\etc\hosts as Administrator
```

Add these lines:
```
127.0.0.1 bjp.localhost
127.0.0.1 tvk.localhost
127.0.0.1 demo.localhost
```

Save and close the file.

### 2. Run the Migration

Apply the database migration using Supabase dashboard SQL editor:
- Copy contents of `supabase/migrations/06_multi_tenant_branding.sql`
- Paste into Supabase Dashboard → SQL Editor
- Click "Run"

### 3. Seed Tenant Data

```bash
cd "/Users/apple/1 imo backups/pulseofproject python 3/pulseofprojectfrontendonly"
node scripts/seed-multi-tenant-data.js
```

This will create 3 tenants:
- **BJP** (Bharatiya Janata Party) - Saffron & Orange theme
- **TVK** (Tamilaga Vettri Kazhagam) - Gold & Red theme
- **Demo** - Blue default theme

### 4. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### 5. Test Subdomains

Open these URLs in your browser:

**BJP Tenant:**
```
http://bjp.localhost:5173
```
- Should show saffron/orange branding
- BJP logo and party information
- Hero section: "सबका साथ, सबका विकास, सबका विश्वास"
- Features: Nationalism, Economic Development, Welfare Schemes, Good Governance

**TVK Tenant:**
```
http://tvk.localhost:5173
```
- Should show gold/red branding
- TVK logo and party information
- Hero section: "தமிழகத்தின் வெற்றிக் கழகம்"
- Features: Quality Education, Healthcare, Employment, Farmer Welfare

**Demo Tenant:**
```
http://demo.localhost:5173
```
- Should show default blue branding
- Generic demo content

**No Tenant (Fallback):**
```
http://localhost:5173
```
- Should fall back to demo tenant or show error (depending on config)

## How It Works

### 1. Subdomain Detection

The app detects which tenant to load based on the subdomain:
- `bjp.localhost:5173` → extracts "bjp" → loads BJP tenant config
- `tvk.localhost:5173` → extracts "tvk" → loads TVK tenant config

See: `src/lib/tenant/identification.ts`

### 2. Tenant Loading

1. **Identification**: Extract subdomain from URL
2. **Database Query**: Fetch tenant config from `organizations` table by `subdomain` field
3. **Branding Application**: Apply CSS variables from `branding` JSONB field
4. **Content Rendering**: Display landing page using `landing_page_config` data

See: `src/lib/tenant/config.ts` and `src/contexts/TenantContext.tsx`

### 3. Dynamic Branding

CSS variables are injected into the document root:
```css
--tenant-primary-color: #FF9933 (BJP)
--tenant-secondary-color: #138808 (BJP)
--tenant-header-bg-color: #FF9933 (BJP)
--tenant-footer-bg-color: #212121
```

Components use these variables for styling:
```tsx
<Box sx={{ backgroundColor: 'var(--tenant-primary-color)' }}>
  {/* Content */}
</Box>
```

## Troubleshooting

### Issue: "Tenant not found"

**Solution:**
1. Check that migration was applied (run verification query)
2. Run seed script: `node scripts/seed-multi-tenant-data.js`
3. Verify data exists:
   ```sql
   SELECT subdomain, name, is_active FROM organizations;
   ```

### Issue: Subdomain not detected

**Solution:**
1. Verify hosts file entries are correct
2. Clear browser cache and cookies
3. Check console logs:
   - Open browser DevTools (F12)
   - Check Console tab for `[Tenant Detection]` logs
4. Verify `VITE_MULTI_TENANT=true` in `.env` file

### Issue: Styling not applied

**Solution:**
1. Check that branding data exists in database:
   ```sql
   SELECT subdomain, branding FROM organizations WHERE subdomain = 'bjp';
   ```
2. Open DevTools → Elements → `<html>` tag → Styles
3. Verify CSS variables are set:
   ```
   --tenant-primary-color: #FF9933
   --tenant-secondary-color: #138808
   ```

### Issue: Port 5173 already in use

**Solution:**
```bash
# Kill existing process
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

Then use: `http://bjp.localhost:3000`

## Configuration

### Environment Variables

```bash
# .env file
VITE_MULTI_TENANT=true           # Enable multi-tenant mode
VITE_TENANT_MODE=subdomain        # Detection method
VITE_DEFAULT_TENANT=demo          # Fallback tenant
VITE_TENANT_CACHE_DURATION=5      # Cache duration (minutes)
```

### Database Schema

Key fields in `organizations` table:
```sql
subdomain VARCHAR(100) UNIQUE          -- Subdomain identifier (e.g., 'bjp', 'tvk')
branding JSONB                         -- Colors, logo, fonts
landing_page_config JSONB              -- Hero, features, stats, testimonials
theme_config JSONB                     -- Header/footer styles
contact_config JSONB                   -- Email, phone, social links
party_info JSONB                       -- Party-specific data
features_enabled JSONB                 -- Feature flags
is_active BOOLEAN                      -- Enable/disable tenant
is_public BOOLEAN                      -- Public landing page
allow_registration BOOLEAN             -- Allow new user signups
```

## Adding New Tenants

### Method 1: Using Seed Script

Edit `scripts/seed-multi-tenant-data.js` and add new tenant config to `tenantConfigurations` array.

### Method 2: Manual SQL Insert

```sql
INSERT INTO organizations (
  name, slug, subdomain, logo, organization_type,
  contact_email, contact_phone, website,
  subscription_plan, is_active, is_public,
  branding, landing_page_config, contact_config
) VALUES (
  'New Party',
  'new-party',
  'newparty',                           -- http://newparty.localhost:5173
  '/logos/newparty-logo.png',
  'party',
  'contact@newparty.com',
  '+91-XXX-XXXXXXX',
  'https://newparty.com',
  'pro',
  true,
  true,
  '{
    "primary_color": "#FF0000",
    "secondary_color": "#0000FF",
    "logo_url": "/logos/newparty-logo.png"
  }'::jsonb,
  '{
    "hero_title": "Welcome to New Party",
    "hero_subtitle": "Building a better future",
    "features": []
  }'::jsonb,
  '{
    "email": "contact@newparty.com",
    "phone": "+91-XXX-XXXXXXX"
  }'::jsonb
);
```

### Method 3: Using Admin Dashboard

Once admin panel is built:
1. Login as superadmin
2. Navigate to `/super-admin/tenants`
3. Click "Create New Tenant"
4. Fill in branding and configuration
5. Save

## Testing Checklist

- [ ] Migration applied successfully
- [ ] Seed data loaded (3 tenants)
- [ ] BJP subdomain loads with saffron branding
- [ ] TVK subdomain loads with gold/red branding
- [ ] Demo subdomain loads with blue branding
- [ ] Logo displays correctly for each tenant
- [ ] Hero section shows tenant-specific content
- [ ] Features section displays party-specific items
- [ ] Footer shows tenant contact information
- [ ] Social media links work (if configured)
- [ ] Registration button navigates correctly
- [ ] Login button works
- [ ] Page title changes per tenant
- [ ] Favicon updates per tenant
- [ ] Browser console shows no errors
- [ ] CSS variables are applied correctly

## Next Steps

After local testing works:
1. Update App.tsx to use TenantLandingPage component
2. Build tenant admin dashboard
3. Deploy to staging environment
4. Configure production DNS with wildcards
5. Set up Cloudflare Workers for routing
6. Enable SSL for subdomains

## Support

If you encounter issues:
1. Check console logs in browser DevTools
2. Verify database connection
3. Check Supabase logs
4. Review `.env` configuration
5. Ensure all dependencies are installed: `npm install`

For additional help, refer to:
- `MULTI_PARTY_CRM_GUIDE.md` - Overall system architecture
- `DEPLOYMENT_GUIDE.md` - Production deployment
- Supabase documentation: https://supabase.com/docs
