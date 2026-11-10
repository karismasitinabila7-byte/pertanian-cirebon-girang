import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌾 Menambahkan data pelengkap untuk Peta GIS dan Pusat Edukasi Tani...");

  // 1. Ambil user admin atau desa sebagai penulis artikel
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const desa = await prisma.user.findFirst({ where: { role: "PERANGKAT_DESA" } });
  const authorId = desa?.id || admin?.id || "system";
  const authorName = desa?.fullName || admin?.fullName || "Penyuluh Pertanian Desa Cirebon Girang";

  // 2. Ambil poktan dan petani yang ada
  const poktanList = await prisma.kelompokTani.findMany();
  const petaniList = await prisma.petani.findMany({ include: { kelompokTani: true } });

  console.log(`Ditemukan ${poktanList.length} kelompok tani dan ${petaniList.length} petani.`);

  // Buat petani Mang Rasidi jika belum ada untuk Poktan Sumber Subur
  const poktanSumberSubur = poktanList.find(p => p.nama.includes("Sumber Subur")) || poktanList[0];
  let mangRasidi = petaniList.find(p => p.namaLengkap.includes("Rasidi"));

  if (!mangRasidi && poktanSumberSubur) {
    const existingUser = await prisma.user.findUnique({ where: { username: "rasidi" } });
    let rasidiUserId = existingUser?.id;
    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          username: "rasidi",
          fullName: "Mang Rasidi",
          email: "rasidi@gmail.com",
          phone: "085733445566",
          role: "PETANI",
          passwordHash: "$2a$10$K4rB3n4g.JbO6T2L5Qe.6eO.nNZbk7s1j2U3K5M6N7O8P9Q0R1S2T", // password123
          isActive: true
        }
      });
      rasidiUserId = newUser.id;
    }

    if (rasidiUserId) {
      mangRasidi = await prisma.petani.create({
        data: {
          userId: rasidiUserId,
          nik: "3209121804720004",
          namaLengkap: "Mang Rasidi",
          nomorTelepon: "0857-3344-5566",
          alamat: "RT 02/RW 04 Blok Pahing Desa Cirebon Girang",
          jenisKelamin: "LAKI_LAKI",
          kelompokTaniId: poktanSumberSubur.id
        },
        include: { kelompokTani: true }
      });
      console.log("✅ Ditambahkan Petani Mang Rasidi.");
    }
  }

  // 3. Tambahkan titik koordinat pada Lahan yang belum punya koordinat, atau tambahkan lahan baru yang representatif
  const existingLahan = await prisma.lahan.findMany();
  console.log(`Lahan saat ini: ${existingLahan.length}`);

  // Data titik lahan sebaran wilayah Desa Cirebon Girang (Kec. Talun, Kab. Cirebon)
  // Sentral Desa Cirebon Girang: lat: -6.7725, lng: 108.5390
  const sampleLahanData = [
    {
      namaLahan: "Petak Sawah Blok Manis Barat",
      lokasi: "Blok Manis, Dekat Saluran Sekunder Cipager",
      luasLahan: 14000,
      satuanLuas: "m²",
      latitude: -6.7742,
      longitude: 108.5338,
      status: "AKTIF",
      catatan: "Sawah berpengairan teknis lancar sepanjang tahun.",
      varietas: "Inpari 32",
      statusMusim: "BERJALAN"
    },
    {
      namaLahan: "Petak Sawah Galengan Wetan",
      lokasi: "Blok Manis Sisi Timur, Perbatasan Girang Hilir",
      luasLahan: 8500,
      satuanLuas: "m²",
      latitude: -6.7728,
      longitude: 108.5415,
      status: "AKTIF",
      catatan: "Kondisi tanah subur lempung liat berpasir.",
      varietas: "Ciherang",
      statusMusim: "BERJALAN"
    },
    {
      namaLahan: "Sawah Hamparan Manis Tengah",
      lokasi: "Dusun Karang Anyar Blok Manis",
      luasLahan: 20000,
      satuanLuas: "m²",
      latitude: -6.7708,
      longitude: 108.5372,
      status: "AKTIF",
      catatan: "Lahan demplot percontohan Poktan Sri Rejeki.",
      varietas: "Inpari 32",
      statusMusim: "BERJALAN"
    },
    {
      namaLahan: "Sawah Lembah Wage",
      lokasi: "Blok Wage Dusun Girang Hilir",
      luasLahan: 17500,
      satuanLuas: "m²",
      latitude: -6.7765,
      longitude: 108.5435,
      status: "AKTIF",
      catatan: "Irigasi teknis subur dengan drainase tertata baik.",
      varietas: "Inpari 32",
      statusMusim: "SELESAI"
    },
    {
      namaLahan: "Petak Sawah Blok Pahing Krajan",
      lokasi: "Dusun Cirebon Ilir Blok Pahing",
      luasLahan: 12000,
      satuanLuas: "m²",
      latitude: -6.7685,
      longitude: 108.5350,
      status: "AKTIF",
      catatan: "Percontohan pupuk hayati dan irigasi berselang.",
      varietas: "Mekongga",
      statusMusim: "BERJALAN"
    },
    {
      namaLahan: "Petak Sawah Hulu Cipager",
      lokasi: "Blok Manis Atas, Dekat Pintu Air Cipager",
      luasLahan: 11000,
      satuanLuas: "m²",
      latitude: -6.7780,
      longitude: 108.5312,
      status: "AKTIF",
      catatan: "Sumber air langsung dari hulu kali Cipager.",
      varietas: "Inpari 42",
      statusMusim: "BERJALAN"
    },
    {
      namaLahan: "Sawah Rawa Bencah Girang",
      lokasi: "Blok Wage Selatan RT 05",
      luasLahan: 9500,
      satuanLuas: "m²",
      latitude: -6.7795,
      longitude: 108.5410,
      status: "AKTIF",
      catatan: "Tingkat air selalu cukup, cocok untuk varietas tahan genangan.",
      varietas: "Ciherang",
      statusMusim: "PERENCANAAN"
    },
    {
      namaLahan: "Petak Demplot Organik Cirebon Girang",
      lokasi: "Blok Pahing Barat RT 01",
      luasLahan: 6000,
      satuanLuas: "m²",
      latitude: -6.7665,
      longitude: 108.5385,
      status: "AKTIF",
      catatan: "Uji coba padi aromatik ramah lingkungan bebas pestisida kimia.",
      varietas: "Sintanur",
      statusMusim: "BERJALAN"
    }
  ];

  // Update koordinat lahan yang sudah ada atau buat jika belum ada
  for (let i = 0; i < sampleLahanData.length; i++) {
    const item = sampleLahanData[i];
    const match = existingLahan.find(l => l.namaLahan.toLowerCase() === item.namaLahan.toLowerCase());

    if (match) {
      await prisma.lahan.update({
        where: { id: match.id },
        data: {
          latitude: item.latitude,
          longitude: item.longitude,
          status: item.status,
          lokasi: item.lokasi,
          luasLahan: item.luasLahan,
          catatan: item.catatan
        }
      });
      console.log(`📌 Koordinat lahan "${item.namaLahan}" diperbarui.`);
    } else {
      // Tentukan petani pemilik
      const allPetani = await prisma.petani.findMany();
      const owner = allPetani[i % allPetani.length];

      if (owner) {
        const newLahan = await prisma.lahan.create({
          data: {
            petaniId: owner.id,
            namaLahan: item.namaLahan,
            luasLahan: item.luasLahan,
            satuanLuas: item.satuanLuas,
            lokasi: item.lokasi,
            latitude: item.latitude,
            longitude: item.longitude,
            status: item.status,
            catatan: item.catatan
          }
        });

        // Buat musim tanam untuk lahan baru
        await prisma.musimTanam.create({
          data: {
            lahanId: newLahan.id,
            namaMusim: `MT1 Rendeng 2026/2027 - ${item.namaLahan}`,
            varietasPadi: item.varietas,
            tanggalMulai: new Date("2026-08-10"),
            tanggalTanam: new Date("2026-08-25"),
            estimasiPanen: new Date("2026-11-30"),
            status: item.statusMusim,
            catatan: `Penanaman varietas ${item.varietas} dengan panduan pola tanam serentak.`
          }
        });

        console.log(`✅ Lahan baru "${item.namaLahan}" dan Musim Tanam dibuat.`);
      }
    }
  }

  // 4. Tambahkan Artikel & Panduan Edukasi Tani Berkualitas Tinggi
  const articles = [
    {
      judul: "Panduan Lengkap Pengendalian Hama Wereng Batang Coklat (WBC) Pada Padi",
      kategori: "Hama & Penyakit",
      status: "PUBLISHED",
      gambar: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80",
      isi: `Wereng Batang Coklat (*Nilaparvata lugens*) merupakan salah satu hama paling merusak bagi pertanaman padi di wilayah Cirebon Girang, terutama pada musim penghujan (Rendeng) dengan kelembapan udara tinggi.

### 1. Gejala Serangan
- Daun padi mulai menguning dari ujung dan mengering menyerupai terbakar (gejala *hopperburn*).
- Pada pangkal batang padi ditemukan kumpulan nimfa dan wereng dewasa berwarna coklat keabu-abuan.
- Pertumbuhan tanaman kerdil dan anakan tidak berkembang optimal.
- Wereng juga menjadi vektor penular virus kerdil rumput dan kerdil hampa.

### 2. Strategi Pengendalian Terpadu (PHT)
1. **Pengeringan Berkala (Intermittent Irrigation)**: Wereng menyukai lingkungan pangkal batang yang lembap dan tergenang terus-menerus. Keringkan sawah secara berselang hingga tanah macak-macak/sedikit retak rambut selama 3-4 hari untuk memutus siklus hidup wereng.
2. **Penggunaan Varietas Tahan**: Tanam varietas padi yang memiliki ketahanan terhadap wereng biotipe 2 dan 3, seperti **Inpari 32 HDB**, Inpari 42, atau Ciherang varian baru.
3. **Pemberian Pupuk Berimbang**: Hindari pemberian pupuk Urea berlebihan (>250 kg/ha tanpa diimbangi Kalium). Dosis nitrogen yang terlalu tinggi menyebabkan jaringan batang tanaman sukulen dan sangat disukai wereng. Berikan KCl (60-100 kg/ha) untuk memperkuat dinding sel batang.
4. **Konservasi Musuh Alami**: Lindungi predator alami seperti laba-laba serigala (*Lycosa pseudoannulata*), kepik mirid (*Cyrtorhinus lividipennis*), dan kumbang kubah. Jangan menyemprot insektisida berspektrum luas pada awal pertumbuhan (di bawah umur 30 HST).
5. **Aplikasi Insektisida Selektif**: Jika populasi wereng melampaui ambang ekonomi (>10 ekor per rumpun), gunakan insektisida berbahan aktif *Pimetrozin*, *Buprofezin* (penghambat ganti kulit), atau *Triflumuron*. Arahkan nozzle semprot tepat ke bagian pangkal batang padi, bukan pada pucuk daun!`,
    },
    {
      judul: "Teknik Pemupukan Berimbang Padi Sawah: Maksimalkan Hasil, Hemat Biaya",
      kategori: "Pupuk",
      status: "PUBLISHED",
      gambar: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
      isi: `Pemupukan berimbang adalah kunci utama dalam mencetak produktivitas padi di atas 7-8 ton per hektar sekaligus menjaga kesuburan tanah sawah jangka panjang di Desa Cirebon Girang.

### Prinsip 5T dalam Pemupukan:
- **Tepat Jenis**: Kombinasi Nitrogen (Urea), Fosfat (SP-36), Kalium (KCl/Phonska), dan Bahan Organik.
- **Tepat Dosis**: Menyesuaikan status hara tanah setempat (gunakan Bagan Warna Daun/BWD).
- **Tepat Waktu**: Diberikan sesuai fase kebutuhan tanaman (vegetatif awal, anakan aktif, dan primordial).
- **Tepat Cara**: Ditabur saat air macak-macak, lalu segera dibenamkan.
- **Tepat Mutu**: Menggunakan pupuk resmi bersertifikat SNI dari kios tani desa.

### Jadwal & Rekomendasi Dosis (Per 1 Hektar):
1. **Pemupukan Dasar (0-7 HST)**:
   - Pupuk Organik/Kompos: 1.000 - 2.000 kg (diberikan saat pengolahan tanah akhir).
   - NPK Phonska (15-15-15): 150 kg/ha.
   - SP-36: 50 kg/ha (untuk merangsang pertumbuhan akar bibit muda).
2. **Pemupukan Susulan I (18-21 HST)**:
   - Urea: 75 kg/ha.
   - NPK Phonska: 100 kg/ha.
   - Berfungsi memacu pembentukan anakan produktif maksimum.
3. **Pemupukan Susulan II (35-40 HST - Fase Bunting Awal)**:
   - Urea: 50 kg/ha (cek dengan Bagan Warna Daun; jika daun sudah hijau pekat skala 4, kurangi atau lewati Urea).
   - KCl: 50 kg/ha (sangat penting untuk pengisian bulir padi bernas dan mencegah rebah batang).

> **Tips Hemat Petani**: Penambahan pupuk organik atau pupuk hayati cair berbasis mikroba dapat menghemat kebutuhan pupuk anorganik hingga 20-30% tanpa menurunkan hasil gabah.`,
    },
    {
      judul: "Penerapan Sistem Tanam Jajar Legowo 2:1 untuk Peningkatan Gabah Panen",
      kategori: "Budidaya Padi",
      status: "PUBLISHED",
      gambar: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80",
      isi: `Sistem tanam jajar legowo (Jarwo) merupakan rekayasa teknologi tanam yang mengatur jarak tanam antar rumpun padi sehingga menciptakan lorong kosong memanjang. Pola yang paling direkomendasikan untuk persawahan Cirebon Girang adalah sistem **Jajar Legowo 2:1**.

### Keunggulan Sistem Jajar Legowo 2:1:
1. **Efek Tanaman Pinggir (Border Effect)**: Seluruh rumpun padi berada di posisi tepi lorong, sehingga menerima intensitas sinar matahari 100% dan sirkulasi udara optimal.
2. **Peningkatan Populasi Rumpun**: Populasi tanaman meningkat sekitar 20-30% dibanding sistem tanam tegel tradisional (jarak 20x20 cm = 250.000 rumpun/ha vs Jarwo 2:1 = ±330.000 rumpun/ha).
3. **Memudahkan Perawatan**: Petani dapat berjalan di lorong kosong tanpa menginjak rumpun padi saat memupuk, menyemprot, menyiangi gulma, maupun mengatur air.
4. **Mengurangi Serangan Tikus & Wereng**: Lorong terang dan berangin tidak disukai tikus sawah untuk membuat sarang dan menekan kelembapan mikro yang disukai jamur/wereng.

### Cara Pengaturan Jarak Tanam:
- Jarak antar barisan dalam baris: **20 cm**.
- Jarak antar barisan tanaman: **10 cm**.
- Lebar lorong kosong legowo: **40 cm**.
- Tanam 2-3 bibit muda per lubang (bibit umur 15-18 hari setelah semai) agar perakaran cepat beradaptasi.`,
    },
    {
      judul: "Teknik Pascapanen Padi: Standar Kadar Air & Menjaga Kualitas Rendemen Beras",
      kategori: "Budidaya Padi",
      status: "PUBLISHED",
      gambar: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
      isi: `Kehilangan hasil panen (*losses*) pada padi seringkali mencapai 10-15% hanya karena penanganan pascapanen yang keliru. Menjaga kualitas gabah sejak pemotongan malai hingga penggilingan sangat menentukan harga jual gabah di tingkat tengkulak dan Bulog.

### 1. Penentuan Waktu Panen Tepat:
- Umur panen ideal: 90-95% malai padi sudah menguning jerami.
- Kadar air gabah di pohon saat panen: berkisar antara 21-24%.
- Hindari panen terlalu dini (banyak gabah hampa dan butir hijau) atau terlalu lambat (gabah mudah rontok di sawah dan butir retak).

### 2. Perontokan Gabah:
- Lakukan perontokan pada hari yang sama setelah pemotongan padi menggunakan mesin *power thresher* atau *combine harvester*.
- Jangan menumpuk jerami basah lebih dari 12 jam karena dapat memicu fermentasi panas yang menyebabkan beras berwarna kuning (*yellowing*) dan berbau apek.

### 3. Pengeringan Gabah Menuju Standar Simpan:
- Jemur gabah di atas terpal bersih dengan ketebalan hamparan 3-5 cm.
- Bolak-balik gabah setiap 1-2 jam dengan garu kayu tumpul agar panas merata.
- Target kadar air:
  - **Gabah Kering Panen (GKP)**: Kadar air 20-25%.
  - **Gabah Kering Giling (GKG)**: Kadar air **14%** (standar siap giling dan aman disimpan hingga 6-12 bulan tanpa jamur kutu).
- Jangan menjemur gabah langsung di atas aspal jalan raya karena debu dan pecahan kerikil menurunkan grade beras.`,
    },
    {
      judul: "Kiat Antisipasi Dampak Anomali Cuaca & Siklon Tropis Terhadap Padi Sawah",
      kategori: "Cuaca",
      status: "PUBLISHED",
      gambar: "https://images.unsplash.com/photo-1514632595-4944383f2737?auto=format&fit=crop&w=800&q=80",
      isi: `Wilayah pesisir Cirebon dan dataran Talun kerap mengalami cuaca ekstrem berupa hujan lebat disertai angin kencang saat peralihan musim. Tanaman padi yang sedang bunting hingga berbunga sangat rentan mengalami kerusakan malai atau rebah batang.

### Langkah Antisipasi di Lapangan:
1. **Normalisasi Saluran Drainase**: Bersihkan rumput liar, sampah plastik, dan endapan lumpur di saluran pembuangan air tersier agar air hujan lebat cepat surut dalam waktu kurang dari 24 jam.
2. **Ketinggian Air Saat Hujan**: Buka pintu pembuangan saat hujan lebat berturut-turut agar ketinggian air di petak sawah tidak melebihi 5 cm. Genangan menenggelamkan malai padi dapat mematikan serbuk sari dan memicu serangan jamur Hawar Pelepah (*Rhizoctonia solani*).
3. **Penguatan Daya Tahan Batang**: Berikan pupuk Kalium (KCl) dan Silika cair pada umur 40-50 HST. Silika terbukti mempertebal lapisan kutikula daun dan memperkokoh batang padi sehingga tidak mudah roboh diterpa angin kencang.
4. **Pantau Widget Cuaca SI PADI**: Petani diimbau secara rutin mengecek prakiraan cuaca 3 hari ke depan di dashboard untuk menjadwalkan waktu penyemprotan pupuk daun dan fungisida.`,
    }
  ];

  // Simpan artikel ke database
  for (const art of articles) {
    const existing = await prisma.informasiPertanian.findFirst({
      where: { judul: art.judul }
    });

    if (existing) {
      await prisma.informasiPertanian.update({
        where: { id: existing.id },
        data: {
          isi: art.isi,
          gambar: art.gambar,
          kategori: art.kategori,
          status: art.status,
          tanggalPublikasi: new Date()
        }
      });
      console.log(`📖 Artikel "${art.judul}" diperbarui.`);
    } else {
      await prisma.informasiPertanian.create({
        data: {
          judul: art.judul,
          isi: art.isi,
          kategori: art.kategori,
          gambar: art.gambar,
          status: art.status,
          tanggalPublikasi: new Date(),
          penulisId: authorId,
          namaPenulis: authorName
        }
      });
      console.log(`✅ Artikel baru "${art.judul}" dibuat.`);
    }
  }

  console.log("✨ Seed fitur lanjutan berhasil selesai!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
