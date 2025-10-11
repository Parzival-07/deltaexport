// Clean Delta Export JavaScript
document.addEventListener("DOMContentLoaded", function() {
    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true
    });
    
    // WhatsApp buttons
    document.querySelectorAll(".whatsapp-btn").forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            window.open(this.href, "_blank");
        });
    });
    
    // Mobile menu
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            hamburger.classList.toggle("active");
        });
    }
    
    // Counter Animation for Statistics
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number, .stat-value');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
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
    if (statsElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsElements.forEach(element => observer.observe(element));
    }
});

console.log("Delta Export loaded successfully!");
