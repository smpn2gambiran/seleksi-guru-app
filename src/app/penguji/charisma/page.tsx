"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PengujiDashboardCharisma() {
  const [pesertaQueue, setPesertaQueue] = useState<any[]>([]);
  const [activePeserta, setActivePeserta] = useState<any>(null);
  const [historyPeserta, setHistoryPeserta] = useState<any[]>([]);

  // 10 Indicators for Sikap
  const [rubricScores, setRubricScores] = useState<number[]>(Array(10).fill(50));
  const [catatan, setCatatan] = useState('');

  const totalScore = Math.round(rubricScores.reduce((a, b) => a + b, 0) / 10);

  const fetchData = async () => {
    const res = await fetch('/api/peserta');
    if (res.ok) {
      const data = await res.json();
      
      const inQueue = data.filter((p: any) => p.statusSeleksi === 'SIAP_UJI' && p.nilaiSikap === null);
      setPesertaQueue(inQueue);

      const active = data.find((p: any) => p.statusSeleksi === 'SEDANG_UJI_KASUS');
      setActivePeserta(active || null);

      const history = data.filter((p: any) => p.nilaiSikap !== null);
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
      body: JSON.stringify({ statusSeleksi: 'SEDANG_UJI_KASUS' }),
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
        nilaiSikap: totalScore,
        statusSeleksi: 'SELESAI_KASUS'
      }),
    });
    setActivePeserta(null);
    setRubricScores(Array(10).fill(50));
    setCatatan('');
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
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-800">Ruang Penilaian: Kasus & Sikap</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Area Kerja Terisolasi (Bobot Akhir: 10%)</p>
             </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Penguji Aktif</p>
                <p className="text-sm font-bold text-slate-800">Bapak Charisma</p>
             </div>
             <div className="w-11 h-11 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200">
                <span className="text-indigo-600 font-black text-lg">C</span>
             </div>
             <div className="h-8 w-px bg-slate-200 mx-1"></div>
             <button 
                onClick={() => { window.location.href = '/penguji/login'; }}
                className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors border border-rose-100 flex items-center gap-1.5"
             >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Keluar
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            {/* Panel Kiri: Antrean & Panduan Baca */}
            <div className="xl:col-span-4 space-y-6">
                
                {/* Kandidat Aktif */}
                <div className="premium-card p-6 rounded-3xl border-2 border-indigo-200 shadow-md shadow-indigo-100/30">
                    <h2 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4">Sedang Dievaluasi Saat Ini</h2>
                    
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

                {/* Pertanyaan Kasus Aktual */}
                <div className="premium-card p-5 sm:p-6 rounded-3xl bg-indigo-50/50 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Pertanyaan Pemantik Kasus</h2>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <ul className="text-xs text-slate-600 space-y-4 font-medium list-none">
                            <li><span className="font-bold text-indigo-700 block mb-1">Kasus 1 (TKA/ANBK vs Tugas Mengajar)</span>"Persiapan TKA/ANBK memerlukan penyetelan laboratorium, pengolahan data peserta, dan koordinasi yang intensif selama beberapa hari. Di saat bersamaan, Anda tetap memiliki kewajiban mengajar rutin. Bagaimana Anda mengatur prioritas dan memastikan kedua tugas tersebut selesai dengan baik?"</li>
                            <li><span className="font-bold text-indigo-700 block mb-1">Kasus 2 (Kendala Lab Komputer Jelang Pembelajaran)</span>"Beberapa menit sebelum jam pelajaran dimulai, beberapa unit komputer laboratorium mendadak mengalami gangguan/tidak terhubung ke jaringan. Bagaimana langkah konkret yang langsung Anda ambil agar pembelajaran tetap berjalan dan masalah teknis teratasi?"</li>
                            <li><span className="font-bold text-indigo-700 block mb-1">Kasus 3 (Tugas Mendadak Kegiatan Sekolah)</span>"Anda sedang menyelesaikan tenggat pekerjaan pribadi/rutin, tetapi pihak sekolah membutuhkan bantuan mendadak untuk penanganan perangkat/kebutuhan digital kegiatan sekolah hari itu. Bagaimana sikap dan tindakan Anda?"</li>
                            <li><span className="font-bold text-indigo-700 block mb-1">Kasus 4 (Inisiatif Digitalisasi Sekolah)</span>"Sekolah membutuhkan perbaikan sistem rekap data atau formulir digital sederhana. Jika Anda melihat atau diminta membantu kebutuhan ini, bagaimana cara Anda merancang, mengeksekusi, hingga memastikan sistem tersebut berjalan?"</li>
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
                    <p className="text-[10px] text-slate-500 mb-3">Bandingkan kualitas respons kandidat saat ini dengan kandidat sebelumnya.</p>
                    
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {historyPeserta.map((hp, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                              <div>
                                  <p className="text-xs font-bold text-slate-700">{hp.nama}</p>
                                  <p className="text-[9px] text-slate-400">ID: {hp.nomorPeserta}</p>
                              </div>
                              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-black">{hp.nilaiSikap}</span>
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
                          <div key={pq.id} className="p-3.5 bg-white/50 border border-slate-200 rounded-2xl flex justify-between items-center hover:border-indigo-300 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                              <div>
                                  <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{pq.nama}</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Selesai Wawancara | ID: {pq.nomorPeserta}</p>
                              </div>
                              <button onClick={() => handlePanggil(pq.id)} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">Panggil</button>
                          </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Panel Kanan: Form Penilaian Khusus Charisma (10 Indikator) */}
            <div className="xl:col-span-8">
                <div className="premium-card p-6 sm:p-8 rounded-3xl h-full border border-slate-200/60 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Borang Penilaian: <span className="text-indigo-600">{activePeserta ? activePeserta.nama : '-'}</span></h2>
                            <p className="text-xs text-slate-500 mt-1">Evaluasi respons peserta terhadap kasus melalui 10 indikator berikut (skala 1-10 per indikator).</p>
                        </div>
                        <div className="px-6 py-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-center">
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-1">Skor Total</span>
                            <span className="text-5xl font-black text-indigo-600">{totalScore}</span>
                        </div>
                    </div>
                    
                    <form onSubmit={handleKunci} className={`space-y-8 flex-grow flex flex-col ${!activePeserta ? 'opacity-50 pointer-events-none' : ''}`}>
                        
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {[
                              { title: 'Inisiatif & Ownership', desc: 'Memahami kebutuhan tanpa dituntun, mengambil tindakan awal, & tanggung jawab hasil.' },
                              { title: 'Prioritas & Manajemen Waktu', desc: 'Memisahkan hal mendesak dan penting demi kelangsungan kegiatan.' },
                              { title: 'Penyelesaian Pekerjaan', desc: 'Ketahanan kerja, tak berhenti saat hambatan, pastikan tugas utama selesai.' },
                              { title: 'Problem Solving', desc: 'Temukan akar masalah, coba alternatif, tahu kapan minta bantuan.' },
                              { title: 'Adaptasi', desc: 'Tenang saat kondisi berubah & sesuaikan strategi tanpa hilang tujuan.' },
                              { title: 'Komunikasi', desc: 'Sampaikan kendala jelas berbasis fakta tanpa menyalahkan pihak lain.' },
                              { title: 'Koordinasi & Respons Arahan', desc: 'Dengar instruksi, konfirmasi, dan beri pembaruan perkembangan.' },
                              { title: 'Tanggung Jawab Profesional', desc: 'Tidak mengelak "bukan tugas saya" & seimbangkan dengan mengajar.' },
                              { title: 'Komitmen & Fleksibilitas', desc: 'Beri effort lebih pada periode intensif (ANBK/acara besar).' },
                              { title: 'Orientasi Penyelesaian', desc: 'Pastikan ada follow-up dan kejelasan status akhir bagi sekolah.' }
                            ].map((indikator, i) => (
                              <div key={i} className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                  <label className="text-xs font-bold text-slate-700">{i + 1}. {indikator.title}</label>
                                  <span className="text-xs font-black text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded">{rubricScores[i]}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight mb-1">{indikator.desc}</p>
                                <input 
                                    type="range" 
                                    min="0" max="100" 
                                    value={rubricScores[i]}
                                    onChange={(e) => {
                                      const newScores = [...rubricScores];
                                      newScores[i] = parseInt(e.target.value);
                                      setRubricScores(newScores);
                                    }}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                                />
                                <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                    <span>Sangat Kurang (0-59)</span>
                                    <span>Sangat Kuat (90-100)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Catatan Observasi */}
                        <div className="pt-2">
                            <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">Catatan Bukti & Kepribadian (Wajib)</label>
                            <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} className="w-full p-4 text-sm bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 transition-all" rows={4} placeholder="Ketik ringkasan bukti kepribadian, alasan kuat untuk nilai yang diberikan, dan respons spesifik kandidat..."></textarea>
                        </div>

                        <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-auto">
                            <button type="button" className="px-6 py-3.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors w-full sm:w-auto border border-slate-200">
                                Simpan Draft
                            </button>
                            <button type="submit" disabled={!activePeserta} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 hover:shadow-purple-500/50 transition-all px-8 py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 w-full sm:w-auto disabled:opacity-50">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Kunci Permanen Nilai
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
