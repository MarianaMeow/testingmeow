import { collectedKeys, awardKey, updateProgressBar } from './state.js';
import { showPlanetSelection } from './navigation.js';

export function initEnhancements() {
    initFloatingStars();
    initMuteToggle();
    initProgressBar();
    initKeyboardShortcuts();

    setTimeout(() => {
        initSettingsPanel();
        initKeyPreview();
        initInteractiveStands();
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
        
        muteBtn.style.animation = 'none';
        setTimeout(() => {
            muteBtn.style.animation = '';
        }, 10);
    });
}

function initProgressBar() {
    updateProgressBar();
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
            case 'k':
                showCollectedKeysModal();
                e.preventDefault();
                break;
            case 's':
                if (!isTyping) {
                    openSettings();
                    e.preventDefault();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                handlePlanetJump(parseInt(key, 10));
                e.preventDefault();
                break;
        }
    });
}

function handleEscape() {
    const keyPuzzleOverlay = document.getElementById('key-puzzle-overlay');
    if (keyPuzzleOverlay && keyPuzzleOverlay.style.display === 'flex') {
        keyPuzzleOverlay.style.display = 'none';
        return;
    }
    
    const invOverlay = document.getElementById('inventory-overlay');
    if (invOverlay && invOverlay.style.display === 'flex') {
        invOverlay.style.display = 'none';
        return;
    }
    
    const fillGames = document.querySelectorAll('[id^="belobog-fill-game"]');
    fillGames.forEach(game => {
        if (game.style.display === 'flex') {
            game.style.display = 'none';
        }
    });
}

function handleEnter() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const submitBtn = document.getElementById('submit-btn');
    if (welcomeScreen && welcomeScreen.style.display !== 'none') {
        submitBtn?.click();
    }
}

function handlePlanetJump(number) {
    const planetMap = {
        1: 'belobog',
        2: 'xianzhou',
        3: 'penacony',
        4: 'jarilo',
        5: 'herta',
        6: 'luofu',
        7: 'stellaron',
        8: 'terminus'
    };
    
    const planetKey = planetMap[number];
    if (!planetKey) return;
    
    const planetOrb = document.querySelector(`.planet-option[data-planet="${planetKey}"]`);
    if (planetOrb && planetOrb.classList.contains('unlocked')) {
        planetOrb.click();
    }
}

function initKeyPreview() {
    setTimeout(() => {
        const celestialOrbs = document.querySelectorAll('.celestial-orb');
        
        celestialOrbs.forEach(orb => {
            orb.addEventListener('mouseenter', function() {
                const planet = this.getAttribute('data-planet');
                if (planet && !collectedKeys[planet]) {
                    showKeyPreview(planet, this);
                }
            });
            
            orb.addEventListener('mouseleave', function() {
                hideKeyPreview();
            });
        });
    }, 1000);
}

function showKeyPreview(planet, element) {
    let tooltip = document.getElementById('key-preview-tooltip');
    
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'key-preview-tooltip';
        tooltip.className = 'key-preview-tooltip';
        document.body.appendChild(tooltip);
    }
    
    const keyNames = {
        belobog: '🔑 Candy Key',
        xianzhou: '🔑 Memory Key',
        penacony: '🔑 Fortune Key',
        jarilo: '🔑 Frozen Key',
        herta: '🔑 Dimension Key',
        luofu: '🔑 Lotus Key',
        stellaron: '🔑 Stellaron Key',
        terminus: '🔑 Terminus Key'
    };
    
    tooltip.innerHTML = `
        <div class="key-preview-icon">${keyNames[planet]?.split(' ')[0] || '🔑'}</div>
        <div class="key-preview-name">${keyNames[planet] || 'Unknown Key'}</div>
        <div class="key-preview-hint">Complete puzzle to unlock</div>
    `;
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.top - 10 + 'px';
    tooltip.classList.add('show');
}

function hideKeyPreview() {
    const tooltip = document.getElementById('key-preview-tooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
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
                            <input type="checkbox" id="trails-toggle" checked>
                            <span>Cursor Trails</span>
                        </label>
                        <label class="toggle-label">
                            <input type="checkbox" id="animations-toggle" checked>
                            <span>Animations</span>
                        </label>
                    </div>
                </div>
                <div class="setting-group">
                    <label>🛟 Accessibility</label>
                    <div class="toggle-group">
                        <label class="toggle-label">
                            <input type="checkbox" id="reduced-motion-toggle">
                            <span>Reduced Motion</span>
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
    
    loadSettings();
    
    document.getElementById('close-settings')?.addEventListener('click', closeSettings);
    document.getElementById('music-volume')?.addEventListener('input', updateMusicVolume);
    document.getElementById('sfx-volume')?.addEventListener('input', updateSfxVolume);
    document.getElementById('particles-toggle')?.addEventListener('change', saveSettings);
    document.getElementById('trails-toggle')?.addEventListener('change', saveSettings);
    document.getElementById('animations-toggle')?.addEventListener('change', saveSettings);
    document.getElementById('reduced-motion-toggle')?.addEventListener('change', saveSettings);
    document.getElementById('reset-progress')?.addEventListener('click', confirmResetProgress);
}

function openSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
        panel.classList.add('open');
    }
}

function closeSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
        panel.classList.remove('open');
    }
}

function loadSettings() {
    const settings = {
        musicVolume: sessionStorage.getItem('musicVolume') || '70',
        sfxVolume: sessionStorage.getItem('sfxVolume') || '80',
        particles: sessionStorage.getItem('particles') !== 'false',
        trails: sessionStorage.getItem('trails') !== 'false',
        animations: sessionStorage.getItem('animations') !== 'false',
        reducedMotion: sessionStorage.getItem('reducedMotion') === 'true'
    };
    
    const musicSlider = document.getElementById('music-volume');
    const sfxSlider = document.getElementById('sfx-volume');
    const musicValue = document.getElementById('music-value');
    const sfxValue = document.getElementById('sfx-value');
    
    if (musicSlider) {
        musicSlider.value = settings.musicVolume;
        if (musicValue) musicValue.textContent = settings.musicVolume + '%';
    }
    if (sfxSlider) {
        sfxSlider.value = settings.sfxVolume;
        if (sfxValue) sfxValue.textContent = settings.sfxVolume + '%';
    }
    
    const particlesToggle = document.getElementById('particles-toggle');
    const trailsToggle = document.getElementById('trails-toggle');
    const animationsToggle = document.getElementById('animations-toggle');
    const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
    
    if (particlesToggle) particlesToggle.checked = settings.particles;
    if (trailsToggle) trailsToggle.checked = settings.trails;
    if (animationsToggle) animationsToggle.checked = settings.animations;
    if (reducedMotionToggle) reducedMotionToggle.checked = settings.reducedMotion;
}

function updateMusicVolume(e) {
    const value = e.target.value;
    const musicValue = document.getElementById('music-value');
    if (musicValue) musicValue.textContent = value + '%';
    saveSettings();
}

function updateSfxVolume(e) {
    const value = e.target.value;
    const sfxValue = document.getElementById('sfx-value');
    if (sfxValue) sfxValue.textContent = value + '%';
    saveSettings();
}

function saveSettings() {
    sessionStorage.setItem('musicVolume', document.getElementById('music-volume')?.value || '70');
    sessionStorage.setItem('sfxVolume', document.getElementById('sfx-volume')?.value || '80');
    sessionStorage.setItem('particles', document.getElementById('particles-toggle')?.checked);
    sessionStorage.setItem('trails', document.getElementById('trails-toggle')?.checked);
    sessionStorage.setItem('animations', document.getElementById('animations-toggle')?.checked);
    sessionStorage.setItem('reducedMotion', document.getElementById('reduced-motion-toggle')?.checked);
}

function confirmResetProgress() {
    if (window.confirm('Reset your journey progress?')) {
        sessionStorage.clear();
        window.location.reload();
    }
}

function showHelpModal() {
    const helpText = `
Keyboard Shortcuts:
ESC - Close modal
Enter - Submit
M - Mute
S - Settings
H - Help
K - Collected keys
1-8 - Jump to planets
    `;
    alert(helpText);
}

function showCollectedKeysModal() {
    let modal = document.getElementById('collected-keys-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'collected-keys-modal';
        modal.className = 'key-description-modal';
        modal.innerHTML = `
            <div class="key-description-panel" style="max-width: 600px;">
                <button class="close-key-desc" onclick="this.closest('.key-description-modal').classList.remove('show')">✕</button>
                <h2 style="color: #ffd700; margin-bottom: 20px;">🔑 Collected Keys</h2>
                <div id="keys-list" style="display: grid; gap: 15px;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    const keysList = modal.querySelector('#keys-list');
    if (!keysList) {
        console.error('[Inventory] Keys list element not found!');
        return;
    }
    keysList.innerHTML = '';
    
    Object.keys(keyDescriptions).forEach(planetName => {
        const key = keyDescriptions[planetName];
        const isCollected = collectedKeys[planetName];
        
        const keyCard = document.createElement('div');
        keyCard.style.cssText = `
            padding: 15px;
            background: ${isCollected ? 'rgba(255, 215, 0, 0.1)' : 'rgba(100, 100, 100, 0.1)'};
            border: 2px solid ${isCollected ? '#ffd700' : '#666'};
            border-radius: 10px;
            display: flex;
            gap: 15px;
            align-items: center;
            cursor: ${isCollected ? 'pointer' : 'default'};
            opacity: ${isCollected ? '1' : '0.5'};
            transition: all 0.3s ease;
        `;
        
        if (isCollected) {
            keyCard.addEventListener('mouseenter', () => {
                keyCard.style.transform = 'scale(1.02)';
                keyCard.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
            });
            keyCard.addEventListener('mouseleave', () => {
                keyCard.style.transform = 'scale(1)';
                keyCard.style.boxShadow = 'none';
            });
            keyCard.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => showKeyDescription(planetName), 300);
            });
        }
        
        keyCard.innerHTML = `
            <div style="font-size: 40px;">${key.icon}</div>
            <div style="flex: 1; text-align: left;">
                <div style="color: ${isCollected ? '#ffd700' : '#666'}; font-weight: 700; margin-bottom: 5px;">
                    ${key.name}
                </div>
                <div style="color: #9ca3af; font-size: 12px;">
                    ${isCollected ? 'Click to view details' : 'Not yet collected'}
                </div>
            </div>
            ${isCollected ? '<div style="color: #55efc4; font-size: 20px;">✓</div>' : '<div style="color: #666; font-size: 20px;">🔒</div>'}
        `;
        
        keysList.appendChild(keyCard);
    });
    
    modal.classList.add('show');
}

function showKeyDescription(planetName) {
    const key = keyDescriptions[planetName];
    if (!key) return;
    
    let modal = document.getElementById('key-description-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'key-description-modal';
        modal.className = 'key-description-modal';
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    modal.innerHTML = `
        <div class="key-description-panel">
            <button class="close-key-desc">✕</button>
            <div class="key-description-icon">${key.icon}</div>
            <h2 class="key-description-title">${key.name}</h2>
            <div class="key-description-text">${key.description}</div>
        </div>
    `;
    
    modal.querySelector('.close-key-desc').addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    modal.classList.add('show');
}

const keyDescriptions = {
    belobog: {
        name: 'Belobog Candy Key',
        icon: '🍬',
        description: 'A sweet key forged from shared warmth in the frozen city.'
    },
    xianzhou: {
        name: 'Xianzhou Memory Key',
        icon: '📜',
        description: 'A key etched with a heartfelt vow, shining crimson.'
    },
    penacony: {
        name: 'Penacony Fortune Key',
        icon: '🎲',
        description: 'A playful key born from dream-chasing coin flips.'
    },
    jarilo: {
        name: 'Jarilo-VI Frozen Key',
        icon: '❄️',
        description: 'A crystal key pieced together under swirling snow.'
    },
    herta: {
        name: 'Herta Dimension Key',
        icon: '🧊',
        description: 'A holographic key made from recovered research fragments.'
    },
    luofu: {
        name: 'Luofu Lotus Key',
        icon: '🌸',
        description: 'A serene key that glows with riverlight memories.'
    },
    stellaron: {
        name: 'Stellaron Key',
        icon: '⭐',
        description: 'A star-forged key claimed from the shadow maze.'
    },
    terminus: {
        name: 'Terminus Key',
        icon: '🚪',
        description: 'The final key opening the way beyond the last door.'
    }
};

function initInteractiveStands() {
    const mapStand = document.getElementById('map-stand');
    if (mapStand) {
        mapStand.addEventListener('click', () => {
            showPlanetSelection();
        });
    }

    const logStand = document.getElementById('log-stand');
    if (logStand) {
        logStand.addEventListener('click', () => {
            showMissionLog();
        });
    }

    const invStand = document.getElementById('inv-stand');
    if (invStand) {
        invStand.addEventListener('click', () => {
            showInventory();
        });
    }
}

function showMissionLog() {
    let modal = document.getElementById('mission-log-modal');
    
    if (modal) {
        modal.remove();
        modal = null;
    }
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mission-log-modal';
        modal.className = 'stand-modal';
        modal.innerHTML = `
            <div class="stand-modal-panel">
                <div class="stand-modal-header">
                    <h2>📜 Mission Log</h2>
                    <button class="close-stand-modal">✕</button>
                </div>
                <div class="stand-modal-content">
                    <div class="mission-entry">
                        <div class="mission-title">🚂 Astral Express Journey</div>
                        <div class="mission-status">Status: <span class="status-active">In Progress</span></div>
                        <div class="mission-desc">
                            Travel across the universe, collecting keys from each world to unlock the path to Terminus.
                        </div>
                        <div class="mission-objectives">
                            <div class="objective-title">Objectives:</div>
                            <div class="objective-item ${collectedKeys.belobog ? 'complete' : ''}">
                                ${collectedKeys.belobog ? '✓' : '○'} Collect Belobog Key
                            </div>
                            <div class="objective-item ${collectedKeys.xianzhou ? 'complete' : ''}">
                                ${collectedKeys.xianzhou ? '✓' : '○'} Collect Xianzhou Key
                            </div>
                            <div class="objective-item ${collectedKeys.penacony ? 'complete' : ''}">
                                ${collectedKeys.penacony ? '✓' : '○'} Collect Penacony Key
                            </div>
                            <div class="objective-item ${collectedKeys.jarilo ? 'complete' : ''}">
                                ${collectedKeys.jarilo ? '✓' : '○'} Collect Jarilo-VI Key
                            </div>
                            <div class="objective-item ${collectedKeys.herta ? 'complete' : ''}">
                                ${collectedKeys.herta ? '✓' : '○'} Collect Herta Key
                            </div>
                            <div class="objective-item ${collectedKeys.luofu ? 'complete' : ''}">
                                ${collectedKeys.luofu ? '✓' : '○'} Collect Luofu Key
                            </div>
                            <div class="objective-item ${collectedKeys.stellaron ? 'complete' : ''}">
                                ${collectedKeys.stellaron ? '✓' : '○'} Collect Stellaron Key
                            </div>
                            <div class="objective-item ${collectedKeys.terminus ? 'complete' : ''}">
                                ${collectedKeys.terminus ? '✓' : '○'} Unlock Terminus Door
                            </div>
                        </div>
                    </div>
                    
                    <div class="mission-entry">
                        <div class="mission-title">🛰 Progress Summary</div>
                        <div class="progress-stats">
                            <div class="stat-item">
                                <span class="stat-label">Keys Collected:</span>
                                <span class="stat-value">${Object.values(collectedKeys).filter(v => v).length}/8</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Worlds Visited:</span>
                                <span class="stat-value">${Object.values(collectedKeys).filter(v => v).length}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Journey Status:</span>
                                <span class="stat-value">${Math.round((Object.values(collectedKeys).filter(v => v).length / 8) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close-stand-modal').addEventListener('click', () => {
            modal.classList.remove('show');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    modal.classList.add('show');
}

function showInventory() {
    let modal = document.getElementById('inventory-modal');
    if (modal) {
        modal.remove();
    }
    
    modal = document.createElement('div');
    modal.id = 'inventory-modal';
    modal.className = 'stand-modal';
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    const keysCollected = Object.values(collectedKeys).filter(v => v).length;
    
    let keysHTML = '';
    Object.keys(collectedKeys).forEach(planetName => {
        const isCollected = collectedKeys[planetName];
        const keyInfo = keyDescriptions[planetName] || { name: planetName, icon: '🔑' };
        
        keysHTML += `
            <div style="
                padding: 15px;
                background: ${isCollected ? 'rgba(255, 215, 0, 0.15)' : 'rgba(100, 100, 100, 0.1)'};
                border: 2px solid ${isCollected ? '#ffd700' : '#666'};
                border-radius: 10px;
                display: flex;
                gap: 15px;
                align-items: center;
                opacity: ${isCollected ? '1' : '0.5'};
                margin-bottom: 10px;
            ">
                <div style="font-size: 40px;">${keyInfo.icon}</div>
                <div style="flex: 1;">
                    <div style="color: ${isCollected ? '#ffd700' : '#666'}; font-weight: 700; margin-bottom: 5px;">
                        ${keyInfo.name}
                    </div>
                    <div style="color: #9ca3af; font-size: 12px;">
                        ${isCollected ? '✓ Collected' : '🔒 Locked'}
                    </div>
                </div>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="stand-modal-panel">
            <div class="stand-modal-header">
                <h2>🧳 Inventory</h2>
                <button class="close-stand-modal">✕</button>
            </div>
            <div class="stand-modal-content">
                <div style="margin-bottom: 20px; padding: 15px; background: rgba(255, 215, 0, 0.1); border-radius: 10px;">
                    <div style="color: #ffd700; font-size: 18px; font-weight: 700;">
                        Keys Collected: ${keysCollected}/8
                    </div>
                    <div style="color: #9ca3af; font-size: 14px; margin-top: 5px;">
                        Collect all keys to unlock the Terminus door
                    </div>
                </div>
                ${keysHTML}
            </div>
        </div>
    `;
    
    modal.querySelector('.close-stand-modal').addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    modal.classList.add('show');
}

function showCommunications() {
    alert('Communications console coming soon.');
}

window.openSettings = openSettings;
window.initInteractiveStands = initInteractiveStands;
window.showMissionLog = showMissionLog;
window.showInventory = showInventory;
window.showCommunications = showCommunications;
window.showCollectedKeysModal = showCollectedKeysModal;
