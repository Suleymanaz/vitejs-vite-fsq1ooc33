
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  SALES = 'SALES',
  INVOICES = 'INVOICES',
  CUSTOMERS = 'CUSTOMERS',
  REPORTS = 'REPORTS',
  VIEW_PRICES = 'VIEW_PRICES',
  EXPENSES = 'EXPENSES'
}

export enum UserRole {
  ADMIN = 'ADMIN',       // Yönetici
  FINANCE = 'FINANCE',   // Muhasebe / Finans
  SALES = 'SALES',       // Satış Temsilcisi
  PURCHASING = 'PURCHASING' // Satın Alma Uzmanı
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Product {
  id: string;
  code: string;       // Ürün Kodu (SKU)
  name: string;
  price: number;      // Satış Fiyatı (KDV Hariç)
  costPrice: number;  // Alış/Maliyet Fiyatı (KDV Hariç)
  stock: number;
  minStockLevel: number;
}

export interface Customer {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'CORPORATE';
  taxNumber?: string;
  contactInfo: string;
  totalPurchases: number;
}

export interface CartItem extends Product {
  quantity: number;
  isService?: boolean; // Hizmet/İşçilik kalemi mi?
}

export interface Sale {
  id: string;
  date: string; // ISO string
  items: CartItem[];
  subTotal: number; // KDV Hariç Toplam
  taxTotal: number; // Toplam KDV Tutarı
  total: number;    // Genel Toplam (KDV Dahil)
  customerId: string;
  customerName: string;
  taxId?: string;
  isInvoiced: boolean;
}

export interface Invoice {
  id: string;
  saleId: string;
  invoiceNumber: string; // e.g., GIB2024...
  date: string;
  total: number;
  taxTotal: number;
  status: 'DRAFT' | 'SIGNED' | 'SENT';
}

export type ExpenseCategory = 'RENT' | 'UTILITIES' | 'SALARY' | 'MEAL' | 'TAX' | 'MARKETING' | 'OTHER';

export interface Expense {
  id: string;
  description: string;
  amount: number; // KDV Dahil Tutar
  category: ExpenseCategory;
  date: string;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER';
}
