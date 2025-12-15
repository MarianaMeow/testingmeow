import { awardKey, saveProgress, gameState, setPenaconyTicketReady } from '../state.js';
import { showPlanetSelection } from '../navigation.js';

export function initXianzhouScene() {
    const xianzhouLabel = document.getElementById('xianzhou-label');
    const xianzhouShards = document.querySelectorAll('.xianzhou-glass-layer .glass-shard');
    const xianzhouBackPlanets = document.getElementById('xianzhou-back-planets');
    const xianzhouRedShard = document.getElementById('xianzhou-red-shard');

    if (xianzhouShards.length) {
        xianzhouShards.forEach(shard => {
            if (shard.id === 'xianzhou-red-shard') return;

            shard.addEventListener('click', () => {
                const memory = shard.getAttribute('data-memory') || '';
                if (!memory) return;
                shard.setAttribute('data-active', 'true');
            });
        });
    }

    if (xianzhouRedShard) {
        xianzhouRedShard.addEventListener('click', () => {
            const existing = xianzhouRedShard.getAttribute('data-memory') || '';
            const userText = window.prompt(
                'Write your own memory on this red shard:',
                existing
            );

            if (userText && userText.trim()) {
                const trimmed = userText.trim();
                xianzhouRedShard.setAttribute('data-memory', trimmed);
                xianzhouRedShard.setAttribute('data-active', 'true');

                if (xianzhouLabel) {
                    xianzhouLabel.textContent = 'Your red shard has been etched.';
                }

                if (trimmed === 'Wanting more will be the death of us.') {
                    if (xianzhouLabel) {
                        xianzhouLabel.textContent =
                            'Your words resonate beyond — a distant dreamworld stirs awake. Penacony is now accessible.';
                    }
                    
                    const penaconyOrb = document.querySelector('.planet-option[data-planet="penacony"]');
                    if (penaconyOrb) {
                        penaconyOrb.classList.remove('locked');
                        penaconyOrb.classList.add('unlocked');
                    }
                    
                    setPenaconyTicketReady(true);
                    awardKey('xianzhou');
                    saveProgress(gameState);
                }
            }
        });
    }

    if (xianzhouBackPlanets) {
        xianzhouBackPlanets.addEventListener('click', () => {
            const xianzhouPortalEl = document.getElementById('xianzhou-portal');
            if (xianzhouPortalEl) xianzhouPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }
}
