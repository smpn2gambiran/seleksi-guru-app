import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pesertaData = [
  {
    id: "P-001",
    name: "SATRIA YUDHA PRATAMA",
    nik: "3510010805980005",
    alamat: "Dsn. Krajan rt. 03 rw. 01 Desa Purwodadi, Kec. Gambiran, Banyuwangi",
    bidangStudi: "Pendidikan Bahasa dan Sastra Indonesia",
    asalSekolah: "Universitas Jember"
  },
  {
    id: "P-002",
    name: "muhammad syifaun niam",
    nik: "3510081406000001",
    alamat: "krajan, bagorejo, srono, banyuwangi",
    bidangStudi: "ekonomi syariah",
    asalSekolah: "Universitas KH. Mukhtar Syafaat Blokagung"
  },
  {
    id: "P-003",
    name: "Egi sabta hiro",
    nik: "5171042601020003",
    alamat: "Desa cantuk, kec. Singojuruh, kab. Banyuuwangi",
    bidangStudi: "Teknologi rekayasa perangkat lunak",
    asalSekolah: "Politeknik negeri banyuwangi"
  },
  {
    id: "P-004",
    name: "Agam Susilo Aji",
    nik: "3510042503030004",
    alamat: "Dusun Kalisari RT 003 RW 001 Desa Purwoasri Kecamatan Tegaldlimo Kabupaten Banyuwangi",
    bidangStudi: "Teknologi Rekayasa Perangkat Lunak / Bisnis dan Informatika",
    asalSekolah: "Politeknik Negeri Banyuwangi"
  },
  {
    id: "P-005",
    name: "Andini Nabela Putri",
    nik: "3510236104020004",
    alamat: "Dusun Mojoroto, RT 004 RW 002, Tegalsari , Kec. Tegalsari, Kab. Banyuwangi, Jawa Timur",
    bidangStudi: "Teknologi Rekayasa Perangkat Lunak / Bisnis dan Informatika",
    asalSekolah: "Politeknik Negeri Banyuwangi"
  },
  {
    id: "P-006",
    name: "Laksa Imtapreta Setya Mahendri, S.Pi.",
    nik: "3510067108990003",
    alamat: "Dusun Krajan RT 02, RW 02 Desa Cluring, Kacamatan Cluring, Kabupaten Banyuwangi",
    bidangStudi: "Akuakultur (Perikanan)",
    asalSekolah: "Universitas Airlangga"
  },
  {
    id: "P-007",
    name: "BUNGA WAHYU NIRWANA MAYZHURRA ",
    nik: "3510074105980002",
    alamat: "SIDOREJO WETAN 002/001 YOSOMULYO GAMBIRAN ",
    bidangStudi: "PENDIDIKAN FISIKA ",
    asalSekolah: "UNIVERSITAS NEGERI SURABAYA "
  },
  {
    id: "P-008",
    name: "Ilahil Riska Dwi Aji Muarifa",
    nik: "3510054812030002",
    alamat: "Dusun Mangunrejo, Desa Blambangan, Kecamatan Muncar Kabupaten Banyuwangi ",
    bidangStudi: "Fakultas Keguruan Ilmu Pendidikan/Pendidikan Fisika",
    asalSekolah: "Universitas Jember"
  },
  {
    id: "P-009",
    name: "LIA FEBI NOVIANTI",
    nik: "3510225502090002",
    alamat: "Dusun Sumbermanggis, Rt 06/ Rw 13, Desa Barurejo, Kecamatan Siliragung",
    bidangStudi: "Pendidikan Biologi",
    asalSekolah: "Universitas 17 Agustus 1945 Banyuwangi"
  },
  {
    id: "P-010",
    name: "Jesica Cahya Ningrum",
    nik: "3510027008010001",
    alamat: "Dusun Pasembon, Desa Sambirejo, Kecamatan Bangorejo",
    bidangStudi: "Teknik Informatika",
    asalSekolah: "Universitas Muhammadiyah Jember"
  }
];

async function main() {
  console.log('Seeding database from Real Excel Data...');
  for (const p of pesertaData) {
    await prisma.peserta.upsert({
      where: { nomorPeserta: p.id },
      update: {
        nama: p.name,
        nik: p.nik,
        alamat: p.alamat,
        bidangStudi: p.bidangStudi,
        asalSekolah: p.asalSekolah
      },
      create: {
        nama: p.name,
        nomorPeserta: p.id,
        bidangStudi: p.bidangStudi,
        asalSekolah: p.asalSekolah,
        nik: p.nik,
        alamat: p.alamat,
        statusSeleksi: 'PENDING'
      }
    });
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
