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

    const { tandaTangan } = await req.json();

    if (!tandaTangan) {
      return NextResponse.json({ error: 'Tanda tangan diperlukan' }, { status: 400 });
    }

    const peserta = await prisma.peserta.findUnique({
      where: { nomorPeserta: pesertaId.value }
    });

    if (!peserta) {
      return NextResponse.json({ error: 'Sesi tidak valid, silakan login ulang.' }, { status: 404 });
    }

    const updatedPeserta = await prisma.peserta.update({
      where: { nomorPeserta: pesertaId.value },
      data: { tandaTangan }
    });

    return NextResponse.json({ success: true, peserta: updatedPeserta });
  } catch (error) {
    console.error('Submit agreement error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
