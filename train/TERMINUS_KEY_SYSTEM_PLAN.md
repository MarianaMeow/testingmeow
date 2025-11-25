# Terminus Key System - Implementation Plan

## Overview
Add a key collection system where users must collect 8 unique themed keys (one from each planet) to unlock the Terminus door through an interactive drag-and-drop puzzle.

## System Architecture

### 1. Storage System (train/js/storage.js)
**Add to progress tracking:**
```javascript
collectedKeys: {
    belobog: false,
    xianzhou: false,
    penacony: false,
    jarilo: false,
    herta: false,
    luofu: false,
    stellaron: false,
    terminus: false  // Special key from completing all others
}
```

### 2. Key Visual Assets (train/assets/)
**Create 8 unique SVG key icons themed to each planet:**
- `key-belobog.svg` - Candy/sweet themed (🍭 style)
- `key-xianzhou.svg` - Glass shard/mirror themed
- `key-penacony.svg` - Dreamscape/ethereal themed
- `key-jarilo.svg` - Frozen/ice crystal themed
- `key-herta.svg` - Tech/geometric themed
- `key-luofu.svg` - Nature/lotus themed
- `key-stellaron.svg` - Dark/corrupted themed
- `key-terminus.svg` - Golden/final themed

### 3. Key Award Logic
**Modify each planet's completion function to award a key:**

- `checkAllTrialsComplete()` → Award Belobog key
- Xianzhou red shard completion → Award Xianzhou key
- `completeGame()` (Penacony) → Award Penacony key
- `completePuzzle()` (Jarilo) → Award Jarilo key
- Herta dimension puzzle → Award Herta key
- `completeStoneGame()` (Luofu) → Award Luofu key
- `winMaze()` (Stellaron) → Award Stellaron key

### 4. Door Unlock Modal (train/index.html)
**Add new modal overlay for the key puzzle:**

```html
<div id="terminus-key-modal" class="terminus-key-modal" style="display: none;">
    <div class="key-puzzle-container">
        <div class="key-puzzle-header">
            <h2>The Terminus Door</h2>
            <p>Place each key in its matching keyhole to unlock the door</p>
        </div>
        
        <div class="key-puzzle-content">
            <!-- Left side: Keyhole grid (8 keyholes) -->
            <div class="keyhole-grid">
                <div class="keyhole" data-planet="belobog"></div>
                <div class="keyhole" data-planet="xianzhou"></div>
                <div class="keyhole" data-planet="penacony"></div>
                <div class="keyhole" data-planet="jarilo"></div>
                <div class="keyhole" data-planet="herta"></div>
                <div class="keyhole" data-planet="luofu"></div>
                <div class="keyhole" data-planet="stellaron"></div>
                <div class="keyhole" data-planet="terminus"></div>
            </div>
            
            <!-- Right side: Collected keys -->
            <div class="collected-keys-panel">
                <h3>Your Keys</h3>
                <div id="collected-keys-container" class="keys-container">
                    <!-- Keys dynamically added here -->
                </div>
            </div>
        </div>
        
        <button id="close-key-modal" class="close-key-modal">Close</button>
    </div>
</div>
```

### 5. Drag-and-Drop Logic (train/script.js)
**Add new interaction system:**

```javascript
// Terminus door click handler
terminusDoor.addEventListener('click', () => {
    openKeyPuzzleModal();
});

function openKeyPuzzleModal() {
    const modal = document.getElementById('terminus-key-modal');
    const keysContainer = document.getElementById('collected-keys-container');
    
    // Clear and populate with collected keys
    keysContainer.innerHTML = '';
    
    // Load from storage and display collected keys
    const progress = loadProgress();
    if (progress && progress.collectedKeys) {
        Object.entries(progress.collectedKeys).forEach(([planet, collected]) => {
            if (collected) {
                const keyElement = createKeyElement(planet);
                keysContainer.appendChild(keyElement);
            }
        });
    }
    
    modal.style.display = 'flex';
}

function createKeyElement(planet) {
    const key = document.createElement('div');
    key.className = 'draggable-key';
    key.setAttribute('data-planet', planet);
    key.draggable = true;
    
    // Add SVG icon
    const icon = document.createElement('img');
    icon.src = `assets/key-${planet}.svg`;
    icon.alt = `${planet} key`;
    key.appendChild(icon);
    
    // Drag events
    key.addEventListener('dragstart', handleKeyDragStart);
    key.addEventListener('dragend', handleKeyDragEnd);
    
    return key;
}

let draggedKey = null;

function handleKeyDragStart(e) {
    draggedKey = this;
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
}

function handleKeyDragEnd(e) {
    this.style.opacity = '1';
}

// Keyhole drop handlers
document.querySelectorAll('.keyhole').forEach(keyhole => {
    keyhole.addEventListener('dragover', handleKeyholeOver);
    keyhole.addEventListener('dragleave', handleKeyholeLeave);
    keyhole.addEventListener('drop', handleKeyholeDropfunction handleKeyholeOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedKey) return;
    
    const keyholePlanet = this.getAttribute('data-planet');
    const keyPlanet = draggedKey.getAttribute('data-planet');
    
    // Visual feedback: green if match, red if wrong
    if (keyholePlanet === keyPlanet) {
        this.classList.add('keyhole-match');
    } else {
        this.classList.add('keyhole-wrong');
    }
}

function handleKeyholeLeave() {
    this.classList.remove('keyhole-match', 'keyhole-wrong');
}

function handleKeyholeDrop(e) {
    e.preventDefault();
    this.classList.remove('keyhole-match', 'keyhole-wrong');
    
    if (!draggedKey) return;
    
    const keyholePlanet = this.getAttribute('data-planet');
    const keyPlanet = draggedKey.getAttribute('data-planet');
    
    // Only accept matching keys
    if (keyholePlanet === keyPlanet && !this.classList.contains('filled')) {
        // Insert key into keyhole
        this.appendChild(draggedKey.cloneNode(true));
        this.classList.add('filled');
        
        // Remove from collected keys panel
        draggedKey.remove();
        
        // Check if all keyholes are filled
        checkAllKeysPlaced();
    }
    
    draggedKey = null;
}

function checkAllKeysPlaced() {
    const keyholes = document.querySelectorAll('.keyhole');
    const allFilled = Array.from(keyholes).every(kh => kh.classList.contains('filled'));
    
    if (allFilled) {
        // All keys placed correctly!
        setTimeout(() => {
            unlockTerminusDoor();
        }, 500);
    }
}

function unlockTerminusDoor() {
    const modal = document.getElementById('terminus-key-modal');
    const terminusDoor = document.getElementById('terminus-door');
    const terminusLabel = document.getElementById('terminus-label');
    
    // Close modal
    modal.style.display = 'none';
    
    // Animate door opening
    terminusDoor.classList.add('unlocked', 'door-opening');
    
    if (terminusLabel) {
        terminusLabel.textContent = '✨ The door opens... revealing a message of eternal love. ✨';
        terminusLabel.style.color = '#ffd700';
    }
    
    // Show completion message
    setTimeout(() => {
        alert('🌟 Thank you for completing this journey! 🌟\n\nThis adventure was crafted with love.\nMay your own journey be filled with light and wonder.');
    }, 1500);
    
    saveProgress();
}
```

### 6. Styling (train/main.css or new file)
**Add CSS for the key puzzle modal:**

```css
.terminus-key-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.key-puzzle-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 3px solid #ffd700;
    border-radius: 20px;
    padding: 40px;
    max-width: 900px;
    width: 90%;
    box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
}

.key-puzzle-header {
    text-align: center;
    margin-bottom: 30px;
}

.key-puzzle-header h2 {
    color: #ffd700;
    font-size: 32px;
    margin-bottom: 10px;
}

.key-puzzle-content {
    display: flex;
    gap: 40px;
    justify-content: space-between;
}

.keyhole-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    flex: 1;
}

.keyhole {
    width: 120px;
    height: 120px;
    border: 3px dashed #666;
    border-radius: 15px;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
    position: relative;
}

.keyhole.keyhole-match {
    border-color: #55efc4;
    background: rgba(85, 239, 196, 0.2);
    box-shadow: 0 0 20px rgba(85, 239, 196, 0.5);
}

.keyhole.keyhole-wrong {
    border-color: #e94560;
    background: rgba(233, 69, 96, 0.2);
    box-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
}

.keyhole.filled {
    border-color: #ffd700;
    background: rgba(255, 215, 0, 0.2);
}

.collected-keys-panel {
    flex: 1;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid #444;
    border-radius: 15px;
    padding: 20px;
}

.collected-keys-panel h3 {
    color: #ffd700;
    margin-bottom: 15px;
    text-align: center;
}

.keys-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.draggable-key {
    width: 80px;
    height: 80px;
    cursor: grab;
    transition: all 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid #ffd700;
    border-radius: 10px;
}

.draggable-key:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

.draggable-key:active {
    cursor: grabbing;
}

.draggable-key img {
    width: 60px;
    height: 60px;
    object-fit: contain;
}

.close-key-modal {
    margin-top: 30px;
    padding: 12px 30px;
    background: #e94560;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
}

.close-key-modal:hover {
    background: #ff6b6b;
    transform: translateY(-2px);
}

/* Door opening animation */
.mysterious-door.door-opening .door-panel {
    animation: doorOpen 2s ease forwards;
}

@keyframes doorOpen {
    0% {
        transform: perspective(1000px) rotateY(0deg);
    }
    100% {
        transform: perspective(1000px) rotateY(-120deg);
        opacity: 0.3;
    }
}
```

## Implementation Steps

1. **Phase 1: Storage & Key Award System**
   - Update storage.js with collectedKeys tracking
   - Modify each planet completion function to award keys
   - Test key collection persistence

2. **Phase 2: Key Visual Assets**
   - Create 8 SVG key designs (or use emoji/Unicode as placeholders)
   - Add to train/assets/ folder

3. **Phase 3: Modal UI**
   - Add HTML structure for key puzzle modal
   - Add CSS styling
   - Test modal open/close

4. **Phase 4: Drag-and-Drop Logic**
   - Implement drag handlers for keys
   - Implement drop handlers for keyholes
   - Add visual feedback (hover states)
   - Test matching logic

5. **Phase 5: Door Unlock Animation**
   - Add door opening animation
   - Connect to completion message
   - Test full flow

6. **Phase 6: Polish & Testing**
   - Add sound effects (optional)
   - Test with all planets completed
   - Test with partial completion
   - Test progress persistence

## Future Enhancements (Optional)
- Mission Log integration: Show key collection progress
- Inventory integration: View collected keys from inventory stand
- Key descriptions/lore when hovering
- Particle effects when placing keys
- Sound effects for correct/wrong placement
- Animated key collection when completing planets
