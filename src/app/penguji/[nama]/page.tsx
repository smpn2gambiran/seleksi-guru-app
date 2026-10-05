'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PengujiDashboard() {
  const params = useParams();
  const namaPenguji = typeof params?.nama === 'string' ? params.nama.toLowerCase() : 'budi';
  
  const station = namaPenguji === 'charisma' ? 'KASUS' : 
                  namaPenguji === 'lukman' ? 'WAWANCARA' : 'MICRO';
                  
  const [peserta, setPeserta] = useState<any[]>([]);
  const [settings, setSettings] = useState({ wawancaraOpen: false });
  const [isLoading, setIsLoading] = useState(true);
  
  // Rubric State
  const [rubricScores, setRubricScores] = useState<number[]>(Array(10).fill(5));
  const [catatan, setCatatan] = useState('');

  const fetchData = async () => {
    try {
      const [pesertaRes, settingsRes] = await Promise.all([
        fetch('/api/peserta'),
        fetch('/api/settings')
      ]);
      const data = await pesertaRes.json();
      const settingsData = await settingsRes.json();
      
      setPeserta(data.data || []);
      setSettings(settingsData);
    } catch (e) {
      console.error('Error fetching data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async (id: string, payload: any) => {
    if (!settings.wawancaraOpen) {
      alert("Sesi wawancara belum dibuka oleh Admin!");
      return;
    }
    try {
      await fetch(`/api/peserta/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Status mapping
  const getRelevantStatus = () => {
    if (station === 'MICRO') return 'SEDANG_UJI_MICRO';
    if (station === 'WAWANCARA') return 'SEDANG_UJI_WAWANCARA';
    return 'SEDANG_UJI_KASUS';
  };

  const getStationName = () => {
    if (station === 'MICRO') return 'Microteaching (Pak Budi)';
    if (station === 'WAWANCARA') return 'Wawancara (Pak Lukman)';
    return 'Kasus & Sikap (Pak Charisma)';
  };

  const filteredPeserta = peserta.filter(p => {
    // Only show people who have passed CBT
    if (!['SELESAI_CBT', 'MENUNGGU', 'SEDANG_UJI_MICRO', 'SEDANG_UJI_WAWANCARA', 'SEDANG_UJI_KASUS'].includes(p.statusSeleksi)) {
      return false;
    }
    // Filter out people who already have a score for this station
    if (station === 'MICRO' && p.nilaiMicro !== null) return false;
    if (station === 'WAWANCARA' && p.nilaiWawancara !== null) return false;
    if (station === 'KASUS' && p.nilaiSikap !== null) return false;
    
    return true;
  });

  // Calculate Metrics
  const metrics = {
    bisaDipanggil: filteredPeserta.filter(p => p.statusSeleksi === 'SELESAI_CBT' || p.statusSeleksi === 'MENUNGGU').length,
    diStasiunLain: filteredPeserta.filter(p => ['SEDANG_UJI_MICRO', 'SEDANG_UJI_WAWANCARA', 'SEDANG_UJI_KASUS'].includes(p.statusSeleksi) && p.statusSeleksi !== getRelevantStatus()).length,
    sedangDiuji: filteredPeserta.filter(p => p.statusSeleksi === getRelevantStatus()).length,
    selesaiDinilai: peserta.filter(p => {
       if (station === 'MICRO' && p.nilaiMicro !== null) return true;
       if (station === 'WAWANCARA' && p.nilaiWawancara !== null) return true;
       if (station === 'KASUS' && p.nilaiSikap !== null) return true;
       return false;
    }).length
  };

  const activeParticipant = peserta.find(p => p.statusSeleksi === getRelevantStatus());
  
  const handleSimpanPenilaian = () => {
    if (!activeParticipant) return;
    // Calculate total score (10 indicators, each 1-10 -> total 10-100)
    const totalScore = rubricScores.reduce((a, b) => a + b, 0);
    
    const payload: any = { statusSeleksi: 'MENUNGGU' }; // Add notes if database supported it, but for now just score
    if (station === 'MICRO') payload.nilaiMicro = totalScore;
    if (station === 'WAWANCARA') payload.nilaiWawancara = totalScore;
    if (station === 'KASUS') payload.nilaiSikap = totalScore;
    
    if (confirm(`Simpan nilai akhir ${totalScore} untuk ${activeParticipant.namaLengkap}?`)) {
       handleUpdate(activeParticipant.id, payload);
       // Reset
       setRubricScores(Array(10).fill(5));
       setCatatan('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">DASBOR PENGUJI</h1>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                Ruang Penilaian: {getStationName()} - Area Kerja Terisolasi (Bobot Akhir: {station === 'MICRO' ? '20%' : station === 'WAWANCARA' ? '30%' : '10%'})
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => { window.location.href = '/penguji/login'; }}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm rounded-xl border border-rose-200 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {!settings.wawancaraOpen && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-4">
            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-bold text-lg">Sesi Ujian Offline Belum Dimulai</h3>
              <p className="text-sm">Admin belum membuka sesi wawancara. Anda belum dapat memanggil peserta atau menginput nilai.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bisa Dipanggil</span>
            <span className="text-3xl font-black text-indigo-600">{metrics.bisaDipanggil}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Di Stasiun Lain</span>
            <span className="text-3xl font-black text-amber-500">{metrics.diStasiunLain}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sedang Anda Uji</span>
            <span className="text-3xl font-black text-emerald-500">{metrics.sedangDiuji}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Selesai Dinilai</span>
            <span className="text-3xl font-black text-slate-800">{metrics.selesaiDinilai}</span>
          </div>
        </div>

        {/* ACTIVE ASSESSMENT PANEL */}
        {activeParticipant && (
          <div className="bg-indigo-900 rounded-3xl shadow-xl overflow-hidden border border-indigo-700 mb-8 text-white">
            <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-800 to-indigo-900 border-b border-indigo-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-full text-[10px] uppercase tracking-widest border border-emerald-500/30 mb-3 inline-block">Sedang Berlangsung</span>
                <h2 className="text-2xl font-black">{activeParticipant.namaLengkap}</h2>
                <p className="text-indigo-300 font-medium">Nomor: {activeParticipant.nomorPeserta}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1 block">Skor Sementara</span>
                <span className="text-5xl font-black text-emerald-400">{rubricScores.reduce((a, b) => a + b, 0)}<span className="text-2xl text-indigo-400">/100</span></span>
              </div>
            </div>
            
            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-indigo-100 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  10 Indikator Penilaian
                </h3>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {Array(10).fill(0).map((_, i) => (
                    <div key={i} className="bg-indigo-800/50 p-4 rounded-xl border border-indigo-700/50">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-bold text-indigo-200">Indikator {i + 1}</label>
                        <span className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center font-bold text-emerald-400 text-sm border border-indigo-800">
                          {rubricScores[i]}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="10" 
                        value={rubricScores[i]}
                        onChange={(e) => {
                          const newScores = [...rubricScores];
                          newScores[i] = parseInt(e.target.value);
                          setRubricScores(newScores);
                        }}
                        className="w-full h-2 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-indigo-400 font-bold mt-2 uppercase tracking-widest">
                        <span>Sangat Kurang</span>
                        <span>Sangat Baik</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-indigo-100 flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Catatan Observasi & Bukti
                  </h3>
                  <textarea 
                    placeholder="Tuliskan catatan observasi, respons terhadap pertanyaan kasus, atau bukti perilaku..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full h-[350px] bg-indigo-950 border border-indigo-800 rounded-2xl p-5 text-indigo-100 placeholder-indigo-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium"
                  ></textarea>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button onClick={() => handleUpdate(activeParticipant.id, {statusSeleksi: 'MENUNGGU'})} className="px-6 py-4 rounded-xl font-bold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors">
                    Batalkan Penilaian
                  </button>
                  <button onClick={handleSimpanPenilaian} className="flex-1 px-6 py-4 rounded-xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 transition-transform active:scale-[0.98]">
                    Simpan Nilai & Selesaikan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Antrean Peserta: {getStationName()}</h2>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-full text-xs">
              {filteredPeserta.length} Menunggu
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Nomor Peserta</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Lengkap</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status Saat Ini</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPeserta.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                      Tidak ada peserta di antrean.
                    </td>
                  </tr>
                ) : (
                  filteredPeserta.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{p.nomorPeserta}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{p.namaLengkap}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          p.statusSeleksi === getRelevantStatus() ? 'bg-emerald-100 text-emerald-700' :
                          p.statusSeleksi === 'SELESAI_CBT' || p.statusSeleksi === 'MENUNGGU' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {p.statusSeleksi === getRelevantStatus() ? 'SEDANG ANDA UJI' : 
                           p.statusSeleksi === 'SELESAI_CBT' || p.statusSeleksi === 'MENUNGGU' ? 'MENGANGGUR / STANDBY' :
                           'DI STASIUN LAIN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex flex-col items-end gap-2">
                        {p.statusSeleksi === getRelevantStatus() ? (
                          <div className="flex gap-2">
                            <span className="px-4 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg">Silakan isi form di atas ☝️</span>
                          </div>
                        ) : (p.statusSeleksi === 'SELESAI_CBT' || p.statusSeleksi === 'MENUNGGU') ? (
                          <button disabled={!settings.wawancaraOpen || activeParticipant !== undefined} onClick={() => handleUpdate(p.id, {statusSeleksi: getRelevantStatus()})} className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm ${!settings.wawancaraOpen || activeParticipant !== undefined ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                            {activeParticipant ? 'Selesaikan Ujian Saat Ini Dulu' : 'Panggil Peserta'}
                          </button>
                        ) : (
                          <button disabled className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed">
                            Menunggu Stasiun Lain
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
