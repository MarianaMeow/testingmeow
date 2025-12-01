import { gameState } from './state.js';

let showMainMenu = () => {};
let showPlanetSelection = () => {};
let showDestinationPortal = () => {};

export { showMainMenu, showPlanetSelection, showDestinationPortal };

export function initNavigation() {
    const mainMenu = document.getElementById('main-menu');
    const planetSelection = document.getElementById('planet-selection');
    const destinationPortal = document.getElementById('destination-portal');
    const planetLabel = document.getElementById('planet-label');
    const destinationLabel = document.getElementById('destination-label');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const backToPlanetsBtn = document.getElementById('back-to-planets');
    const stands = document.querySelectorAll('.object-stand');

    showMainMenu = () => {
        if (mainMenu) mainMenu.style.display = 'flex';
        if (planetSelection) planetSelection.style.display = 'none';
        if (destinationPortal) destinationPortal.style.display = 'none';
    };

    showPlanetSelection = () => {
        if (mainMenu) mainMenu.style.display = 'none';
        if (planetSelection) planetSelection.style.display = 'flex';
        if (destinationPortal) destinationPortal.style.display = 'none';
    };

    showDestinationPortal = (planetKey) => {
        if (!planetSelection) return;

        planetSelection.style.display = 'none';
        if (destinationPortal) destinationPortal.style.display = 'none';

        const xianzhouPortal = document.getElementById('xianzhou-portal');
        if (xianzhouPortal) xianzhouPortal.style.display = 'none';

        let text = 'Destination portal initialized.';

        if (planetKey === 'belobog') {
            if (destinationPortal) destinationPortal.style.display = 'flex';
            text = 'Belobog Portal: You step into the frozen-yet-warm city under the aegis of the Astral Express.';
        } else if (planetKey === 'xianzhou') {
            const xianzhouPortalEl = document.getElementById('xianzhou-portal');
            if (xianzhouPortalEl) xianzhouPortalEl.style.display = 'flex';
            text = 'Xianzhou Luofu Portal: A field of fractured glass, holding quiet memories.';
        } else if (planetKey === 'penacony') {
            const penaconyPortalEl = document.getElementById('penacony-portal');
            if (penaconyPortalEl) penaconyPortalEl.style.display = 'flex';
            text = 'Penacony Portal: A dreamscape where your words have opened the way.';
        } else if (planetKey === 'jarilo') {
            const jariloPortalEl = document.getElementById('jarilo-portal');
            if (jariloPortalEl) jariloPortalEl.style.display = 'flex';
            text = 'Jarilo-VI Portal: A frozen world where time stands still.';
        } else if (planetKey === 'herta') {
            const hertaPortalEl = document.getElementById('herta-portal');
            if (hertaPortalEl) hertaPortalEl.style.display = 'flex';
            text = 'Herta Station Portal: Advanced research facility of the Genius Society.';
        } else if (planetKey === 'luofu') {
            const luofuPortalEl = document.getElementById('luofu-portal');
            if (luofuPortalEl) luofuPortalEl.style.display = 'flex';
            text = 'Luofu Sanctum Portal: A tranquil sanctuary where nature and memory intertwine.';
        } else if (planetKey === 'stellaron') {
            const stellaronPortalEl = document.getElementById('stellaron-portal');
            if (stellaronPortalEl) stellaronPortalEl.style.display = 'flex';
            text = 'Stellaron Portal: A corrupted force that devours light and hope...';
        } else if (planetKey === 'terminus') {
            const terminusPortalEl = document.getElementById('terminus-portal');
            if (terminusPortalEl) terminusPortalEl.style.display = 'flex';
            text = 'Terminus Portal: The final threshold awaits...';
        }

        if (destinationLabel) destinationLabel.textContent = text;
    };

    stands.forEach(stand => {
        const target = stand.getAttribute('data-target');

        stand.addEventListener('click', () => {
            if (target === 'map') {
                if (planetLabel) {
                    planetLabel.textContent = 'Current route: Belobog (unlocked). Future destinations visible but locked.';
                }
                showPlanetSelection();
            }
        });
    });

    if (planetSelection) {
        const planetOptions = planetSelection.querySelectorAll('.planet-option');
        planetOptions.forEach(option => {
            option.addEventListener('click', () => {
                const planetKey = option.getAttribute('data-planet');
                const invStand = document.getElementById('inv-stand');
                const xianzhouTicketReady =
                    (invStand && invStand.getAttribute('data-ticket-xianzhou') === 'ready');

                if (planetKey === 'xianzhou' && xianzhouTicketReady) {
                    option.classList.remove('locked');
                    option.classList.add('unlocked');
                }

                if (planetKey === 'penacony' && gameState.penaconyTicketReady) {
                    option.classList.remove('locked');
                    option.classList.add('unlocked');
                }

                if (option.classList.contains('locked')) {
                    if (planetLabel) {
                        if (planetKey === 'xianzhou') {
                            planetLabel.textContent =
                                'Xianzhou Luofu is locked. Clear the Belobog Oath to attune its boarding pass.';
                        } else if (planetKey === 'penacony') {
                            planetLabel.textContent =
                                'Penacony remains sealed. Etch the true red shard vow to awaken its ticket.';
                        } else if (planetKey === 'jarilo') {
                            planetLabel.textContent =
                                'Jarilo-VI is locked. Complete the Penacony trials to unlock this frozen world.';
                        } else if (planetKey === 'herta') {
                            planetLabel.textContent =
                                'Herta Station is locked. Continue your journey to access this research facility.';
                        } else if (planetKey === 'luofu') {
                            planetLabel.textContent =
                                'Luofu Sanctum is locked. The path forward requires more trials completed.';
                        } else if (planetKey === 'stellaron') {
                            planetLabel.textContent =
                                'Stellaron is locked. Only those who have traveled far may approach this mystery.';
                        } else if (planetKey === 'terminus') {
                            planetLabel.textContent =
                                'Terminus is locked. The final destination awaits those who complete all trials.';
                        } else {
                            planetLabel.textContent =
                                'This destination is locked for now. Clear current trials to forge the route.';
                        }
                    }
                    return;
                }

                showDestinationPortal(planetKey);
            });
        });
    }

    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            showMainMenu();
        });
    }

    if (backToPlanetsBtn) {
        backToPlanetsBtn.addEventListener('click', () => {
            showPlanetSelection();
        });
    }
}
