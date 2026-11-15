# NASKAH & SKENARIO PRESENTASI VIDEO TUNGGAL LENGKAP PROYEK AKHIR MANDIRI
## SI PADI: SISTEM INFORMASI PERTANIAN & MANAJEMEN BUDIDAYA PADI DESA CIREBON GIRANG
**Mata Kuliah:** Rekayasa Perangkat Lunak (TIKB2503021) — Semester 3  
**Dosen Pengampu:** Yudhistira Arie Wijaya, M.Kom., CDS.  
**Program Studi:** S1 Teknik Informatika — STMIK IKMI Cirebon  
**Pengembang Mandiri (Full-Stack):** Karisma Siti Nabila (NIM: 4122001)  
**Tema Topik:** Public Service & Smart Agriculture AI  
**Format Naskah:** Naskah Presentasi Tunggal Terpadu (Menyatukan Materi Progres 1, Progres 2, hingga Final Live Demo & CI/CD)  
**Target Estimasi Durasi:** 12 – 15 Menit (Dapat disesuaikan dengan tempo penyampaian lisan)  

---

## PANDUAN TEKNIS & STANDAR KUALITAS REKAMAN (SESUAI BAB III & IV.2 PANDUAN DOSEN)
1. **Perekaman Layar & Webcam (Wajib):**
   - Format rekaman layar (*screen recording*) wajib menyertakan wajah mahasiswa (kamera webcam aktif di pojok kanan atau kiri layar) sepanjang presentasi untuk memverifikasi keaslian pengerjaan mandiri (*individual ownership*).
   - Kenakan pakaian rapi/formal (kemeja berkerah atau almamater kampus STMIK IKMI Cirebon).
2. **Kualitas Audio & Visual:**
   - Resolusi rekaman: Minimal 720p, disarankan **1080p (Full HD)** 60fps.
   - Suara jernih, volume stabil, bebas bising latar belakang (disarankan menggunakan mic clip-on / headset).
3. **Sikap & Gaya Penyampaian:**
   - Suara tegas, percaya diri, antusias, artikulatif, dan menguasai alur sistem (baca naskah ini seperti bercerita secara profesional, bukan mengeja teks kaku).
4. **Platform Unggah & Tautan:**
   - Unggah video ke YouTube (setel ke **Unlisted** atau **Public**) atau Google Drive (*Anyone with the link can view*).
   - Tautan video wajib dicantumkan pada berkas `README.md` repositori GitHub Anda sebelum pengumpulan final.

---

# NASKAH PRESENTASI VIDEO UTUH (DARI AWAL SAMPAI AKHIR)

---

### [00:00 – 01:15] BAGIAN 1: PEMBUKAAN & IDENTITAS MAHASISWA (ELEVATOR PITCH)
* **Tampilan Layar Visual:** Layar menampilkan halaman Landing Page SI PADI (`pertanian-cirebon-girang.vercel.app`), Webcam mahasiswa aktif di pojok layar dengan senyum ramah dan formal.
* **Narasi Narator:**
  > *"Assalamu’alaikum Warahmatullahi Wabarakatuh. Selamat pagi/siang, salam sejahtera bagi kita semua.*  
  > *Yang terhormat Dosen Pengampu Mata Kuliah Rekayasa Perangkat Lunak, Bapak Yudhistira Arie Wijaya, M.Kom., CDS., serta seluruh civitas akademika STMIK IKMI Cirebon yang saya banggakan.*  
  > *Perkenalkan, nama saya **Karisma Siti Nabila**, mahasiswi Program Studi S1 Teknik Informatika, dengan NIM **4122001**.*  
  > *Pada kesempatan presentasi komprehensif kali ini, saya akan memaparkan secara utuh proyek akhir rekayasa perangkat lunak mandiri yang telah saya rancang dan bangun dari nol, mulai dari fase analisis kebutuhan, perancangan arsitektur, pemodelan UML, implementasi basis data, hingga pengujian sistem dan live demo aplikasi, dengan judul:*  
  > ***SI PADI: Sistem Informasi Pertanian & Manajemen Budidaya Padi Desa Cirebon Girang Berbasis AI dan Early Warning System***.*  
  > *Proyek ini saya kembangkan secara 100% mandiri sebagai bentuk tanggung jawab penuh seorang calon Sarjana Teknik Informatika dalam menghadirkan solusi teknologi mutakhir untuk pelayanan publik dan smart agriculture desa."*

---

### [01:15 – 02:45] BAGIAN 2: LATAR BELAKANG EMPIRIS DESA CIREBON GIRANG & ANALISIS MASALAH
* **Tampilan Layar Visual:** Beralih menampilkan dokumen laporan / slide bagian Latar Belakang, foto hamparan sawah Desa Cirebon Girang, atau diagram problem statement.
* **Narasi Narator:**
  > *"Bapak Dosen dan rekan-rekan sekalian, ide pengembangan SI PADI berakar dari permasalahan empiris di **Desa Cirebon Girang, Kecamatan Talun, Kabupaten Cirebon**.*  
  > *Desa Cirebon Girang memiliki hamparan sawah produktif seluas **6,00 Hektar** yang dikelola oleh 3 Kelompok Tani binaan, yaitu **Poktan Sri Rejeki**, **Poktan Sumber Subur**, dan **Poktan Tani Makmur**.*  
  > *Berdasarkan studi lapangan dan observasi bersama Kuwu Desa Cirebon Girang, Bapak Karsiman, S.Sos, saya mengidentifikasi tiga permasalahan kritis dalam tata kelola pertanian padi:*  
  > *Pertama, **Pencatatan Manual**: Pendataan luas petak sawah dan registrasi petani masih dicatat dalam buku kas desa konvensional, sehingga rawan rusak, tercecer, dan batas kepemilikan lahan sering kali tidak jelas.*  
  > *Kedua, **Asimetri Informasi Budidaya**: Petani sering kali terlambat melakukan pemupukan susulan atau keliru menentukan takaran pupuk NPK dan Urea karena kesulitan menghitung umur tanaman secara presisi berbasis **Hari Setelah Tanam (HST)**.*  
  > *Ketiga, **Ketiadaan Early Warning System**: Saat terjadi serangan Organisme Pengganggu Tanaman (OPT) seperti wereng coklat atau perubahan cuaca ekstrem, peringatan dari desa terlambat sampai ke petani.*  
  > *Sebagai solusinya, SI PADI hadir sebagai platform web cerdas yang mendigitalisasi batas sawah dengan peta GIS Leaflet, mengotomatiskan peringatan dini pemupukan ke WhatsApp dan Email, serta menghadirkan Asisten Cerdas AI yang terhubung langsung dengan basis data riil desa."*

---

### [02:45 – 04:15] BAGIAN 3: SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (PRD / SRS STANDAR IEEE 830)
* **Tampilan Layar Visual:** Menampilkan Dokumen Laporan Bab II (Tabel Kebutuhan Fungsional FR-01 s/d FR-08, NFR, dan Profil User Persona).
* **Narasi Narator:**
  > *"Sebelum melangkah ke tahap pengkodean, saya menyusun dokumen **Product Requirements Document (PRD)** yang mengacu pada standar internasional **IEEE 830**.*  
  > *Sistem ini menerapkan arsitektur **Role-Based Access Control (RBAC)** dengan 3 Persona Pengguna yang memiliki hak akses berbeda:*  
  > *1. **Administrator**, memiliki 12 modul menu untuk tata kelola data master, konfigurasi AI, dan audit sistem.*  
  > *2. **Perangkat Desa (Kuwu)**, memiliki 10 modul menu untuk monitoring luas lahan wilayah, pengawasan kelompok tani, dan pencetakan surat dinas resmi.*  
  > *3. **Petani**, memiliki 10 modul menu ramah guna untuk registrasi mandiri, melihat jadwal HST petak sawahnya, mencatat log harian, dan berkonsultasi budidaya.*  
  >  
  > *Adapun Kebutuhan Fungsional kunci yang saya rumuskan meliputi:*  
  > *- **FR-01**: Autentikasi Stateless JWT dengan proteksi HttpOnly Cookie.*  
  > *- **FR-02**: Registrasi Mandiri Petani dengan verifikasi kode OTP 6 digit yang dikirim simultan melalui WhatsApp Gateway Fonnte dan Email SMTP dengan masa berlaku 5 menit.*  
  > *- **FR-04**: Pemetaan spasial GIS batas petak sawah menggunakan Leaflet.js.*  
  > *- **FR-05 & FR-06**: Manajemen musim tanam otomatis dengan kalkulasi dosis pemupukan berimbang berbasis HST.*  
  > *- **FR-08**: Ekspor dokumen kedinasan ber-Kop Surat Resmi Kantor Kuwu lengkap dengan tanda tangan digital Kuwu.*  
  >  
  > *Dari sisi Kebutuhan Non-Fungsional (NFR), sistem dirancang memiliki waktu respons di bawah 1,5 detik, keamanan kata sandi bcrypt salt 10, database MySQL di TiDB Cloud Serverless yang kebal SQL Injection, serta desain antarmuka responsif mobile-first."*

---

### [04:15 – 06:15] BAGIAN 4: PERANCANGAN SISTEM (SDD), 4 DIAGRAM UML, & PRINSIP SOLID
* **Tampilan Layar Visual:** Beralih ke Laporan Bab III, menampilkan 4 Diagram UML secara bergantian: Use Case, Activity, Class, dan Sequence Diagram.
* **Narasi Narator:**
  > *"Memasuki tahap perancangan sistem atau **Software Design Description (SDD)**, saya memodelkan arsitektur perangkat lunak menggunakan **4 Diagram UML Utama**:*  
  >  
  > *1. **Use Case Diagram**: Memetakan interaksi antara Aktor Administrator, Perangkat Desa, dan Petani, serta 2 sistem eksternal yaitu Fonnte WhatsApp Gateway dan Google Gemini AI API. Terdapat 14 use case terdefinisi yang mencakup seluruh alur bisnis dari registrasi hingga penerbitan laporan.*  
  >  
  > *2. **Activity Diagram**: Saya merancang dua alur vital: pertama, alur registrasi OTP di mana sistem memvalidasi NIK, membangkitkan token acak, mengirimkan pesan via gateway, hingga aktivasi akun. Kedua, alur pemrosesan AI di mana masukan pengguna dinormalisasi dan disaring melalui parser lokal sebelum disuntikkan ke model bahasa cloud.*  
  >  
  > *3. **Class Diagram & Kepatuhan Prinsip SOLID**: Dalam perancangan berorientasi objek, saya menerapkan 5 prinsip SOLID secara ketat:*  
  > *   - **Single Responsibility**: Memisahkan AuthService, AiService, dan NotificationService ke dalam tanggung jawab tunggal yang independen.*  
  > *   - **Open-Closed Principle**: Menggunakan antarmuka abstrak `IAiProvider` sehingga kita dapat menambah provider baru tanpa mengubah kode inti.*  
  > *   - **Liskov Substitution**: Kelas `GeminiChatProvider` dan `LocalAgronomyProvider` dapat saling menggantikan tanpa memicu kegagalan.*  
  > *   - **Interface Segregation**: Memisahkan kontrak antarmuka WhatsApp dan Email.*  
  > *   - **Dependency Inversion**: Controller bergantung pada abstraksi modul layanan, bukan pada implementasi pustaka konkret.*  
  >  
  > *4. **Sequence Diagram**: Memvisualisasikan pertukaran pesan asinkron HTTP POST dari antarmuka React Client menuju Next.js Route Handler, interaksi Prisma ORM ke basis data, hingga pengembalian respons JSON dalam hitungan milidetik."*

---

### [06:15 – 07:45] BAGIAN 5: PERANCANGAN BASIS DATA (ERD 13 TABEL RELASIONAL) & TECH STACK
* **Tampilan Layar Visual:** Menampilkan Diagram ERD 13 Tabel Relasional di Bab III Laporan, lalu beralih ke slide ringkasan Tech Stack.
* **Narasi Narator:**
  > *"Untuk menjamin integritas data, saya merancang **Entity Relationship Diagram (ERD)** yang terdiri dari **13 Tabel Relasional** ternormalisasi hingga bentuk normal ketiga (3NF):*  
  > *Tabel-tabel tersebut meliputi: `users`, `farmers`, `farmer_groups`, `farm_lands`, `planting_seasons`, `cultivation_activities`, `harvest_records`, `ai_consultation_logs`, `otp_verifications`, `early_warnings`, `fertilizer_schedules`, `system_configs`, dan `audit_logs`.*  
  >  
  > *Arsitektur teknologi yang saya pilih adalah stack modern berstandar enterprise:*  
  > *- **Frontend & Backend**: Next.js 15 App Router dengan React 19 dan TypeScript untuk keamanan pengetikan (type-safety).*  
  > *- **Styling**: Tailwind CSS dengan palet warna Emerald Agrikultur yang bersih dan modern.*  
  > *- **Basis Data**: MySQL 8.0 yang di-host di TiDB Cloud Serverless dengan koneksi TLS/SSL terenkripsi.*  
  > *- **ORM**: Prisma ORM untuk memastikan query terbebas dari serangan SQL Injection.*  
  > *- **Autentikasi**: Stateless JSON Web Token (JWT) yang disimpan pada HttpOnly Secure Cookie dengan hashing kata sandi Bcrypt 10 salt.*  
  > *- **Integrasi Eksternal**: Leaflet GIS, Google Gemini 3.0 Flash API, Fonnte WhatsApp API, dan Nodemailer SMTP."*

---

### [07:45 – 09:30] BAGIAN 6: LIVE DEMO DASHBOARD (ADMINISTRATOR, PERANGKAT DESA, PETANI)
* **Tampilan Layar Visual:** Buka browser Google Chrome live pada aplikasi: `https://pertanian-cirebon-girang.vercel.app` (atau `localhost:3000`).
* **Narasi Narator:**
  > *"Sekarang, mari kita buktikan hasil rekayasa ini secara langsung melalui **Sesi Live Demo Sistem**.*  
  >  
  > *Pertama, saya login sebagai **Administrator Sistem** atas nama Karisma Siti Nabila.*  
  > *[Tunjukkan Dashboard Admin] &rarr; Di dashboard Admin terdapat 12 menu lengkap. Kita dapat melihat kartu statistik: 6 pengguna aktif, 4 petani binaan, 4 petak sawah seluas 6,00 Hektar, dan 3 musim tanam yang sedang berlangsung.*  
  > *[Buka Menu Peta Lahan GIS] &rarr; Di menu Peta GIS, tampak hamparan sawah Desa Cirebon Girang yang dipetakan secara poligon interaktif menggunakan Leaflet. Ketika salah satu petak di Blok Manis diklik, tooltip menampilkan detail luas 2 Hektar, petani pengelola Bapak Sutarjo, dan varietas Inpari 32.*  
  > *[Buka Menu Konfigurasi Sistem] &rarr; Di menu Konfigurasi, Admin dapat mengatur kunci API Gemini, memilih gaya bahasa AI (apakah Sunda Santun, Pakar Ilmiah, atau Penyuluh Ringkas), serta token WhatsApp Gateway Fonnte.*  
  >  
  > *Sekarang saya berpindah ke role kedua: **Perangkat Desa**, atas nama **Kuwu Desa Cirebon Girang, Bapak Karsiman, S.Sos**.*  
  > *[Login sebagai Perangkat Desa] &rarr; Dashboard desa berfokus pada pengawasan wilayah dan kelompok tani binaan.*  
  > *[Buka Menu Lahan Pertanian lalu klik tombol Cetak / PDF] &rarr; Perhatikan, ketika tombol Cetak diklik, sistem secara otomatis menerbitkan dokumen resmi ber-Kop Dinas Pemerintah Kabupaten Cirebon, Kantor Kuwu Desa Cirebon Girang, rekapitulasi data lahan dan panen, lengkap dengan tanda tangan sah Kuwu Bapak Karsiman, S.Sos yang siap diserahkan ke Dinas Pertanian.*  
  >  
  > *Dan untuk role ketiga: **Petani**.*  
  > *[Tunjukkan halaman Register `/register` dan form OTP] &rarr; Calon petani dapat mendaftar mandiri dengan memasukkan NIK dan nomor WhatsApp. Sistem membangkitkan kode OTP 6 digit dan memancarkannya secara otomatis ke WhatsApp dan Email petani. Setelah diverifikasi, petani dapat mencatat log kegiatan pemupukan hariannya serta memantau jadwal panen."*

---

### [09:30 – 11:30] BAGIAN 7: LIVE DEMO UJI COBA CHATBOT AI & DETERMINISTIC SUPER ENGINE
* **Tampilan Layar Visual:** Buka floating widget **AI Assistant** di pojok kanan bawah dashboard, lalu ketik prompt pengujian secara langsung di hadapan kamera.
* **Narasi Narator:**
  > *"Kini kita masuk ke fitur yang paling menonjol: **Kecerdasan Artifisial (AI Assistant SI PADI)**.*  
  > *Sistem AI ini mengadopsi teknik **Hybrid RAG (Retrieval-Augmented Generation)** yang diperkuat **Super Engine Agronomi Lokal**. Sistem ini telah saya program untuk mematuhi aturan semantik khusus:*  
  >  
  > *Pertama, mari kita uji aturan: **Jika ditanya dengan kata 'Berapa', AI wajib menjawab angka kuantitatif tanpa membeberkan kredensial pribadi**.*  
  > *[Ketik di chatbox: 'berapa total pengguna'] &rarr; Perhatikan responnya: AI langsung menjawab dengan angka ringkas: **'Total pengguna terdaftar adalah 6 orang (terdiri dari 1 Admin, 1 Perangkat Desa, dan 4 Petani)'**.*  
  > *[Ketik di chatbox: 'berapa luas lahan sawah'] &rarr; AI menjawab presisi: **'Total luas lahan sawah adalah 6,00 Hektar (60.000 m²)'**.*  
  > *[Ketik di chatbox: 'berapa hasil panen'] &rarr; AI menjawab: **'14,50 Ton (14.500 kg gabah)'**.*  
  >  
  > *Kedua, mari kita uji aturan: **Jika ditanya dengan kata 'Siapa', AI wajib menjawab langsung dengan nama subjek yang dimaksud**.*  
  > *[Ketik di chatbox: 'siapa kepala desa'] &rarr; AI menjawab: **'Kepala Desa (Kuwu) Desa Cirebon Girang adalah Bapak Karsiman, S.Sos'**.*  
  > *[Ketik di chatbox: 'siapa admin'] &rarr; AI menjawab: **'Administrator sistem SI PADI adalah Karisma Siti Nabila'**.*  
  > *[Ketik di chatbox: 'siapa aja petani yang terdaftar'] &rarr; AI langsung menampilkan daftar nama petani: Bapak Sukardi, Bapak Sutarjo, Bapak H. Karyono, dan Arka Saputra.*  
  >  
  > *Ketiga, AI ini juga dirancang untuk **menjawab pertanyaan Dosen Penguji Sidang seputar arsitektur web dan rekayasa perangkat lunak**!*  
  > *[Ketik di chatbox: 'bagaimana sistem mencegah SQL Injection'] &rarr; AI menjelaskan secara akademik penggunaan parameter prepared statements pada Prisma ORM.*  
  > *[Ketik di chatbox: 'apa struktur database sistem ini'] &rarr; AI menjabarkan arsitektur 13 tabel relasional yang digunakan.*  
  > *Respon AI terbukti sangat responsif, kontekstual, dan berbasis data riil desa!"*

---

### [11:30 – 12:45] BAGIAN 8: PENGUJIAN OTOMATIS (UNIT TESTING TERMINAL) & CI/CD GITHUB ACTIONS
* **Tampilan Layar Visual:** Buka terminal VS Code / PowerShell, jalankan `npm test`, lalu tunjukkan tab browser GitHub Actions pada repositori proyek.
* **Narasi Narator:**
  > *"Sebagai pembuktian mutu rekayasa perangkat lunak pada tingkat kode, saya mengimplementasikan **Automated Unit Testing** dan **DevOps CI/CD Pipeline**:*  
  >  
  > *Sekarang di terminal, saya jalankan perintah pengujian otomatis:  
  > `npm test`*  
  > *[Tunjukkan terminal berjalan beberapa detik] &rarr; Dapat kita lihat bersama di terminal: 6 pengujian unit otomatis yang memvalidasi logika kata tanya 'berapa', 'siapa', sanitasi kredensial, dan tanya-jawab dosen berjalan 100% sukses dengan hasil: **pass: 6, fail: 0**.*  
  >  
  > *Selanjutnya, mari kita buka tab browser pada repositori GitHub saya di bagian **Actions**.*  
  > *[Tunjukkan halaman GitHub Actions] &rarr; Alur kerja **CI/CD GitHub Actions** yang saya bangun berjalan secara otomatis pada setiap push kode. Pipeline menjalankan pemeriksaan dependensi, validasi Prisma schema, unit testing otomatis, hingga build produksi Next.js, dan seluruh workflow berstatus **HIJAU (Passing)**.*  
  > *Selain itu, hasil User Acceptance Testing (UAT) menunjukkan skor System Usability Scale (SUS) sebesar **86,5**, yang masuk dalam predikat Grade A (Excellent)."*

---

### [12:45 – 14:00] BAGIAN 9: REFLEKSI REKAYASA PERANGKAT LUNAK MANDIRI & PENUTUP
* **Tampilan Layar Visual:** Beralih ke layar beranda web atau slide penutup, Webcam mahasiswa fokus dan menyampaikan kata penutup dengan percaya diri.
* **Narasi Narator:**
  > *"Bapak Dosen Pengampu dan rekan-rekan sekalian, menyelesaikan proyek akhir mandiri SI PADI ini memberikan pelajaran rekayasa yang sangat berharga bagi saya.*  
  > *Tantangan terbesar yang saya hadapi adalah bagaimana memastikan integrasi model AI tidak mengalami halusinasi dan tidak membocorkan data rahasia. Solusi yang saya temukan adalah dengan membangun lapisan Hybrid Retrieval-Augmented Generation dan Super Engine Agronomi Lokal yang menyaring dan menginjeksi konteks data secara terukur.*  
  > *Mengerjakan seluruh siklus hidup pengembangan perangkat lunak secara mandiri—dari analisis kebutuhan IEEE 830, pemodelan SDD berprinsip SOLID, perancangan ERD 13 tabel, Clean Code Next.js 15, pengujian unit, hingga otomatisasi CI/CD—telah membentuk pemahaman mendalam saya tentang standar industri perangkat lunak.*  
  > *Saya berharap platform SI PADI ini dapat terus dikembangkan menjadi aplikasi mobile PWA dan diintegrasikan dengan sensor tanah IoT untuk mendukung kedaulatan pangan Desa Cirebon Girang.*  
  >  
  > *Ucapan terima kasih yang setinggi-tingginya saya haturkan kepada Dosen Pengampu Mata Kuliah Rekayasa Perangkat Lunak, **Bapak Yudhistira Arie Wijaya, M.Kom., CDS.**, atas bimbingan, arahan, dan transfer ilmu yang luar biasa selama satu semester ini.*  
  > *Terima kasih atas segala perhatiannya, mohon maaf atas segala keterbatasan.*  
  > *Wabillahi taufiq wal hidayah, Wassalamu’alaikum Warahmatullahi Wabarakatuh."*

---
*Naskah Presentasi Video Tunggal SI PADI Cirebon Girang telah selesai disatukan secara komprehensif.*
