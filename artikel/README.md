# Mengelola artikel

Isi artikel disimpan di `artikel/articles.mjs`. Setiap objek berisi judul, kategori, ringkasan, deskripsi SEO, foto, teks alternatif, dan isi artikel.

1. Tambahkan objek artikel baru di `articles.mjs` dengan slug yang unik.
2. Tulis isi artikel sebagai HTML di properti `content` (gunakan paragraf, heading `<h2>`, atau elemen semantik lain).
3. Jalankan `npm run build:articles` dari folder utama proyek.

Perintah tersebut memperbarui halaman detail statis di folder ini dan kartu pada `blog.html`. File `artikel/<slug>.html` dan `blog.html` adalah hasil build; jangan mengedit isi artikelnya langsung karena perubahan akan ditimpa pada build berikutnya.
