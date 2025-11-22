# Vercel + Render Setup Guide

## Current Status

✅ **Render Backend Working:** https://pulseofpeople3-2.onrender.com/api/
⚠️ **Database Disconnected** on Render
⚠️ **Vercel Frontend** showing "Backend Offline"

---

## STEP 1: Fix Render Database Connection

### Go to Render Dashboard
https://dashboard.render.com → Select service: **pulseofpeople3-2**

### Add Environment Variables

Click **Environment** tab, then **Add Environment Variable** for each:

```bash
# Essential Settings
DEBUG=False
SECRET_KEY=django-insecure-change-this-in-production-xyz123
USE_SQLITE=False

# Database - Supabase PostgreSQL
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=bhupendra@111
DB_HOST=db.iiefjgytmxrjbctfqxni.supabase.co
DB_PORT=5432
DB_SSLMODE=require

# CORS - Allow Vercel
CORS_ALLOWED_ORIGINS=https://pulseofpeople3.vercel.app,http://localhost:5173
ALLOWED_HOSTS=.onrender.com,.vercel.app,localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=https://pulseofpeople3.vercel.app,https://*.vercel.app

# Supabase Auth
SUPABASE_URL=https://iiefjgytmxrjbctfqxni.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZWZqZ3l0bXhyamJjdGZxeG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTc2MjAsImV4cCI6MjA3ODU5MzYyMH0.sH9hdbkKT2D7T28-eDPd5_waHvINb487ChUyyg18YUE

# Logging
DJANGO_LOG_LEVEL=INFO
API_LOG_LEVEL=INFO
```

### Click "Save Changes"
Render will automatically redeploy (takes 2-3 minutes)

### Verify Database Connected
```bash
curl https://pulseofpeople3-2.onrender.com/api/health/
# Expected: {"status":"healthy","database":"connected"}
```

---

## STEP 2: Configure Vercel Environment Variables

### Go to Vercel Dashboard
https://vercel.com/dashboard → Select project: **pulseofpeople3**

### Add Environment Variables

Click **Settings** → **Environment Variables** → **Add New**

**For each variable, select "Production", "Preview", and "Development"**

```bash
# Required for production build
VITE_DJANGO_API_URL=https://pulseofpeople3-2.onrender.com/api

# Supabase (same as local)
VITE_SUPABASE_URL=https://iiefjgytmxrjbctfqxni.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZWZqZ3l0bXhyamJjdGZxeG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTc2MjAsImV4cCI6MjA3ODU5MzYyMH0.sH9hdbkKT2D7T28-eDPd5_waHvINb487ChUyyg18YUE

# Multi-tenant
VITE_MULTI_TENANT=true
VITE_TENANT_MODE=subdomain
VITE_DEFAULT_TENANT=demo
VITE_TENANT_CACHE_DURATION=5

# App Info
VITE_APP_URL=https://pulseofpeople3.vercel.app
VITE_APP_NAME=Pulse of People

# API Keys (get from your local .env - NEVER commit these!)
VITE_ELEVENLABS_API_KEY=your_key_here
VITE_ELEVENLABS_AGENT_ID=your_id_here
VITE_ELEVENLABS_PHONE_NUMBER_ID=your_phone_id_here
VITE_ELEVENLABS_PHONE_NUMBER=your_phone_number_here
VITE_HUGGINGFACE_API_KEY=your_huggingface_key_here
```

**IMPORTANT:** Copy the actual API keys from your local `.env` file. Don't use "your_key_here"!

### Redeploy Vercel
After adding variables:
- Go to **Deployments** tab
- Click **"..."** on latest deployment → **Redeploy**
- OR just push to GitHub (auto-deploys)

---

## STEP 3: Verify Everything Works

### Test Render Backend
```bash
# Health check
curl https://pulseofpeople3-2.onrender.com/api/health/
# Should return: {"status":"healthy","database":"connected"}

# API root
curl https://pulseofpeople3-2.onrender.com/api/
# Should return: Django REST API endpoints
```

### Test Vercel Frontend
1. Go to: https://pulseofpeople3.vercel.app
2. Should show:
   - ✅ "Backend online" (green)
   - ✅ "Database connected" (green)
3. Try login with demo credentials

---

## TROUBLESHOOTING

### Issue: Vercel still shows "Backend Offline"

**Cause:** Environment variables not set in Vercel

**Fix:**
1. Check Vercel Dashboard → Settings → Environment Variables
2. Make sure `VITE_DJANGO_API_URL` is set
3. Redeploy from Deployments tab

### Issue: CORS Error in Browser Console

**Cause:** Vercel URL not in Render's CORS settings

**Fix:**
1. Add to Render environment: `CORS_ALLOWED_ORIGINS=https://pulseofpeople3.vercel.app`
2. Redeploy Render

### Issue: Database Still Disconnected on Render

**Cause:** Wrong credentials or Supabase paused

**Fix:**
1. Check Supabase dashboard - make sure project is active
2. Verify password: `bhupendra@111`
3. Test connection:
   ```bash
   ping db.iiefjgytmxrjbctfqxni.supabase.co
   ```

### Issue: Vercel Build Fails

**Cause:** Missing environment variables during build

**Fix:**
1. Check Vercel build logs
2. Make sure all `VITE_*` variables are set
3. Redeploy with correct variables

---

## QUICK CHECKLIST

### Render (Backend)
- [ ] Service: `pulseofpeople3-2` selected
- [ ] All environment variables added (DB_*, CORS_*, etc.)
- [ ] Service redeployed successfully
- [ ] Health check returns "connected"
- [ ] No errors in Render logs

### Vercel (Frontend)
- [ ] All `VITE_*` environment variables added
- [ ] `VITE_DJANGO_API_URL=https://pulseofpeople3-2.onrender.com/api`
- [ ] API keys copied from local `.env`
- [ ] Deployment successful
- [ ] No build errors

### Testing
- [ ] https://pulseofpeople3-2.onrender.com/api/health/ returns healthy
- [ ] https://pulseofpeople3.vercel.app loads without errors
- [ ] Login page shows "Backend online" + "Database connected"
- [ ] Login works with demo credentials
- [ ] No CORS errors in browser console

---

## FINAL NOTES

**Why .env.production is not enough?**
- Vercel doesn't use `.env.production` automatically
- You MUST set environment variables in Vercel dashboard
- This is for security - secrets should not be in Git

**Why database is disconnected?**
- Render doesn't have access to your local `.env` file
- You must manually add all DB_* variables in Render dashboard

**Estimated time:** 10-15 minutes total

---

**After completing both steps, test at:** https://pulseofpeople3.vercel.app 🚀
