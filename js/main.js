// js/main.js
console.log('🚀 Main JS loaded');

// DOM ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('📱 DOM ready');
  initializeApp();
});

function initializeApp() {
  // Laadi kõik vajalikud komponendid
  loadFacts();
  loadUpdates();
  loadBlogData();
  initializeScrollEffects();
}

// Scroll efektid
function initializeScrollEffects() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
}

// Kiirfaktide funktsioon
function showMoreFacts() {
  const extraFacts = [
    { text: "🎯 <strong>Eesmärk 2025:</strong> Saada kindlam Python ja JavaScript programmeerimises", type: "info" },
    { text: "🌟 <strong>Unistus:</strong> Luua rakendusi, mis aitavad inimestel paremini elada", type: "dream" },
    { text: "📚 <strong>Hetkel õpin:</strong> React.js ja andmebaaside haldamist", type: "learning" },
    { text: "🎮 <strong>Hobi:</strong> Kuldvillak (oma tehtud Jeopardy mäng)", type: "hobby" }
  ];
  
  const container = document.getElementById('facts-container');
  const button = document.getElementById('more-facts-btn');
  
  if (!container || !button) return;
  
  extraFacts.forEach((fact, index) => {
    setTimeout(() => {
      const factCard = document.createElement('div');
      factCard.className = `fact-card extra-facts ${fact.type}`;
      factCard.innerHTML = `<p>${fact.text}</p>`;
      container.appendChild(factCard);
    }, index * 200);
  });
  
  button.style.display = 'none';
}

// Lisage need funktsioonid main.js faili või eraldi mobile.js faili

// ===== MOBILE DETECTION =====
function isMobile() {
  return window.innerWidth <= 768 || 
         ('ontouchstart' in window) || 
         (navigator.maxTouchPoints > 0);
}

// ===== IMPROVED MOBILE MENU =====
function initMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (!navToggle || !navLinks) return;
  
  // Toggle menu
  navToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    const isOpen = navLinks.classList.contains('active');
    
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', !isOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });
  
  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
  
  // Close menu on outside click
  document.addEventListener('click', function(event) {
    if (!navLinks.contains(event.target) && 
        !navToggle.contains(event.target) && 
        navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

// ===== VIEWPORT HEIGHT FIX =====
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// ===== TOUCH SWIPE SUPPORT =====
function initTouchSwipe() {
  let touchStartX = 0;
  let touchEndX = 0;
  
  const navLinks = document.querySelector('.nav-links');
  
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    
    // Swipe left to close menu
    if (touchStartX - touchEndX > swipeThreshold && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      document.querySelector('.nav-toggle').classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

// ===== LAZY LOADING IMPROVEMENTS =====
function initLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    return;
  }
  
  // Fallback for browsers without native lazy loading
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// ===== SMOOTH SCROLL WITH OFFSET =====
function smoothScrollTo(target) {
  const element = document.querySelector(target);
  if (!element) return;
  
  const navbarHeight = document.querySelector('.navbar').offsetHeight;
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

// ===== ADMIN PANEL IMPROVEMENTS =====
function improveAdminPanels() {
  const adminPanel = document.getElementById('admin-panel');
  const blogAdminPanel = document.getElementById('blog-admin-panel');
  
  // Create overlays if they don't exist
  if (adminPanel && !document.querySelector('.admin-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'admin-overlay';
    overlay.onclick = () => toggleAdminMode();
    adminPanel.parentNode.insertBefore(overlay, adminPanel);
  }
  
  if (blogAdminPanel && !document.querySelector('.blog-admin-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'blog-admin-overlay';
    overlay.onclick = () => toggleBlogAdmin();
    blogAdminPanel.parentNode.insertBefore(overlay, blogAdminPanel);
  }
}

// ===== TOGGLE FUNCTIONS UPDATE =====
// Update your existing toggle functions
function toggleAdminMode() {
  const panel = document.getElementById('admin-panel');
  const overlay = document.querySelector('.admin-overlay');
  
  if (panel && overlay) {
    const isOpen = !panel.classList.contains('hidden');
    
    panel.classList.toggle('hidden');
    overlay.classList.toggle('active');
    
    // Prevent body scroll when panel is open
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }
}

function toggleBlogAdmin() {
  const panel = document.getElementById('blog-admin-panel');
  const overlay = document.querySelector('.blog-admin-overlay');
  
  if (panel && overlay) {
    const isOpen = !panel.classList.contains('hidden');
    
    panel.classList.toggle('hidden');
    overlay.classList.toggle('active');
    
    // Prevent body scroll when panel is open
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }
}

// ===== PERFORMANCE OPTIMIZATION =====
function optimizeForMobile() {
  if (!isMobile()) return;
  
  // Reduce animation complexity
  document.querySelectorAll('.profile-ring, body::before').forEach(el => {
    el.style.animation = 'none';
  });
  
  // Debounce scroll events
  let scrollTimer;
  window.addEventListener('scroll', function() {
    if (scrollTimer) clearTimeout(scrollTimer);
    
    scrollTimer = setTimeout(function() {
      // Handle scroll events here
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, 100);
  }, { passive: true });
}

// ===== INITIALIZE ALL MOBILE FEATURES =====
document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile features
  initMobileMenu();
  setViewportHeight();
  initTouchSwipe();
  initLazyLoading();
  improveAdminPanels();
  optimizeForMobile();
  
  // Handle viewport changes
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', setViewportHeight);
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('href');
      if (target !== '#') {
        smoothScrollTo(target);
      }
    });
  });
});

// ===== PULL TO REFRESH (optional) =====
function initPullToRefresh() {
  let startY = 0;
  let pullDistance = 0;
  const threshold = 100;
  
  document.addEventListener('touchstart', function(e) {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
    }
  }, { passive: true });
  
  document.addEventListener('touchmove', function(e) {
    if (startY === 0) return;
    
    pullDistance = e.touches[0].clientY - startY;
    
    if (pullDistance > 0 && window.scrollY === 0) {
      // Add visual feedback here
      if (pullDistance > threshold) {
        // Show refresh indicator
      }
    }
  }, { passive: true });
  
  document.addEventListener('touchend', function() {
    if (pullDistance > threshold && window.scrollY === 0) {
      // Trigger refresh
      location.reload();
    }
    
    startY = 0;
    pullDistance = 0;
  }, { passive: true });
}