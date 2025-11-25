// ========================================
// KEYBOARD SHORTCUTS SYSTEM
// ========================================

export class KeyboardManager {
    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            // Don't trigger shortcuts when typing in input fields (except ESC and Enter)
            const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
            if (isTyping && !['Escape', 'Enter'].includes(e.key)) return;

            const key = e.key.toLowerCase();
            const handler = this.shortcuts.get(key);
            
            if (handler) {
                e.preventDefault();
                handler(e);
            }
        });
    }

    register(key, handler, description = '') {
        this.shortcuts.set(key.toLowerCase(), handler);
        console.log(`[Keyboard] Registered: ${key} - ${description}`);
    }

    unregister(key) {
        this.shortcuts.delete(key.toLowerCase());
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    getShortcuts() {
        return Array.from(this.shortcuts.keys());
    }
}

// Global keyboard manager instance
export const keyboard = new KeyboardManager();

// Register default shortcuts
export function registerDefaultShortcuts() {
    // ESC - Close modals/go back
    keyboard.register('escape', () => {
        const openModal = document.querySelector('.key-puzzle-overlay[style*="flex"]');
        const openInventory = document.querySelector('.inventory-overlay[style*="flex"]');
        
        if (openModal) {
            openModal.style.display = 'none';
        } else if (openInventory) {
            openInventory.style.display = 'none';
        }
    }, 'Close modal/go back');

    // M - Toggle mute
    keyboard.register('m', () => {
        const muteBtn = document.getElementById('mute-toggle');
        if (muteBtn) muteBtn.click();
    }, 'Toggle mute');

    // S - Open settings
    keyboard.register('s', () => {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.toggle('open');
        }
    }, 'Open settings');

    // H - Open help
    keyboard.register('h', () => {
        alert('🎮 Keyboard Shortcuts:\n\nESC - Close modal\nEnter - Submit\nM - Mute\nS - Settings\nH - Help\n1-8 - Jump to planets');
    }, 'Show help');

    // Number keys 1-8 for planet quick access
    const planets = ['belobog', 'xianzhou', 'penacony', 'jarilo', 'herta', 'luofu', 'stellaron', 'terminus'];
    planets.forEach((planet, index) => {
        keyboard.register((index + 1).toString(), () => {
            const planetOrb = document.querySelector(`.planet-option[data-planet="${planet}"]`);
            if (planetOrb && planetOrb.classList.contains('unlocked')) {
                planetOrb.click();
            }
        }, `Jump to ${planet}`);
    });

    console.log('[Keyboard] Default shortcuts registered');
}
