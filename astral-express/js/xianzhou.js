import { awardKey, saveProgress, gameState, setPenaconyTicketReady } from './state.js';
import { initEnhancements } from './enhancements.js';

document.addEventListener('DOMContentLoaded', () => {
    initEnhancements();
    initXianzhouScene();
});

function initXianzhouScene() {
    const xianzhouLabel = document.getElementById('xianzhou-label');
    const xianzhouShards = document.querySelectorAll('.xianzhou-glass-layer .glass-shard');
    const xianzhouBackPlanets = document.getElementById('xianzhou-back-planets');
    const xianzhouRedShard = document.getElementById('xianzhou-red-shard');

    // Regular shards - click to reveal memory
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

    // Red shard - write your own memory
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

                // Secret phrase unlocks Penacony
                if (trimmed === 'I love you, Miraizel') {
                    if (xianzhouLabel) {
                        xianzhouLabel.textContent =
                            'Your words resonate beyond — a distant dreamworld stirs awake. Penacony is now accessible.';
                    }
                    
                    setPenaconyTicketReady(true);
                    awardKey('xianzhou');
                    saveProgress(gameState);
                }
            }
        });
    }

    // Back to planets
    if (xianzhouBackPlanets) {
        xianzhouBackPlanets.addEventListener('click', () => {
            window.location.href = 'planet-selection.html';
        });
    }
}
