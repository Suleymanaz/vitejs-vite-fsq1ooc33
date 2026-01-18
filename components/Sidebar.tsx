import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, FileText, Lock, Users, BarChart3, Tag, Wallet } from 'lucide-react';
import { ViewState, UserRole, User } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  currentUser: User;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, currentUser }) => {
  // Define menu items with required roles
  const menuItems = [
    { 
      id: ViewState.DASHBOARD, 
      label: 'Panel', 
      icon: LayoutDashboard,
      roles: [UserRole.ADMIN, UserRole.FINANCE] 
    },
    { 
      id: ViewState.INVENTORY, 
      label: 'Stok Yönetimi', 
      icon: Package,
      roles: [UserRole.ADMIN, UserRole.FINANCE, UserRole.PURCHASING] 
    },
    {
      id: ViewState.VIEW_PRICES,
      label: 'Fiyat Gör',
      icon: Tag,
      roles: [UserRole.ADMIN, UserRole.FINANCE, UserRole.SALES, UserRole.PURCHASING] 
    },
    { 
      id: ViewState.SALES, 
      label: 'Satış İşlemleri', 
      icon: ShoppingCart,
      roles: [UserRole.ADMIN, UserRole.FINANCE, UserRole.SALES]
    },
    {
      id: ViewState.CUSTOMERS,
      label: 'Cari Yönetimi',
      icon: Users,
      roles: [UserRole.ADMIN, UserRole.FINANCE, UserRole.SALES]
    },
    {
      id: ViewState.EXPENSES,
      label: 'Gider Yönetimi',
      icon: Wallet,
      roles: [UserRole.ADMIN, UserRole.FINANCE]
    },
    {
      id: ViewState.REPORTS,
      label: 'Raporlar',
      icon: BarChart3,
      roles: [UserRole.ADMIN, UserRole.FINANCE]
    },
    { 
      id: ViewState.INVOICES, 
      label: 'E-Arşiv Fatura', 
      icon: FileText,
      roles: [UserRole.ADMIN, UserRole.FINANCE, UserRole.SALES]
    }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'Yönetici';
      case UserRole.FINANCE: return 'Finans Sorumlusu';
      case UserRole.SALES: return 'Satış Temsilcisi';
      case UserRole.PURCHASING: return 'Satın Alma Uzmanı';
      default: return 'Kullanıcı';
    }
  };

  return (
    <div className="w-64 bg-slate-950 text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-10 border-r border-slate-800">
      {/* Brand Section - TEXT ONLY */}
      <div className="h-24 flex items-center justify-center border-b border-slate-800 bg-slate-900 px-6">
        <h1 className="text-3xl font-black tracking-widest text-slate-100">MERVOLT</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-900/20 font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-amber-500 transition-colors'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-xs">
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
               <p className="font-semibold text-slate-200 text-sm truncate">{currentUser.name}</p>
               <p className="text-xs text-amber-500 truncate">{getRoleLabel(currentUser.role)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
            <Lock size={10} /> Güvenli Oturum
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;