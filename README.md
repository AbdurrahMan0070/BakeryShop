# 🍰 Bakery Shop - Modern Bakery Management System

A comprehensive full-stack web application designed to streamline bakery operations with an intuitive interface for managing products, processing orders, tracking inventory, and analyzing business performance.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

---

## 🌟 Overview

Bakery Shop is a modern Point of Sale (POS) and management system built specifically for bakeries and food businesses. It combines powerful backend APIs with a beautiful, responsive frontend to deliver a complete business solution.

### ✨ Key Benefits

- **💼 Streamlined Operations** - Manage products, categories, and orders from one unified dashboard
- **📊 Business Intelligence** - Real-time analytics and insights to make informed decisions
- **🛒 Seamless Checkout** - Fast and intuitive POS system for quick customer transactions
- **📱 Modern Interface** - Responsive design that works perfectly on desktop, tablet, and mobile
- **🔐 Secure** - JWT authentication with role-based access control
- **⚡ Fast & Reliable** - Built with modern technologies for optimal performance
- **📈 Scalable** - Designed to grow with your business

---

## 🎯 Who Is This For?

- **Bakery Owners** - Manage your entire bakery operations efficiently
- **Café Managers** - Handle products, orders, and customer transactions
- **Food Business Startups** - Professional solution without expensive proprietary systems
- **Developers** - Learn full-stack development with a real-world application

---

## 🚀 Core Features

### 🏪 Product Management
- Create, edit, and delete products with detailed information
- Upload product images with preview
- Set prices, costs, and track profit margins
- Organize products by categories
- Monitor stock levels with low-stock alerts
- Track product expiry dates

### 🛒 Point of Sale (POS)
- Intuitive product grid for quick selection
- Real-time cart management
- Support for multiple payment methods
- Quick checkout process
- Generate digital receipts
- Order history tracking

### 📊 Analytics & Reports
- Revenue and profit tracking
- Sales trends visualization with charts
- Best-selling products analysis
- Date-range reporting
- Key performance indicators (KPIs)
- 7-day performance charts

### 👤 User Management
- Secure user authentication
- Role-based access control (Admin/Customer)
- User profile management
- Registration and login system

### 🔔 Smart Notifications
- Low stock alerts (≤5 units)
- Product expiry warnings (within 7 days)
- Real-time notification system

### 📄 Receipt Generation
- Auto-generated PDF receipts
- Professional thermal receipt format (80mm)
- Store branding and contact information
- Itemized billing with totals

### ⚙️ Store Settings
- Customize store name and address
- Configure contact information
- Set WhatsApp for customer communication
- Personalize receipt footer

### 🎨 User Experience
- Dark/Light mode toggle
- Responsive design for all devices
- Smooth animations and transitions
- Intuitive navigation

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first styling
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form validation
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Framer Motion** - Smooth animations
- **Zod** - Schema validation

### Backend
- **NestJS 11** - Progressive Node.js framework
- **TypeScript** - Type-safe backend
- **Prisma ORM** - Next-generation database toolkit
- **PostgreSQL** - Robust relational database
- **Passport.js** - Authentication middleware
- **JWT** - Secure token-based auth
- **bcrypt** - Password hashing
- **PDFKit** - PDF generation
- **Multer** - File upload handling
- **Express** - HTTP server

---

## 📁 Project Structure

```
bakery-shop/
├── bakery-backend/          # NestJS API Server (Port 3000)
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── products/       # Product management
│   │   ├── categories/     # Category management
│   │   ├── orders/         # Order processing
│   │   ├── sales/          # Sales tracking
│   │   ├── dashboard/      # Analytics & KPIs
│   │   ├── reports/        # Business reports
│   │   ├── notifications/  # Alert system
│   │   └── settings/       # Store configuration
│   ├── prisma/            # Database schema & migrations
│   └── api/               # Serverless entry point
│
├── bakery-frontend/         # React + Vite App (Port 5173)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── api/           # API client setup
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── public/            # Static assets
│
├── vercel.json             # Deployment configuration
├── package.json            # Root dependencies
└── SINGLE_DEPLOY.md        # Deployment guide
```

---

## 🎨 Screenshots & Features

### Dashboard
- **Real-time KPIs**: Revenue, profit, total bills, and best-seller
- **7-day charts**: Visual representation of revenue and profit trends
- **Quick stats**: At-a-glance business performance

### POS Terminal
- **Product grid**: Browse all products with images and prices
- **Smart cart**: Add/remove items, adjust quantities
- **Multi-payment**: Cash, card, UPI support
- **Quick checkout**: Fast transaction processing

### Product Management
- **Full CRUD**: Create, read, update, delete products
- **Image upload**: Drag-and-drop product photos
- **Category filter**: Organize by product type
- **Inventory tracking**: Real-time stock levels

### Analytics
- **Revenue reports**: Track income over time
- **Profit analysis**: Monitor margins and profitability
- **Sales history**: Detailed transaction logs
- **Best sellers**: Identify top-performing products

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AbdurrahMan0070/BakeryShop.git
cd BakeryShop
```

2. **Setup PostgreSQL Database**
```sql
CREATE DATABASE arzoo_bakery;
```

3. **Configure Backend Environment**

Create `bakery-backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/arzoo_bakery?schema=public"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=3000
```

4. **Install Backend Dependencies**
```bash
cd bakery-backend
npm install
```

5. **Run Database Migrations**
```bash
npx prisma migrate deploy
```

6. **Seed Database with Sample Data**
```bash
npm run seed
```

7. **Start Backend Server**
```bash
npm run start:dev
```
Backend will run at: http://localhost:3000

8. **Install Frontend Dependencies**
```bash
cd ../bakery-frontend
npm install
```

9. **Start Frontend Development Server**
```bash
npm run dev
```
Frontend will run at: http://localhost:5173

---

## 🔑 Default Login Credentials

After seeding the database, use these credentials:

- **Email**: `admin@arzoo.com`
- **Password**: `admin123`
- **Role**: Admin (Owner)

---

## 📡 API Endpoints

All endpoints require `Authorization: Bearer <token>` header except authentication endpoints.

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Products
- `GET /products` - List all products
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/:id/image` - Upload product image

### Categories
- `GET /categories` - List categories
- `POST /categories` - Create category
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Orders & Sales
- `POST /orders` - Create new order
- `GET /orders` - List orders
- `GET /orders/:id` - Get order details
- `GET /sales` - Sales history
- `GET /sales/:id/receipt` - Download receipt PDF

### Dashboard & Analytics
- `GET /dashboard/stats` - Dashboard KPIs
- `GET /reports` - Revenue and profit reports
- `GET /notifications` - System notifications

### Settings
- `GET /settings` - Get store settings
- `PUT /settings` - Update store settings

---

## 🌐 Deployment

This application is optimized for deployment as a monorepo on Vercel. See **SINGLE_DEPLOY.md** for detailed deployment instructions.

Quick deployment:
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Abdurrahman**
- GitHub: [@AbdurrahMan0070](https://github.com/AbdurrahMan0070)

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world bakery management needs
- Designed for efficiency and ease of use

---

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation in `SINGLE_DEPLOY.md`

---

## 🎯 Future Enhancements

- 📱 Mobile app (React Native)
- 🌐 Multi-language support
- 📧 Email notifications
- 💳 Online payment integration
- 📦 Supplier management
- 👥 Employee management
- 📊 Advanced analytics dashboard
- 🔔 SMS notifications
- 🎁 Loyalty program
- 📝 Custom receipt templates

---

**Made with ❤️ for bakery businesses worldwide**
