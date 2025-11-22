# Vercel Subdomain Configuration Guide

## Goal
Enable automatic subdomain routing: `bjp.pulseofpeople3.vercel.app`, `tvk.pulseofpeople3.vercel.app`

## Problem
Vercel doesn't automatically support wildcard subdomains on `*.vercel.app` domains. You need:
1. Custom domain (e.g., `pulseofpeople.com`)
2. OR manually add each subdomain

## Solution Options

### Option 1: Add Each Subdomain Manually (Free)

#### Step 1: Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select project: **pulseofpeople3**
3. Click **Settings** → **Domains**

#### Step 2: Add Subdomains
Click **"Add"** and enter each subdomain:

```
bjp.pulseofpeople3.vercel.app
tvk.pulseofpeople3.vercel.app
congress.pulseofpeople3.vercel.app
aiadmk.pulseofpeople3.vercel.app
dmk.pulseofpeople3.vercel.app
demo.pulseofpeople3.vercel.app
```

**Note:** These will only work if you have:
- Vercel Pro plan ($20/month)
- OR use path-based URLs instead

---

### Option 2: Use Custom Domain + Wildcard (Recommended)

#### Requirements
- Custom domain (e.g., `pulseofpeople.com`)
- Vercel Pro plan for wildcard support

#### Steps

**1. Buy Domain**
- GoDaddy, Namecheap, Cloudflare, etc.
- Suggested: `pulseofpeople.com` or `pulseofpeople.in`
- Cost: ~$10-15/year

**2. Add Domain to Vercel**
1. Vercel Dashboard → Settings → Domains
2. Click **"Add"**
3. Enter: `pulseofpeople.com`
4. Click **"Add"**

**3. Configure DNS**
Vercel will show DNS records to add. In your domain provider's DNS settings, add:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

For wildcard:
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

**4. Verify**
Wait 5-10 minutes for DNS propagation, then access:
- `bjp.pulseofpeople.com`
- `tvk.pulseofpeople.com`
- `congress.pulseofpeople.com`

---

### Option 3: Use Path-Based URLs (Free - Already Working!)

Use path-based routing instead of subdomains:

**Format:**
```
https://pulseofpeople3.vercel.app/bjp
https://pulseofpeople3.vercel.app/tvk
https://pulseofpeople3.vercel.app/congress
```

**Already configured!** The tenant detection code supports this:
```typescript
// src/lib/tenant/identification.ts
extractTenantFromPath('/bjp') → 'bjp'
```

**Test now:**
```
curl https://pulseofpeople3.vercel.app/bjp
```

---

## Automatic URL Change Configuration

To make URLs automatically change based on tenant, we need to add routing logic.

### Create Vercel Configuration

Create `vercel.json` in project root with rewrites:

```json
{
  "rewrites": [
    {
      "source": "/:tenant/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Tenant-Slug",
          "value": ":tenant"
        }
      ]
    }
  ]
}
```

This will:
- Route `/bjp/*` to your React app
- Pass tenant in header for detection

---

## Recommended Approach

**Short-term (Free):**
1. Use path-based URLs: `pulseofpeople3.vercel.app/bjp`
2. Add routing in React app to handle `/tenant` paths
3. Works immediately, no cost

**Long-term (Paid):**
1. Buy custom domain: `pulseofpeople.com`
2. Upgrade Vercel to Pro ($20/month)
3. Configure wildcard: `*.pulseofpeople.com`
4. Use: `bjp.pulseofpeople.com`

---

## Implementation Steps for Free Path-Based Solution

### 1. Update React Router

File: `src/App.tsx`

Add tenant-aware routing:
```typescript
<Routes>
  {/* Tenant-specific routes */}
  <Route path="/:tenant/*" element={<TenantApp />} />

  {/* Default routes */}
  <Route path="/" element={<Home />} />
</Routes>
```

### 2. Create TenantApp Component

File: `src/components/TenantApp.tsx`
```typescript
import { useParams } from 'react-router-dom';

export function TenantApp() {
  const { tenant } = useParams();

  // Set tenant in localStorage for detection
  useEffect(() => {
    if (tenant) {
      localStorage.setItem('tenantId', tenant);
    }
  }, [tenant]);

  return <DashboardLayout />;
}
```

### 3. Test URLs

After deployment:
```
https://pulseofpeople3.vercel.app/bjp → BJP tenant
https://pulseofpeople3.vercel.app/tvk → TVK tenant
```

---

## Cost Comparison

| Solution | Setup Cost | Monthly Cost | Time to Setup |
|----------|-----------|--------------|---------------|
| Path-based URLs | $0 | $0 | 30 mins |
| Custom domain + Wildcard | $10-15 (domain) | $20 (Vercel Pro) | 1-2 hours |
| Manual subdomains | $0 | $20 (Vercel Pro) | 1 hour |

---

## Next Steps

Choose your approach:

**A. Free path-based (Immediate):**
1. I'll create `vercel.json` with routing config
2. Update React Router to handle `/tenant` paths
3. Deploy to Vercel
4. Test: `pulseofpeople3.vercel.app/bjp`

**B. Custom domain + wildcard (Production-ready):**
1. Buy domain from provider
2. Add to Vercel
3. Configure DNS
4. Upgrade to Pro
5. Use: `bjp.pulseofpeople.com`

Which approach do you want me to implement?
