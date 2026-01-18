import React, { useState } from 'react';
import { Sale, Invoice } from '../types';
import { FileText, Printer, CheckCircle, Eye, X, List, Trash2, ArrowLeft } from 'lucide-react';
// import { generateInvoiceNote } from '../services/geminiService'; // No longer needed

interface InvoiceViewProps {
  sales: Sale[];
  invoices: Invoice[];
  createInvoice: (invoice: Invoice) => void;
  cancelSale?: (saleId: string) => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ sales, invoices, createInvoice, cancelSale }) => {
  const [loading, setLoading] = useState(false);
  // const [aiNote, setAiNote] = useState<string>(''); // Removed
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  
  // Sale Details Modal State
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const handleCreateInvoice = async (sale: Sale) => {
    setLoading(true);
    
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      saleId: sale.id,
      invoiceNumber: `GIB2024${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      total: Number(sale.total),
      taxTotal: Number(sale.taxTotal),
      status: 'SIGNED'
    };

    // AI Note generation removed for performance/no-api usage
    // const itemNames = sale.items.map(i => i.name).join(', ');
    // const note = await generateInvoiceNote(sale.customerName, itemNames, sale.total);
    // setAiNote(note);

    createInvoice(newInvoice);
    setLoading(false);
    
    // Auto show preview
    setPreviewInvoice(newInvoice);
  };

  const handleCancelSale = (saleId: string) => {
      if (confirm("Bu satışı iptal etmek istediğinize emin misiniz? Stoklar geri yüklenecektir.")) {
          cancelSale?.(saleId);
      }
  };

  const getSaleForInvoice = (invoice: Invoice) => {
    return sales.find(s => s.id === invoice.saleId);
  };

  const uninvoicedSales = sales.filter(s => !s.isInvoiced).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const invoiceList = invoices.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">E-Arşiv Fatura Entegrasyonu</h2>
          <p className="text-slate-500">Satışlarınızı resmileştirin ve GİB uyumlu e-arşiv faturalar oluşturun.</p>
        </div>
        <div className="hidden md:block opacity-100 text-slate-700">
           {/* Text Logo for Header */}
           <h1 className="text-2xl font-black tracking-widest text-slate-400">MERVOLT</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
            <h3 className="font-semibold text-amber-900">Faturalandırılacak Satışlar</h3>
            <span className="bg-amber-200 text-amber-900 text-xs px-2 py-1 rounded-full font-bold">{uninvoicedSales.length} Bekleyen</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
             {uninvoicedSales.length === 0 ? (
               <div className="p-8 text-center text-slate-400">Bekleyen satış yok.</div>
             ) : (
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-600 font-semibold">
                   <tr>
                     <th className="px-4 py-3">Tarih</th>
                     <th className="px-4 py-3">Müşteri</th>
                     <th className="px-4 py-3 text-right">Tutar</th>
                     <th className="px-4 py-3 text-right">İşlemler</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {uninvoicedSales.map(sale => (
                     <tr key={sale.id} className="hover:bg-slate-50">
                       <td className="px-4 py-3 text-slate-500">{new Date(sale.date).toLocaleDateString('tr-TR')}</td>
                       <td className="px-4 py-3 font-medium text-slate-800">{sale.customerName}</td>
                       <td className="px-4 py-3 text-right font-mono text-slate-900 font-bold">{Number(sale.total).toLocaleString('tr-TR')} ₺</td>
                       <td className="px-4 py-3 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => setViewingSale(sale)}
                                className="text-slate-500 hover:text-amber-600 p-1.5 hover:bg-amber-50 rounded"
                                title="Detay Görüntüle"
                            >
                                <List size={16} />
                            </button>
                            <button 
                                onClick={() => handleCancelSale(sale.id)}
                                className="text-slate-500 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded"
                                title="Satışı İptal Et"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button 
                                onClick={() => handleCreateInvoice(sale)}
                                disabled={loading}
                                className="text-amber-800 hover:text-white font-bold text-xs border border-amber-200 bg-amber-100 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-all"
                            >
                                {loading ? '...' : 'Fatura Kes'}
                            </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
             <h3 className="font-semibold text-slate-700">Oluşturulan Faturalar</h3>
             <FileText className="text-slate-400" size={20} />
          </div>
          <div className="max-h-[400px] overflow-y-auto">
             {invoiceList.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Henüz fatura oluşturulmadı.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Fatura No</th>
                      <th className="px-4 py-3">Tarih</th>
                      <th className="px-4 py-3 text-right">Tutar</th>
                      <th className="px-4 py-3 text-center">Durum</th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoiceList.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-slate-600 text-xs">{inv.invoiceNumber}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(inv.date).toLocaleDateString('tr-TR')}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-700">{Number(inv.total).toLocaleString('tr-TR')} ₺</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            <CheckCircle size={10} /> İmzalandı
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => setPreviewInvoice(inv)}
                            className="text-slate-400 hover:text-amber-600 p-1 transition-colors"
                            title="Görüntüle / Yazdır"
                          >
                            <Printer size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {viewingSale && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                      <h3 className="text-lg font-bold text-slate-800">Satış Detayları</h3>
                      <button onClick={() => setViewingSale(null)} className="p-1 text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="text-slate-500">Müşteri:</span> <span className="font-semibold block">{viewingSale.customerName}</span></div>
                          <div><span className="text-slate-500">Tarih:</span> <span className="font-semibold block">{new Date(viewingSale.date).toLocaleString('tr-TR')}</span></div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-3">
                          <table className="w-full text-sm">
                              <thead>
                                  <tr className="text-xs text-slate-500 text-left border-b border-slate-200">
                                      <th className="pb-2">Ürün</th>
                                      <th className="pb-2 text-center">Adet</th>
                                      <th className="pb-2 text-right">Fiyat</th>
                                      <th className="pb-2 text-right">Toplam</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                  {viewingSale.items.map((item, idx) => (
                                      <tr key={idx}>
                                          <td className="py-2 text-slate-700">{item.name}</td>
                                          <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                                          <td className="py-2 text-right text-slate-600">{Number(item.price).toLocaleString('tr-TR')} ₺</td>
                                          <td className="py-2 text-right font-medium text-slate-800">{(Number(item.price) * Number(item.quantity)).toLocaleString('tr-TR')} ₺</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-100">
                          <div className="text-right">
                              <p className="text-sm text-slate-500">Genel Toplam</p>
                              <p className="text-xl font-bold text-amber-600">{Number(viewingSale.total).toLocaleString('tr-TR')} ₺</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Invoice Template Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white w-full max-w-4xl min-h-[800px] shadow-2xl rounded-sm flex flex-col animate-in zoom-in-95 duration-200 relative">
              
              {/* Modal Header - Fixed at Top */}
              <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 print:hidden sticky top-0 z-10">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2">
                   <Eye size={18} /> Fatura Önizleme
                 </h3>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setPreviewInvoice(null)} 
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm font-medium px-3 py-1.5 rounded hover:bg-slate-200 transition-colors"
                    >
                      <ArrowLeft size={16} /> Geri Dön
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-700 transition-colors shadow-sm">
                      <Printer size={16} /> Yazdır
                    </button>
                    <button onClick={() => setPreviewInvoice(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <X size={20} />
                    </button>
                 </div>
              </div>

              {/* Invoice Document (A4 Ratio) */}
              <div className="flex-1 p-12 text-slate-900 font-sans print:p-0" id="invoice-template">
                 {/* Header */}
                 <div className="flex justify-between items-start mb-12">
                    <div>
                       {/* Brand Text for Invoice */}
                       <h1 className="text-4xl font-black tracking-widest text-slate-800 mb-4">MERVOLT</h1>
                       <div className="text-xs text-slate-500 space-y-1">
                          <p className="font-bold text-slate-800 text-sm">MERVOLT ELEKTRİK A.Ş.</p>
                          <p>Organize Sanayi Bölgesi 1. Cadde No:5</p>
                          <p>Başakşehir / İSTANBUL</p>
                          <p>Tel: +90 212 555 00 00</p>
                          <p>Web: www.mervolt.com.tr</p>
                          <p>Mersis: 012345678900001</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">E-ARŞİV FATURA</h1>
                       <div className="inline-block text-left bg-slate-50 p-4 rounded border border-slate-100">
                          <div className="flex justify-between gap-8 mb-1">
                             <span className="text-xs font-bold text-slate-500">Fatura No:</span>
                             <span className="text-xs font-mono font-bold text-slate-900">{previewInvoice.invoiceNumber}</span>
                          </div>
                          <div className="flex justify-between gap-8 mb-1">
                             <span className="text-xs font-bold text-slate-500">Tarih:</span>
                             <span className="text-xs font-mono text-slate-900">{new Date(previewInvoice.date).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex justify-between gap-8">
                             <span className="text-xs font-bold text-slate-500">ETTN:</span>
                             <span className="text-[10px] font-mono text-slate-400">f47ac10b-58cc-4372-a567-0e02b2c3d479</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Customer Info */}
                 <div className="mb-12 border-l-4 border-amber-500 pl-4 py-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Sayın</h4>
                    <h2 className="text-xl font-bold text-slate-800">
                      {getSaleForInvoice(previewInvoice)?.customerName || 'Müşteri'}
                    </h2>
                    <p className="text-sm text-slate-600 mt-1 max-w-md">
                      Müşteri adres bilgisi sistemde kayıtlı adresine gönderilmiştir.
                      Vergi No: 1234567890
                    </p>
                 </div>

                 {/* Items Table */}
                 <table className="w-full mb-8 table-fixed">
                    <thead className="border-b-2 border-slate-800">
                       <tr>
                          <th className="w-1/2 py-2 text-left text-xs font-bold text-slate-800 uppercase">Açıklama</th>
                          <th className="w-1/6 py-2 text-center text-xs font-bold text-slate-800 uppercase">Miktar</th>
                          <th className="w-1/6 py-2 text-right text-xs font-bold text-slate-800 uppercase">Birim Fiyat</th>
                          <th className="w-1/12 py-2 text-right text-xs font-bold text-slate-800 uppercase">KDV</th>
                          <th className="w-1/6 py-2 text-right text-xs font-bold text-slate-800 uppercase">Tutar</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                       {getSaleForInvoice(previewInvoice)?.items.map((item, idx) => {
                          const qty = Number(item.quantity) || 0;
                          const price = Number(item.price) || 0;
                          const lineTotal = qty * price;
                          
                          return (
                            <tr key={idx}>
                               <td className="py-3 text-sm font-medium text-slate-700">{item.name}</td>
                               <td className="py-3 text-center text-sm font-mono text-slate-900">{qty}</td>
                               <td className="py-3 text-right text-sm font-mono text-slate-900">{price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                               <td className="py-3 text-right text-sm font-mono text-slate-500">%20</td>
                               <td className="py-3 text-right text-sm font-bold font-mono text-slate-900">{lineTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>

                 {/* Totals */}
                 <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-2">
                       <div className="flex justify-between text-sm text-slate-600">
                          <span>Ara Toplam:</span>
                          <span className="font-mono text-slate-900">{(Number(previewInvoice.total) / 1.20).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                       </div>
                       <div className="flex justify-between text-sm text-slate-600">
                          <span>Toplam KDV (%20):</span>
                          <span className="font-mono text-slate-900">{Number(previewInvoice.taxTotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                       </div>
                       <div className="flex justify-between text-lg font-bold text-slate-900 border-t-2 border-slate-800 pt-2 mt-2">
                          <span>Genel Toplam:</span>
                          <span className="font-mono text-slate-900">{Number(previewInvoice.total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                       </div>
                    </div>
                 </div>

                 {/* Footer & Signature */}
                 <div className="mt-auto pt-8 border-t border-slate-200 flex justify-between items-end">
                    <div className="text-[10px] text-slate-400">
                       <p>Bu belge 5070 sayılı Elektronik İmza Kanunu kapsamında imzalanmıştır.</p>
                       <p>Mersis No: 012345678900001</p>
                       <p>Mervolt Elektrik A.Ş. | BulutERP System Generated</p>
                    </div>
                    <div className="text-center">
                       <div className="h-16 w-32 mb-2 flex items-center justify-center opacity-50">
                          <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiPjx0ZXh0IHg9IjAiIHk9IjMwIiBmb250LWZhbWlseT0iQ3Vyc2l2ZSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMyI+RWltemE8L3RleHQ+PC9zdmc+" alt="İmza" />
                       </div>
                       <p className="text-xs font-bold text-slate-700">Mervolt Elektrik A.Ş.</p>
                       <p className="text-[10px] text-slate-500">Elektronik İmzalıdır</p>
                    </div>
                 </div>
              </div>

               {/* Modal Footer Actions - Bottom Close Button */}
               <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center print:hidden">
                  <button 
                      onClick={() => setPreviewInvoice(null)} 
                      className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all shadow-lg transform hover:scale-105"
                    >
                      <X size={20} /> ÖNİZLEMEYİ KAPAT
                  </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceView;