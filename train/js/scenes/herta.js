import { awardKey, saveProgress, gameState } from '../state.js';
import { showPlanetSelection } from '../navigation.js';

export function initHertaScene() {
    const hertaBackPlanets = document.getElementById('herta-back-planets');
    if (hertaBackPlanets) {
        hertaBackPlanets.addEventListener('click', () => {
            const hertaPortalEl = document.getElementById('herta-portal');
            if (hertaPortalEl) hertaPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

    const dimensionPortalBtn = document.getElementById('dimension-portal-btn');
    const dimensionSpace = document.getElementById('dimension-space');
    const dimensionBackBtn = document.getElementById('dimension-back-btn');
    const missingPiece = document.getElementById('missing-piece');
    const hertaPuzzleStatus = document.getElementById('herta-puzzle-status');

    if (dimensionPortalBtn) {
        dimensionPortalBtn.addEventListener('click', () => {
            if (dimensionSpace) {
                dimensionSpace.style.display = 'flex';
            }
        });
    }

    if (dimensionBackBtn) {
        dimensionBackBtn.addEventListener('click', () => {
            if (dimensionSpace) {
                dimensionSpace.style.display = 'none';
            }
        });
    }

    if (missingPiece) {
        missingPiece.addEventListener('click', () => {
            missingPiece.style.animation = 'collect-piece 0.6s ease forwards';
            
            setTimeout(() => {
                if (dimensionSpace) {
                    dimensionSpace.style.display = 'none';
                }

                const missingSlot = document.querySelector('.research-piece.missing');
                if (missingSlot) {
                    missingSlot.classList.remove('missing');
                    missingSlot.classList.add('completed');
                    missingSlot.textContent = '5';
                }

                if (hertaPuzzleStatus) {
                    hertaPuzzleStatus.textContent = 'Fragment retrieved! Analysis complete.';
                    hertaPuzzleStatus.style.color = '#40ff80';
                }

                const researchPuzzle = document.querySelector('.research-puzzle');
                if (researchPuzzle) {
                    researchPuzzle.style.boxShadow = '0 0 50px rgba(64, 255, 128, 0.8)';
                    researchPuzzle.style.borderColor = 'rgba(64, 255, 128, 0.8)';
                }

                const luofuOrb = document.querySelector('.planet-option[data-planet="luofu"]');
                if (luofuOrb) {
                    luofuOrb.classList.remove('locked');
                    luofuOrb.classList.add('unlocked');
                }
                
                awardKey('herta');
                saveProgress(gameState);
            }, 600);
        });
    }
}
