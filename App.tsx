import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import InventoryView from './components/InventoryView';
import SalesView from './components/SalesView';
import InvoiceView from './components/InvoiceView';
import CustomerView from './components/CustomerView';
import ReportsView from './components/ReportsView';
import PriceCheckView from './components/PriceCheckView';
import ExpensesView from './components/ExpensesView';
import { ViewState, Product, Sale, Invoice, User, UserRole, Customer, Expense } from './types';
import { Shield, LogOut, Database, AlertTriangle } from 'lucide-react';

// Mock Data Initialization (Only used if LocalStorage is empty)
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', code: 'ELK-001', name: 'Kablosuz Gaming Mouse', price: 1250.90, costPrice: 800.00, stock: 45, minStockLevel: 10 },
  { id: '2', code: 'ELK-002', name: 'Mekanik Klavye (RGB)', price: 2800.00, costPrice: 1900.00, stock: 8, minStockLevel: 5 },
  { id: '3', code: 'ELK-003', name: '27" IPS Monitör', price: 6500.00, costPrice: 4800.00, stock: 12, minStockLevel: 3 },
  { id: '4', code: 'MOB-101', name: 'Ergonomik Ofis Koltuğu', price: 4200.50, costPrice: 2500.00, stock: 4, minStockLevel: 2 },
  { id: '5', code: 'AKS-505', name: 'USB-C Hub', price: 850.00, costPrice: 400.00, stock: 150, minStockLevel: 20 },
  { id: '6', code: 'AKS-506', name: 'Laptop Standı', price: 450.00, costPrice: 200.00, stock: 0, minStockLevel: 15 },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'PERAKENDE (HIZLI SATIŞ)', type: 'INDIVIDUAL', contactInfo: '-', totalPurchases: 0 },
  { id: 'c2', name: 'Ahmet Yılmaz', type: 'INDIVIDUAL', contactInfo: '555-123-4567', totalPurchases: 2501.80 },
  { id: 'c3', name: 'Ayşe Demir', type: 'INDIVIDUAL', contactInfo: '555-987-6543', totalPurchases: 850.00 },
];

const INITIAL_SALES: Sale[] = [
  { 
    id: 's1', 
    date: new Date(Date.now() - 86400000 * 2).toISOString(), 
    items: [{...INITIAL_PRODUCTS[0], quantity: 2}], 
    subTotal: 2501.80,
    taxTotal: 500.36,
    total: 3002.16,
    customerId: 'c2',
    customerName: 'Ahmet Yılmaz', 
    isInvoiced: true 
  },
  { 
    id: 's2', 
    date: new Date(Date.now() - 86400000).toISOString(), 
    items: [{...INITIAL_PRODUCTS[4], quantity: 1}], 
    subTotal: 850.00, 
    taxTotal: 170.00,
    total: 1020.00,
    customerId: 'c3',
    customerName: 'Ayşe Demir', 
    isInvoiced: false 
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    saleId: 's1',
    invoiceNumber: 'GIB2024100523',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    total: 3002.16,
    taxTotal: 500.36,
    status: 'SENT'
  }
];

const INITIAL_EXPENSES: Expense[] = [
    {
        id: 'ex1',
        description: 'Ekim 2024 Kira',
        amount: 5000.00,
        category: 'RENT',
        date: new Date(Date.now() - 86400000 * 15).toISOString(),
        paymentMethod: 'BANK_TRANSFER'
    },
    {
        id: 'ex2',
        description: 'Elektrik Faturası',
        amount: 450.00,
        category: 'UTILITIES',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        paymentMethod: 'CREDIT_CARD'
    }
];

// System Users (MVP hardcoded auth)
const SYSTEM_USERS: User[] = [
  { id: 'u1', name: 'Ali Yönetici', role: UserRole.ADMIN },
  { id: 'u2', name: 'Mehmet Satış', role: UserRole.SALES },
  { id: 'u3', name: 'Zeynep Finans', role: UserRole.FINANCE },
  { id: 'u4', name: 'Cemil Satın Alma', role: UserRole.PURCHASING },
];

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [currentView, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Helper to load state from LocalStorage safely
  const loadState = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.error(`Failed to load ${key} from localStorage`, e);
      return fallback;
    }
  };

  // Global State with LocalStorage Persistence
  const [products, setProducts] = useState<Product[]>(() => loadState('products', INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadState('customers', INITIAL_CUSTOMERS));
  const [sales, setSales] = useState<Sale[]>(() => loadState('sales', INITIAL_SALES));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadState('invoices', INITIAL_INVOICES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadState('expenses', INITIAL_EXPENSES));

  // Persistence Effects
  useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('expenses', JSON.stringify(expenses)); }, [expenses]);

  // Role Based Access Control Map
  const ALLOWED_VIEWS: Record<UserRole, ViewState[]> = {
    [UserRole.ADMIN]: [ViewState.DASHBOARD, ViewState.INVENTORY, ViewState.SALES, ViewState.INVOICES, ViewState.CUSTOMERS, ViewState.REPORTS, ViewState.VIEW_PRICES, ViewState.EXPENSES],
    [UserRole.FINANCE]: [ViewState.DASHBOARD, ViewState.INVENTORY, ViewState.SALES, ViewState.INVOICES, ViewState.CUSTOMERS, ViewState.REPORTS, ViewState.VIEW_PRICES, ViewState.EXPENSES],
    [UserRole.SALES]: [ViewState.INVENTORY, ViewState.SALES, ViewState.INVOICES, ViewState.CUSTOMERS, ViewState.VIEW_PRICES],
    [UserRole.PURCHASING]: [ViewState.INVENTORY, ViewState.VIEW_PRICES, ViewState.REPORTS] 
  };

  // Effect to redirect if user role changes and they are on a forbidden page
  useEffect(() => {
    if (currentUser) {
      const allowed = ALLOWED_VIEWS[currentUser.role];
      if (!allowed.includes(currentView)) {
        setView(allowed[0]); // Redirect to the first allowed view
      }
    }
  }, [currentUser, currentView]);

  // Actions
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Determine default view based on role
    const defaultView = ALLOWED_VIEWS[user.role][0];
    setView(defaultView);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const addProduct = (p: Product) => setProducts([...products, p]);
  
  const updateProduct = (p: Product) => {
    setProducts(products.map(prod => prod.id === p.id ? p : prod));
  };
  
  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
  
  const addCustomer = (c: Customer) => setCustomers([...customers, c]);

  const addExpense = (e: Expense) => setExpenses([...expenses, e]);

  const deleteExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));

  const createSale = (sale: Sale) => {
    // 1. Add Sale
    setSales(prevSales => [sale, ...prevSales]);
    
    // 2. Update Stock (Only for non-service items)
    const newProducts = products.map(p => {
      const soldItem = sale.items.find(item => item.id === p.id && !item.isService);
      if (soldItem) {
        // Ensure numbers are numbers to prevent NaN
        const currentStock = Number(p.stock) || 0;
        const soldQty = Number(soldItem.quantity) || 0;
        return { ...p, stock: Math.max(0, currentStock - soldQty) };
      }
      return p;
    });
    setProducts(newProducts);

    // 3. Update Customer Total Purchases
    const newCustomers = customers.map(c => {
      if (c.id === sale.customerId) {
        // Ensure numbers are numbers
        const currentTotal = Number(c.totalPurchases) || 0;
        const saleTotal = Number(sale.total) || 0;
        return { ...c, totalPurchases: currentTotal + saleTotal };
      }
      return c;
    });
    setCustomers(newCustomers);
  };

  const cancelSale = (saleId: string) => {
    const saleToCancel = sales.find(s => s.id === saleId);
    if (!saleToCancel) return;

    if (saleToCancel.isInvoiced) {
        alert("Faturalanmış satışlar iptal edilemez! Önce faturayı iptal ediniz.");
        return;
    }

    // 1. Restore Stock
    const newProducts = products.map(p => {
        const soldItem = saleToCancel.items.find(item => item.id === p.id && !item.isService);
        if (soldItem) {
            const currentStock = Number(p.stock) || 0;
            const returnQty = Number(soldItem.quantity) || 0;
            return { ...p, stock: currentStock + returnQty };
        }
        return p;
    });
    setProducts(newProducts);

    // 2. Revert Customer Balance
    const newCustomers = customers.map(c => {
        if (c.id === saleToCancel.customerId) {
            const currentTotal = Number(c.totalPurchases) || 0;
            const refundAmount = Number(saleToCancel.total) || 0;
            return { ...c, totalPurchases: Math.max(0, currentTotal - refundAmount) };
        }
        return c;
    });
    setCustomers(newCustomers);

    // 3. Delete Sale
    setSales(prev => prev.filter(s => s.id !== saleId));
  };

  const createInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    setSales(prev => prev.map(s => s.id === invoice.saleId ? { ...s, isInvoiced: true } : s));
  };

  const renderContent = () => {
    if (!currentUser) return null;

    // Security check before rendering
    if (!ALLOWED_VIEWS[currentUser.role].includes(currentView)) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <Shield size={64} className="mb-4 text-slate-200" />
          <h2 className="text-xl font-bold text-slate-600">Erişim Yetkisi Yok</h2>
          <p>Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır.</p>
        </div>
      );
    }

    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard products={products} sales={sales} />;
      case ViewState.INVENTORY:
        return <InventoryView products={products} addProduct={addProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} currentUser={currentUser} />;
      case ViewState.SALES:
        return <SalesView products={products} customers={customers} createSale={createSale} goToCustomerCreation={() => setView(ViewState.CUSTOMERS)} />;
      case ViewState.INVOICES:
        return <InvoiceView sales={sales} invoices={invoices} createInvoice={createInvoice} cancelSale={cancelSale} />;
      case ViewState.CUSTOMERS:
        return <CustomerView customers={customers} sales={sales} addCustomer={addCustomer} />;
      case ViewState.EXPENSES:
        return <ExpensesView expenses={expenses} addExpense={addExpense} deleteExpense={deleteExpense} />;
      case ViewState.REPORTS:
        return <ReportsView sales={sales} products={products} customers={customers} expenses={expenses} />;
      case ViewState.VIEW_PRICES:
        return <PriceCheckView products={products} />;
      default:
        return <Dashboard products={products} sales={sales} />;
    }
  };

  // --- Auth Gate ---
  if (!currentUser) {
    return <Login users={SYSTEM_USERS} onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* MVP / Local Storage Warning Banner */}
      <div className="bg-amber-100 border-b border-amber-200 text-amber-900 text-xs py-1 px-4 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-2">
           <AlertTriangle size={14} className="text-amber-600" />
           <span className="font-bold">MVP Test Modu:</span>
           <span>Verileriniz tarayıcı önbelleğinde (Local Storage) saklanmaktadır. Tarayıcıyı temizlerseniz veriler silinebilir.</span>
        </div>
        <div className="hidden md:flex items-center gap-1 opacity-70">
           <Database size={12} />
           <span>Local Environment</span>
        </div>
      </div>

      <div className="flex flex-1">
        <Sidebar currentView={currentView} setView={setView} currentUser={currentUser} />
        
        <div className="ml-64 flex-1 flex flex-col h-[calc(100vh-28px)]"> {/* Height adjusted for banner */}
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex justify-end items-center px-8 shadow-sm print:hidden shrink-0">
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-sm font-medium transition-colors text-slate-600"
              >
                 <LogOut size={16} /> Çıkış Yap
              </button>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-x-hidden overflow-y-auto print:p-0">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;