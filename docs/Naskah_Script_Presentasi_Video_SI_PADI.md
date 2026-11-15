# NASKAH & SKENARIO PRESENTASI VIDEO PROYEK AKHIR MANDIRI
## SI PADI: SISTEM INFORMASI PERTANIAN & MANAJEMEN BUDIDAYA PADI DESA CIREBON GIRANG
**Mata Kuliah:** Rekayasa Perangkat Lunak (TIKB2503021) — Semester 3  
**Dosen Pengampu:** Yudhistira Arie Wijaya, M.Kom., CDS.  
**Program Studi:** S1 Teknik Informatika — STMIK IKMI Cirebon  
**Pengembang Mandiri:** Karisma Siti Nabila (NIM: 4122001)  
**Tema Topik Kelompok:** Public Service & Smart Agriculture AI  

---

## PANDUAN TEKNIS & STANDAR KUALITAS REKAMAN (BAB III & IV.2)
1. **Perekaman Layar & Webcam (Wajib):**
   - Format rekaman layar (screen recording) wajib menyertakan wajah mahasiswa (webcam aktif di pojok kanan atas layar) sepanjang presentasi untuk memverifikasi autentisitas pengerjaan mandiri.
   - Pakaian rapi/formal (kemeja berkerah atau almamater kampus).
2. **Kualitas Audio & Visual:**
   - Resolusi rekaman: Minimal 720p, disarankan **1080p (Full HD)** 60fps.
   - Audio jernih, volume stabil, bebas bising latar belakang (disarankan menggunakan mic clip-on / headset dengan noise suppression).
3. **Sikap & Gaya Penyampaian:**
   - Suara tegas, percaya diri, antusias, artikulatif, dan menguasai alur sistem (hindari membaca draf secara kaku atau terbata-bata).
4. **Platform Unggah & Tautan:**
   - Unggah ke YouTube (setel ke **Unlisted** atau **Public**) atau Google Drive (**Anyone with the link**).
   - Tautan video wajib dicantumkan pada berkas `README.md` repositori GitHub Anda.

---

# VIDEO PROGRES 1: PRD & KONSEP APLIKASI
* **Bobot Penilaian:** 20% dari Nilai Total Video
* **Target Alokasi Durasi:** 3 – 5 Menit (Ideal: 4 Menit 00 Detik)
* **Fokus Materi:** Identifikasi masalah riil, nilai guna aplikasi, daftar kebutuhan fungsional & non-fungsional, serta peran strategis fitur AI yang ditanamkan.

### [00:00 – 00:40] Segmen 1: Pembukaan & Identitas Mahasiswa
* **Tampilan Visual:** Layar menampilkan Slide Cover PRD / Dokumen PRD SI PADI, Webcam mahasiswa aktif di pojok kanan atas.
* **Narasi Narator:**
  > *"Assalamu’alaikum Warahmatullahi Wabarakatuh. Selamat pagi/siang, salam sejahtera untuk kita semua.*  
  > *Yang terhormat Dosen Pengampu Mata Kuliah Rekayasa Perangkat Lunak, Bapak Yudhistira Arie Wijaya, M.Kom., CDS., serta rekan-rekan civitas akademika STMIK IKMI Cirebon.*  
  > *Perkenalkan, nama saya Karisma Siti Nabila, mahasiswi Program Studi S1 Teknik Informatika, NIM 4122001.*  
  > *Pada kesempatan Progres Pertama ini, saya akan mempresentasikan dokumen Product Requirements Document (PRD) dan Spesifikasi Kebutuhan Perangkat Lunak (SRS) yang telah saya susun secara mandiri dengan judul proyek: **SI PADI: Sistem Informasi Pertanian & Manajemen Budidaya Padi Desa Cirebon Girang Terintegrasi Kecerdasan Artifisial dan Early Warning System**."*

### [00:40 – 01:50] Segmen 2: Identifikasi Masalah Riil Desa Cirebon Girang & Value Proposition
* **Tampilan Visual:** Layar menampilkan Gambar Diagram PRD Visual (Bagian Latar Belakang & Nilai Strategis).
* **Narasi Narator:**
  > *"Proyek ini saya angkat dari studi kasus nyata di Desa Cirebon Girang, Kecamatan Talun, Kabupaten Cirebon. Desa ini memiliki hamparan sawah produktif seluas 6,00 Hektar yang dinaungi oleh 3 Kelompok Tani binaan, yaitu Poktan Sri Rejeki, Sumber Subur, dan Tani Makmur.*  
  > *Berdasarkan observasi dan wawancara bersama Kuwu Desa Cirebon Girang, Bapak Karsiman, S.Sos, saya mengidentifikasi 3 masalah kritis:*  
  > *Pertama, pendataan lahan sawah dan anggota petani masih dicatat manual dalam buku register desa, sehingga rawan tercecer dan memicu ketidakpastian batas petak.*  
  > *Kedua, petani sering terlambat melakukan pemupukan susulan karena kesulitan menghitung umur tanaman secara presisi berbasis Hari Setelah Tanam (HST).*  
  > *Ketiga, belum adanya sistem peringatan dini (Early Warning System) instan yang dapat memberitahu petani terkait serangan hama wereng dan anomali cuaca lokal.*  
  > *Sebagai solusinya, SI PADI hadir dengan Value Proposition utama: mendigitalisasi batas spasial petak sawah berbasis GIS, mengotomatisasi peringatan dini pemupukan multi-saluran ke WhatsApp dan Email, serta menghadirkan Asisten Cerdas AI yang membaca data riil desa untuk konsultasi budidaya."*

### [01:50 – 03:00] Segmen 3: Spesifikasi Kebutuhan Fungsional (FR) & Non-Fungsional (NFR)
* **Tampilan Visual:** Layar menyoroti Tabel Matriks Kebutuhan Fungsional (FR-01 s/d FR-08) dan NFR pada Dokumen PRD.
* **Narasi Narator:**
  > *"Dalam menyusun spesifikasi kebutuhan standar IEEE 830, saya membaginya ke dalam 3 Role-Based Access Control (RBAC): Administrator dengan 12 menu, Perangkat Desa dengan 10 menu, dan Petani dengan 10 menu.*  
  > *Adapun Kebutuhan Fungsional utama yang telah saya rumuskan mencakup:*  
  > *1. FR-01: Autentikasi Stateless JWT dan Role Guard Middleware.*  
  > *2. FR-02: Registrasi Mandiri Petani dengan Verifikasi Dual-Channel OTP 6 digit yang dikirim simultan via WhatsApp Gateway dan Email dengan validitas 5 menit.*  
  > *3. FR-04: Pemetaan Spasial GIS menggunakan Leaflet.js dengan batas poligon interaktif.*  
  > *4. FR-05 dan FR-06: Manajemen Musim Tanam dengan kalkulasi otomatis HST dan pemicu Early Warning System.*  
  > *5. FR-08: Penerbitan dokumen laporan resmi kedinasan ber-Kop Kantor Kuwu bertanda tangan sah Kuwu Bapak Karsiman.*  
  > *Sedangkan dari sisi Non-Fungsional (NFR), sistem dirancang memiliki waktu muat halaman di bawah 1,5 detik, keamanan kata sandi bcryptjs salt 10, database MySQL di TiDB Cloud Serverless yang kebal SQL Injection via Prisma ORM, serta antarmuka responsif mobile-first menggunakan Tailwind CSS."*

### [03:00 – 03:45] Segmen 4: Peran Strategis Fitur Kecerdasan Artifisial (Hybrid RAG)
* **Tampilan Visual:** Layar menampilkan diagram alur arsitektur AI (Context Injection dari MySQL ke LLM Gemini/OpenAI).
* **Narasi Narator:**
  > *"Peran strategis fitur AI pada SI PADI bukan sekadar tempelan atau gimmick. Saya mengimplementasikan arsitektur **Hybrid Retrieval-Augmented Generation (RAG) dan Real-Time Context Injection**.*  
  > *Setiap kali pengguna bertanya, backend Next.js mengambil data agregasi terbaru dari database MySQL TiDB Cloud—mulai dari jumlah pengguna, luas lahan, musim tanam, hingga hasil panen—dan menyuntikkannya ke System Instruction model Google Gemini 3.0 Flash.*  
  > *Selain itu, sistem dilengkapi Deterministic Super Engine Agronomi Lokal berlatensi 0 milidetik yang menegakkan aturan ketat: jika ditanya 'Berapa' wajib dijawab angka kuantitatif, dan jika ditanya 'Siapa' wajib dijawab nama subjek secara spesifik, serta menguasai modul budidaya padi sawah Kementan RI."*

### [03:45 – 04:00] Segmen 5: Penutup Video Progres 1
* **Tampilan Visual:** Webcam mahasiswa fokus, tersenyum mantap.
* **Narasi Narator:**
  > *"Demikian presentasi Progres Pertama terkait PRD dan Konsep Aplikasi SI PADI. Pada tahapan selanjutnya, saya akan membedah pemodelan visual 4 Diagram UML dan arsitektur sistem pada Progres Kedua. Terima kasih atas perhatian Bapak Yudhistira Arie Wijaya. Wassalamu’alaikum Warahmatullahi Wabarakatuh."*

---

# VIDEO PROGRES 2: PEMODELAN UML & UI/UX (SDD)
* **Bobot Penilaian:** 30% dari Nilai Total Video
* **Target Alokasi Durasi:** 5 – 7 Menit (Ideal: 6 Menit 00 Detik)
* **Fokus Materi:** Membahas dan membedah alur logika 4 Diagram UML Utama (Use Case, Activity, Class, Sequence) secara runut, kepatuhan prinsip SOLID, ERD basis data, dan walkthrough prototipe UI/UX.

### [00:00 – 00:40] Segmen 1: Pembukaan & Pengantar SDD
* **Tampilan Visual:** Layar menampilkan Dokumen SDD / Gambar Diagram UML SI PADI, Webcam aktif di pojok kanan atas.
* **Narasi Narator:**
  > *"Assalamu’alaikum Warahmatullahi Wabarakatuh. Selamat pagi/siang kepada Bapak Yudhistira Arie Wijaya, M.Kom., CDS., dan rekan-rekan sekalian.*  
  > *Kembali lagi bersama saya, Karisma Siti Nabila, NIM 4122001, dalam pemaparan **Video Progres Kedua Mata Kuliah Rekayasa Perangkat Lunak**.*  
  > *Pada video ini, saya akan membedah secara mendalam dokumen Software Design Document (SDD) yang mencakup 4 Diagram UML Utama, pemenuhan prinsip SOLID, struktur Entity Relationship Diagram 13 tabel, serta prototipe antarmuka UI/UX yang telah saya rancang secara mandiri."*

### [00:40 – 01:50] Segmen 2: Bedah Use Case Diagram & Skenario Aktor
* **Tampilan Visual:** Layar menampilkan Gambar Diagram Use Case (Gambar 2.1 di Laporan).
* **Narasi Narator:**
  > *"Mari kita mulai dari **Use Case Diagram**. Pada diagram ini, saya memodelkan 3 Aktor Primer yaitu Administrator, Perangkat Desa, dan Petani, serta 2 Sistem Eksternal yaitu AI & Weather API dan Notifikasi Gateway.*  
  > *Terdapat 14 Use Case terdefinisi secara presisi:*  
  > *Aktor Petani memiliki hak akses untuk registrasi mandiri, melihat peta GIS petak sawah miliknya, mencatat log harian aktivitas budidaya, mencatat realisasi panen, serta berkonsultasi dengan chatbot AI.*  
  > *Aktor Perangkat Desa berperan memonitor rekapitulasi pertanian seluruh dusun, memverifikasi data panen, dan menerbitkan laporan kedinasan resmi bertanda tangan Kuwu.*  
  > *Sedangkan Administrator memiliki hak akses penuh (Full CRUD) terhadap master data pengguna, konfigurasi parameter AI, audit log sistem, dan manajemen gateway notifikasi.*  
  > *Sistem eksternal Fonnte WhatsApp dan SMTP terhubung melalui relasi extend pada use case Registrasi OTP dan Early Warning System."*

### [01:50 – 03:00] Segmen 3: Bedah Activity Diagram (Bisnis, Registrasi OTP, & AI)
* **Tampilan Visual:** Layar menampilkan Activity Diagram Alur Registrasi OTP dan Alur Chatbot AI.
* **Narasi Narator:**
  > *"Selanjutnya pada **Activity Diagram**, saya memodelkan 2 alur aktivitas krusial sistem:*  
  > *Pertama, **Alur Registrasi Petani Mandiri & Verifikasi OTP**: Dimulai saat calon petani mengisi data diri di halaman register. Sistem memvalidasi keunikan NIK dan nomor WhatsApp, membangkitkan 6 digit kode OTP kriptografis acak, menyimpannya di tabel otp_verifications dengan batas kedaluwarsa 5 menit, dan memancarkannya secara simultan via WhatsApp Fonnte dan Email SMTP. Saat petani memasukkan kode yang cocok, sistem otomatis membuat akun User ber-role PETANI dan entitas profil Petani yang saling bertaut, lalu membuat sesi JWT dan mengarahkannya ke Dashboard.*  
  > *Kedua, **Alur Pemrosesan AI Assistant**: Saat pesan diterima di endpoint backend, query dinormalisasi dari slang dan typo bahasa Indonesia. Mesin lokal pertama-tama mengevaluasi apakah query menanyakan master data desa. Jika ya, data dihitung seketika dan dijawab dalam 0 milidetik. Jika berupa pertanyaan konsultasi ilmiah, backend menginjeksi konteks agregasi data database terkini ke System Prompt Gemini API, memastikan respon cerdas, berbasis data, dan terbebas dari halusinasi."*

### [03:00 – 04:15] Segmen 4: Bedah Class Diagram & Kepatuhan Prinsip SOLID
* **Tampilan Visual:** Layar menampilkan Class Diagram Berorientasi Objek (Gambar 2.2 di Laporan).
* **Narasi Narator:**
  > *"Beralih ke **Class Diagram**, perancangan sistem berorientasi objek ini secara ketat mematuhi 5 prinsip **SOLID**:*  
  > *1. **Single Responsibility Principle (SRP)**: Saya memisahkan kelas domain secara tegas. AuthService hanya bertanggung jawab atas enkripsi dan token JWT, AiService hanya menangani pemrosesan bahasa dan context injection, dan NotificationService hanya mengurusi pengiriman pesan.*  
  > *2. **Open-Closed Principle (OCP)**: Saya membuat antarmuka abstrak `IAiProvider`. Jika di masa mendatang ingin menambahkan vendor AI baru seperti DeepSeek atau Claude, kita cukup mengimplementasikan antarmuka ini tanpa mengubah kode modul pemanggil.*  
  > *3. **Liskov Substitution Principle (LSP)**: Kelas konkret `GeminiChatProvider` dan `LocalAgronomyProvider` dapat saling menggantikan peran tanpa menimbulkan error pada controller.*  
  > *4. **Interface Segregation Principle (ISP)**: Antarmuka notifikasi dipisah menjadi `IWhatsAppGateway` dan `IEmailSender` agar tidak ada kelas yang dipaksa mengimplementasikan metode yang tidak relevan.*  
  > *5. **Dependency Inversion Principle (DIP)**: Controller dan Route Handler bergantung pada kontrak abstraksi antarmuka service, bukan pada implementasi library konkret."*

### [04:15 – 05:15] Segmen 5: Bedah Sequence Diagram & Alur Pertukaran Pesan
* **Tampilan Visual:** Layar menampilkan Sequence Diagram (Gambar 2.3 di Laporan).
* **Narasi Narator:**
  > *"Pada **Sequence Diagram**, kita dapat melihat pertukaran pesan secara kronologis:*  
  > *Ketika pengguna di sisi Client mengirimkan kueri seperti 'berapa total pengguna', payload dikirim melalui HTTP POST ke `/api/ai/chat`.*  
  > *Route handler meneruskannya ke fungsi `processAiChat` pada `aiService.ts`.*  
  > *Service layer melakukan kueri ke basis data MySQL TiDB Cloud melalui Prisma ORM untuk mengambil data agregat terkini.*  
  > *Parser semantik mendeteksi fungsi `isBerapaQuery()` bernilai TRUE, sehingga sistem langsung memformat jawaban angka ringkas tanpa membocorkan kredensial pribadi.*  
  > *Respon JSON kemudian dikembalikan ke komponen antarmuka pengguna dalam hitungan milidetik secara asinkron."*

### [05:15 – 06:30] Segmen 6: ERD Basis Data 13 Tabel & Walkthrough Desain UI/UX
* **Tampilan Visual:** Layar menampilkan Diagram ERD (Gambar 2.4) dan cuplikan visual Figma/Dashboard.
* **Narasi Narator:**
  > *"Untuk persistensi data, saya merancang **Entity Relationship Diagram (ERD)** yang memuat **13 Tabel Relasional** dengan kardinalitas Crow's Foot yang terintegrasi penuh: mulai dari tabel users, petani, kelompok_tani, lahan_pertanian, musim_tanam, aktivitas_budidaya, panen, hingga tabel penunjang seperti early_warnings, audit_logs, dan otp_verifications.*  
  > *Dari perancangan basis data tersebut, saya mentransformasikannya ke dalam prototipe antarmuka UI/UX modern bertema **Emerald Agrikultur Cirebon Girang**.*  
  > *Antarmuka dirancang dengan kartu metrik statistik, dropdown filter dinamis, integrasi peta Leaflet interaktif, serta modal pencatatan kegiatan yang intuitif bagi petani di perangkat ponsel pintar."*

### [06:30 – 06:45] Segmen 7: Penutup Video Progres 2
* **Tampilan Visual:** Webcam mahasiswa fokus dan percaya diri.
* **Narasi Narator:**
  > *"Seluruh perancangan SDD dan UML ini telah siap dan selaras 100% dengan implementasi kode sumber yang telah saya bangun. Pada Video Final berikutnya, saya akan mendemonstrasikan secara langsung aplikasi yang berjalan live beserta pengujian otomatis dan status CI/CD. Terima kasih, Wassalamu’alaikum Warahmatullahi Wabarakatuh."*

---

# VIDEO FINAL: LIVE DEMO APLIKASI WEB & SISTEM UTUH
* **Bobot Penilaian:** 50% dari Nilai Total Video
* **Target Alokasi Durasi:** 8 – 12 Menit (Ideal: 10 Menit 30 Detik)
* **Fokus Materi:** Elevator pitch, arsitektur sistem, Live Demo 3 Dashboard & AI real-time, eksekusi Unit Test otomatis, verifikasi status hijau CI/CD Pipeline GitHub Actions, serta refleksi pembelajaran mandiri.

### [00:00 – 01:00] Segmen 1: Elevator Pitch Pembuka & Gambaran Solusi SI PADI
* **Tampilan Visual:** Layar menampilkan Beranda Landing Page SI PADI (`pertanian-cirebon-girang.vercel.app`), Webcam aktif di pojok kanan atas.
* **Narasi Narator:**
  > *"Assalamu’alaikum Warahmatullahi Wabarakatuh. Selamat pagi/siang kepada Dosen Pengampu yang saya hormati, Bapak Yudhistira Arie Wijaya, M.Kom., CDS., dan seluruh penonton sekalian.*  
  > *Nama saya Karisma Siti Nabila, mahasiswi S1 Teknik Informatika STMIK IKMI Cirebon, NIM 4122001.*  
  > *Selamat datang di **Video Presentasi Final dan Live Demo Tugas Akhir Mandiri Rekayasa Perangkat Lunak**.*  
  > *Tahukah Anda bahwa pengelolaan pertanian padi di tingkat pedesaan sering kali mengalami kegagalan panen bukan karena tanah yang tidak subur, melainkan karena tata kelola informasi yang terlambat? Lahan sawah yang tercatat manual, pemupukan yang meleset dari umur Hari Setelah Tanam, serta peringatan hama yang terlambat sampai ke petani.*  
  > *Untuk menjawab tantangan nyata tersebut, saya mempersembahkan **SI PADI: Sistem Informasi Pertanian & Manajemen Budidaya Padi Desa Cirebon Girang**—sebuah platform full-stack terpadu yang memadukan Pemetaan Spasial GIS, Otomatisasi Early Warning System multi-saluran, dan Asisten Cerdas AI yang membaca data riil desa secara live."*

### [01:00 – 02:00] Segmen 2: Arsitektur Sistem & Tech Stack Lengkap
* **Tampilan Visual:** Layar menampilkan diagram arsitektur sistem dan repositori GitHub `github.com/karismasitinabila7-byte/pertanian-cirebon-girang`.
* **Narasi Narator:**
  > *"Sebagai bentuk tanggung jawab 100% kepemilikan mandiri (Full-Stack Engineer), saya membangun aplikasi ini menggunakan arsitektur modern berstandar industri:*  
  > *Frontend dan Backend dibangun di atas **Next.js 15 App Router** dengan **React 19** dan **TypeScript**.*  
  > *Styling menggunakan **Tailwind CSS** dengan pendekatan mobile-first.*  
  > *Basis data menggunakan **MySQL 8.0 di TiDB Cloud Serverless** yang diakses secara type-safe melalui **Prisma ORM**.*  
  > *Autentikasi menggunakan stateless **JSON Web Token (JWT)** via library `jose` yang disimpan di **HttpOnly Secure Cookie**, serta enkripsi kata sandi **bcryptjs**.*  
  > *Dan untuk integrasi eksternal, sistem terhubung ke **Leaflet.js** untuk peta GIS, **Fonnte WhatsApp Gateway API** dan **SMTP Nodemailer** untuk notifikasi, serta **Google Gemini 3.0 Flash API** yang didukung Super Engine Agronomi Lokal."*

### [02:00 – 03:45] Segmen 3: Live Demo Role Administrator (12 Menu, GIS, & Konfigurasi)
* **Tampilan Visual:** Browser live: Login sebagai Admin (`karismasitinabila7@gmail.com`), menampilkan Dashboard Admin (`/admin`), Peta GIS, Data Master User, dan Konfigurasi Sistem.
* **Narasi Narator:**
  > *"Sekarang mari kita masuk ke sesi **Live Demo Langsung**.*  
  > *Pertama, saya login sebagai **Administrator Sistem** atas nama Karisma Siti Nabila.*  
  > *Pada dashboard Admin, terdapat **12 menu utama**:*  
  > *Di halaman utama, kita melihat ringkasan metrik statistik: 6 akun terdaftar, 4 petani, 4 petak sawah seluas 6,00 Hektar, 3 musim tanam aktif, serta grafik estimasi dan realisasi panen.*  
  > *Sekarang saya buka menu **Peta Lahan GIS**. Peta satelit Leaflet ini memetakan seluruh batas poligon sawah Desa Cirebon Girang. Saat saya klik petak di Blok Manis, tooltip interaktif langsung menampilkan nama petak, luas 2,0 Ha, petani pengelola Bapak Sutarjo, dan varietas Inpari 32.*  
  > *Selanjutnya pada menu **Data Master User**, Administrator dapat mengontrol akun seluruh pengguna desa, mengatur role, mereset sandi, hingga menonaktifkan akun secara instan.*  
  > *Dan pada menu **Konfigurasi Sistem**, Admin dapat mengatur parameter AI Provider (Gemini / OpenAI), persona gaya bahasa (Sunda/Santun, Peneliti, atau Penyuluh Ringkas), token WhatsApp Gateway Fonnte, serta pengaturan server email SMTP."*

### [03:45 – 05:15] Segmen 4: Live Demo Role Perangkat Desa (Monitoring & Cetak Laporan Kuwu)
* **Tampilan Visual:** Browser live: Logout, lalu Login sebagai Perangkat Desa / Kuwu (`karsiman@gmail.com`), menampilkan Dashboard Desa (`/desa`) dan klik tombol [Cetak / PDF] Laporan.
* **Narasi Narator:**
  > *"Sekarang saya beralih ke role kedua: **Perangkat Desa**, atas nama **Kuwu Desa Cirebon Girang, Bapak Karsiman, S.Sos**.*  
  > *Dashboard Perangkat Desa memiliki **10 menu khusus** yang berfokus pada pengawasan wilayah.*  
  > *Kuwu dapat memantau produktivitas 3 kelompok tani: Sri Rejeki, Sumber Subur, dan Tani Makmur.*  
  > *Fitur unggulan bagi perangkat desa adalah **Penerbitan Laporan Kedinasan Resmi**.*  
  > *Saat saya membuka menu Data Panen atau Lahan Pertanian lalu mengklik tombol hijau **[Cetak / PDF]**, sistem secara otomatis menghasilkan dokumen laporan resmi berstandar kedinasan.*  
  > *Dokumen ini lengkap dengan **Kop Resmi Pemerintah Kabupaten Cirebon, Kantor Kuwu Desa Cirebon Girang**, tabel inventarisasi luas lahan 6,0 Ha, rekapitulasi realisasi panen 14,50 Ton, serta **tanda tangan pengesahan asli Kuwu Bapak Karsiman, S.Sos** untuk diserahkan ke Dinas Pertanian Kabupaten Cirebon."*

### [05:15 – 06:45] Segmen 5: Live Demo Role Petani (Registrasi, OTP WhatsApp/Email, & Log Sawah)
* **Tampilan Visual:** Browser live: Membuka `/register`, mendemokan alur pendaftaran petani baru, simulasi penerimaan OTP 6 digit, lalu login ke Dashboard Petani (`/petani`).
* **Narasi Narator:**
  > *"Kini kita uji peran terpenting, yaitu **Petani**.*  
  > *Bagaimana jika ada warga tani baru yang ingin bergabung?*  
  > *Petani membuka halaman pendaftaran di `/register`. Petani mengisikan Nama Lengkap, NIK 16 digit, nomor WhatsApp, email, dan memilih kelompok tani naungannya.*  
  > *Saat tombol 'Daftar' ditekan, sistem membuat kode OTP 6 digit acak yang berlaku selama 5 menit.*  
  > *Sistem secara simultan mengirimkan kode OTP ini langsung ke **WhatsApp petani melalui Gateway Fonnte** dan ke **Email melalui SMTP**.*  
  > *Setelah petani memasukkan 6 digit kode pada form verifikasi, akun seketika aktif dan petani langsung diarahkan ke Dashboard Petani.*  
  > *Di dalam Dashboard Petani, Bapak Sukardi dapat memantau petak sawah garapannya, mencatat log harian aktivitas budidaya seperti penaburan pupuk susulan beserta biayanya, mencatat hasil panen gabah, serta menerima notifikasi Early Warning System jika umur tanaman memasuki fase kritis pemupukan."*

### [06:45 – 08:30] Segmen 6: Live Demo Pengujian AI Assistant (Uji Aturan "Berapa", "Siapa", & Ujian Dosen)
* **Tampilan Visual:** Membuka widget melayang **AI Assistant** di pojok kanan bawah, lalu mengetikkan prompt pengujian secara langsung.
* **Narasi Narator:**
  > *"Sekarang kita masuk ke fitur paling canggih: **Kecerdasan Artifisial (AI Assistant SI PADI)**.*  
  > *Sesuai dengan arahan pengujian, AI ini telah dibekali aturan semantik ketat dan penguasaan 15 topik materi rekayasa perangkat lunak.*  
  > *Mari kita uji aturan pertama: **Kata Tanya 'Berapa' wajib dijawab dengan angka ringkas tanpa membeberkan kredensial pribadi**.*  
  > *Saya ketik: `'berapa total pengguna'`.*  
  > *[Tunjukkan respon di layar] &rarr; Perhatikan, AI langsung menjawab to-the-point: **'Total pengguna terdaftar adalah 6 orang (terdiri dari 1 Administrator, 1 Perangkat Desa, dan 4 Petani)'**.*  
  > *Lalu saya uji: `'berapa luas lahan sawah'`.*  
  > *[Tunjukkan respon] &rarr; AI menjawab presisi: **'Total luas lahan sawah adalah 6,00 Hektar (60.000 m²)'**.*  
  > *Lalu: `'berapa hasil panen'` &rarr; AI menjawab: **'14,50 Ton (14.500 kg gabah)'**.*  
  >  
  > *Sekarang kita uji aturan kedua: **Kata Tanya 'Siapa' wajib dijawab langsung dengan nama subjek**.*  
  > *Saya ketik: `'siapa kepala desa'`.*  
  > *[Tunjukkan respon] &rarr; AI menjawab: **'Kepala Desa (Kuwu) Desa Cirebon Girang adalah Bapak Karsiman, S.Sos'**.*  
  > *Saya ketik: `'siapa admin'` &rarr; Dijawab: **'Administrator sistem SI PADI adalah Karisma Siti Nabila'**.*  
  > *Saya ketik: `'siapa aja petani yang terdaftar'` &rarr; AI langsung menyebutkan nama 4 petani binaan: Bapak Sukardi, Bapak Sutarjo, Bapak H. Karyono, dan Arka Saputra.*  
  >  
  > *Dan yang paling istimewa, AI ini mampu menjawab **seluruh pertanyaan Dosen Penguji Sidang** seputar arsitektur web!*  
  > *Saya coba tanyakan: `'apa tech stack sistem ini'`.*  
  > *[Tunjukkan respon] &rarr; AI menjelaskan secara akademik arsitektur Next.js 15, React 19, TypeScript, Tailwind, Prisma ORM, MySQL TiDB Cloud, hingga Vercel.*  
  > *Saya tanyakan: `'bagaimana sistem mencegah SQL Injection'`.*  
  > *[Tunjukkan respon] &rarr; AI menjelaskan penggunaan Parameterized Queries pada Prisma ORM dan sanitasi React DOM.*  
  > *Semua jawaban terbukti akurat, cerdas, dan berbasis data riil!"*

### [08:30 – 09:30] Segmen 7: Pengujian Unit Test Otomatis Terminal & Status Hijau CI/CD GitHub
* **Tampilan Visual:** Buka terminal VS Code / PowerShell, jalankan perintah `npm test`, lalu beralih ke tab browser GitHub Actions (`.github/workflows/ci.yml`).
* **Narasi Narator:**
  > *"Untuk membuktikan kualitas kode sesuai Rubrik Penilaian OBE Dimensi 4, saya telah menyusun skrip **Automated Unit Testing** dan mengonfigurasi **DevOps CI/CD Pipeline**.*  
  > *Sekarang di terminal, saya jalankan perintah: `npm test`.*  
  > *[Tunjukkan terminal berjalan] &rarr; Perhatikan hasilnya: 6 rangkaian tes unit otomatis berbasis Node Native Test Runner berjalan sukses dengan status **pass: 6, fail: 0** dalam waktu 3,7 detik!*  
  > *Sekarang kita buka tab browser pada repositori GitHub saya di menu **Actions**.*  
  > *[Tunjukkan browser GitHub Actions] &rarr; Dapat kita saksikan bersama, alur workflow **CI/CD Pipeline SI PADI** berstatus **HIJAU (Passing)**! Setiap kali ada commit kode baru, GitHub Actions otomatis menguji dependensi, memvalidasi Prisma client, menjalankan unit test, dan memverifikasi build produksi tanpa kesalahan."*

### [09:30 – 10:30] Segmen 8: Refleksi Pembelajaran Mandiri (End-to-End Ownership) & Penutup
* **Tampilan Visual:** Layar menampilkan halaman Profil / Dashboard utama, Webcam mahasiswa fokus.
* **Narasi Narator:**
  > *"Sebagai penutup, mengerjakan proyek akhir mandiri ini memberikan pengalaman luar biasa bagi saya sebagai seorang calon Sarjana Teknik Informatika.*  
  > *Membangun sistem secara utuh dari nol (100% Individual Ownership)—mulai dari menyusun PRD standar IEEE 830, memodelkan 4 diagram UML yang patuh pada prinsip SOLID, merancang ERD 13 tabel, mengimplementasikan Clean Code Next.js 15, mengintegrasikan AI real-time, hingga menyiapkan automated testing dan CI/CD pipeline—memberikan pemahaman mendalam tentang siklus hidup rekayasa perangkat lunak secara profesional.*  
  > *SI PADI bukan hanya sekadar tugas kuliah, melainkan sebuah solusi digital nyata yang siap memberdayakan para petani dan pemerintah Desa Cirebon Girang menuju era pertanian modern yang cerdas dan transparan.*  
  > *Terima kasih yang sebesar-besarnya saya sampaikan kepada Dosen Pengampu, Bapak Yudhistira Arie Wijaya, M.Kom., CDS., atas bimbingan dan arahan akademis yang sangat berharga selama satu semester ini.*  
  > *Mohon maaf atas segala kekurangan. Wabillahi taufiq wal hidayah, Wassalamu’alaikum Warahmatullahi Wabarakatuh."*

---
*Dokumen Naskah Script Presentasi Video SI PADI telah selesai disusun & siap digunakan untuk perekaman.*
