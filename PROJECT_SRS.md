# Bakery Management System (BMS)
### Problem Statement, Proposed Solution & Software Requirements Specification (SRS)

---

## 1. Project Title & Overview

- **Project Name:** Smart Bakery Management & POS System
- **Domain:** Web Application / Point of Sale (POS) & Inventory Management
- **Target Users:** Bakery Owners, Cashiers, and Staff

**Simple Summary:**
This project is an easy-to-use web application built specifically for bakery shops. It helps bakery owners and staff manage daily sales, track bakery inventory, receive automated warnings before items expire, generate instant customer bills (PDF and WhatsApp), and view daily profits and business reports.

---

## 2. Problem Statement (The Real-World Problem)

Running a bakery manually using paper registers, notebooks, or basic calculators causes major problems:

1. **Food Spoilage and Expiry Losses:**
   - Bakery items (cakes, pastries, cream desserts, fresh breads) have very short shelf lives (typically 1 to 7 days).
   - In manual systems, staff forget when items were baked, leading to spoiled products, wasted money, and health risks for customers.

2. **Stock Confusion and Shortages:**
   - Items sell out unexpectedly during busy rush hours.
   - Owners cannot easily know how many pastries or loaves are left without physically going to count them.

3. **Slow Billing & Long Customer Queues:**
   - Writing paper bills by hand takes too long during morning and evening rush hours.
   - Calculating totals manually causes calculation errors.

4. **No Clear Idea of Daily Profit:**
   - Bakery owners only see the total cash collected (revenue), but don't know their real net profit because they cannot easily subtract the purchase/ingredient cost for each item sold.

5. **Lost Paper Receipts:**
   - Paper receipts are easily lost, get tossed in the trash, and cost money to print. Customers prefer receiving digital bills directly on their mobile phones (like WhatsApp).

6. **Lack of Staff Access Control:**
   - Without dedicated user accounts, any staff member can see private business profits or accidentally change product prices.

---

## 3. Proposed Solution (How This System Solves It)

The **Bakery Management System** solves all the above problems with a unified web app:

1. **Fast Point-of-Sale (POS) Billing:**
   - Cashiers can tap product cards, select quantities, and generate bills in seconds.
   - Supports Cash, Card, and UPI / Online payment methods.

2. **Smart Expiry and Low Stock Alerts:**
   - Automatically gives a warning when an item is close to its expiry date (within 7 days).
   - Alerts staff when stock falls below 5 items so they can bake or order more in time.

3. **Instant PDF Bills & WhatsApp Sharing:**
   - Automatically generates a clean, branded PDF invoice with one click.
   - Allows sending the digital invoice link directly to the customer's WhatsApp number.

4. **Real-time Profit & Loss Tracking:**
   - Automatically calculates:
     `Profit = Selling Price - Purchase (Cost) Price`
   - Gives clear daily and weekly reports on total sales, total profit, and best-selling bakery items.

5. **Role-Based Access (Owner vs Staff):**
   - **Owner:** Can see profits, change prices, add/edit products, and change store settings.
   - **Staff / Cashier:** Can only access billing (POS), view stock, and create invoices.

---

## 4. Software Requirements Specification (SRS)

### 4.1 User Roles & Permissions

1. **Owner (Administrator):**
   - Login & account security
   - View Dashboard & real-time sales overview
   - Add, edit, and delete products & categories
   - View purchase costs, sales reports, and net profit
   - Update Store settings (Bakery Name, Phone, Address, Receipt message)

2. **Staff (Cashier):**
   - Login to POS terminal
   - Search products and add items to cart
   - Process customer payments (Cash / Card / UPI)
   - Print receipts and send WhatsApp bills
   - View low stock and expiring items list

---

### 4.2 System Modules & Features

#### Module 1: User Login & Security
- Secure login with Email and Password.
- Staff members cannot access the owner's financial reports.

#### Module 2: Product & Category Management
- Organize products into categories (Cakes, Pastries, Breads, Cookies, Drinks).
- For each product, save:
  - Product Name
  - Category
  - Cost Price (Purchase Price)
  - Selling Price
  - Current Stock quantity
  - Expiry Date
  - Product Image

#### Module 3: Point of Sale (POS) & Billing
- Search bar to find any bakery item instantly.
- Category filters to quickly switch between Cakes, Breads, etc.
- Interactive shopping cart with quantity increase/decrease buttons.
- Select Payment Method: Cash, Card, or UPI.
- Optional customer phone number input for digital receipt.
- Stock automatically decreases as soon as a sale is completed.

#### Module 4: Digital Invoicing & Receipts
- Creates a clean PDF receipt containing:
  - Bakery Name, Address & Contact Details
  - Date & Time
  - List of purchased items with price and total
  - Custom thank-you message
- Button to open WhatsApp directly with a pre-filled bill message for the customer.
- Option to print the bill for physical thermal printers.

#### Module 5: Notifications & Alerts
- **Low Stock Alert:** Warns when any product has 5 or fewer items remaining.
- **Expiring Soon Alert:** Warns when any item will expire within the next 7 days.

#### Module 6: Dashboard & Analytics
- Today's Total Sales (in Rupees/Currency).
- Today's Total Orders count.
- Number of items low in stock or expiring soon.
- Visual charts showing revenue trends and top 5 best-selling bakery items.

#### Module 7: Reports & Profit Tracking
- Select any Date Range (e.g., this week, this month, or custom dates).
- See:
  - Total Sales Revenue
  - Total Net Profit
  - Total Number of Bills
  - List of top-selling products by quantity and revenue

#### Module 8: Bakery Settings
- Change Bakery Name.
- Change Store Address & Contact Phone Number.
- Customize Receipt footer message (e.g., *"Thank you for visiting! Freshly baked daily."*).

---

## 5. Technology Stack (Tools Used in Simple Terms)

### Frontend (User Interface):
- **React.js & TypeScript:** For building a fast, interactive website screen.
- **Tailwind CSS:** For clean, modern styling and colors.
- **Lucide Icons:** For clean visual buttons and icons.
- **Axios:** To connect the frontend with the backend server.

### Backend (Server & Logic):
- **NestJS (Node.js framework):** For organizing server code cleanly and securely.
- **JWT & Bcrypt:** For secure user login and password protection.
- **PDFKit:** For generating clean PDF receipts.

### Database (Data Storage):
- **PostgreSQL:** Reliable database to store products, sales, users, and categories.
- **Prisma ORM:** Bridge to connect Node.js code with PostgreSQL easily.

---

## 6. How the System Works (Step-by-Step Flow)

1. **Step 1 - Login:** User logs in with their email and password.
2. **Step 2 - Billing (POS):** 
   - Cashier clicks on bakery items (e.g., *Chocolate Pastry x 2, Croissant x 1*).
   - Selects payment mode (Cash/UPI) and enters customer's phone number.
   - Clicks "Complete Sale".
3. **Step 3 - Automatic Updates:**
   - Database immediately decreases the stock count for those items.
   - System saves the sale record.
   - System generates a PDF bill on the spot.
4. **Step 4 - Receipt Delivery:**
   - Cashier can print the bill or click "Send WhatsApp" to share the digital bill.
5. **Step 5 - Reports:**
   - The Owner opens the Reports tab anytime to see today's revenue, profit, and stock alerts.

---

## 7. Hardware & Software Requirements

### Hardware:
- **Processor:** Dual Core 2.0 GHz or higher
- **RAM:** 4 GB RAM minimum
- **Disk Space:** 500 MB free space
- **Device:** Any Laptop, Desktop PC, or Tablet with a web browser

### Software:
- **Operating System:** Windows, macOS, or Linux
- **Web Browser:** Google Chrome, Microsoft Edge, Firefox, or Safari
- **Backend Runtime:** Node.js (v18 or higher)
- **Database:** PostgreSQL (v14 or higher)

---
