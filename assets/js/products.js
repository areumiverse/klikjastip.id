/*
 * Data katalog KlikJastip.id
 * ---------------------------------------------------------------
 * Cara menambah / mengubah produk:
 *  - route   : "bdg-smd" (dibeli di Bandung, diantar ke Sumedang)
 *              "smd-bdg" (dibeli di Sumedang, diantar ke Bandung)
 *  - cat     : kuliner | kopi | fashion | skincare | supermarket
 *  - featured: true = tampil dengan label "Unggulan" & di urutan atas
 *  - variants: (opsional) pilihan varian yang bisa dipilih pelanggan
 *  - emoji/bg: ilustrasi kartu produk (ganti dengan `img` bila punya foto,
 *              contoh: img: "assets/img/produk/bolen.jpg")
 */
window.KJ_CONFIG = {
  waNumber: "6285536584366",       // nomor WA tujuan (format internasional, tanpa +)
  waDisplay: "0855 3658 4366",
  // Jadwal rutin perjalanan. day: 0=Minggu ... 6=Sabtu
  schedule: [
    { day: 1, label: "Senin",       time: "",     dest: "Bandung",  route: "smd-bdg" },
    { day: 3, label: "Rabu Sore",   time: "sore", dest: "Sumedang", route: "bdg-smd" },
    { day: 4, label: "Kamis Pagi",  time: "pagi", dest: "Bandung",  route: "smd-bdg" },
    { day: 5, label: "Jumat Sore",  time: "sore", dest: "Sumedang", route: "bdg-smd" }
  ]
};

window.KJ_ROUTES = {
  "bdg-smd": { from: "Bandung",  to: "Sumedang", short: "Bandung → Sumedang", title: "Bandung Shopping",     desc: "Belanja di Bandung, kami antarkan ke Sumedang." },
  "smd-bdg": { from: "Sumedang", to: "Bandung",  short: "Sumedang → Bandung", title: "Sumedang Local Picks", desc: "Oleh-oleh khas Sumedang, kami antarkan ke Bandung." }
};

window.KJ_CATEGORIES = [
  { id: "all",         label: "Semua",       emoji: "✨" },
  { id: "kuliner",     label: "Kuliner & Oleh-oleh", emoji: "🍰" },
  { id: "kopi",        label: "Kopi Viral",  emoji: "☕" },
  { id: "fashion",     label: "Fashion",     emoji: "👟" },
  { id: "skincare",    label: "Skincare & Kosmetik", emoji: "🧴" },
  { id: "supermarket", label: "Supermarket", emoji: "🛒" }
];

window.KJ_PRODUCTS = [
  /* ================== RUTE 01 · BANDUNG → SUMEDANG ================== */
  { id: "bolen-kartika-sari", route: "bdg-smd", cat: "kuliner", featured: true,
    name: "Pisang Bolen Kartika Sari", brand: "Kartika Sari",
    desc: "Bolen legendaris Bandung, lembut berlapis dengan isian pisang & keju.",
    emoji: "🥐", bg: "#FFE9C7",
    variants: ["Pisang Keju", "Pisang Coklat", "Pisang Coklat Keju", "Mix"] },

  { id: "brownies-amanda", route: "bdg-smd", cat: "kuliner", featured: true,
    name: "Brownies Kukus Amanda", brand: "Amanda Brownies",
    desc: "Brownies kukus lembut & moist, oleh-oleh wajib dari Bandung.",
    emoji: "🍫", bg: "#F3DCCF",
    variants: ["Original", "Pandan", "Keju", "Tiramisu", "Mix"] },

  { id: "brownies-prima-rasa", route: "bdg-smd", cat: "kuliner", featured: true,
    name: "Brownies Panggang Prima Rasa", brand: "Prima Rasa",
    desc: "Brownies panggang dengan topping melimpah, renyah di luar lembut di dalam.",
    emoji: "🍰", bg: "#F6E1D3" },

  { id: "bolu-bakar-tunggal", route: "bdg-smd", cat: "kuliner", featured: true,
    name: "Bolu Bakar Tunggal", brand: "Bolu Bakar Tunggal",
    desc: "Bolu bakar hangat dengan aneka topping manis & legit.",
    emoji: "🧁", bg: "#FFE3D8" },

  { id: "batagor-frozen", route: "bdg-smd", cat: "kuliner", featured: true,
    name: "Batagor & Frozen Food Bandung", brand: "Batagor Riri, dll.",
    desc: "Batagor dan makanan beku khas Bandung, dikemas rapi & aman di perjalanan.",
    emoji: "🥟", bg: "#E5EEFB" },

  { id: "keripik-maicih", route: "bdg-smd", cat: "kuliner", featured: true,
    name: "Keripik & Camilan Bandung", brand: "Maicih, dll.",
    desc: "Keripik pedas, seblak kering, dan aneka camilan khas Bandung.",
    emoji: "🌶️", bg: "#FFE0DE" },

  { id: "bolu-susu-lembang", route: "bdg-smd", cat: "kuliner",
    name: "Bolu Susu Lembang", brand: "Bolu Susu Lembang",
    desc: "Bolu lembut dengan aroma susu segar khas Lembang.",
    emoji: "🥛", bg: "#EEF4FF" },

  { id: "tahu-susu-lembang", route: "bdg-smd", cat: "kuliner",
    name: "Tahu Susu Lembang", brand: "Tahu Susu Lembang",
    desc: "Tahu lembut berbahan susu sapi segar dari Lembang.",
    emoji: "🧈", bg: "#FFF6D6" },

  { id: "peuyeum-bandung", route: "bdg-smd", cat: "kuliner",
    name: "Peuyeum Bandung", brand: "Peuyeum Bandung",
    desc: "Tape singkong manis legit, oleh-oleh tradisional Bandung.",
    emoji: "🍠", bg: "#FFF1D6" },

  { id: "kopi-aroma", route: "bdg-smd", cat: "kopi",
    name: "Kopi Aroma Bandung", brand: "Kopi Aroma",
    desc: "Kopi legendaris Bandung sejak 1930, tersedia arabika & robusta.",
    emoji: "🫘", bg: "#EADBCF",
    variants: ["Arabika", "Robusta", "Mix"] },

  { id: "surabi-bandung", route: "bdg-smd", cat: "kuliner",
    name: "Surabi Bandung", brand: "Surabi Bandung",
    desc: "Surabi dengan aneka topping manis & asin.",
    emoji: "🥞", bg: "#FFEBD1" },

  /* ---- Kopi viral Bandung ---- */
  { id: "sejiwa-mont-blanc", route: "bdg-smd", cat: "kopi", featured: true, viral: true,
    name: "Mont Blanc Coffee", brand: "Sejiwa Coffee",
    desc: "Es kopi dengan lapisan krim tebal di atasnya — lagi viral di sosmed!",
    emoji: "🧋", bg: "#F1E4D8" },

  { id: "coma-dirty-latte", route: "bdg-smd", cat: "kopi", featured: true, viral: true,
    name: "Dirty Latte", brand: "CO,MA",
    desc: "Espresso pekat berpadu susu dingin yang super creamy.",
    emoji: "☕", bg: "#EADFD5" },

  { id: "toko-djawa", route: "bdg-smd", cat: "kopi", featured: true, viral: true,
    name: "Es Kopi Toko Djawa", brand: "Toko Djawa",
    desc: "Pionir kopi susu gula jawa Bandung. Tersedia botolan & Kopi Awan.",
    emoji: "🥤", bg: "#F5E6D3",
    variants: ["Es Kopi Susu Botolan", "Es Kopi Awan"] },

  { id: "jabarano", route: "bdg-smd", cat: "kopi", viral: true,
    name: "Jabarano Coffee", brand: "Jabarano",
    desc: "Kopi dari biji asli Jawa Barat + menu pendamping lokal seperti cireng premium.",
    emoji: "🌄", bg: "#E4ECF7" },

  { id: "kopi-selamat-pagi", route: "bdg-smd", cat: "kopi", viral: true,
    name: "Kopi Selamat Pagi (Literan)", brand: "Kopi Selamat Pagi",
    desc: "Kopi susu dengan sentuhan kelapa gurih, praktis dalam botol literan.",
    emoji: "🥥", bg: "#EFF6E8" },

  { id: "b-low", route: "bdg-smd", cat: "kopi",
    name: "B Low Listening Coffee Bar", brand: "B Low",
    desc: "Menu & biji kopi dari listening bar yang lagi hits di Bandung.",
    emoji: "🎧", bg: "#E9E4F5" },

  { id: "makmur-jaya", route: "bdg-smd", cat: "kopi",
    name: "Makmur Jaya Coffee Roaster", brand: "Makmur Jaya",
    desc: "Biji kopi & minuman dari roastery favorit anak Bandung.",
    emoji: "🔥", bg: "#F7E3D6",
    variants: ["Minuman", "Biji Kopi", "Kopi Bubuk"] },

  /* ---- Fashion, skincare, supermarket ---- */
  { id: "sepatu-cibaduyut", route: "bdg-smd", cat: "fashion", featured: true,
    name: "Sepatu & Fashion Cibaduyut", brand: "Produk Cibaduyut",
    desc: "Sepatu kulit, sandal & fashion dari sentra Cibaduyut. Tulis ukuran/model di catatan.",
    emoji: "👞", bg: "#EADFD3" },

  { id: "tas-dompet", route: "bdg-smd", cat: "fashion",
    name: "Tas & Dompet Lokal Bandung", brand: "Brand lokal Bandung",
    desc: "Tas, dompet, dan aksesori kulit buatan pengrajin Bandung.",
    emoji: "👜", bg: "#FCE4EC" },

  { id: "factory-outlet", route: "bdg-smd", cat: "fashion",
    name: "Pakaian & Aksesori Factory Outlet", brand: "Factory Outlet Bandung",
    desc: "Titip belanja di FO Bandung. Kirim foto/link barang via WhatsApp.",
    emoji: "👕", bg: "#E3EEFC" },

  { id: "skincare", route: "bdg-smd", cat: "skincare", featured: true,
    name: "Skincare & Kosmetik", brand: "Semua merek",
    desc: "Titip skincare & make up dari toko/mall di Bandung. Sebutkan merek & varian.",
    emoji: "🧴", bg: "#FDE7EF" },

  { id: "supermarket", route: "bdg-smd", cat: "supermarket",
    name: "Produk Supermarket & Kebutuhan Harian", brand: "Supermarket Bandung",
    desc: "Barang yang sulit dicari di Sumedang? Tulis daftar belanjanya di catatan.",
    emoji: "🛒", bg: "#E6F5EC" },

  /* ================== RUTE 02 · SUMEDANG → BANDUNG ================== */
  { id: "tahu-sumedang", route: "smd-bdg", cat: "kuliner", featured: true,
    name: "Tahu Sumedang", brand: "Tahu goreng khas Sumedang",
    desc: "Tahu ikonik Sumedang: renyah di luar, kopong & gurih di dalam.",
    emoji: "🟫", bg: "#FFEBC9",
    variants: ["Matang (siap makan)", "Mentah (goreng sendiri)"] },

  { id: "ubi-cilembu", route: "smd-bdg", cat: "kuliner", featured: true,
    name: "Ubi Cilembu", brand: "Ubi madu khas Cilembu",
    desc: "Ubi madu asli Cilembu, manis legit bermadu saat dipanggang.",
    emoji: "🍠", bg: "#F8DCCB",
    variants: ["Matang (oven)", "Mentah"] },

  { id: "opak-ketan", route: "smd-bdg", cat: "kuliner", featured: true,
    name: "Opak Ketan", brand: "Camilan khas Sumedang",
    desc: "Camilan ketan renyah, ringan dan praktis dibawa.",
    emoji: "🍘", bg: "#FFF3D9" },

  { id: "keripik-ubi-cilembu", route: "smd-bdg", cat: "kuliner", featured: true,
    name: "Keripik Ubi Cilembu", brand: "Olahan ubi lokal",
    desc: "Keripik dari ubi Cilembu, manis gurih — cocok untuk stok camilan.",
    emoji: "🥔", bg: "#FFE7CF" },

  { id: "kopi-sumedang", route: "smd-bdg", cat: "kopi", featured: true,
    name: "Kopi Sumedang", brand: "Kopi lokal pegunungan Sumedang",
    desc: "Kopi dari pegunungan Sumedang untuk pecinta kopi lokal.",
    emoji: "⛰️", bg: "#E6DED6",
    variants: ["Biji Kopi", "Kopi Bubuk"] },

  { id: "bolu-aren", route: "smd-bdg", cat: "kuliner",
    name: "Bolu Aren", brand: "Olahan gula aren",
    desc: "Bolu lembut dengan manis khas gula aren.",
    emoji: "🍯", bg: "#F5E2C8" },

  { id: "lapis-sumedang", route: "smd-bdg", cat: "kuliner",
    name: "Lapis Sumedang", brand: "Kue oleh-oleh",
    desc: "Kue lapis legit khas Sumedang untuk oleh-oleh keluarga.",
    emoji: "🍮", bg: "#FFE6D0" },

  { id: "sale-pisang", route: "smd-bdg", cat: "kuliner",
    name: "Sale Pisang", brand: "Camilan pisang",
    desc: "Pisang sale manis kenyal, camilan tradisional favorit.",
    emoji: "🍌", bg: "#FFF4C9" },

  { id: "emplod", route: "smd-bdg", cat: "kuliner",
    name: "Emplod", brand: "Camilan tradisional",
    desc: "Camilan tradisional khas Sumedang yang makin jarang ditemukan.",
    emoji: "🍡", bg: "#F3E6F7" },

  { id: "salak-bongkok", route: "smd-bdg", cat: "kuliner",
    name: "Salak Bongkok", brand: "Buah khas Sumedang",
    desc: "Salak khas Sumedang dengan rasa manis segar.",
    emoji: "🌰", bg: "#F1E3D9" },

  { id: "sawo-sukatali", route: "smd-bdg", cat: "kuliner",
    name: "Sawo Sukatali", brand: "Buah khas Sukatali",
    desc: "Sawo manis legit dari Sukatali, Sumedang.",
    emoji: "🥝", bg: "#EFE8D8" },

  { id: "tape-singkong", route: "smd-bdg", cat: "kuliner",
    name: "Tape Singkong", brand: "Fermentasi singkong",
    desc: "Tape singkong manis khas Sumedang.",
    emoji: "🥣", bg: "#FFF6DD" },

  { id: "oncom-sumedang", route: "smd-bdg", cat: "kuliner",
    name: "Oncom Sumedang", brand: "Pangan tradisional",
    desc: "Oncom khas Sumedang untuk bahan masakan rumahan.",
    emoji: "🧆", bg: "#FBE5D4" }
];
