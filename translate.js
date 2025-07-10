// translate.js - Töötav versioon teie vanast koodist

// Tõlkefunktsioon
function translatePage(lang) {
    var googleTranslateElement = new google.translate.TranslateElement({
        pageLanguage: 'et',
        includedLanguages: 'et,en,fi,ru',
        autoDisplay: false
    });
    
    // Vali keel
    var selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
        selectElement.value = lang;
        selectElement.dispatchEvent(new Event('change'));
    }
    
    // Salvesta valitud keel
    localStorage.setItem('selectedLanguage', lang);
    
    // Värskenda nuppe
    updateLanguageButtons(lang);
}

// Värskenda keelenuppe
function updateLanguageButtons(lang) {
    // Desktop nupud
    document.querySelectorAll('#language-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mobile nupud
    document.querySelectorAll('.language-menu-mobile button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Lisa active klass
    const activeBtn = document.querySelector(`#language-buttons button[onclick*="'${lang}'"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    const activeMobileBtn = document.querySelector(`.language-menu-mobile button[onclick*="'${lang}'"]`);
    if (activeMobileBtn) activeMobileBtn.classList.add('active');
}

// Google Translate init
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'et',
        includedLanguages: 'et,en,fi,ru',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
    
    // Kontrolli salvestatud keelt
    setTimeout(() => {
        const savedLang = localStorage.getItem('selectedLanguage') || 'et';
        if (savedLang !== 'et') {
            const selectElement = document.querySelector('.goog-te-combo');
            if (selectElement) {
                selectElement.value = savedLang;
                selectElement.dispatchEvent(new Event('change'));
            }
        }
        updateLanguageButtons(savedLang);
    }, 1000);
}

// Stiilid Google Translate'i peitmiseks
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .goog-logo-link {
            display: none !important;
        }
        
        .goog-te-gadget {
            color: transparent !important;
        }
        
        .goog-te-gadget .goog-te-combo {
            display: none !important;
        }
        
        #google_translate_element {
            display: none !important;
        }
        
        .goog-te-banner-frame {
            display: none !important;
        }
        
        body {
            top: 0 !important;
        }
        
        .skiptranslate {
            display: none !important;
        }
        
        #language-buttons button.active,
        .language-menu-mobile button.active {
            background: rgba(255, 215, 0, 0.3) !important;
            border-color: #FFD700 !important;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5) !important;
        }
    `;
    document.head.appendChild(style);
});