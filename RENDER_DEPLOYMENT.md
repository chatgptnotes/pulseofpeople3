# Render Deployment Guide - Django Backend

## Issue: 501 Errors & Database Connection

### Current Problem
The Render deployment at `https://pulseofpeople3-1.onrender.com` is returning HTTP 501 errors because:
1. Database connection is failing
2. Environment variables not properly configured
3. CORS settings need Vercel URLs

## Solution Steps

### 1. Configure Render Environment Variables

Go to your Render dashboard → Your service → Environment tab and set:

```bash
# Required Variables
DEBUG=False
SECRET_KEY=<generate-new-secret-key-here>
ALLOWED_HOSTS=.onrender.com,.vercel.app,pulseofpeople.com

# Database Option 1: Use Render PostgreSQL (Recommended)
DATABASE_URL=<auto-populated-by-render-when-you-add-postgres>

# Database Option 2: Use Supabase PostgreSQL
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=bhupendra@111
DB_HOST=db.iiefjgytmxrjbctfqxni.supabase.co
DB_PORT=5432
DB_SSLMODE=require
USE_SQLITE=False

# CORS - Allow Vercel Frontend
CORS_ALLOWED_ORIGINS=https://pulseofpeople3.vercel.app,https://pulseofpeople.com

# CSRF Protection
CSRF_TRUSTED_ORIGINS=https://pulseofpeople3.vercel.app,https://*.vercel.app

# Supabase (Optional)
SUPABASE_URL=https://iiefjgytmxrjbctfqxni.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZWZqZ3l0bXhyamJjdGZxeG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTc2MjAsImV4cCI6MjA3ODU5MzYyMH0.sH9hdbkKT2D7T28-eDPd5_waHvINb487ChUyyg18YUE

# Logging
DJANGO_LOG_LEVEL=INFO
API_LOG_LEVEL=INFO
```

### 2. Add PostgreSQL Database to Render

**Option A: Render PostgreSQL (Recommended)**
1. In Render dashboard, go to "New" → "PostgreSQL"
2. Create a new database
3. Name it: `pulseofpeople-db`
4. Copy the "Internal Database URL"
5. Go to your web service → Environment
6. Add variable: `DATABASE_URL` = (paste internal URL)
7. Render will auto-populate this for you

**Option B: Continue Using Supabase**
- Keep existing Supabase credentials
- Ensure `USE_SQLITE=False` in environment variables
- Set all DB_* variables as shown above

### 3. Deploy Commands for Render

**Build Command:**
```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
```

**Start Command:**
```bash
gunicorn config.wsgi:application
```

### 4. Required Files (Already Configured)

✅ `requirements.txt` - Must include:
```
gunicorn
whitenoise
dj-database-url
psycopg2-binary
python-decouple
```

✅ `runtime.txt` (Optional - specify Python version):
```
python-3.11.5
```

### 5. After Deployment

**Test Health Endpoint:**
```bash
curl https://pulseofpeople3-1.onrender.com/api/health/
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "database_type": "postgresql"
}
```

**Test Login Endpoint:**
```bash
curl -X POST https://pulseofpeople3-1.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"test123"}'
```

### 6. Frontend Configuration

Update `/pulseofprojectfrontendonly/.env`:

```bash
# Production
VITE_DJANGO_API_URL=https://pulseofpeople3-1.onrender.com/api

# Or use your custom domain
# VITE_DJANGO_API_URL=https://api.pulseofpeople.com/api
```

Then redeploy to Vercel.

### 7. Common Issues

**Issue: 501 Error**
- Cause: Database connection failing
- Fix: Check DATABASE_URL or DB_* credentials in environment variables

**Issue: CORS Error**
- Cause: Vercel URL not in CORS_ALLOWED_ORIGINS
- Fix: Add your Vercel URL to environment variables

**Issue: Database Disconnected**
- Cause: Supabase PostgreSQL connection timeout or wrong credentials
- Fix:
  1. Test connection: `host db.iiefjgytmxrjbctfqxni.supabase.co`
  2. Verify password is correct
  3. Check Supabase is not paused/suspended

**Issue: Static Files Not Loading**
- Cause: collectstatic not run
- Fix: Add `python manage.py collectstatic --noinput` to build command

### 8. Monitoring

**Check Logs:**
```bash
# In Render dashboard → Logs tab
# Look for:
# - Database connection errors
# - Migration errors
# - CORS errors
```

**Health Check:**
- Render will automatically ping `/api/health/`
- If it returns 503 or fails, service will be marked unhealthy

### 9. Rollback Plan

If deployment fails:
1. Check Render logs for specific error
2. Verify all environment variables are set
3. Test database connection from Render shell:
   ```python
   from django.db import connection
   connection.ensure_connection()
   ```

## Quick Fix Checklist

- [ ] Set `DEBUG=False` in Render environment
- [ ] Set `DATABASE_URL` or all `DB_*` variables
- [ ] Set `ALLOWED_HOSTS=.onrender.com,.vercel.app`
- [ ] Set `CORS_ALLOWED_ORIGINS` with Vercel URL
- [ ] Set `CSRF_TRUSTED_ORIGINS` with Vercel URL
- [ ] Run migrations: `python manage.py migrate`
- [ ] Collect static files: `python manage.py collectstatic --noinput`
- [ ] Test health endpoint
- [ ] Test login endpoint
- [ ] Update frontend `.env` with Render URL
- [ ] Redeploy frontend to Vercel

## Support

If issues persist:
1. Check Render service logs
2. Verify database is accessible
3. Test endpoints with curl
4. Check browser console for CORS errors
