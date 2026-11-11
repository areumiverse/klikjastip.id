/* KlikJastip.id: daftar barang, nota titipan, kirim pesanan ke WhatsApp */
(function () {
  "use strict";

  const CFG = window.KJ_CONFIG;
  const ROUTES = window.KJ_ROUTES;
  const CATS = window.KJ_CATEGORIES;
  const PRODUCTS = window.KJ_PRODUCTS;
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* diabaikan */ } }
  };

  const state = {
    route: "bdg-smd",
    cat: "all",
    q: "",
    cart: store.get("kj_cart", []).filter((i) => i && (i.custom || byId[i.id])),
    pick: {} // id produk -> varian terpilih
  };

  const keyOf = (id, v) => (v ? id + "::" + v : id);
  const findItem = (key) => state.cart.find((i) => i.key === key);
  const count = () => state.cart.reduce((n, i) => n + i.qty, 0);
  const routeOf = (i) => (i.custom ? i.custom.route : byId[i.id].route);
  const save = () => store.set("kj_cart", state.cart);

  /* ---------- jadwal ---------- */
  // Semua tanggal dihitung menurut WIB, apa pun zona waktu HP pelanggan.
  const TZ = "Asia/Jakarta";
  const WIB_OFFSET = 7 * 3600e3;
  const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const fmtShort = (d) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const tripLabel = (s) => DAYS[s.day] + (s.time ? " " + s.time : "");

  // tanggal kalender hari ini (WIB), sebagai Date lokal jam 00:00
  function todayWIB() {
    const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" })
      .format(new Date()).split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  // detik saat tanggal itu dimulai (00:00 WIB)
  const startWIB = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - WIB_OFFSET;

  // perjalanan berikutnya; from = 1 berarti mulai besok (yang masih bisa dipesan, H-1)
  function upcoming(n, route, from = 1) {
    const out = [];
    const today = todayWIB();
    for (let add = from; out.length < n && add < 60; add++) {
      const d = new Date(today); d.setDate(today.getDate() + add);
      CFG.schedule.forEach((s) => {
        if (s.day === d.getDay() && (!route || s.route === route) && out.length < n) out.push({ ...s, date: d, add });
      });
    }
    return out;
  }

  function untilText(ms) {
    const min = Math.max(0, Math.floor(ms / 60000));
    const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
    if (d) return `${d} hari ${h} jam`;
    if (h) return `${h} jam ${m} menit`;
    return `${m} menit`;
  }

  let shownDay = 0;
  let nextTrip = null;

  function renderSchedule() {
    const today = todayWIB();
    shownDay = today.getTime();
    const trips = upcoming(4, null, 0);
    nextTrip = trips.find((t) => t.add >= 1);

    $("[data-today]").textContent = today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    $("[data-schedule]").innerHTML = trips.map((t) => {
      const badge = t.add === 0 ? `<span class="trip__badge trip__badge--today">Hari ini</span>`
        : t === nextTrip ? `<span class="trip__badge">${t.add === 1 ? "Besok" : "Terdekat"}</span>` : "";
      return `<li class="trip trip--${t.route}${t === nextTrip ? " is-next" : ""}${t.add === 0 ? " is-today" : ""}">
        <span class="trip__date"><b>${t.date.getDate()}</b><small>${t.date.toLocaleDateString("id-ID", { month: "short" })}</small></span>
        <span class="trip__info"><span class="trip__day">${esc(tripLabel(t))}</span><span class="trip__dest">ke ${esc(t.dest)}</span></span>
        ${badge}
      </li>`;
    }).join("");
    renderDeadline();
  }

  // hitung mundur batas pesan (paling lambat H-1, jam 23.59 WIB)
  function renderDeadline() {
    const box = $("[data-deadline]");
    if (!nextTrip) { box.textContent = ""; return; }
    const before = new Date(nextTrip.date); before.setDate(before.getDate() - 1);
    box.innerHTML = `Pesanan untuk <b>${esc(tripLabel(nextTrip))}, ${fmtShort(nextTrip.date)}</b> ditutup
      <b>${untilText(startWIB(nextTrip.date) - Date.now())} lagi</b>
      <span>(${DAYS[before.getDay()]} ${fmtShort(before)}, 23.59 WIB)</span>`;
  }

  // dicek tiap 30 detik + saat tab dibuka lagi: ganti hari -> semua tanggal ikut berganti
  function tick() {
    if (todayWIB().getTime() !== shownDay) {
      renderSchedule();
      renderTabs();
      if ($("[data-drawer]").classList.contains("is-open")) renderScheduleField();
    } else renderDeadline();
  }

  /* ---------- daftar barang ---------- */
  function renderTabs() {
    $("[data-tabs]").innerHTML = Object.entries(ROUTES).map(([id, r]) =>
      `<button type="button" class="tab" role="tab" aria-selected="${state.route === id}" data-route="${id}">
        ${esc(r.tab)}<small>${esc(r.who)}</small></button>`).join("");

    const present = [...new Set(PRODUCTS.filter((p) => p.route === state.route).map((p) => p.cat))];
    if (state.cat !== "all" && !present.includes(state.cat)) state.cat = "all";
    $("[data-cats]").innerHTML = [["all", "Semua"], ...present.map((c) => [c, CATS[c]])].map(([id, label]) =>
      `<button type="button" class="cat" aria-pressed="${state.cat === id}" data-cat="${id}">${esc(label)}</button>`).join("");

    const r = ROUTES[state.route];
    const days = CFG.schedule.filter((s) => s.route === state.route).map(tripLabel);
    $("[data-lead]").textContent = `Dibeli di ${r.short.split(" → ")[0]}, diantar ke ${r.short.split(" → ")[1]} setiap ${days.join(" dan ")}.`;
  }

  /* ilustrasi cadangan per kategori, dipakai selama foto belum ada */
  const ICONS = {
    kue: '<path d="M8 40h32M10 40V26h28v14M10 31c4 0 4 3 7 3s3-3 7-3 3 3 7 3 3-3 7-3M24 26v-7M24 14c-2 0-3-1.5-3-3s3-5 3-5 3 3.5 3 5-1 3-3 3z"/>',
    camilan: '<path d="M6 22h36c0 10-8 18-18 18S6 32 6 22zM14 22l4-10M22 22l2-12M30 22l-1-11M36 22l-3-8"/>',
    kopi: '<path d="M10 16h24v14a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10zM34 20h3a5 5 0 0 1 0 10h-3M16 5c-2 3 2 4 0 7M23 5c-2 3 2 4 0 7M30 5c-2 3 2 4 0 7"/>',
    fashion: '<path d="M10 16h28l-2 24H12zM18 16v-3a6 6 0 0 1 12 0v3"/>',
    skincare: '<path d="M18 4h12v6H18zM16 10h16v4l3 4v22a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V18l3-4zM13 26h22"/>',
    harian: '<path d="M4 8h6l5 22h22l4-15H12"/><circle cx="18" cy="38" r="3"/><circle cx="34" cy="38" r="3"/>'
  };
  const ZOOM = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6"/></svg>';

  // img boleh string atau array. Kalau kosong, otomatis dicoba assets/img/produk/<id>.jpg
  const photos = (p) => (p.img ? [].concat(p.img) : [`assets/img/produk/${p.id}.jpg`]);

  function artHTML(p, src, big) {
    return `<span class="art art--${esc(p.cat)}${big ? " art--big" : ""}">
      <svg class="art__icon" viewBox="0 0 48 48" aria-hidden="true">${ICONS[p.cat] || ICONS.harian}</svg>
      <img src="${esc(src)}" alt="${esc(p.name)}" ${big ? "" : 'loading="lazy" '}decoding="async" data-photo>
      ${big ? `<span class="art__none">Foto barang menyusul. Mau lihat contohnya dulu? <a href="#" data-wa-direct>Tanya di WhatsApp</a></span>` : ""}
    </span>`;
  }

  function actHTML(p) {
    const v = p.variants ? (state.pick[p.id] || p.variants[0]) : null;
    const it = findItem(keyOf(p.id, v));
    if (!it) return `<button type="button" class="add" data-add="${p.id}" aria-label="Titip ${esc(p.name)}">+ Titip</button>`;
    return `<span class="qty" data-qty-for="${esc(it.key)}">
      <button type="button" data-dec aria-label="Kurangi">−</button>
      <output>${it.qty} di nota</output>
      <button type="button" data-inc aria-label="Tambah">+</button></span>`;
  }

  function varHTML(p, id) {
    return p.variants
      ? `<select class="card__var"${id ? ` id="${id}"` : ""} data-variant="${p.id}" aria-label="Pilihan untuk ${esc(p.name)}">
          ${p.variants.map((v) => `<option${state.pick[p.id] === v ? " selected" : ""}>${esc(v)}</option>`).join("")}
        </select>` : "";
  }

  function itemHTML(p) {
    return `<li class="card">
      <button type="button" class="card__pic" data-detail="${p.id}" aria-label="Lihat foto dan detail ${esc(p.name)}">
        ${artHTML(p, photos(p)[0])}
        ${p.tag ? `<span class="card__tag">${esc(p.tag)}</span>` : ""}
        <span class="card__zoom">${ZOOM}</span>
      </button>
      <div class="card__body">
        <p class="card__where">${esc(p.where)}</p>
        <h4 class="card__name">${esc(p.name)}</h4>
        <p class="card__desc">${esc(p.desc)}</p>
        ${varHTML(p)}
        <div class="card__act" data-act="${p.id}">${actHTML(p)}</div>
      </div>
    </li>`;
  }

  /* ---------- detail barang (foto besar) ---------- */
  function openDetail(id) {
    const p = byId[id];
    const pics = photos(p);
    const r = ROUTES[p.route];
    $("[data-detail-title]").textContent = p.name;
    $("[data-detail-body]").innerHTML = `<div class="detail">
      <div class="detail__media">
        <div class="detail__main" data-detail-main>${artHTML(p, pics[0], true)}</div>
        ${pics.length > 1 ? `<div class="detail__thumbs">${pics.map((src, n) =>
          `<button type="button" data-thumb="${esc(src)}" aria-label="Foto ${n + 1}" aria-current="${n === 0}">
            <img src="${esc(src)}" alt="" loading="lazy" data-thumb-img></button>`).join("")}</div>` : ""}
      </div>
      <div class="detail__info">
        <p class="detail__chips">
          <span class="chip chip--route">${esc(r.short)}</span>
          <span class="chip">${esc(CATS[p.cat])}</span>
          ${p.tag ? `<span class="chip chip--tag">${esc(p.tag)}</span>` : ""}
        </p>
        <p class="detail__where">Dibeli di <b>${esc(p.where)}</b></p>
        <p class="detail__desc">${esc(p.desc)}</p>
        ${p.variants ? `<label class="detail__label" for="d-var">Pilih varian</label>${varHTML(p, "d-var")}` : ""}
        <div class="detail__act" data-act="${p.id}">${actHTML(p)}</div>
        <p class="detail__small">Harga mengikuti harga toko. Totalnya kami kabari lewat WhatsApp sebelum kamu bayar.</p>
      </div>
    </div>`;
    const m = $("[data-detail-modal]");
    open(m);
    setTimeout(() => $(".x", m).focus({ preventScroll: true }), 50);
  }

  function matches(p, q) {
    return !q || [p.name, p.where, p.desc, CATS[p.cat]].join(" ").toLowerCase().includes(q);
  }

  function renderList() {
    const q = state.q.trim().toLowerCase();
    const list = PRODUCTS.filter((p) => p.route === state.route && (state.cat === "all" || p.cat === state.cat) && matches(p, q));
    const box = $("[data-list]");

    if (!list.length) {
      const other = Object.keys(ROUTES).find((r) => r !== state.route);
      const elsewhere = q && PRODUCTS.some((p) => p.route === other && matches(p, q));
      box.innerHTML = `<p class="empty">Tidak ada "${esc(state.q)}" di daftar ini.
        ${elsewhere ? `<a href="#barang" data-route="${other}">Ada di ${esc(ROUTES[other].tab.toLowerCase())}</a>, atau ` : ""}
        <a href="#" data-open-custom>tulis sendiri barangnya</a>.</p>`;
      return;
    }

    const groups = {};
    list.forEach((p) => (groups[p.cat] = groups[p.cat] || []).push(p));
    box.innerHTML = `<div class="groups">${Object.entries(groups).map(([c, items]) =>
      `<section class="group"><h3>${esc(CATS[c])} <span>${items.length} barang</span></h3><ul class="items">${items.map(itemHTML).join("")}</ul></section>`
    ).join("")}</div>`;
  }

  const refreshAct = (id) => $$(`[data-act="${id}"]`).forEach((el) => (el.innerHTML = actHTML(byId[id])));

  /* ---------- nota ---------- */
  function add(id) {
    const p = byId[id];
    const v = p.variants ? (state.pick[id] || p.variants[0]) : null;
    const key = keyOf(id, v);
    const it = findItem(key);
    if (it) it.qty++; else state.cart.push({ key, id, variant: v, qty: 1, note: "" });
    toast(`${p.name} masuk nota`);
    changed(id, true);
  }

  function setQty(key, d) {
    const it = findItem(key);
    if (!it) return;
    it.qty += d;
    if (it.qty <= 0) state.cart = state.cart.filter((i) => i !== it);
    changed(it.id);
  }

  function changed(id, bump) {
    save();
    if (id) refreshAct(id);
    renderCount(bump);
    if ($("[data-drawer]").classList.contains("is-open")) renderNota();
  }

  function renderCount(bump) {
    const n = count();
    $$("[data-cart-count]").forEach((el) => (el.textContent = n));
    $("[data-dock]").hidden = n === 0 || $("[data-drawer]").classList.contains("is-open");
    if (bump) {
      const b = $(".top__nota");
      b.classList.add("bump");
      setTimeout(() => b.classList.remove("bump"), 600);
    }
  }

  const activeRoutes = () => Object.keys(ROUTES).filter((r) => state.cart.some((i) => routeOf(i) === r));

  function notaLine(i) {
    const p = i.custom ? null : byId[i.id];
    const name = i.custom ? i.custom.name : p.name;
    const extra = i.custom ? i.custom.store : i.variant;
    return `<div class="nota__line">
      <span class="nota__what">${esc(name)}${extra ? ` <small>(${esc(extra)})</small>` : ""}</span>
      <span class="nota__ctl" data-qty-for="${esc(i.key)}">
        <button type="button" data-dec aria-label="Kurangi ${esc(name)}">−</button>
        <output>×${i.qty}</output>
        <button type="button" data-inc aria-label="Tambah ${esc(name)}">+</button>
      </span>
      <input class="nota__note" data-note="${esc(i.key)}" value="${esc(i.note)}" placeholder="catatan: ukuran, rasa, merek…" aria-label="Catatan untuk ${esc(name)}">
    </div>`;
  }

  function renderNota() {
    const box = $("[data-cart-items]");
    box.innerHTML = state.cart.length
      ? activeRoutes().map((r) => `<p class="nota__route">${esc(ROUTES[r].short)}</p>` +
          state.cart.filter((i) => routeOf(i) === r).map(notaLine).join("")).join("")
      : `<p class="nota__empty">Notanya masih kosong.</p><p class="nota__empty">Pilih barang dari daftar dulu ya.</p>`;
    renderScheduleField();
  }

  function renderScheduleField() {
    const box = $("[data-field-schedule]");
    const prev = {};
    $$("select[data-sched]", box).forEach((s) => (prev[s.dataset.sched] = s.value));
    box.innerHTML = activeRoutes().map((r) => {
      const opts = upcoming(4, r).map((t) => {
        const v = `${tripLabel(t)}, ${fmtShort(t.date)}`;
        return `<option value="${esc(v)}">${esc(v)}${t.add === 1 ? " (besok)" : ""}</option>`;
      }).join("");
      return `<div class="f"><label for="f-s-${r}">Jadwal antar (${esc(ROUTES[r].short)})</label>
        <select id="f-s-${r}" data-sched="${r}">${opts}<option value="Ikut jadwal terdekat yang masih bisa">Terserah, yang paling cepat</option></select></div>`;
    }).join("");
    Object.entries(prev).forEach(([r, v]) => { const s = $(`select[data-sched="${r}"]`, box); if (s) s.value = v; });
  }

  /* ---------- sheet ---------- */
  let back = null;
  function open(el) {
    back = document.activeElement;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock");
  }
  function close(el) {
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    if (!$(".sheet.is-open")) document.body.classList.remove("lock");
    if (back && back.focus) back.focus({ preventScroll: true });
  }
  function openNota() {
    renderNota();
    $("[data-form-error]").hidden = true;
    $("[data-sent]").hidden = true;
    open($("[data-drawer]"));
    renderCount();
  }
  function closeNota() { close($("[data-drawer]")); renderCount(); }
  function openCustom() {
    const f = $("[data-custom-form]");
    f.reset();
    f.route.value = state.route;
    open($("[data-custom-modal]"));
    setTimeout(() => f.item.focus(), 280);
  }

  let tt;
  function toast(msg) {
    const t = $("[data-toast]");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(tt);
    tt = setTimeout(() => t.classList.remove("show"), 1600);
  }

  /* ---------- WhatsApp ---------- */
  function openWA(text) {
    const url = `https://wa.me/${CFG.waNumber}?text=${encodeURIComponent(text)}`;
    const w = window.open(url, "_blank");
    if (w) { try { w.opener = null; } catch (e) { /* diabaikan */ } }
    else window.location.href = url;
  }

  function message(d) {
    const L = ["Halo KlikJastip, saya mau titip:", ""];
    activeRoutes().forEach((r) => {
      L.push(`*${ROUTES[r].short}*`);
      state.cart.filter((i) => routeOf(i) === r).forEach((i, n) => {
        const name = i.custom
          ? i.custom.name + (i.custom.store ? ` (di ${i.custom.store})` : "")
          : byId[i.id].name + (i.variant ? `, ${i.variant}` : "");
        L.push(`${n + 1}. ${name} x${i.qty}${i.note ? ` (${i.note})` : ""}`);
      });
      if (d.sched[r]) L.push(`Jadwal antar: ${d.sched[r]}`);
      L.push("");
    });
    L.push(`Nama: ${d.name}`, `No. WA: ${d.phone}`, `Alamat: ${d.address}`, `Terima barang: ${d.delivery}`);
    if (d.note) L.push(`Catatan: ${d.note}`);
    L.push("Pembayaran: QRIS (setelah total dikonfirmasi)");
    L.push("", "Tolong dikabari total harganya ya. Hatur nuhun.");
    return L.join("\n");
  }

  function submit(e) {
    e.preventDefault();
    const f = e.target;
    const err = $("[data-form-error]");
    $$(".bad", f).forEach((el) => el.classList.remove("bad"));

    if (!state.cart.length) {
      err.textContent = "Notanya masih kosong. Pilih barang dulu dari daftar.";
      err.hidden = false;
      return;
    }
    const d = {
      name: f.fullname.value.trim(),
      phone: f.phone.value.trim(),
      address: f.address.value.trim(),
      delivery: f.delivery.value,
      note: f.note.value.trim(),
      sched: {}
    };
    $$("select[data-sched]", f).forEach((s) => (d.sched[s.dataset.sched] = s.value));

    const bad = [];
    const msgs = [];
    if (d.name.length < 2) { bad.push(f.fullname); msgs.push("nama"); }
    const digits = d.phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) { bad.push(f.phone); msgs.push("nomor WhatsApp"); }
    if (d.address.length < 8) { bad.push(f.address); msgs.push("alamat lengkap"); }
    if (bad.length) {
      bad.forEach((el) => el.classList.add("bad"));
      err.textContent = `Isi dulu ${msgs.join(", ")} supaya kami bisa mengantar.`;
      err.hidden = false;
      bad[0].focus();
      return;
    }
    err.hidden = true;
    store.set("kj_customer", { name: d.name, phone: d.phone, address: d.address });
    openWA(message(d));
    const sent = $("[data-sent]");
    sent.hidden = false;
    sent.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearNota() {
    const ids = state.cart.map((i) => i.id).filter(Boolean);
    state.cart = [];
    save();
    ids.forEach(refreshAct);
    renderNota();
    closeNota();
    toast("Terima kasih, pesananmu segera kami balas.");
  }

  function prefill() {
    const c = store.get("kj_customer", null);
    if (!c) return;
    const f = $("[data-form]");
    if (c.name) f.fullname.value = c.name;
    if (c.phone) f.phone.value = c.phone;
    if (c.address) f.address.value = c.address;
  }

  /* ---------- event ---------- */
  function bind() {
    document.addEventListener("click", (e) => {
      const t = e.target.closest("button, a");
      if (!t) return;
      if (t.matches("[data-add]")) return add(t.dataset.add);
      if (t.matches("[data-detail]")) return openDetail(t.dataset.detail);
      if (t.matches("[data-thumb]")) {
        const main = $("[data-detail-main] .art");
        main.classList.remove("art--none");
        let img = $("img", main);
        if (!img) { img = document.createElement("img"); img.setAttribute("data-photo", ""); main.insertBefore(img, $(".art__none", main)); }
        img.src = t.dataset.thumb;
        $$("[data-thumb]").forEach((b) => b.setAttribute("aria-current", b === t));
        return;
      }
      if (t.matches("[data-close-sheet]")) return close(t.closest(".sheet"));
      if (t.matches("[data-inc], [data-dec]")) return setQty(t.closest("[data-qty-for]").dataset.qtyFor, t.matches("[data-inc]") ? 1 : -1);
      if (t.matches("[data-route]")) {
        state.route = t.dataset.route; state.cat = "all"; renderTabs(); return renderList();
      }
      if (t.matches("[data-cat]")) { state.cat = t.dataset.cat; renderTabs(); return renderList(); }
      if (t.matches("[data-route-pick]")) {
        state.route = t.dataset.routePick; state.cat = "all"; state.q = ""; $("[data-search]").value = "";
        renderTabs(); renderList();
        return $("#barang").scrollIntoView({ behavior: "smooth" });
      }
      if (t.matches("[data-clear-cart]")) return clearNota();
      if (t.matches("[data-open-cart]")) return openNota();
      if (t.matches("[data-close-cart]")) return closeNota();
      if (t.matches("[data-open-custom]")) { e.preventDefault(); return openCustom(); }
      if (t.matches("[data-close-custom]")) return close($("[data-custom-modal]"));
      if (t.matches("[data-goto-pay]")) { closeNota(); return; }
      if (t.matches("[data-wa-paid]")) { e.preventDefault(); return openWA("Halo KlikJastip, saya sudah bayar lewat QRIS. Ini bukti pembayarannya:"); }
      if (t.matches("[data-wa-direct]")) { e.preventDefault(); return openWA("Halo KlikJastip, saya mau tanya soal titip barang."); }
    });

    $$(".sheet__shade").forEach((s) => s.addEventListener("click", () => {
      const sheet = s.parentElement;
      if (sheet.matches("[data-drawer]")) closeNota(); else close(sheet);
    }));

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const top = $$(".sheet.is-open").pop();
      if (!top) return;
      if (top.matches("[data-drawer]")) closeNota(); else close(top);
    });

    document.addEventListener("change", (e) => {
      if (e.target.matches("[data-variant]")) {
        const id = e.target.dataset.variant;
        state.pick[id] = e.target.value;
        $$(`[data-variant="${id}"]`).forEach((sel) => { if (sel !== e.target) sel.value = e.target.value; });
        refreshAct(id);
      }
    });

    document.addEventListener("input", (e) => {
      const t = e.target;
      if (t.matches("[data-note]")) { const it = findItem(t.dataset.note); if (it) { it.note = t.value; save(); } }
      if (t.matches("[data-search]")) { state.q = t.value; clearTimeout(t._d); t._d = setTimeout(renderList, 120); }
      t.classList.remove("bad");
    });

    document.addEventListener("error", (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      if (img.matches("[data-photo]")) { img.parentNode.classList.add("art--none"); img.remove(); }
      else if (img.matches("[data-thumb-img]")) img.parentNode.remove();
    }, true);

    $("[data-form]").addEventListener("submit", submit);

    $("[data-custom-form]").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      const name = f.item.value.trim();
      if (name.length < 2) { f.item.classList.add("bad"); f.item.focus(); return; }
      state.cart.push({
        key: "lain-" + Date.now(), id: null, variant: null,
        qty: Math.max(1, parseInt(f.qty.value, 10) || 1), note: f.note.value.trim(),
        custom: { name, store: f.store.value.trim(), route: f.route.value }
      });
      close($("[data-custom-modal]"));
      toast(`${name} masuk nota`);
      changed(null, true);
    });
  }

  function init() {
    $$("[data-wa-display]").forEach((el) => (el.textContent = CFG.waDisplay));
    $("[data-year]").textContent = new Date().getFullYear();
    renderSchedule();
    renderTabs();
    renderList();
    renderCount();
    prefill();
    bind();
    setInterval(tick, 30000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
    window.addEventListener("focus", tick);
  }

  init();
})();
