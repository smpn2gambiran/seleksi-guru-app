import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const u = username?.toLowerCase();

    // Validasi Admin
    if (u === (process.env.ADMIN_USER || 'admin') && password === (process.env.ADMIN_PASS || 'admin123')) {
      return NextResponse.json({ success: true, redirect: '/admin' });
    }
    
    // Validasi Charisma
    if (u === (process.env.CHARISMA_USER || 'charisma') && password === (process.env.CHARISMA_PASS || 'guru2026')) {
      return NextResponse.json({ success: true, redirect: '/penguji/charisma' });
    }

    // Validasi Budi
    if (u === (process.env.BUDI_USER || 'budi') && password === (process.env.BUDI_PASS || 'guru2026')) {
      return NextResponse.json({ success: true, redirect: '/penguji/budi' });
    }

    // Validasi Lukman
    if (u === (process.env.LUKMAN_USER || 'lukman') && password === (process.env.LUKMAN_PASS || 'guru2026')) {
      return NextResponse.json({ success: true, redirect: '/penguji/lukman' });
    }

    // Validasi Peserta
    if (u?.startsWith('p-')) {
      const pesertaId = u.toUpperCase(); // e.g. P-001
      const expectedPassword = pesertaId.replace('-', '') + "26";
      
      if (password === expectedPassword) {
        // Cek apakah ada di database
        const peserta = await prisma.peserta.findUnique({
          where: { nomorPeserta: pesertaId }
        });
        
        if (peserta) {
          // Set cookie sesi sederhana untuk mengenali ID ini (di next response headers, kita bisa set-cookie tapi untuk sekarang ini cukup respons)
          // Sebagai POC (Proof of Concept), kita akan passing id di URL atau local storage (tapi idealnya lewat cookies).
          const response = NextResponse.json({ success: true, redirect: '/peserta' });
          response.cookies.set('pesertaId', pesertaId, { path: '/' });
          return response;
        }
      }
    }

    return NextResponse.json(
      { success: false, error: 'Kredensial tidak valid' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
