# URL Formats for Multi-Tenant Access

## Current Working URLs

### Local Development

**Subdomain-based (Recommended for local):**
```
http://bjp.localhost:5173        → BJP tenant
http://tvk.localhost:5173        → TVK tenant
http://congress.localhost:5173   → Congress tenant
http://localhost:5173            → Default tenant
```

**Path-based (Also works):**
```
http://localhost:5173/bjp        → BJP tenant
http://localhost:5173/tvk        → TVK tenant
http://localhost:5173/congress   → Congress tenant
```

---

### Production (Vercel)

**Path-based (Currently Working):**
```
https://pulseofpeople3.vercel.app/bjp       → BJP tenant
https://pulseofpeople3.vercel.app/tvk       → TVK tenant
https://pulseofpeople3.vercel.app/congress  → Congress tenant
https://pulseofpeople3.vercel.app           → Default tenant
```

**Subdomain-based (After custom domain purchase):**
```
https://bjp.pulseofpeople.com               → BJP tenant
https://tvk.pulseofpeople.com               → TVK tenant
https://congress.pulseofpeople.com          → Congress tenant
https://pulseofpeople.com                   → Default tenant
```

---

## Tenant Detection Logic

The app automatically detects tenants in this priority:

### Production (Vercel):
1. **Path** → `/bjp` extracts "bjp"
2. **Subdomain** → `bjp.pulseofpeople.com` extracts "bjp"
3. **localStorage** → Fallback for testing

### Development (Local):
1. **Subdomain** → `bjp.localhost:5173` extracts "bjp"
2. **Path** → `/bjp` extracts "bjp"
3. **localStorage** → Fallback for testing

---

## Setup Requirements

### Local Development

**Prerequisites:**
1. Add entries to `/etc/hosts`:
   ```bash
   sudo nano /etc/hosts

   # Add these lines:
   127.0.0.1 bjp.localhost
   127.0.0.1 tvk.localhost
   127.0.0.1 congress.localhost
   ```

2. Flush DNS cache:
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

3. Start servers:
   ```bash
   # Backend
   cd backend && python3 manage.py runserver

   # Frontend
   cd pulseofprojectfrontendonly && npm run dev
   ```

### Production Deployment

**Path-Based (Current - Free):**
- No setup needed
- Already works on Vercel
- Use URLs like: `pulseofpeople3.vercel.app/bjp`

**Custom Domain (Future - Paid):**
1. Purchase domain (e.g., `pulseofpeople.com`)
2. Add to Vercel: Settings → Domains
3. Configure DNS:
   ```
   Type: CNAME
   Name: *
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-60 mins)
5. Access: `bjp.pulseofpeople.com`

---

## Available Tenants

| Tenant Slug | Name | URL (Local) | URL (Production) |
|-------------|------|-------------|------------------|
| `bjp` | BJP Delhi | `bjp.localhost:5173` | `pulseofpeople3.vercel.app/bjp` |
| `tvk` | TVK Tamil Nadu | `tvk.localhost:5173` | `pulseofpeople3.vercel.app/tvk` |
| `congress` | Congress | `congress.localhost:5173` | `pulseofpeople3.vercel.app/congress` |
| `aiadmk` | AIADMK | `aiadmk.localhost:5173` | `pulseofpeople3.vercel.app/aiadmk` |
| `dmk` | DMK | `dmk.localhost:5173` | `pulseofpeople3.vercel.app/dmk` |
| `demo` | Demo Tenant | `demo.localhost:5173` | `pulseofpeople3.vercel.app/demo` |
| (default) | Default | `localhost:5173` | `pulseofpeople3.vercel.app` |

---

## Testing

### Test Local Subdomain
```bash
# Open browser
open http://bjp.localhost:5173

# Or curl
curl http://bjp.localhost:5173
```

### Test Local Path
```bash
open http://localhost:5173/bjp
```

### Test Production Path
```bash
# In browser
open https://pulseofpeople3.vercel.app/bjp

# Or curl
curl https://pulseofpeople3.vercel.app/bjp
```

---

## Console Logs

When tenant is detected, you'll see in browser console:

```
[Tenant Detection] Hostname: bjp.localhost:5173 | Parts: ['bjp', 'localhost']
[Tenant Detection] Found tenant from localhost: bjp
```

Or for production:
```
[Tenant Detection] Found tenant from path (production): bjp
```

---

## Troubleshooting

### Local subdomain not working
```bash
# Check /etc/hosts
cat /etc/hosts | grep localhost

# Should see:
127.0.0.1 bjp.localhost
```

### Production path not working
- Check tenant slug is valid: lowercase letters, numbers, hyphens only
- Clear browser cache: Cmd+Shift+R
- Check browser console for errors

### Wrong tenant loading
- Clear localStorage: DevTools → Application → Local Storage → Clear
- Hard refresh: Cmd+Shift+R

---

## Migration Path

**Current State:**
- ✅ Local: Subdomain-based (`bjp.localhost:5173`)
- ✅ Production: Path-based (`pulseofpeople3.vercel.app/bjp`)

**After Domain Purchase:**
- ✅ Local: Subdomain-based (no change)
- ✅ Production: Subdomain-based (`bjp.pulseofpeople.com`)

**No code changes needed!** Just DNS configuration.

---

v1.10 - 2025-11-22
