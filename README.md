# KlikJastip.id

Website jasa titip **Bandung ⇄ Sumedang** — *Klik, Titip, Sampai!*

Alur: pelanggan buka website → pilih produk (atau "Titip Barang Lain") → isi form → pesanan
tersusun otomatis dan terkirim ke WhatsApp admin **0855 3658 4366**.

## Struktur
```
index.html               halaman utama
assets/css/style.css     tampilan (mobile-first)
assets/js/products.js    DATA: nomor WA, jadwal, rute, kategori, daftar produk  ← edit di sini
assets/js/app.js         logika katalog, keranjang, form & pesan WhatsApp
assets/img/              logo, ikon, brosur
```

## Mengubah konten
- **Nomor WhatsApp / jadwal**: `KJ_CONFIG` di `assets/js/products.js`.
- **Produk**: tambah/ubah objek di `KJ_PRODUCTS`.
- **Foto produk**: simpan foto di `assets/img/produk/` dengan nama `<id-produk>.jpg`
  (contoh `tahu-sumedang.jpg`, `bolen-kartika-sari.jpg`) — langsung tampil di kartu tanpa
  mengubah kode. Untuk nama file lain atau beberapa foto (galeri), isi `img` di produknya.
  Selama foto belum ada, kartu menampilkan ilustrasi sesuai kategori.

## Menjalankan
Website statis tanpa build. Buka `index.html` langsung, atau upload folder ini ke hosting
statis (Netlify, Vercel, GitHub Pages, cPanel) dan arahkan domain `klikjastip.id`.
