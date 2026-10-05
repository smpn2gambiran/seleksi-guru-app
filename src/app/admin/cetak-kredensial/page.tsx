'use client';
import { useEffect, useState } from 'react';

export default function CetakKredensial() {
  const [peserta, setPeserta] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeserta = async () => {
      try {
        const res = await fetch('/api/peserta');
        if (res.ok) {
          const data = await res.json();
          setPeserta(data);
          
          // Auto trigger print after a short delay so DOM can render
          setTimeout(() => {
            window.print();
          }, 500);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPeserta();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-bold">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Memuat Data Peserta...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-[1000px] mx-auto print:max-w-full print:p-0">
        
        {/* Print Header Actions (Hidden when printing) */}
        <div className="mb-8 flex justify-between items-center print:hidden border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Cetak Kredensial Peserta</h1>
            <p className="text-slate-500">Potong kertas ini dan bagikan kepada peserta saat registrasi ulang.</p>
          </div>
          <button 
            onClick={handlePrint}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Kredensial
          </button>
        </div>

        {/* Printable Grid - Staff & Penguji */}
        <div className="mb-6 page-break-inside-avoid">
           <h2 className="text-xl font-bold text-slate-800 mb-4 print:text-black">Kredensial Panitia & Penguji</h2>
           <div className="grid grid-cols-2 gap-4 print:grid-cols-2 print:gap-4 print:text-black">
             {[
               { name: "Administrator", role: "Panitia Induk", user: "admin", pass: "admin123" },
               { name: "Bapak Budi", role: "Penguji Microteaching", user: "budi", pass: "guru2026" },
               { name: "Bapak Lukman", role: "Penguji Wawancara", user: "lukman", pass: "guru2026" },
               { name: "Bapak Charisma", role: "Penguji Kasus & Sikap", user: "charisma", pass: "guru2026" }
             ].map((staff) => (
                <div key={staff.user} className="border-2 border-solid border-slate-800 rounded-xl p-6 relative bg-slate-50 page-break-inside-avoid">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800 text-white rounded-bl-xl rounded-tr-xl text-xs font-bold">
                    PANITIA / PENGUJI
                  </div>
                  
                  <div className="text-center mb-4 mt-2">
                    <h2 className="text-lg font-black uppercase tracking-widest text-slate-800">KARTU AKSES SISTEM</h2>
                    <p className="text-[10px] font-bold text-slate-500">{staff.role}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="font-bold text-slate-800 text-sm">{staff.name}</p>
                    </div>
                    
                    <div className="bg-white border-2 border-slate-800 p-3 rounded-lg mt-4 text-center">
                      <div className="mb-3 pb-3 border-b border-slate-200">
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Alamat Portal Login</p>
                         <p className="font-mono font-bold text-sm text-slate-800">{typeof window !== 'undefined' ? window.location.origin : 'Portal Utama'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Username</p>
                          <p className="font-mono font-bold text-lg text-indigo-700 tracking-wider">{staff.user}</p>
                        </div>
                        <div className="border-l border-slate-200">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Password</p>
                          <p className="font-mono font-bold text-lg text-rose-600 tracking-wider">{staff.pass}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                     <p className="text-[9px] text-slate-500 font-bold">Rahasia - Hanya untuk Panitia dan Penguji</p>
                  </div>
                </div>
             ))}
           </div>
        </div>

        {/* Printable Grid - Peserta */}
        <div className="mb-6">
           <h2 className="text-xl font-bold text-slate-800 mb-4 print:text-black">Kredensial Peserta (Digunting)</h2>
           <div className="grid grid-cols-2 gap-4 print:grid-cols-2 print:gap-4 print:text-black">
          {peserta.map((p) => (
            <div key={p.id} className="border-2 border-dashed border-slate-300 rounded-xl p-6 relative bg-white page-break-inside-avoid">
              <div className="absolute top-0 right-0 px-3 py-1 bg-slate-100 rounded-bl-xl rounded-tr-xl border-b-2 border-l-2 border-dashed border-slate-300 text-xs font-bold text-slate-500">
                Gunting Disini
              </div>
              
              <div className="text-center mb-4">
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-800">KARTU LOGIN PESERTA</h2>
                <p className="text-[10px] font-bold text-slate-500">Seleksi Calon Guru & Tenaga Kependidikan</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Nama Peserta</p>
                  <p className="font-bold text-slate-800 text-sm">{p.nama}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Asal Sekolah</p>
                  <p className="font-semibold text-slate-700 text-sm">{p.asalSekolah || '-'}</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg mt-4 text-center">
                  <div className="mb-3 pb-3 border-b border-slate-200">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Alamat Portal Ujian</p>
                     <p className="font-mono font-bold text-sm text-slate-800">{typeof window !== 'undefined' ? window.location.origin : 'Portal Utama'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Username / ID</p>
                      <p className="font-mono font-bold text-lg text-indigo-700 tracking-wider">{p.nomorPeserta}</p>
                    </div>
                    <div className="border-l border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Password</p>
                      <p className="font-mono font-bold text-lg text-rose-600 tracking-wider">
                        {p.nomorPeserta.replace('-', '') + "26"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                 <p className="text-[9px] text-slate-400">Buka alamat portal ujian di browser Anda (Chrome/Firefox/Safari), lalu gunakan Username dan Password di atas untuk masuk.</p>
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Global Print Styles */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body { 
              background: white !important; 
              color: black !important;
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
            .page-break-inside-avoid { page-break-inside: avoid; }
            @page { margin: 10mm; }
            /* Memaksa warna elemen saat print */
            * { text-shadow: none !important; box-shadow: none !important; }
          }
        `}} />
      </div>
    </div>
  );
}
