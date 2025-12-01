import { awardKey, saveProgress, gameState } from '../state.js';
import { showPlanetSelection } from '../navigation.js';

export function initJariloScene() {
    const jariloBackPlanets = document.getElementById('jarilo-back-planets');
    if (jariloBackPlanets) {
        jariloBackPlanets.addEventListener('click', () => {
            const jariloPortalEl = document.getElementById('jarilo-portal');
            if (jariloPortalEl) jariloPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

    const puzzlePieces = document.querySelectorAll('.puzzle-piece');
    const puzzleSlots = document.querySelectorAll('.puzzle-slot');
    const piecesCollectedEl = document.getElementById('pieces-collected');
    const totalPieces = 9;
    let draggedPiece = null;

    if (piecesCollectedEl) {
        piecesCollectedEl.textContent = gameState.collectedCount;
    }

    puzzlePieces.forEach(piece => {
        piece.addEventListener('dragstart', (e) => {
            draggedPiece = piece;
            piece.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        });

        piece.addEventListener('dragend', () => {
            piece.style.opacity = '1';
        });
    });

    puzzleSlots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (!slot.classList.contains('filled')) {
                slot.style.background = 'rgba(255, 215, 0, 0.3)';
            }
        });

        slot.addEventListener('dragleave', () => {
            slot.style.background = '';
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.style.background = '';

            if (draggedPiece && !slot.classList.contains('filled')) {
                const piecePosition = draggedPiece.getAttribute('data-position');
                const slotPosition = slot.getAttribute('data-position');

                if (piecePosition === slotPosition) {
                    draggedPiece.classList.add('placed');
                    draggedPiece.style.position = 'static';
                    draggedPiece.draggable = false;
                    
                    slot.appendChild(draggedPiece);
                    slot.classList.add('filled');
                    
                    gameState.collectedCount++;
                    if (piecesCollectedEl) {
                        piecesCollectedEl.textContent = gameState.collectedCount;
                    }

                    if (gameState.collectedCount === totalPieces) {
                        setTimeout(() => {
                            completePuzzle();
                        }, 500);
                    }

                    saveProgress(gameState);
                }
                
                draggedPiece = null;
            }
        });
    });

    function completePuzzle() {
        const puzzleFrame = document.querySelector('.puzzle-frame');
        const puzzleGrid = document.querySelector('.puzzle-grid-container');
        
        if (puzzleFrame && puzzleGrid) {
            puzzleSlots.forEach(slot => {
                slot.style.border = 'none';
            });
            
            puzzleFrame.style.boxShadow = '0 0 60px rgba(255, 215, 0, 0.9), 0 0 80px rgba(255, 150, 255, 0.7)';
            puzzleFrame.style.border = '3px solid rgba(255, 215, 0, 0.9)';
            puzzleGrid.style.border = '3px solid rgba(255, 215, 0, 0.6)';

            const hertaOrb = document.querySelector('.planet-option[data-planet="herta"]');
            if (hertaOrb) {
                hertaOrb.classList.remove('locked');
                hertaOrb.classList.add('unlocked');
            }
            
            awardKey('jarilo');
            saveProgress(gameState);
        }
    }
}
