import React, { useState } from 'react';
import { Product, User, UserRole } from '../types';
import { Plus, Search, AlertTriangle, Edit2, Trash2, Lock, ArrowDownCircle, Tag } from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  currentUser: User;
}

const InventoryView: React.FC<InventoryViewProps> = ({ products, addProduct, updateProduct, deleteProduct, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Forms - Using 'any' or union type for numbers to allow empty strings during typing
  const [productForm, setProductForm] = useState<{
    name: string;
    code: string;
    price: number | string;
    costPrice: number | string;
    stock: number | string;
    minStockLevel: number | string;
  }>({
    name: '', code: '', price: '', costPrice: '', stock: '', minStockLevel: ''
  });

  const [purchaseForm, setPurchaseForm] = useState<{
    productId: string;
    quantity: number | string;
    unitCost: number | string;
  }>({
    productId: '',
    quantity: '',
    unitCost: ''
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = [UserRole.ADMIN, UserRole.PURCHASING, UserRole.FINANCE].includes(currentUser.role);
  const canSeeCost = [UserRole.ADMIN, UserRole.PURCHASING, UserRole.FINANCE].includes(currentUser.role);
  const canDelete = currentUser.role === UserRole.ADMIN;

  // --- Product CRUD ---

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.code) return;
    
    // Ensure all numeric values are strictly Numbers before saving to state
    const safePrice = Number(productForm.price) || 0;
    const safeCost = Number(productForm.costPrice) || 0;
    const safeStock = Number(productForm.stock) || 0;
    const safeMinStock = Number(productForm.minStockLevel) || 0;

    if (editingProduct) {
      updateProduct({ 
        ...editingProduct, 
        name: productForm.name,
        code: productForm.code,
        price: safePrice,
        costPrice: safeCost,
        stock: safeStock,
        minStockLevel: safeMinStock
      } as Product);
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: productForm.name,
        code: productForm.code,
        price: safePrice,
        costPrice: safeCost,
        stock: safeStock,
        minStockLevel: safeMinStock
      };
      addProduct(newProduct);
    }
    closeProductModal();
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        code: product.code,
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        minStockLevel: product.minStockLevel
      });
    } else {
      setEditingProduct(null);
      // Initialize with empty strings for better UX (no leading zeros)
      setProductForm({ name: '', code: '', price: '', costPrice: '', stock: '', minStockLevel: '' });
    }
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => setIsProductModalOpen(false);

  // --- Purchase / Stock Entry Logic ---

  const openPurchaseModal = (product: Product) => {
    setEditingProduct(product);
    setPurchaseForm({
      productId: product.id,
      quantity: '', // Start empty
      unitCost: product.costPrice || '' // Show current cost but allow edit
    });
    setIsPurchaseModalOpen(true);
  };

  const closePurchaseModal = () => {
    setIsPurchaseModalOpen(false);
    setEditingProduct(null);
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const addedQty = Number(purchaseForm.quantity || 0);
    const newUnitCost = Number(purchaseForm.unitCost || 0);
    
    if (addedQty <= 0) {
        alert("Lütfen geçerli bir miktar giriniz.");
        return;
    }

    // Calculate new Weighted Average Cost
    // (Old Total Value + New Purchase Value) / Total New Stock
    const currentStock = Number(editingProduct.stock) || 0;
    const currentCost = Number(editingProduct.costPrice) || 0;
    
    const oldTotalValue = currentStock * currentCost;
    const newPurchaseValue = addedQty * newUnitCost;
    const totalNewStock = currentStock + addedQty;
    
    const newAverageCost = totalNewStock > 0 
      ? (oldTotalValue + newPurchaseValue) / totalNewStock 
      : newUnitCost;

    const updatedProduct: Product = {
      ...editingProduct,
      stock: totalNewStock,
      costPrice: Number(newAverageCost.toFixed(2)) // Store with 2 decimals
    };

    updateProduct(updatedProduct);
    closePurchaseModal();
    alert("Alım faturası işlendi, stok ve maliyet güncellendi.");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Stok Yönetimi</h2>
          <p className="text-slate-500">Ürünlerinizi ve stok seviyelerinizi buradan yönetin.</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => openProductModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} /> Yeni Ürün Tanımla
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Ürün adı veya ürün kodu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-slate-900 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Ürün Kodu</th>
                <th className="px-6 py-4">Ürün Adı</th>
                {canSeeCost && <th className="px-6 py-4">Maliyet (Ort.)</th>}
                <th className="px-6 py-4">Satış Fiyatı (KDV Har.)</th>
                <th className="px-6 py-4">Stok</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs font-bold">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{product.code}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                  {canSeeCost && (
                     <td className="px-6 py-4 text-slate-500">{Number(product.costPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                  )}
                  <td className="px-6 py-4 font-bold text-slate-700">{Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                  <td className="px-6 py-4 text-slate-700">{product.stock}</td>
                  <td className="px-6 py-4">
                    {product.stock <= product.minStockLevel ? (
                      <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit text-xs font-medium">
                        <AlertTriangle size={14} /> Kritik
                      </span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium">Yeterli</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <button 
                          onClick={() => openPurchaseModal(product)}
                          title="Alım Faturası / Stok Girişi"
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                        >
                           <ArrowDownCircle size={14} /> Alım Yap
                        </button>
                      )}
                      
                      {canEdit && (
                        <button 
                          onClick={() => openProductModal(product)}
                          title="Ürün Bilgilerini Düzenle"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      
                      {canDelete ? (
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          title="Sil"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                         !canEdit && <span className="text-xs text-slate-300">Yetki Yok</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Kayıtlı ürün bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit/Create Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Ürün Kartını Düzenle' : 'Yeni Ürün Tanımla'}</h3>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ürün Kodu</label>
                  <input 
                    required
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                    value={productForm.code}
                    onChange={e => setProductForm({...productForm, code: e.target.value.toUpperCase()})}
                    placeholder="Örn: URN-001"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ürün Adı</label>
                  <input 
                    required
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={productForm.name}
                    onChange={e => setProductForm({...productForm, name: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Satış Fiyatı (KDV Hariç) ₺</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={productForm.price}
                    onChange={e => setProductForm({...productForm, price: e.target.value})}
                    placeholder="0.00"
                  />
              </div>
              
              {!editingProduct && (
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Başlangıç Stok Bilgileri</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Maliyet (₺)</label>
                        <input 
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full bg-white text-slate-900 border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={productForm.costPrice}
                          onChange={e => setProductForm({...productForm, costPrice: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Açılış Stoğu</label>
                        <input 
                          type="number"
                          min="0"
                          className="w-full bg-white text-slate-900 border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={productForm.stock}
                          onChange={e => setProductForm({...productForm, stock: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                    </div>
                 </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kritik Stok Seviyesi</label>
                <input 
                  type="number"
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={productForm.minStockLevel}
                  onChange={e => setProductForm({...productForm, minStockLevel: e.target.value})}
                  placeholder="5"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={closeProductModal}
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

      {/* Purchase / Stock Entry Modal */}
      {isPurchaseModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
             <div className="flex items-center gap-3 mb-4 text-emerald-700">
               <ArrowDownCircle size={28} />
               <h3 className="text-xl font-bold">Alım Faturası Girişi</h3>
             </div>
             <p className="text-sm text-slate-600 mb-4">
               <span className="font-semibold text-slate-900">{editingProduct.name}</span> için stok girişi yapıyorsunuz.
             </p>

             <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Alınan Miktar</label>
                   <input 
                     type="number"
                     min="1"
                     required
                     className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                     value={purchaseForm.quantity}
                     onChange={e => setPurchaseForm({...purchaseForm, quantity: e.target.value})}
                     placeholder="0"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Birim Alış Fiyatı (KDV Hariç) ₺</label>
                   <input 
                     type="number"
                     min="0.01"
                     step="0.01"
                     required
                     className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                     value={purchaseForm.unitCost}
                     onChange={e => setPurchaseForm({...purchaseForm, unitCost: e.target.value})}
                     placeholder="0.00"
                   />
                   <p className="text-[10px] text-slate-400 mt-1">
                     * Bu işlem, ürünün ağırlıklı ortalama maliyetini güncelleyecektir.
                   </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    type="button"
                    onClick={closePurchaseModal}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Stok Ekle
                  </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
