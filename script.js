// Clean Delta Export JavaScript
document.addEventListener("DOMContentLoaded", function () {
    // Initialize AOS
    if (typeof AOS !== 'undefined' && AOS.init) {
        AOS.init({ duration: 1000, once: true });
    }

    // WhatsApp buttons (open in new tab)
    document.querySelectorAll(".whatsapp-btn").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            window.open(this.href, "_blank");
        });
    });

    // Mobile menu (align with #navToggle and #navMenu in HTML)
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Counter Animation for Statistics
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number, .stat-value');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count')) || 0;
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // ~60fps
            let current = 0;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current);
            }, 16);
        });
    }

    // Trigger counter animation when stats sections are visible
    const statsElements = document.querySelectorAll('.hero-stats, .stats-section');
    if (statsElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statsElements.forEach(element => observer.observe(element));
    } else {
        // Fallback
        animateCounters();
    }

    // =========================
    // Product Search Functionality
    // =========================
    const productSearch = document.getElementById('productSearch');
    const clearSearch = document.getElementById('clearSearch');
    const searchInfo = document.getElementById('searchInfo');
    const customOrderNotice = document.getElementById('customOrderNotice');

    if (productSearch) {
        let searchTimeout;

        // Keyword mappings for each product type (synonyms)
        const productKeywords = {
            'turmeric': ['turmeric', 'turmeric powder', 'haldi'],
            'red chilli': ['red chilli', 'red chili', 'chilli', 'chili', 'red pepper', 'chilli powder', 'chili powder'],
            'cardamom': ['cardamom', 'green cardamom', 'elaichi'],
            'black pepper': ['black pepper', 'pepper', 'kali mirch'],
            'cumin': ['cumin', 'cumin seeds', 'jeera'],
            'coriander': ['coriander', 'coriander seeds', 'dhania'],
            'cloves': ['cloves', 'clove', 'laung'],
            'cinnamon': ['cinnamon', 'dalchini'],
            'ginger': ['dry ginger', 'ginger', 'sonth']
        };

        // Extract lowercase word tokens (alphabetic only)
        const getWords = (text) => (text || '').toLowerCase().match(/[a-z]+/g) || [];

        // Does any word begin with the given prefix?
        const anyWordStartsWith = (words, prefix) => {
            if (!prefix) return false;
            return words.some(w => w.startsWith(prefix));
        };

        // Map product name to a product type key for synonyms
        const getProductTypeFromName = (name) => {
            if (name.includes('turmeric')) return 'turmeric';
            if (name.includes('chilli') || name.includes('chili')) return 'red chilli';
            if (name.includes('cardamom')) return 'cardamom';
            if (name.includes('black pepper') || name.includes('pepper')) return 'black pepper';
            if (name.includes('cumin')) return 'cumin';
            if (name.includes('coriander')) return 'coriander';
            if (name.includes('cloves') || name.includes('clove')) return 'cloves';
            if (name.includes('cinnamon')) return 'cinnamon';
            if (name.includes('ginger')) return 'ginger';
            return null;
        };

        productSearch.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            const raw = this.value.trim().toLowerCase();

            // Show/hide clear button
            if (raw.length > 0) {
                clearSearch && clearSearch.classList.add('active');
            } else {
                clearSearch && clearSearch.classList.remove('active');
                hideCustomOrderNotice();
                clearSearchInfo();
                showAllProducts();
                return;
            }

            // Progressive prefix matching using the last token (e.g., "red ch")
            const tokens = getWords(raw);
            const query = tokens.length ? tokens[tokens.length - 1] : raw;

            // Debounce search
            searchTimeout = setTimeout(() => performSearch(query), 200);
        });

        clearSearch && clearSearch.addEventListener('click', function () {
            productSearch.value = '';
            clearSearch.classList.remove('active');
            hideCustomOrderNotice();
            clearSearchInfo();
            showAllProducts();
            productSearch.focus();
        });

        function performSearch(query) {
            const productCards = document.querySelectorAll('.product-detail-card');
            let foundMatch = false;
            let visibleCount = 0;

            productCards.forEach(card => {
                const productName = (card.querySelector('h3')?.textContent || '').toLowerCase();
                // We ignore description words to prevent false positives like 'hi' matching 'high' in text
                const nameWords = getWords(productName);

                // Rule 1: direct word-prefix match on product name only
                let shouldShow = anyWordStartsWith(nameWords, query);

                // Rule 2: synonym-prefix match mapped to the card's product type
                if (!shouldShow) {
                    const type = getProductTypeFromName(productName);
                    const synonyms = (type && productKeywords[type]) ? productKeywords[type] : [];
                    shouldShow = synonyms.some(s => anyWordStartsWith(getWords(s), query));
                }

                if (shouldShow) {
                    card.style.display = 'grid';
                    foundMatch = true;
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Update search info and notices
            if (foundMatch) {
                searchInfo && (searchInfo.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success);"></i> Found ${visibleCount} matching product${visibleCount !== 1 ? 's' : ''}`);
                hideCustomOrderNotice();
            } else {
                searchInfo && (searchInfo.innerHTML = `<i class=\"fas fa-search\" style=\"color: var(--text-light);\"></i> No products found for \"${query}\"`);
                showCustomOrderNotice();
            }
        }

        function showAllProducts() {
            const productCards = document.querySelectorAll('.product-detail-card');
            productCards.forEach(card => { card.style.display = 'grid'; });
        }

        function showCustomOrderNotice() {
            if (customOrderNotice) {
                customOrderNotice.style.display = 'block';
                if (typeof AOS !== 'undefined' && AOS.refresh) AOS.refresh();
            }
        }

        function hideCustomOrderNotice() {
            if (customOrderNotice) customOrderNotice.style.display = 'none';
        }

        function clearSearchInfo() {
            if (searchInfo) searchInfo.innerHTML = '';
        }
    }
});

console.log("Delta Export loaded successfully!");
