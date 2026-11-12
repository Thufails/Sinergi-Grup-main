<div align="center">
  <img src="images/SBS%20BARU.png" alt="Logo Sinergi Business Solution" width="390">
  <h1>Website Profil Sinergi Group</h1>
  <p>Dokumentasi situs dan panduan pengelolaan artikel.</p>
  <p><kbd>HTML</kbd> <kbd>CSS</kbd> <kbd>JavaScript</kbd> <kbd>Static Site</kbd></p>
</div>

<br>

## Tentang proyek

Situs profil Sinergi Business Solution / Sinergi Group dibuat dengan HTML, CSS, dan JavaScript. Halaman publik berupa file statis, jadi dapat disajikan menggunakan hosting web statis tanpa server aplikasi khusus.

### Daftar isi

- [Struktur proyek](#struktur-proyek)
- [Menjalankan situs](#menjalankan-situs)
- [Build artikel](#build-artikel)
- [Menambah atau memperbarui artikel](#menambah-atau-memperbarui-artikel)
- [Status draf dan publikasi](#status-draf-dan-publikasi)
- [Daftar isi dan rekomendasi artikel](#daftar-isi-dan-rekomendasi-artikel)
- [Login dan editor admin](#login-dan-editor-admin)
- [Pemeriksaan sebelum publikasi](#pemeriksaan-sebelum-publikasi)

## Struktur proyek

| Bagian | Fungsi |
| --- | --- |
| `index.html` | Beranda |
| `about.html`, `services.html`, `programs.html`, `gallery.html`, `contact.html` | Halaman profil, layanan, program, galeri, dan kontak |
| `blog.html` | Daftar artikel hasil build |
| `artikel/articles.mjs` | Sumber data dan isi seluruh artikel |
| `artikel/<slug>.html` | Halaman detail artikel hasil build |
| `admin/index.html` | Editor artikel di balik login admin |
| `templates/` | Template halaman artikel dan daftar artikel |
| `scripts/build-articles.mjs` | Generator halaman artikel statis |
| `css/style.css` | Tampilan dan komponen visual |
| `js/script.js` | Interaksi di browser |
| `images/` | Logo dan aset gambar situs |

`AGENTS.md` menyimpan konteks pengerjaan dan preferensi desain proyek. Panduan ringkas artikel juga ada di [`artikel/README.md`](artikel/README.md).

## Menjalankan situs

**Kebutuhan:** VS Code dengan ekstensi Live Server untuk melihat situs lokal, serta Node.js versi LTS untuk membuat ulang halaman artikel dan paket Cloudflare. Tidak perlu menjalankan `npm install`: generator memakai modul bawaan Node.js dan editor admin memuat pustaka Word dari CDN saat dibuka. Karena itu, fitur impor/ekspor Word memerlukan koneksi internet.

Untuk melihat situs di komputer sendiri, buka folder ini di VS Code dan jalankan Live Server dari `index.html`. Server lokal membantu halaman dan tautan bekerja seperti saat di-hosting.

## Build artikel

Dari folder utama proyek, jalankan:

```bash
npm run build
```

Perintah ini membaca `artikel/articles.mjs` dan template, kemudian membuat halaman detail artikel serta memperbarui `blog.html`. Alias berikut menjalankan proses yang sama:

```bash
npm run build:articles
```

> **Penting:** jangan mengedit isi `blog.html` atau `artikel/<slug>.html` secara langsung. File tersebut dihasilkan ulang pada build berikutnya. Ubah data atau template sumber, lalu jalankan build kembali.

## Menambah atau memperbarui artikel

1. Buka `artikel/articles.mjs`.
2. Ubah objek artikel dengan `slug` yang sesuai, atau tambahkan objek baru ke array `articles`.
3. Gunakan `slug` unik dengan huruf kecil dan tanda hubung.
4. Simpan foto yang sesuai di `images/`, lalu isi jalur relatifnya pada properti `image`.
5. Lengkapi metadata dan isi artikel. Contoh:

```js
{
    slug: "komunikasi-dalam-tim",
    title: "Membangun Komunikasi yang Efektif dalam Tim",
    category: "Pengembangan SDM",
    summary: "Ringkasan singkat yang tampil pada kartu artikel.",
    description: "Deskripsi untuk mesin pencari, tulis secara ringkas dan spesifik.",
    image: "images/artikel-komunikasi-tim.jpg",
    imageAlt: "Anggota tim berdiskusi di ruang kerja",
    status: "draft",
    featured: false,
    topics: ["komunikasi", "pengembangan-tim"],
    content: String.raw`
        <p class="article-intro">Pembuka yang merangkum persoalan dan konteks artikel.</p>
        <h2>Mulai dengan tujuan komunikasi</h2>
        <p>Jelaskan pembahasan bagian ini dengan contoh yang relevan.</p>
        <h2>Bangun kebiasaan berdiskusi</h2>
        <p>Tambahkan panduan praktis untuk pembaca.</p>
        <h2>Kesimpulan</h2>
        <p>Tutup dengan rangkuman dan langkah yang jelas.</p>`,
},
```

| Properti | Kegunaan |
| --- | --- |
| `slug` | Identitas unik dan nama URL artikel |
| `title` | Judul pada kartu dan halaman detail |
| `category` | Kategori yang terlihat dan dipakai untuk filter |
| `summary` | Ringkasan pada kartu artikel |
| `description` | Deskripsi SEO halaman |
| `image` | Jalur foto dari folder root proyek |
| `imageAlt` | Teks alternatif yang menjelaskan foto |
| `status` | `draft` atau `published` |
| `featured` | Menandai satu artikel terbit sebagai artikel unggulan |
| `topics` | Kata kunci untuk mengurutkan artikel terkait |
| `content` | Isi artikel dalam HTML semantik |

### Status draf dan publikasi

- Pakai `status: "draft"` selama artikel masih disiapkan. Artikel draf tidak muncul di daftar, filter, atau rekomendasi, dan halaman detail publiknya tidak dibuat.
- Saat artikel siap terbit, ubah statusnya menjadi `published`, lalu jalankan `npm run build`.
- Artikel unggulan harus berstatus `published`. Pastikan hanya ada satu artikel terbit yang memiliki `featured: true`.
- Artikel yang sudah tampil saat ini ditandai `published`. Mengubahnya menjadi `draft` akan menariknya dari situs.
- Jika artikel yang sebelumnya terbit diubah menjadi draf, generator menghapus file HTML lokalnya. Saat deploy, sinkronkan penghapusan file itu ke hosting; jika file lama tertinggal di server, URL langsungnya masih dapat dibuka.

### Daftar isi dan rekomendasi artikel

- Daftar isi dibuat otomatis dari heading `<h2>` ketika artikel memiliki setidaknya tiga subjudul.
- Rekomendasi di akhir artikel mengutamakan kategori yang sama, lalu menggunakan kesamaan `topics` untuk menentukan urutan.
- Artikel draf tidak dimasukkan dalam rekomendasi.

## Login dan editor admin

### Membuka halaman admin

Di Cloudflare Pages, buka `/admin/login.html` (atau `/admin/login`); setelah login, panel editor tersedia di `/admin/`. Pages Functions memeriksa sesi bertanda tangan server-side sebelum melayani panel dan aset admin. Tanpa konfigurasi kredensial, login gagal tertutup dan panel tidak bisa dibuka.

Untuk melihat tampilan lokal, buka `admin/login.html` lewat Live Server. Live Server statis tidak menjalankan Pages Functions, jadi login hanya berfungsi pada deployment Cloudflare atau lingkungan Functions lokal yang diberi secret.

### Menyiapkan kredensial Cloudflare

Di dashboard Cloudflare, buka **Workers & Pages → sinergi-grup-main → Settings → Variables and Secrets** dan pilih environment **Production**. Tambahkan:

| Nama | Jenis | Nilai |
|---|---|---|
| `ADMIN_EMAIL` | Variable | Email admin yang dipilih pemilik |
| `ADMIN_PASSWORD` | Secret terenkripsi | Kata sandi unik, minimal 8 karakter |
| `ADMIN_SESSION_SECRET` | Secret terenkripsi | Kunci acak minimal 32 karakter untuk menandatangani sesi login |

Buat kunci sesi acak dari PowerShell atau terminal VS Code dengan Node.js:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Perintah tersebut menghasilkan 64 karakter acak. Salin hasilnya ke nilai `ADMIN_SESSION_SECRET` di Cloudflare. Kunci ini bukan password untuk login dan tidak perlu dihafalkan.

Simpan password dan secret langsung di dashboard Cloudflare; jangan masukkan ke GitHub atau kirim lewat chat. Setelah semua nilai disimpan, buat deployment baru agar Pages Functions memakai pengaturan terbaru. Jika project Pages dibuat ulang, ketiga nilainya harus dimasukkan kembali. Bila login belum dikonfigurasi atau ada nilai yang terlalu pendek, halaman login akan menampilkan pesan bahwa pengaturan belum aktif.

Biarkan `ADMIN_SESSION_SECRET` tetap sama dari satu deployment ke deployment berikutnya. Sesi login berlaku maksimal 8 jam; setelah kedaluwarsa, admin harus login lagi. Mengganti kunci sesi membatalkan semua sesi aktif sehingga admin perlu login kembali. Ganti kunci jika ada alasan keamanan, misalnya nilainya terungkap.

File `.env` atau `.dev.vars` hanya diperlukan bila menjalankan Pages Functions secara lokal dengan Wrangler. File lokal itu tidak mengatur deployment Production dan tidak boleh di-commit ke GitHub. Untuk situs online, simpan kredensial melalui **Variables and Secrets** Cloudflare.

### Menggunakan editor

- **Unduh template** membuat dokumen Word contoh dengan gaya judul dan subjudul yang dapat dibaca saat impor.
- **Impor Word** memasukkan judul dan isi dari berkas `.docx` ke formulir. Metadata dan foto sampul dilengkapi di halaman admin; foto yang tertanam di Word belum diimpor.
- Toolbar editor dipakai untuk mengatur paragraf, subjudul, tebal/miring, daftar, dan kutipan.
- **Pratinjau** menampilkan tampilan artikel.
- **Simpan draf** menyimpan ke localStorage browser pada perangkat itu saja. Dari daftar draf, tombol **Edit** memuat draf kembali ke editor dan **Hapus** menghapusnya setelah konfirmasi. **Unduh draf JSON** membuat cadangan.
- **Ekspor Word** mengunduh naskah untuk arsip atau review.
- Tombol **Terbitkan** masih nonaktif. Login sudah diperiksa server-side, tetapi artikel belum disimpan ke database dan belum terhubung ke halaman publik.

Impor Word memetakan gaya `Title` menjadi judul dan `Heading 1` menjadi subjudul. Format dokumen Word yang rumit bisa perlu dirapikan kembali di editor. Panel memuat Mammoth.js dan docx.js dari CDN, jadi koneksi internet diperlukan untuk impor, ekspor, dan mengunduh template. Bila CDN gagal dimuat, muat ulang halaman setelah koneksi tersedia.

### Koneksi hosting dan penerbitan

Untuk sementara, gunakan alur terbit yang sudah ada: ubah `artikel/articles.mjs`, jalankan `npm run build`, lalu push ke branch `main`. Panel admin sudah dapat dibuka dengan login di Cloudflare, tetapi draf masih tersimpan di localStorage browser yang sedang digunakan. Panel belum menyimpan draf lintas perangkat, mengunggah foto, atau menerbitkan langsung.

### Deploy situs publik ke Cloudflare Pages lewat GitHub

Untuk proyek Pages yang terhubung ke repository GitHub ini, gunakan pengaturan build berikut:

| Pengaturan | Nilai |
|---|---|
| Framework preset | `None` |
| Production branch | `main` |
| Build command | `npm run build:cloudflare` |
| Build output directory | `dist` |
| Root directory | Kosongkan (root repository) |

Perintah tersebut membangun ulang artikel lalu menyalin halaman publik, login dan editor admin, CSS, JavaScript, gambar, serta `_routes.json` ke `dist/`. Pages Functions di `functions/` memeriksa sesi untuk `/admin/*` dan `/api/admin/*`; endpoint login berada di `/api/auth/*`. Setiap push ke branch produksi akan memicu build dan deployment baru.

> **Catatan keamanan:** halaman admin memang ikut deployment, tetapi middleware melindungi konten dan aset panel. Jangan menghapus `functions/` atau rute admin dari `_routes.json`. Untuk menghindari percobaan kata sandi berulang, aktifkan aturan rate limiting Cloudflare untuk `POST /api/auth/login` sebelum penggunaan rutin.

## Pemeriksaan sebelum publikasi

- Periksa fakta, ejaan, judul, ringkasan, kategori, dan tautan.
- Pastikan foto benar-benar sesuai dengan topik dan teks alternatifnya menjelaskan isi foto.
- Jalankan `npm run build`, lalu buka `blog.html` dan halaman detail hasilnya.
- Untuk deployment Cloudflare Pages, gunakan `npm run build:cloudflare` dan output `dist`; jangan unggah folder sumber secara manual sebagai pengganti build tersebut.

## Identitas visual

Tema menggunakan biru, cream, dan oranye yang selaras dengan logo Sinergi. Perubahan tampilan sebaiknya menjaga konsistensi antarhalaman, keterbacaan, dan dukungan `prefers-reduced-motion` untuk animasi.
