'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import soalCbt from '@/data/soal-cbt.json';

const CBT_DURATION = 20 * 60; // 20 menit dalam detik

export default function CBTRoom() {
  const router = useRouter();
  const [peserta, setPeserta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [timeLeft, setTimeLeft] = useState(CBT_DURATION);
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ref untuk timer agar tidak stale
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inisialisasi CBT
  useEffect(() => {
    const initCbt = async () => {
      try {
        const res = await fetch('/api/peserta/me');
        if (res.ok) {
          const data = await res.json();
          setPeserta(data);
          
          if (data.statusSeleksi === 'SELESAI_CBT') {
            alert('Anda sudah menyelesaikan ujian CBT.');
            router.push('/peserta');
            return;
          }

          // Catat start time di server
          const startRes = await fetch('/api/peserta/start-cbt', { method: 'POST' });
          const startData = await startRes.json();
          
          if (startData.success) {
            const startTime = new Date(startData.startTime).getTime();
            const now = new Date().getTime();
            const elapsed = Math.floor((now - startTime) / 1000);
            const remaining = CBT_DURATION - elapsed;
            
            if (remaining <= 0) {
              handleSubmit('Waktu Habis Sebelum Mulai');
            } else {
              setTimeLeft(remaining);
            }
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
    
    initCbt();
  }, [router]);

  // Timer logic
  useEffect(() => {
    if (loading || isSubmitting) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit('Waktu Habis');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isSubmitting]);

  // Anti-Cheat (Tab Switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !loading && !isSubmitting) {
        setCheatWarnings(prev => {
          const newCount = prev + 1;
          if (newCount === 1) {
            alert('PERINGATAN (1/2): Anda terdeteksi meninggalkan halaman ujian! Dilarang membuka tab/aplikasi lain. Pelanggaran kedua akan otomatis mendiskualifikasi Anda.');
          } else if (newCount >= 2) {
            alert('DISKUALIFIKASI: Anda telah meninggalkan halaman ujian untuk kedua kalinya. Ujian Anda otomatis dikumpulkan.');
            handleSubmit('Pelanggaran Tab Switch');
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading, isSubmitting]);

  const handleSubmit = async (reason = 'Selesai Manual') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch('/api/peserta/submit-cbt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, reason })
      });
      
      if (res.ok) {
        if (reason !== 'Waktu Habis' && reason !== 'Pelanggaran Tab Switch') {
          alert('Ujian berhasil diselesaikan!');
        }
        router.push('/peserta');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengumpulkan ujian.');
    }
  };

  const handleAnswer = (questionId: number, optionKey: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
    
    // Auto advance setelah 500ms jika bukan soal terakhir
    if (currentQuestion < soalCbt.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => Math.min(soalCbt.length - 1, prev + 1));
      }, 500);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Menyiapkan Ruang CBT...</div>;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const soal = soalCbt[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#f1f5f9] select-none">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            {peserta?.nama.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{peserta?.nama}</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest">{peserta?.nomorPeserta}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sisa Waktu</span>
            <span className={`text-xl font-bold font-mono ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button 
            onClick={() => {
              if(confirm('Apakah Anda yakin ingin mengumpulkan ujian sekarang?')) {
                handleSubmit();
              }
            }}
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            {isSubmitting ? 'Mengirim...' : 'Kumpulkan'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 py-8">
        {/* Progress Bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${(answeredCount / soalCbt.length) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-slate-500 w-16 text-right">
            {answeredCount} / {soalCbt.length}
          </span>
        </div>

        {/* Question Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Soal No. {currentQuestion + 1}</h2>
          </div>
          
          <p className="text-slate-800 font-medium text-lg mb-8 leading-relaxed">
            {soal.pertanyaan}
          </p>

          <div className="space-y-3">
            {Object.entries(soal.pilihan).map(([key, value]) => {
              const isSelected = answers[soal.id] === key;
              return (
                <div 
                  key={key}
                  onClick={() => handleAnswer(soal.id, key)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm scale-[1.02]' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-indigo-600' : 'border-slate-300'
                  }`}>
                    {isSelected && <div className="w-3 h-3 rounded-full bg-indigo-600"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-700">{key}.</span>
                      <span className="text-slate-600">{value as string}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              currentQuestion === 0 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm'
            }`}
          >
            &larr; Sebelumnya
          </button>
          
          <button 
            onClick={() => setCurrentQuestion(prev => Math.min(soalCbt.length - 1, prev + 1))}
            disabled={currentQuestion === soalCbt.length - 1}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              currentQuestion === soalCbt.length - 1
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm'
            }`}
          >
            Selanjutnya &rarr;
          </button>
        </div>

        {/* Grid Nomor Soal (Jump) */}
        <div className="mt-12 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Navigasi Soal</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {soalCbt.map((s, idx) => {
              const isAnswered = !!answers[s.id];
              const isCurrent = currentQuestion === idx;
              
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-full aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                    isCurrent 
                      ? 'ring-2 ring-indigo-600 bg-indigo-50 text-indigo-700'
                      : isAnswered 
                        ? 'bg-green-500 text-white shadow-sm hover:bg-green-600'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
