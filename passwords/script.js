// Supabase Configuration
const SUPABASE_URL = 'https://cfrjcoasgmrgliwymqhj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmcmpjb2FzZ21yZ2xpd3ltcWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDg0MjEsImV4cCI6MjA3OTk4NDQyMX0.b4Oj3PynxFaC_O3wuEb4Gf0HX0FwDEM9bqKfCCMqi2c';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Encryption utilities using Web Crypto API
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
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
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text));
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
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        throw new Error('Decryption failed');
    }
}

// App State
let currentUser = null;
let masterPassword = '';
let passwords = [];
let currentEditId = null;
let inactivityTimer = null;
let clipboardTimer = null;
let isNewVault = false;
let selectedPasswords = new Set();
let selectMode = false;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;
const CLIPBOARD_CLEAR_TIMEOUT = 3 * 60 * 1000; // 3 minutes

// DOM Elements
const authScreen = document.getElementById('authScreen');
const masterScreen = document.getElementById('masterScreen');
const appScreen = document.getElementById('appScreen');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authError = document.getElementById('authError');
const masterPasswordInput = document.getElementById('masterPasswordInput');
const masterSubmitBtn = document.getElementById('masterSubmitBtn');
const masterError = document.getElementById('masterError');
const masterSubtitle = document.getElementById('masterSubtitle');
const backToAuthBtn = document.getElementById('backToAuthBtn');
const userEmailSpan = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const themeSelector = document.getElementById('themeSelector');
const searchInput = document.getElementById('searchInput');

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
const tabBtns = document.querySelectorAll('.tab-btn');

// Initialize
function init() {
    loadTheme();
    createFallingLeaves();
    setupEventListeners();
    checkAuth();
}

function setupEventListeners() {
    // Auth tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            authSubmitBtn.textContent = btn.dataset.tab === 'login' ? 'Login' : 'Sign Up';
            authError.textContent = '';
        });
    });

    authForm.addEventListener('submit', handleAuth);
    masterSubmitBtn.addEventListener('click', handleMasterPassword);
    masterPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleMasterPassword();
    });
    backToAuthBtn.addEventListener('click', () => {
        supabase.auth.signOut();
        showScreen('auth');
    });

    logoutBtn.addEventListener('click', logout);
    themeSelector.addEventListener('change', changeTheme);
    searchInput.addEventListener('input', renderPasswords);

    filterCategory.addEventListener('change', renderPasswords);
    addPasswordBtn.addEventListener('click', () => openModal());
    exportBtn.addEventListener('click', exportPasswords);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importPasswords);
    cancelBtn.addEventListener('click', closeModal);
    passwordForm.addEventListener('submit', savePassword);
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    
    document.getElementById('bulkDeleteBtn').addEventListener('click', bulkDelete);
    document.getElementById('cancelSelectBtn').addEventListener('click', () => toggleSelectMode(false));
    document.getElementById('changeMasterBtn').addEventListener('click', changeMasterPassword);

    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Only work when app screen is active
        if (!appScreen.classList.contains('active')) return;
        
        // Ctrl+N or Cmd+N = New password
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openModal();
        }
        
        // Escape = Close modal
        if (e.key === 'Escape' && passwordModal.classList.contains('active')) {
            closeModal();
        }
        
        // Ctrl+F or Cmd+F = Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Delete = Bulk delete selected
        if (e.key === 'Delete' && selectedPasswords.size > 0) {
            bulkDelete();
        }
    });
}

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        await checkVaultExists();
    } else {
        showScreen('auth');
    }
}

async function handleAuth(e) {
    e.preventDefault();
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const isLogin = authSubmitBtn.textContent === 'Login';

    authError.textContent = '';
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = 'Please wait...';

    try {
        let result;
        if (isLogin) {
            result = await supabase.auth.signInWithPassword({ email, password });
        } else {
            result = await supabase.auth.signUp({ email, password });
        }

        if (result.error) throw result.error;

        if (!isLogin && result.data.user && !result.data.session) {
            authError.style.color = '#4CAF50';
            authError.textContent = 'Check your email to confirm your account!';
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = 'Sign Up';
            return;
        }

        currentUser = result.data.user;
        await checkVaultExists();
    } catch (error) {
        authError.style.color = '#ff6b6b';
        authError.textContent = error.message;
    }

    authSubmitBtn.disabled = false;
    authSubmitBtn.textContent = isLogin ? 'Login' : 'Sign Up';
}

async function checkVaultExists() {
    const { data, error } = await supabase
        .from('password_vaults')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

    if (error && error.code === 'PGRST116') {
        isNewVault = true;
        masterSubtitle.textContent = 'Create a master password for your new vault';
    } else {
        isNewVault = false;
        masterSubtitle.textContent = 'Enter your master password to decrypt your vault';
    }
    showScreen('master');
}

async function handleMasterPassword() {
    const password = masterPasswordInput.value.trim();
    if (!password) {
        masterError.textContent = 'Please enter a master password';
        return;
    }

    masterError.textContent = '';
    masterSubmitBtn.disabled = true;
    masterSubmitBtn.textContent = 'Please wait...';

    try {
        if (isNewVault) {
            // Create new vault
            masterPassword = password;
            passwords = [];
            await saveToCloud();
            showApp();
        } else {
            // Load existing vault
            const { data, error } = await supabase
                .from('password_vaults')
                .select('encrypted_data')
                .eq('user_id', currentUser.id)
                .single();

            if (error) throw error;

            const decryptedData = await decrypt(data.encrypted_data, password);
            passwords = JSON.parse(decryptedData);
            masterPassword = password;
            showApp();
        }
    } catch (error) {
        masterError.textContent = isNewVault ? 'Failed to create vault' : 'Incorrect master password';
    }

    masterSubmitBtn.disabled = false;
    masterSubmitBtn.textContent = 'Unlock';
}

function showScreen(screen) {
    authScreen.classList.remove('active');
    masterScreen.classList.remove('active');
    appScreen.classList.remove('active');

    if (screen === 'auth') {
        authScreen.classList.add('active');
    } else if (screen === 'master') {
        masterScreen.classList.add('active');
        masterPasswordInput.value = '';
        masterError.textContent = '';
    } else if (screen === 'app') {
        appScreen.classList.add('active');
    }
}

function showApp() {
    userEmailSpan.textContent = currentUser.email;
    showScreen('app');
    masterPasswordInput.value = '';
    renderPasswords();
    updateCategoryFilter();
    resetInactivityTimer();
}

async function logout() {
    await supabase.auth.signOut();
    masterPassword = '';
    passwords = [];
    currentUser = null;
    currentEditId = null;
    clearTimeout(inactivityTimer);
    showScreen('auth');
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (appScreen.classList.contains('active')) {
        inactivityTimer = setTimeout(() => {
            masterPassword = '';
            passwords = [];
            showScreen('master');
            showNotification('Logged out due to inactivity');
        }, INACTIVITY_TIMEOUT);
    }
}

async function saveToCloud() {
    const dataString = JSON.stringify(passwords);
    const encrypted = await encrypt(dataString, masterPassword);

    if (isNewVault) {
        const { error } = await supabase
            .from('password_vaults')
            .insert({ user_id: currentUser.id, encrypted_data: encrypted });
        if (error) throw error;
        isNewVault = false;
    } else {
        const { error } = await supabase
            .from('password_vaults')
            .update({ encrypted_data: encrypted, updated_at: new Date().toISOString() })
            .eq('user_id', currentUser.id);
        if (error) throw error;
    }
}

function renderPasswords() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilter = filterCategory.value;

    passwordList.innerHTML = '';

    // If no category selected and no search, show prompt
    if (!categoryFilter && !searchTerm) {
        passwordList.innerHTML = '<p style="text-align: center; opacity: 0.6; padding: 2rem;">Select a category or search to view passwords</p>';
        return;
    }

    let filtered = passwords.filter(p => {
        const matchesSearch = searchTerm && (
            p.name.toLowerCase().includes(searchTerm) ||
            p.username.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
        );
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        
        // Show if matches search OR matches category filter
        if (searchTerm) return matchesSearch;
        return matchesCategory;
    });

    // Sort by favorites first, then by name
    filtered.sort((a, b) => {
        if (a.favorite !== b.favorite) return b.favorite - a.favorite;
        return a.name.localeCompare(b.name);
    });

    if (filtered.length === 0) {
        passwordList.innerHTML = '<p style="text-align: center; opacity: 0.6; padding: 2rem;">No passwords found. Click "+ Add Password" to get started!</p>';
        return;
    }

    filtered.forEach(password => {
        const card = createPasswordCard(password);
        passwordList.appendChild(card);
    });
}

function createPasswordCard(password) {
    const card = document.createElement('div');
    card.className = 'password-row' + (selectMode ? ' select-mode' : '');
    card.dataset.id = password.id;
    const maskedEmail = maskEmail(password.name);
    const isSelected = selectedPasswords.has(password.id);
    card.innerHTML = `
        <input type="checkbox" class="row-checkbox" ${isSelected ? 'checked' : ''} title="Select for bulk delete">
        <button class="favorite-btn" title="Favorite">${password.favorite ? '⭐' : '☆'}</button>
        <span class="row-name">${escapeHtml(maskedEmail)}</span>
        <span class="row-category">${escapeHtml(password.category)}</span>
        <span class="row-username">${escapeHtml(password.username || '-')}</span>
        <div class="row-password">
            <span class="password-text hidden">••••••••</span>
            <button class="icon-btn show-password-btn" title="Show/Hide">👁️</button>
            <button class="icon-btn copy-btn" title="Copy">📋</button>
        </div>
        <div class="row-actions">
            <button class="icon-btn edit-btn" title="Edit">✏️</button>
            <button class="icon-btn delete-btn" title="Delete">🗑️</button>
        </div>
    `;

    // Double-click to enter select mode
    card.addEventListener('dblclick', (e) => {
        if (e.target.closest('.icon-btn') || e.target.closest('.favorite-btn')) return;
        toggleSelectMode(true);
        selectedPasswords.add(password.id);
        renderPasswords();
    });

    card.querySelector('.row-checkbox').addEventListener('change', (e) => {
        if (e.target.checked) {
            selectedPasswords.add(password.id);
        } else {
            selectedPasswords.delete(password.id);
        }
        updateSelectModeUI();
    });
    card.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(password.id));
    card.querySelector('.edit-btn').addEventListener('click', () => openModal(password.id));
    card.querySelector('.delete-btn').addEventListener('click', () => deletePassword(password.id));
    card.querySelector('.show-password-btn').addEventListener('click', (e) => {
        const textEl = card.querySelector('.password-text');
        if (textEl.classList.contains('hidden')) {
            textEl.textContent = password.password;
            textEl.classList.remove('hidden');
        } else {
            textEl.textContent = '••••••••';
            textEl.classList.add('hidden');
        }
    });
    card.querySelector('.copy-btn').addEventListener('click', () => copyPassword(password.password));

    return card;
}

async function copyToClipboard(text, message) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification(message);
    } catch (e) {
        showNotification('Failed to copy', true);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function maskEmail(email) {
    if (!email || email.length < 4) return email || '-';
    
    // Check if it's an email
    if (email.includes('@')) {
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 4) {
            return localPart[0] + '***@' + domain;
        }
        const first2 = localPart.slice(0, 2);
        const last2 = localPart.slice(-2);
        const masked = first2 + '****' + last2;
        return masked + '@' + domain;
    }
    
    // Not an email, just mask it
    if (email.length <= 4) {
        return email[0] + '***';
    }
    const first2 = email.slice(0, 2);
    const last2 = email.slice(-2);
    return first2 + '****' + last2;
}

async function copyPassword(password) {
    try {
        await navigator.clipboard.writeText(password);
        showNotification('Password copied! (Clipboard clears in 3 min)');
        
        // Clear clipboard after 3 minutes
        clearTimeout(clipboardTimer);
        clipboardTimer = setTimeout(async () => {
            try {
                await navigator.clipboard.writeText('');
                showNotification('Clipboard cleared for security');
            } catch (e) { }
        }, CLIPBOARD_CLEAR_TIMEOUT);
    } catch (e) {
        showNotification('Failed to copy', true);
    }
}

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 1rem 2rem;
        background: ${isError ? '#ff6b6b' : '#4CAF50'}; color: white;
        border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 10000; animation: slideIn 0.3s ease;
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
    
    // Normalize category - find existing category with same name (case-insensitive)
    const inputCategory = document.getElementById('entryCategory').value.trim();
    const existingCategory = passwords.find(p => 
        p.category.toLowerCase() === inputCategory.toLowerCase()
    )?.category;
    
    const passwordData = {
        id: currentEditId || Date.now(),
        name: document.getElementById('entryName').value.trim(),
        username: document.getElementById('entryUsername').value.trim(),
        password: document.getElementById('entryPassword').value,
        category: existingCategory || inputCategory, // Use existing casing if found
        notes: document.getElementById('entryNotes').value.trim(),
        favorite: currentEditId ? passwords.find(p => p.id === currentEditId)?.favorite || false : false
    };

    if (currentEditId) {
        const index = passwords.findIndex(p => p.id === currentEditId);
        passwords[index] = passwordData;
    } else {
        passwords.push(passwordData);
    }

    await saveToCloud();
    closeModal();
    renderPasswords();
    updateCategoryFilter();
    showNotification(currentEditId ? 'Password updated!' : 'Password added!');
}

async function deletePassword(id) {
    if (!confirm('Are you sure you want to delete this password?')) return;
    passwords = passwords.filter(p => p.id !== id);
    selectedPasswords.delete(id);
    await saveToCloud();
    renderPasswords();
    updateCategoryFilter();
    showNotification('Password deleted');
}

async function bulkDelete() {
    if (selectedPasswords.size === 0) return;
    if (!confirm(`Delete ${selectedPasswords.size} selected password(s)?`)) return;
    
    passwords = passwords.filter(p => !selectedPasswords.has(p.id));
    selectedPasswords.clear();
    toggleSelectMode(false);
    await saveToCloud();
    renderPasswords();
    updateCategoryFilter();
    showNotification('Passwords deleted');
}

function toggleSelectMode(enable) {
    selectMode = enable;
    if (!enable) {
        selectedPasswords.clear();
    }
    updateSelectModeUI();
    renderPasswords();
}

function updateSelectModeUI() {
    const controls = document.querySelector('.select-mode-controls');
    const btn = document.getElementById('bulkDeleteBtn');
    
    if (controls) {
        controls.style.display = selectMode ? 'flex' : 'none';
    }
    if (btn) {
        btn.textContent = `🗑️ Delete (${selectedPasswords.size})`;
    }
}

async function toggleFavorite(id) {
    const password = passwords.find(p => p.id === id);
    password.favorite = !password.favorite;
    await saveToCloud();
    renderPasswords();
}

function updateCategoryFilter() {
    const categories = [...new Set(passwords.map(p => p.category).filter(c => c))].sort();
    const currentValue = filterCategory.value;
    
    // Update filter dropdown
    filterCategory.innerHTML = `
        <option value="">Select a category...</option>
        <option value="all">Show All</option>
    `;
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterCategory.appendChild(option);
    });
    
    // Keep current selection if it still exists
    if (currentValue && (currentValue === 'all' || categories.includes(currentValue))) {
        filterCategory.value = currentValue;
    }
    
    // Update datalist for category suggestions
    const categoryList = document.getElementById('categoryList');
    if (categoryList) {
        categoryList.innerHTML = '';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            categoryList.appendChild(option);
        });
    }
}

function exportPasswords() {
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
            await saveToCloud();
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

async function changeMasterPassword() {
    const currentPwd = prompt('Enter your CURRENT master password:');
    if (!currentPwd) return;
    
    if (currentPwd !== masterPassword) {
        showNotification('Incorrect current password', true);
        return;
    }
    
    const newPwd = prompt('Enter your NEW master password:');
    if (!newPwd) return;
    
    const confirmPwd = prompt('Confirm your NEW master password:');
    if (newPwd !== confirmPwd) {
        showNotification('Passwords do not match', true);
        return;
    }
    
    try {
        masterPassword = newPwd;
        await saveToCloud();
        showNotification('Master password changed!');
    } catch (e) {
        showNotification('Failed to change password', true);
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
    for (let i = 0; i < 15; i++) {
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
    @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
`;
document.head.appendChild(style);

// Start the app
init();
