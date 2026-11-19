<div align="center">
  <img src="images/SBS%20BARU.png" alt="Logo Sinergi Business Solution" width="320">

  <h1>Website Sinergi Group</h1>

  <p>Situs profil Sinergi Business Solution beserta panduan singkat untuk menjalankan situs dan mengelola artikel.</p>

  <kbd>HTML</kbd> <kbd>CSS</kbd> <kbd>JavaScript</kbd> <kbd>Cloudflare Pages</kbd>
</div>

---

## Mulai cepat

| Keperluan | Cara |
| --- | --- |
| Melihat situs lokal | Buka `index.html` dengan Live Server di VS Code |
| Membuat ulang halaman artikel | `npm run build` |
| Menyiapkan hasil untuk Cloudflare Pages | `npm run build:cloudflare` |
| Mengakses admin online | `/admin/login` — panel setelah login: `/admin/` |
| Mengubah isi artikel | Edit `artikel/articles.mjs`, lalu build ulang |

> Artikel pada panel admin saat ini tersimpan di browser. Untuk menerbitkan artikel ke situs, gunakan alur `artikel/articles.mjs` → `npm run build` → push ke `main`.

## Halaman situs

| Halaman | File |
| --- | --- |
| Beranda | `index.html` |
| Tentang, layanan, program, galeri, kontak | `about.html`, `services.html`, `programs.html`, `gallery.html`, `contact.html` |
| Daftar artikel | `blog.html` |
| Editor admin | `admin/index.html` |

## Alur artikel

1. Tambahkan atau perbarui artikel di `artikel/articles.mjs`.
2. Isi metadata, gambar, status, dan konten HTML.
3. Simpan sebagai `draft` saat masih disiapkan; ubah menjadi `published` ketika siap tayang.
4. Jalankan `npm run build` dan periksa `blog.html` serta halaman detailnya.
5. Push perubahan ke branch `main` agar Cloudflare Pages membangun dan menerbitkan situs.

> `blog.html` dan `artikel/<slug>.html` adalah hasil generator. Jangan mengubah file hasil build secara langsung.

<details>
  <summary><strong>Struktur proyek dan sumber yang perlu diedit</strong></summary>

  | Lokasi | Kegunaan |
  | --- | --- |
  | `artikel/articles.mjs` | Sumber data dan konten artikel |
  | `templates/` | Template daftar dan detail artikel |
  | `scripts/build-articles.mjs` | Membuat halaman artikel dan daftar artikel |
  | `scripts/package-cloudflare.mjs` | Menyiapkan direktori deployment `dist/` |
  | `css/style.css` | Gaya visual situs |
  | `js/script.js` | Interaksi di browser |
  | `images/` | Logo dan foto situs |
  | `functions/` | Login dan perlindungan admin di Cloudflare Pages |
  | `artikel/README.md` | Panduan ringkas penulisan artikel |

</details>

<details>
  <summary><strong>Format data artikel</strong></summary>

  Setiap artikel menjadi objek di array `articles` pada `artikel/articles.mjs`. Contoh properti inti:

  ```js
  {
      slug: "komunikasi-dalam-tim",
      title: "Membangun Komunikasi yang Efektif dalam Tim",
      category: "Pengembangan SDM",
      summary: "Ringkasan untuk kartu artikel.",
      description: "Deskripsi singkat untuk mesin pencari.",
      image: "images/artikel-komunikasi-tim.jpg",
      imageAlt: "Tim berdiskusi di ruang kerja",
      status: "draft",
      featured: false,
      topics: ["komunikasi", "pengembangan-tim"],
      content: String.raw`
          <p class="article-intro">Paragraf pembuka.</p>
          <h2>Subjudul artikel</h2>
          <p>Isi pembahasan.</p>`,
  }
  ```

  - Gunakan `slug` unik, huruf kecil, dan tanda hubung.
  - `status` bernilai `draft` atau `published`; artikel draf tidak ditampilkan ke publik.
  - Hanya artikel berstatus `published` yang boleh memakai `featured: true`.
  - Daftar isi terbentuk dari `<h2>` jika ada minimal tiga subjudul.
  - Artikel terkait mengutamakan kategori yang sama dan topik yang beririsan.
  - Pastikan foto sesuai dengan isi artikel dan tulis `imageAlt` yang menjelaskan foto.

</details>

<details>
  <summary><strong>Admin: akses, fitur, dan batas saat ini</strong></summary>

  - Login Production: `https://sinergi-grup-main.pages.dev/admin/login`.
  - Panel admin: `https://sinergi-grup-main.pages.dev/admin/`.
  - Pages Functions memverifikasi sesi sebelum membuka panel dan API admin.
  - Editor mendukung impor `.docx`, edit WYSIWYG, pratinjau, simpan draf, ekspor Word, dan unduh JSON.
  - Draf tersimpan di `localStorage` browser pada perangkat yang digunakan; draf tidak tersinkron ke server.
  - Tombol Terbitkan, unggah sampul ke server, serta penyimpanan artikel online belum aktif.
  - Live Server hanya menayangkan file statis; autentikasi Production berjalan melalui Cloudflare Pages Functions.

  Untuk saat ini, terbitkan artikel melalui sumber data `artikel/articles.mjs`, lalu build dan push ke `main`.

</details>

<details>
  <summary><strong>Menyiapkan kredensial admin di Cloudflare</strong></summary>

  Buka **Workers & Pages → sinergi-grup-main → Settings → Variables and Secrets**, pilih environment **Production**, lalu tambahkan:

  | Nama | Jenis | Isi |
  | --- | --- | --- |
  | `ADMIN_EMAIL` | Variable | Email admin |
  | `ADMIN_PASSWORD` | Secret | Kata sandi unik, minimal 8 karakter |
  | `ADMIN_SESSION_SECRET` | Secret | Nilai acak minimal 32 karakter |

  Buat nilai acak untuk `ADMIN_SESSION_SECRET` dengan Node.js:

  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

  Simpan kredensial hanya di dashboard Cloudflare, jangan di GitHub atau chat. Setelah menambahkan/mengubah variable, buat deployment baru. Jangan sering mengganti `ADMIN_SESSION_SECRET`: rotasi kunci akan mengakhiri semua sesi login; sesi normal berlaku maksimal 8 jam.

  Untuk menjalankan Pages Functions secara lokal, gunakan `.dev.vars` bersama Wrangler. File rahasia lokal tidak mengatur Production dan tidak boleh di-commit. Jangan mengunggah nilai rahasia di `.env` atau `.dev.vars` ke repository.

</details>

<details>
  <summary><strong>Pengaturan build Cloudflare Pages</strong></summary>

  | Pengaturan | Nilai |
  | --- | --- |
  | Framework preset | `None` |
  | Production branch | `main` |
  | Build command | `npm run build:cloudflare` |
  | Build output directory | `dist` |
  | Root directory | Kosong / root repository |

  Build menyiapkan halaman publik, artikel, aset, admin, konfigurasi rute, dan Pages Functions. Jangan menghapus folder `functions/` atau konfigurasi rute admin dari deployment. Sebelum penggunaan rutin, aktifkan rate limiting Cloudflare untuk `POST /api/auth/login`.

</details>

<details>
  <summary><strong>Perintah build dan pemeriksaan sebelum rilis</strong></summary>

  ```bash
  npm run build
  npm run build:articles
  npm run build:cloudflare
  ```

  `build` dan `build:articles` menjalankan generator artikel yang sama. `build:cloudflare` membangun artikel lalu menyiapkan paket di `dist/`.

  Sebelum push, periksa ejaan, metadata, tautan, kecocokan foto, dan tampilan kartu serta halaman detail artikel. Setelah deployment sukses, buka situs Production dan halaman artikel yang berubah.

</details>

## Panduan lainnya

- [Panduan pengelolaan artikel](artikel/README.md)
- [Konteks dan keputusan proyek](AGENTS.md)
