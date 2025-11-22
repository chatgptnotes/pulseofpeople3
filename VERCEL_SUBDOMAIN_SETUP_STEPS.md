# Vercel Subdomain Setup - Step by Step

## Goal
Make `bjp.pulseofpeople3.vercel.app` automatically work

## Important Note
⚠️ **Vercel Free Tier Limitation:**
- `*.vercel.app` wildcard subdomains NOT supported
- Each subdomain must be added manually OR
- Use custom domain

## Solution: Manual Subdomain Addition

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Login with your account
3. Find and click on project: **pulseofpeople3**

### Step 2: Open Domains Settings

1. Click **Settings** (top menu)
2. Click **Domains** (left sidebar)
3. You'll see current domains listed

### Step 3: Add Git Branch Deployments

Vercel automatically creates preview URLs for each Git branch.

**Create branches for each tenant:**

```bash
cd "/Users/apple/1 imo backups/pulseofproject python 3"

# Create BJP branch
git checkout -b bjp
git push origin bjp

# Create TVK branch
git checkout -b tvk
git push origin tvk

# Create Congress branch
git checkout -b congress
git push origin congress

# Go back to main
git checkout main
```

**Vercel will automatically create:**
- `pulseofpeople3-git-bjp.vercel.app` → BJP tenant
- `pulseofpeople3-git-tvk.vercel.app` → TVK tenant
- `pulseofpeople3-git-congress.vercel.app` → Congress tenant

### Step 4: Configure Tenant Detection for Branch URLs

Update frontend to detect tenant from URL pattern.

### Step 5: Add Custom Domains (If Available)

If you have a custom domain:

1. Click **"Add"** in Domains section
2. Enter: `bjp.yourdomain.com`
3. Follow DNS configuration instructions
4. Repeat for each tenant

---

## Alternative: Use Custom Vercel Project for Each Tenant

Create separate Vercel projects:

1. **pulseofpeople-bjp** → deploys to `pulseofpeople-bjp.vercel.app`
2. **pulseofpeople-tvk** → deploys to `pulseofpeople-tvk.vercel.app`
3. **pulseofpeople-congress** → deploys to `pulseofpeople-congress.vercel.app`

**Cons:** Harder to maintain, separate deployments

---

## RECOMMENDED: Buy Custom Domain

**Best long-term solution:**

### Option A: Buy Domain (~$10/year)

**Suggested domains:**
- `pulseofpeople.com`
- `pulseofpeople.in`
- `pulseofpeopleapp.com`

**Where to buy:**
- Namecheap (~$10/year)
- GoDaddy (~$12/year)
- Cloudflare (~$10/year)
- Porkbun (~$8/year)

### Option B: Add Domain to Vercel

1. Vercel Dashboard → Settings → Domains
2. Click **"Add"**
3. Enter: `pulseofpeople.com`
4. Click **"Add"**

### Option C: Configure DNS

Vercel will show you DNS records. Go to your domain provider and add:

**For main domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For wildcard subdomains:**
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

**Wait:** 5-60 minutes for DNS propagation

### Option D: Access Subdomains

After DNS propagation:
- `bjp.pulseofpeople.com` ✅
- `tvk.pulseofpeople.com` ✅
- `congress.pulseofpeople.com` ✅

---

## Quick Test: Git Branch Method (Free)

**Fastest solution without buying domain:**

```bash
cd "/Users/apple/1 imo backups/pulseofproject python 3"

# Create and push BJP branch
git checkout -b bjp
git push origin bjp

# Vercel will auto-deploy to:
# https://pulseofpeople3-git-bjp-yourverceluser.vercel.app
```

Check Vercel dashboard → Deployments to see the URL.

---

## Current Status

**What works now:**
- ✅ Local: `bjp.localhost:5173`
- ✅ Production (main): `pulseofpeople3.vercel.app`

**What doesn't work:**
- ❌ `bjp.pulseofpeople3.vercel.app` (Vercel limitation)

**What will work after setup:**
- ✅ Git branches: `pulseofpeople3-git-bjp.vercel.app`
- ✅ Custom domain: `bjp.pulseofpeople.com` (after buying)

---

## Action Items

**Choose one:**

### A. Free - Git Branch Method (Immediate)
```bash
# Create branches for tenants
git checkout -b bjp && git push origin bjp
git checkout -b tvk && git push origin tvk
git checkout main
```
**URLs:** `pulseofpeople3-git-{tenant}.vercel.app`

### B. Buy Domain ($10 + time)
1. Buy `pulseofpeople.com` from Namecheap
2. Add to Vercel
3. Configure DNS
4. Use: `bjp.pulseofpeople.com`

### C. Path-Based URLs (Free, Already Working)
```
https://pulseofpeople3.vercel.app/bjp
https://pulseofpeople3.vercel.app/tvk
```

**Tenant detection** already supports path-based routing!

---

## My Recommendation

**Short-term (Today):**
- Use Git branch deployment method
- URLs: `pulseofpeople3-git-bjp.vercel.app`

**Long-term (Next week):**
- Buy domain: `pulseofpeople.com` ($10)
- Configure wildcard DNS
- Use: `bjp.pulseofpeople.com`

**Let me know which approach you want, and I'll implement it!**
