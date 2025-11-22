# Subdomain Multi-Tenancy Setup Guide

## Overview

This guide explains how to set up subdomain-based multi-tenancy for local development and production.

**Local Example:**
- `http://tvk.localhost:5174` → TVK tenant
- `http://bjp.localhost:5174` → BJP tenant
- `http://congress.localhost:5174` → Congress tenant
- `http://localhost:5174` → Default tenant

**Production Example:**
- `https://tvk.pulseofpeople.com` → TVK tenant
- `https://kerala.pulseofpeople.com` → Kerala tenant

---

## Local Setup (macOS/Linux)

### Step 1: Configure /etc/hosts

Open your hosts file:
```bash
sudo nano /etc/hosts
```

Add these lines (one for each tenant you want to test):
```
127.0.0.1 tvk.localhost
127.0.0.1 bjp.localhost
127.0.0.1 congress.localhost
127.0.0.1 aiadmk.localhost
127.0.0.1 dmk.localhost
127.0.0.1 demo.localhost
```

Save and exit (Ctrl+O, Enter, Ctrl+X)

### Step 2: Verify DNS Resolution

Test that subdomains resolve correctly:
```bash
ping tvk.localhost
# Should see: PING tvk.localhost (127.0.0.1)

ping bjp.localhost
# Should see: PING bjp.localhost (127.0.0.1)
```

Press Ctrl+C to stop each ping.

### Step 3: Start Backend Server

```bash
cd "backend"
python3 manage.py runserver
```

Backend will be accessible at: http://127.0.0.1:8000

### Step 4: Start Frontend Server

```bash
cd "pulseofprojectfrontendonly"
npm run dev
```

Frontend will start on port 5173 or 5174 (if 5173 is busy)

### Step 5: Access Multi-Tenant URLs

Open in browser:
- http://tvk.localhost:5174 (or :5173)
- http://bjp.localhost:5174
- http://congress.localhost:5174
- http://localhost:5174 (default - no tenant)

**Note:** Use the port number shown in the Vite terminal output.

---

## Windows Setup

### Step 1: Edit Hosts File

Open Notepad **as Administrator**, then:
1. File → Open
2. Navigate to: `C:\Windows\System32\drivers\etc\hosts`
3. Change filter to "All Files (*.*)"
4. Open the `hosts` file

Add these lines:
```
127.0.0.1 tvk.localhost
127.0.0.1 bjp.localhost
127.0.0.1 congress.localhost
127.0.0.1 demo.localhost
```

Save and close.

### Step 2: Flush DNS Cache

Open Command Prompt as Administrator:
```cmd
ipconfig /flushdns
```

### Step 3: Follow Steps 3-5 from macOS/Linux section above

---

## How It Works

### 1. Tenant Detection Logic

The app detects tenants from subdomain:

```
URL: http://tvk.localhost:5174/dashboard
                │
                └── Tenant slug: "tvk"
```

**Detection flow:**
1. Extract hostname: `tvk.localhost`
2. Parse subdomain: `tvk`
3. Load tenant config for "tvk"
4. Apply tenant branding & settings

### 2. Vite Dev Server Configuration

`vite.config.ts` configured to accept subdomain requests:
```typescript
server: {
  host: '0.0.0.0', // Accept from all interfaces
  port: 5173,
  strictPort: false // Fallback to other ports
}
```

### 3. Django CORS Configuration

`backend/config/settings.py` allows subdomain CORS:
```python
CORS_ALLOWED_ORIGIN_REGEXES = [
  r"^http://[\w-]+\.localhost:5173$",  # Any subdomain
  r"^http://[\w-]+\.localhost:5174$",  # Backup port
]
```

---

## Tenant Configuration

### Available Tenants (Demo Data)

Located in: `pulseofprojectfrontendonly/src/config/tvk-branding.ts`

**Default Tenants:**
- `tvk` - TVK Party (Tamil Nadu)
- `bjp` - BJP Party
- `congress` - Congress Party
- `demo` - Demo tenant
- `default` - Default configuration

### Adding New Tenant

1. Create config file: `src/config/{tenant-slug}-branding.ts`
2. Export tenant configuration:
```typescript
export const myPartyConfig: TenantConfig = {
  slug: 'myparty',
  name: 'My Party',
  displayName: 'My Political Party',
  // ... other settings
};
```

3. Add to tenant registry (if using remote config)

---

## Production Deployment

### Vercel Configuration

For production subdomains on Vercel:

1. **Add Custom Domains:**
   - Vercel Dashboard → Your Project → Settings → Domains
   - Add: `tvk.pulseofpeople.com`
   - Add: `bjp.pulseofpeople.com`
   - Add: `*.pulseofpeople.com` (wildcard - Pro plan required)

2. **DNS Configuration:**

Add CNAME records in your DNS provider:
```
tvk.pulseofpeople.com    → CNAME → cname.vercel-dns.com
bjp.pulseofpeople.com    → CNAME → cname.vercel-dns.com
*.pulseofpeople.com      → CNAME → cname.vercel-dns.com (wildcard)
```

3. **Environment Variables:**

Set in Vercel:
```
VITE_MULTI_TENANT=true
VITE_TENANT_MODE=subdomain
VITE_DJANGO_API_URL=https://pulseofpeople3-2.onrender.com/api
```

### Backend (Render) Configuration

Update CORS in Render environment variables:
```
CORS_ALLOWED_ORIGINS=https://tvk.pulseofpeople.com,https://bjp.pulseofpeople.com,https://pulseofpeople3.vercel.app
```

Or use regex for all subdomains:
```python
CORS_ALLOWED_ORIGIN_REGEXES = [
  r"^https://[\w-]+\.pulseofpeople\.com$",
]
```

---

## Testing

### 1. Test Subdomain Detection

Open browser console (F12) and check logs:
```
[Tenant Detection] Hostname: tvk.localhost:5174 | Parts: ['tvk', 'localhost']
[Tenant Detection] Found tenant from localhost: tvk
```

### 2. Test Different Tenants

Visit each URL and verify:
- ✅ Different branding loads (colors, logos)
- ✅ Tenant name shows in header
- ✅ Correct API endpoints are used
- ✅ Data isolation works (each tenant sees own data)

### 3. Test Default (No Tenant)

Visit: http://localhost:5174

Should show default tenant configuration.

---

## Troubleshooting

### Issue: Subdomain not resolving

**Cause:** /etc/hosts not updated or DNS cache not flushed

**Fix:**
```bash
# macOS/Linux
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns
```

### Issue: Vite not accepting subdomain requests

**Cause:** Vite server not configured for external access

**Fix:** Check `vite.config.ts` has:
```typescript
server: {
  host: '0.0.0.0'
}
```

Restart Vite:
```bash
npm run dev
```

### Issue: CORS error in browser

**Cause:** Backend not allowing subdomain origin

**Fix:** Check Django `settings.py` includes subdomain regex pattern. Restart Django:
```bash
python3 manage.py runserver
```

### Issue: Tenant not detected

**Cause:** Multi-tenant mode disabled or wrong subdomain format

**Fix:**
1. Check `.env`: `VITE_MULTI_TENANT=true`
2. Use correct format: `{tenant}.localhost:{port}`
3. Clear browser cache and localStorage

---

## Quick Commands

**Start both servers:**
```bash
# Terminal 1 - Backend
cd backend && python3 manage.py runserver

# Terminal 2 - Frontend
cd pulseofprojectfrontendonly && npm run dev
```

**Test all tenants:**
```bash
# Open these URLs in browser
open http://tvk.localhost:5174
open http://bjp.localhost:5174
open http://congress.localhost:5174
open http://localhost:5174
```

**Check DNS:**
```bash
nslookup tvk.localhost
ping tvk.localhost -c 1
```

**Clear caches:**
```bash
# Browser: Cmd+Shift+R (hard refresh)
# localStorage: Open DevTools → Application → Clear storage
```

---

## Summary

**Local Development:**
1. Add subdomains to `/etc/hosts`
2. Start backend + frontend servers
3. Access via `http://{tenant}.localhost:{port}`

**Production:**
1. Configure DNS with CNAME records
2. Add domains in Vercel
3. Update CORS in Render backend
4. Deploy and test

**Key Files:**
- `vite.config.ts` - Dev server config
- `src/lib/tenant/identification.ts` - Tenant detection
- `backend/config/settings.py` - CORS configuration

---

v1.9 - 2025-11-22
