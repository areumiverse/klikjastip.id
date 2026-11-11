/*
 * Data KlikJastip.id — edit di file ini saja.
 * ---------------------------------------------------------------
 *  route   : "bdg-smd" = dibeli di Bandung, diantar ke Sumedang
 *            "smd-bdg" = dibeli di Sumedang, diantar ke Bandung
 *  cat     : kue | camilan | kopi | harian
 *  tag     : (opsional) catatan kecil tulisan tangan di samping nama
 *  variants: (opsional) pilihan yang bisa dipilih pelanggan
 *  img     : (opsional) foto produk. Bisa satu foto atau beberapa (jadi galeri):
 *              img: "assets/img/produk/bolen.jpg"
 *              img: ["assets/img/produk/bolen-1.jpg", "assets/img/produk/bolen-2.jpg"]
 *            Kalau img tidak diisi, website otomatis mencari foto bernama
 *            assets/img/produk/<id>.jpg  (mis. assets/img/produk/tahu-sumedang.jpg).
 *            Kalau fotonya belum ada, kartu menampilkan ilustrasi kategori.
 *            Saran: foto persegi/4:3, lebar ±800px, ukuran file < 200 KB.
 */
window.KJ_CONFIG = {
  waNumber: "6285536584366",
  waDisplay: "0855 3658 4366",
  // Jadwal rutin mingguan. Tanggalnya dihitung otomatis dari kalender (WIB)
  // dan berganti sendiri setiap hari.
  // day : 0 = Minggu, 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu
  // time: keterangan jam (boleh dikosongkan), mis. "pagi", "sore"
  schedule: [
    { day: 1, time: "",     dest: "Bandung",  route: "smd-bdg" },
    { day: 3, time: "sore", dest: "Sumedang", route: "bdg-smd" },
    { day: 4, time: "pagi", dest: "Bandung",  route: "smd-bdg" },
    { day: 5, time: "sore", dest: "Sumedang", route: "bdg-smd" }
  ]
};

window.KJ_ROUTES = {
  "bdg-smd": { short: "Bandung → Sumedang", tab: "Barang dari Bandung", who: "Untuk yang di Sumedang" },
  "smd-bdg": { short: "Sumedang → Bandung", tab: "Barang dari Sumedang", who: "Untuk yang di Bandung" }
};

window.KJ_CATEGORIES = {
  kue: "Kue & roti",
  camilan: "Camilan & lauk",
  kopi: "Kopi",
  harian: "Belanja harian"
};

window.KJ_PRODUCTS = [
  /* ---------- Dari Bandung, dibawa ke Sumedang ---------- */
  { id: "bolen-kartika-sari", route: "bdg-smd", cat: "kue", tag: "paling sering dititip",
    name: "Pisang Bolen Kartika Sari", where: "Kartika Sari",
    desc: "Bolen pisang khas Bandung. Tulis jumlah kotak dan rasanya.",
    variants: ["Pisang keju", "Pisang coklat", "Pisang coklat keju", "Campur"] },

  { id: "brownies-amanda", route: "bdg-smd", cat: "kue", tag: "laris",
    name: "Brownies Kukus Amanda", where: "Amanda Brownies",
    desc: "Brownies kukus yang lembut, pilih rasanya di bawah.",
    variants: ["Original", "Pandan", "Keju", "Tiramisu"] },

  { id: "brownies-prima-rasa", route: "bdg-smd", cat: "kue",
    name: "Brownies Panggang Prima Rasa", where: "Prima Rasa",
    desc: "Brownies panggang dengan topping kacang, keju, atau almond." },

  { id: "bolu-bakar-tunggal", route: "bdg-smd", cat: "kue",
    name: "Bolu Bakar Tunggal", where: "Bolu Bakar Tunggal",
    desc: "Tulis topping yang diinginkan di catatan, nanti kami pilihkan." },

  { id: "bolu-susu-lembang", route: "bdg-smd", cat: "kue",
    name: "Bolu Susu Lembang", where: "Bolu Susu Lembang",
    desc: "Bolu gulung rasa susu, banyak pilihan isi." },

  { id: "surabi-bandung", route: "bdg-smd", cat: "kue",
    name: "Surabi Bandung", where: "Surabi Bandung",
    desc: "Paling enak dimakan hangat, jadi kami bungkus terpisah dari kuahnya." },

  { id: "bolen-tjihapit", route: "bdg-smd", cat: "kue",
    name: "Bolen Tjihapit", where: "Bolen Tjihapit",
    desc: "Bolen dengan isian manis dan gurih. Pilih rasanya di bawah.",
    variants: ["Pisang keju coklat", "Pisang nougat", "Coklat kacang", "Krim keju", "Nastar", "Smoke beef", "Daging sapi cincang"] },

  { id: "tji-laki-9", route: "bdg-smd", cat: "kue", tag: "baru",
    name: "Bolu & kue Tji Laki 9", where: "Tji Laki 9, Toko Bolu & Kue",
    desc: "Bolu marmer bertabur crumble dalam kotak cantik, pas buat oleh-oleh. Tulis jenis bolunya di catatan." },

  { id: "puln-kataifi", route: "bdg-smd", cat: "kue", tag: "baru",
    name: "Puln Kataifi & Desserts", where: "Puln",
    desc: "Kataifi gulung yang renyah dengan saus coklat, juga dessert box. Tulis menu yang dimau di catatan." },

  { id: "tiramisusu-chocomory", route: "bdg-smd", cat: "kue",
    name: "Tiramisusu by Chocomory", where: "Chocomory",
    desc: "Kue tiramisu berlapis, oleh-oleh khas Bandung. Kami bawa dalam keadaan dingin.",
    variants: ["Original", "Cookies n Cream", "Snow Mountain"] },

  { id: "batagor-frozen", route: "bdg-smd", cat: "camilan", tag: "laris",
    name: "Batagor & frozen food", where: "Batagor Riri, dll.",
    desc: "Kami pilih yang kemasan vakum supaya aman sampai Sumedang." },

  { id: "tahu-susu-lembang", route: "bdg-smd", cat: "camilan",
    name: "Tahu Susu Lembang", where: "Lembang",
    desc: "Tahu lembut dari susu sapi, dibawa dalam keadaan mentah." },

  { id: "peuyeum-bandung", route: "bdg-smd", cat: "camilan",
    name: "Peuyeum Bandung", where: "Peuyeum Bandung",
    desc: "Tape singkong gantung, dijual per ikat." },

  { id: "sejiwa-mont-blanc", route: "bdg-smd", cat: "kopi", tag: "lagi ramai",
    name: "Mont Blanc Coffee", where: "Sejiwa Coffee",
    desc: "Es kopi dengan krim tebal di atasnya. Diminum paling enak di hari yang sama." },

  { id: "coma-dirty-latte", route: "bdg-smd", cat: "kopi", tag: "lagi ramai",
    name: "Dirty Latte", where: "CO,MA",
    desc: "Espresso di atas susu dingin. Paling pas diminum hari itu juga." },

  { id: "toko-djawa", route: "bdg-smd", cat: "kopi",
    name: "Es Kopi Toko Djawa", where: "Toko Djawa",
    desc: "Kopi susu gula jawa versi botol, atau Kopi Awan yang pakai foam.",
    variants: ["Kopi susu botol", "Kopi Awan"] },

  { id: "jabarano", route: "bdg-smd", cat: "kopi",
    name: "Jabarano Coffee", where: "Jabarano",
    desc: "Kopi dari biji Jawa Barat. Bisa sekalian titip cireng-nya." },

  { id: "kopi-aroma", route: "bdg-smd", cat: "kopi",
    name: "Kopi Aroma", where: "Jl. Banceuy",
    desc: "Kopi bubuk dari pabrik kopi tua di Banceuy.",
    variants: ["Arabika", "Robusta"] },

  { id: "b-low", route: "bdg-smd", cat: "kopi",
    name: "B Low Listening Coffee Bar", where: "B Low",
    desc: "Minuman atau biji kopi. Tulis menu yang dimau di catatan." },

  { id: "makmur-jaya", route: "bdg-smd", cat: "kopi",
    name: "Makmur Jaya Coffee Roaster", where: "Makmur Jaya",
    desc: "Biji kopi sangrai sendiri, bisa minta digiling.",
    variants: ["Minuman", "Biji kopi", "Digiling"] },

  { id: "supermarket", route: "bdg-smd", cat: "harian",
    name: "Belanja supermarket", where: "Supermarket di Bandung",
    desc: "Barang yang susah dicari di Sumedang. Tulis daftar belanjanya di catatan." },

  /* ---------- Dari Sumedang, dibawa ke Bandung ---------- */
  { id: "tahu-sumedang", route: "smd-bdg", cat: "camilan", tag: "paling sering dititip",
    name: "Tahu Sumedang", where: "Pabrik tahu di Sumedang",
    desc: "Bisa yang sudah digoreng, atau mentah untuk digoreng sendiri di rumah.",
    variants: ["Sudah digoreng", "Mentah"] },

  { id: "ubi-cilembu", route: "smd-bdg", cat: "camilan", tag: "laris",
    name: "Ubi Cilembu", where: "Cilembu",
    desc: "Ubi madu asli Cilembu, dijual per kilo.",
    variants: ["Sudah dioven", "Mentah"] },

  { id: "keripik-ubi-cilembu", route: "smd-bdg", cat: "camilan",
    name: "Keripik Ubi Cilembu", where: "Cilembu",
    desc: "Manis sedikit asin. Awet, cocok buat stok di rumah." },

  { id: "opak-ketan", route: "smd-bdg", cat: "camilan",
    name: "Opak Ketan", where: "Sumedang",
    desc: "Ringan dan tidak gampang hancur di jalan." },

  { id: "sale-pisang", route: "smd-bdg", cat: "camilan",
    name: "Sale Pisang", where: "Sumedang",
    desc: "Ada yang kering dan yang digoreng tepung." },

  { id: "emplod", route: "smd-bdg", cat: "camilan",
    name: "Emplod", where: "Sumedang",
    desc: "Camilan lama yang sekarang agak susah dicari." },

  { id: "oncom-sumedang", route: "smd-bdg", cat: "camilan",
    name: "Oncom Sumedang", where: "Sumedang",
    desc: "Untuk dimasak sendiri di rumah." },

  { id: "tape-singkong", route: "smd-bdg", cat: "camilan",
    name: "Tape Singkong", where: "Sumedang",
    desc: "Dibungkus daun, dibawa di hari yang sama." },

  { id: "salak-bongkok", route: "smd-bdg", cat: "camilan",
    name: "Salak Bongkok", where: "Kebun di Sumedang",
    desc: "Buah musiman. Kami kabari kalau stoknya sedang kosong." },

  { id: "sawo-sukatali", route: "smd-bdg", cat: "camilan",
    name: "Sawo Sukatali", where: "Sukatali",
    desc: "Buah musiman, dijual per kilo." },

  { id: "bolu-aren", route: "smd-bdg", cat: "kue",
    name: "Bolu Aren Sumedang", where: "Bolu Aren, Sumedang",
    desc: "Bolu tradisional dengan gula aren, lembut dan tidak terlalu manis." },

  { id: "lapis-sumedang", route: "smd-bdg", cat: "kue",
    name: "Lapis Sumedang", where: "Sumedang",
    desc: "Kue lapis untuk oleh-oleh atau acara keluarga." },

  { id: "kopi-sumedang", route: "smd-bdg", cat: "kopi", tag: "baru",
    name: "Kopi Sumedang Sindang Rasa", where: "Toko Kopi Sindang Rasa",
    desc: "Kopi lokal Sumedang yang disangrai sendiri. Pilih jenis dan bentuknya.",
    variants: ["Arabika, biji", "Arabika, bubuk", "Robusta, biji", "Robusta, bubuk"] }
];
