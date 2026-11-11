/* KlikJastip.id — katalog, keranjang titipan & kirim pesanan ke WhatsApp */
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

  /* ---------- storage (aman bila diblokir) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
  };

  /* ---------- state ---------- */
  const state = {
    route: "all",
    cat: "all",
    q: "",
    cart: store.get("kj_cart", []).filter((i) => i.custom || byId[i.id]),
    variantPick: {} // productId -> selected variant
  };

  const keyOf = (id, variant) => (variant ? id + "::" + variant : id);
  const findItem = (key) => state.cart.find((i) => i.key === key);
  const cartCount = () => state.cart.reduce((n, i) => n + i.qty, 0);
  const itemRoute = (i) => (i.custom ? i.custom.route : byId[i.id].route);

  function saveCart() { store.set("kj_cart", state.cart); }

  /* ---------- jadwal ---------- */
  const fmtDate = (d) => d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" });
  const fmtShort = (d) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  function upcomingTrips(count, route) {
    const out = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let add = 1; out.length < count && add < 60; add++) {
      const d = new Date(today); d.setDate(today.getDate() + add);
      CFG.schedule.forEach((s) => {
        if (s.day === d.getDay() && (!route || s.route === route) && out.length < count) out.push({ ...s, date: d });
      });
    }
    return out;
  }

  function renderSchedule() {
    const next = upcomingTrips(1)[0];
    $("[data-schedule]").innerHTML = CFG.schedule.map((s) => {
      const isNext = next && next.day === s.day;
      const nextDate = upcomingTrips(8).find((t) => t.day === s.day);
      return `<li class="${s.dest === "Bandung" ? "to-bdg" : ""} ${isNext ? "is-next" : ""}">
        <div>${esc(s.label)}${isNext ? '<span class="next-tag">BERIKUTNYA</span>' : ""}
          <small>${nextDate ? fmtDate(nextDate.date) : ""}</small></div>
        <span class="dest">→ Ke ${esc(s.dest)}</span></li>`;
    }).join("");

    if (next) {
      $("[data-next-trip]").innerHTML = `<span class="next-trip__ico">🗓️</span>
        <span>Perjalanan berikutnya: <b>${esc(next.label)}, ${fmtShort(next.date)}</b> ke ${esc(next.dest)}. Titip sekarang biar kebagian!</span>`;
    }
  }

  /* ---------- katalog ---------- */
  function renderChips() {
    $("[data-chips]").innerHTML = CATS.map((c) =>
      `<button type="button" class="chip ${state.cat === c.id ? "is-active" : ""}" data-cat="${c.id}">${c.emoji} ${esc(c.label)}</button>`
    ).join("");
    $$("[data-route]").forEach((b) => {
      const on = b.dataset.route === state.route;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on);
    });
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    return PRODUCTS
      .filter((p) => state.route === "all" || p.route === state.route)
      .filter((p) => state.cat === "all" || p.cat === state.cat)
      .filter((p) => !q || [p.name, p.brand, p.desc, ROUTES[p.route].short].join(" ").toLowerCase().includes(q))
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  function footHTML(p) {
    const variant = p.variants ? (state.variantPick[p.id] || p.variants[0]) : null;
    const item = findItem(keyOf(p.id, variant));
    if (!item) return `<button type="button" class="add-btn" data-add="${p.id}">+ Titip</button>`;
    return `<div class="qty" data-qty-for="${esc(item.key)}">
      <button type="button" data-dec aria-label="Kurangi">−</button>
      <output>${item.qty}</output>
      <button type="button" data-inc aria-label="Tambah">+</button></div>`;
  }

  function cardHTML(p, i) {
    const media = p.img
      ? `<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">`
      : `<span aria-hidden="true">${p.emoji}</span>`;
    const badges = [
      p.featured ? '<span class="badge badge--hot">⭐ Unggulan</span>' : "",
      p.viral ? '<span class="badge badge--viral">🔥 Viral</span>' : ""
    ].join("");
    const variants = p.variants
      ? `<select class="card__variant" data-variant="${p.id}" aria-label="Pilih varian ${esc(p.name)}">
          ${p.variants.map((v) => `<option ${state.variantPick[p.id] === v ? "selected" : ""}>${esc(v)}</option>`).join("")}
        </select>` : "";
    return `<article class="card" style="animation-delay:${Math.min(i, 12) * 30}ms" data-card="${p.id}">
      <div class="card__media" style="background:${p.bg || "#F1F4FA"}">
        ${media}
        <div class="card__badges">${badges}</div>
        <span class="card__route">${p.route === "bdg-smd" ? "BDG → SMD" : "SMD → BDG"}</span>
      </div>
      <div class="card__body">
        <span class="card__brand">${esc(p.brand)}</span>
        <h3 class="card__name">${esc(p.name)}</h3>
        <p class="card__desc">${esc(p.desc)}</p>
        ${variants}
        <div class="card__foot" data-foot="${p.id}">${footHTML(p)}</div>
      </div>
    </article>`;
  }

  function renderGrid() {
    const list = filtered();
    $("[data-grid]").innerHTML = list.map(cardHTML).join("");
    $("[data-empty]").hidden = list.length > 0;
  }

  function refreshFoot(id) {
    const el = $(`[data-foot="${id}"]`);
    if (el) el.innerHTML = footHTML(byId[id]);
  }

  /* ---------- keranjang ---------- */
  function addProduct(id) {
    const p = byId[id];
    const variant = p.variants ? (state.variantPick[id] || p.variants[0]) : null;
    const key = keyOf(id, variant);
    const it = findItem(key);
    if (it) it.qty++;
    else state.cart.push({ key, id, variant, qty: 1, note: "" });
    toast(`✅ ${p.name} ditambahkan`);
    bump();
    onCartChange(id);
  }

  function changeQty(key, delta) {
    const it = findItem(key);
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) state.cart = state.cart.filter((i) => i.key !== key);
    onCartChange(it.id);
  }

  function onCartChange(id) {
    saveCart();
    if (id) refreshFoot(id);
    renderCartBadge();
    if ($("[data-drawer]").classList.contains("is-open")) renderCart();
  }

  function renderCartBadge() {
    const n = cartCount();
    $$("[data-cart-count]").forEach((el) => (el.textContent = n));
    $("[data-cartbar]").hidden = n === 0 || $("[data-drawer]").classList.contains("is-open");
    document.body.classList.toggle("has-cart", n > 0);
  }

  function bump() {
    const b = $(".cart-btn");
    b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
  }

  function cartItemHTML(i) {
    const p = i.custom ? null : byId[i.id];
    const name = i.custom ? i.custom.name : p.name;
    const meta = i.custom
      ? (i.custom.store ? "Toko: " + i.custom.store : "Barang titipan lain")
      : [p.brand, i.variant].filter(Boolean).join(" · ");
    return `<div class="cart-item" data-item="${esc(i.key)}">
      <div class="cart-item__ico" style="background:${p ? p.bg : "#FFF3D6"}">${p ? p.emoji : "📦"}</div>
      <div>
        <div class="cart-item__name">${esc(name)}</div>
        <div class="cart-item__meta">${esc(meta)}</div>
        <div class="cart-item__row">
          <div class="qty" data-qty-for="${esc(i.key)}">
            <button type="button" data-dec aria-label="Kurangi">−</button>
            <output>${i.qty}</output>
            <button type="button" data-inc aria-label="Tambah">+</button>
          </div>
          <input class="cart-item__note" data-note="${esc(i.key)}" value="${esc(i.note)}" placeholder="Catatan (varian, ukuran…)" aria-label="Catatan untuk ${esc(name)}">
        </div>
        <button type="button" class="cart-item__rm" data-remove="${esc(i.key)}">Hapus</button>
      </div>
    </div>`;
  }

  function cartRoutes() {
    return Object.keys(ROUTES).filter((r) => state.cart.some((i) => itemRoute(i) === r));
  }

  function renderCart() {
    const wrap = $("[data-cart-items]");
    if (!state.cart.length) {
      wrap.innerHTML = `<div class="cart-empty"><b>🛍️</b>Belum ada titipan.<br>Yuk pilih produk dari katalog!</div>`;
    } else {
      wrap.innerHTML = cartRoutes().map((r) => {
        const items = state.cart.filter((i) => itemRoute(i) === r);
        return `<div class="cart-group">
          <div class="cart-group__title">${esc(ROUTES[r].short)} <span>${items.reduce((n, i) => n + i.qty, 0)} barang</span></div>
          ${items.map(cartItemHTML).join("")}
        </div>`;
      }).join("");
    }
    renderScheduleField();
  }

  function renderScheduleField() {
    const box = $("[data-field-schedule]");
    const routes = cartRoutes();
    if (!routes.length) { box.innerHTML = ""; return; }
    const prev = {};
    $$("select[data-sched]", box).forEach((s) => (prev[s.dataset.sched] = s.value));
    box.innerHTML = routes.map((r) => {
      const trips = upcomingTrips(4, r);
      const opts = trips.map((t) => {
        const v = `${t.label}, ${fmtShort(t.date)}`;
        return `<option value="${esc(v)}">${esc(t.label)} · ${fmtShort(t.date)} (tiba di ${esc(t.dest)})</option>`;
      }).join("") + `<option value="Secepatnya / sesuai info admin">Secepatnya / sesuai info admin</option>`;
      return `<label for="f-sched-${r}">Jadwal antar — ${esc(ROUTES[r].short)}</label>
        <select id="f-sched-${r}" data-sched="${r}">${opts}</select>`;
    }).join('<div style="height:12px"></div>');
    Object.entries(prev).forEach(([r, v]) => { const s = $(`select[data-sched="${r}"]`, box); if (s && v) s.value = v; });
    box.insertAdjacentHTML("beforeend", '<p class="field__help">Pesan paling lambat H-1 sebelum jadwal perjalanan.</p>');
  }

  /* ---------- drawer / modal ---------- */
  let lastFocus = null;
  function openLayer(el) {
    lastFocus = document.activeElement;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }
  function closeLayer(el) {
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    if (!$(".drawer.is-open, .modal.is-open")) document.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function openCart() {
    renderCart();
    openLayer($("[data-drawer]"));
    renderCartBadge();
    $("[data-form-error]").hidden = true;
    $("[data-sent]").hidden = true;
  }
  function closeCart() { closeLayer($("[data-drawer]")); renderCartBadge(); }

  function openCustom() {
    const f = $("[data-custom-form]");
    f.reset();
    if (state.route !== "all") f.route.value = state.route;
    openLayer($("[data-custom-modal]"));
    setTimeout(() => f.item.focus(), 250);
  }

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $("[data-toast]");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("is-show"), 1800);
  }

  /* ---------- WhatsApp ---------- */
  const waLink = (text) => `https://wa.me/${CFG.waNumber}?text=${encodeURIComponent(text)}`;

  function openWA(text) {
    const url = waLink(text);
    const w = window.open(url, "_blank");
    if (w) { try { w.opener = null; } catch (e) { /* abaikan */ } }
    else window.location.href = url;
  }

  function buildMessage(data) {
    const lines = ["Halo *KlikJastip.id*! 👋", "Saya mau titip barang berikut:", ""];
    cartRoutes().forEach((r) => {
      lines.push(`🛵 *${ROUTES[r].short.toUpperCase()}*`);
      state.cart.filter((i) => itemRoute(i) === r).forEach((i, n) => {
        let name;
        if (i.custom) name = i.custom.name + (i.custom.store ? ` (beli di ${i.custom.store})` : "");
        else name = byId[i.id].name + (i.variant ? ` — ${i.variant}` : "");
        lines.push(`${n + 1}. ${name} × ${i.qty}`);
        if (i.note) lines.push(`    ↳ Catatan: ${i.note}`);
      });
      if (data.sched[r]) lines.push(`🗓️ Jadwal: ${data.sched[r]}`);
      lines.push("");
    });
    lines.push("👤 *Data Pemesan*");
    lines.push(`Nama: ${data.name}`);
    lines.push(`No. WA: ${data.phone}`);
    lines.push(`Alamat: ${data.address}`);
    lines.push(`Terima barang: ${data.delivery}`);
    if (data.note) lines.push(`Catatan: ${data.note}`);
    lines.push("");
    lines.push("Mohon info total harga, biaya jastip & ongkirnya ya. Terima kasih! 🙏");
    return lines.join("\n");
  }

  function submitOrder(e) {
    e.preventDefault();
    const f = e.target;
    const err = $("[data-form-error]");
    $$(".is-invalid", f).forEach((el) => el.classList.remove("is-invalid"));

    if (!state.cart.length) {
      err.textContent = "Daftar titipan masih kosong. Pilih produk dulu ya.";
      err.hidden = false;
      return;
    }
    const data = {
      name: f.fullname.value.trim(),
      phone: f.phone.value.trim(),
      address: f.address.value.trim(),
      delivery: f.delivery.value,
      note: f.note.value.trim(),
      sched: {}
    };
    $$("select[data-sched]", f).forEach((s) => (data.sched[s.dataset.sched] = s.value));

    const bad = [];
    if (data.name.length < 2) bad.push(f.fullname);
    const digits = data.phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) bad.push(f.phone);
    if (data.address.length < 8) bad.push(f.address);
    if (bad.length) {
      bad.forEach((el) => el.classList.add("is-invalid"));
      err.textContent = "Mohon lengkapi nama, nomor WhatsApp yang valid, dan alamat pengantaran.";
      err.hidden = false;
      bad[0].focus();
      return;
    }
    err.hidden = true;
    store.set("kj_customer", { name: data.name, phone: data.phone, address: data.address });

    openWA(buildMessage(data));
    toast("📲 Membuka WhatsApp…");
    const sent = $("[data-sent]");
    sent.hidden = false;
    sent.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearCart() {
    const ids = state.cart.map((i) => i.id).filter(Boolean);
    state.cart = [];
    saveCart();
    ids.forEach(refreshFoot);
    renderCartBadge();
    renderCart();
    closeCart();
    toast("🎉 Terima kasih! Admin segera membalas.");
  }

  function prefillCustomer() {
    const c = store.get("kj_customer", null);
    if (!c) return;
    const f = $("[data-form]");
    if (c.name) f.fullname.value = c.name;
    if (c.phone) f.phone.value = c.phone;
    if (c.address) f.address.value = c.address;
  }

  /* ---------- events ---------- */
  function bind() {
    document.addEventListener("click", (e) => {
      const t = e.target.closest("button, a");
      if (!t) return;

      if (t.matches("[data-add]")) return addProduct(t.dataset.add);
      if (t.matches("[data-inc], [data-dec]")) {
        const key = t.closest("[data-qty-for]").dataset.qtyFor;
        return changeQty(key, t.matches("[data-inc]") ? 1 : -1);
      }
      if (t.matches("[data-remove]")) {
        const it = findItem(t.dataset.remove);
        state.cart = state.cart.filter((i) => i.key !== t.dataset.remove);
        return onCartChange(it && it.id);
      }
      if (t.matches("[data-route]")) {
        state.route = t.dataset.route; renderChips(); return renderGrid();
      }
      if (t.matches("[data-cat]")) {
        state.cat = t.dataset.cat; renderChips(); return renderGrid();
      }
      if (t.matches("[data-route-pick]")) {
        state.route = t.dataset.routePick; state.cat = "all"; renderChips(); renderGrid();
        return $("#katalog").scrollIntoView({ behavior: "smooth" });
      }
      if (t.matches("[data-clear-cart]")) return clearCart();
      if (t.matches("[data-open-cart]")) return openCart();
      if (t.matches("[data-close-cart]")) return closeCart();
      if (t.matches("[data-open-custom]")) return openCustom();
      if (t.matches("[data-close-custom]")) return closeLayer($("[data-custom-modal]"));
      if (t.matches("[data-wa-direct]")) {
        e.preventDefault();
        return openWA("Halo KlikJastip.id! 👋 Saya mau tanya-tanya soal jastip Bandung ⇄ Sumedang.");
      }
    });

    // backdrop klik (bukan button)
    $(".drawer__backdrop").addEventListener("click", closeCart);
    $(".modal__backdrop").addEventListener("click", () => closeLayer($("[data-custom-modal]")));

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if ($("[data-custom-modal]").classList.contains("is-open")) closeLayer($("[data-custom-modal]"));
      else if ($("[data-drawer]").classList.contains("is-open")) closeCart();
    });

    document.addEventListener("change", (e) => {
      const t = e.target;
      if (t.matches("[data-variant]")) {
        state.variantPick[t.dataset.variant] = t.value;
        refreshFoot(t.dataset.variant);
      }
    });

    document.addEventListener("input", (e) => {
      const t = e.target;
      if (t.matches("[data-note]")) {
        const it = findItem(t.dataset.note);
        if (it) { it.note = t.value; saveCart(); }
      }
      if (t.matches("[data-search]")) {
        state.q = t.value;
        clearTimeout(t._deb);
        t._deb = setTimeout(renderGrid, 120);
      }
      if (t.classList.contains("is-invalid")) t.classList.remove("is-invalid");
    });

    $("[data-form]").addEventListener("submit", submitOrder);

    $("[data-custom-form]").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      const name = f.item.value.trim();
      if (name.length < 2) { f.item.classList.add("is-invalid"); f.item.focus(); return; }
      const qty = Math.max(1, parseInt(f.qty.value, 10) || 1);
      state.cart.push({
        key: "custom-" + Date.now(), id: null, variant: null, qty, note: f.note.value.trim(),
        custom: { name, store: f.store.value.trim(), route: f.route.value }
      });
      closeLayer($("[data-custom-modal]"));
      onCartChange(null);
      bump();
      toast("✅ " + name + " ditambahkan");
    });
  }

  /* ---------- init ---------- */
  function init() {
    $$("[data-wa-display]").forEach((el) => (el.textContent = CFG.waDisplay));
    $("[data-year]").textContent = new Date().getFullYear();
    renderSchedule();
    renderChips();
    renderGrid();
    renderCartBadge();
    prefillCustomer();
    bind();
  }

  init();
})();
