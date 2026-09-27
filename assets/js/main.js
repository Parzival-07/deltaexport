// Delta Export — shared site behaviour
document.documentElement.classList.remove("no-js");

document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("active");
      navToggle.classList.toggle("active", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Header border once the page scrolls
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Spice search (products page)
  const productSearch = document.getElementById("productSearch");
  if (!productSearch) return;

  const clearSearch = document.getElementById("clearSearch");
  const searchInfo = document.getElementById("searchInfo");
  const customOrderNotice = document.getElementById("customOrderNotice");
  const cards = [...document.querySelectorAll("[data-product]")];

  // Synonyms, including common Hindi names
  const productKeywords = {
    turmeric: ["turmeric", "haldi"],
    chilli: ["red chilli", "red chili", "chilli", "chili", "red pepper", "mirchi"],
    cardamom: ["cardamom", "green cardamom", "elaichi"],
    pepper: ["black pepper", "pepper", "kali mirch"],
    cumin: ["cumin", "jeera"],
    coriander: ["coriander", "dhania"],
    cloves: ["cloves", "clove", "laung"],
    cinnamon: ["cinnamon", "dalchini"],
    ginger: ["dry ginger", "ginger", "sonth"],
  };

  const getWords = (text) => (text || "").toLowerCase().match(/[a-z]+/g) || [];
  const anyWordStartsWith = (words, prefix) => !!prefix && words.some((w) => w.startsWith(prefix));

  let timer;
  productSearch.addEventListener("input", () => {
    clearTimeout(timer);
    const raw = productSearch.value.trim().toLowerCase();
    clearSearch?.classList.toggle("active", raw.length > 0);
    if (!raw) return reset();
    const tokens = getWords(raw);
    timer = setTimeout(() => performSearch(tokens.length ? tokens[tokens.length - 1] : raw), 150);
  });

  clearSearch?.addEventListener("click", () => {
    productSearch.value = "";
    clearSearch.classList.remove("active");
    reset();
    productSearch.focus();
  });

  function performSearch(query) {
    let visible = 0;
    cards.forEach((card) => {
      const nameWords = getWords(card.querySelector("h3")?.textContent);
      const synonyms = productKeywords[card.dataset.product] || [];
      const match = anyWordStartsWith(nameWords, query) || synonyms.some((s) => anyWordStartsWith(getWords(s), query));
      card.hidden = !match;
      if (match) visible++;
    });
    if (searchInfo) {
      searchInfo.textContent = visible
        ? `${visible} product${visible !== 1 ? "s" : ""} found`
        : `No products found for “${query}”`;
    }
    if (customOrderNotice) customOrderNotice.style.display = visible ? "none" : "block";
  }

  function reset() {
    cards.forEach((card) => { card.hidden = false; });
    if (searchInfo) searchInfo.textContent = "";
    if (customOrderNotice) customOrderNotice.style.display = "none";
  }
});
