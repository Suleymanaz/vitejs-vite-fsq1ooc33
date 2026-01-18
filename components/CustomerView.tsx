import React, { useState } from 'react';
import { Customer, Sale } from '../types';
import { Users, Plus, Search, MapPin, ShoppingBag } from 'lucide-react';

interface CustomerViewProps {
  customers: Customer[];
  sales: Sale[];
  addCustomer: (c: Customer) => void;
}

const CustomerView: React.FC<CustomerViewProps> = ({ customers, sales, addCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '', type: 'INDIVIDUAL', taxNumber: '', contactInfo: ''
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: formData.name!,
      type: formData.type as 'INDIVIDUAL' | 'CORPORATE',
      taxNumber: formData.taxNumber,
      contactInfo: formData.contactInfo || '',
      totalPurchases: 0
    };
    
    addCustomer(newCustomer);
    setFormData({ name: '', type: 'INDIVIDUAL', taxNumber: '', contactInfo: '' });
    setIsModalOpen(false);
  };

  const getCustomerSales = (customerId: string) => {
    return sales.filter(s => s.customerId === customerId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cari Yönetimi</h2>
          <p className="text-slate-500">Müşterilerinizi yönetin ve satış geçmişlerini görüntüleyin.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Yeni Cari Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Cari adı, VKN veya TC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-slate-900 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0">
                <tr>
                  <th className="px-6 py-4">Cari Adı / Ünvan</th>
                  <th className="px-6 py-4">Tip</th>
                  <th className="px-6 py-4">İletişim</th>
                  <th className="px-6 py-4 text-right">Toplam Alım</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(customer => (
                  <tr 
                    key={customer.id} 
                    onClick={() => setSelectedCustomer(customer)}
                    className={`cursor-pointer transition-colors ${selectedCustomer?.id === customer.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {customer.type === 'CORPORATE' ? 'Kurumsal' : 'Bireysel'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-[150px]">{customer.contactInfo}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">
                      {sales.filter(s => s.customerId === customer.id).reduce((acc, s) => acc + s.total, 0).toLocaleString('tr-TR')} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Detail & History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          {selectedCustomer ? (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {selectedCustomer.name.substring(0,2).toUpperCase()}
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-slate-800">{selectedCustomer.name}</h3>
                     <p className="text-xs text-slate-500 uppercase tracking-wide">{selectedCustomer.type === 'CORPORATE' ? 'Kurumsal Cari' : 'Bireysel Cari'}</p>
                   </div>
                </div>
                <div className="space-y-1 text-sm text-slate-600 mt-4">
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {selectedCustomer.contactInfo || 'Adres bilgisi yok'}</p>
                  <p className="text-xs text-slate-400">Vergi/TC No: {selectedCustomer.taxNumber || '-'}</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-0">
                <div className="p-4 bg-white sticky top-0 border-b border-slate-100">
                   <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                     <ShoppingBag size={16} /> Satış Geçmişi
                   </h4>
                </div>
                {getCustomerSales(selectedCustomer.id).length > 0 ? (
                  <div className="divide-y divide-slate-100">
                     {getCustomerSales(selectedCustomer.id).map(sale => (
                       <div key={sale.id} className="p-4 hover:bg-slate-50">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-mono text-slate-400">{new Date(sale.date).toLocaleDateString('tr-TR')}</span>
                            <span className="font-bold text-indigo-600">{sale.total.toLocaleString('tr-TR')} ₺</span>
                          </div>
                          <div className="space-y-1">
                            {sale.items.map((item, idx) => (
                              <div key={idx} className="text-sm text-slate-600 flex justify-between">
                                <span>{item.quantity}x {item.name}</span>
                              </div>
                            ))}
                          </div>
                          {sale.isInvoiced && (
                            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Faturalı</span>
                          )}
                       </div>
                     ))}
                  </div>
                ) : (
                   <div className="p-8 text-center text-slate-400 text-sm">Bu müşteriye ait satış kaydı bulunamadı.</div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
               <Users size={48} className="mb-4 opacity-20" />
               <p>Detaylarını görüntülemek için listeden bir müşteri seçin.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Yeni Cari Ekle</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cari Adı / Ünvanı</label>
                <input 
                  required
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cari Tipi</label>
                <select 
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="INDIVIDUAL">Bireysel</option>
                  <option value="CORPORATE">Kurumsal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">TC / Vergi No</label>
                <input 
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.taxNumber}
                  onChange={e => setFormData({...formData, taxNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adres / İletişim</label>
                <textarea 
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                  value={formData.contactInfo}
                  onChange={e => setFormData({...formData, contactInfo: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;