import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Menyiapkan seed data lengkap Platform Pertanian Padi Desa Cirebon Girang...");

  // Bersihkan data lama
  await prisma.auditLog.deleteMany();
  await prisma.aiChatMessage.deleteMany();
  await prisma.aiChatSession.deleteMany();
  await prisma.informasiPertanian.deleteMany();
  await prisma.panen.deleteMany();
  await prisma.aktivitasBudidaya.deleteMany();
  await prisma.musimTanam.deleteMany();
  await prisma.lahan.deleteMany();
  await prisma.petani.deleteMany();
  await prisma.kelompokTani.deleteMany();
  await prisma.user.deleteMany();

  const hashAdmin = await bcrypt.hash("Karisma123", 10);
  const hashDesa = await bcrypt.hash("Karsiman123", 10);
  const hashSukardi = await bcrypt.hash("Sukardi123", 10);
  const hashSutarjo = await bcrypt.hash("Sutarjo123", 10);
  const hashKaryono = await bcrypt.hash("Karyono123", 10);

  // ─────────────────────────────────────────────────────────────
  // 1. KELOMPOK TANI (POKTAN) DESA CIREBON GIRANG
  // ─────────────────────────────────────────────────────────────
  const poktanSriRejeki = await prisma.kelompokTani.create({
    data: {
      nama: "Kelompok Tani Sri Rejeki",
      ketua: "Bapak Sutarjo",
      wilayah: "Dusun Karang Anyar / Blok Manis",
      deskripsi: "Kelompok tani fokus komoditas padi sawah irigasi teknis dengan sistem tanam jajar legowo.",
      nomorKontak: "0813-9988-7766",
    },
  });

  const poktanTaniMakmur = await prisma.kelompokTani.create({
    data: {
      nama: "Kelompok Tani Tani Makmur",
      ketua: "H. Karyono",
      wilayah: "Dusun Girang Hilir / Blok Wage",
      deskripsi: "Kelompok tani pengelola hamparan sawah produktif varietas unggul Inpari 32 dan Ciherang.",
      nomorKontak: "0812-2233-4455",
    },
  });

  const poktanSumberSubur = await prisma.kelompokTani.create({
    data: {
      nama: "Kelompok Tani Sumber Subur",
      ketua: "Mang Rasidi",
      wilayah: "Dusun Cirebon Ilir / Blok Pahing",
      deskripsi: "Kelompok tani pembina kelompok mandiri pupuk organik dan percontohan irigasi berselang.",
      nomorKontak: "0857-3344-5566",
    },
  });

  console.log("✅ 3 Kelompok Tani Desa Cirebon Girang dibuat.");

  // ─────────────────────────────────────────────────────────────
  // 2. USER & AKUN UTAMA
  // ─────────────────────────────────────────────────────────────

  // A. ADMIN SISTEM
  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      fullName: "Karisma Siti Nabila",
      email: "Karismasitinabila7@gmail.com",
      phone: "0812-3456-7890",
      role: "ADMIN",
      passwordHash: hashAdmin,
      isActive: true,
    },
  });

  // B. PERANGKAT DESA (Kaur Ekbang)
  const desaUser = await prisma.user.create({
    data: {
      username: "perangkat_desa",
      fullName: "Bapak Karsiman, S.Sos",
      email: "karsiman@gmail.com",
      phone: "081298765432",
      role: "PERANGKAT_DESA",
      passwordHash: hashDesa,
      isActive: true,
    },
  });

  // C. PETANI UTAMA (Sukardi)
  const petaniUser = await prisma.user.create({
    data: {
      username: "sukardi",
      fullName: "Bapak Sukardi",
      email: "sukardi@gmail.com",
      phone: "085211223344",
      role: "PETANI",
      passwordHash: hashSukardi,
      isActive: true,
      petani: {
        create: {
          nik: "3209121508750001",
          namaLengkap: "Bapak Sukardi",
          nomorTelepon: "0852-1122-3344",
          alamat: "RT 03/RW 02 Blok Manis Desa Cirebon Girang",
          jenisKelamin: "LAKI_LAKI",
          kelompokTaniId: poktanSriRejeki.id,
        },
      },
    },
    include: { petani: true },
  });

  // D. PETANI 2 (Sutarjo - Ketua Poktan Sri Rejeki)
  const sutarjoUser = await prisma.user.create({
    data: {
      username: "sutarjo",
      fullName: "Bapak Sutarjo",
      email: "sutarjo@gmail.com",
      phone: "081399887766",
      role: "PETANI",
      passwordHash: hashSutarjo,
      isActive: true,
      petani: {
        create: {
          nik: "3209121104680002",
          namaLengkap: "Bapak Sutarjo",
          nomorTelepon: "0813-9988-7766",
          alamat: "RT 01/RW 02 Blok Manis Desa Cirebon Girang",
          jenisKelamin: "LAKI_LAKI",
          kelompokTaniId: poktanSriRejeki.id,
        },
      },
    },
    include: { petani: true },
  });

  // E. PETANI 3 (H. Karyono - Ketua Poktan Tani Makmur)
  const karyonoUser = await prisma.user.create({
    data: {
      username: "karyono",
      fullName: "Bapak H. Karyono",
      email: "karyono@gmail.com",
      phone: "081222334455",
      role: "PETANI",
      passwordHash: hashKaryono,
      isActive: true,
      petani: {
        create: {
          nik: "3209122209700003",
          namaLengkap: "Bapak H. Karyono",
          nomorTelepon: "0812-2233-4455",
          alamat: "RT 04/RW 03 Blok Wage Desa Cirebon Girang",
          jenisKelamin: "LAKI_LAKI",
          kelompokTaniId: poktanTaniMakmur.id,
        },
      },
    },
    include: { petani: true },
  });

  console.log("✅ Akun Pengguna & Profil Petani berhasil disiapkan.");

  // ─────────────────────────────────────────────────────────────
  // 3. DATA LAHAN PERTANIAN
  // ─────────────────────────────────────────────────────────────
  const sukardiPetaniId = petaniUser.petani!.id;
  const sutarjoPetaniId = sutarjoUser.petani!.id;
  const karyonoPetaniId = karyonoUser.petani!.id;

  // Lahan Sukardi
  const lahanSukardi1 = await prisma.lahan.create({
    data: {
      petaniId: sukardiPetaniId,
      namaLahan: "Petak Sawah Blok Manis Barat",
      luasLahan: 14000, // 1.4 Ha
      satuanLuas: "m²",
      lokasi: "Blok Manis, Dekat Saluran Sekunder Cipager",
      latitude: -6.7742,
      longitude: 108.5338,
      status: "AKTIF",
      catatan: "Sawah berpengairan teknis lancar sepanjang tahun.",
    },
  });

  const lahanSukardi2 = await prisma.lahan.create({
    data: {
      petaniId: sukardiPetaniId,
      namaLahan: "Petak Sawah Galengan Wetan",
      luasLahan: 8500, // 0.85 Ha
      satuanLuas: "m²",
      lokasi: "Blok Manis Sisi Timur, Perbatasan Girang Hilir",
      latitude: -6.7728,
      longitude: 108.5415,
      status: "AKTIF",
      catatan: "Kondisi tanah subur lempung liat berpasir.",
    },
  });

  // Lahan Sutarjo
  const lahanSutarjo = await prisma.lahan.create({
    data: {
      petaniId: sutarjoPetaniId,
      namaLahan: "Sawah Hamparan Manis Tengah",
      luasLahan: 20000, // 2 Ha
      satuanLuas: "m²",
      lokasi: "Dusun Karang Anyar Blok Manis",
      latitude: -6.7708,
      longitude: 108.5372,
      status: "AKTIF",
      catatan: "Lahan demplot percontohan Poktan Sri Rejeki.",
    },
  });

  // Lahan Karyono
  const lahanKaryono = await prisma.lahan.create({
    data: {
      petaniId: karyonoPetaniId,
      namaLahan: "Sawah Lembah Wage",
      luasLahan: 17500, // 1.75 Ha
      satuanLuas: "m²",
      lokasi: "Blok Wage Dusun Girang Hilir",
      latitude: -6.7765,
      longitude: 108.5435,
      status: "AKTIF",
      catatan: "Irigasi teknis subur dengan drainase tertata baik.",
    },
  });

  console.log("✅ 4 Petak Lahan Sawah berhasil dibuat.");

  // ─────────────────────────────────────────────────────────────
  // 4. MUSIM TANAM & AKTIVITAS BUDIDAYA & PANEN
  // ─────────────────────────────────────────────────────────────

  // Musim 1 (Sedang Berjalan - MT1 Rendeng 2026/2027) di Lahan Sukardi 1
  const musimSukardiAktif = await prisma.musimTanam.create({
    data: {
      lahanId: lahanSukardi1.id,
      namaMusim: "MT1 Rendeng 2026/2027 - Blok Manis",
      varietasPadi: "Inpari 32",
      tanggalMulai: new Date("2026-08-01"),
      tanggalTanam: new Date("2026-08-15"),
      estimasiPanen: new Date("2026-11-20"),
      status: "BERJALAN",
      catatan: "Target produktivitas 7-8 ton gabah per hektar dengan benih bersertifikat.",
    },
  });

  // Aktivitas Budidaya MT1 Sukardi
  await prisma.aktivitasBudidaya.createMany({
    data: [
      {
        musimTanamId: musimSukardiAktif.id,
        jenisAktivitas: "Persiapan Lahan",
        tanggal: new Date("2026-08-05"),
        deskripsi: "Pengolahan tanah, pembajakan dengan traktor roda dua, serta perbaikan pematang sawah.",
        biaya: 750000,
        bahan: "Bahan bakar solar, tenaga kerja bajak 2 orang",
      },
      {
        musimTanamId: musimSukardiAktif.id,
        jenisAktivitas: "Penanaman",
        tanggal: new Date("2026-08-15"),
        deskripsi: "Penanaman bibit padi umur 18 HSS dengan pola tanam Jajar Legowo 2:1.",
        biaya: 900000,
        bahan: "Bibit Inpari 32 label biru 35 kg",
      },
      {
        musimTanamId: musimSukardiAktif.id,
        jenisAktivitas: "Pemupukan",
        tanggal: new Date("2026-08-27"),
        deskripsi: "Pemupukan pertama umur 12 HST menggunakan Urea dan NPK Phonska.",
        biaya: 650000,
        bahan: "Urea 75 kg, NPK Phonska 150 kg",
      },
      {
        musimTanamId: musimSukardiAktif.id,
        jenisAktivitas: "Pengairan",
        tanggal: new Date("2026-09-10"),
        deskripsi: "Pengaturan sirkulasi air irigasi saluran tersier sistem macak-macak.",
        biaya: 100000,
        bahan: "Pintu air tersier blok barat",
      },
      {
        musimTanamId: musimSukardiAktif.id,
        jenisAktivitas: "Pengendalian Hama",
        tanggal: new Date("2026-09-25"),
        deskripsi: "Penyemprotan pencegahan hama wereng batang coklat (WBC) dan ulat penggerek batang.",
        biaya: 350000,
        bahan: "Insektisida sistemik berbahan aktif Pimetrozin",
      },
    ],
  });

  // Musim 2 (Sedang Berjalan) di Lahan Sukardi 2
  const musimSukardi2 = await prisma.musimTanam.create({
    data: {
      lahanId: lahanSukardi2.id,
      namaMusim: "MT1 Rendeng 2026/2027 - Galengan Wetan",
      varietasPadi: "Ciherang",
      tanggalMulai: new Date("2026-08-20"),
      tanggalTanam: new Date("2026-09-01"),
      estimasiPanen: new Date("2026-12-10"),
      status: "BERJALAN",
      catatan: "Penanaman varietas Ciherang untuk pemenuhan kebutuhan beras premium lokal.",
    },
  });

  await prisma.aktivitasBudidaya.createMany({
    data: [
      {
        musimTanamId: musimSukardi2.id,
        jenisAktivitas: "Penanaman",
        tanggal: new Date("2026-09-01"),
        deskripsi: "Tanam serentak bersama kelompok tani Sri Rejeki.",
        biaya: 600000,
        bahan: "Bibit Ciherang 25 kg",
      },
      {
        musimTanamId: musimSukardi2.id,
        jenisAktivitas: "Pemupukan",
        tanggal: new Date("2026-09-15"),
        deskripsi: "Pemupukan susulan NPK berimbang.",
        biaya: 450000,
        bahan: "Urea 50 kg, SP-36 25 kg, Phonska 100 kg",
      },
    ],
  });

  // Musim 3 (Selesai dengan Panen Gabah) di Lahan Sukardi 1 (Periode MT Gadu Sebelumnya)
  const musimSukardiSelesai = await prisma.musimTanam.create({
    data: {
      lahanId: lahanSukardi1.id,
      namaMusim: "MT2 Gadu 2026 - Blok Manis",
      varietasPadi: "Ciherang",
      tanggalMulai: new Date("2026-03-01"),
      tanggalTanam: new Date("2026-03-15"),
      estimasiPanen: new Date("2026-06-25"),
      status: "SELESAI",
      catatan: "Hasil panen sukses melampaui target musim gadu.",
    },
  });

  await prisma.panen.create({
    data: {
      musimTanamId: musimSukardiSelesai.id,
      tanggalPanen: new Date("2026-06-25"),
      jumlahProduksi: 8800, // 8.8 Ton
      satuan: "kg",
      kualitas: "Gabah Kering Panen (GKP) Grade A",
      catatan: "Bulir padi bernas, rendemen beras giling 68%, kadar air 14%.",
    },
  });

  // Musim 4 (Selesai dengan Panen Gabah) di Lahan Karyono
  const musimKaryonoSelesai = await prisma.musimTanam.create({
    data: {
      lahanId: lahanKaryono.id,
      namaMusim: "MT2 Gadu 2026 - Lembah Wage",
      varietasPadi: "Inpari 32",
      tanggalMulai: new Date("2026-03-10"),
      tanggalTanam: new Date("2026-03-25"),
      estimasiPanen: new Date("2026-07-05"),
      status: "SELESAI",
      catatan: "Panen bersama menggunakan mesin combine harvester Poktan Tani Makmur.",
    },
  });

  await prisma.panen.create({
    data: {
      musimTanamId: musimKaryonoSelesai.id,
      tanggalPanen: new Date("2026-07-05"),
      jumlahProduksi: 11200, // 11.2 Ton
      satuan: "kg",
      kualitas: "Gabah Kering Panen Super",
      catatan: "Produksi mencapai 6.4 ton per hektar, kualitas gabah sangat bersih.",
    },
  });

  // Musim 5 (Sedang Berjalan) di Lahan Sutarjo
  const musimSutarjoAktif = await prisma.musimTanam.create({
    data: {
      lahanId: lahanSutarjo.id,
      namaMusim: "MT1 Rendeng 2026/2027 - Hamparan Manis",
      varietasPadi: "Inpari 32",
      tanggalMulai: new Date("2026-08-10"),
      tanggalTanam: new Date("2026-08-25"),
      estimasiPanen: new Date("2026-11-28"),
      status: "BERJALAN",
      catatan: "Lahan hamparan utama kelompok tani.",
    },
  });

  await prisma.aktivitasBudidaya.createMany({
    data: [
      {
        musimTanamId: musimSutarjoAktif.id,
        jenisAktivitas: "Penanaman",
        tanggal: new Date("2026-08-25"),
        deskripsi: "Penanaman serentak jajar legowo.",
        biaya: 1200000,
        bahan: "Bibit Inpari 32 50 kg",
      },
      {
        musimTanamId: musimSutarjoAktif.id,
        jenisAktivitas: "Pemupukan",
        tanggal: new Date("2026-09-08"),
        deskripsi: "Aplikasi pupuk dasar urea dan SP-36.",
        biaya: 950000,
        bahan: "Urea 100 kg, Phonska 200 kg",
      },
    ],
  });

  console.log("✅ 5 Musim Tanam, 9 Aktivitas Budidaya, dan 2 Data Panen berhasil dibuat.");

  // ─────────────────────────────────────────────────────────────
  // 5. INFORMASI PERTANIAN & PENGUMUMAN DESA
  // ─────────────────────────────────────────────────────────────
  await prisma.informasiPertanian.createMany({
    data: [
      {
        judul: "Penyaluran Pupuk Bersubsidi Musim Tanam Rendeng 2026/2027",
        isi: "Diberitahukan kepada seluruh anggota Kelompok Tani Desa Cirebon Girang bahwa penebusan pupuk bersubsidi (Urea dan NPK Phonska) dapat dilakukan di kios resmi desa mulai 10 Oktober 2026 dengan membawa KTP dan Kartu Tani.",
        kategori: "Pupuk",
        status: "PUBLISHED",
        tanggalPublikasi: new Date(),
        penulisId: desaUser.id,
        namaPenulis: desaUser.fullName,
      },
      {
        judul: "Antisipasi Cuaca Ekstrem dan Serangan Hama Wereng Batang Coklat",
        isi: "Memasuki puncak musim penghujan, Dinas Pertanian dan Balai Desa mengimbau petani untuk melakukan pengamatan rutin seminggu sekali, menjaga ketinggian air macak-macak, dan segera melapor bila ditemukan koloni wereng.",
        kategori: "Hama & Penyakit",
        status: "PUBLISHED",
        tanggalPublikasi: new Date(),
        penulisId: adminUser.id,
        namaPenulis: adminUser.fullName,
      },
      {
        judul: "Jadwal Gropyokan Tikus dan Pembersihan Saluran Tersier Desa",
        isi: "Kegiatan gotong royong gropyokan tikus serentak seluruh Poktan akan dilaksanakan pada hari Minggu di Blok Manis dan Blok Wage. Diharapkan partisipasi seluruh warga tani.",
        kategori: "Kegiatan Desa",
        status: "PUBLISHED",
        tanggalPublikasi: new Date(),
        penulisId: desaUser.id,
        namaPenulis: desaUser.fullName,
      },
    ],
  });

  // ─────────────────────────────────────────────────────────────
  // 6. AUDIT LOG AWAL
  // ─────────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: "CREATE",
        entity: "System",
        details: "Inisialisasi sistem database Pertanian Padi Desa Cirebon Girang versi Final",
      },
      {
        userId: desaUser.id,
        action: "UPDATE",
        entity: "KelompokTani",
        details: "Perangkat Desa memverifikasi keanggotaan Poktan Sri Rejeki dan Tani Makmur",
      },
    ],
  });

  console.log("✅ Seeding selesai sukses! Kredensial akun untuk pengujian:");
  console.log("   🌾 Petani        : sukardi@gmail.com | Sukardi123 (Redirect: /petani)");
  console.log("   🏛️ Perangkat Desa: karsiman@gmail.com | Karsiman123 (Redirect: /desa)");
  console.log("   🛡️ Administrator : Karismasitinabila7@gmail.com | Karisma123 (Redirect: /admin)");
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
