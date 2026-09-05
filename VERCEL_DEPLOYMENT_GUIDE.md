# 🚀 Bakery Application - Vercel Deployment Guide

This guide provides step-by-step instructions to deploy both the **NestJS Backend** and **React/Vite Frontend** to **Vercel** with a cloud PostgreSQL database.

---

## 📋 Prerequisites

1. A **Vercel Account** ([vercel.com](https://vercel.com))
2. A free **Cloud PostgreSQL Database** from one of the following:
   - ⚡ **Neon** ([neon.tech](https://neon.tech)) - *Recommended (1-click Postgres setup)*
   - 🟢 **Supabase** ([supabase.com](https://supabase.com))
   - 🔺 **Vercel Postgres** (built directly into Vercel Dashboard)

---

## Step 1: Set Up Cloud PostgreSQL Database

1. Go to [Neon.tech](https://neon.tech) and create a free PostgreSQL database project named `bakery-db`.
2. Copy the Connection String (`DATABASE_URL`). It should look like:
   ```text
   postgresql://username:password@ep-sample-123456.us-east-2.aws.neon.tech/bakery-db?sslmode=require
   ```
3. Push database tables using Prisma from your local terminal:
   ```bash
   cd bakery-backend
   # Windows (PowerShell)
   $env:DATABASE_URL="your-neon-database-connection-string"
   npx prisma db push

   # Seed initial data (optional)
   node seed.js
   ```

---

## Step 2: Deploy Backend to Vercel (`bakery-backend`)

### Option A: Using Vercel CLI (Recommended)

1. Open PowerShell in `bakery-backend`:
   ```bash
   cd bakery-backend
   npx vercel
   ```
2. Follow the prompts:
   - **Set up and deploy?**: `y`
   - **Which scope?**: Choose your account/team
   - **Link to existing project?**: `n`
   - **Project Name**: `bakery-backend`
   - **In which directory is your code located?**: `./`
3. Add Environment Variables on Vercel:
   ```bash
   npx vercel env add DATABASE_URL
   # Enter value: postgresql://...
   # Select targets: Production, Preview, Development

   npx vercel env add JWT_SECRET
   # Enter value: your-super-secret-jwt-key
   # Select targets: Production, Preview, Development
   ```
4. Deploy to Production:
   ```bash
   npx vercel --prod
   ```
5. Save your deployed backend URL (e.g., `https://bakery-backend.vercel.app`).

### Option B: Via Vercel Web Dashboard & GitHub

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.app) -> **Add New...** -> **Project**.
3. Select your repository.
4. Set **Root Directory** to `bakery-backend`.
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: `postgresql://...`
   - `JWT_SECRET`: `your-super-secret-jwt-key`
6. Click **Deploy**.

---

## Step 3: Deploy Frontend to Vercel (`bakery-frontend`)

### Option A: Using Vercel CLI

1. Open PowerShell in `bakery-frontend`:
   ```bash
   cd bakery-frontend
   npx vercel
   ```
2. Follow the prompts:
   - **Project Name**: `bakery-frontend`
   - **Framework**: Vite
3. Set the Backend API URL Environment Variable:
   ```bash
   npx vercel env add VITE_API_BASE_URL
   # Enter value: https://bakery-backend.vercel.app (your deployed backend URL from Step 2)
   ```
4. Deploy to Production:
   ```bash
   npx vercel --prod
   ```

### Option B: Via Vercel Web Dashboard & GitHub

1. In Vercel Dashboard, click **Add New...** -> **Project**.
2. Select your repository.
3. Set **Root Directory** to `bakery-frontend`.
4. Framework Preset: **Vite**.
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://bakery-backend.vercel.app`
6. Click **Deploy**.

---

## 🛠️ Summary of Config Files Created

- 📄 [`bakery-backend/api/index.ts`](file:///c:/Users/User/Documents/arzoo/bakery-backend/api/index.ts) - NestJS Serverless Handler
- 📄 [`bakery-backend/vercel.json`](file:///c:/Users/User/Documents/arzoo/bakery-backend/vercel.json) - Backend Vercel Functions Config
- 📄 [`bakery-frontend/vercel.json`](file:///c:/Users/User/Documents/arzoo/bakery-frontend/vercel.json) - Frontend SPA Rewrites Config
- 📄 [`bakery-frontend/src/api/client.ts`](file:///c:/Users/User/Documents/arzoo/bakery-frontend/src/api/client.ts) - Configurable API Base URL

---

## 🎉 Verification

Once both are deployed:
1. Open your frontend URL (e.g., `https://bakery-frontend.vercel.app`).
2. Log in with your admin credentials.
3. All network requests will communicate securely with your Vercel-hosted NestJS backend and cloud PostgreSQL database!
