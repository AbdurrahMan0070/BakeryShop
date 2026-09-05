# ?? BakeTrack — Smart Bakery Management & POS System

A full-stack web application for managing bakery operations — inventory, point-of-sale billing, expiry tracking, PDF receipts, and profit reporting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, Recharts |
| **Backend** | NestJS 11, TypeScript, Prisma ORM, PDFKit |
| **Database** | PostgreSQL |
| **Auth** | JWT (Passport.js) + bcrypt |

---

## Project Structure

```
arzoo/
+-- bakery-backend/     # NestJS API (port 3000)
+-- bakery-frontend/    # React + Vite app (port 5173)
+-- BAKERY_PROJECT_REPORT.md
+-- PROJECT_SRS.md
```

---

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14

---

## Quick Setup

### Step 1 — Install PostgreSQL

Download from https://www.postgresql.org/download/windows/
Set the `postgres` user password to **postgres** (or update .env).

### Step 2 — Create the Database

Open psql or pgAdmin and run:
```sql
CREATE DATABASE arzoo_bakery;
```

### Step 3 — Configure Environment

Backend `.env` is at `bakery-backend/.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/arzoo_bakery?schema=public"
JWT_SECRET="crust-and-crumb-bakery-super-secret-jwt-key-2026"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### Step 4 — Backend Setup

```bash
cd bakery-backend
npm install
npx prisma migrate deploy
node seed.js
npm run start:dev
```

API runs at: http://localhost:3000

### Step 5 — Frontend Setup

```bash
cd bakery-frontend
npm install
npm run dev
```

App runs at: http://localhost:5173

---

## Default Login Credentials

After running `node seed.js`:

| Field | Value |
|---|---|
| Email | admin@arzoo.com |
| Password | admin123 |
| Role | Owner (Admin) |

---

## Features

- Dashboard with KPIs (revenue, profit, bills) and 7-day charts
- POS terminal with product grid, cart, and multi-payment checkout
- Product management with image upload, expiry dates, cost/selling prices
- Category management
- Sales history with pagination, date filtering, and PDF download
- Reports with date-range revenue/profit charts and best-sellers
- Notifications for low stock (<=5 units) and expiring (within 7 days) products
- Store settings (name, address, WhatsApp, receipt footer)
- Auto-generated PDF receipts (80mm thermal format)
- WhatsApp receipt sharing
- Dark / light mode toggle

---

## API Reference

All endpoints require `Authorization: Bearer <token>` except login/register.

| Method | Path | Description |
|---|---|---|
| POST | /auth/login | Login |
| POST | /auth/register | Register |
| GET | /auth/me | Current user |
| GET/POST | /categories | Categories |
| GET/POST | /products | Products |
| PATCH/DELETE | /products/:id | Update/Delete product |
| POST | /products/:id/image | Upload image |
| POST/GET | /sales | Create/List sales |
| GET | /sales/:id/receipt | Download PDF receipt |
| GET | /dashboard/stats | Dashboard stats |
| GET | /reports | Revenue & profit |
| GET | /notifications | Alerts |
| GET/PUT | /settings | Store settings |
