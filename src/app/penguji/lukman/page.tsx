"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PengujiDashboardLukman() {
  const [pesertaQueue, setPesertaQueue] = useState<any[]>([]);
  const [activePeserta, setActivePeserta] = useState<any>(null);
  const [historyPeserta, setHistoryPeserta] = useState<any[]>([]);

  const [score, setScore] = useState(0);

  const fetchData = async () => {
    const res = await fetch('/api/peserta');
    if (res.ok) {
      const data = await res.json();
      
      const inQueue = data.filter((p: any) => p.statusSeleksi === 'SIAP_UJI' && p.nilaiWawancara === null);
      setPesertaQueue(inQueue);

      const active = data.find((p: any) => p.statusSeleksi === 'SEDANG_UJI_LUKMAN');
      setActivePeserta(active || null);

      const history = data.filter((p: any) => p.nilaiWawancara !== null);
      setHistoryPeserta(history);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePanggil = async (id: string) => {
    await fetch(`/api/peserta/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statusSeleksi: 'SEDANG_UJI_LUKMAN' }),
    });
    fetchData();
  };

  const handleKunci = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeserta) return;
    await fetch(`/api/peserta/${activePeserta.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        nilaiWawancara: score,
        statusSeleksi: 'SELESAI_LUKMAN'
      }),
    });
    setActivePeserta(null);
    setScore(0);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8">
      {/* Background Aurora */}
      <div className="aurora-bg fixed inset-0 z-0"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 animate-fade-in-up">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 glass-panel px-6 py-5 rounded-3xl shadow-sm border border-white/80">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-800">Ruang Penilaian: Wawancara</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Area Kerja Terisolasi (Bobot Akhir: 30%)</p>
             </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Penguji Aktif</p>
                <p className="text-sm font-bold text-slate-800">Bapak Lukman Arif</p>
             </div>
             <div className="w-11 h-11 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                <span className="text-blue-600 font-black text-lg">L</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            {/* Panel Kiri: Antrean & Panduan Baca */}
            <div className="xl:col-span-4 space-y-6">
                
                {/* Kandidat Aktif */}
                <div className="premium-card p-6 rounded-3xl border-2 border-cyan-200 shadow-md shadow-cyan-100/30">
                    <h2 className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-4">Sedang Dievaluasi Saat Ini</h2>
                    
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-100 mb-4 flex items-center justify-center text-slate-400 shadow-inner">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">{activePeserta ? activePeserta.nama : 'Belum Ada'}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {activePeserta ? activePeserta.nomorPeserta : '-'}</p>
                    </div>
                </div>

                {/* Panduan Penilaian Wawancara */}
                <div className="premium-card p-5 sm:p-6 rounded-3xl bg-blue-50/50 border border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2 className="text-xs font-bold text-blue-700 uppercase tracking-widest">Fokus Wawancara</h2>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-500 italic mb-3">Nilai secara komprehensif berdasarkan 8 aspek berikut:</p>
                        <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
                            <li>Integritas & Tanggung Jawab</li>
                            <li>Komunikasi</li>
                            <li>Kerja Sama & Kolaborasi</li>
                            <li>Adaptabilitas Teknologi</li>
                            <li>Problem Solving</li>
                            <li>Loyalitas & Kepemilikan Institusi</li>
                            <li>Komitmen & Fleksibilitas Kerja</li>
                            <li>Pengembangan Profesional</li>
                        </ul>
                    </div>
                </div>

                {/* Riwayat Penilaian (Kalibrasi) */}
                <div className="premium-card p-5 sm:p-6 rounded-3xl bg-white border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Riwayat Nilai (Kalibrasi)</h2>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-3">Bandingkan kualitas jawaban kandidat saat ini dengan kandidat sebelumnya.</p>
                    
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {historyPeserta.map((hp, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                              <div>
                                  <p className="text-xs font-bold text-slate-700">{hp.nama}</p>
                                  <p className="text-[9px] text-slate-400">ID: {hp.nomorPeserta}</p>
                              </div>
                              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-black">{hp.nilaiWawancara}</span>
                          </div>
                        ))}
                    </div>
                </div>

                {/* Antrean Menunggu */}
                <div className="premium-card p-5 sm:p-6 rounded-3xl">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Peserta Siap Uji</h2>
                        <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{pesertaQueue.length} Orang</span>
                    </div>
                    
                    <div className="space-y-3">
                        {pesertaQueue.map((pq) => (
                          <div key={pq.id} className="p-3.5 bg-white/50 border border-slate-200 rounded-2xl flex justify-between items-center hover:border-cyan-300 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                              <div>
                                  <p className="text-sm font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">{pq.nama}</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Selesai CBT | ID: {pq.nomorPeserta}</p>
                              </div>
                              <button onClick={() => handlePanggil(pq.id)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">Panggil</button>
                          </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Panel Kanan: Form Penilaian Khusus Lukman (1 Slider Ringkas) */}
            <div className="xl:col-span-8">
                <div className="premium-card p-6 sm:p-8 rounded-3xl h-full border border-slate-200/60 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Borang Penilaian: <span className="text-blue-600">{activePeserta ? activePeserta.nama : '-'}</span></h2>
                            <p className="text-xs text-slate-500 mt-1">Berikan SATU nilai komprehensif (0-100) untuk evaluasi performa Wawancara.</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleKunci} className={`space-y-8 flex-grow flex flex-col ${!activePeserta ? 'opacity-50 pointer-events-none' : ''}`}>
                        {/* 1 Slider Utama */}
                        <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm my-auto">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Nilai Akhir Wawancara</h3>
                                    <p className="text-sm text-slate-500">Skala 0 - 100</p>
                                </div>
                                <div className="px-6 py-4 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                                    <span className="text-5xl font-black text-blue-600">{score}</span>
                                </div>
                            </div>
                            
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={score} 
                                onChange={(e) => setScore(parseInt(e.target.value) || 0)} 
                                className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-8" 
                            />

                            {/* Legend Skala */}
                            <div className="flex flex-wrap justify-center gap-3">
                                <span className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg font-bold">90-100: Sangat Kuat</span>
                                <span className="text-xs px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg font-bold">80-89: Kuat</span>
                                <span className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg font-bold">70-79: Cukup</span>
                                <span className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold">&lt;70: Kurang</span>
                            </div>
                        </div>
                        
                        {/* Catatan Observasi */}
                        <div className="pt-2">
                            <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">Catatan Observasi (Wajib)</label>
                            <textarea className="w-full p-4 text-sm bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all" rows={4} placeholder="Ketik ringkasan kelebihan dan kekurangan kandidat berdasarkan 8 fokus wawancara..."></textarea>
                        </div>

                        <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-auto">
                            <button type="button" className="px-6 py-3.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors w-full sm:w-auto border border-slate-200">
                                Simpan Draft
                            </button>
                            <button type="submit" disabled={!activePeserta} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 hover:shadow-indigo-500/50 transition-all px-8 py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 w-full sm:w-auto disabled:opacity-50">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Kunci Permanen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
