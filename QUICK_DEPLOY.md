# 🚀 Quick Deployment Guide

## ✅ GitHub Upload - COMPLETED ✓
Your code is live at: **https://github.com/AbdurrahMan0070/BakeryShop**

---

## 🌐 Deploy Using Vercel Dashboard (Recommended)

### A. Deploy Backend:

1. Go to: **https://vercel.com/** and login with GitHub
2. Click **"Add New Project"**
3. Import: **`AbdurrahMan0070/BakeryShop`**
4. Configure:
   - **Root Directory**: `bakery-backend`
   - **Project Name**: `bakery-backend`
5. Add Environment Variables:
   - `JWT_SECRET` = `crust-and-crumb-bakery-super-secret-jwt-key-2026`
   - `JWT_EXPIRES_IN` = `7d`
   - `PORT` = `3000`
   - `DATABASE_URL` = (add after database setup below)

### B. Setup Database (Choose One):

**Option 1: Neon (Recommended)**
1. https://neon.tech/ → Sign up
2. Create project → Copy connection string
3. Add to Vercel as `DATABASE_URL`

**Option 2: Supabase**
1. https://supabase.com/ → Create project
2. Settings → Database → Connection string
3. Add to Vercel as `DATABASE_URL`

**Option 3: Railway**
1. https://railway.app/ → Create PostgreSQL
2. Copy connection string
3. Add to Vercel as `DATABASE_URL`

6. Click **"Deploy"** and wait (2-3 min)
7. Copy your backend URL: `https://bakery-backend-xxx.vercel.app`

### C. Run Database Migrations:

```powershell
cd c:\Users\User\Documents\arzoo\bakery-backend
$env:DATABASE_URL="your-production-database-url"
npx prisma migrate deploy
npm run seed
```

### D. Deploy Frontend:

1. Vercel → **"Add New Project"** again
2. Import: **`AbdurrahMan0070/BakeryShop`**
3. Configure:
   - **Root Directory**: `bakery-frontend`
   - **Project Name**: `bakery-frontend`
   - **Framework**: Vite
4. Add Environment Variable:
   - `VITE_API_URL` = `https://bakery-backend-xxx.vercel.app/api`
5. Click **"Deploy"**

---

## ✅ Done!

- **Frontend**: `https://bakery-frontend-xxx.vercel.app`
- **Backend**: `https://bakery-backend-xxx.vercel.app`

Test by registering, logging in, and placing orders!

---

## 🆘 Troubleshooting

- **Build fails**: Check Node.js version (18+)
- **DB errors**: Verify DATABASE_URL
- **API not connecting**: Check CORS in backend
- **Check logs**: Vercel Dashboard → Project → Deployments → Logs
