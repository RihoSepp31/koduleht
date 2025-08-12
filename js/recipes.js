// recipes.js - Retseptide dünaamiline laadimise skript

(function() {
    'use strict';

    // API URL - kasutame window objekti seadistust
    const API_URL = window.API_URL || "../api.php";
    
    // Globaalsed muutujad
    let allRecipes = [];
    let filteredRecipes = [];
    
    // DOM elemendid
    let recipesList, searchInput, categoryFilter, activeFilters, adminPanel, openAdminBtn;

    // Initsialiseerime kui DOM on valmis
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, initializing recipes...');
        initializeRecipes();
    });

    function initializeRecipes() {
        // Leiame DOM elemendid
        recipesList = document.getElementById('recipesList');
        searchInput = document.getElementById('searchInput');
        categoryFilter = document.getElementById('categoryFilter');
        activeFilters = document.getElementById('activeFilters');
        adminPanel = document.getElementById('adminPanel');
        openAdminBtn = document.getElementById('openAdmin');

        if (!recipesList) {
            console.error('recipesList element not found!');
            return;
        }

        console.log('DOM elements found, setting up event listeners...');
        
        // Seadistame sündmuste kuularid
        setupEventListeners();
        
        // Laeme retseptid
        loadRecipes();
    }

    function setupEventListeners() {
        // Otsingu ja filtreerimise sündmused
        if (searchInput) {
            searchInput.addEventListener('input', debounce(filterRecipes, 300));
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterRecipes);
        }

        // Admin paneli sündmused
        if (openAdminBtn) {
            console.log('Setting up admin button listener...');
            openAdminBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Admin button clicked!');
                openAdminPanel();
            });
        } else {
            console.error('openAdmin button not found!');
        }

        // Admin paneli sulgemine
        const closeAdminBtn = document.getElementById('closeAdmin');
        if (closeAdminBtn) {
            closeAdminBtn.addEventListener('click', closeAdminPanel);
        }

        // Retsepti salvestamine
        const saveRecipeBtn = document.getElementById('saveRecipe');
        if (saveRecipeBtn) {
            saveRecipeBtn.addEventListener('click', saveRecipe);
        }

        // Admin paneli tausta klõpsuga sulgemine
        if (adminPanel) {
            adminPanel.addEventListener('click', function(e) {
                if (e.target === adminPanel) {
                    closeAdminPanel();
                }
            });
        }

        // ESC klahviga sulgemine
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && adminPanel && adminPanel.style.display !== 'none') {
                closeAdminPanel();
            }
        });
    }

    async function loadRecipes() {
        try {
            console.log('Loading recipes from:', API_URL);
            const response = await fetch(`${API_URL}?action=get`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API response:', data);
            
            if (data.success && data.data && data.data.recipes) {
                allRecipes = data.data.recipes;
                console.log('Loaded recipes:', allRecipes.length);
            } else {
                console.log('No recipes found or invalid response structure');
                allRecipes = [];
            }
            
            filteredRecipes = [...allRecipes];
            renderRecipes();
            
        } catch (error) {
            console.error('Error loading recipes:', error);
            recipesList.innerHTML = `
                <div class="empty">
                    <p>⚠️ Viga retseptide laadimisel</p>
                    <p style="font-size: 0.9em; opacity: 0.7;">${error.message}</p>
                    <button onclick="window.location.reload()" class="btn-modern btn-secondary" style="margin-top: 1rem;">
                        🔄 Proovi uuesti
                    </button>
                </div>
            `;
        }
    }

    function renderRecipes() {
        if (!recipesList) return;

        if (filteredRecipes.length === 0) {
            if (allRecipes.length === 0) {
                recipesList.innerHTML = `
                    <div class="empty">
                        <p>📝 Retsepte pole veel lisatud</p>
                        <p style="font-size: 0.9em; opacity: 0.7;">Lisa esimene retsept "Lisa retsept" nupuga!</p>
                    </div>
                `;
            } else {
                recipesList.innerHTML = `
                    <div class="empty">
                        <p>🔍 Otsingule vastavaid retsepte ei leitud</p>
                        <p style="font-size: 0.9em; opacity: 0.7;">Proovi muuta otsingukriteeriumeid</p>
                    </div>
                `;
            }
            return;
        }

        const html = filteredRecipes.map(recipe => `
            <article class="recipe-card" onclick="openRecipeModal('${recipe.id}')" 
                     tabindex="0" role="button" aria-label="Vaata retsepti: ${escapeHtml(recipe.title)}">
                <img class="recipe-img" 
                     src="${recipe.image || '../pildid/placeholder-recipe.jpg'}" 
                     alt="${escapeHtml(recipe.title)}"
                     loading="lazy"
                     onerror="this.src='../pildid/placeholder-recipe.jpg'">
                <h3>${escapeHtml(recipe.title)}</h3>
                <p class="recipe-intro">${escapeHtml(recipe.intro || '')}</p>
                <div class="recipe-meta">
                    <span>⏱️ ${recipe.time || '?'} min</span>
                    <span>👥 ${recipe.servings || '?'} portsut</span>
                    ${recipe.category ? `<span class="chip">${escapeHtml(recipe.category)}</span>` : ''}
                </div>
                ${recipe.tags ? `<div class="recipe-tags">${recipe.tags.split(',').map(tag => 
                    `<span class="chip">${escapeHtml(tag.trim())}</span>`).join('')}</div>` : ''}
            </article>
        `).join('');

        recipesList.innerHTML = html;
    }

    function filterRecipes() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : '';

        filteredRecipes = allRecipes.filter(recipe => {
            const matchesSearch = !searchTerm || 
                recipe.title.toLowerCase().includes(searchTerm) ||
                (recipe.ingredients && recipe.ingredients.toLowerCase().includes(searchTerm)) ||
                (recipe.tags && recipe.tags.toLowerCase().includes(searchTerm)) ||
                (recipe.intro && recipe.intro.toLowerCase().includes(searchTerm));

            const matchesCategory = !selectedCategory || recipe.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        renderRecipes();
        updateActiveFilters(searchTerm, selectedCategory);
    }

    function updateActiveFilters(searchTerm, category) {
        if (!activeFilters) return;

        const filters = [];
        if (searchTerm) filters.push(`Otsing: "${searchTerm}"`);
        if (category) filters.push(`Kategooria: ${category}`);

        if (filters.length > 0) {
            activeFilters.innerHTML = `
                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                    <span style="font-size: 0.9em; opacity: 0.7;">Aktiivsed filtrid:</span>
                    ${filters.map(filter => `
                        <span class="chip" style="background: rgba(0,255,136,0.1); border-color: var(--accent-primary);">
                            ${filter}
                        </span>
                    `).join('')}
                    <button onclick="clearFilters()" class="btn-modern btn-small" style="padding: 0.2rem 0.5rem; font-size: 0.8em;">
                        ✕ Tühista
                    </button>
                </div>
            `;
        } else {
            activeFilters.innerHTML = '';
        }
    }

    function openAdminPanel() {
        console.log('Opening admin panel...');
        
        if (!adminPanel) {
            console.error('Admin panel not found!');
            return;
        }

        // Tühjendame väljad
        const fields = ['rTitle', 'rIntro', 'rIngredients', 'rSteps', 'rTags', 'rPassword'];
        fields.forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = '';
        });

        // Lähtestame vaikeväärtused
        const servings = document.getElementById('rServings');
        const time = document.getElementById('rTime');
        const category = document.getElementById('rCategory');
        const image = document.getElementById('rImage');

        if (servings) servings.value = '2';
        if (time) time.value = '25';
        if (category) category.value = 'Muu';
        if (image) image.value = '';

        // Näitame paneeli
        adminPanel.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Focusime PAROOLI väljale (mitte pealkirjale)
        const passwordField = document.getElementById('rPassword');
        if (passwordField) {
            setTimeout(() => {
                passwordField.focus();
                passwordField.placeholder = 'Sisesta parool retsepti lisamiseks';
            }, 100);
        }
    }

    // Parooli kontrolli funktsioon
    async function checkAdminPassword(password) {
        try {
            console.log('Making password check request to:', `${API_URL}?action=check_password`);
            console.log('Password being sent (length):', password.length);
            
            const response = await fetch(`${API_URL}?action=check_password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
            }
            
            return data.success && data.valid;
        } catch (error) {
            console.error('Error checking admin password:', error);
            throw error;
        }
    }

    function closeAdminPanel() {
        console.log('Closing admin panel...');
        // Seadistame parooli välja tagasi nähtavaks sulgemise ajal
        const passwordField = document.getElementById('rPassword');
        if (passwordField) {
            passwordField.style.display = '';
            const passwordLabel = passwordField.previousElementSibling;
            if (passwordLabel) passwordLabel.style.display = '';
            passwordField.value = '';
        }
    }

    async function saveRecipe() {
        console.log('Saving recipe...');
        
        // Kogume andmed
        const title = document.getElementById('rTitle')?.value.trim();
        const category = document.getElementById('rCategory')?.value;
        const servings = document.getElementById('rServings')?.value;
        const time = document.getElementById('rTime')?.value;
        const intro = document.getElementById('rIntro')?.value.trim();
        const ingredients = document.getElementById('rIngredients')?.value.trim();
        const steps = document.getElementById('rSteps')?.value.trim();
        const tags = document.getElementById('rTags')?.value.trim();
        const password = document.getElementById('rPassword')?.value;
        const imageFile = document.getElementById('rImage')?.files[0];

        // Valideerime
        if (!title || !ingredients || !steps || !password) {
            alert('Palun täida kõik kohustuslikud väljad!');
            return;
        }

        const saveButton = document.getElementById('saveRecipe');
        if (saveButton) {
            saveButton.textContent = '⏳ Salvestamine...';
            saveButton.disabled = true;
        }

        try {
            let imageUrl = '';

            // Kui on pilt, laeme selle kõigepealt üles
            if (imageFile) {
                console.log('Uploading image...');
                const formData = new FormData();
                formData.append('image', imageFile);
                formData.append('password', password);

                const uploadResponse = await fetch(`${API_URL}?action=upload`, {
                    method: 'POST',
                    body: formData
                });

                const uploadResult = await uploadResponse.json();
                if (uploadResult.success) {
                    imageUrl = uploadResult.url;
                    console.log('Image uploaded:', imageUrl);
                } else {
                    throw new Error(uploadResult.error || 'Pildi üleslaadimine ebaõnnestus');
                }
            }

            // Loome retsepti objekti
            const recipe = {
                id: Date.now().toString(),
                title,
                category,
                servings: parseInt(servings) || 2,
                time: parseInt(time) || 25,
                intro,
                ingredients,
                steps,
                tags,
                image: imageUrl,
                created: new Date().toISOString()
            };

            // Laeme praegused retseptid
            const currentData = await fetch(`${API_URL}?action=get`).then(r => r.json());
            const recipes = currentData.success && currentData.data?.recipes ? currentData.data.recipes : [];
            
            // Lisame uue retsepti
            recipes.push(recipe);

            // Salvestame
            const saveResponse = await fetch(`${API_URL}?action=save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password,
                    recipes
                })
            });

            const saveResult = await saveResponse.json();
            
            if (saveResult.success) {
                console.log('Recipe saved successfully!');
                alert('✅ Retsept edukalt lisatud!');
                closeAdminPanel();
                loadRecipes(); // Värskendame nimekirja
            } else {
                throw new Error(saveResult.error || 'Salvestamine ebaõnnestus');
            }

        } catch (error) {
            console.error('Error saving recipe:', error);
            alert(`❌ Viga: ${error.message}`);
        } finally {
            if (saveButton) {
                saveButton.textContent = '💾 Salvesta';
                saveButton.disabled = false;
            }
        }
    }

    // Avalikud funktsioonid
    window.clearFilters = function() {
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        filterRecipes();
    };

    window.openRecipeModal = function(recipeId) {
        const recipe = allRecipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;padding:1rem;z-index:10000;overflow-y:auto;';
        modal.innerHTML = `
            <div style="background:#0e0e0f;border:1px solid rgba(255,255,255,0.08);border-radius:1rem;max-width:800px;width:100%;max-height:90vh;overflow-y:auto;position:relative;">
                <button onclick="this.parentElement.parentElement.remove();document.body.style.overflow=''" 
                        style="position:absolute;top:1rem;right:1rem;background:rgba(255,255,255,0.1);border:none;color:#fff;width:2rem;height:2rem;border-radius:50%;cursor:pointer;font-size:1.2rem;">×</button>
                <div style="padding:2rem;">
                    ${recipe.image ? `<img src="${recipe.image}" alt="${escapeHtml(recipe.title)}" style="width:100%;height:300px;object-fit:cover;border-radius:0.8rem;margin-bottom:1rem;">` : ''}
                    <h2>${escapeHtml(recipe.title)}</h2>
                    <div style="display:flex;gap:1rem;margin:1rem 0;flex-wrap:wrap;">
                        <span>⏱️ ${recipe.time} min</span>
                        <span>👥 ${recipe.servings} portsut</span>
                        ${recipe.category ? `<span class="chip">${escapeHtml(recipe.category)}</span>` : ''}
                    </div>
                    ${recipe.intro ? `<p style="margin:1rem 0;opacity:0.8;">${escapeHtml(recipe.intro)}</p>` : ''}
                    
                    <h3>Koostisosad:</h3>
                    <ul style="margin:0.5rem 0 1.5rem 1rem;">
                        ${recipe.ingredients.split('\n').filter(i => i.trim()).map(ingredient => 
                            `<li style="margin:0.3rem 0;">${escapeHtml(ingredient)}</li>`
                        ).join('')}
                    </ul>
                    
                    <h3>Valmistamine:</h3>
                    <ol style="margin:0.5rem 0 1rem 1rem;">
                        ${recipe.steps.split('\n').filter(s => s.trim()).map((step, index) => 
                            `<li style="margin:0.5rem 0;">${escapeHtml(step)}</li>`
                        ).join('')}
                    </ol>
                    
                    ${recipe.tags ? `
                        <div style="margin-top:1.5rem;">
                            <h4>Sildid:</h4>
                            <div>${recipe.tags.split(',').map(tag => 
                                `<span class="chip">${escapeHtml(tag.trim())}</span>`
                            ).join('')}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Sulgemise sündmus taustale klõpsates
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
    };

    // Utiliidid
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

})();