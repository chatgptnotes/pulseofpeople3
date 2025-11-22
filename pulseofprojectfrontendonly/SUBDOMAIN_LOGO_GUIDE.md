# Subdomain Logo System - Implementation Guide

## Overview
The system now supports tenant-specific logos that automatically display on subdomain websites (e.g., bjp.pulseofpeople.com shows BJP logo, congress.pulseofpeople.com shows Congress logo).

## How It Works

### 1. Logo Upload (Admin Panel)
- Navigate to **Tenant Branding** page (`/tenant-branding`)
- Click **Upload Logo** button
- Select image file (PNG/JPG/SVG, max 2MB)
- Logo preview appears immediately
- Click **Save Changes** to persist

### 2. Backend Storage
- Logo stored as base64 string in `Organization.branding.logo_url` field
- Django API endpoint: `/api/user/tenant/branding/`
- Supports GET (fetch) and PATCH (update) operations
- Accessible by tenant admins only (JWT auth required)

### 3. Subdomain Detection
System automatically detects tenant from:
- **Subdomain**: `bjp.localhost:5173` → tenant: `bjp`
- **Production**: `bjp.pulseofpeople.com` → tenant: `bjp`
- **Path-based**: `/bjp/dashboard` → tenant: `bjp` (fallback)

### 4. Cache Clearing
After logo save, system automatically:
1. Clears tenant config cache (5-minute TTL)
2. Reloads TenantContext with fresh data
3. Forces subdomain sites to fetch updated branding on next page load

### 5. Logo Display
Logos appear in:
- **Landing Page Hero Section**: Large logo display (h-32) above tenant name
- **Sidebar/Navigation bar**: TenantLogo component in authenticated areas
- **Page headers**: Dashboard and admin pages
- Anywhere `tenant.branding.logo_url` is referenced

## Code Flow

```typescript
// TenantBranding.tsx (Admin uploads logo)
handleSave() {
  // 1. Convert logo to base64
  const base64Logo = logoPreview; // From FileReader

  // 2. Save to backend
  await fetch('/api/user/tenant/branding/', {
    method: 'PATCH',
    body: JSON.stringify({ branding: { logo_url: base64Logo } })
  });

  // 3. Clear cache to force reload
  clearTenantCache(tenant.slug); // Clears tenant-specific cache

  // 4. Reload tenant context
  await reload(); // Refetches from backend
}
```

```typescript
// TenantContext.tsx (System loads tenant)
loadTenant() {
  // 1. Detect subdomain
  const identification = identifyTenant(); // Returns 'bjp', 'congress', etc.

  // 2. Fetch tenant config from Django
  const config = await fetchTenantConfig(identification.tenantSlug);
  // Backend: /api/superadmin/tenants/by-subdomain/bjp/

  // 3. Apply branding (logo, colors, CSS)
  applyTenantBranding(config);
}
```

```typescript
// TenantLogo.tsx (Component displays logo in sidebar/navbar)
function TenantLogo() {
  const { tenant } = useTenant();
  const logoUrl = tenant?.branding?.logo_url;

  return logoUrl ? (
    <img src={logoUrl} alt="Organization Logo" />
  ) : (
    <DefaultLogoFallback />
  );
}
```

```typescript
// LandingPage.tsx (Landing page hero section)
function LandingPage() {
  const { tenant } = useTenant();
  const tenantLogo = tenant?.branding?.logo_url;
  const tenantName = tenant?.name || 'Pulse of People';

  return (
    <div>
      {/* Tenant Logo - Shows above hero title */}
      {tenantLogo && (
        <div className="flex justify-center mb-8">
          <img
            src={tenantLogo}
            alt={`${tenantName} Logo`}
            className="h-32 w-auto object-contain"
            style={{ maxWidth: '400px' }}
          />
        </div>
      )}

      {/* Hero Title - Shows tenant name */}
      <h1>
        <span>{tenantName}</span>
        Win Elections with Data-Driven Intelligence
      </h1>
    </div>
  );
}
```

## Testing

### Test Locally
1. Start backend: `python manage.py runserver`
2. Start frontend: `npm run dev`
3. Login as tenant admin
4. Navigate to Tenant Branding page
5. Upload a logo and save
6. Check console logs:
   ```
   [TenantBranding] File selected: { name: 'logo.png', size: 45678 }
   [TenantBranding] Saving branding data: { hasLogo: true }
   [TenantBranding] Clearing tenant cache for: bjp
   [TenantBranding] Reloading tenant context...
   ```
7. Refresh page to see logo in sidebar

### Test Subdomain Isolation
1. Add subdomain mapping to `/etc/hosts`:
   ```
   127.0.0.1 bjp.localhost
   127.0.0.1 congress.localhost
   ```
2. Login to `bjp.localhost:5173` and upload BJP logo
3. Login to `congress.localhost:5173` and upload Congress logo
4. Verify each subdomain shows only its own logo

## Database Schema

```python
# backend/api/models.py
class Organization(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    subdomain = models.CharField(max_length=63, unique=True)
    branding = models.JSONField(default=dict)
    # branding = {
    #   'logo_url': 'data:image/png;base64,iVBORw0KGg...',
    #   'primary_color': '#1976D2',
    #   'secondary_color': '#424242',
    #   'accent_color': '#FF9800',
    #   'custom_css': '...'
    # }
```

## API Endpoints

### Get Current Tenant Branding
```http
GET /api/user/tenant/branding/
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "tenant": {
    "id": 1,
    "name": "BJP Tamil Nadu",
    "slug": "bjp",
    "subdomain": "bjp",
    "branding": {
      "logo_url": "data:image/png;base64,...",
      "primary_color": "#FF9933"
    }
  }
}
```

### Update Tenant Branding
```http
PATCH /api/user/tenant/branding/
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "branding": {
    "logo_url": "data:image/png;base64,...",
    "primary_color": "#FF9933"
  }
}

Response: (same as GET)
```

### Get Tenant by Subdomain (Public)
```http
GET /api/superadmin/tenants/by-subdomain/bjp/

Response:
{
  "success": true,
  "tenant": {
    "id": 1,
    "name": "BJP Tamil Nadu",
    "slug": "bjp",
    "subdomain": "bjp",
    "branding": { ... }
  }
}
```

## Cache Behavior

- **Cache Duration**: 5 minutes (300 seconds)
- **Cache Key**: `tenantConfigCache.get(tenantSlug)`
- **Clear Strategy**:
  - Auto-cleared after TTL expires
  - Manually cleared via `clearTenantCache(slug)`
  - Cleared after logo save

## Files Modified

### Frontend
- `/src/pages/Admin/TenantBranding.tsx` - Added cache clearing after save
- `/src/pages/LandingPage.tsx` - Added tenant logo display in hero section
- `/src/lib/tenant/config.ts` - Cache management functions
- `/src/contexts/TenantContext.tsx` - Tenant loading and reload
- `/src/lib/tenant/identification.ts` - Subdomain detection
- `/src/components/TenantLogo.tsx` - Logo display component (sidebar/navbar)

### Backend
- `/backend/api/views/tenant_branding.py` - Branding CRUD endpoints
- `/backend/api/urls/user_urls.py` - URL routing
- `/backend/api/models.py` - Organization model with branding field

## Troubleshooting

### Logo not showing after upload
1. Check console logs for errors
2. Verify cache was cleared: `[TenantBranding] Clearing tenant cache`
3. Try manual page refresh
4. Check network tab for API response

### Wrong logo showing on subdomain
1. Clear browser cache and cookies
2. Verify subdomain detection: Check console for `[Tenant Detection]` logs
3. Check backend data: Query `Organization.branding` field

### Logo not persisting
1. Check backend response status (should be 200)
2. Verify JWT token is valid
3. Check user has admin permissions
4. Inspect Django logs for errors

## Version History

- **v6.5 (2025-11-21)**: Added tenant logo display on landing page hero section
- **v6.4 (2025-11-21)**: Added automatic cache clearing after logo save
- **v6.3 (2025-11-21)**: Fixed logo preview and data loading
- **v6.2 (2025-11-21)**: Fixed upload button triggering logout
- **v6.1 (2025-11-21)**: Initial tenant branding system

---

**Test URLs**:
- Admin Panel: http://localhost:5173/tenant-branding
- Landing Page: http://bjp.localhost:5173/ (or any tenant subdomain)

**Version**: v6.5 - 2025-11-21
