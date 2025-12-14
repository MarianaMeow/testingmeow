import { collectedKeys } from './state.js';

export function initEnhancements() {
    initFloatingStars();
    initMuteToggle();
    initKeyboardShortcuts();
    setTimeout(() => {
        initSettingsPanel();
    }, 100);
}

function initFloatingStars() {
    const container = document.getElementById('floating-stars');
    if (!container) return;

    const starCount = 50;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = `star layer-${(i % 3) + 1}`;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';

        const duration = 20 + Math.random() * 30;
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animation += `, float-up ${duration}s linear infinite`;
        star.style.animationDelay = Math.random() * duration + 's';
        
        container.appendChild(star);
    }
}

function initMuteToggle() {
    const muteBtn = document.getElementById('mute-toggle');
    if (!muteBtn) return;

    const isMuted = sessionStorage.getItem('audioMuted') === 'true';
    if (isMuted) {
        muteBtn.classList.add('muted');
        muteBtn.querySelector('.mute-icon').textContent = '🔇';
    }

    muteBtn.addEventListener('click', () => {
        const nowMuted = !muteBtn.classList.contains('muted');
        
        if (nowMuted) {
            muteBtn.classList.add('muted');
            muteBtn.querySelector('.mute-icon').textContent = '🔇';
            sessionStorage.setItem('audioMuted', 'true');
        } else {
            muteBtn.classList.remove('muted');
            muteBtn.querySelector('.mute-icon').textContent = '🔊';
            sessionStorage.setItem('audioMuted', 'false');
        }
    });
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
        if (isTyping && e.key !== 'Escape') return;

        const key = e.key.toLowerCase();

        switch(key) {
            case 'escape':
                handleEscape();
                e.preventDefault();
                break;
            case 'enter':
                if (!isTyping) {
                    handleEnter();
                    e.preventDefault();
                }
                break;
            case 'm':
                document.getElementById('mute-toggle')?.click();
                e.preventDefault();
                break;
            case 'h':
                showHelpModal();
                e.preventDefault();
                break;
            case 's':
                if (!isTyping) {
                    openSettings();
                    e.preventDefault();
                }
                break;
        }
    });
}

function handleEscape() {
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel && settingsPanel.classList.contains('open')) {
        settingsPanel.classList.remove('open');
    }
}

function handleEnter() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const submitBtn = document.getElementById('submit-btn');
    if (welcomeScreen && welcomeScreen.style.display !== 'none') {
        submitBtn?.click();
    }
}

function initSettingsPanel() {
    let panel = document.getElementById('settings-panel');
    
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'settings-panel';
        panel.className = 'settings-panel';
        panel.innerHTML = `
            <div class="settings-header">
                <h2>⚙ Settings</h2>
                <button class="close-settings-btn" id="close-settings">✕</button>
            </div>
            <div class="settings-content">
                <div class="setting-group">
                    <label>🎵 Music Volume</label>
                    <input type="range" id="music-volume" min="0" max="100" value="70">
                    <span id="music-value">70%</span>
                </div>
                <div class="setting-group">
                    <label>🔊 Sound Effects</label>
                    <input type="range" id="sfx-volume" min="0" max="100" value="80">
                    <span id="sfx-value">80%</span>
                </div>
                <div class="setting-group">
                    <label>✨ Visual Effects</label>
                    <div class="toggle-group">
                        <label class="toggle-label">
                            <input type="checkbox" id="particles-toggle" checked>
                            <span>Particles</span>
                        </label>
                        <label class="toggle-label">
                            <input type="checkbox" id="animations-toggle" checked>
                            <span>Animations</span>
                        </label>
                    </div>
                </div>
                <div class="setting-group">
                    <button class="reset-progress-btn" id="reset-progress">🔄 Reset Progress</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }
    
    document.getElementById('close-settings')?.addEventListener('click', closeSettings);
    document.getElementById('music-volume')?.addEventListener('input', (e) => {
        document.getElementById('music-value').textContent = e.target.value + '%';
    });
    document.getElementById('sfx-volume')?.addEventListener('input', (e) => {
        document.getElementById('sfx-value').textContent = e.target.value + '%';
    });
    document.getElementById('reset-progress')?.addEventListener('click', () => {
        if (window.confirm('Reset your journey progress?')) {
            sessionStorage.clear();
            window.location.reload();
        }
    });
}

function openSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) panel.classList.add('open');
}

function closeSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) panel.classList.remove('open');
}

function showHelpModal() {
    alert(`Keyboard Shortcuts:
ESC - Close modal
Enter - Submit
M - Mute
S - Settings
H - Help`);
}

window.openSettings = openSettings;