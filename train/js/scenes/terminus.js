import { awardKey, collectedKeys } from '../state.js';
import { showPlanetSelection } from '../navigation.js';

export function initTerminusScene() {
    const terminusDoor = document.getElementById('terminus-door');
    const terminusLabel = document.getElementById('terminus-label');
    const keyPuzzleOverlay = document.getElementById('key-puzzle-overlay');
    const closeKeyPuzzle = document.getElementById('close-key-puzzle');
    const keyholes = document.querySelectorAll('.keyhole');
    const keysContainer = document.getElementById('keys-container');
    const keyCountNum = document.getElementById('key-count-num');
    const terminusBackPlanets = document.getElementById('terminus-back-planets');

    let draggedKey = null;

    if (terminusDoor) {
        terminusDoor.addEventListener('click', () => {
            openKeyPuzzle();
        });
    }

    if (terminusBackPlanets) {
        terminusBackPlanets.addEventListener('click', () => {
            const terminusPortalEl = document.getElementById('terminus-portal');
            if (terminusPortalEl) terminusPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

    function openKeyPuzzle() {
        if (!keyPuzzleOverlay || !keysContainer) return;
        
        keysContainer.innerHTML = '';
        
        let collectedCount = 0;
        Object.entries(collectedKeys).forEach(([planet, collected]) => {
            if (collected && planet !== 'terminus') {
                collectedCount++;
                const keyElement = createKeyElement(planet);
                keysContainer.appendChild(keyElement);
            }
        });
        
        if (keyCountNum) {
            keyCountNum.textContent = collectedCount;
        }
        
        keyPuzzleOverlay.style.display = 'flex';
    }

    function createKeyElement(planet) {
        const keyDiv = document.createElement('div');
        keyDiv.className = 'draggable-key';
        keyDiv.setAttribute('data-planet', planet);
        keyDiv.draggable = true;
        
        const keyImg = document.createElement('img');
        keyImg.src = `assets/key-${planet}.svg`;
        keyImg.alt = `${planet} key`;
        keyImg.draggable = false;
        
        keyDiv.appendChild(keyImg);
        
        keyDiv.addEventListener('dragstart', handleKeyDragStart);
        keyDiv.addEventListener('dragend', handleKeyDragEnd);
        
        return keyDiv;
    }

    function handleKeyDragStart(e) {
        draggedKey = this;
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.getAttribute('data-planet'));
    }

    function handleKeyDragEnd() {
        this.style.opacity = '1';
        draggedKey = null;
    }

    keyholes.forEach(keyhole => {
        keyhole.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            keyhole.classList.add('drag-over');
        });

        keyhole.addEventListener('dragleave', () => {
            keyhole.classList.remove('drag-over');
        });

        keyhole.addEventListener('drop', handleKeyholeDrop);
    });

    function handleKeyholeDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        const planet = e.dataTransfer.getData('text/plain');
        const keyholePlanet = this.getAttribute('data-planet');

        if (planet && planet === keyholePlanet && draggedKey) {
            const keyholeSlot = this.querySelector('.keyhole-slot');
            
            if (keyholeSlot && !this.classList.contains('filled')) {
                const keyClone = draggedKey.cloneNode(true);
                keyClone.classList.add('placed-key');
                keyClone.draggable = false;
                keyholeSlot.appendChild(keyClone);
                
                this.classList.add('filled');
                draggedKey.remove();
                checkAllKeysPlaced();
            }
        }
        
        draggedKey = null;
    }

    function checkAllKeysPlaced() {
        const filledKeyholes = document.querySelectorAll('.keyhole.filled');
        if (filledKeyholes.length === 7) {
            setTimeout(() => {
                unlockTerminusDoor();
            }, 500);
        }
    }

    function unlockTerminusDoor() {
        if (keyPuzzleOverlay) {
            keyPuzzleOverlay.style.display = 'none';
        }
        
        if (terminusDoor) {
            terminusDoor.classList.add('unlocked', 'door-opening');
        }
        
        if (terminusLabel) {
            terminusLabel.textContent = '✓ The door opens... revealing a message of eternal love. ✓';
            terminusLabel.style.color = '#ffd700';
        }
        
        awardKey('terminus');
        
        setTimeout(() => {
            alert('🧭 Thank you for completing this journey! 🧭\n\nThis adventure was crafted with love.\nMay your own journey be filled with light and wonder.');
        }, 1500);
    }

    if (closeKeyPuzzle) {
        closeKeyPuzzle.addEventListener('click', () => {
            if (keyPuzzleOverlay) {
                keyPuzzleOverlay.style.display = 'none';
            }
        });
    }

    if (keyPuzzleOverlay) {
        keyPuzzleOverlay.addEventListener('click', (e) => {
            if (e.target === keyPuzzleOverlay) {
                keyPuzzleOverlay.style.display = 'none';
            }
        });
    }
}
