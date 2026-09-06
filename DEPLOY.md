# 🚀 Simple Deployment Guide

## Two-Project Deployment (Recommended - Most Reliable)

Deploy backend and frontend as separate projects on Vercel.

---

## Step 1: Setup Database (2 minutes)

1. Go to **https://neon.tech/**
2. Sign up with GitHub (free)
3. Create new project: `bakery-db`
4. Copy the connection string

---

## Step 2: Deploy Backend (3 minutes)

1. Go to **https://vercel.com/**
2. Click "**Add New Project**"
3. Import: `AbdurrahMan0070/BakeryShop`
4. Configure:
   - **Project Name**: `bakery-backend`
   - **Framework**: Other
   - **Root Directory**: Click "Edit" → Select `bakery-backend`
   - Leave other settings as default

5. **Add Environment Variables**:
   ```
   DATABASE_URL = <your Neon connection string>
   JWT_SECRET = crust-and-crumb-bakery-super-secret-jwt-key-2026
   JWT_EXPIRES_IN = 7d
   PORT = 3000
   ```

6. Click **"Deploy"**
7. Wait for deployment (2-3 minutes)
8. **COPY YOUR BACKEND URL**: `https://bakery-backend-xxx.vercel.app`

---

## Step 3: Run Database Migrations (1 minute)

In PowerShell:
```powershell
cd c:\Users\User\Documents\arzoo\bakery-backend
$env:DATABASE_URL="<your Neon connection string>"
npx prisma migrate deploy
npm run seed
```

---

## Step 4: Deploy Frontend (2 minutes)

1. Back to **https://vercel.com/**
2. Click "**Add New Project**" again
3. Import: `AbdurrahMan0070/BakeryShop` (same repo)
4. Configure:
   - **Project Name**: `bakery-frontend`
   - **Framework**: Vite
   - **Root Directory**: Click "Edit" → Select `bakery-frontend`

5. **Add Environment Variable**:
   ```
   VITE_API_BASE_URL = <your backend URL from Step 2>
   ```
   Example: `https://bakery-backend-xxx.vercel.app`

6. Click **"Deploy"**
7. Wait for deployment (2 minutes)

---

## ✅ Done!

You now have:
- **Backend**: `https://bakery-backend-xxx.vercel.app`
- **Frontend**: `https://bakery-frontend-xxx.vercel.app`

Open your frontend URL and test the app!

---

## 🧪 Testing

1. Open your frontend URL
2. Register new account
3. Login
4. Browse products
5. Test the cart and checkout

---

## 🔄 Making Updates

### Update Backend:
```powershell
cd bakery-backend
# make your changes
git add .
git commit -m "Update backend"
git push
```
Vercel auto-deploys the backend!

### Update Frontend:
```powershell
cd bakery-frontend
# make your changes
git add .
git commit -m "Update frontend"
git push
```
Vercel auto-deploys the frontend!

---

## 🆘 Troubleshooting

**Backend build fails:**
- Check build logs in Vercel
- Verify DATABASE_URL is set
- Check Node.js version (Settings → General → Node 18+)

**Frontend can't reach backend:**
- Verify VITE_API_BASE_URL is correct
- Check backend CORS settings (should allow your frontend domain)
- Check browser console for errors

**Database errors:**
- Run migrations: `npx prisma migrate deploy`
- Verify connection string is correct
- Check database is accessible

---

## 📊 Monitor Your Apps

Vercel Dashboard: https://vercel.com/dashboard

For each project:
- Check deployment status
- View function logs (for backend errors)
- Monitor analytics
- Update environment variables

---

## ✨ Why Two Projects?

- ✅ **More reliable** - Standard Vercel deployment
- ✅ **Easier debugging** - Separate logs
- ✅ **Better performance** - Optimized routing
- ✅ **Clearer structure** - Frontend and backend independent
- ✅ **Industry standard** - How most apps are deployed

---

## 🎯 URLs

After deployment:
- **Your Website**: `https://bakery-frontend-xxx.vercel.app` ← Share this!
- **Your API**: `https://bakery-backend-xxx.vercel.app` ← Backend only

---

**That's it! Much simpler and more reliable!** 🎉
