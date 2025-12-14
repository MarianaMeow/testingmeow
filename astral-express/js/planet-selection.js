import { collectedKeys, gameState } from './state.js';
import { initEnhancements } from './enhancements.js';

document.addEventListener('DOMContentLoaded', () => {
    initEnhancements();
    initPlanetSelection();
});

function initPlanetSelection() {
    const backToMenuBtn = document.getElementById('back-to-menu');
    const planetLabel = document.getElementById('planet-label');
    const planetOptions = document.querySelectorAll('.planet-option');

    // Update planet unlock states based on game progress
    updatePlanetStates();

    planetOptions.forEach(option => {
        option.addEventListener('click', () => {
            const planetKey = option.getAttribute('data-planet');

            if (option.classList.contains('locked')) {
                showLockedMessage(planetKey, planetLabel);
                return;
            }

            // Navigate to planet page
            window.location.href = `${planetKey}.html`;
        });
    });

    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            window.location.href = 'main-menu.html';
        });
    }
}

function updatePlanetStates() {
    // Check if xianzhou should be unlocked (belobog key collected)
    if (collectedKeys.belobog) {
        const xianzhou = document.querySelector('[data-planet="xianzhou"]');
        if (xianzhou) {
            xianzhou.classList.remove('locked');
            xianzhou.classList.add('unlocked');
        }
    }

    // Check if penacony should be unlocked (xianzhou key collected)
    if (collectedKeys.xianzhou) {
        const penacony = document.querySelector('[data-planet="penacony"]');
        if (penacony) {
            penacony.classList.remove('locked');
            penacony.classList.add('unlocked');
        }
    }

    // Check if jarilo should be unlocked (penacony key collected)
    if (collectedKeys.penacony) {
        const jarilo = document.querySelector('[data-planet="jarilo"]');
        if (jarilo) {
            jarilo.classList.remove('locked');
            jarilo.classList.add('unlocked');
        }
    }

    // Check if herta should be unlocked (jarilo key collected)
    if (collectedKeys.jarilo) {
        const herta = document.querySelector('[data-planet="herta"]');
        if (herta) {
            herta.classList.remove('locked');
            herta.classList.add('unlocked');
        }
    }

    // Check if luofu should be unlocked (herta key collected)
    if (collectedKeys.herta) {
        const luofu = document.querySelector('[data-planet="luofu"]');
        if (luofu) {
            luofu.classList.remove('locked');
            luofu.classList.add('unlocked');
        }
    }

    // Check if stellaron should be unlocked (luofu key collected)
    if (collectedKeys.luofu) {
        const stellaron = document.querySelector('[data-planet="stellaron"]');
        if (stellaron) {
            stellaron.classList.remove('locked');
            stellaron.classList.add('unlocked');
        }
    }

    // Check if terminus should be unlocked (all other keys collected)
    const allKeysExceptTerminus = ['belobog', 'xianzhou', 'penacony', 'jarilo', 'herta', 'luofu', 'stellaron'];
    const allCollected = allKeysExceptTerminus.every(key => collectedKeys[key]);
    if (allCollected) {
        const terminus = document.querySelector('[data-planet="terminus"]');
        if (terminus) {
            terminus.classList.remove('locked');
            terminus.classList.add('unlocked');
        }
    }
}

function showLockedMessage(planetKey, labelEl) {
    if (!labelEl) return;

    const messages = {
        xianzhou: 'Xianzhou Luofu is locked. Clear the Belobog Oath to attune its boarding pass.',
        penacony: 'Penacony remains sealed. Complete Xianzhou to awaken its ticket.',
        jarilo: 'Jarilo-VI is locked. Complete Penacony to unlock this frozen world.',
        herta: 'Herta Station is locked. Continue your journey to access this research facility.',
        luofu: 'Luofu Sanctum is locked. The path forward requires more trials completed.',
        stellaron: 'Stellaron is locked. Only those who have traveled far may approach this mystery.',
        terminus: 'Terminus is locked. The final destination awaits those who complete all trials.'
    };

    labelEl.textContent = messages[planetKey] || 'This destination is locked. Clear current trials to forge the route.';
}
