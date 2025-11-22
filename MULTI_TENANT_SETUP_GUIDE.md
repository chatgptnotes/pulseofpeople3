# 🚀 Multi-Tenant Setup Guide - Complete Integration

This guide walks you through setting up the complete multi-tenant system integrating your Django backend with the React frontend.

---

## 📋 What We've Built

- ✅ Django Organization model with 20+ new fields for multi-tenant support
- ✅ Django migration to add all branding fields
- ✅ Django API endpoints for tenant management
- ✅ Seed data for BJP, TVK, and Demo tenants
- ✅ Frontend integration with Django API
- ✅ Subdomain-based tenant detection

---

## 🎯 Step-by-Step Setup

### STEP 1: Apply Supabase Migration (CRITICAL FIRST STEP)

**This MUST be done manually in your browser:**

1. Open: https://supabase.com/dashboard/project/iiefjgytmxrjbctfqxni/sql/new
2. Copy all content from: `pulseofprojectfrontendonly/RUN_THIS_MIGRATION.sql`
3. Paste in the SQL Editor
4. Click the green **"RUN"** button
5. Wait for success message

**Verify it worked:**
```bash
cd "pulseofprojectfrontendonly"
node scripts/check-tenants.js
```

Expected output: ✅ organizations table EXISTS!

**Why manual?** Supabase only allows SQL execution via their dashboard, not via terminal.

---

### STEP 2: Run Django Migration

Now add the same fields to your Django database:

```bash
cd "../backend"

# Create migration if not already created
python manage.py makemigrations

# Apply migration
python manage.py migrate
```

**Expected output:**
```
Running migrations:
  Applying api.0011_add_multi_tenant_fields... OK
```

---

### STEP 3: Seed Multi-Tenant Data

Populate Django with BJP, TVK, and Demo tenant configurations:

```bash
python manage.py seed_multi_tenant_data
```

**Expected output:**
```
🚀 Starting multi-tenant data seeding...

✅ Created: Bharatiya Janata Party (subdomain: bjp)
✅ Created: Tamilaga Vettri Kazhagam (subdomain: tvk)
✅ Created: Demo Organization (subdomain: demo)

📊 Summary:
   ✅ Created: 3 tenants
   ✏️  Updated: 0 tenants

🎉 Multi-tenant data seeding completed!
```

---

### STEP 4: Configure /etc/hosts for Local Subdomain Testing

Add subdomain entries to your hosts file:

**On Mac/Linux:**
```bash
sudo nano /etc/hosts
```

**Add these lines:**
```
127.0.0.1 bjp.localhost
127.0.0.1 tvk.localhost
127.0.0.1 demo.localhost
```

Save and exit (Ctrl+X, then Y, then Enter).

**Verify:**
```bash
ping bjp.localhost
```
Should show: `PING bjp.localhost (127.0.0.1)`

---

### STEP 5: Start Both Servers

You need BOTH Django backend and React frontend running:

**Terminal 1 - Django Backend:**
```bash
cd "/Users/apple/1 imo backups/pulseofproject python 3/backend"
python manage.py runserver 8000
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
Django version 5.2.7, using settings 'config.settings'
```

**Terminal 2 - React Frontend:**
```bash
cd "/Users/apple/1 imo backups/pulseofproject python 3/pulseofprojectfrontendonly"
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

### STEP 6: Test Multi-Tenant Subdomain Routing

Open these URLs in your browser:

#### 1. BJP Tenant (Saffron/Green Branding)
```
http://bjp.localhost:5173
```

**Expected:**
- Saffron (#FF9933) primary color
- Green (#138808) secondary color
- BJP logo
- "सबका साथ, सबका विकास, सबका विश्वास" hero title
- BJP-specific content

#### 2. TVK Tenant (Gold/Red Branding)
```
http://tvk.localhost:5173
```

**Expected:**
- Gold (#FFD700) primary color
- Crimson Red (#DC143C) secondary color
- TVK logo
- "வெற்றி தமிழகத்தின் வெற்றி" hero title
- TVK-specific content

#### 3. Demo Tenant (Blue Branding)
```
http://demo.localhost:5173
```

**Expected:**
- Blue (#1976D2) primary color
- Gray (#424242) secondary color
- Demo logo
- "Welcome to Demo Organization" hero title
- Demo content

---

## 🔍 Troubleshooting

### Issue: "Tenant not found" Error

**Check:**
1. Did you run the Django seed command? (`python manage.py seed_multi_tenant_data`)
2. Is Django backend running on port 8000?
3. Check console logs in browser DevTools

**Solution:**
```bash
# Verify tenants exist in Django
cd backend
python manage.py shell

>>> from api.models import Organization
>>> Organization.objects.all()
<QuerySet [<Organization: Demo Organization>, <Organization: Bharatiya Janata Party>, <Organization: Tamilaga Vettri Kazhagam>]>
```

### Issue: "Failed to fetch tenant" API Error

**Check:**
1. Is Django backend actually running?
2. Check Django logs in Terminal 1
3. Try accessing Django API directly:

```bash
curl http://127.0.0.1:8000/api/superadmin/tenants/by-subdomain/demo/
```

**Expected response:**
```json
{
  "success": true,
  "tenant": {
    "id": 1,
    "name": "Demo Organization",
    "subdomain": "demo",
    "branding": {...},
    ...
  }
}
```

### Issue: Subdomain not working (bjp.localhost doesn't resolve)

**Check:**
```bash
# Verify hosts file
cat /etc/hosts | grep localhost
```

Should show:
```
127.0.0.1 localhost
127.0.0.1 bjp.localhost
127.0.0.1 tvk.localhost
127.0.0.1 demo.localhost
```

**Solution:**
```bash
sudo nano /etc/hosts
# Add missing lines
```

### Issue: No branding changes visible

**Check:**
1. Open browser DevTools → Console
2. Look for tenant loading logs
3. Verify CSS variables are applied:

```javascript
// In browser console
console.log(getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary-color'));
// Should show: #FF9933 for BJP, #FFD700 for TVK, etc.
```

---

## 📊 Verify Integration is Working

### Test Checklist

- [ ] Django backend starts without errors
- [ ] React frontend starts without errors
- [ ] http://demo.localhost:5173 loads with blue branding
- [ ] http://bjp.localhost:5173 loads with saffron branding
- [ ] http://tvk.localhost:5173 loads with gold branding
- [ ] Browser console shows: "✅ Tenant loaded successfully"
- [ ] Page title changes per tenant
- [ ] Favicon changes per tenant
- [ ] CSS colors match tenant branding
- [ ] Hero section shows tenant-specific text

---

## 🎨 Customizing Tenant Branding

### Via Django Admin

1. Open: http://127.0.0.1:8000/admin/
2. Login as superadmin
3. Navigate to: Organizations
4. Click on tenant (e.g., "Bharatiya Janata Party")
5. Edit the `branding` JSON field:

```json
{
  "primary_color": "#FF9933",
  "secondary_color": "#138808",
  "logo_url": "/logos/bjp-logo.png",
  "font_family": "Poppins, sans-serif",
  "custom_css": "/* Your custom CSS */"
}
```

6. Save and refresh frontend

### Via API (Programmatic)

```javascript
import { djangoApi } from './services/djangoApi';

// Update BJP branding
await djangoApi.updateTenantBranding(1, {
  branding: {
    primary_color: '#FF9933',
    secondary_color: '#138808',
    accent_color: '#FFFFFF',
    logo_url: '/logos/bjp-new-logo.png'
  }
});
```

---

## 📁 Files Modified/Created

### Backend Files
- ✅ `backend/api/models.py` - Added 20+ fields to Organization model
- ✅ `backend/api/migrations/0011_add_multi_tenant_fields.py` - Migration file
- ✅ `backend/api/serializers.py` - Updated OrganizationSerializer
- ✅ `backend/api/views/superadmin/tenant_views.py` - Added 4 new endpoints
- ✅ `backend/api/urls/superadmin_urls.py` - Registered new routes
- ✅ `backend/api/management/commands/seed_multi_tenant_data.py` - Seed command

### Frontend Files
- ✅ `pulseofprojectfrontendonly/src/services/djangoApi.ts` - Added tenant API methods
- ✅ `pulseofprojectfrontendonly/src/lib/tenant/identification.ts` - Already exists (no changes needed)
- ✅ `pulseofprojectfrontendonly/src/contexts/TenantContext.tsx` - Already configured (no changes needed)

### Documentation
- ✅ `SUPABASE_MIGRATION_GUIDE.md` - Step-by-step Supabase setup
- ✅ `MULTI_TENANT_SETUP_GUIDE.md` - This file

---

## 🧪 API Endpoints Reference

### Public Endpoints (No Auth Required)

| Endpoint | Method | Purpose | Example |
|----------|--------|---------|---------|
| `/api/superadmin/tenants/by-subdomain/{subdomain}/` | GET | Get tenant by subdomain | `curl http://127.0.0.1:8000/api/superadmin/tenants/by-subdomain/bjp/` |
| `/api/superadmin/tenants/{id}/config/` | GET | Get tenant config by ID | `curl http://127.0.0.1:8000/api/superadmin/tenants/1/config/` |

### Protected Endpoints (Superadmin Only)

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/superadmin/tenants/` | GET | List all tenants | ✅ Superadmin |
| `/api/superadmin/tenants/stats/` | GET | Get tenant statistics | ✅ Superadmin |
| `/api/superadmin/tenants/{id}/branding/` | PUT | Update branding | ✅ Superadmin |
| `/api/superadmin/tenants/{id}/update/` | PUT | Update tenant info | ✅ Superadmin |

---

## 🎉 Success Criteria

Your integration is fully working when:

1. ✅ Django backend starts without errors
2. ✅ React frontend starts without errors
3. ✅ All 3 subdomains work (bjp, tvk, demo)
4. ✅ Each subdomain shows different colors
5. ✅ Each subdomain shows different content
6. ✅ Browser console shows no errors
7. ✅ Page titles change per tenant
8. ✅ CSS variables are correctly applied
9. ✅ Django API responds successfully
10. ✅ Tenant data is loaded from Django, not Supabase

---

## 🚀 Next Steps

After successful setup:

1. **Add More Tenants:**
   - Create new organizations via Django admin
   - Or use the API endpoints

2. **Customize Branding:**
   - Update colors, logos, fonts per tenant
   - Edit landing page content

3. **Production Deployment:**
   - Configure real domains (e.g., bjp.pulseofpeople.com)
   - Set up DNS records
   - Deploy to hosting (Vercel, Railway, etc.)

4. **User Authentication:**
   - Integrate login flow with tenant context
   - Redirect users to their organization's subdomain

---

## 📞 Need Help?

If you're stuck:

1. Check Django logs (Terminal 1)
2. Check browser DevTools Console
3. Verify both servers are running
4. Re-run seed command
5. Clear browser cache

**Common Commands:**

```bash
# Check Django is running
curl http://127.0.0.1:8000/api/health/

# Check tenant API
curl http://127.0.0.1:8000/api/superadmin/tenants/by-subdomain/demo/

# Re-seed data
cd backend && python manage.py seed_multi_tenant_data

# Clear Django cache
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

---

**Last Updated:** 2025-11-21
**Django Backend:** Port 8000
**React Frontend:** Port 5173
**Tenants:** BJP, TVK, Demo

v1.1 - 2025-11-21
