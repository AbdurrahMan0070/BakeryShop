// =====================================================
// SHARED TYPESCRIPT TYPES
// =====================================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'OWNER' | 'STAFF';
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  category: Category;
  purchasePrice: string;
  sellingPrice: string;
  stock: number;
  expiryDate: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

export interface Sale {
  id: number;
  total: string;
  paymentMethod: 'cash' | 'upi' | 'card';
  customerPhone: string | null;
  whatsappSent: boolean;
  pdfUrl: string | null;
  createdAt: string;
  items: SaleItem[];
}

export interface CreateSaleDto {
  items: { productId: number; quantity: number }[];
  paymentMethod: 'cash' | 'upi' | 'card';
  customerPhone?: string;
}

export interface DashboardStats {
  todaySales: number;
  todayProfit: number;
  todayBills: number;
  totalProducts: number;
  lowStockCount: number;
  expiringCount: number;
  dailySalesData: { date: string; sales: number; profit: number }[];
  weeklySalesData: { week: string; sales: number }[];
}

export interface Notification {
  id: number;
  type: 'LOW_STOCK' | 'EXPIRING';
  productId: number;
  productName: string;
  stock?: number;
  expiryDate?: string;
}

export interface Settings {
  id: number;
  storeName: string;
  storeAddress: string;
  phone: string;
  whatsappNumber: string;
  receiptFooter: string;
}

export interface ReportSummary {
  totalSales: number;
  totalProfit: number;
  totalBills: number;
  bestSelling: { productName: string; quantity: number; revenue: number }[];
  salesData: { label: string; sales: number; profit: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type Theme = 'light' | 'dark';
export type PaymentMethod = 'cash' | 'upi' | 'card';
