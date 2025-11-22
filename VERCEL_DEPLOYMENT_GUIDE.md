# Vercel Deployment Guide - React Frontend

## 🚀 Quick Setup

### Step 1: Import Project on Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `chatgptnotes/pulseofpeople3`
4. Click **"Import"**

### Step 2: Configure Project

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `pulseofprojectfrontendonly` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 3: Set Environment Variables

Click **"Environment Variables"** and add:

#### Required Variables:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_URL=https://your-app.vercel.app
VITE_APP_NAME=Pulse of People
VITE_MULTI_TENANT=true
VITE_DEFAULT_TENANT=demo
VITE_TENANT_MODE=subdomain

# Backend API URL (Your Render backend)
VITE_API_URL=https://your-backend.onrender.com

# Feature Flags
VITE_ENABLE_SOCIAL_MEDIA=true
VITE_ENABLE_INFLUENCER_TRACKING=true
VITE_ENABLE_FIELD_REPORTS=true
VITE_ENABLE_SURVEYS=true
VITE_ENABLE_AI_INSIGHTS=true

# Regional Settings
VITE_DEFAULT_REGION=ap-south-1
VITE_DEFAULT_TIMEZONE=Asia/Kolkata
VITE_DEFAULT_CURRENCY=INR
VITE_DEFAULT_LANGUAGE=en

# Optional - Maps (if using Mapbox)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Optional - AI Voice Calling (ElevenLabs)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
VITE_ELEVENLABS_AGENT_ID=your_agent_id
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Your frontend will be live at: `https://your-app.vercel.app`

---

## 📋 Vercel Configuration Summary

### Framework: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: 22.x (automatically detected)

### Root Directory:
```
pulseofprojectfrontendonly
```

---

## 🔒 Getting Supabase Credentials

### For Frontend (Required):

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

⚠️ **Important**: Only use the `anon` key in frontend. NEVER use `service_role` key in frontend code!

---

## 🧪 Testing Your Deployment

### Check if frontend is running:

Open browser: `https://your-app.vercel.app`

### Test API Connection:

1. Open browser console (F12)
2. Check Network tab
3. Try logging in
4. Verify API calls go to your Render backend

---

## 🔧 Troubleshooting

### Build fails with module errors
- **Cause**: Missing dependencies or version mismatch
- **Solution**: Check `package.json` and run `npm install` locally first

### Environment variables not working
- **Cause**: Missing `VITE_` prefix
- **Solution**: All environment variables MUST start with `VITE_`

### API calls failing (CORS errors)
- **Cause**: Backend CORS not configured for your Vercel URL
- **Solution**: Add Vercel URL to `CORS_ALLOWED_ORIGINS` on Render backend

### Blank page after deployment
- **Cause**: Routing issue or environment variable missing
- **Solution**: Check Vercel logs and browser console for errors

---

## 🎨 Custom Domain Setup

### Option 1: Vercel Domain

Vercel provides free `.vercel.app` domain automatically.

### Option 2: Custom Domain

1. Go to your project **Settings** → **Domains**
2. Add your domain: `pulseofpeople.com`
3. Add DNS records to your domain provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. SSL certificate provisioned automatically (instant)

---

## 🔄 Auto-Deploy

Vercel automatically deploys when you push to GitHub.

### Deploy Triggers:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment
- Pull requests → Preview deployment with unique URL

### Disable Auto-Deploy:
1. Go to project **Settings**
2. **Git** → **Production Branch**
3. Uncheck **"Auto-deploy"**

---

## 🌐 Multi-Tenant Configuration

Your app supports multi-tenant mode with subdomains.

### Subdomain Setup (Optional):

1. Add wildcard domain in Vercel:
   - `*.pulseofpeople.com`

2. Add DNS record:
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

3. Tenant access:
   - `https://tvk.pulseofpeople.com`
   - `https://bjp.pulseofpeople.com`
   - `https://congress.pulseofpeople.com`

---

## 📊 Performance Optimization

### Vercel Analytics (Free)

1. Go to **Analytics** tab
2. Enable **Web Analytics**
3. View:
   - Page views
   - Load times
   - Core Web Vitals
   - Device/browser stats

### Speed Insights

1. Go to **Speed Insights** tab
2. Monitor:
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

---

## 🔐 Environment Variables Best Practices

### Development vs Production

**Development** (.env.local):
```bash
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:8000
VITE_DEBUG=true
```

**Production** (Vercel):
```bash
VITE_APP_URL=https://pulseofpeople.com
VITE_API_URL=https://api-pulseofpeople.onrender.com
VITE_DEBUG=false
```

### Security:
- ✅ Safe: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- ❌ Never: `VITE_SUPABASE_SERVICE_ROLE_KEY` (backend only!)
- ❌ Never: Database passwords, private keys

---

## 📝 Post-Deployment Tasks

### 1. Test Landing Page

Visit: `https://your-app.vercel.app`

Expected: Landing page with "Pulse of People" branding

### 2. Test Login Flow

1. Click **"Login"**
2. Enter credentials
3. Should redirect to dashboard

### 3. Test API Integration

1. Open browser DevTools → Network tab
2. Login and navigate
3. Verify API calls to Render backend succeed

### 4. Test Multi-Tenant (if enabled)

1. Visit different subdomains
2. Verify tenant-specific branding
3. Check tenant-specific data loading

---

## 🔗 Connecting Frontend to Backend

### Update Backend CORS:

Add your Vercel URL to Render environment variables:

```bash
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://pulseofpeople.com,https://www.pulseofpeople.com
```

### Update Frontend API URL:

In Vercel environment variables:

```bash
VITE_API_URL=https://your-backend.onrender.com
```

---

## 📚 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🎯 Deployment Checklist

- [x] Project imported to Vercel
- [x] Root directory set to `pulseofprojectfrontendonly`
- [x] Framework preset set to Vite
- [x] All environment variables configured
- [x] Build successful
- [x] Deployment successful
- [ ] Backend CORS configured for Vercel URL
- [ ] Custom domain configured (optional)
- [ ] Multi-tenant subdomains configured (optional)
- [ ] Analytics enabled
- [ ] End-to-end testing completed

---

## 🎉 Success!

Your frontend is now live on Vercel!

**Next Steps:**
1. Test all features
2. Configure custom domain (optional)
3. Set up analytics and monitoring
4. Share with users!

---

**Need help?** Check Vercel logs:
- Dashboard → Your Project → Deployments → Click deployment → View Logs

**Frontend successfully deployed!** 🚀
