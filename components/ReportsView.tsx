import React, { useState } from 'react';
import { Sale, Product, Customer, Expense } from '../types';
import { Calendar, Printer, TrendingUp, Package, Users, Filter, Calculator, Wallet } from 'lucide-react';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
  customers: Customer[];
  expenses: Expense[]; // Added expenses prop
}

type ReportType = 'SALES' | 'STOCK' | 'CUSTOMERS' | 'VAT';

const ReportsView: React.FC<ReportsViewProps> = ({ sales, products, customers, expenses }) => {
  const [activeReport, setActiveReport] = useState<ReportType>('SALES');
  
  // Date Filters
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Customer Report Filters
  const [customerReportMode, setCustomerReportMode] = useState<'ALL' | 'SINGLE'>('ALL');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Helper: Check date range
  const isInRange = (dateStr: string) => {
    const d = new Date(dateStr);
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Adjust end date to end of day
    end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  };

  // --- REPORT GENERATION LOGIC ---

  // 1. Sales Report Data
  const filteredSales = sales.filter(s => isInRange(s.date));
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + Number(s.subTotal), 0); // KDV Hariç Ciro
  // Calculate Cost of Goods Sold (COGS)
  const totalCOGS = filteredSales.reduce((sum, s) => {
    return sum + s.items.reduce((itemSum, item) => itemSum + (Number(item.costPrice) * Number(item.quantity)), 0);
  }, 0);
  
  // Calculate Operational Expenses
  const filteredExpenses = expenses.filter(e => isInRange(e.date));
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const grossProfit = totalSalesRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;

  // 2. VAT Report Data - MONTHLY BALANCE
  const getMonthlyVatData = () => {
      const monthlyData: Record<string, {output: number, input: number}> = {};

      sales.forEach(sale => {
          const date = new Date(sale.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = { output: 0, input: 0 };
          }
          
          // Output VAT (Sales Tax)
          monthlyData[monthKey].output += Number(sale.taxTotal);

          // Estimated Input VAT (Purchase Tax) based on COGS
          const saleCost = sale.items.reduce((acc, i) => acc + (Number(i.costPrice) * Number(i.quantity)), 0);
          monthlyData[monthKey].input += (saleCost * 0.20); 
      });

      // Sort keys reverse chronologically
      return Object.keys(monthlyData).sort().reverse().map(key => ({
          month: key,
          output: monthlyData[key].output,
          input: monthlyData[key].input,
          balance: monthlyData[key].output - monthlyData[key].input // Positive = Payable, Negative = Refund/Carry
      }));
  };

  const vatReportData = getMonthlyVatData();

  // 3. Stock Report Data
  const totalStockValueCost = products.reduce((sum, p) => sum + (Number(p.stock) * Number(p.costPrice)), 0);
  const totalStockValueSales = products.reduce((sum, p) => sum + (Number(p.stock) * Number(p.price)), 0);

  // 4. Customer Report Data
  const getCustomerHistory = (custId: string) => {
    return sales.filter(s => s.customerId === custId && isInRange(s.date));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Finansal Raporlar</h2>
          <p className="text-slate-500">Detaylı analiz ve döküm ekranı.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Printer size={18} /> Yazdır / PDF
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-4 border-b border-slate-200 print:hidden overflow-x-auto">
        <button 
          onClick={() => setActiveReport('SALES')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeReport === 'SALES' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <TrendingUp size={18} /> Satış & Kârlılık
        </button>
        <button 
          onClick={() => setActiveReport('VAT')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeReport === 'VAT' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Calculator size={18} /> Aylık KDV Dengesi
        </button>
        <button 
          onClick={() => setActiveReport('STOCK')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeReport === 'STOCK' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Package size={18} /> Stok Değerleme
        </button>
        <button 
          onClick={() => setActiveReport('CUSTOMERS')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeReport === 'CUSTOMERS' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Users size={18} /> Cari Raporları
        </button>
      </div>

      {/* Date Filter Bar */}
      {activeReport !== 'STOCK' && activeReport !== 'VAT' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-4 print:border-none print:p-0 print:shadow-none">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Tarih Aralığı:</span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* CONTENT: SALES REPORT */}
      {activeReport === 'SALES' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-2">
             <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                <p className="text-emerald-800 text-sm font-medium">Net Ciro (KDV Hariç)</p>
                <p className="text-2xl font-bold text-emerald-900">{totalSalesRevenue.toLocaleString('tr-TR')} ₺</p>
             </div>
             <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                <p className="text-orange-800 text-sm font-medium">Ürün Maliyeti (SMM)</p>
                <p className="text-2xl font-bold text-orange-900">{totalCOGS.toLocaleString('tr-TR')} ₺</p>
             </div>
             <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                <p className="text-rose-800 text-sm font-medium">Operasyonel Giderler</p>
                <p className="text-2xl font-bold text-rose-900">{totalExpenses.toLocaleString('tr-TR')} ₺</p>
             </div>
             <div className={`${netProfit >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'} border p-4 rounded-xl`}>
                <p className={`${netProfit >= 0 ? 'text-indigo-800' : 'text-red-800'} text-sm font-medium`}>NET KÂR</p>
                <p className={`${netProfit >= 0 ? 'text-indigo-900' : 'text-red-900'} text-2xl font-bold`}>{netProfit.toLocaleString('tr-TR')} ₺</p>
             </div>
          </div>

          {/* Expense Breakdown */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
               <Wallet size={16} className="text-rose-500"/> Gider Dökümü (Seçili Tarih)
             </div>
             {filteredExpenses.length > 0 ? (
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-600 font-semibold">
                   <tr>
                     <th className="px-4 py-3">Tarih</th>
                     <th className="px-4 py-3">Kategori</th>
                     <th className="px-4 py-3">Açıklama</th>
                     <th className="px-4 py-3 text-right">Tutar</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {filteredExpenses.map(exp => (
                     <tr key={exp.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500">{new Date(exp.date).toLocaleDateString('tr-TR')}</td>
                        <td className="px-4 py-3">
                           <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">
                              {exp.category}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{exp.description}</td>
                        <td className="px-4 py-3 text-right font-bold text-rose-600">{exp.amount.toLocaleString('tr-TR')} ₺</td>
                     </tr>
                   ))}
                   <tr className="bg-rose-50 font-bold">
                      <td colSpan={3} className="px-4 py-3 text-right text-rose-800">Toplam Gider:</td>
                      <td className="px-4 py-3 text-right text-rose-800">{totalExpenses.toLocaleString('tr-TR')} ₺</td>
                   </tr>
                 </tbody>
               </table>
             ) : (
                <div className="p-8 text-center text-slate-400">Bu tarih aralığında gider kaydı yok.</div>
             )}
          </div>

          {/* Sales Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
               Satış Dökümü ({filteredSales.length} İşlem)
             </div>
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-600 font-semibold">
                 <tr>
                   <th className="px-4 py-3">Tarih</th>
                   <th className="px-4 py-3">Müşteri</th>
                   <th className="px-4 py-3">Ürünler</th>
                   <th className="px-4 py-3 text-right">Net Tutar (KDV Har.)</th>
                   <th className="px-4 py-3 text-right">Brüt Kâr</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {filteredSales.map(sale => {
                   const subTotal = Number(sale.subTotal) || 0;
                   const saleCost = sale.items.reduce((s, i) => s + (Number(i.costPrice) * Number(i.quantity)), 0);
                   const saleProfit = subTotal - saleCost;
                   return (
                     <tr key={sale.id} className="hover:bg-slate-50">
                       <td className="px-4 py-3 text-slate-500">{new Date(sale.date).toLocaleDateString('tr-TR')}</td>
                       <td className="px-4 py-3 font-medium">{sale.customerName}</td>
                       <td className="px-4 py-3 text-slate-500 truncate max-w-xs">
                         {sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                       </td>
                       <td className="px-4 py-3 text-right font-mono text-slate-700">{subTotal.toLocaleString('tr-TR')} ₺</td>
                       <td className="px-4 py-3 text-right font-mono text-emerald-600 font-bold">+{saleProfit.toLocaleString('tr-TR')} ₺</td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* CONTENT: VAT REPORT (MONTHLY) */}
      {activeReport === 'VAT' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
             <strong>Bilgi:</strong> Bu rapor, geçmiş aylardaki KDV durumunuzu özetler. Pozitif bakiye o ay devlete ödenecek KDV'yi, negatif bakiye ise sonraki aya devreden KDV alacağını gösterir.
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
               Aylık KDV Dengesi
             </div>
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-600 font-semibold">
                 <tr>
                   <th className="px-6 py-4">Dönem (Ay/Yıl)</th>
                   <th className="px-6 py-4 text-right">Hesaplanan KDV (Satış)</th>
                   <th className="px-6 py-4 text-right">İndirilecek KDV (Alış*)</th>
                   <th className="px-6 py-4 text-right">KDV Dengesi</th>
                   <th className="px-6 py-4 text-center">Durum</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {vatReportData.map((data, idx) => (
                   <tr key={idx} className="hover:bg-slate-50">
                     <td className="px-6 py-4 font-mono font-bold text-slate-700">{data.month}</td>
                     <td className="px-6 py-4 text-right font-mono text-slate-600">{data.output.toLocaleString('tr-TR', {minimumFractionDigits: 2})} ₺</td>
                     <td className="px-6 py-4 text-right font-mono text-slate-600">{data.input.toLocaleString('tr-TR', {minimumFractionDigits: 2})} ₺</td>
                     <td className={`px-6 py-4 text-right font-bold font-mono ${data.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                         {Math.abs(data.balance).toLocaleString('tr-TR', {minimumFractionDigits: 2})} ₺
                     </td>
                     <td className="px-6 py-4 text-center">
                         {data.balance > 0 ? (
                             <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs font-bold">ÖDENECEK</span>
                         ) : (
                             <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">DEVREDEN</span>
                         )}
                     </td>
                   </tr>
                 ))}
                 {vatReportData.length === 0 && (
                     <tr><td colSpan={5} className="text-center p-8 text-slate-400">Veri bulunamadı.</td></tr>
                 )}
               </tbody>
             </table>
             <div className="p-4 text-xs text-slate-400 bg-slate-50 border-t border-slate-100">
                 * İndirilecek KDV, satılan malların maliyeti üzerinden %20 varsayılarak tahmini hesaplanmıştır. Gerçek muhasebe kaydı için fatura girişleri esas alınmalıdır.
             </div>
          </div>
        </div>
      )}

      {/* CONTENT: STOCK REPORT */}
      {activeReport === 'STOCK' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <p className="text-blue-800 text-sm font-medium">Toplam Stok Maliyeti (KDV Hariç)</p>
                <p className="text-2xl font-bold text-blue-900">{totalStockValueCost.toLocaleString('tr-TR')} ₺</p>
                <p className="text-xs text-blue-600 mt-1">* Ağırlıklı Ortalama Maliyete Göre</p>
             </div>
             <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl">
                <p className="text-purple-800 text-sm font-medium">Potansiyel Satış Değeri (KDV Hariç)</p>
                <p className="text-2xl font-bold text-purple-900">{totalStockValueSales.toLocaleString('tr-TR')} ₺</p>
                <p className="text-xs text-purple-600 mt-1">* Güncel Satış Fiyatlarına Göre</p>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
               Envanter Değerleme Listesi
             </div>
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-600 font-semibold">
                 <tr>
                   <th className="px-4 py-3">Ürün Kodu</th>
                   <th className="px-4 py-3">Ürün Adı</th>
                   <th className="px-4 py-3 text-center">Stok</th>
                   <th className="px-4 py-3 text-right">Ort. Maliyet</th>
                   <th className="px-4 py-3 text-right">Satış Fiyatı</th>
                   <th className="px-4 py-3 text-right">Toplam Maliyet Değeri</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {products.map(product => {
                     // Ensure safe access to properties
                     const pCode = product.code || '-';
                     const pName = product.name || 'İsimsiz Ürün';
                     const pStock = Number(product.stock) || 0;
                     const pCost = Number(product.costPrice) || 0;
                     const pPrice = Number(product.price) || 0;
                     
                     return (
                         <tr key={product.id} className="hover:bg-slate-50">
                           <td className="px-4 py-3 font-mono text-xs text-slate-700 font-bold">{pCode}</td>
                           <td className="px-4 py-3 font-medium text-slate-900">{pName}</td>
                           <td className="px-4 py-3 text-center text-slate-700">{pStock}</td>
                           <td className="px-4 py-3 text-right font-mono text-slate-600">{pCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                           <td className="px-4 py-3 text-right font-mono text-slate-600">{pPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                           <td className="px-4 py-3 text-right font-bold text-slate-800">{(pStock * pCost).toLocaleString('tr-TR')} ₺</td>
                         </tr>
                     );
                 })}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* CONTENT: CUSTOMER REPORT */}
      {activeReport === 'CUSTOMERS' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 print:hidden">
            <div className="flex items-center gap-2">
               <Filter size={18} className="text-slate-400" />
               <span className="text-sm font-medium text-slate-700">Rapor Türü:</span>
            </div>
            <select 
               className="bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
               value={customerReportMode}
               onChange={(e) => setCustomerReportMode(e.target.value as 'ALL' | 'SINGLE')}
            >
              <option value="ALL">Genel Cari Bakiye Listesi</option>
              <option value="SINGLE">Cari Ekstre (Detaylı)</option>
            </select>

            {customerReportMode === 'SINGLE' && (
              <select 
                className="bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-w-[200px]"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Müşteri Seçin --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {customerReportMode === 'ALL' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                 Tüm Müşteriler Toplam İşlem Hacmi (KDV Dahil)
               </div>
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-600 font-semibold">
                   <tr>
                     <th className="px-4 py-3">Cari Ünvan</th>
                     <th className="px-4 py-3">Tip</th>
                     <th className="px-4 py-3 text-right">Toplam Alış Tutarı</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                        <td className="px-4 py-3 text-slate-500">{c.type === 'CORPORATE' ? 'Kurumsal' : 'Bireysel'}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">{Number(c.totalPurchases).toLocaleString('tr-TR')} ₺</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          )}

          {customerReportMode === 'SINGLE' && (
            <>
              {selectedCustomerId ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 text-lg">{customers.find(c => c.id === selectedCustomerId)?.name}</span>
                        <span className="text-slate-500 text-sm ml-2">- Hesap Ekstresi</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(startDate).toLocaleDateString('tr-TR')} - {new Date(endDate).toLocaleDateString('tr-TR')}
                      </div>
                   </div>
                   
                   {getCustomerHistory(selectedCustomerId).length > 0 ? (
                     <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-600 font-semibold">
                         <tr>
                           <th className="px-4 py-3">Tarih</th>
                           <th className="px-4 py-3">İşlem No</th>
                           <th className="px-4 py-3">Açıklama / Ürünler</th>
                           <th className="px-4 py-3 text-right">Borç (Satış - KDV Dahil)</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {getCustomerHistory(selectedCustomerId).map(sale => (
                            <tr key={sale.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-500">{new Date(sale.date).toLocaleDateString('tr-TR')}</td>
                              <td className="px-4 py-3 text-xs font-mono">{sale.id}</td>
                              <td className="px-4 py-3 text-slate-600 truncate max-w-md">
                                {sale.items.length} Kalem Ürün ({sale.items.map(i => i.name).slice(0,2).join(', ')}...)
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-slate-800">{Number(sale.total).toLocaleString('tr-TR')} ₺</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-100 font-bold">
                             <td colSpan={3} className="px-4 py-3 text-right">Seçili Dönem Toplamı:</td>
                             <td className="px-4 py-3 text-right text-indigo-700">
                               {getCustomerHistory(selectedCustomerId).reduce((acc, s) => acc + Number(s.total), 0).toLocaleString('tr-TR')} ₺
                             </td>
                          </tr>
                       </tbody>
                     </table>
                   ) : (
                     <div className="p-8 text-center text-slate-400">Seçilen tarih aralığında işlem bulunamadı.</div>
                   )}
                </div>
              ) : (
                <div className="text-center p-10 text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
                  Lütfen raporunu görüntülemek istediğiniz cariyi seçiniz.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsView;