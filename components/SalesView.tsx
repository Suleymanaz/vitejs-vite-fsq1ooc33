import React, { useState } from 'react';
import { Product, CartItem, Sale, Customer } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, UserPlus, Users, Wrench } from 'lucide-react';

interface SalesViewProps {
  products: Product[];
  customers: Customer[];
  createSale: (sale: Sale) => void;
  goToCustomerCreation: () => void;
}

const SalesView: React.FC<SalesViewProps> = ({ products, customers, createSale, goToCustomerCreation }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [searchProduct, setSearchProduct] = useState('');
  
  // Service Item Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState<{name: string, price: number | string}>({ name: '', price: '' });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Bu ürün stokta kalmadı!");
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, isService: false }];
    });
  };

  const addServiceItem = () => {
    const priceVal = Number(serviceForm.price || 0);
    if (!serviceForm.name || priceVal <= 0) return;
    
    const serviceItem: CartItem = {
      id: `svc-${Date.now()}`,
      code: 'HIZMET',
      name: serviceForm.name,
      price: priceVal, // KDV Hariç Fiyat girildiğini varsayıyoruz
      costPrice: 0, // Hizmet maliyeti muhasebesel olarak farklıdır, burada 0 alalım
      stock: 9999, // Sınırsız
      minStockLevel: 0,
      quantity: 1,
      isService: true
    };

    setCart(prev => [...prev, serviceItem]);
    setServiceForm({ name: '', price: '' });
    setIsServiceModalOpen(false);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        // Stock check only for non-service items
        if (!item.isService) {
           const originalProduct = products.find(p => p.id === id);
           if (originalProduct && newQty > originalProduct.stock) return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // Calculations with safe Number conversion
  const subTotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const taxTotal = subTotal * 0.20; // %20 KDV
  const grandTotal = subTotal + taxTotal;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Fallback if customer ID is not selected or invalid
    let targetCustomerId = selectedCustomerId;
    if (!customers.find(c => c.id === targetCustomerId)) {
        if (customers.length > 0) {
            targetCustomerId = customers[0].id;
        } else {
            alert("Lütfen önce bir cari/müşteri tanımlayınız.");
            return;
        }
    }
    
    const customer = customers.find(c => c.id === targetCustomerId);

    const newSale: Sale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: cart.map(item => ({
          ...item,
          price: Number(item.price || 0), // Ensure strict number
          quantity: Number(item.quantity || 1) // Ensure strict number
      })),
      subTotal: Number(subTotal),
      taxTotal: Number(taxTotal),
      total: Number(grandTotal),
      customerId: targetCustomerId,
      customerName: customer ? customer.name : 'Bilinmeyen Müşteri',
      isInvoiced: false
    };

    createSale(newSale);
    setCart([]);
    
    // Reset to retail customer if exists
    const retail = customers.find(c => c.name.includes('PERAKENDE'));
    if (retail) setSelectedCustomerId(retail.id);
    
    alert("Satış başarıyla tamamlandı!");
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.code.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 relative">
      {/* Product Catalog */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-end">
           <div>
              <h2 className="text-2xl font-bold text-slate-800">Satış Ekranı</h2>
              <p className="text-slate-500">Stoklu ürün veya işçilik hizmeti ekleyin.</p>
           </div>
           <button 
             onClick={() => setIsServiceModalOpen(true)}
             className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
           >
             <Wrench size={18} /> İşçilik / Hizmet Ekle
           </button>
        </div>
        
        <input 
          type="text"
          placeholder="Ürün adı veya kodu ile ara..."
          className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          value={searchProduct}
          onChange={e => setSearchProduct(e.target.value)}
        />

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4 pr-2">
          {filteredProducts.map(product => {
             const price = Number(product.price) || 0;
             const inclusivePrice = price * 1.20;
             return (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                  product.stock === 0 ? 'opacity-50 pointer-events-none border-slate-100' : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">{product.code}</span>
                  <span className={`text-xs font-bold ${product.stock < 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {product.stock} Adet
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 line-clamp-1">{product.name}</h3>
                <div className="mt-1">
                  <p className="text-amber-600 font-bold text-lg">{inclusivePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
                  <p className="text-[10px] text-slate-400">KDV Dahil</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart / POS Panel */}
      <div className="w-96 bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <ShoppingCart size={20} /> Sepet
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-slate-400 py-10 flex flex-col items-center">
              <ShoppingCart size={48} className="mb-2 opacity-20" />
              <p>Sepet henüz boş.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={`flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm ${item.isService ? 'border-amber-200 bg-amber-50' : 'border-slate-100'}`}>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-800 line-clamp-1">
                    {item.isService && <Wrench size={10} className="inline mr-1 text-amber-600"/>}
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {Number(item.price).toLocaleString('tr-TR')} ₺ + KDV x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-rose-400 hover:text-rose-600 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Müşteri Seçimi</label>
              <button 
                onClick={goToCustomerCreation}
                className="text-xs text-amber-600 font-bold flex items-center gap-1 hover:underline"
              >
                <UserPlus size={12} /> Yeni Cari
              </button>
            </div>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-white text-slate-900 border border-slate-300 px-4 py-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-2 py-2 border-t border-slate-200">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Ara Toplam (KDV Hariç)</span>
              <span>{subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 font-medium">
              <span>Toplam KDV (%20)</span>
              <span>{taxTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-800 pt-2 border-t border-slate-200/50">
              <span>Genel Toplam</span>
              <span className="text-amber-600">{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle size={20} /> Satışı Tamamla
          </button>
        </div>
      </div>

      {/* Service Item Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Wrench className="text-amber-600" /> İşçilik / Hizmet Ekle
            </h3>
            <p className="text-sm text-slate-500 mb-4">Stok takibi yapılmayan hizmet kalemi ekleyin.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hizmet Adı / Açıklama</label>
                <input 
                  autoFocus
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={serviceForm.name}
                  onChange={e => setServiceForm({...serviceForm, name: e.target.value})}
                  placeholder="Örn: Montaj Hizmeti"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fiyat (KDV Hariç) ₺</label>
                <input 
                  type="number"
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={serviceForm.price}
                  onChange={e => setServiceForm({...serviceForm, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsServiceModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={addServiceItem}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
