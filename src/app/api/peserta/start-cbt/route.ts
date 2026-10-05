import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const pesertaId = cookieStore.get('pesertaId');

    if (!pesertaId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const peserta = await prisma.peserta.findUnique({
      where: { nomorPeserta: pesertaId.value }
    });

    if (!peserta) {
      return NextResponse.json({ error: 'Peserta not found' }, { status: 404 });
    }

    // Jika sudah pernah mulai, kembalikan data lama
    if (peserta.cbtStartTime) {
      return NextResponse.json({ success: true, startTime: peserta.cbtStartTime });
    }

    const now = new Date();
    await prisma.peserta.update({
      where: { nomorPeserta: pesertaId.value },
      data: { 
        cbtStartTime: now,
        statusSeleksi: 'SEDANG_UJI_CBT'
      }
    });

    return NextResponse.json({ success: true, startTime: now });
  } catch (error) {
    console.error('Start CBT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
