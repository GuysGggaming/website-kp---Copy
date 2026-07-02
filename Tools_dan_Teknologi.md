TOOLS DAN TEKNOLOGI YANG DIGUNAKAN
Website SMK NUFA CITRA MANDIRI


Berikut adalah daftar lengkap tools dan teknologi yang digunakan dalam pengembangan proyek website SMK NUFA CITRA MANDIRI.


1. FRONTEND (SISI PENGGUNA)

a. HTML5
   Digunakan sebagai struktur utama halaman web. Menggunakan elemen semantik seperti section, article, nav, dan figure untuk meningkatkan aksesibilitas dan SEO.

b. CSS3 (Vanilla CSS)
   Digunakan untuk styling seluruh tampilan website. CSS diorganisir secara modular ke dalam 17 file terpisah yang diimpor melalui satu file utama bernama style.css menggunakan perintah @import. File CSS tersebut meliputi base.css, navbar.css, components.css, hero.css, sections.css, page-hero.css, footer.css, animations.css, berita.css, kontak.css, ppdb.css, profil.css, jurusan.css, fasilitas.css, bukti.css, dan utilities.css.

c. JavaScript (ES6+)
   Digunakan untuk menangani logika interaktif pada website, meliputi formulir multi-step PPDB, validasi input pengguna, upload file dengan fitur preview, komunikasi AJAX ke backend, animasi scroll-reveal, serta animasi counter angka statistik. Terdapat 6 file JavaScript yaitu main.js, ppdb.js, bukti-pdf.js, berita.js, admin.js, dan config.js.

d. Google Fonts
   Digunakan untuk tipografi website dengan mengimpor dua jenis font, yaitu Playfair Display untuk heading dan Source Sans 3 untuk body text.


2. LIBRARY EKSTERNAL (CDN)

a. Lucide Icons
   Digunakan di seluruh halaman website untuk menampilkan ikon seperti map-pin, mail, phone, shield-check, users, cpu, dan lain-lain. Dimuat dari CDN unpkg.

b. jsPDF
   Digunakan untuk menghasilkan bukti pendaftaran PPDB dalam format PDF. Dimuat dari CDN cdnjs.

c. jsPDF-AutoTable
   Plugin tambahan untuk jsPDF yang memungkinkan pembuatan tabel data siswa secara otomatis di dalam file PDF. Tabel berisi informasi seperti nama lengkap, NIK, tempat tanggal lahir, jenis kelamin, alamat, nomor HP, asal sekolah, dan program keahlian yang dipilih.

d. QRCode.js
   Library untuk menghasilkan QR code secara otomatis pada halaman bukti pendaftaran. QR code berisi informasi nomor pendaftaran dan nama siswa sebagai alat verifikasi.


3. BACKEND (SERVERLESS)

a. Google Apps Script (GAS)
   Berfungsi sebagai backend serverless yang berperan sebagai REST API. Menerima HTTP request bertipe GET dan POST untuk memproses data pendaftaran PPDB serta manajemen berita (tambah, ambil, dan hapus). Kode backend ditulis dalam file Code.gs di dalam folder gas pada project.

b. Google Sheets
   Sebagai database utama untuk menyimpan data. Terdapat dua sheet yang digunakan, yaitu sheet Data PPDB untuk menyimpan data pendaftaran siswa baru (berisi kolom ID Pendaftaran, Timestamp, Nama Lengkap, NIK, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Alamat, Asal Sekolah, Nomor HP, Pilihan Jurusan, Link Foto, Link KK, Link Ijazah/SKL, dan Status) serta sheet Data Berita untuk menyimpan data berita dan pengumuman (berisi kolom ID, Timestamp, Judul, Kategori, Deskripsi, dan Link Gambar).

c. Google Drive
   Sebagai file storage untuk menyimpan dokumen yang diunggah oleh calon siswa, meliputi pas foto, Kartu Keluarga, dan ijazah atau SKL. Setiap pendaftar dibuatkan sub-folder tersendiri di Google Drive dengan format penamaan berupa ID Pendaftaran dan Nama Lengkap. File yang diunggah secara otomatis diatur agar dapat diakses oleh siapa pun yang memiliki link (sharing link otomatis).


4. PENYIMPANAN LOKAL (FALLBACK OFFLINE)

a. localStorage
   Digunakan sebagai penyimpanan cadangan di browser. Menyimpan data berita dan data PPDB secara lokal jika koneksi ke Google Sheets gagal, sehingga website tetap dapat berfungsi meskipun dalam kondisi offline. Data berita default juga disimpan di localStorage dengan mekanisme versioning untuk memastikan data selalu diperbarui.

b. sessionStorage
   Digunakan untuk manajemen sesi login admin. Menyimpan status autentikasi (apakah admin sudah login atau belum) selama sesi browser aktif pada halaman admin. Status login akan hilang ketika browser atau tab ditutup.


5. API DAN LAYANAN PIHAK KETIGA

a. WhatsApp API (wa.me)
   Digunakan untuk integrasi kontak langsung melalui floating button WhatsApp yang muncul di setiap halaman. Selain itu, form kontak pada halaman Kontak juga memanfaatkan API ini untuk mengarahkan pesan yang ditulis pengguna langsung ke nomor WhatsApp panitia PPDB.

b. Google Maps Embed API
   Digunakan untuk menampilkan peta interaktif lokasi sekolah pada halaman Kontak. Peta menunjukkan lokasi SMK NUFA CITRA MANDIRI di Gg. Jambu Jl. Kedaung No.29, Sawangan, Depok.

c. Google Drive Thumbnail API
   Digunakan untuk menampilkan gambar berita yang tersimpan di Google Drive sebagai thumbnail yang dapat ditampilkan langsung di halaman website. URL gambar dari Drive dikonversi secara otomatis ke format thumbnail agar dapat di-embed.


6. BROWSER API YANG DIMANFAATKAN

a. IntersectionObserver API
   Digunakan untuk mendeteksi apakah suatu elemen sudah terlihat di viewport pengguna. Fitur ini dimanfaatkan untuk dua hal, yaitu animasi scroll-reveal (elemen muncul secara bertahap saat pengguna menggulir halaman) dan animasi counter angka statistik pada hero section (angka berjalan dari 0 ke nilai target saat elemen terlihat).

b. FileReader API
   Digunakan untuk membaca file yang dipilih pengguna dari perangkatnya. Fitur ini dimanfaatkan untuk menampilkan preview file sebelum diunggah (seperti preview foto, Kartu Keluarga, dan ijazah) serta mengkonversi file ke format Base64 agar dapat dikirimkan ke backend Google Apps Script melalui JSON.

c. Fetch API
   Digunakan untuk melakukan komunikasi AJAX (Asynchronous JavaScript and XML) ke Google Apps Script. Komunikasi ini mencakup pengiriman data pendaftaran PPDB (metode POST), pengambilan data berita (metode GET), penambahan berita baru (metode POST), dan penghapusan berita (metode POST).


ARSITEKTUR SISTEM

Secara garis besar, arsitektur sistem website ini terdiri dari dua lapisan utama:
Lapisan pertama adalah sisi browser (frontend) yang terdiri dari 8 halaman statis HTML (index.html, profil.html, jurusan.html, fasilitas.html, berita.html, kontak.html, ppdb.html, bukti-pendaftaran.html, dan admin.html), 17 file CSS modular untuk styling, serta 6 file JavaScript untuk logika interaktif.

Lapisan kedua adalah sisi server (backend) yang menggunakan Google Apps Script sebagai penghubung. Google Apps Script menerima request dari browser melalui Fetch API, kemudian memprosesnya dan menyimpan data ke Google Sheets sebagai database serta Google Drive sebagai penyimpanan file.

Proyek ini menggunakan arsitektur website statis (static site) tanpa framework frontend. Seluruh kode ditulis murni menggunakan HTML, CSS, dan JavaScript vanilla, dengan backend serverless menggunakan Google Apps Script. Pendekatan ini dipilih karena efisien, tidak memerlukan biaya hosting tambahan, dan mudah dikelola oleh pihak sekolah.
