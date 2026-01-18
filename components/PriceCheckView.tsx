import React, { useState } from 'react';
import { Product } from '../types';
import { Search, Tag } from 'lucide-react';

interface PriceCheckViewProps {
  products: Product[];
}

const PriceCheckView: React.FC<PriceCheckViewProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fiyat Gör</h2>
          <p className="text-slate-500">Ürünlerin KDV dahil satış fiyatlarını hızlıca sorgulayın.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text"
              placeholder="Ürün adı veya kodu ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-slate-900 pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Ürün Kodu</th>
                <th className="px-6 py-4">Ürün Adı</th>
                <th className="px-6 py-4 text-center">Stok</th>
                <th className="px-6 py-4 text-right">Fiyat (KDV Hariç)</th>
                <th className="px-6 py-4 text-right">KDV (%20)</th>
                <th className="px-6 py-4 text-right bg-indigo-50/50 text-indigo-900">Satış Fiyatı (KDV Dahil)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const vatAmount = product.price * 0.20;
                const inclusivePrice = product.price * 1.20;
                
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm font-bold">
                      <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{product.code}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 text-lg">{product.name}</td>
                    <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-bold ${product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {product.stock}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-500">
                        {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400 text-sm">
                        {vatAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </td>
                    <td className="px-6 py-4 text-right bg-indigo-50/30 group-hover:bg-indigo-50/80 transition-colors">
                        <div className="font-bold text-2xl text-indigo-700">
                           {inclusivePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                        <Tag size={48} className="mb-2 opacity-20" />
                        <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceCheckView;
