'use client';
import { useEffect, useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useRouter } from 'next/navigation';

export default function PesertaDashboard() {
  const router = useRouter();
  const [peserta, setPeserta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Agreement states
  const [agreed, setAgreed] = useState(false);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [signature, setSignature] = useState('');
  const sigCanvas = useRef<any>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cbtOpen, setCbtOpen] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    // Cek apakah sudah pernah setuju di localstorage
    const hasAgreed = localStorage.getItem('pesertaAgreed') === 'true';
    if (hasAgreed) setAgreed(true);

    const fetchPeserta = async () => {
      try {
        const res = await fetch('/api/peserta/me');
        if (res.ok) {
          const data = await res.json();
          setPeserta(data);
          // Jika di database sudah ada tanda tangan, lewati form persetujuan
          if (data.tandaTangan) {
            setAgreed(true);
          }
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          
          if (data.cbtMode === 'manual') {
            setCbtOpen(data.cbtOpen);
          } else {
            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();
            const [sh, sm] = (data.cbtStartTime || '00:00').split(':').map(Number);
            const [eh, em] = (data.cbtEndTime || '23:59').split(':').map(Number);
            const startMins = sh * 60 + sm;
            const endMins = eh * 60 + em;
            
            setCbtOpen(currentMins >= startMins && currentMins <= endMins);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPeserta();
    fetchSettings();
  }, [router]);

  const isSignatureValid = peserta && signature.trim().toLowerCase() === peserta.nama.trim().toLowerCase() && hasSignature;
  
  const handleAgreeSubmit = async () => {
    if (check1 && check2 && check3 && isSignatureValid && sigCanvas.current) {
      setIsSubmitting(true);
      const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      
      try {
        const res = await fetch('/api/peserta/submit-agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tandaTangan: signatureImage })
        });
        
        if (res.ok) {
          localStorage.setItem('pesertaAgreed', 'true');
          setAgreed(true);
        } else if (res.status === 404) {
          alert('Sesi Anda sudah tidak valid (Data telah direset). Anda akan diarahkan ke halaman login.');
          handleLogout();
        } else {
          alert('Gagal menyimpan persetujuan, silakan coba lagi.');
        }
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan jaringan.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClearSignature = () => {
    sigCanvas.current?.clear();
    setHasSignature(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('pesertaAgreed');
    try {
      await fetch('/api/peserta/logout', { method: 'POST' });
    } catch (e) {}
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Memuat data...</div>;
  }

  if (!peserta) {
    return null; // Will redirect
  }

  // Jika belum setuju, tampilkan halaman Persetujuan (UI lama + fungsi)
  if (!agreed) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8">
        <div className="aurora-bg fixed inset-0 z-0"></div>
        <div className="max-w-3xl mx-auto relative z-10 animate-fade-in-up">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 glass-panel px-6 py-5 rounded-2xl shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Halo, {peserta.nama}!</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Kandidat Seleksi</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <div className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-sm border border-indigo-100 shadow-sm">
                ID: {peserta.nomorPeserta}
              </div>
              <button onClick={handleLogout} className="px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors shadow-sm">
                Log Out
              </button>
            </div>
          </header>

          <div className="premium-card rounded-3xl p-6 sm:p-10 mb-8">
            <div className="text-center mb-8 border-b border-slate-200/60 pb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 uppercase tracking-wide">Surat Pernyataan & Persetujuan</h2>
              <p className="text-sm text-slate-500 font-medium">Seleksi Calon Guru & Tenaga Kependidikan</p>
            </div>

            <div className="mb-8">
              <p className="text-sm text-slate-600 font-medium mb-4">Yang bertanda tangan di bawah ini:</p>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-sm">
                <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] gap-2">
                  <span className="font-semibold text-slate-500">Nama Lengkap</span>
                  <span className="font-bold text-slate-800">: {peserta.nama}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] gap-2">
                  <span className="font-semibold text-slate-500">Nomor Peserta</span>
                  <span className="font-bold text-slate-800">: {peserta.nomorPeserta}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] gap-2">
                  <span className="font-semibold text-slate-500">NIK Lengkap</span>
                  <span className="font-bold text-slate-800">: {peserta.nik}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] md:grid-cols-[150px_1fr] gap-2">
                  <span className="font-semibold text-slate-500">Alamat Domisili</span>
                  <span className="font-bold text-slate-800">: {peserta.alamat}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 mb-6 font-medium">Menyatakan dengan sesungguhnya bahwa saya telah membaca, memahami, dan menyetujui seluruh mekanisme serta aturan berikut:</p>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-white/60 hover:bg-white/90 transition-all shadow-sm">
                <label className="flex items-start gap-4 cursor-pointer">
                  <div className="mt-1 relative flex items-center justify-center">
                    <input type="checkbox" checked={check1} onChange={(e) => setCheck1(e.target.checked)} className="w-5 h-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer peer" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">1. Informasi Mekanisme Seleksi</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">Pengecekan administrasi, Ujian CBT dengan sistem waktu absolut 20 menit (otomatis tersimpan), Praktik Microteaching, Wawancara Kompetensi, dan Simulasi Kasus.</p>
                  </div>
                </label>
              </div>
              
              <div className="p-5 rounded-2xl border border-slate-200 bg-white/60 hover:bg-white/90 transition-all shadow-sm">
                <label className="flex items-start gap-4 cursor-pointer">
                  <div className="mt-1 relative flex items-center justify-center">
                    <input type="checkbox" checked={check2} onChange={(e) => setCheck2(e.target.checked)} className="w-5 h-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer peer" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">2. Tata Tertib Seleksi</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">Dilarang membawa catatan, contekan, atau membuka tab/browser lain di perangkat selama pengerjaan Tes CBT. Segala kecurangan berakibat Diskualifikasi.</p>
                  </div>
                </label>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white/60 hover:bg-white/90 transition-all shadow-sm">
                <label className="flex items-start gap-4 cursor-pointer">
                  <div className="mt-1 relative flex items-center justify-center">
                    <input type="checkbox" checked={check3} onChange={(e) => setCheck3(e.target.checked)} className="w-5 h-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer peer" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">3. Integritas Hasil & Hak Prerogatif Institusi</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed text-justify">
                      Saya memahami bahwa kerahasiaan nilai sementara dijaga penuh demi objektivitas. Penilaian akhir adalah hasil dari pertimbangan akademik dan kesesuaian karakter dengan visi institusi. Dengan ini, saya menerima dengan lapang dada bahwa keputusan akhir Tim Penguji dan Pihak Sekolah bersifat mutlak, mengikat, dan merupakan hak prerogatif institusi yang <b>tidak dapat diganggu gugat, diintervensi, maupun diperkarakan secara hukum melalui pihak eksternal manapun (termasuk LSM, lembaga independen, wartawan, media massa, atau pihak lainnya)</b> di kemudian hari. Apapun hasilnya, saya menyatakan menerima keputusan tersebut <b>serta bersedia menanggung akibat dan bertanggung jawab secara pribadi apabila pelibatan pihak luar tersebut sampai terjadi.</b>
                    </p>
                  </div>
                </label>
              </div>

              {/* Tanda Tangan Elektronik */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 mt-6">
                <h3 className="font-bold text-slate-800 mb-2">Tanda Tangan Elektronik</h3>
                <p className="text-sm text-slate-500 mb-4">Sebagai pengganti tanda tangan basah, silakan buat tanda tangan Anda di area yang disediakan dan ketik nama lengkap Anda (<b>{peserta.nama}</b>) di bawah ini sebagai bukti persetujuan sah dan mengikat secara hukum.</p>
                
                <div className="bg-white border-2 border-slate-300 rounded-xl mb-4 relative overflow-hidden h-40">
                  <SignatureCanvas 
                    ref={sigCanvas}
                    onEnd={() => setHasSignature(!sigCanvas.current.isEmpty())}
                    penColor="#3730a3"
                    canvasProps={{className: 'w-full h-full'}}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button 
                      onClick={handleClearSignature} 
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-lg font-medium transition-colors"
                    >
                      Hapus Ulang
                    </button>
                  </div>
                  {!hasSignature && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="text-slate-300 text-2xl font-handwriting opacity-50 select-none">Tanda Tangan Disini</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                  <div className="w-full md:w-2/3">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Ketik Nama Lengkap Anda (Sebagai Validasi)</label>
                    <input 
                      type="text" 
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder={peserta.nama}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div className="w-full md:w-1/3 text-left md:text-right">
                    <p className="text-sm text-slate-500">Banyuwangi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold text-slate-800 mt-1">{signature || '.......................'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200/60">
              <p className="text-xs font-semibold text-slate-400 mb-4 sm:mb-0">* Centang semua kotak & lengkapi tanda tangan</p>
              <button 
                disabled={!(check1 && check2 && check3 && isSignatureValid) || isSubmitting}
                onClick={handleAgreeSubmit}
                className={`premium-btn w-full sm:w-auto px-8 py-3.5 transition-all ${check1 && check2 && check3 && isSignatureValid && !isSubmitting ? '' : 'opacity-60 cursor-not-allowed'}`}
              >
                {isSubmitting ? 'Memproses...' : 'Lanjutkan ke Ruang Tunggu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jika sudah setuju, tampilkan Live Dashboard Tracker
  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8">
      <div className="aurora-bg fixed inset-0 z-0"></div>
      
      <div className="max-w-4xl mx-auto relative z-10 animate-fade-in-up space-y-6">
        {/* Header */}
        <header className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
              {peserta.nama.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg">{peserta.nama}</h1>
              <p className="text-xs text-slate-500 font-mono tracking-widest">{peserta.nomorPeserta}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-4 md:mt-0 text-xs font-bold text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 hover:bg-rose-100 transition-colors shadow-sm">
            Keluar Aplikasi
          </button>
        </header>

        {/* Status Card */}
        <div className="premium-card p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-auto text-center md:text-left">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Status Terkini</h2>
            <div className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-lg border border-blue-200 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping mr-3"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute mr-3"></span>
              <span className="pl-4">{peserta.statusSeleksi === 'PENDING' ? 'MENUNGGU PANGGILAN' : peserta.statusSeleksi.replace(/_/g, ' ')}</span>
            </div>
          </div>
          <div className="flex-1 bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
             <p className="text-sm text-slate-600 leading-relaxed font-medium">
               <strong className="text-slate-800">Instruksi:</strong> Silakan standby di ruang tunggu. Sistem akan memperbarui status Anda secara otomatis ketika Anda dipanggil oleh panitia ke tahapan berikutnya.
             </p>
          </div>
        </div>

        {/* Live Score Panel */}
        {settings.liveScoreOpen && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-8 rounded-3xl shadow-xl border border-slate-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z"/></svg>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-wide">LIVE SCORECARD</h2>
                  <p className="text-slate-400 text-sm mt-1">Transparansi Nilai Seleksi Secara Real-Time</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 text-xs font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Nilai CBT</span>
                  <span className="text-3xl font-black text-white">{peserta.nilaiCbt ?? '-'}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Microteaching</span>
                  <span className="text-3xl font-black text-white">{peserta.nilaiMicro ?? '-'}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Wawancara</span>
                  <span className="text-3xl font-black text-white">{peserta.nilaiWawancara ?? '-'}</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Kasus & Sikap</span>
                  <span className="text-3xl font-black text-white">{peserta.nilaiSikap ?? '-'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tahapan Seleksi Tracker */}
        <div className="premium-card p-6 md:p-8 rounded-3xl">
          <h2 className="font-bold text-slate-800 text-lg mb-8 border-b pb-4">Jalur Antrean Ujian Anda</h2>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-indigo-100 before:via-slate-200 before:to-transparent">
            
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-green-500 text-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-sm">Validasi Administrasi</h3>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-green-100 text-green-700">SELESAI</span>
                </div>
                <p className="text-xs text-slate-500">Pemberkasan dan validasi identitas di Meja 1.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                peserta.statusSeleksi === 'SELESAI_CBT' ? 'bg-green-500 text-white' : 'bg-indigo-500 text-white'
              }`}>
                {peserta.statusSeleksi === 'SELESAI_CBT' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                )}
              </div>
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border-2 shadow-md transform hover:-translate-y-1 transition-transform ${
                peserta.statusSeleksi === 'SELESAI_CBT' ? 'border-green-400 bg-green-50/50' : 'border-indigo-400 bg-indigo-50/50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-bold text-sm ${peserta.statusSeleksi === 'SELESAI_CBT' ? 'text-green-900' : 'text-indigo-900'}`}>Computer Based Test (CBT)</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                    peserta.statusSeleksi === 'SELESAI_CBT' ? 'bg-green-200 text-green-800' 
                    : !cbtOpen ? 'bg-rose-200 text-rose-800' 
                    : 'bg-indigo-200 text-indigo-800'
                  }`}>
                    {peserta.statusSeleksi === 'SELESAI_CBT' ? 'SELESAI' 
                      : !cbtOpen ? 'DITUTUP' 
                      : 'TERSEDIA'}
                  </span>
                </div>
                <p className={`text-xs mb-4 font-medium ${
                  peserta.statusSeleksi === 'SELESAI_CBT' ? 'text-green-700/80' 
                  : !cbtOpen ? 'text-rose-700/80'
                  : 'text-indigo-700/80'
                }`}>
                  {peserta.statusSeleksi === 'SELESAI_CBT' 
                    ? `Anda telah menyelesaikan ujian CBT. Menunggu panggilan berikutnya.`
                    : !cbtOpen 
                      ? (settings.cbtMode === 'auto' ? `Ruang ujian CBT dibuka pada pukul ${settings.cbtStartTime} - ${settings.cbtEndTime}. Harap tunggu.` : 'Ruang ujian CBT saat ini masih ditutup oleh panitia. Harap tunggu.')
                      : 'Ruang CBT sudah bisa diakses. Silakan mulai ujian Anda.'}
                </p>
                {peserta.statusSeleksi !== 'SELESAI_CBT' && cbtOpen && (
                  <button 
                    onClick={() => router.push('/peserta/cbt')}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    Masuk Ujian CBT
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-400 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="text-sm font-bold">3</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border border-slate-100 bg-slate-50/40 shadow-sm opacity-60">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-600 text-sm">Tahapan Wawancara</h3>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-200 text-slate-600">TERKUNCI</span>
                </div>
                <p className="text-xs text-slate-400">Microteaching & Wawancara Kompetensi.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
