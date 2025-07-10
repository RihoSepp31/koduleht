// js/navigation.js
console.log('🧭 Navigation JS loaded');

// Navigatsiooni initsialiseerimine
function initializeNavigation() {
  setupMobileMenu();
  setupKeyboardNavigation();
}

// Mobiilimenüü
function setupMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navLinksItems = document.querySelectorAll('.nav-links a');

  if (!navToggle || !navLinks) return;

  // Toggle hamburger
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close on link click
  navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Close on outside click
  document.addEventListener('click', (event) => {
    const isClickInside = navToggle.contains(event.target) || navLinks.contains(event.target);
    if (!isClickInside && navLinks.classList.contains('active')) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });
}

// Klaviatuur navigeerimine
function setupKeyboardNavigation() {
  const navLinks = document.querySelector('.nav-links');
  
  if (!navLinks) return;
  
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('active')) {
      const navToggle = document.querySelector('.nav-toggle');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
      navToggle.focus();
    }
  });
}

// Automaatne käivitamine
document.addEventListener('DOMContentLoaded', initializeNavigation);