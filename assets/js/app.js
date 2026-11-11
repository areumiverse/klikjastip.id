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
  const fmtShort = (d) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  function upcoming(n, route) {
    const out = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let add = 1; out.length < n && add < 60; add++) {
      const d = new Date(today); d.setDate(today.getDate() + add);
      CFG.schedule.forEach((s) => {
        if (s.day === d.getDay() && (!route || s.route === route) && out.length < n) out.push({ ...s, date: d });
      });
    }
    return out;
  }

  function renderSchedule() {
    const soon = upcoming(4);
    const next = soon[0];
    // urut sesuai tanggal terdekat, bukan urutan hari
    $("[data-schedule]").innerHTML = soon.map((t) =>
      `<li class="${t === next ? "next" : ""}">
        <span>${esc(t.label)}<span class="date">${fmtShort(t.date)}</span></span>
        <span>ke ${esc(t.dest)}</span>
      </li>`).join("");
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
    const days = CFG.schedule.filter((s) => s.route === state.route).map((s) => s.label.toLowerCase());
    $("[data-lead]").textContent = `Dibeli di ${r.short.split(" → ")[0]}, diantar ke ${r.short.split(" → ")[1]} setiap ${days.join(" dan ")}.`;
  }

  function actHTML(p) {
    const v = p.variants ? (state.pick[p.id] || p.variants[0]) : null;
    const it = findItem(keyOf(p.id, v));
    if (!it) return `<button type="button" class="add" data-add="${p.id}" aria-label="Titip ${esc(p.name)}">Titip</button>`;
    return `<span class="qty" data-qty-for="${esc(it.key)}">
      <button type="button" data-dec aria-label="Kurangi">−</button>
      <output>${it.qty}</output>
      <button type="button" data-inc aria-label="Tambah">+</button></span>`;
  }

  function itemHTML(p) {
    const vars = p.variants
      ? `<select class="item__var" data-variant="${p.id}" aria-label="Pilihan untuk ${esc(p.name)}">
          ${p.variants.map((v) => `<option${state.pick[p.id] === v ? " selected" : ""}>${esc(v)}</option>`).join("")}
        </select>` : "";
    return `<li class="item">
      <div>
        <p class="item__name">${esc(p.name)}${p.tag ? ` <span class="item__tag">${esc(p.tag)}</span>` : ""}</p>
        <p class="item__where">${esc(p.where)}</p>
      </div>
      <div class="item__act" data-act="${p.id}">${actHTML(p)}</div>
      <p class="item__desc">${esc(p.desc)}</p>
      ${vars}
    </li>`;
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
      `<section class="group"><h3>${esc(CATS[c])}</h3><ul class="items">${items.map(itemHTML).join("")}</ul></section>`
    ).join("")}</div>`;
  }

  const refreshAct = (id) => { const el = $(`[data-act="${id}"]`); if (el) el.innerHTML = actHTML(byId[id]); };

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
        const v = `${t.label}, ${fmtShort(t.date)}`;
        return `<option value="${esc(v)}">${esc(t.label)}, ${fmtShort(t.date)}</option>`;
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
      if (t.matches("[data-wa-direct]")) { e.preventDefault(); return openWA("Halo KlikJastip, saya mau tanya soal titip barang."); }
    });

    $$(".sheet__shade").forEach((s) => s.addEventListener("click", () => {
      const sheet = s.parentElement;
      if (sheet.matches("[data-drawer]")) closeNota(); else close(sheet);
    }));

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if ($("[data-custom-modal]").classList.contains("is-open")) close($("[data-custom-modal]"));
      else if ($("[data-drawer]").classList.contains("is-open")) closeNota();
    });

    document.addEventListener("change", (e) => {
      if (e.target.matches("[data-variant]")) {
        state.pick[e.target.dataset.variant] = e.target.value;
        refreshAct(e.target.dataset.variant);
      }
    });

    document.addEventListener("input", (e) => {
      const t = e.target;
      if (t.matches("[data-note]")) { const it = findItem(t.dataset.note); if (it) { it.note = t.value; save(); } }
      if (t.matches("[data-search]")) { state.q = t.value; clearTimeout(t._d); t._d = setTimeout(renderList, 120); }
      t.classList.remove("bad");
    });

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
  }

  init();
})();
