import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating Lahan coordinates and educational articles...");

  // Update coordinates for known lahan
  await prisma.lahan.updateMany({
    where: { namaLahan: { contains: "Manis Barat" } },
    data: { latitude: -6.7742, longitude: 108.5338 }
  });

  await prisma.lahan.updateMany({
    where: { namaLahan: { contains: "Galengan Wetan" } },
    data: { latitude: -6.7728, longitude: 108.5415 }
  });

  await prisma.lahan.updateMany({
    where: { namaLahan: { contains: "Hamparan Manis Tengah" } },
    data: { latitude: -6.7708, longitude: 108.5372 }
  });

  await prisma.lahan.updateMany({
    where: { namaLahan: { contains: "Lembah Wage" } },
    data: { latitude: -6.7765, longitude: 108.5435 }
  });

  // For any remaining lahan without coordinates, set default coordinates within Cirebon Girang
  const allLahan = await prisma.lahan.findMany();
  for (let i = 0; i < allLahan.length; i++) {
    const l = allLahan[i];
    if (!l.latitude || !l.longitude) {
      // offset slightly around Cirebon Girang center (-6.773, 108.538)
      const latOffset = (i % 3 - 1) * 0.003;
      const lngOffset = (Math.floor(i / 3) - 1) * 0.003;
      await prisma.lahan.update({
        where: { id: l.id },
        data: {
          latitude: -6.7735 + latOffset,
          longitude: 108.5385 + lngOffset
        }
      });
    }
  }

  // Get admin or desa user for authoring articles
  const adminUser = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "PERANGKAT_DESA"] } }
  });

  if (adminUser) {
    const guides = [
      {
        judul: "Panduan Lengkap Penanggulangan Hama Wereng Batang Coklat (WBC)",
        kategori: "Hama & Penyakit",
        isi: `Wereng Batang Coklat (Nilaparvata lugens) merupakan salah satu hama paling berbahaya pada pertanaman padi sawah di Desa Cirebon Girang. Hama ini menyerang dengan cara menghisap cairan batang padi sehingga tanaman menguning, mengering layu, dan timbul gejala 'hopperburn' (terbakar).

### 1. Langkah Deteksi Dini:
- Lakukan pengamatan berkala minimal 1 kali seminggu pada pangkal rumpun padi.
- Hitung populasi wereng: Jika ditemukan rata-rata 10-15 ekor per rumpun pada fase vegetatif atau 20 ekor pada fase generatif, segera lakukan tindakan pengendalian.
- Perhatikan keberadaan musuh alami seperti laba-laba serigala (*Pardosa pseudoannulata*) dan kepik mirid.

### 2. Strategi Pengendalian Terpadu (PHT):
- **Pengaturan Air:** Keringkan air sawah secara berkala (pengairan berselang/intermittent). Wereng sangat menyukai kelembaban mikro yang tinggi di pangkal rumpun. Pengeringan sawah 3-4 hari akan menekan laju perkembangbiakan nimfa wereng.
- **Pemupukan Seimbang:** Kurangi penggunaan pupuk Nitrogen (Urea) yang berlebihan. Tanaman yang terlalu rimbun dan sukulen akibat over-nitrogen sangat rentan terhadap serangan wereng. Tingkatkan dosis pupuk Kalium (KCl) untuk mempertebal dinding sel batang padi.
- **Aplikasi Insektisida Selektif:** Gunakan insektisida dengan bahan aktif spesifik seperti Pimetrozin, Buprofezin (penghambat pergantian kulit), atau Tiametoksam. Hindari penyemprotan insektisida piretroid sintetik spektrum luas karena dapat mematikan musuh alami dan memicu resistensi (resurgensi wereng).
- **Teknik Penyemprotan:** Arahkan nozzle semprotan tepat ke pangkal batang rumpun padi, bukan ke daun bagian atas. Lakukan pada pagi hari pukul 06.30 - 09.00 saat embun mengering.`,
        status: "PUBLISHED",
        penulisId: adminUser.id,
        namaPenulis: adminUser.fullName,
        tanggalPublikasi: new Date("2026-09-15")
      },
      {
        judul: "Panduan Pemupukan Berimbang Padi Sawah Berdasarkan HST (Hari Setelah Tanam)",
        kategori: "Pupuk",
        isi: `Pemupukan berimbang adalah kunci untuk mencapai produktivitas padi optimal (7-8 ton/ha) tanpa merusak struktur hara tanah di areal persawahan Cirebon Girang. Prinsip utama adalah 5T: Tepat Jenis, Tepat Dosis, Tepat Waktu, Tepat Cara, dan Tepat Sasaran.

### 1. Jadwal dan Dosis Pemupukan Berdasarkan HST:
- **Fase Dasar (0 - 1 HST sebelum tanam atau saat olah tanah terakhir):**
  - Berikan Pupuk Organik/Kompos matang sebanyak 1-2 ton/ha untuk memperbaiki struktur biologis tanah.
  - Pupuk SP-36 / TSP: 100 kg/ha sebagai sumber fosfat untuk mempercepat inisiasi perakaran anakan baru.
- **Pemupukan Pertama (7 - 14 HST):**
  - Urea: 75 kg/ha
  - NPK Phonska (15-15-15): 150 kg/ha
  - Tujuan: Merangsang pertumbuhan vegetatif awal dan memperbanyak pembentukan anakan produktif.
- **Pemupukan Kedua / Susulan I (21 - 28 HST):**
  - NPK Phonska: 100 kg/ha
  - Urea: 50 kg/ha (bisa disesuaikan dengan pembacaan Bagan Warna Daun/BWD skala 4).
  - Tujuan: Memaksimalkan jumlah anakan produktif dan memperkokoh batang padi.
- **Pemupukan Ketiga / Primordia Bunting (35 - 45 HST):**
  - Urea: 50 kg/ha + KCl: 50 kg/ha
  - Tujuan: Mendukung inisiasi malai, memperpanjang malai padi, dan mencegah bulir hampa (*gabah gabug*).

### 2. Tips Efisiensi Pemupukan:
- Pastikan kondisi sawah dalam keadaan macak-macak (ketinggian air 1-2 cm) saat pupuk ditabur. Jangan menabur pupuk saat air sawah mengalir atau tergenang tinggi karena pupuk kimia akan hanyut.
- Tunda penaburan pupuk jika cuaca mendung gelap atau diperkirakan akan turun hujan lebat dalam 3-4 jam ke depan.`,
        status: "PUBLISHED",
        penulisId: adminUser.id,
        namaPenulis: adminUser.fullName,
        tanggalPublikasi: new Date("2026-09-20")
      },
      {
        judul: "Teknik Pascapanen dan Pengeringan Gabah untuk Menekan Susut Bobot",
        kategori: "Budidaya Padi",
        isi: `Tahap penanganan pascapanen padi menyumbang faktor krusial terhadap rendemen giling dan harga jual gabah kering giling (GKG). Di wilayah Cirebon Girang, kerugian petani sering terjadi akibat kadar air gabah yang terlalu tinggi saat disimpan atau keterlambatan proses perontokan.

### 1. Penentuan Umur Panen yang Tepat:
- Panen dilakukan saat 90-95% bulir padi pada malai telah menguning sempurna, dan daun bendera mulai mengering.
- Kadar air gabah di pohon saat panen idealnya berkisar antara 21% - 24%.
- Pemanenan terlalu dini menghasilkan banyak bulir hijau (*menir*), sedangkan pemanenan terlambat meningkatkan risiko bulir rontok di lahan dan patah saat digiling.

### 2. Perontokan dan Pengangkutan Gabah:
- Perontokan harus dilakukan maksimal 1 x 24 jam setelah tanaman padi dipotong. Penundaan perontokan di atas 24 jam dengan menumpuk malai basah akan menyebabkan fermentasi internal, timbul panas, dan beras menjadi kuning/berbau apek.
- Gunakan terpal plastik bersih sebagai alas saat memotong dan merontok menggunakan *power thresher* untuk meminimalkan gabah tercecer.

### 3. Teknik Pengeringan Menuju Kadar Air 14%:
- Tebarkan gabah di atas lantai jemur atau terpal dengan ketebalan lapisan 3 - 5 cm.
- Lakukan pembalikan gabah secara berkala setiap 2 jam sekali agar pengeringan merata di kedua sisi.
- Waktu penjemuran efektif di wilayah Cirebon adalah pukul 08.00 hingga 14.00 WIB.
- Target kadar air penyimpanan aman di lumbung desa atau karung goni adalah 14% (Kadar Air Gabah Kering Simpan).`,
        status: "PUBLISHED",
        penulisId: adminUser.id,
        namaPenulis: adminUser.fullName,
        tanggalPublikasi: new Date("2026-10-01")
      },
      {
        judul: "Optimalisasi Pengairan Berselang (Intermittent) untuk Meningkatkan Kekuatan Akar Padi",
        kategori: "Budidaya Padi",
        isi: `Sistem pengairan berselang (*intermittent irrigation*) adalah teknologi tata kelola air dengan cara mengairi petak sawah secara berkala: digenangi, dibiarkan mengering sampai permukaan tanah retak rambut, lalu digenangi kembali.

### Manfaat Utama bagi Petani Cirebon Girang:
1. **Menghemat Air Irigasi:** Menghemat penggunaan air saluran hingga 20-30% dibanding metode genangan terus menerus (*continuous flooding*).
2. **Aerasi Tanah Maksimal:** Memberikan kesempatan bagi oksigen masuk ke dalam pori-pori tanah, memicu perakaran padi menembus lebih dalam dan kuat.
3. **Mencegah Keracunan Besi & Asam Organik:** Mengurangi kondisi reduksi berlebih di dalam lumpur sawah yang sering menyebabkan akar busuk berwarna kehitaman.
4. **Menekan Hama & Penyakit:** Lingkungan mikroklimat yang tidak terlalu lembap menurunkan risiko perkembangbiakan wereng coklat dan jamur hawar pelepah (*Rhizoctonia solani*).

### Jadwal Pengaturan Pintu Air:
- Umur 1 - 10 HST: Genangan dangkal 2-3 cm untuk adaptasi bibit baru pindah tanam.
- Umur 11 - 40 HST: Terapkan pengairan berselang (genang 3 cm selama 3 hari, keringkan macak-macak selama 3-4 hari).
- Umur 40 - 65 HST (Fase Pembungaan/Bunting): Pertahankan air tergenang 3-5 cm karena kebutuhan air tanaman sangat tinggi.
- Umur 10 - 15 hari sebelum panen: Keringkan lahan secara total untuk menyeragamkan kematangan bulir gabah dan memudahkan mobilitas pemanenan.`,
        status: "PUBLISHED",
        penulisId: adminUser.id,
        namaPenulis: adminUser.fullName,
        tanggalPublikasi: new Date("2026-10-05")
      }
    ];

    for (const guide of guides) {
      const exists = await prisma.informasiPertanian.findFirst({
        where: { judul: guide.judul }
      });
      if (!exists) {
        await prisma.informasiPertanian.create({
          data: guide
        });
      }
    }
  }

  console.log("Data update completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
