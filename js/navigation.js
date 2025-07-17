// LISA SEE KOOD OMA index.html FAILI <head> SEKTSIOONI VÕI ERALDI JS FAILI

// ===== MOBILE MENU FIX =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍔 Hamburger menu script loading...');
    
    // Leia elementi
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');
    
    // Debug - kontrolli kas elemendid on olemas
    if (navToggle) {
        console.log('✅ Hamburger nupp leitud!');
    } else {
        console.log('❌ Hamburger nuppu EI LEITUD!');
        return;
    }
    
    if (navLinks) {
        console.log('✅ Nav links leitud!');
    } else {
        console.log('❌ Nav links EI LEITUD!');
        return;
    }
    
    // PEAMINE CLICK EVENT
    navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🍔 Hamburger clicked!');
        
        // Toggle menüü
        const isOpen = navLinks.classList.contains('active');
        
        if (isOpen) {
            // Sulge menüü
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            console.log('📴 Menu closed');
        } else {
            // Ava menüü
            navLinks.classList.add('active');
            navToggle.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden'; // Prevent body scroll
            console.log('📱 Menu opened');
        }
    });
    
    // Sulge menüü kui vajutad linkile
    navLinksItems.forEach(link => {
        link.addEventListener('click', function() {
            console.log('🔗 Nav link clicked - closing menu');
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
    
    // Sulge menüü kui vajutad väljapoole
    document.addEventListener('click', function(e) {
        const isClickInside = navToggle.contains(e.target) || navLinks.contains(e.target);
        
        if (!isClickInside && navLinks.classList.contains('active')) {
            console.log('👆 Clicked outside - closing menu');
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
    
    // Sulge menüü ESC klahviga
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            console.log('⌨️ ESC pressed - closing menu');
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            navToggle.focus();
        }
    });
    
    console.log('🎉 Hamburger menu script loaded successfully!');
});

// ===== SHOW/HIDE HAMBURGER BASED ON SCREEN SIZE =====
function updateNavVisibility() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (window.innerWidth > 768) {
        // Desktop - peida hamburger, näita menüüd
        if (navToggle) navToggle.style.display = 'none';
        if (navLinks) {
            navLinks.classList.remove('active');
            navLinks.style.display = 'flex';
        }
        document.body.style.overflow = '';
    } else {
        // Mobile - näita hamburger, peida menüüd
        if (navToggle) navToggle.style.display = 'flex';
        if (navLinks) {
            navLinks.classList.remove('active');
            navLinks.style.display = 'none'; // Peidetud kuni avatakse
        }
    }
}

// Käivita kohe ja window resize'il
window.addEventListener('load', updateNavVisibility);
window.addEventListener('resize', updateNavVisibility);