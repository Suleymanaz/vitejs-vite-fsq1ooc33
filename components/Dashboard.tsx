import React from 'react';
import { Product, Sale } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { DollarSign, Package, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales }) => {
  // Calculate Stats
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStockLevel).length;
  const totalOrders = sales.length;

  // Prepare Chart Data (Sales over last 7 days mockup logic)
  // Group sales by date
  const salesByDate = sales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(salesByDate).map(date => ({
    name: date,
    satis: salesByDate[date]
  })).slice(-7); // Last 7 data points available

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subtext && <p className={`text-xs mt-2 font-medium ${color === 'rose' ? 'text-rose-600' : 'text-emerald-600'}`}>{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Yönetim Paneli</h2>
        <p className="text-slate-500">İşletmenizin genel durumuna hızlı bir bakış.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Toplam Ciro" 
          value={`${totalRevenue.toLocaleString('tr-TR')} ₺`} 
          icon={DollarSign} 
          color="emerald" 
          subtext="+12% geçen haftaya göre"
        />
        <StatCard 
          title="Toplam Stok" 
          value={totalStock} 
          icon={Package} 
          color="blue" 
        />
        <StatCard 
          title="Toplam Sipariş" 
          value={totalOrders} 
          icon={TrendingUp} 
          color="indigo" 
        />
        <StatCard 
          title="Kritik Stok" 
          value={lowStockCount} 
          icon={AlertCircle} 
          color="rose" 
          subtext="Acil sipariş gerekli"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Satış Grafiği (Son Hareketler)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.length > 0 ? chartData : [{name: 'Bugün', satis: 0}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}₺`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`${value.toLocaleString()} ₺`, 'Satış']}
                />
                <Line type="monotone" dataKey="satis" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
