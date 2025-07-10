// admin.js - Täielik parandatud blog + teated süsteem
console.log("🚀 Täielik admin süsteem käivitub...");

// Globaalsed muutujad
let APP_DATA = {
    teated: [],
    blog_posts: []
};

let CONFIG = {
    isAuthenticated: false,
    currentPassword: '',
    visibleUpdates: 3,
    uploadingImage: false
};

// API funktsioonid
const API = {
    async loadData() {
        try {
            console.log("📡 Laen andmeid...");
            const response = await fetch('api.php?action=get');
            const result = await response.json();
            
            if (result.success) {
                APP_DATA = result.data || { teated: [], blog_posts: [] };
                console.log("✅ Andmed laetud:", APP_DATA);
                return true;
            }
            throw new Error(result.error || 'Laadimine ebaõnnestus');
        } catch (error) {
            console.error("❌ Viga laadimisel:", error);
            showError("Andmete laadimine ebaõnnestus: " + error.message);
            return false;
        }
    },
    
    async saveData(type, data) {
        if (!CONFIG.isAuthenticated) return false;
        
        try {
            console.log("💾 Salvestan andmeid...", type);
            const payload = {
                password: CONFIG.currentPassword,
                [type]: data
            };
            
            const response = await fetch('api.php?action=save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess("Salvestatud!");
                return true;
            }
            throw new Error(result.error || 'Salvestamine ebaõnnestus');
        } catch (error) {
            console.error("❌ Salvestamise viga:", error);
            showError("Salvestamine ebaõnnestus: " + error.message);
            return false;
        }
    },

    async uploadImage(file) {
        if (!CONFIG.isAuthenticated) return null;
        
        console.log("📤 Alustan pildi üleslaadimist...", {
            name: file.name,
            size: file.size,
            type: file.type
        });
        
        const formData = new FormData();
        formData.append('image', file);
        formData.append('password', CONFIG.currentPassword);
        
        try {
            CONFIG.uploadingImage = true;
            updateImageUploadStatus("📤 Laen pilti üles...");
            
            const response = await fetch('api.php?action=upload', {
                method: 'POST',
                body: formData
            });
            
            console.log("📡 Upload vastus:", response.status, response.statusText);
            
            const result = await response.json();
            console.log("📋 Upload tulemus:", result);
            
            if (result.success) {
                updateImageUploadStatus("✅ Pilt üles laetud!");
                setTimeout(() => updateImageUploadStatus(""), 3000);
                return result.url;
            }
            throw new Error(result.error || 'Pildi üleslaadimine ebaõnnestus');
        } catch (error) {
            console.error("❌ Pildi üleslaadimise viga:", error);
            updateImageUploadStatus("❌ Viga: " + error.message);
            setTimeout(() => updateImageUploadStatus(""), 5000);
            return null;
        } finally {
            CONFIG.uploadingImage = false;
        }
    }
};

// UI funktsioonid
function showError(message) {
    console.error("🚨 Error:", message);
    const toast = createToast(message, 'error');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function showSuccess(message) {
    console.log("✅ Success:", message);
    const toast = createToast(message, 'success');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        padding: 15px 25px; border-radius: 8px; font-weight: 500;
        background: ${type === 'error' ? '#f44336' : '#4caf50'};
        color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease; max-width: 300px;
        word-wrap: break-word;
    `;
    toast.textContent = message;
    return toast;
}

function updateImageUploadStatus(message) {
    let statusEl = document.getElementById('image-upload-status');
    
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'image-upload-status';
        statusEl.style.cssText = `
            color: #00ff88; margin-top: 5px; font-size: 14px; 
            text-align: center; display: none; font-weight: bold;
        `;
        
        const imageContainer = document.querySelector('.image-upload-container');
        if (imageContainer) {
            imageContainer.appendChild(statusEl);
        }
    }
    
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.style.display = message ? 'block' : 'none';
        
        if (message.includes('✅')) {
            statusEl.style.color = '#4caf50';
        } else if (message.includes('❌')) {
            statusEl.style.color = '#f44336';
        } else {
            statusEl.style.color = '#00ff88';
        }
    }
}

// Autentimine
async function authenticate() {
    if (CONFIG.isAuthenticated) return true;
    
    const password = await safePasswordPrompt();
    if (!password) return false;
    
    if (password === 'Roheline.Tundrea.2025!') {
        CONFIG.isAuthenticated = true;
        CONFIG.currentPassword = password;
        console.log("✅ Autentimine õnnestus");
        return true;
    } else {
        showError("Vale parool!");
        return false;
    }
}

function safePasswordPrompt() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'password-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 10000; display: flex;
            align-items: center; justify-content: center; animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div class="password-dialog" style="
                background: #1a1a1a; padding: 40px; border-radius: 12px; 
                text-align: center; min-width: 350px; border: 2px solid #00ff88;
                box-shadow: 0 8px 32px rgba(0,255,136,0.3);
            ">
                <h3 style="color: #00ff88; margin: 0 0 20px 0; font-size: 24px;">
                    🔐 Admin autentimine
                </h3>
                <input type="password" id="pass-input" placeholder="Sisesta parool" 
                       style="width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #333; 
                              border-radius: 6px; background: #222; color: white; font-size: 16px;
                              transition: border-color 0.3s;">
                <div style="margin-top: 20px;">
                    <button id="pass-ok" style="
                        background: #00ff88; color: black; padding: 12px 30px; 
                        border: none; border-radius: 6px; margin: 5px; cursor: pointer;
                        font-weight: bold; font-size: 16px; transition: all 0.3s;
                    ">Sisene</button>
                    <button id="pass-cancel" style="
                        background: #444; color: white; padding: 12px 30px; 
                        border: none; border-radius: 6px; margin: 5px; cursor: pointer;
                        font-weight: bold; font-size: 16px; transition: all 0.3s;
                    ">Tühista</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = document.getElementById('pass-input');
        const okBtn = document.getElementById('pass-ok');
        const cancelBtn = document.getElementById('pass-cancel');
        
        input.focus();
        
        const cleanup = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        };
        
        okBtn.onclick = () => {
            const password = input.value;
            cleanup();
            resolve(password);
        };
        
        cancelBtn.onclick = () => {
            cleanup();
            resolve(null);
        };
        
        input.onkeypress = (e) => {
            if (e.key === 'Enter') okBtn.click();
            if (e.key === 'Escape') cancelBtn.click();
        };
    });
}

// Pildi üleslaadimise funktsioon
async function handleImageUpload(input) {
    console.log("🖼️ Pildi üleslaadimise kutsutud");
    
    if (!input.files || !input.files[0]) {
        console.log("❌ Pilti ei valitud");
        return;
    }
    
    const file = input.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    console.log("📁 Valitud fail:", {
        name: file.name,
        size: file.size,
        type: file.type
    });
    
    if (file.size > maxSize) {
        showError("Pilt on liiga suur! Maksimaalne suurus: 5MB");
        input.value = '';
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showError("Palun vali pildi fail (JPG, PNG, GIF, WebP)");
        input.value = '';
        return;
    }
    
    if (!(await authenticate())) {
        input.value = '';
        return;
    }
    
    const url = await API.uploadImage(file);
    if (url) {
        console.log("🎉 Pilt üles laetud:", url);
        
        // Määra, millise paneeliga on tegemist
        const blogImageUrl = document.getElementById('blog-image-url');
        const updateContent = document.getElementById('update-content');
        
        if (blogImageUrl && input.id === 'blog-image-file') {
            // Blog panel - lisa URL väljale
            blogImageUrl.value = url;
            showImagePreview(url, 'blog');
            showSuccess("Pilt lisatud blog postitusele!");
        } else if (updateContent) {
            // Teadete panel - lisa Markdown sisule
            const currentContent = updateContent.value;
            const imageMarkdown = `\n\n![Pilt](${url})\n\n`;
            updateContent.value = currentContent + imageMarkdown;
            showImagePreview(url, 'update');
            showSuccess("Pilt lisatud teatele!");
        }
    }
    
    input.value = '';
}

function showImagePreview(url, type = 'blog') {
    const previewId = type === 'blog' ? 'blog-image-preview' : 'update-image-preview';
    let preview = document.getElementById(previewId);
    
    if (!preview) {
        preview = document.createElement('div');
        preview.id = previewId;
        preview.style.cssText = `
            margin-top: 15px;
            text-align: center;
            border: 2px dashed #00ff88;
            border-radius: 8px;
            padding: 15px;
            background: rgba(0, 255, 136, 0.1);
        `;
        
        const imageContainer = document.querySelector('.image-upload-container');
        if (imageContainer) {
            imageContainer.appendChild(preview);
        }
    }
    
    preview.innerHTML = `
        <img src="${url}" alt="Pildi eelvaade" style="
            max-width: 250px; 
            max-height: 150px; 
            border-radius: 6px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        ">
        <p style="margin: 10px 0 5px 0; color: #00ff88; font-size: 14px; font-weight: bold;">
            ✅ Pilt valmis kasutamiseks
        </p>
        <button onclick="removeImagePreview('${previewId}')" style="
            background: #f44336; color: white; border: none; 
            padding: 6px 12px; border-radius: 4px; cursor: pointer;
            font-size: 12px; margin-top: 5px;
        ">🗑️ Eemalda</button>
    `;
}

function removeImagePreview(previewId = 'blog-image-preview') {
    const preview = document.getElementById(previewId);
    
    if (previewId === 'blog-image-preview') {
        const urlInput = document.getElementById('blog-image-url');
        if (urlInput) urlInput.value = '';
    }
    
    if (preview) preview.remove();
    showSuccess("Pildi eelvaade eemaldatud");
}

// TEADETE ADMIN FUNKTSIOONID
async function toggleAdminMode() {
    console.log("🔧 Lülitan teadete admin režiimi");
    
    if (!(await authenticate())) return;
    
    const panel = document.getElementById('admin-panel');
    if (!panel) {
        console.error("Admin panel ei leitud!");
        return;
    }
    
    panel.classList.toggle('hidden');
    
    if (!panel.classList.contains('hidden')) {
        setTimeout(() => {
            addImageFieldToAdminPanel();
            const firstInput = panel.querySelector('input[type="text"], textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function addImageFieldToAdminPanel() {
    if (document.getElementById('admin-image-upload')) return;
    
    const contentEl = document.getElementById('update-content');
    if (!contentEl) return;
    
    const imageSection = document.createElement('div');
    imageSection.id = 'admin-image-upload';
    imageSection.className = 'image-upload-container';
    imageSection.style.cssText = 'margin-bottom: 15px;';
    
    imageSection.innerHTML = `
        <label style="display: block; color: white; margin-bottom: 5px; font-weight: bold;">
            📷 Lisa pilt (valikuline):
        </label>
        
        <input type="file" id="admin-image-file" accept="image/*" onchange="handleImageUpload(this)" style="
            width: 100%; padding: 15px; border: 2px dashed #00ff88; 
            border-radius: 6px; background: rgba(0, 255, 136, 0.1); 
            color: white; font-size: 14px; cursor: pointer;
            transition: all 0.3s ease; box-sizing: border-box;
        ">
        
        <div style="margin-top: 5px; font-size: 12px; color: #ccc; text-align: center;">
            JPG, PNG, GIF, WebP (max 5MB) - pilt lisatakse automaatselt sisule
        </div>
    `;
    
    const contentContainer = contentEl.parentElement;
    contentContainer.parentElement.insertBefore(imageSection, contentContainer);
    
    console.log("✅ Pildi väli lisatud teadete admin paneeli!");
}

async function addUpdate() {
    console.log("📝 Lisan uue teate");
    
    if (!(await authenticate())) return;
    
    const typeElement = document.getElementById('update-type');
    const titleElement = document.getElementById('update-title');
    const contentElement = document.getElementById('update-content');
    
    if (!typeElement || !titleElement || !contentElement) {
        showError("Vajalikud elemendid puuduvad!");
        return;
    }
    
    const updateType = typeElement.value;
    const title = titleElement.value.trim();
    const content = contentElement.value.trim();
    
    if (!title || !content) {
        showError("Täida vähemalt pealkiri ja sisu!");
        return;
    }
    
    const newUpdate = {
        id: Date.now(),
        type: updateType,
        title,
        content,
        date: new Date().toLocaleDateString('et-EE'),
        priority: 5
    };
    
    APP_DATA.teated.unshift(newUpdate);
    
    if (await API.saveData('teated', APP_DATA.teated)) {
        titleElement.value = "";
        contentElement.value = "";
        
        const preview = document.getElementById('update-image-preview');
        if (preview) preview.remove();
        
        displayUpdates();
        toggleAdminMode();
    }
}

// BLOG ADMIN FUNKTSIOONID
async function toggleBlogAdmin() {
    console.log("📝 Lülitan blog admin režiimi");
    
    if (!(await authenticate())) return;
    
    let panel = document.getElementById('blog-admin-panel');
    
    if (!panel) {
        console.log("📝 Loon blog admin paneeli");
        panel = createBlogAdminPanel();
        
        // Lisa õigesse kohta
        const blogSection = document.getElementById('blog-section') || document.querySelector('.blog-section');
        if (blogSection) {
            const blogContainer = blogSection.querySelector('.blog-container');
            if (blogContainer) {
                const blogHeader = blogContainer.querySelector('.blog-header');
                if (blogHeader) {
                    blogHeader.insertAdjacentElement('afterend', panel);
                } else {
                    blogContainer.insertBefore(panel, blogContainer.firstChild);
                }
            } else {
                blogSection.appendChild(panel);
            }
        }
    }
    
    panel.classList.toggle('hidden');
    
    if (!panel.classList.contains('hidden')) {
        setTimeout(() => {
            const firstInput = panel.querySelector('input[type="text"], textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function createBlogAdminPanel() {
    const panel = document.createElement('div');
    panel.id = 'blog-admin-panel';
    panel.className = 'blog-admin-panel hidden';
    panel.style.cssText = `
        background: #2a2a2a;
        border: 2px solid #00ff88;
        border-radius: 12px;
        padding: 25px;
        margin: 20px 0;
        box-shadow: 0 8px 24px rgba(0, 255, 136, 0.2);
    `;
    
    panel.innerHTML = `
        <h3 style="color: #00ff88; margin: 0 0 20px 0; font-size: 20px;">
            ✏️ Lisa uus blog postitus
        </h3>
        <div class="blog-admin-form">
            <div style="margin-bottom: 15px;">
                <label for="blog-category" style="display: block; color: #00ff88; margin-bottom: 5px; font-weight: bold;">
                    Kategooria:
                </label>
                <select id="blog-category" style="
                    width: 100%; padding: 12px; border: 2px solid #555; 
                    border-radius: 6px; background: #1a1a1a; color: white; font-size: 16px;
                ">
                    <option value="IT">💻 IT</option>
                    <option value="Õppimine">📚 Õppimine</option>
                    <option value="Mõtted">💭 Mõtted</option>
                    <option value="Uudised">📰 Uudised</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label for="blog-title" style="display: block; color: #00ff88; margin-bottom: 5px; font-weight: bold;">
                    Pealkiri:
                </label>
                <input type="text" id="blog-title" placeholder="Sisesta blogi pealkiri" style="
                    width: 100%; padding: 12px; border: 2px solid #555; 
                    border-radius: 6px; background: #1a1a1a; color: white; font-size: 16px;
                ">
            </div>
            
            <div class="image-upload-container" style="margin-bottom: 15px;">
                <label style="display: block; color: #00ff88; margin-bottom: 5px; font-weight: bold;">
                    📷 Pilt (valikuline):
                </label>
                
                <input type="text" id="blog-image-url" placeholder="Pildi URL (genereeritakse automaatselt)" readonly style="
                    width: 100%; padding: 12px; border: 2px solid #555; 
                    border-radius: 6px; background: #333; color: #ccc; font-size: 16px;
                    margin-bottom: 10px;
                ">
                
                <input type="file" id="blog-image-file" accept="image/*" onchange="handleImageUpload(this)" style="
                    width: 100%; padding: 15px; border: 2px dashed #00ff88; 
                    border-radius: 6px; background: rgba(0, 255, 136, 0.1); 
                    color: white; font-size: 14px; cursor: pointer;
                    transition: all 0.3s ease;
                ">
                
                <div style="margin-top: 10px; font-size: 12px; color: #666; text-align: center;">
                    Toetatud vormingud: JPG, PNG, GIF, WebP (max 5MB)
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label for="blog-content" style="display: block; color: #00ff88; margin-bottom: 5px; font-weight: bold;">
                    Sisu:
                </label>
                <textarea id="blog-content" placeholder="Kirjuta oma mõtted siia...&#10;&#10;Kasuta järgmisi vormindusi:&#10;**bold tekst**&#10;*kaldkiri*&#10;[link](https://example.com)" rows="6" style="
                    width: 100%; padding: 12px; border: 2px solid #555; 
                    border-radius: 6px; background: #1a1a1a; color: white; 
                    font-size: 16px; resize: vertical; min-height: 120px;
                "></textarea>
            </div>
            
            <div class="blog-admin-buttons" style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="addBlogPost()" type="button" style="
                    background: #00ff88; color: black; padding: 12px 25px; 
                    border: none; border-radius: 6px; cursor: pointer; 
                    font-weight: bold; font-size: 16px; transition: all 0.3s;
                ">📝 Avalda</button>
                <button onclick="toggleBlogAdmin()" type="button" style="
                    background: #444; color: white; padding: 12px 25px; 
                    border: none; border-radius: 6px; cursor: pointer; 
                    font-weight: bold; font-size: 16px; transition: all 0.3s;
                ">❌ Sulge</button>
            </div>
        </div>
    `;
    
    return panel;
}

async function addBlogPost() {
    console.log("📰 Lisan uue blog postituse");
    
    if (!(await authenticate())) return;
    
    const categoryElement = document.getElementById('blog-category');
    const titleElement = document.getElementById('blog-title');
    const contentElement = document.getElementById('blog-content');
    const imageUrlElement = document.getElementById('blog-image-url');
    
    if (!categoryElement || !titleElement || !contentElement) {
        showError("Vajalikud elemendid puuduvad!");
        return;
    }
    
    const category = categoryElement.value;
    const title = titleElement.value.trim();
    const content = contentElement.value.trim();
    const imageUrl = imageUrlElement ? imageUrlElement.value.trim() : '';
    
    if (!title || !content) {
        showError("Pealkiri ja sisu on kohustuslikud!");
        return;
    }
    
    const newPost = {
        id: Date.now(),
        title,
        content,
        category,
        image: imageUrl,
        date: new Date().toISOString(),
        author: 'Admin',
        views: 0
    };
    
    APP_DATA.blog_posts.unshift(newPost);
    
    if (await API.saveData('blog_posts', APP_DATA.blog_posts)) {
        titleElement.value = "";
        contentElement.value = "";
        if (imageUrlElement) imageUrlElement.value = "";
        
        const preview = document.getElementById('blog-image-preview');
        if (preview) preview.remove();
        
        displayBlogPosts();
        toggleBlogAdmin();
    }
}

// KUVAMISE FUNKTSIOONID
function displayUpdates() {
    const container = document.getElementById('updates-list');
    if (!container) return;
    
    const updates = APP_DATA.teated || [];
    
    if (updates.length === 0) {
        container.innerHTML = '<div class="no-updates">Teateid pole veel.</div>';
        return;
    }
    
    const visible = updates.slice(0, CONFIG.visibleUpdates);
    container.innerHTML = visible.map(update => createUpdateCard(update)).join('');
    
    const showMoreBtn = document.getElementById('show-more-btn');
    if (showMoreBtn) {
        if (updates.length > CONFIG.visibleUpdates) {
            showMoreBtn.classList.remove('hidden');
            showMoreBtn.textContent = `Näita rohkem teateid (${updates.length - CONFIG.visibleUpdates} jäänud) 📰`;
        } else {
            showMoreBtn.classList.add('hidden');
        }
    }
}

function displayBlogPosts() {
    const container = document.getElementById('blog-posts-container');
    if (!container) return;
    
    const posts = APP_DATA.blog_posts || [];
    
    if (posts.length === 0) {
        container.innerHTML = '<div class="no-blog-content">Blog postitusi pole veel.</div>';
        return;
    }
    
    container.innerHTML = posts.map(post => createBlogCard(post)).join('');
}

function showMoreUpdates() {
    CONFIG.visibleUpdates += 3;
    displayUpdates();
}

function createUpdateCard(item) {
    let processedContent = formatContent(item.content);
    
    return `
        <div class="update-card ${item.type}">
            <div class="update-header">
                <div class="update-meta">
                    <span class="update-type">
                        ${getTypeEmoji(item.type)} ${getTypeName(item.type)}
                    </span>
                    <span class="update-date">${item.date}</span>
                </div>
                ${CONFIG.isAuthenticated ? `
                    <div class="admin-actions">
                        <button onclick="editUpdate(${item.id})" class="btn-edit">
                            ✏️ Muuda
                        </button>
                        <button onclick="deleteUpdate(${item.id})" class="btn-delete">
                            🗑️ Kustuta
                        </button>
                    </div>
                ` : ''}
            </div>
            <h3 class="update-title">${escapeHtml(item.title)}</h3>
            <div class="update-content">${processedContent}</div>
        </div>
    `;
}

function createBlogCard(item) {
    return `
        <div class="blog-post">
            ${item.image ? `
                <div class="blog-image" style="margin-bottom: 15px; text-align: center;">
                    <img src="${item.image}" alt="${escapeHtml(item.title)}" style="
                        max-width: 100%; height: auto; border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    " loading="lazy">
                </div>
            ` : ''}
            <div class="blog-header">
                <div class="blog-meta">
                    <span class="blog-category">${item.category || 'Üldine'}</span>
                    <span class="blog-date">${formatDate(item.date)}</span>
                </div>
                ${CONFIG.isAuthenticated ? `
                    <div class="admin-actions">
                        <button onclick="editBlogPost(${item.id})" class="btn-edit">
                            ✏️ Muuda
                        </button>
                        <button onclick="deleteBlogPost(${item.id})" class="btn-delete">
                            🗑️ Kustuta
                        </button>
                    </div>
                ` : ''}
            </div>
            <h3 class="blog-title">${escapeHtml(item.title)}</h3>
            <div class="blog-content">${formatContent(item.content)}</div>
        </div>
    `;
}

// MUUTMISE JA KUSTUTAMISE FUNKTSIOONID

// Teadete muutmine/kustutamine
async function editUpdate(id) {
    if (!(await authenticate())) return;
    
    const item = APP_DATA.teated.find(i => i.id === id);
    if (!item) {
        showError("Teadet ei leitud!");
        return;
    }
    
    const panel = document.getElementById('admin-panel');
    if (panel && panel.classList.contains('hidden')) {
        toggleAdminMode();
    }
    
    setTimeout(() => {
        document.getElementById('update-type').value = item.type;
        document.getElementById('update-title').value = item.title;
        document.getElementById('update-content').value = item.content;
        
        APP_DATA.teated = APP_DATA.teated.filter(i => i.id !== id);
        showSuccess("Teade laetud muutmiseks!");
    }, 100);
}

async function deleteUpdate(id) {
    if (!(await authenticate())) return;
    
    const item = APP_DATA.teated.find(i => i.id === id);
    if (!item || !confirm(`Kustuta teade "${item.title}"?`)) return;
    
    APP_DATA.teated = APP_DATA.teated.filter(i => i.id !== id);
    if (await API.saveData('teated', APP_DATA.teated)) {
        displayUpdates();
    }
}

// Blog postituste muutmine/kustutamine
async function editBlogPost(id) {
    if (!(await authenticate())) return;
    
    const item = APP_DATA.blog_posts.find(i => i.id === id);
    if (!item) {
        showError("Postitust ei leitud!");
        return;
    }
    
    // Ava blog admin paneel
    const panel = document.getElementById('blog-admin-panel');
    if (!panel || panel.classList.contains('hidden')) {
        await toggleBlogAdmin();
    }
    
    setTimeout(() => {
        document.getElementById('blog-category').value = item.category || 'IT';
        document.getElementById('blog-title').value = item.title;
        document.getElementById('blog-content').value = item.content;
        
        const imageUrlElement = document.getElementById('blog-image-url');
        if (imageUrlElement && item.image) {
            imageUrlElement.value = item.image;
            showImagePreview(item.image, 'blog');
        }
        
        APP_DATA.blog_posts = APP_DATA.blog_posts.filter(i => i.id !== id);
        showSuccess("Postitus laetud muutmiseks!");
    }, 200);
}

async function deleteBlogPost(id) {
    if (!(await authenticate())) return;
    
    const item = APP_DATA.blog_posts.find(i => i.id === id);
    if (!item || !confirm(`Kustuta postitus "${item.title}"?`)) return;
    
    APP_DATA.blog_posts = APP_DATA.blog_posts.filter(i => i.id !== id);
    if (await API.saveData('blog_posts', APP_DATA.blog_posts)) {
        displayBlogPosts();
    }
}

// ABIFUNKTSIOONID
function getTypeEmoji(type) {
    const emojis = {
        'info': 'ℹ️',
        'success': '✅', 
        'project': '🚀',
        'learning': '📚',
        'warning': '⚠️'
    };
    return emojis[type] || 'ℹ️';
}

function getTypeName(type) {
    const names = {
        'info': 'Info',
        'success': 'Uudis',
        'project': 'Projekt', 
        'learning': 'Õppimine',
        'warning': 'Tähtis'
    };
    return names[type] || 'Info';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('et-EE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatContent(content) {
    let formatted = escapeHtml(content)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/\n/g, '<br>');
    
    // Muuda ![Pilt](url) tegelikeks piltideks
    formatted = formatted.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, 
        '<div style="text-align: center; margin: 15px 0;"><img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);" loading="lazy"></div>'
    );
    
    return formatted;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// CSS LISAMINE
function addAdminStyles() {
    if (!document.getElementById('admin-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-styles';
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            
            .toast { animation: slideIn 0.3s ease; }
            
            .btn-edit, .btn-delete {
                transition: all 0.2s ease;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                margin: 0 2px;
            }
            .btn-edit {
                background: #2196F3;
                color: white;
            }
            .btn-edit:hover {
                background: #1976D2;
                transform: scale(1.05);
            }
            .btn-delete {
                background: #f44336;
                color: white;
            }
            .btn-delete:hover {
                background: #d32f2f;
                transform: scale(1.05);
            }
            
            .admin-actions {
                display: flex;
                gap: 5px;
                margin-top: 10px;
            }
            
            .update-header, .blog-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 10px;
            }
            
            #pass-input:focus, 
            #admin-image-file:focus,
            #blog-image-file:focus {
                border-color: #00ff88 !important;
                outline: none;
                box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.2);
            }
            
            #admin-image-file:hover,
            #blog-image-file:hover {
                border-color: #00ff88 !important;
                background: rgba(0, 255, 136, 0.2) !important;
            }
            
            .blog-admin-form input:focus,
            .blog-admin-form textarea:focus,
            .blog-admin-form select:focus {
                border-color: #00ff88 !important;
                outline: none;
                box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.2);
            }
            
            .blog-admin-buttons button:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            
            /* Responsiveness */
            @media (max-width: 768px) {
                .blog-admin-form input,
                .blog-admin-form textarea,
                .blog-admin-form select {
                    font-size: 16px;
                }
                
                .blog-admin-buttons {
                    flex-direction: column;
                }
                
                .blog-admin-buttons button {
                    width: 100%;
                    margin: 5px 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// BLOG ADMIN NUPU LOOMINE AUTOMAATSELT
function createBlogAdminButtonIfNeeded() {
    // Kontrolli kas blog admin nupp on olemas
    let blogAdminBtn = document.getElementById('blog-admin-toggle');
    
    if (!blogAdminBtn) {
        console.log("📝 Blog admin nuppu ei leitud, loon selle");
        
        const blogSection = document.getElementById('blog-section') || document.querySelector('.blog-section');
        if (blogSection) {
            let blogContainer = blogSection.querySelector('.blog-container');
            
            if (!blogContainer) {
                // Loo blog container kui seda pole
                blogContainer = document.createElement('div');
                blogContainer.className = 'blog-container';
                blogSection.appendChild(blogContainer);
            }
            
            // Loo blog header
            let blogHeader = blogContainer.querySelector('.blog-header');
            if (!blogHeader) {
                blogHeader = document.createElement('div');
                blogHeader.className = 'blog-header';
                blogHeader.style.cssText = 'text-align: center; margin-bottom: 20px;';
                
                blogHeader.innerHTML = `
                    <button id="blog-admin-toggle" onclick="toggleBlogAdmin()" 
                            title="Lisa uus blog postitus" class="blog-admin-btn" 
                            style="background: #00ff88; color: black; border: none; 
                                   padding: 12px 20px; border-radius: 6px; cursor: pointer;
                                   font-size: 16px; font-weight: bold; transition: all 0.3s;">
                        ✏️ Lisa blog postitus
                    </button>
                `;
                
                blogContainer.insertBefore(blogHeader, blogContainer.firstChild);
                console.log("✅ Blog admin nupp loodud");
            }
        }
    } else {
        console.log("✅ Blog admin nupp juba olemas");
    }
}

// INITSIALISEERIMINE
async function init() {
    console.log("🔄 Täieliku admin süsteemi initsialiseerimine...");
    
    // Lisa CSS
    addAdminStyles();
    
    // Lae andmed
    await API.loadData();
    
    // Kuva algne sisu
    displayUpdates();
    displayBlogPosts();
    
    // Loo blog admin nupp kui vaja
    setTimeout(createBlogAdminButtonIfNeeded, 1000);
    
    console.log("✅ Täielik admin süsteem valmis!");
    console.log("📊 Laetud andmed:", {
        teated: APP_DATA.teated.length,
        blog_posts: APP_DATA.blog_posts.length
    });
}

// KÄIVITA KUI DOM ON VALMIS
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// EKSPORDI FUNKTSIOONID GLOBAALSELT
window.toggleAdminMode = toggleAdminMode;
window.addUpdate = addUpdate;
window.toggleBlogAdmin = toggleBlogAdmin;
window.addBlogPost = addBlogPost;
window.showMoreUpdates = showMoreUpdates;
window.editUpdate = editUpdate;
window.deleteUpdate = deleteUpdate;
window.editBlogPost = editBlogPost;
window.deleteBlogPost = deleteBlogPost;
window.handleImageUpload = handleImageUpload;
window.removeImagePreview = removeImagePreview;

console.log("🎉 Kõik funktsioonid eksportitud!");

// KIIRE PARANDUS - lisa pildi väljad olemasolevasse blog paneeli
function fixExistingBlogPanel() {
    console.log("🔧 Parandan olemasolevat blog paneeli...");
    
    const existingPanel = document.getElementById('blog-admin-panel');
    if (!existingPanel) {
        console.log("❌ Blog paneel ei leitud");
        return;
    }
    
    // Kontrolli kas pildi väli on juba olemas
    if (document.getElementById('blog-image-url')) {
        console.log("✅ Pildi väli on juba olemas");
        return;
    }
    
    const blogForm = existingPanel.querySelector('.blog-admin-form');
    if (!blogForm) {
        console.log("❌ Blog form ei leitud");
        return;
    }
    
    // Leia pealkiri väli
    const titleDiv = Array.from(blogForm.children).find(div => 
        div.querySelector('#blog-title')
    );
    
    if (!titleDiv) {
        console.log("❌ Title div ei leitud");
        return;
    }
    
    // Loo pildi sektsioon
    const imageDiv = document.createElement('div');
    imageDiv.style.cssText = 'margin-bottom: 15px;';
    imageDiv.innerHTML = `
        <label style="display: block; color: #00ff88; margin-bottom: 5px; font-weight: bold;">
            📷 Pilt (valikuline):
        </label>
        
        <input type="text" id="blog-image-url" placeholder="Pildi URL (genereeritakse automaatselt)" readonly style="
            width: 100%; padding: 12px; border: 2px solid #555; 
            border-radius: 6px; background: #333; color: #ccc; font-size: 16px;
            margin-bottom: 10px; box-sizing: border-box;
        ">
        
        <input type="file" id="blog-image-file" accept="image/*" onchange="handleImageUpload(this)" style="
            width: 100%; padding: 15px; border: 2px dashed #00ff88; 
            border-radius: 6px; background: rgba(0, 255, 136, 0.1); 
            color: white; font-size: 14px; cursor: pointer;
            transition: all 0.3s ease; box-sizing: border-box;
        ">
        
        <div style="margin-top: 10px; font-size: 12px; color: #666; text-align: center;">
            Toetatud vormingud: JPG, PNG, GIF, WebP (max 5MB)
        </div>
    `;
    
    // Lisa pärast pealkiri välja
    titleDiv.insertAdjacentElement('afterend', imageDiv);
    console.log("✅ Pildi väli lisatud olemasolevasse blog paneeli!");
}

// Parandatud toggleBlogAdmin funktsioon
const originalToggleBlogAdmin = window.toggleBlogAdmin;
window.toggleBlogAdmin = async function() {
    await originalToggleBlogAdmin();
    
    // Lisa pildi väli pärast paneeli avamist
    setTimeout(() => {
        fixExistingBlogPanel();
    }, 200);
};

// Käivita kohe
setTimeout(fixExistingBlogPanel, 1000);

console.log("🔧 Blog paneeli parandus lisatud!");