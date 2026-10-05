import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const pesertaId = cookieStore.get('pesertaId')?.value;

    if (!pesertaId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const peserta = await prisma.peserta.findUnique({
      where: { nomorPeserta: pesertaId }
    });

    if (!peserta) {
      return NextResponse.json({ error: 'Peserta not found' }, { status: 404 });
    }

    return NextResponse.json(peserta);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
