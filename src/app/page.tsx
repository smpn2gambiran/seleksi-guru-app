'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        router.push(data.redirect);
      } else {
        setError(data.error || 'Kredensial tidak valid');
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f1f5f9] selection:bg-indigo-500/20">
      {/* Soft Pastel Aurora Background */}
      <div className="aurora-bg"></div>
      
      <div className="w-full max-w-md px-6 z-10 animate-fade-in-up">
        {/* Header / Logo */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-24 h-24 mb-6 relative drop-shadow-xl hover:scale-105 transition-transform duration-500">
            <Image 
              src="/logo-sekolah.png" 
              alt="Logo SMPN 2 Gambiran" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2">Portal Seleksi</h1>
          <p className="text-[11px] text-slate-500 font-semibold tracking-[0.2em] uppercase">SMPN 2 Gambiran</p>
        </div>

        {/* Login Form */}
        <div className="premium-card rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{error}</div>}
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Username / NIK</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan identitas..." 
                className="premium-input w-full px-4 py-3 rounded-xl outline-none text-sm font-medium"
                required
              />
            </div>
            
            <div className="space-y-2 text-left pb-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Password Kredensial</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="premium-input w-full px-4 py-3 rounded-xl outline-none text-sm tracking-widest font-medium"
                required
              />
            </div>

            <div className="pt-2">
              <button type="submit" className="premium-btn w-full py-3.5 rounded-xl font-semibold text-sm flex justify-center items-center gap-2 group">
                <span>Otorisasi Akses</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Sistem Penilaian Terpadu &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
