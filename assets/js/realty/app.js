// Delta Realty — listings, property detail, home search and post form
(() => {
  const P = window.DELTA_PROPERTIES || [];
  const COMMERCIAL = ["office", "shop", "warehouse"];

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  const money = (n) =>
    n >= 1e7 ? "₹" + (n / 1e7).toFixed(2).replace(/\.?0+$/, "") + " Cr"
    : n >= 1e5 ? "₹" + (n / 1e5).toFixed(2).replace(/\.?0+$/, "") + " L"
    : "₹" + n.toLocaleString("en-IN");
  const perMonth = (p) => (p.mode === "rent" ? " <small>/ month</small>" : "");
  const url = (p) => `realty-property.html?id=${encodeURIComponent(p.id)}`;

  const matchesType = (p, type) => {
    if (!type) return true;
    const t = type.toLowerCase(), pt = p.type.toLowerCase();
    if (t === "commercial") return COMMERCIAL.includes(pt);
    return pt === t;
  };

  const facts = (p) =>
    [p.beds ? `<span><b>${p.beds}</b> BHK</span>` : "", p.baths ? `<span><b>${p.baths}</b> Bath</span>` : "", `<span><b>${p.area.toLocaleString("en-IN")}</b> sq.ft.</span>`]
      .filter(Boolean).join("");

  const card = (p) => `
    <article class="property-card reveal in">
      <a href="${url(p)}" class="photo">
        <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">
        <div class="badges"><span class="tag">${esc(p.mode === "rent" ? "For rent" : "For sale")}</span>${p.verified ? '<span class="tag tag-success"><i class="fa-solid fa-circle-check"></i> Verified</span>' : ""}</div>
      </a>
      <div class="pc-body">
        <div class="pc-price">${money(p.price)}${perMonth(p)}</div>
        <h3><a href="${url(p)}">${esc(p.title)}</a></h3>
        <p class="pc-loc">${esc(p.locality)}, ${esc(p.city)} · ${esc(p.type)}</p>
        <div class="facts">${facts(p)}</div>
      </div>
    </article>`;

  const params = () => new URLSearchParams(location.search);

  function renderFeatured() {
    const el = document.getElementById("featuredGrid");
    if (el) el.innerHTML = P.slice(0, 3).map(card).join("");
  }

  function renderListings() {
    const grid = document.getElementById("listingGrid");
    if (!grid) return;
    const q = params();
    const fs = document.getElementById("fSearch"), fm = document.getElementById("fMode"),
      ft = document.getElementById("fType"), fb = document.getElementById("fBeds"), fbud = document.getElementById("fBudget");

    let mode = q.get("mode") || "", type = q.get("type") || "";
    if (mode === "commercial") { mode = ""; type = "commercial"; }
    fs.value = q.get("q") || "";
    fbud.value = q.get("budget") || "";
    fm.value = mode;
    const match = [...ft.options].find((o) => o.value.toLowerCase() === type.toLowerCase());
    ft.value = match ? match.value : "";

    // Highlight the matching tab in the Realty sub-navigation
    const key = mode === "rent" ? "rent" : type.toLowerCase() === "commercial" ? "commercial" : type.toLowerCase() === "plot" ? "plot" : "buy";
    document.querySelectorAll("[data-subnav]").forEach((a) => a.classList.toggle("active", a.dataset.subnav === key));

    const draw = () => {
      const search = fs.value.trim().toLowerCase(), m = fm.value, t = ft.value, beds = fb.value, budget = fbud.value;
      const [lo, hi] = budget ? budget.split("-").map(Number) : [0, Infinity];
      const list = P.filter((p) =>
        (!m || p.mode === m) && matchesType(p, t) &&
        (!search || `${p.city} ${p.locality} ${p.title}`.toLowerCase().includes(search)) &&
        (!beds || p.beds >= Number(beds)) && p.price >= lo && p.price <= hi);

      grid.innerHTML = list.length ? list.map(card).join("") :
        `<div class="empty"><h2>No matching properties</h2><p>Try widening your filters, or <a href="realty-post.html">list a property</a>.</p></div>`;
      document.getElementById("resultCount").textContent = `${list.length} ${list.length === 1 ? "property" : "properties"}`;
      document.getElementById("listingTitle").textContent =
        m === "rent" ? "Properties for rent" : m === "buy" ? "Properties for sale"
        : t.toLowerCase() === "commercial" ? "Commercial properties" : t ? `${t}s` : "All properties";
    };

    [fs, fm, ft, fb, fbud].forEach((x) => x.addEventListener("input", draw));
    document.getElementById("reset")?.addEventListener("click", () => {
      fs.value = fm.value = ft.value = fb.value = fbud.value = "";
      draw();
    });
    draw();
  }

  function renderProperty() {
    const el = document.getElementById("property");
    if (!el) return;
    const p = P.find((x) => x.id === params().get("id"));
    if (!p) {
      el.innerHTML = `<div class="empty" style="margin-top:48px"><h2>Property not found</h2><p><a href="realty-listings.html">Browse all properties</a></p></div>`;
      return;
    }
    document.title = `${p.title} · Delta Realty`;
    const wa = `https://wa.me/919662679966?text=${encodeURIComponent(`Hello, I am interested in "${p.title}" (${p.locality}, ${p.city}) on Delta Realty.`)}`;
    el.innerHTML = `
      <nav class="crumbs" style="margin-bottom:20px"><a href="realty.html">Realty</a><span aria-hidden="true">/</span><a href="realty-listings.html${p.mode === "rent" ? "?mode=rent" : ""}">${p.mode === "rent" ? "Rent" : "Buy"}</a><span aria-hidden="true">/</span><span>${esc(p.title)}</span></nav>
      <div class="detail-media"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div>
      <div class="detail-grid">
        <div class="detail-main">
          <div class="tags"><span class="tag">${p.mode === "rent" ? "For rent" : "For sale"}</span><span class="tag">${esc(p.type)}</span>${p.verified ? '<span class="tag tag-success"><i class="fa-solid fa-circle-check"></i> Delta verified</span>' : ""}</div>
          <h1>${esc(p.title)}</h1>
          <p class="muted">${esc(p.locality)}, ${esc(p.city)}</p>
          <div class="facts">${facts(p)}</div>
          <p>${esc(p.description)}</p>
        </div>
        <aside class="enquiry">
          <div class="detail-price">${money(p.price)}${perMonth(p)}</div>
          <p class="muted" style="font-size:14.5px">Talk to the Delta team about this property or schedule a site visit.</p>
          <a class="btn btn-accent btn-block" href="${wa}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Enquire on WhatsApp</a>
          <a class="btn btn-ghost btn-block" href="tel:+919662679966"><i class="fa-solid fa-phone"></i> Call +91 96626 79966</a>
        </aside>
      </div>`;
  }

  function setupHome() {
    const form = document.getElementById("homeSearch");
    if (!form) return;
    const tabs = document.querySelectorAll(".seg button");
    tabs.forEach((t) => t.addEventListener("click", () => {
      tabs.forEach((x) => x.classList.toggle("active", x === t));
    }));
    document.querySelectorAll(".quick-cities button").forEach((b) =>
      b.addEventListener("click", () => { document.getElementById("qLocation").value = b.dataset.city; }));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = new URLSearchParams();
      const loc = document.getElementById("qLocation").value.trim(),
        type = document.getElementById("qType").value, budget = document.getElementById("qBudget").value,
        mode = document.querySelector(".seg button.active")?.dataset.mode || "buy";
      if (loc) q.set("q", loc);
      if (mode === "commercial") q.set("type", "commercial");
      else { q.set("mode", mode); if (type) q.set("type", type); }
      if (budget) q.set("budget", budget);
      location.href = "realty-listings.html?" + q.toString();
    });
  }

  function setupForm() {
    const f = document.getElementById("propertyForm");
    if (!f) return;
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      try {
        const saved = JSON.parse(localStorage.getItem("deltaPropertyDrafts") || "[]");
        saved.push({ ...d, id: "local-" + Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem("deltaPropertyDrafts", JSON.stringify(saved));
      } catch (_) { /* storage unavailable */ }
      // Until Supabase is connected, hand the listing to the Delta team over WhatsApp
      const text = [
        "New property listing — Delta Realty",
        `${d.role} · ${d.mode === "rent" ? "Rent / Lease" : "Sell"} · ${d.type}`,
        d.title, `${d.locality}, ${d.city}`, `Price: ₹${d.price}`,
        d.beds && `BHK: ${d.beds}`, d.area && `Area: ${d.area} sq.ft.`, d.baths && `Bathrooms: ${d.baths}`,
        d.description, `Contact: ${d.name}, ${d.phone}${d.email ? ", " + d.email : ""}`,
      ].filter(Boolean).join("\n");
      window.open(`https://wa.me/919662679966?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      document.getElementById("formMsg").textContent = "Thanks. Send the WhatsApp message that just opened and our team will review your listing.";
      f.reset();
    });
  }

  renderFeatured();
  renderListings();
  renderProperty();
  setupHome();
  setupForm();
})();
