# Mengelola artikel

Isi artikel disimpan di `artikel/articles.mjs`. Setiap objek berisi judul, kategori, topik, ringkasan, deskripsi SEO, foto, teks alternatif, status publikasi, dan isi artikel. Artikel berstatus `published` akan dibuat menjadi halaman statis dan tampil di daftar artikel. Artikel berstatus `draft` tidak dibuatkan halaman publik dan tidak tampil di daftar maupun rekomendasi.

1. Tambahkan objek artikel baru di `articles.mjs` dengan slug yang unik.
2. Atur `status` menjadi `draft` selama artikel masih disiapkan. Ubah menjadi `published` ketika siap diterbitkan. Artikel lama yang sudah tampil di situs ditandai `published` agar tidak menghilang.
3. Tulis isi artikel sebagai HTML di properti `content` (gunakan paragraf, heading `<h2>`, atau elemen semantik lain).
4. Jalankan `npm run build:articles` dari folder utama proyek.

Perintah tersebut memperbarui halaman detail statis di folder ini dan kartu pada `blog.html`. Saat artikel diubah menjadi draf, file detail hasil build untuk slug itu dihapus supaya tidak ikut terbit saat folder situs diunggah. Subjudul `<h2>` otomatis dijadikan daftar isi jika terdapat setidaknya tiga subjudul. Rekomendasi di akhir artikel mengutamakan kategori yang sama, lalu kedekatan topik. File `artikel/<slug>.html` dan `blog.html` adalah hasil build; jangan mengedit isi artikelnya langsung karena perubahan akan ditimpa pada build berikutnya.
