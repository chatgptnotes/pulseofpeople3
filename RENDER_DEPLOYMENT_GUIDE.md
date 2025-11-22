# Render Deployment Guide - Django Backend

## 🚀 Quick Setup

### Step 1: Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `chatgptnotes/pulseofpeople3`

### Step 2: Configure Service

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `pulseofpeople-backend` (or your choice) |
| **Runtime** | Python 3 |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `./build.sh` |
| **Start Command** | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` |

### Step 3: Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

#### Required Variables:

```bash
# Django Settings
SECRET_KEY=your-super-secret-key-min-50-characters-long-random-string
DEBUG=False
ALLOWED_HOSTS=.onrender.com

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# OR use individual database settings:
USE_SQLITE=False
DB_NAME=postgres
DB_USER=postgres.your-project-ref
DB_PASSWORD=your_supabase_db_password
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_SSLMODE=require

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# CORS (Add your frontend URL)
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://pulseofpeople.com
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for build to complete (2-3 minutes)
3. Your backend will be live at: `https://your-app.onrender.com`

---

## 📋 Render Configuration Summary

### Build Command:
```bash
./build.sh
```

**What it does:**
- Upgrades pip
- Installs all dependencies from requirements.txt
- Collects static files
- Runs database migrations

### Start Command:
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

**What it does:**
- Starts Gunicorn WSGI server
- Binds to Render's dynamic PORT
- Serves your Django application

---

## 🔒 Getting Supabase Credentials

### Database URL:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Copy **Connection String** (URI mode)
5. Replace `[YOUR-PASSWORD]` with your actual database password

Format:
```
postgresql://postgres.project-ref:[YOUR-PASSWORD]@db.project-ref.supabase.co:5432/postgres
```

### API Keys:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

3. Go to **Settings** → **API** → **JWT Settings**
4. Copy **JWT Secret** → `SUPABASE_JWT_SECRET`

---

## 🧪 Testing Your Deployment

### Check if backend is running:

```bash
curl https://your-app.onrender.com/api/health/
```

### Test API endpoints:

```bash
# Get token
curl -X POST https://your-app.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'

# Test authenticated endpoint
curl https://your-app.onrender.com/api/users/me/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Troubleshooting

### Build fails with "command not found"
- **Cause**: Missing package in requirements.txt
- **Solution**: Check that all packages are in `backend/requirements.txt`

### Migration errors
- **Cause**: Database URL not set or incorrect
- **Solution**: Verify `DATABASE_URL` environment variable is correct

### Static files not loading
- **Cause**: STATIC_ROOT not configured or collectstatic not run
- **Solution**: Build script should run `python manage.py collectstatic --no-input`

### CORS errors from frontend
- **Cause**: Frontend URL not in CORS_ALLOWED_ORIGINS
- **Solution**: Add your Vercel frontend URL to environment variables

---

## 📊 Performance Settings

### Free Tier:
- 512 MB RAM
- 0.1 CPU
- Spins down after 15 minutes of inactivity
- Cold start: ~30 seconds

### Recommended Upgrades:
- **Starter ($7/month)**: 512 MB RAM, 0.5 CPU, no spin down
- **Standard ($25/month)**: 2 GB RAM, 1 CPU, faster performance

---

## 🔄 Auto-Deploy

Render automatically deploys when you push to the `main` branch on GitHub.

To disable auto-deploy:
1. Go to your service settings
2. **Settings** → **Build & Deploy**
3. Toggle off **Auto-Deploy**

---

## 📝 Post-Deployment Tasks

### 1. Create Superuser

Open Render Shell:
```bash
python manage.py createsuperuser
```

### 2. Load Initial Data (if needed)

```bash
python manage.py seed_permissions
python manage.py seed_political_data
```

### 3. Test Admin Panel

Visit: `https://your-app.onrender.com/admin/`

---

## 🌐 Custom Domain Setup

1. Go to **Settings** → **Custom Domains**
2. Add your domain: `api.pulseofpeople.com`
3. Add DNS records to your domain provider:

```
Type: CNAME
Name: api
Value: your-app.onrender.com
```

4. Wait for SSL certificate to provision (5-10 minutes)

---

## 📚 Useful Links

- [Render Documentation](https://render.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)
- [Gunicorn Configuration](https://docs.gunicorn.org/en/stable/settings.html)

---

## 🎯 Next Steps

1. ✅ Backend deployed on Render
2. 📦 Deploy frontend on Vercel (see VERCEL_DEPLOYMENT_GUIDE.md)
3. 🔗 Connect frontend to backend API
4. 🧪 Test end-to-end functionality
5. 🚀 Configure custom domains

---

**Need help?** Check Render logs:
- Dashboard → Your Service → Logs
- Real-time log streaming available

**Backend successfully deployed!** 🎉
