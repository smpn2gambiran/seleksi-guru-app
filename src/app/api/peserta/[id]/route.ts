import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Allow updating statusSeleksi, or any scores
    const updateData: any = {};
    if (body.statusSeleksi !== undefined) updateData.statusSeleksi = body.statusSeleksi;
    if (body.nilaiAdministrasi !== undefined) updateData.nilaiAdministrasi = body.nilaiAdministrasi;
    if (body.nilaiCbt !== undefined) updateData.nilaiCbt = body.nilaiCbt;
    if (body.nilaiMicro !== undefined) updateData.nilaiMicro = body.nilaiMicro;
    if (body.nilaiWawancara !== undefined) updateData.nilaiWawancara = body.nilaiWawancara;
    if (body.nilaiSikap !== undefined) updateData.nilaiSikap = body.nilaiSikap;
    if (body.nilaiAkhir !== undefined) updateData.nilaiAkhir = body.nilaiAkhir;

    // Auto-calculate nilaiAkhir if all 5 scores are present
    const currentPeserta = await prisma.peserta.findUnique({ where: { id } });
    if (currentPeserta) {
      const merged = { ...currentPeserta, ...updateData };
      if (
        merged.nilaiAdministrasi !== null &&
        merged.nilaiCbt !== null && 
        merged.nilaiMicro !== null && 
        merged.nilaiWawancara !== null && 
        merged.nilaiSikap !== null
      ) {
        updateData.nilaiAkhir = 
          (merged.nilaiAdministrasi * 0.10) +
          (merged.nilaiCbt * 0.15) + 
          (merged.nilaiMicro * 0.20) + 
          (merged.nilaiWawancara * 0.30) + 
          (merged.nilaiSikap * 0.25);
      }
    }

    const updatedPeserta = await prisma.peserta.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updatedPeserta);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update peserta' }, { status: 500 });
  }
}
