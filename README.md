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
- [Pemeriksaan sebelum publikasi](#pemeriksaan-sebelum-publikasi)

## Struktur proyek

| Bagian | Fungsi |
| --- | --- |
| `index.html` | Beranda |
| `about.html`, `services.html`, `programs.html`, `gallery.html`, `contact.html` | Halaman profil, layanan, program, galeri, dan kontak |
| `blog.html` | Daftar artikel hasil build |
| `artikel/articles.mjs` | Sumber data dan isi seluruh artikel |
| `artikel/<slug>.html` | Halaman detail artikel hasil build |
| `templates/` | Template halaman artikel dan daftar artikel |
| `scripts/build-articles.mjs` | Generator halaman artikel statis |
| `css/style.css` | Tampilan dan komponen visual |
| `js/script.js` | Interaksi di browser |
| `images/` | Logo dan aset gambar situs |

`AGENTS.md` menyimpan konteks pengerjaan dan preferensi desain proyek. Panduan ringkas artikel juga ada di [`artikel/README.md`](artikel/README.md).

## Menjalankan situs

**Kebutuhan:** Node.js versi LTS untuk menjalankan generator artikel. Proyek ini tidak memakai dependensi npm tambahan dan saat ini belum memiliki perintah `npm run dev`.

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

## Pemeriksaan sebelum publikasi

- Periksa fakta, ejaan, judul, ringkasan, kategori, dan tautan.
- Pastikan foto benar-benar sesuai dengan topik dan teks alternatifnya menjelaskan isi foto.
- Jalankan `npm run build`, lalu buka `blog.html` dan halaman detail hasilnya.
- Saat mengunggah situs, sertakan halaman HTML serta folder `css/`, `js/`, dan `images/` yang dirujuk halaman.

## Identitas visual

Tema menggunakan biru, cream, dan oranye yang selaras dengan logo Sinergi. Perubahan tampilan sebaiknya menjaga konsistensi antarhalaman, keterbacaan, dan dukungan `prefers-reduced-motion` untuk animasi.
