(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = (n) => "₹" + n.toLocaleString("en-IN");

  /* ---------- Data (placeholder catalog) ---------- */
  const svg = (inner) =>
    `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const ICONS = {
    Hampers: svg('<path d="M10 28h44l-5 26a4 4 0 0 1-4 3H19a4 4 0 0 1-4-3z"/><path d="M20 28c0-10 5-18 12-18s12 8 12 18"/><path d="M24 36v14M32 36v14M40 36v14"/>'),
    "Photo Frames": svg('<rect x="8" y="10" width="48" height="44" rx="3"/><rect x="15" y="17" width="34" height="30" rx="1.5"/><path d="M15 41l9-10 8 8 6-6 11 11"/><circle cx="41" cy="25" r="3"/>'),
    Treats: svg('<path d="M32 8c-10 0-17 16-17 28a17 17 0 0 0 34 0C49 24 42 8 32 8z"/><path d="M16 36l8-6 8 6 8-6 9 6"/>'),
    Bouquets: svg('<circle cx="32" cy="14" r="6"/><circle cx="23" cy="22" r="6"/><circle cx="41" cy="22" r="6"/><circle cx="32" cy="22" r="3"/><path d="M32 28v10"/><path d="M16 38h32l-12 22h-8z"/>')
  };

  const PRODUCTS = [
    { id: "p1", name: "Celebration Gift Hamper", cat: "Hampers", price: 1899, mrp: 2199, rating: 4.8, reviews: 214, tag: "Bestseller", hue: 345, occ: ["Birthday", "Congratulations"] },
    { id: "p2", name: "Self-Care Hamper", cat: "Hampers", price: 2499, mrp: 2899, rating: 4.7, reviews: 131, hue: 285, occ: ["Thank you", "Birthday"] },
    { id: "p3", name: "Festive Dry Fruit Hamper", cat: "Hampers", price: 2199, mrp: 2199, rating: 4.6, reviews: 98, hue: 35, occ: ["Thank you", "Congratulations"] },
    { id: "p4", name: "Personalised Collage Frame", cat: "Photo Frames", price: 899, mrp: 1199, rating: 4.7, reviews: 342, tag: "Personalised", hue: 210, occ: ["Anniversary", "Birthday"] },
    { id: "p5", name: "Wooden Memory Frame", cat: "Photo Frames", price: 699, mrp: 799, rating: 4.5, reviews: 176, hue: 28, occ: ["Anniversary", "Thank you"] },
    { id: "p6", name: "LED Photo Lamp Frame", cat: "Photo Frames", price: 1299, mrp: 1599, rating: 4.6, reviews: 87, tag: "New", hue: 265, occ: ["Anniversary", "Birthday"] },
    { id: "p7", name: "Kinder Joy Treat Box", cat: "Treats", price: 799, mrp: 899, rating: 4.8, reviews: 289, tag: "Kids' favourite", hue: 48, occ: ["Birthday"] },
    { id: "p8", name: "Chocolate Truffle Box", cat: "Treats", price: 999, mrp: 1199, rating: 4.7, reviews: 205, hue: 15, occ: ["Anniversary", "Thank you"] },
    { id: "p9", name: "Birthday Chocolate Box", cat: "Treats", price: 1199, mrp: 1399, rating: 4.5, reviews: 118, hue: 330, occ: ["Birthday", "Congratulations"] },
    { id: "p10", name: "Red Rose Bouquet, 12 stems", cat: "Bouquets", price: 999, mrp: 1199, rating: 4.8, reviews: 401, tag: "Most gifted", hue: 352, occ: ["Anniversary"] },
    { id: "p11", name: "Mixed Seasonal Bouquet", cat: "Bouquets", price: 1299, mrp: 1499, rating: 4.7, reviews: 233, hue: 150, occ: ["Birthday", "Thank you", "Congratulations"] },
    { id: "p12", name: "Pink Lily Bouquet", cat: "Bouquets", price: 1499, mrp: 1799, rating: 4.6, reviews: 144, hue: 320, occ: ["Anniversary", "Thank you"] }
  ];
  /* Product image URLs. Replace a file in /images, or set img on a product to use your own photo. */
  const PHOTO_MAP = { p1: "hamper.jpg", p2: "hamper.jpg", p3: "hamper.jpg", p4: "birthday_bouquet.jpg", p5: "birthday_bouquet.jpg", p6: "birthday_bouquet.jpg", p7: "hamper.jpg", p8: "hamper.jpg", p9: "birthday_bouquet.jpg", p10: "bouquet.jpg", p11: "bouquet.jpg", p12: "birthday_bouquet.jpg" };
  PRODUCTS.forEach((p) => { p.img = p.img || PHOTO_MAP[p.id]; });
  const byId = new Map(PRODUCTS.map((p) => [p.id, p]));
  const CATEGORIES = ["All", ...new Set(PRODUCTS.map((p) => p.cat))];
  const OCCASIONS = [
    { name: "Birthday", line: "Make their day", hue: 345 },
    { name: "Anniversary", line: "Celebrate together", hue: 352 },
    { name: "Thank you", line: "Show you care", hue: 150 },
    { name: "Congratulations", line: "Mark the win", hue: 45 }
  ];

  const FREE_DELIVERY_AT = 1499;
  const DELIVERY = 80;
  const COUPONS = { GIFT10: 0.1 };
  const KEY = "petalparcel-cart";
  const META_KEY = "petalparcel-meta";

  /* ---------- State ---------- */
  let cart = {};
  let coupon = null;
  const meta = { msg: "", date: "" };
  const view = { cat: "All", occ: "", q: "", sort: "featured" };

  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      Object.keys(raw).forEach((id) => {
        if (byId.has(id) && Number(raw[id]) > 0) cart[id] = Math.min(Number(raw[id]), 20);
      });
      const m = JSON.parse(localStorage.getItem(META_KEY) || "{}");
      meta.msg = typeof m.msg === "string" ? m.msg.slice(0, 150) : "";
      meta.date = typeof m.date === "string" ? m.date : "";
    } catch (_) { /* storage unavailable */ }
  };
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch (_) { /* ignore */ }
  };

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2400);
  };

  /* ---------- Occasions ---------- */
  const occGrid = $("#occGrid");
  occGrid.innerHTML = OCCASIONS.map((o) => {
    const n = PRODUCTS.filter((p) => p.occ.includes(o.name)).length;
    return `<button class="occ__card" data-occ="${o.name}" style="--h:${o.hue}">
      <span class="occ__dot"></span><strong>${o.name}</strong><span>${o.line} · ${n} gifts</span></button>`;
  }).join("");
  occGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-occ]");
    if (!btn) return;
    view.occ = btn.dataset.occ;
    view.cat = "All";
    renderChips();
    renderProducts();
    $("#shop").scrollIntoView({ behavior: "smooth" });
  });
  $("#occClear").addEventListener("click", () => { view.occ = ""; renderProducts(); });

  /* ---------- Product grid ---------- */
  const grid = $("#productGrid");

  const visibleProducts = () => {
    const q = view.q.trim().toLowerCase();
    const list = PRODUCTS.filter(
      (p) =>
        (view.cat === "All" || p.cat === view.cat) &&
        (!view.occ || p.occ.includes(view.occ)) &&
        (!q || `${p.name} ${p.cat}`.toLowerCase().includes(q))
    );
    if (view.sort === "low") list.sort((a, b) => a.price - b.price);
    if (view.sort === "high") list.sort((a, b) => b.price - a.price);
    if (view.sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  };

  function renderProducts() {
    const list = visibleProducts();
    $("#resultCount").textContent = `${list.length} gift${list.length === 1 ? "" : "s"}`;
    $("#emptyState").hidden = list.length > 0;
    const clear = $("#occClear");
    clear.hidden = !view.occ;
    clear.textContent = view.occ ? `${view.occ} ×` : "";
    grid.innerHTML = list
      .map((p, i) => {
        const off = Math.round((1 - p.price / p.mrp) * 100);
        return `
        <article class="product" style="--h:${p.hue};--i:${i}">
          <div class="product__img">
            ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
            ${off > 0 ? `<span class="off">${off}% off</span>` : ""}
            <img class="product__photo" src="${p.img}" alt="${p.name}" loading="lazy" width="600" height="600">
          </div>
          <div class="product__info">
            <p class="product__cat">${p.cat}</p>
            <h3 class="product__name">${p.name}</h3>
            <p class="rating">★ ${p.rating.toFixed(1)} <span>(${p.reviews})</span></p>
            <div class="product__row">
              <p class="price">${money(p.price)}${p.mrp > p.price ? `<s>${money(p.mrp)}</s>` : ""}</p>
              <button class="btn btn--small" data-add="${p.id}" aria-label="Add ${p.name} to cart">Add</button>
            </div>
          </div>
        </article>`;
      })
      .join("");
  }

  const chips = $("#chips");
  function renderChips() {
    chips.innerHTML = CATEGORIES.map(
      (c) => `<button class="chip" data-cat="${c}" aria-pressed="${c === view.cat}">${c}</button>`
    ).join("");
  }
  chips.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    view.cat = btn.dataset.cat;
    renderChips();
    renderProducts();
  });
  $("#search").addEventListener("input", (e) => { view.q = e.target.value; renderProducts(); });
  $("#sort").addEventListener("change", (e) => { view.sort = e.target.value; renderProducts(); });

  /* ---------- Cart ---------- */
  const totals = () => {
    const subtotal = Object.entries(cart).reduce((s, [id, q]) => s + byId.get(id).price * q, 0);
    const discount = coupon ? Math.round(subtotal * COUPONS[coupon]) : 0;
    const after = subtotal - discount;
    const shipping = subtotal === 0 || after >= FREE_DELIVERY_AT ? 0 : DELIVERY;
    return { subtotal, discount, shipping, total: after + shipping };
  };

  const countEl = $("#cartCount");
  function renderCart(bump = false) {
    const ids = Object.keys(cart);
    const count = ids.reduce((s, id) => s + cart[id], 0);
    countEl.textContent = count;
    if (bump) {
      countEl.classList.remove("bump");
      void countEl.offsetWidth;
      countEl.classList.add("bump");
    }

    const body = $("#cartItems");
    const foot = $("#cartFoot");
    if (!ids.length) {
      body.innerHTML = `<div class="cart-empty"><p>Your cart is empty.</p><button class="btn btn--small" data-close>Browse gifts</button></div>`;
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.innerHTML = ids
      .map((id) => {
        const p = byId.get(id);
        return `
        <div class="line" style="--h:${p.hue}">
          <div class="line__img"><img src="${p.img}" alt="" width="64" height="64"></div>
          <div>
            <p class="line__name">${p.name}</p>
            <div class="line__meta">
              <div class="qty">
                <button data-act="dec" data-id="${id}" aria-label="Decrease quantity">−</button>
                <span aria-live="polite">${cart[id]}</span>
                <button data-act="inc" data-id="${id}" aria-label="Increase quantity">+</button>
              </div>
              <span class="line__price">${money(p.price * cart[id])}</span>
            </div>
            <button class="line__remove" data-act="rm" data-id="${id}">Remove</button>
          </div>
        </div>`;
      })
      .join("");

    const t = totals();
    $("#tSub").textContent = money(t.subtotal);
    $("#tDiscRow").hidden = t.discount === 0;
    $("#tDisc").textContent = "−" + money(t.discount);
    $("#tShip").textContent = t.shipping === 0 ? "Free" : money(t.shipping);
    $("#tTotal").textContent = money(t.total);
  }

  const addToCart = (id, qty = 1) => {
    cart[id] = Math.min((cart[id] || 0) + qty, 20);
    save();
    renderCart(true);
  };

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    addToCart(btn.dataset.add);
    toast(`${byId.get(btn.dataset.add).name} added to cart`);
  });

  $("#comboBtn").addEventListener("click", (e) => {
    e.currentTarget.dataset.combo.split(",").forEach((id) => addToCart(id));
    toast("Birthday Surprise combo added to cart");
  });

  $("#cartItems").addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) { closeCart(); $("#shop").scrollIntoView({ behavior: "smooth" }); return; }
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.act === "inc") cart[id] = Math.min(cart[id] + 1, 20);
    if (btn.dataset.act === "dec") cart[id] = cart[id] - 1;
    if (btn.dataset.act === "rm" || cart[id] <= 0) delete cart[id];
    save();
    renderCart();
  });

  /* Gift message and delivery date */
  const giftMsg = $("#giftMsg");
  const delDate = $("#delDate");
  const today = new Date();
  delDate.min = today.toLocaleDateString("en-CA");
  giftMsg.addEventListener("input", () => { meta.msg = giftMsg.value; save(); });
  delDate.addEventListener("change", () => { meta.date = delDate.value; save(); });

  /* Coupon */
  const couponMsg = $("#couponMsg");
  $("#couponForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = $("#couponInput").value.trim().toUpperCase();
    couponMsg.className = "coupon__msg";
    if (!code) { coupon = null; couponMsg.textContent = ""; renderCart(); return; }
    if (COUPONS[code]) {
      coupon = code;
      couponMsg.textContent = `${code} applied: ${COUPONS[code] * 100}% off.`;
      couponMsg.classList.add("is-success");
    } else {
      coupon = null;
      couponMsg.textContent = "That code is not valid. Try GIFT10.";
      couponMsg.classList.add("is-error");
    }
    renderCart();
  });

  /* Place order (demo only) */
  $("#checkoutBtn").addEventListener("click", () => {
    const when = meta.date
      ? new Date(meta.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      : "";
    cart = {};
    coupon = null;
    meta.msg = "";
    meta.date = "";
    giftMsg.value = "";
    delDate.value = "";
    $("#couponInput").value = "";
    couponMsg.textContent = "";
    save();
    renderCart();
    closeCart();
    toast(when ? `Demo order placed for ${when}. No payment taken.` : "Demo order placed. No payment taken.");
  });

  /* ---------- Drawer ---------- */
  const drawer = $("#drawer");
  const overlay = $("#overlay");
  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    $("#cartClose").focus();
  }
  function closeCart() {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $("#cartOpen").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeCart(); setMenu(false); }
  });

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $("#navToggle");
  const links = $("#navLinks");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    links.classList.toggle("is-open", open);
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", links).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  $("#searchBtn").addEventListener("click", () => {
    setMenu(false);
    $("#shop").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $("#search").focus({ preventScroll: true }), 500);
  });
  $("#userBtn").addEventListener("click", () => toast("Sign in is coming soon"));

  /* Announcement bar: auto-slide every 4s, swipe or hover to control */
  (function () {
    const bar = $("#announce"), track = $("#announceTrack"), dots = $$("#announceDots i");
    const n = dots.length; let i = 0, timer = null, x0 = null;
    const go = (k) => {
      i = (k + n) % n;
      track.style.transform = `translateX(${-100 * i}%)`;
      dots.forEach((d, j) => d.classList.toggle("is-on", j === i));
    };
    const start = () => { stop(); timer = setInterval(() => go(i + 1), 4000); };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    bar.addEventListener("mouseenter", stop);
    bar.addEventListener("mouseleave", start);
    bar.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    bar.addEventListener("touchend", (e) => {
      if (x0 !== null) { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 30) go(i + (dx < 0 ? 1 : -1)); }
      x0 = null; start();
    });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    start();
  })();
  document.addEventListener("click", (e) => { if (!e.target.closest(".nav__inner")) setMenu(false); });

  /* ---------- Bulk gifting form (front-end demo) ---------- */
  const bulkForm = $("#bulkForm");
  const bulkMsg = $("#bulkMsg");
  bulkForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#bulkName");
    const email = $("#bulkEmail");
    const nameOk = name.value.trim().length > 0;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    name.classList.toggle("is-invalid", !nameOk);
    email.classList.toggle("is-invalid", !emailOk);
    bulkMsg.className = "form__msg";
    if (!nameOk || !emailOk) {
      bulkMsg.textContent = "Please enter your name and a valid email.";
      bulkMsg.classList.add("is-error");
      return;
    }
    bulkMsg.textContent = `Thanks ${name.value.trim().split(" ")[0]}! (Demo form, nothing was sent.)`;
    bulkMsg.classList.add("is-success");
    bulkForm.reset();
    $("#bulkQty").value = 25;
  });

  /* ---------- Init ---------- */
  $("#year").textContent = new Date().getFullYear();
  load();
  giftMsg.value = meta.msg;
  if (meta.date && meta.date >= delDate.min) delDate.value = meta.date; else meta.date = "";
  renderChips();
  renderProducts();
  renderCart();
})();
