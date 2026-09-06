# 🚀 Single Project Deployment Guide

## ✅ Your project is configured as a MONOREPO
Both frontend and backend will deploy as **ONE project** on Vercel!

---

## 🌐 Deploy in 3 Steps (5 Minutes)

### Step 1: Setup Database (2 minutes)

Choose one free database provider:

**🟢 Neon (Recommended)**
1. Go to: https://neon.tech/
2. Sign up with GitHub (free)
3. Click "Create Project"
4. Name: `bakery-db`
5. Click "Create"
6. Copy the connection string (looks like: `postgresql://...`)

**OR Supabase**: https://supabase.com/ → New Project → Database Settings → Connection String
**OR Railway**: https://railway.app/ → New → PostgreSQL → Copy connection string

---

### Step 2: Deploy on Vercel (2 minutes)

1. **Go to**: https://vercel.com/
2. **Login** with your GitHub account
3. Click **"Add New Project"**
4. **Import** your repository: `AbdurrahMan0070/BakeryShop`
5. **Configure**:
   - Project Name: `bakery-shop` (or any name you like)
   - Framework Preset: **Vite**
   - Root Directory: **Leave as `./`** (root of repository)
   - Build Command: Will use vercel.json configuration
   - Output Directory: `bakery-frontend/dist`
   
6. **Add Environment Variables**:
   ```
   DATABASE_URL = <paste your database connection string>
   JWT_SECRET = crust-and-crumb-bakery-super-secret-jwt-key-2026
   JWT_EXPIRES_IN = 7d
   PORT = 3000
   ```

7. Click **"Deploy"**

8. Wait 3-5 minutes for deployment

---

### Step 3: Setup Database (1 minute)

After deployment completes, run migrations:

Open PowerShell:
```powershell
cd c:\Users\User\Documents\arzoo\bakery-backend

# Set your production database URL
$env:DATABASE_URL="<paste your database connection string>"

# Run migrations
npx prisma migrate deploy

# Seed initial data
npm run seed
```

---

## 🎉 Done! Your App is Live!

Your single URL will serve both frontend and backend:
- **Your Website**: `https://bakery-shop-xxx.vercel.app`
- **Your API**: `https://bakery-shop-xxx.vercel.app/api`

Everything works from ONE domain!

---

## 🧪 Test Your Deployment

1. Open your Vercel URL
2. Register a new account
3. Login
4. Browse products
5. Add to cart
6. Place an order

---

## ✅ Advantages of Single Project Deployment

- ✅ **One URL** - Easy to share
- ✅ **No CORS issues** - Same domain
- ✅ **Simpler management** - One project to monitor
- ✅ **Better performance** - No cross-origin requests
- ✅ **Easier updates** - One deployment updates everything

---

## 🔧 How It Works

```
https://bakery-shop-xxx.vercel.app/
├── /                  → Frontend (React/Vite)
├── /products          → Frontend pages
├── /login             → Frontend pages
├── /api/auth/login    → Backend API
├── /api/products      → Backend API
└── /api/orders        → Backend API
```

All routes starting with `/api` go to the backend, everything else goes to the frontend!

---

## 🆘 Troubleshooting

**Build fails:**
- Check build logs in Vercel dashboard
- Ensure Node.js version is 18+ (Settings → General → Node.js Version)

**Database connection error:**
- Verify `DATABASE_URL` is set correctly in Vercel
- Check database is publicly accessible
- Run migrations: `npx prisma migrate deploy`

**Frontend shows blank page:**
- Check browser console for errors
- Verify build completed successfully
- Check Vercel function logs

**API not responding:**
- Check Vercel function logs: Project → Functions
- Verify all environment variables are set
- Test API directly: `https://your-url.vercel.app/api/health`

---

## 🔄 Making Updates

Push to GitHub and Vercel auto-deploys:

```powershell
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically rebuild and redeploy in 2-3 minutes!

---

## 📊 Monitor Your App

Vercel Dashboard: https://vercel.com/dashboard

- **Deployments**: See deployment history
- **Functions**: Monitor API performance  
- **Analytics**: Track visitors
- **Logs**: Debug issues
- **Domains**: Add custom domain

---

## 🎯 What's Deployed

**Frontend** (`/`)
- React + Vite application
- Product browsing
- Shopping cart
- User authentication
- Order management
- Admin dashboard

**Backend** (`/api`)
- NestJS REST API
- PostgreSQL database
- JWT authentication
- File uploads
- Order processing

---

## ✨ Environment Variables

Only needed on Vercel:

```
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=crust-and-crumb-bakery-super-secret-jwt-key-2026
JWT_EXPIRES_IN=7d
PORT=3000
```

No need for `VITE_API_BASE_URL` - it automatically uses `/api`!

---

## 🚀 You're All Set!

Your Bakery Shop is deployed as **ONE unified project**!

Share your URL and start selling! 🎊
