# SMK NUFA CITRA MANDIRI - Website Profil & PPDB

Proyek ini adalah *website* profil dan portal pendaftaran PPDB (Penerimaan Peserta Didik Baru) untuk **SMK NUFA CITRA MANDIRI** jurusan **Teknik Komputer & Jaringan (TKJ)**. Website ini dirancang sangat modern, responsif, dilengkapi animasi mikro, serta ditenagai oleh **Vanilla Javascript**, **Google Apps Script (Backend Backend-less)**, dan **LocalStorage** sehingga sangat ringan tanpa memerlukan server database konvensional.

---

## 🌟 Fitur Utama

-   **Profil Sekolah Lengkap**: Halaman interaktif mulai dari profil, fasilitas, galeri terfilter, dan kontak integrasi WhatsApp.
-   **Portal PPDB Dinamis**: Sistem formulir pendaftaran bertahap (*multi-step*) lengkap dengan validasi dan unggah berkas (KK, Foto, Ijazah).
-   **Manajemen Berita (Dinamic News)**: Pengunjung dapat melihat berita terbaru yang datanya bersifat dinamis, tidak lagi sekadar teks hardcode HTML.
-   **Dashboard Admin Panel**: Sistem eksklusif untuk staf pengelola guna menerbitkan, menghapus, dan mengatur berita yang tampil di halaman pendaftaran.

---

## 🔐 Kredensial Login Admin (SANGAT PENTING)

Sistem admin diletakkan dan diamankan pada file `admin.html`. Digunakan untuk menambah dan menghapus Berita.

*   **URL Akses:** Buka halaman `admin.html` di browser Anda.
*   **Username:** `admin`
*   **Password:** `admin123`

>**Petunjuk Tambahan Admin:** 
>Sistem menyimpan data pengelolaan berita ini di **LocalStorage** browser masing-masing pengunjung. Saat menambahkan foto baru, foto disimpan dalam skema *Base64* agar memori tetap tertata tanpa perlu server *Cloud* sementara.

---

## ⚙️ Cara Kerja Sistem Form PPDB

Pendaftaran calon siswa ditampung dan dikirimkan ke **Google Sheets** dengan berkas pendaftar disalurkan ke **Google Drive**.

1.  **Script Backend:** Kode program Google Apps script tersedia di folder `gas/Code.gs`. Skrip inilah yang bertugas menangkap form data dari front-end.
2.  **Konfigurasi File JS:** Anda harus memasang ID URL *web deployment* dari AppScript pada baris pertama di file `js/ppdb.js` (`const GAS_URL = 'https://script.google.com/...';`).
3.  **Mode Otomatis Demo (Fallback):** Jika *Link Endpoint* AppScript belum dikonfigurasi (masih `'YOUR_DEPLOYMENT_ID'`), website secara **cerdas** akan menggantinya langsung ke versi uji coba (menyimpan data ke keranjang browser sementara & langsung melompat ke layar Bukti Sukses tanpa gagal *crash*).

---

## 📂 Struktur File dan Folder

*   `index.html` → Halaman beranda (*landing page* utama).
*   `admin.html` → **Halaman login dan dasboard Admin Berita**.
*   `berita.html` → Halaman berita yang mencetak kartu berita dari skrip JS.
*   `ppdb.html` → Portal form pendaftaran khusus TKJ.
*   `bukti-pendaftaran.html` → Tampilan kwitansi sukses untuk pencetakan (Print).
*   `css/style.css` → Gaya utama mencakup *Dark Mode compatibility*, palet *blue-green accent* modern, UI glassmorphism.
*   `js/` → Berisi seluruh urat nadi sistem (`admin.js`, `berita.js`, `main.js`, `ppdb.js`).
*   `gas/Code.gs` → Pusat cadangan skrip server *Google Apps* (jika butuh _deploy_ ulang sheet).

---

© 2026 SMK NUFA CITRA MANDIRI. Hak cipta dilindungi.
