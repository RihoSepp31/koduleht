// translate.js - Parandatud versioon, mis võimaldab tagasi eesti keelde minna

// Tõlkefunktsioon
function translatePage(lang) {
    console.log('Translating to:', lang);
    
    // Kui valitakse eesti keel, eemalda kõik tõlked
    if (lang === 'et') {
        // Eemalda Google Translate cookie
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + location.hostname;
        
        // Salvesta valik
        localStorage.setItem('selectedLanguage', 'et');
        
        // Värskenda lehte ilma tõlketa
        window.location.href = window.location.pathname + window.location.search;
        return;
    }
    
    // Teiste keelte jaoks kasuta Google Translate
    // Seadista cookie
    document.cookie = `googtrans=/et/${lang}; path=/;`;
    document.cookie = `googtrans=/et/${lang}; path=/; domain=${location.hostname}`;
    
    // Salvesta valitud keel
    localStorage.setItem('selectedLanguage', lang);
    
    // Värskenda nuppe
    updateLanguageButtons(lang);
    
    // Värskenda leht
    location.reload();
}

// Kontrolli ja eemalda vana tõlge kui eesti keel valitud
function checkAndResetLanguage() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'et';
    const googtransCookie = getCookie('googtrans');
    
    console.log('Saved language:', savedLang);
    console.log('Google Translate cookie:', googtransCookie);
    
    // Kui salvestatud keel on eesti, aga cookie näitab tõlget
    if (savedLang === 'et' && googtransCookie) {
        // Eemalda cookie
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
        // Värskenda ilma parameetriteta
        if (window.location.hash || window.location.search.includes('_x_tr_')) {
            window.location.href = window.location.pathname;
        }
    }
}

// Hangi cookie väärtus
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Värskenda keelenuppe
function updateLanguageButtons(lang) {
    // Desktop nupud
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${lang}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Mobile nupud
    document.querySelectorAll('.lang-btn-mobile').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${lang}'`)) {
            btn.classList.add('active');
        }
    });
}

// Google Translate init
function googleTranslateElementInit() {
    console.log('Initializing Google Translate...');
    
    new google.translate.TranslateElement({
        pageLanguage: 'et',
        includedLanguages: 'et,en,fi,ru',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded...');
    
    // Kontrolli keelt
    checkAndResetLanguage();
    
    // Hangi salvestatud keel
    const savedLang = localStorage.getItem('selectedLanguage') || 'et';
    
    // Värskenda nuppude olekud
    updateLanguageButtons(savedLang);
    
    // Lisa stiilid
    const style = document.createElement('style');
    style.textContent = `
        /* Peida Google Translate elemendid */
        .goog-te-banner-frame,
        #google_translate_element,
        .goog-logo-link,
        .goog-te-gadget,
        .skiptranslate,
        iframe[name="google_translate_frame"] {
            display: none !important;
        }
        
        .goog-te-gadget {
            color: transparent !important;
            font-size: 0 !important;
        }
        
        /* Fix body position */
        body {
            top: 0 !important;
            position: relative !important;
            margin-top: 0 !important;
        }
        
        /* Active button styles */
        .lang-btn.active,
        .lang-btn-mobile.active {
            background: rgba(255, 215, 0, 0.3) !important;
            border-color: #FFD700 !important;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5) !important;
            color: #FFD700 !important;
            font-weight: 600 !important;
        }
        
        /* Hide Google Translate toolbar */
        .goog-te-banner-frame.skiptranslate,
        #goog-gt-tt,
        .goog-tooltip,
        .goog-tooltip:hover,
        .goog-text-highlight {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
        
        /* Remove Google Translate styling */
        .goog-text-highlight {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }
        
        body.translated-ltr,
        body.translated-rtl {
            top: 0 !important;
            margin-top: 0 !important;
        }
    `;
    document.head.appendChild(style);
    
    // Debug info
    console.log('Language buttons found:', document.querySelectorAll('.lang-btn').length);
    console.log('Mobile language buttons found:', document.querySelectorAll('.lang-btn-mobile').length);
});

// Lisa globaalne funktsioon eesti keelde tagasi minemiseks
window.resetToEstonian = function() {
    // Eemalda kõik Google Translate seaded
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.setItem('selectedLanguage', 'et');
    
    // Mine algse URL-i peale
    const cleanUrl = window.location.pathname + (window.location.search.split('&_x_tr_')[0] || '');
    window.location.href = cleanUrl;
};

// Ekspordi funktsioonid
window.translatePage = translatePage;
window.googleTranslateElementInit = googleTranslateElementInit;

