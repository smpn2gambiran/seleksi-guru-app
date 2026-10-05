'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [peserta, setPeserta] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    cbtMode: 'manual',
    cbtOpen: false,
    cbtStartTime: '08:00',
    cbtEndTime: '10:00',
    liveScoreOpen: false,
    wawancaraOpen: false
  });

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
    }
  };

  const fetchPeserta = async () => {
    const res = await fetch('/api/peserta');
    if (res.ok) {
      const data = await res.json();
      setPeserta(data);
    }
  };

  useEffect(() => {
    fetchPeserta();
    fetchSettings();
    // Auto refresh every 5 seconds for live dashboard
    const interval = setInterval(() => {
      fetchPeserta();
      fetchSettings();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!status) return;
    try {
      await fetch(`/api/peserta/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusSeleksi: status }),
      });
      fetchPeserta();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (id: string, payload: any) => {
    try {
      await fetch(`/api/peserta/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      fetchPeserta();
    } catch (e) {
      console.error(e);
    }
  };

  const updateSettings = async (updates: any) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchSettings();
      }
    } catch (e) { console.error(e); }
  };

  const handleResetCbt = async (id: string) => {
    if(!confirm("Anda yakin ingin mengizinkan peserta ini mengulang ujian CBT? Data nilainya akan direset.")) return;
    try {
      await fetch(`/api/admin/peserta/${id}/reset-cbt`, { method: 'POST' });
      fetchPeserta();
    } catch(e) { console.error(e); }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    window.location.href = '/admin/login';
  };

  const handleDownloadLaporan = () => {
    // Generate CSV
    const headers = ['ID', 'Nama Kandidat', 'CBT', 'Microteaching', 'Wawancara', 'Kasus/Sikap', 'Nilai Akhir', 'Status Akhir'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    peserta.forEach(p => {
      const row = [
        p.nomorPeserta,
        p.nama,
        p.nilaiCbt ?? '-',
        p.nilaiMicro ?? '-',
        p.nilaiWawancara ?? '-',
        p.nilaiSikap ?? '-',
        p.nilaiAkhir !== null ? Number(p.nilaiAkhir).toFixed(2) : '-',
        p.statusSeleksi
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Hasil_Seleksi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8">
      {/* Background Aurora */}
      <div className="aurora-bg fixed inset-0 z-0"></div>
      
      <div className="max-w-[1400px] mx-auto relative z-10 animate-fade-in-up">
        {/* Header */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 glass-panel px-6 py-5 rounded-3xl shadow-sm border border-white/80">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Mata Dewa</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Kendali Penuh Seleksi Administrator</p>
             </div>
          </div>
          
          <div className="mt-4 xl:mt-0 flex flex-wrap gap-3">
             <button onClick={handleLogout} className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-sm border border-rose-200 transition-colors shadow-sm flex items-center gap-2">
               Log Out
             </button>
             <Link href="/admin/cetak-kredensial" target="_blank" className="px-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-700 font-bold rounded-xl text-sm border border-indigo-100 transition-colors shadow-sm flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
               </svg>
               Cetak Kredensial
             </Link>
             <button onClick={handleDownloadLaporan} className="px-4 py-2.5 bg-white hover:bg-slate-50 text-emerald-700 font-bold rounded-xl text-sm border border-emerald-100 transition-colors shadow-sm flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
               </svg>
               Download Laporan
             </button>
             {/* Mode Auto/Manual CBT Controls */}
             <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                <select 
                  value={settings.cbtMode} 
                  onChange={(e) => updateSettings({ cbtMode: e.target.value })}
                  className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                >
                  <option value="manual">Mode Manual</option>
                  <option value="auto">Mode Jadwal (Jam)</option>
                </select>

                {settings.cbtMode === 'auto' ? (
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold">
                    <input 
                      type="time" 
                      value={settings.cbtStartTime} 
                      onChange={(e) => updateSettings({ cbtStartTime: e.target.value })}
                      className="outline-none bg-transparent"
                    />
                    <span className="text-slate-400">-</span>
                    <input 
                      type="time" 
                      value={settings.cbtEndTime} 
                      onChange={(e) => updateSettings({ cbtEndTime: e.target.value })}
                      className="outline-none bg-transparent"
                    />
                  </div>
                ) : (
                  <button onClick={() => updateSettings({ cbtOpen: !settings.cbtOpen })} className={`px-4 py-1.5 font-bold rounded-lg text-xs border transition-colors shadow-sm flex items-center gap-2 ${
                    settings.cbtOpen ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}>
                    {settings.cbtOpen ? 'Tutup CBT' : 'Buka CBT'}
                  </button>
                )}
             </div>
             
             {/* Mode Live Score Control */}
             <button onClick={() => updateSettings({ liveScoreOpen: !settings.liveScoreOpen })} className={`px-4 py-2.5 font-bold rounded-xl text-sm border transition-colors shadow-sm flex items-center gap-2 ${
               settings.liveScoreOpen ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
             }`}>
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {settings.liveScoreOpen 
                    ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  }
               </svg>
               {settings.liveScoreOpen ? 'Tutup Live Score' : 'Buka Live Score'}
             </button>

             {/* Offline Test / Wawancara Control */}
             <button onClick={() => updateSettings({ wawancaraOpen: !settings.wawancaraOpen })} className={`px-4 py-2.5 font-bold rounded-xl text-sm border transition-colors shadow-sm flex items-center gap-2 ${
               settings.wawancaraOpen ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200'
             }`}>
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {settings.wawancaraOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  }
               </svg>
               {settings.wawancaraOpen ? 'Sesi Ujian Offline: BUKA' : 'Sesi Ujian Offline: TUTUP'}
             </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="premium-card p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-indigo-600 mb-1">{peserta.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Peserta</span>
            </div>
            <div className="premium-card p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-emerald-500 mb-1">{peserta.filter(p => p.statusSeleksi === 'SELESAI').length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selesai Ujian</span>
            </div>
            <div className="premium-card p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-amber-500 mb-1">{peserta.filter(p => p.statusSeleksi.startsWith('SEDANG_UJI')).length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sedang Ujian</span>
            </div>
            <div className="premium-card p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-slate-400 mb-1">{peserta.filter(p => p.statusSeleksi === 'PENDING' || p.statusSeleksi === 'SIAP_UJI').length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Antrean Tunggu</span>
            </div>
        </div>

        {/* Table/List */}
        <div className="premium-card rounded-3xl overflow-hidden border border-slate-200/50">
           <div className="px-6 py-5 border-b border-slate-200/50 bg-white/40">
              <h2 className="text-lg font-bold text-slate-800">Status Live Progress Peserta</h2>
              <p className="text-xs text-slate-500 mt-1">Gunakan panel Aksi untuk memanggil dan mengarahkan peserta pasca-CBT ke penguji spesifik.</p>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    <th className="px-4 py-4">ID</th>
                    <th className="px-4 py-4">Nama Kandidat</th>
                    <th className="px-4 py-4">Nilai Administrasi</th>
                    <th className="px-4 py-4">Penilai Saat Ini</th>
                    <th className="px-4 py-4 text-center">CBT</th>
                    <th className="px-4 py-4 text-center">Micro</th>
                    <th className="px-4 py-4 text-center">Wawancara</th>
                    <th className="px-4 py-4 text-center">Kasus</th>
                    <th className="px-4 py-4 text-center">Akhir</th>
                    <th className="px-4 py-4 text-right">Aksi Kendali</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/30 text-sm font-medium text-slate-700">
                  {peserta.map((p) => (
                    <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-4 font-bold text-indigo-600">{p.nomorPeserta}</td>
                      <td className="px-4 py-4 font-bold text-slate-800">{p.nama}</td>
                      <td className="px-4 py-4">
                        {p.nilaiAdministrasi !== null ? (
                          <span className="font-bold text-emerald-600">{p.nilaiAdministrasi}</span>
                        ) : (
                          <div className="flex gap-1">
                            <button onClick={() => handleUpdate(p.id, {nilaiAdministrasi: 100})} className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200" title="Dokumen Lengkap">Lengkap</button>
                            <button onClick={() => handleUpdate(p.id, {nilaiAdministrasi: 0, statusSeleksi: 'GUGUR'})} className="px-2 py-1 text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200" title="Gugur Administrasi">Gugur</button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${p.statusSeleksi.includes('SEDANG') ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                            {p.statusSeleksi}
                          </span>
                      </td>
                      <td className="px-4 py-4 text-center text-emerald-600 font-bold">{p.nilaiCbt ?? '-'}</td>
                      <td className="px-4 py-4 text-center text-slate-600">{p.nilaiMicro ?? '-'}</td>
                      <td className="px-4 py-4 text-center text-slate-600">{p.nilaiWawancara ?? '-'}</td>
                      <td className="px-4 py-4 text-center text-slate-600">{p.nilaiSikap ?? '-'}</td>
                      <td className="px-4 py-4 text-center font-black text-indigo-600">{p.nilaiAkhir !== null ? Number(p.nilaiAkhir).toFixed(2) : '-'}</td>
                      <td className="px-4 py-4 text-right flex flex-col items-end gap-1">
                        {p.statusSeleksi === 'PENDING' ? (
                          <button className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-500 rounded-lg cursor-not-allowed">Belum Ujian CBT</button>
                        ) : (p.statusSeleksi === 'SELESAI_CBT' || p.statusSeleksi === 'MENUNGGU') ? (
                          <div className="flex flex-col gap-1 items-end">
                            {p.nilaiMicro === null && <button onClick={() => handleUpdate(p.id, {statusSeleksi: 'SEDANG_UJI_MICRO'})} className="px-3 py-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md border border-indigo-200">Panggil Micro (Pak Budi)</button>}
                            {p.nilaiWawancara === null && <button onClick={() => handleUpdate(p.id, {statusSeleksi: 'SEDANG_UJI_WAWANCARA'})} className="px-3 py-1.5 text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md border border-blue-200">Panggil Wawancara (Pak Lukman)</button>}
                            {p.nilaiSikap === null && <button onClick={() => handleUpdate(p.id, {statusSeleksi: 'SEDANG_UJI_KASUS'})} className="px-3 py-1.5 text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md border border-purple-200">Panggil Kasus (Pak Charisma)</button>}
                            
                            {p.nilaiAdministrasi !== null && p.nilaiCbt !== null && p.nilaiMicro !== null && p.nilaiWawancara !== null && p.nilaiSikap !== null && (
                              <button onClick={() => handleUpdate(p.id, {statusSeleksi: 'SELESAI'})} className="px-3 py-1.5 text-xs font-bold bg-green-500 text-white hover:bg-green-600 rounded-lg shadow-sm">Set Selesai Semua</button>
                            )}
                          </div>
                        ) : p.statusSeleksi === 'SEDANG_UJI_MICRO' ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleUpdate(p.id, {statusSeleksi: 'MENUNGGU'})} className="px-3 py-1.5 text-[10px] font-bold bg-rose-50 text-rose-600 rounded-md border border-rose-200">Batal</button>
                            <button onClick={() => {
                               const score = prompt("Masukkan nilai Microteaching (0-100):");
                               if (score && !isNaN(Number(score))) handleUpdate(p.id, {statusSeleksi: 'MENUNGGU', nilaiMicro: parseFloat(score)});
                            }} className="px-3 py-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md">Selesai & Input</button>
                          </div>
                        ) : p.statusSeleksi === 'SEDANG_UJI_WAWANCARA' ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleUpdate(p.id, {statusSeleksi: 'MENUNGGU'})} className="px-3 py-1.5 text-[10px] font-bold bg-rose-50 text-rose-600 rounded-md border border-rose-200">Batal</button>
                            <button onClick={() => {
                               const score = prompt("Masukkan nilai Wawancara (0-100):");
                               if (score && !isNaN(Number(score))) handleUpdate(p.id, {statusSeleksi: 'MENUNGGU', nilaiWawancara: parseFloat(score)});
                            }} className="px-3 py-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md">Selesai & Input</button>
                          </div>
                        ) : p.statusSeleksi === 'SEDANG_UJI_KASUS' ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleUpdate(p.id, {statusSeleksi: 'MENUNGGU'})} className="px-3 py-1.5 text-[10px] font-bold bg-rose-50 text-rose-600 rounded-md border border-rose-200">Batal</button>
                            <button onClick={() => {
                               const score = prompt("Masukkan nilai Kasus/Sikap (0-100):");
                               if (score && !isNaN(Number(score))) handleUpdate(p.id, {statusSeleksi: 'MENUNGGU', nilaiSikap: parseFloat(score)});
                            }} className="px-3 py-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md">Selesai & Input</button>
                          </div>
                        ) : p.statusSeleksi === 'SELESAI' ? (
                          <button onClick={() => handleUpdate(p.id, {statusSeleksi: 'MENUNGGU'})} className="px-3 py-1.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded-md border border-slate-200">Selesai (Batalkan)</button>
                        ) : null}
                        
                        {(p.statusSeleksi === 'SELESAI_CBT' || p.statusSeleksi === 'MENUNGGU' || p.statusSeleksi.startsWith('SEDANG')) && (
                          <button onClick={() => handleResetCbt(p.id)} className="mt-2 px-3 py-1 text-[10px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md transition-colors border border-rose-200">
                            Izinkan Ulang CBT
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
