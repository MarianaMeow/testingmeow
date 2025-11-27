// Encryption utilities using Web Crypto API
const crypto = window.crypto;

async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );
    
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encrypt(text, password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(text)
    );
    
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    return btoa(String.fromCharCode(...result));
}

async function decrypt(encryptedData, password) {
    const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const encrypted = data.slice(28);
    
    const key = await deriveKey(password, salt);
    
    try {
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encrypted
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (e) {
        throw new Error('Decryption failed');
    }
}

// App State
let masterPassword = '';
let passwords = [];
let currentEditId = null;
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');
const masterPasswordInput = document.getElementById('masterPasswordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const themeSelector = document.getElementById('themeSelector');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const filterCategory = document.getElementById('filterCategory');
const addPasswordBtn = document.getElementById('addPasswordBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
const passwordList = document.getElementById('passwordList');
const passwordModal = document.getElementById('passwordModal');
const modalTitle = document.getElementById('modalTitle');
const passwordForm = document.getElementById('passwordForm');
const cancelBtn = document.getElementById('cancelBtn');
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const leavesContainer = document.getElementById('leavesContainer');

// Initialize
function init() {
    loadTheme();
    createFallingLeaves();
    setupEventListeners();
    
    // Check if first time user
    const hasData = localStorage.getItem('passwordData');
    if (!hasData) {
        loginError.textContent = 'First time? Set your master password.';
        loginError.style.color = '#4CAF50';
    }
}

function setupEventListeners() {
    loginBtn.addEventListener('click', handleLogin);
    masterPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    logoutBtn.addEventListener('click', logout);
    themeSelector.addEventListener('change', changeTheme);
    searchInput.addEventListener('input', renderPasswords);
    sortSelect.addEventListener('change', renderPasswords);
    filterCategory.addEventListener('change', renderPasswords);
    addPasswordBtn.addEventListener('click', () => openModal());
    exportBtn.addEventListener('click', exportPasswords);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importPasswords);
    cancelBtn.addEventListener('click', closeModal);
    passwordForm.addEventListener('submit', savePassword);
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    
    // Inactivity detection
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer);
    });
}

async function handleLogin() {
    const password = masterPasswordInput.value.trim();
    
    if (!password) {
        loginError.textContent = 'Please enter a password';
        return;
    }
    
    const hasData = localStorage.getItem('passwordData');
    
    if (!hasData) {
        // First time setup
        masterPassword = password;
        passwords = [];
        await saveData();
        showApp();
    } else {
        // Verify password
        try {
            const encryptedData = localStorage.getItem('passwordData');
            const decryptedData = await decrypt(encryptedData, password);
            passwords = JSON.parse(decryptedData);
            masterPassword = password;
            showApp();
        } catch (e) {
            loginError.textContent = 'Incorrect password';
            masterPasswordInput.value = '';
        }
    }
}

function showApp() {
    loginScreen.classList.remove('active');
    appScreen.classList.add('active');
    masterPasswordInput.value = '';
    loginError.textContent = '';
    renderPasswords();
    updateCategoryFilter();
    resetInactivityTimer();
}

function logout() {
    masterPassword = '';
    passwords = [];
    currentEditId = null;
    appScreen.classList.remove('active');
    loginScreen.classList.add('active');
    clearTimeout(inactivityTimer);
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (appScreen.classList.contains('active')) {
        inactivityTimer = setTimeout(logout, INACTIVITY_TIMEOUT);
    }
}

async function saveData() {
    const dataString = JSON.stringify(passwords);
    const encrypted = await encrypt(dataString, masterPassword);
    localStorage.setItem('passwordData', encrypted);
}

function renderPasswords() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;
    const categoryFilter = filterCategory.value;
    
    let filtered = passwords.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
                            p.username.toLowerCase().includes(searchTerm) ||
                            p.category.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    // Sort
    filtered.sort((a, b) => {
        if (a.favorite !== b.favorite) return b.favorite - a.favorite;
        
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else {
            return a.category.localeCompare(b.category);
        }
    });
    
    passwordList.innerHTML = '';
    
    if (filtered.length === 0) {
        passwordList.innerHTML = '<p style="text-align: center; opacity: 0.6; padding: 2rem;">No passwords found</p>';
        return;
    }
    
    filtered.forEach(password => {
        const card = createPasswordCard(password);
        passwordList.appendChild(card);
    });
}

function createPasswordCard(password) {
    const card = document.createElement('div');
    card.className = 'password-card';
    
    card.innerHTML = `
        <div class="password-card-header">
            <div class="password-card-title">
                <button class="favorite-btn" data-id="${password.id}">
                    ${password.favorite ? '⭐' : '☆'}
                </button>
                <span>${password.name}</span>
            </div>
            <div class="password-card-actions">
                <button class="icon-btn edit-btn" data-id="${password.id}" title="Edit">✏️</button>
                <button class="icon-btn delete-btn" data-id="${password.id}" title="Delete">🗑️</button>
            </div>
        </div>
        <div class="password-card-body">
            <div class="password-field">
                <label>Category:</label>
                <span class="category-badge">${password.category}</span>
            </div>
            ${password.username ? `
            <div class="password-field">
                <label>Username:</label>
                <span>${password.username}</span>
            </div>
            ` : ''}
            <div class="password-field">
                <label>Password:</label>
                <div class="password-value">
                    <span class="password-text hidden" data-id="${password.id}" data-password="${password.password}">
                        ••••••••
                    </span>
                    <button class="icon-btn show-password-btn" data-id="${password.id}" title="Show/Hide">👁️</button>
                    <button class="icon-btn copy-btn" data-id="${password.id}" data-password="${password.password}" title="Copy">📋</button>
                </div>
            </div>
            ${password.notes ? `
            <div class="password-field">
                <label>Notes:</label>
                <span style="opacity: 0.8;">${password.notes}</span>
            </div>
            ` : ''}
        </div>
    `;
    
    // Event listeners
    card.querySelector('.favorite-btn').addEventListener('click', (e) => toggleFavorite(password.id));
    card.querySelector('.edit-btn').addEventListener('click', () => openModal(password.id));
    card.querySelector('.delete-btn').addEventListener('click', () => deletePassword(password.id));
    card.querySelector('.show-password-btn').addEventListener('click', (e) => togglePasswordDisplay(password.id));
    card.querySelector('.copy-btn').addEventListener('click', (e) => copyPassword(password.password));
    card.querySelector('.password-text').addEventListener('dblclick', (e) => copyPassword(password.password));
    
    return card;
}

function togglePasswordDisplay(id) {
    const passwordText = document.querySelector(`.password-text[data-id="${id}"]`);
    const password = passwordText.dataset.password;
    
    if (passwordText.classList.contains('hidden')) {
        passwordText.textContent = password;
        passwordText.classList.remove('hidden');
    } else {
        passwordText.textContent = '••••••••';
        passwordText.classList.add('hidden');
    }
}

async function copyPassword(password) {
    try {
        await navigator.clipboard.writeText(password);
        showNotification('Password copied!');
    } catch (e) {
        showNotification('Failed to copy', true);
    }
}

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${isError ? '#ff6b6b' : '#4CAF50'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function openModal(id = null) {
    currentEditId = id;
    
    if (id) {
        const password = passwords.find(p => p.id === id);
        modalTitle.textContent = 'Edit Password';
        document.getElementById('entryName').value = password.name;
        document.getElementById('entryUsername').value = password.username;
        document.getElementById('entryPassword').value = password.password;
        document.getElementById('entryCategory').value = password.category;
        document.getElementById('entryNotes').value = password.notes;
    } else {
        modalTitle.textContent = 'Add Password';
        passwordForm.reset();
    }
    
    passwordModal.classList.add('active');
}

function closeModal() {
    passwordModal.classList.remove('active');
    passwordForm.reset();
    currentEditId = null;
}

async function savePassword(e) {
    e.preventDefault();
    
    const passwordData = {
        id: currentEditId || Date.now(),
        name: document.getElementById('entryName').value.trim(),
        username: document.getElementById('entryUsername').value.trim(),
        password: document.getElementById('entryPassword').value,
        category: document.getElementById('entryCategory').value,
        notes: document.getElementById('entryNotes').value.trim(),
        favorite: currentEditId ? passwords.find(p => p.id === currentEditId).favorite : false
    };
    
    if (currentEditId) {
        const index = passwords.findIndex(p => p.id === currentEditId);
        passwords[index] = passwordData;
    } else {
        passwords.push(passwordData);
    }
    
    await saveData();
    closeModal();
    renderPasswords();
    updateCategoryFilter();
    showNotification(currentEditId ? 'Password updated!' : 'Password added!');
}

async function deletePassword(id) {
    if (!confirm('Are you sure you want to delete this password?')) return;
    
    passwords = passwords.filter(p => p.id !== id);
    await saveData();
    renderPasswords();
    updateCategoryFilter();
    showNotification('Password deleted');
}

async function toggleFavorite(id) {
    const password = passwords.find(p => p.id === id);
    password.favorite = !password.favorite;
    await saveData();
    renderPasswords();
}

function updateCategoryFilter() {
    const categories = [...new Set(passwords.map(p => p.category))].sort();
    const currentValue = filterCategory.value;
    
    filterCategory.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterCategory.appendChild(option);
    });
    
    filterCategory.value = currentValue;
}

async function exportPasswords() {
    const dataStr = JSON.stringify(passwords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `passwords-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Passwords exported!');
}

async function importPasswords(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (!Array.isArray(imported)) throw new Error('Invalid format');
            
            passwords = imported;
            await saveData();
            renderPasswords();
            updateCategoryFilter();
            showNotification('Passwords imported!');
        } catch (e) {
            showNotification('Import failed: Invalid file', true);
        }
    };
    reader.readAsText(file);
    importFileInput.value = '';
}

function togglePasswordVisibility() {
    const input = document.getElementById('entryPassword');
    if (input.type === 'password') {
        input.type = 'text';
        togglePasswordBtn.textContent = '🙈';
    } else {
        input.type = 'password';
        togglePasswordBtn.textContent = '👁️';
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'midnight';
    document.body.className = savedTheme;
    themeSelector.value = savedTheme;
}

function changeTheme() {
    const theme = themeSelector.value;
    document.body.className = theme;
    localStorage.setItem('theme', theme);
}

function createFallingLeaves() {
    const leafSymbols = ['🍂', '🍁', '🌿', '🍃'];
    const numLeaves = 15;
    
    for (let i = 0; i < numLeaves; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        leaf.textContent = leafSymbols[Math.floor(Math.random() * leafSymbols.length)];
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.animationDuration = (Math.random() * 10 + 10) + 's';
        leaf.style.animationDelay = Math.random() * 5 + 's';
        leavesContainer.appendChild(leaf);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);


// Start the app
init();
