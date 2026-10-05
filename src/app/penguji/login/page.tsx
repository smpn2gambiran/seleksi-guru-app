'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PengujiLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay
    setTimeout(() => {
      const u = username.toLowerCase();
      
      // Simple hardcoded auth for evaluators
      const validUsers = ['budi', 'lukman', 'charisma'];
      
      if (validUsers.includes(u) && password === 'guru2026') {
        router.push(`/penguji/${u}`);
      } else {
        setError('Username atau password salah! (Hint: charisma / guru2026)');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">Portal Penguji</h1>
          <p className="text-indigo-200 text-sm mt-2 font-medium">Sistem Seleksi Guru & Tenaga Kependidikan</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username Penguji</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium"
                placeholder="cth: charisma"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-8 py-4 rounded-xl font-black text-white tracking-wide transition-all shadow-lg ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 hover:-translate-y-0.5'}`}
          >
            {loading ? 'MEMVERIFIKASI...' : 'MASUK KE RUANG UJIAN'}
          </button>
        </form>
      </div>
    </div>
  );
}
