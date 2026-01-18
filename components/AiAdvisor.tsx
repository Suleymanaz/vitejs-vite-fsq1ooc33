import React, { useState } from 'react';
import { Product, Sale } from '../types';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { analyzeBusinessData } from '../services/geminiService';

interface AiAdvisorProps {
  products: Product[];
  sales: Sale[];
}

const AiAdvisor: React.FC<AiAdvisorProps> = ({ products, sales }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    {role: 'ai', content: 'Merhaba! Ben BulutERP yapay zeka asistanıyım. Stoklarınız, satışlarınız veya genel finansal durumunuz hakkında bana soru sorabilirsiniz.'}
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMsg = prompt;
    setPrompt('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // Prepare context data minimized to save tokens but provide info
    const context = JSON.stringify({
      totalProducts: products.length,
      criticalStockProducts: products.filter(p => p.stock <= p.minStockLevel).map(p => ({name: p.name, code: p.code})),
      recentSalesTotal: sales.reduce((acc, s) => acc + s.total, 0),
      salesCount: sales.length,
      topProducts: products.slice(0, 5).map(p => ({name: p.name, stock: p.stock, price: p.price}))
    });

    const response = await analyzeBusinessData(context, userMsg);

    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <Sparkles size={24} className="text-yellow-300" />
        </div>
        <div>
          <h2 className="font-bold text-lg">AI İş Zekası Asistanı</h2>
          <p className="text-indigo-100 text-xs">Gemini 3 Flash Preview tarafından desteklenmektedir</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
            }`}>
              {msg.role === 'ai' && (
                <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                  <Bot size={14} /> Asistan
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-3">
              <Loader2 className="animate-spin text-indigo-600" size={20} />
              <span className="text-slate-500 text-sm">Verileriniz analiz ediliyor...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Örn: Stokta azalan ürünler için ne yapmalıyım?"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !prompt.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 rounded-xl transition-colors flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAdvisor;
