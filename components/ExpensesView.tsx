import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { Plus, Search, Trash2, TrendingDown, Calendar, Wallet } from 'lucide-react';

interface ExpensesViewProps {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, addExpense, deleteExpense }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const [formData, setFormData] = useState<{
    description: string;
    amount: string;
    category: ExpenseCategory;
    date: string;
    paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER';
  }>({
    description: '',
    amount: '',
    category: 'OTHER',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER'
  });

  const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    RENT: 'Kira Ödemesi',
    UTILITIES: 'Fatura (Elektrik/Su/İnternet)',
    SALARY: 'Personel Maaş/Avans',
    MEAL: 'Yemek/Mutfak',
    TAX: 'Vergi/SGK Ödemesi',
    MARKETING: 'Reklam & Pazarlama',
    OTHER: 'Diğer Giderler'
  };

  const filteredExpenses = expenses
    .filter(e => 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === 'ALL' || e.category === filterCategory)
    )
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: formData.description,
      amount: Number(formData.amount),
      category: formData.category,
      date: formData.date,
      paymentMethod: formData.paymentMethod
    };

    addExpense(newExpense);
    setIsModalOpen(false);
    setFormData({
      description: '',
      amount: '',
      category: 'OTHER',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'BANK_TRANSFER'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gider Yönetimi</h2>
          <p className="text-slate-500">Operasyonel masraflarınızı takip edin.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Yeni Masraf Ekle
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
               <TrendingDown size={32} />
            </div>
            <div>
               <p className="text-sm font-medium text-slate-500">Görüntülenen Toplam Gider</p>
               <h3 className="text-3xl font-bold text-slate-800">{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</h3>
            </div>
         </div>
         <div className="text-right hidden md:block">
            <p className="text-xs text-slate-400">Son 30 günde eklenen kayıtlar listelenmektedir.</p>
         </div>
      </div>

      {/* Filters & List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Gider açıklaması ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-slate-900 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <select 
            className="bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="ALL">Tüm Kategoriler</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Açıklama</th>
                <th className="px-6 py-4">Ödeme Yöntemi</th>
                <th className="px-6 py-4 text-right">Tutar</th>
                <th className="px-6 py-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono">
                     <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(expense.date).toLocaleDateString('tr-TR')}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 font-medium">
                       {CATEGORY_LABELS[expense.category]}
                     </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{expense.description}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                     {expense.paymentMethod === 'BANK_TRANSFER' ? 'Havale/EFT' : expense.paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı' : 'Nakit'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-rose-600">
                    -{expense.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => {
                        if(confirm('Bu masraf kaydını silmek istediğinize emin misiniz?')) {
                          deleteExpense(expense.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                        <Wallet size={48} className="mb-2 opacity-20" />
                        <p>Kayıtlı gider bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-700">
               <TrendingDown size={24} /> Yeni Masraf Ekle
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                <input 
                  required
                  autoFocus
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Örn: Ekim Ayı Ofis Kirası"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tutar (₺)</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
                    <input 
                      type="date"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                    <select 
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})}
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ödeme Yöntemi</label>
                    <select 
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none"
                      value={formData.paymentMethod}
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}
                    >
                      <option value="BANK_TRANSFER">Havale/EFT</option>
                      <option value="CREDIT_CARD">Kredi Kartı</option>
                      <option value="CASH">Nakit</option>
                    </select>
                 </div>
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-lg shadow-rose-200"
                >
                  Masrafı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;