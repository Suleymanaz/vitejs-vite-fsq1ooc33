import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // MVP Mode: Instant login without artificial delay
    const foundUser = users.find(u => 
      u.name.toLowerCase().includes(username.toLowerCase()) || 
      // Mapping for standard system users
      (username === 'admin' && u.role === 'ADMIN') ||
      (username === 'satis' && u.role === 'SALES') ||
      (username === 'finans' && u.role === 'FINANCE') ||
      ((username === 'satinalma' || username === 'depo') && u.role === 'PURCHASING')
    );

    if (foundUser && password === '1234') {
      onLogin(foundUser);
    } else {
      setError('Kullanıcı adı veya şifre hatalı.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden min-h-[600px] animate-in fade-in zoom-in duration-300">
        
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center relative">
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-widest text-slate-900 mb-2">MERVOLT</h1>
            <p className="text-slate-500 font-medium">Kurumsal Kaynak Planlama</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kullanıcı Adı</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  required
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password"
                  required
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Oturum Aç'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
          
          <div className="mt-8 text-center bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1">
              Sistem Kullanıcıları (Varsayılan Şifre: 1234)
            </p>
            <div className="flex justify-center gap-2 flex-wrap text-xs text-slate-700">
              <span className="bg-slate-200 px-2 py-1 rounded">admin</span>
              <span className="bg-slate-200 px-2 py-1 rounded">satis</span>
              <span className="bg-slate-200 px-2 py-1 rounded">finans</span>
              <span className="bg-slate-200 px-2 py-1 rounded">satinalma</span>
            </div>
          </div>
          
          <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-slate-300">
            © 2024 Mervolt Elektrik A.Ş. Tüm hakları saklıdır.
          </p>
        </div>

        {/* Right Side - Visual / Branding */}
        <div className="hidden md:flex w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-slate-900/50 z-10"></div>
          {/* Abstract Grid Background */}
          <div className="absolute inset-0 opacity-10" 
               style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px'}}>
          </div>
          
          <div className="relative z-20 text-center px-8">
            <div className="w-24 h-24 bg-amber-500 rounded-2xl mx-auto mb-8 rotate-12 shadow-2xl flex items-center justify-center">
               <span className="text-4xl font-black text-slate-900">M</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">İşinizi Geleceğe Taşıyın</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Stok takibi, satış yönetimi ve e-arşiv fatura işlemleriniz tek bir platformda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;