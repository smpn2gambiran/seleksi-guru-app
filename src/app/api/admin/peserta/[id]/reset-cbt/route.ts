import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.peserta.update({
      where: { id },
      data: { 
        cbtStartTime: null,
        nilaiCbt: null,
        statusSeleksi: 'PENDING'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset CBT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
