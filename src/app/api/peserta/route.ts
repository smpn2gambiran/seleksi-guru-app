import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    let whereClause = {};
    if (status) {
      whereClause = { statusSeleksi: status };
    }

    const pesertaList = await prisma.peserta.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(pesertaList);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch peserta' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPeserta = await prisma.peserta.create({
      data: {
        nama: body.nama,
        nomorPeserta: body.nomorPeserta,
        bidangStudi: body.bidangStudi,
        asalSekolah: body.asalSekolah,
        statusSeleksi: 'PENDING',
      },
    });
    return NextResponse.json(newPeserta, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create peserta' }, { status: 500 });
  }
}
