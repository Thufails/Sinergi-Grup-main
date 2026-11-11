# Sinergi Business Solution

Situs profil perusahaan statis untuk Sinergi Business Solution / Sinergi Group. Situs dibuat dengan HTML, CSS, dan JavaScript tanpa framework frontend. Halaman publik sudah berupa file HTML yang dapat disajikan oleh web server statis.

## Struktur proyek

| Lokasi | Isi |
| --- | --- |
| `index.html` | Beranda |
| `about.html` | Profil perusahaan |
| `services.html` | Layanan |
| `programs.html` | Program |
| `gallery.html` | Galeri |
| `blog.html` | Daftar artikel, dibuat dari data artikel |
| `contact.html` | Kontak |
| `artikel/articles.mjs` | Sumber data dan isi artikel |
| `artikel/<slug>.html` | Halaman detail artikel hasil build |
| `templates/` | Template halaman artikel dan daftar artikel |
| `scripts/build-articles.mjs` | Generator halaman artikel statis |
| `css/style.css` | Gaya dan komponen visual |
| `js/script.js` | Interaksi sisi browser |
| `images/` | Logo dan aset gambar |

`AGENTS.md` berisi konteks kerja dan preferensi desain proyek untuk sesi pengembangan berikutnya. Panduan artikel lebih rinci tersedia di [`artikel/README.md`](artikel/README.md).

## Menjalankan situs secara lokal

1. Pasang Node.js versi LTS jika belum tersedia.
2. Buka folder proyek di editor.
3. Untuk menjalankan generator artikel, gunakan perintah di bagian build di bawah.
4. Buka halaman dengan server statis lokal. Di VS Code, ekstensi Live Server dapat digunakan dengan klik kanan `index.html` lalu pilih **Open with Live Server**.

Proyek ini tidak memiliki dependensi npm tambahan atau perintah `npm run dev` saat ini. Membuka file HTML langsung juga dapat menampilkan halaman, tetapi server lokal lebih mendekati cara situs disajikan ketika diunggah.

## Build artikel

Perintah berikut tersedia dari folder utama proyek:

```bash
npm run build
npm run build:articles
```

Keduanya menjalankan `node scripts/build-articles.mjs`. Build membaca `artikel/articles.mjs` dan template, kemudian menghasilkan atau memperbarui `blog.html` serta `artikel/<slug>.html` untuk artikel berstatus terbit.

Jangan mengedit `blog.html` atau halaman detail hasil generator untuk mengubah isi artikel. Perubahan tersebut akan tertimpa pada build selanjutnya. Ubah sumber data atau template, lalu build ulang.

## Menambah atau memperbarui artikel

1. Buka `artikel/articles.mjs`.
2. Untuk artikel baru, tambahkan satu objek ke dalam array `articles`. Untuk memperbarui artikel, edit objek dengan `slug` yang sesuai.
3. Simpan gambar di folder `images/`, lalu isi `image` dengan jalur relatif dari root proyek, misalnya `images/artikel-kepemimpinan.jpg`.
4. Isi semua metadata dan konten seperti contoh berikut.
5. Jalankan `npm run build`.
6. Periksa `blog.html` dan halaman `artikel/<slug>.html` yang dihasilkan sebelum mengunggah perubahan.

Contoh struktur objek:

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
        <p class="article-intro">Pembuka artikel yang merangkum persoalan dan konteks pembahasan.</p>
        <h2>Mulai dengan tujuan komunikasi</h2>
        <p>Jelaskan pembahasan bagian ini dengan contoh yang relevan.</p>
        <h2>Bangun kebiasaan berdiskusi</h2>
        <p>Tambahkan panduan praktis yang bisa diterapkan pembaca.</p>
        <h2>Kesimpulan</h2>
        <p>Tutup dengan rangkuman dan langkah yang jelas.</p>`,
},
```

### Arti properti artikel

- `slug`: identitas dan nama URL; gunakan huruf kecil, angka, dan tanda hubung. Slug harus unik.
- `title`: judul pada halaman detail dan kartu.
- `category`: kategori yang tampak pada artikel dan filter.
- `summary`: ringkasan untuk kartu daftar dan rekomendasi.
- `description`: deskripsi SEO halaman artikel.
- `image`: jalur aset gambar dari root proyek.
- `imageAlt`: teks alternatif gambar pada halaman detail.
- `status`: wajib `draft` atau `published`.
- `featured`: `true` untuk satu artikel unggulan di halaman daftar; artikel unggulan harus terbit. Pastikan tetap hanya ada satu artikel terbit yang unggulan.
- `topics`: satu atau lebih kata kunci untuk memilih artikel terkait.
- `content`: isi artikel sebagai HTML. Gunakan paragraf dan heading semantik.

### Draf dan publikasi

- Gunakan `status: "draft"` selama artikel sedang disiapkan. Artikel draf tidak tampil di daftar, filter, atau rekomendasi; halaman HTML publiknya juga tidak dibuat.
- Untuk menerbitkan, ubah status menjadi `published`, lalu jalankan `npm run build`.
- Artikel yang sekarang sudah tampil di situs ditandai `published`. Jangan mengubahnya menjadi draf kecuali memang ingin menariknya dari situs.
- Jika artikel yang sebelumnya terbit diubah menjadi draf, generator menghapus halaman HTML lokal untuk slug tersebut. Saat deploy, sinkronkan penghapusan file itu juga; jika file lama dibiarkan di server, URL lamanya masih dapat dibuka langsung.

### Daftar isi dan artikel terkait

- Daftar isi dibuat otomatis dari heading `<h2>` jika artikel memiliki setidaknya tiga subjudul.
- Rekomendasi di akhir halaman mengutamakan artikel dalam kategori yang sama. Jika tidak tersedia, kedekatan `topics` menentukan urutannya.
- Artikel draf tidak pernah ditampilkan sebagai artikel terkait.

### Checklist sebelum artikel terbit

- Pastikan fakta, ejaan, judul, ringkasan, dan kategori sudah diperiksa.
- Pastikan foto sesuai dengan artikel, resolusinya cukup, dan teks alternatifnya menggambarkan foto.
- Pastikan `slug` unik dan status disetel ke `published` hanya ketika siap ditampilkan.
- Jalankan build, buka halaman hasilnya, dan periksa tautan, gambar, serta susunan heading.
- Unggah HTML hasil build beserta aset `css/`, `js/`, dan `images/` yang dirujuk halaman.

## Identitas tampilan

Tema situs menggunakan biru, cream, dan oranye yang selaras dengan identitas logo Sinergi. Pertahankan konsistensi antarhalaman, keterbacaan teks, dan aksesibilitas termasuk dukungan `prefers-reduced-motion` untuk animasi.
