# Bakery Shop - Vercel Deployment Guide

## ✅ GitHub Upload - COMPLETED

Your code has been successfully pushed to: https://github.com/AbdurrahMan0070/BakeryShop

## 🚀 Vercel Deployment Instructions

### Prerequisites
- Vercel CLI installed ✅
- GitHub repository ready ✅
- PostgreSQL database (you'll need to set this up on a cloud provider)

### Step 1: Deploy Backend

1. Navigate to the backend directory:
```bash
cd bakery-backend
```

2. Login to Vercel (this will open your browser):
```bash
vercel login
```

3. Deploy the backend:
```bash
vercel --prod
```

4. During deployment, you'll be asked:
   - **Set up and deploy?** Yes
   - **Which scope?** Choose your account
   - **Link to existing project?** No (or Yes if you already created one)
   - **What's your project's name?** bakery-backend (or your preferred name)
   - **In which directory is your code located?** ./ (current directory)

5. After deployment, set up environment variables on Vercel dashboard:
   - Go to: https://vercel.com/dashboard
   - Select your `bakery-backend` project
   - Go to Settings → Environment Variables
   - Add these variables:
     - `DATABASE_URL` - Your PostgreSQL connection string (you need a cloud database)
     - `JWT_SECRET` - crust-and-crumb-bakery-super-secret-jwt-key-2026
     - `JWT_EXPIRES_IN` - 7d
     - `PORT` - 3000

### Step 2: Set Up Cloud Database

You'll need a PostgreSQL database. Options:

**Option 1: Neon (Recommended - Free tier available)**
1. Go to https://neon.tech/
2. Sign up and create a new project
3. Copy the connection string
4. Add it as `DATABASE_URL` in Vercel environment variables

**Option 2: Supabase (Free tier available)**
1. Go to https://supabase.com/
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (select "Connection pooling" mode)
5. Add it as `DATABASE_URL` in Vercel environment variables

**Option 3: Railway (Free tier available)**
1. Go to https://railway.app/
2. Create a PostgreSQL database
3. Copy the connection string
4. Add it as `DATABASE_URL` in Vercel environment variables

### Step 3: Run Database Migrations

After setting up the database URL in Vercel:

1. In your local terminal with the backend directory:
```bash
# Set your production DATABASE_URL temporarily
$env:DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Seed the database (optional)
npx prisma db seed
```

### Step 4: Deploy Frontend

1. Navigate to the frontend directory:
```bash
cd ../bakery-frontend
```

2. Deploy the frontend:
```bash
vercel --prod
```

3. During deployment:
   - Follow the same prompts as backend
   - Name it something like `bakery-frontend`

4. After deployment, update the API URL:
   - Go to your frontend project on Vercel dashboard
   - Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.vercel.app/api`
   - Redeploy the frontend

### Step 5: Update Frontend API Configuration

You'll need to update the frontend to use your deployed backend URL:

1. Check the file `bakery-frontend/src/api/axios.ts` or similar
2. Replace the baseURL with your Vercel backend URL
3. Commit and push the changes:
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

4. Vercel will automatically redeploy

## 📝 Post-Deployment Checklist

- [ ] Backend deployed to Vercel
- [ ] Database configured (Neon/Supabase/Railway)
- [ ] Environment variables set on Vercel
- [ ] Database migrations run
- [ ] Frontend deployed to Vercel
- [ ] Frontend connected to backend API
- [ ] Test registration/login
- [ ] Test product browsing
- [ ] Test cart functionality
- [ ] Test order placement

## 🌐 Your Deployed URLs

After deployment, you'll have:
- **Backend API**: https://bakery-backend-xxx.vercel.app
- **Frontend**: https://bakery-frontend-xxx.vercel.app

## 🔄 Alternative: Deploy via Vercel Dashboard (Easier)

### For Backend:
1. Go to https://vercel.com/new
2. Import your GitHub repository: `AbdurrahMan0070/BakeryShop`
3. Set Root Directory to: `bakery-backend`
4. Add environment variables as mentioned above
5. Click Deploy

### For Frontend:
1. Go to https://vercel.com/new
2. Import the same GitHub repository again
3. Set Root Directory to: `bakery-frontend`
4. Add environment variable: `VITE_API_URL`
5. Click Deploy

## 🆘 Troubleshooting

### Backend Issues:
- **Database connection errors**: Verify DATABASE_URL is correct
- **Build errors**: Check Node.js version in Vercel settings (use Node 18+)
- **Module not found**: Ensure all dependencies are in package.json

### Frontend Issues:
- **API not connecting**: Check CORS settings in backend
- **Build errors**: Verify all environment variables are set
- **404 errors**: Check vercel.json routing configuration

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for frontend errors
3. Check Vercel function logs for backend errors
4. Ensure environment variables are set correctly

## 🎉 Success!

Once deployed, your Bakery Shop will be live on the internet!
