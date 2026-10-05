import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import soalCbt from '@/data/soal-cbt.json';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const pesertaId = cookieStore.get('pesertaId');

    if (!pesertaId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answers, reason } = await req.json();

    // Hitung nilai
    let correct = 0;
    const total = soalCbt.length;

    for (const [id, answer] of Object.entries(answers as Record<string, string>)) {
      const soal = soalCbt.find(s => s.id === parseInt(id));
      if (soal && soal.kunci === answer) {
        correct++;
      }
    }

    const score = (correct / total) * 100;

    await prisma.peserta.update({
      where: { nomorPeserta: pesertaId.value },
      data: { 
        nilaiCbt: score,
        statusSeleksi: 'SELESAI_CBT'
      }
    });

    return NextResponse.json({ success: true, score, reason });
  } catch (error) {
    console.error('Submit CBT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
