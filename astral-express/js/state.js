import { saveProgress, loadProgress, applyProgress, clearProgress } from './storage.js';

// Shared game state across all scenes
export const gameState = {
    collectedKeys: {
        belobog: false,
        xianzhou: false,
        penacony: false,
        jarilo: false,
        herta: false,
        luofu: false,
        stellaron: false,
        terminus: false
    },
    trial1Complete: false,
    trial2Complete: false,
    trial3Complete: false,
    problemsSolved: 0,
    collectedCount: 0,
    penaconyTicketReady: false
};

export const collectedKeys = gameState.collectedKeys;

export function setPenaconyTicketReady(isReady) {
    gameState.penaconyTicketReady = isReady;
}

export function showKeyNotification(planetName) {
    const notification = document.createElement('div');
    notification.className = 'key-notification';
    notification.innerHTML = `
        <div class="key-notification-content">
            <span class="key-icon">🔑</span>
            <span class="key-text">${planetName.charAt(0).toUpperCase() + planetName.slice(1)} Key Collected!</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

export function updateProgressBar() {
    const trainCars = document.querySelectorAll('.train-car');
    trainCars.forEach(car => {
        const planet = car.getAttribute('data-planet');
        if (!planet) return;
        if (gameState.collectedKeys[planet]) {
            car.classList.add('completed');
        } else {
            car.classList.remove('completed');
        }
    });
}

export function awardKey(planetName) {
    if (!gameState.collectedKeys[planetName]) {
        gameState.collectedKeys[planetName] = true;
        saveProgress(gameState);
        showKeyNotification(planetName);
        updateProgressBar();
    }
}

// Convenience re-exports for storage helpers
export { saveProgress, loadProgress, applyProgress, clearProgress };