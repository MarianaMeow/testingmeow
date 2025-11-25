// ========================================
// GLOBAL GAME STATE (accessible to all functions)
// ========================================
let collectedKeys = {
    belobog: false,
    xianzhou: false,
    penacony: false,
    jarilo: false,
    herta: false,
    luofu: false,
    stellaron: false,
    terminus: false
};

document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password-input');
    const submitBtn = document.getElementById('submit-btn');
    const message = document.getElementById('message');
    const hint = document.getElementById('hint');
    const welcomeScreen = document.getElementById('welcome-screen');
    const loadingScreen = document.getElementById('loading-screen');
    const mainMenu = document.getElementById('main-menu');
    const planetSelection = document.getElementById('planet-selection');
    const destinationPortal = document.getElementById('destination-portal');

    let attempts = 0;
    const correctPassword = 'maria';

    // ========================================
    // GAME STATE VARIABLES
    // ========================================
    let trial1Complete = false;
    let trial2Complete = false;
    let trial3Complete = false;
    let problemsSolved = 0;
    let collectedCount = 0;
    let penaconyTicketReady = false;

    // ========================================
    // KEY COLLECTION SYSTEM
    // ========================================
    function awardKey(planetName) {
        if (!collectedKeys[planetName]) {
            collectedKeys[planetName] = true;
            console.log(`🔑 Key collected: ${planetName}`);
            saveProgress();
            
            // Show notification
            showKeyNotification(planetName);
            
            // Update progress bar
            updateProgressBar();
            onKeyCollected(planetName);
        }
    }

    function showKeyNotification(planetName) {
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

    // ========================================
    // SESSION STORAGE PROGRESS SYSTEM
    // Progress cleared when tab/browser closes
    // ========================================
    const STORAGE_KEY = 'astralExpressProgress';

    function saveProgress() {
        const progress = {
            unlockedPlanets: [],
            completedTrials: {
                belobog1: trial1Complete,
                belobog2: trial2Complete,
                belobog3: trial3Complete
            },
            penaconyShards: problemsSolved,
            xianzhouRedShardText: document.getElementById('xianzhou-red-shard')?.getAttribute('data-memory') || '',
            jariloCollectedPieces: collectedCount
        };

        // Collect unlocked planets
        document.querySelectorAll('.planet-option.unlocked').forEach(planet => {
            const planetKey = planet.getAttribute('data-planet');
            if (planetKey) progress.unlockedPlanets.push(planetKey);
        });

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }

    function loadProgress() {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (!saved) return null;

        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load progress:', e);
            return null;
        }
    }

    function applyProgress(progress) {
        if (!progress) return;

        // Always show login screen on refresh (removed auto-skip)
        // Progress will be applied after successful login

        // Unlock planets
        progress.unlockedPlanets.forEach(planetKey => {
            const planet = document.querySelector(`.planet-option[data-planet="${planetKey}"]`);
            if (planet) {
                planet.classList.remove('locked');
                planet.classList.add('unlocked');
            }
        });

        // Restore Belobog trials
        if (progress.completedTrials) {
            trial1Complete = progress.completedTrials.belobog1 || false;
            trial2Complete = progress.completedTrials.belobog2 || false;
            trial3Complete = progress.completedTrials.belobog3 || false;

            if (trial1Complete && trial2Complete && trial3Complete) {
                const statusEl = document.getElementById('belobog-mission-status');
                if (statusEl) {
                    statusEl.textContent = 'Complete — All trials cleared.';
                    statusEl.classList.remove('status-pending');
                    statusEl.classList.add('status-complete');
                }
                const belobogMissionPill = document.getElementById('belobog-mission-pill');
                if (belobogMissionPill) {
                    belobogMissionPill.textContent = 'Complete';
                    belobogMissionPill.classList.remove('mission-pill-pending');
                    belobogMissionPill.classList.add('mission-pill-complete');
                }
            }
        }

        // Restore Penacony shards
        if (progress.penaconyShards) {
            problemsSolved = progress.penaconyShards;
            for (let i = 1; i <= progress.penaconyShards; i++) {
                const shard = document.getElementById(`shard-${i}`);
                if (shard) {
                    shard.classList.remove('locked');
                    shard.classList.add('collected');
                }
            }
        }

        // Restore Xianzhou red shard
        if (progress.xianzhouRedShardText) {
            const redShard = document.getElementById('xianzhou-red-shard');
            if (redShard) {
                redShard.setAttribute('data-memory', progress.xianzhouRedShardText);
                redShard.setAttribute('data-active', 'true');
            }
        }

        // Restore Jarilo puzzle progress
        if (progress.jariloCollectedPieces) {
            collectedCount = progress.jariloCollectedPieces;
            const piecesCollectedEl = document.getElementById('pieces-collected');
            if (piecesCollectedEl) {
                piecesCollectedEl.textContent = collectedCount;
            }
        }
    }

    // Store progress reference but don't apply until after login
    let savedProgress = null;
    setTimeout(() => {
        savedProgress = loadProgress();
        // Don't apply progress yet - wait for login
    }, 100);

    submitBtn.addEventListener('click', function() {
        const enteredPassword = passwordInput.value.trim().toLowerCase();
        if (enteredPassword === correctPassword || enteredPassword === 'my dearest, maria' || enteredPassword === 'skip') {
            message.textContent = 'Welcome aboard the Astral Express!';
            message.style.color = '#55efc4';
            hint.style.display = 'none';
            // Transition to loading screen
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                loadingScreen.style.display = 'flex';
                // After loading animation, show main menu as interior
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    mainMenu.style.display = 'flex';
                    
                    // Apply saved progress after successful login
                    if (savedProgress) {
                        applyProgress(savedProgress);
                    }
                    
                    saveProgress(); // Save current state
                }, 5000); // 5 seconds for cinematic loading
            }, 1000);
        } else {
            attempts++;
            if (attempts >= 2) {
                hint.style.display = 'block';
            }
            message.textContent = 'Incorrect password. Please try again.';
            message.style.color = '#ff7675';
        }
    });

    // Allow pressing Enter to submit
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });

    // Modal functionality for interactive objects (for future use)
    const modal = document.getElementById('interaction-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close');

    if (modal && closeBtn && modalBody) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });

        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Main Menu navigation stands (clean interior nav)
    const stands = document.querySelectorAll('.object-stand');
    const planetLabel = document.getElementById('planet-label');
    const destinationLabel = document.getElementById('destination-label');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const backToPlanetsBtn = document.getElementById('back-to-planets');

    // Helper: show only one main layer at a time
    function showMainMenu() {
        mainMenu.style.display = 'flex';
        if (planetSelection) planetSelection.style.display = 'none';
        if (destinationPortal) destinationPortal.style.display = 'none';
    }

    function showPlanetSelection() {
        mainMenu.style.display = 'none';
        if (planetSelection) planetSelection.style.display = 'flex';
        if (destinationPortal) destinationPortal.style.display = 'none';
    }

    // Shared function: route to proper portal layout per planet
    function showDestinationPortal(planetKey) {
        if (!planetSelection) return;

        // Hide all portal layers first
        planetSelection.style.display = 'none';
        destinationPortal.style.display = 'none';
        const xianzhouPortal = document.getElementById('xianzhou-portal');
        if (xianzhouPortal) xianzhouPortal.style.display = 'none';

        let text = 'Destination portal initialized.';

        if (planetKey === 'belobog') {
            // Belobog keeps its castle interior + oath trial
            destinationPortal.style.display = 'flex';
            text = 'Belobog Portal: You step into the frozen-yet-warm city under the aegis of the Astral Express.';
        } else if (planetKey === 'xianzhou') {
            // Xianzhou: shattered mirror / glass shards layout
            const xianzhouPortalEl = document.getElementById('xianzhou-portal');
            if (xianzhouPortalEl) {
                xianzhouPortalEl.style.display = 'flex';
            }
            text = 'Xianzhou Luofu Portal: A field of fractured glass, holding quiet memories.';
        } else if (planetKey === 'penacony') {
            // Penacony: dreamscape realm
            const penaconyPortalEl = document.getElementById('penacony-portal');
            if (penaconyPortalEl) {
                penaconyPortalEl.style.display = 'flex';
            }
            text = 'Penacony Portal: A dreamscape where your words have opened the way.';
        } else if (planetKey === 'jarilo') {
            // Jarilo-VI: frozen world
            const jariloPortalEl = document.getElementById('jarilo-portal');
            if (jariloPortalEl) {
                jariloPortalEl.style.display = 'flex';
            }
            text = 'Jarilo-VI Portal: A frozen world where time stands still.';
        } else if (planetKey === 'herta') {
            // Herta Station: tech facility
            const hertaPortalEl = document.getElementById('herta-portal');
            if (hertaPortalEl) {
                hertaPortalEl.style.display = 'flex';
            }
            text = 'Herta Station Portal: Advanced research facility of the Genius Society.';
        } else if (planetKey === 'luofu') {
            // Luofu Sanctum: nature sanctuary
            const luofuPortalEl = document.getElementById('luofu-portal');
            if (luofuPortalEl) {
                luofuPortalEl.style.display = 'flex';
            }
            text = 'Luofu Sanctum Portal: A tranquil sanctuary where nature and memory intertwine.';
        } else if (planetKey === 'stellaron') {
            // Stellaron: dark villain
            const stellaronPortalEl = document.getElementById('stellaron-portal');
            if (stellaronPortalEl) {
                stellaronPortalEl.style.display = 'flex';
            }
            text = 'Stellaron Portal: A corrupted force that devours light and hope...';
        } else if (planetKey === 'terminus') {
            // Terminus: final lobby
            const terminusPortalEl = document.getElementById('terminus-portal');
            if (terminusPortalEl) {
                terminusPortalEl.style.display = 'flex';
            }
            text = 'Terminus Portal: The final threshold awaits...';
        }

        if (destinationLabel) destinationLabel.textContent = text;
    }

    // Stand interactions
    stands.forEach(stand => {
        const target = stand.getAttribute('data-target');

        stand.addEventListener('click', () => {
            if (target === 'map') {
                // Open planet selection overlay
                if (planetLabel) {
                    planetLabel.textContent = 'Current route: Belobog (unlocked). Future destinations visible but locked.';
                }
                showPlanetSelection();
            } else if (target === 'logs') {
                console.log('[Main Menu] Mission Log opened.');
            } else if (target === 'inventory') {
                console.log('[Main Menu] Inventory opened.');
                const invOverlay = document.getElementById('inventory-overlay');
                const invCard = document.getElementById('inventory-xianzhou-card');
                const invClose = document.getElementById('inventory-close-btn');

                if (invOverlay) {
                    // Sync ticket state with Belobog mission completion / inventory flag
                    const invStand = document.getElementById('inv-stand');
                    const ticketReady =
                        (invStand && invStand.getAttribute('data-ticket-xianzhou') === 'ready') ||
                        (belobogMissionPill && belobogMissionPill.classList.contains('mission-pill-complete'));

                    if (ticketReady && invCard) {
                        invCard.classList.remove('locked');
                        const note = invCard.querySelector('.ticket-note');
                        if (note) {
                            note.textContent = 'Ready — Your words in Belobog have attuned this boarding pass.';
                        }
                    }

                    invOverlay.style.display = 'flex';

                    if (invClose) {
                        invClose.onclick = () => {
                            invOverlay.style.display = 'none';
                        };
                    }

                    // Also close when clicking outside the panel
                    invOverlay.addEventListener('click', (e) => {
                        if (e.target === invOverlay) {
                            invOverlay.style.display = 'none';
                        }
                    }, { once: true });
                }
            } else if (target === 'comms') {
                console.log('[Main Menu] Comms opened.');
            } else if (target === 'system') {
                console.log('[Main Menu] System Core opened.');
            }
        });
    });

    // Planet selection: click planets to route to destination portal
    if (planetSelection) {
        const planetOptions = planetSelection.querySelectorAll('.planet-option');
        planetOptions.forEach(option => {
            option.addEventListener('click', () => {
                const planetKey = option.getAttribute('data-planet');

                const invStand = document.getElementById('inv-stand');
                const xianzhouTicketReady =
                    (invStand && invStand.getAttribute('data-ticket-xianzhou') === 'ready');

                // If this is Xianzhou and the ticket is ready, auto-unlock visually
                if (planetKey === 'xianzhou' && xianzhouTicketReady) {
                    option.classList.remove('locked');
                    option.classList.add('unlocked');
                }

                // If this is Penacony and its ticket is ready (from red shard), auto-unlock
                if (planetKey === 'penacony' && penaconyTicketReady) {
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

                // Only unlocked planets route to their portal screen
                showDestinationPortal(planetKey);
            });
        });
    }

    // Xianzhou Luofu: shattered mirror memory interactions (no start button; shards are live)
    const xianzhouLabel = document.getElementById('xianzhou-label');
    const xianzhouShards = document.querySelectorAll('.xianzhou-glass-layer .glass-shard');
    const xianzhouBackPlanets = document.getElementById('xianzhou-back-planets');
    const xianzhouRedShard = document.getElementById('xianzhou-red-shard');

    // Track Penacony ticket state (variable declared at top)

    // Normal shards: click to reveal their memory immediately
    if (xianzhouShards.length) {
        xianzhouShards.forEach(shard => {
            // Red shard handled separately below
            if (shard.id === 'xianzhou-red-shard') return;

            shard.addEventListener('click', () => {
                const memory = shard.getAttribute('data-memory') || '';
                if (!memory) return;
                shard.setAttribute('data-active', 'true');
            });
        });
    }

    // Red shard: interactive input — user can "write" their own memory on click.
    // If the exact phrase "I love you, Miraizel" is etched, that forges the Penacony ticket.
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

                // If the exact key phrase is entered, unlock Penacony
                if (trimmed === 'I love you, Miraizel') {
                    if (xianzhouLabel) {
                        xianzhouLabel.textContent =
                            'Your words resonate beyond — a distant dreamworld stirs awake. Penacony is now accessible.';
                    }
                    
                    // Unlock Penacony in planet selection
                    const penaconyOrb = document.querySelector('.planet-option[data-planet="penacony"]');
                    if (penaconyOrb) {
                        penaconyOrb.classList.remove('locked');
                        penaconyOrb.classList.add('unlocked');
                    }
                    
                    // Set flag for Penacony ticket
                    penaconyTicketReady = true;
                    
                    // Award Xianzhou key
                    awardKey('xianzhou');
                    
                    saveProgress();
                }
            }
        });
    }

    // Back from Xianzhou mirror to planet selection
    if (xianzhouBackPlanets && planetSelection) {
        xianzhouBackPlanets.addEventListener('click', () => {
            const xianzhouPortalEl = document.getElementById('xianzhou-portal');
            if (xianzhouPortalEl) xianzhouPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

    // Back from Penacony to planet selection
    const penaconyBackPlanets = document.getElementById('penacony-back-planets');
    if (penaconyBackPlanets && planetSelection) {
        penaconyBackPlanets.addEventListener('click', () => {
            const penaconyPortalEl = document.getElementById('penacony-portal');
            if (penaconyPortalEl) penaconyPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

    // Back from Jarilo-VI to planet selection
    const jariloBackPlanets = document.getElementById('jarilo-back-planets');
    if (jariloBackPlanets && planetSelection) {
        jariloBackPlanets.addEventListener('click', () => {
            const jariloPortalEl = document.getElementById('jarilo-portal');
            if (jariloPortalEl) jariloPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

    // Back from Herta Station to planet selection
    const hertaBackPlanets = document.getElementById('herta-back-planets');
    if (hertaBackPlanets && planetSelection) {
        hertaBackPlanets.addEventListener('click', () => {
            const hertaPortalEl = document.getElementById('herta-portal');
            if (hertaPortalEl) hertaPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

    // Back from Luofu Sanctum to planet selection
    const luofuBackPlanets = document.getElementById('luofu-back-planets');
    if (luofuBackPlanets && planetSelection) {
        luofuBackPlanets.addEventListener('click', () => {
            const luofuPortalEl = document.getElementById('luofu-portal');
            if (luofuPortalEl) luofuPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

    // Back from Stellaron to planet selection
    const stellaronBackPlanets = document.getElementById('stellaron-back-planets');
    if (stellaronBackPlanets && planetSelection) {
        stellaronBackPlanets.addEventListener('click', () => {
            const stellaronPortalEl = document.getElementById('stellaron-portal');
            if (stellaronPortalEl) stellaronPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

    // Back from Terminus to planet selection
    const terminusBackPlanets = document.getElementById('terminus-back-planets');
    if (terminusBackPlanets && planetSelection) {
        terminusBackPlanets.addEventListener('click', () => {
            const terminusPortalEl = document.getElementById('terminus-portal');
            if (terminusPortalEl) terminusPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

    // ========================================
    // TERMINUS KEY PUZZLE SYSTEM
    // ========================================
    const terminusDoor = document.getElementById('terminus-door');
    const terminusLabel = document.getElementById('terminus-label');
    const keyPuzzleOverlay = document.getElementById('key-puzzle-overlay');
    const closeKeyPuzzle = document.getElementById('close-key-puzzle');
    const keysContainer = document.getElementById('keys-container');
    const keyCountNum = document.getElementById('key-count-num');
    
    let draggedKey = null;

    if (terminusDoor) {
        terminusDoor.addEventListener('click', () => {
            openKeyPuzzle();
        });
    }

    function openKeyPuzzle() {
        if (!keyPuzzleOverlay || !keysContainer) return;
        
        // Clear keys container
        keysContainer.innerHTML = '';
        
        // Count and display collected keys
        let collectedCount = 0;
        Object.entries(collectedKeys).forEach(([planet, collected]) => {
            if (collected && planet !== 'terminus') { // Don't show terminus key
                collectedCount++;
                const keyElement = createKeyElement(planet);
                keysContainer.appendChild(keyElement);
            }
        });
        
        // Update key count
        if (keyCountNum) {
            keyCountNum.textContent = collectedCount;
        }
        
        // Show overlay
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
        
        // Drag events
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

    function handleKeyDragEnd(e) {
        this.style.opacity = '1';
    }

    // Setup keyhole drop zones
    const keyholes = document.querySelectorAll('.keyhole');
    keyholes.forEach(keyhole => {
        keyhole.addEventListener('dragover', handleKeyholeDragOver);
        keyhole.addEventListener('dragleave', handleKeyholeDragLeave);
        keyhole.addEventListener('drop', handleKeyholeDrop);
    });

    function handleKeyholeDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (!draggedKey) return;
        
        const keyholePlanet = this.getAttribute('data-planet');
        const keyPlanet = draggedKey.getAttribute('data-planet');
        
        // Visual feedback
        if (keyholePlanet === keyPlanet && !this.classList.contains('filled')) {
            this.classList.add('keyhole-match');
        } else {
            this.classList.add('keyhole-wrong');
        }
    }

    function handleKeyholeDragLeave(e) {
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
            // Get the keyhole slot
            const keyholeSlot = this.querySelector('.keyhole-slot');
            if (keyholeSlot) {
                // Clone the key and add to slot
                const keyClone = draggedKey.cloneNode(true);
                keyClone.classList.add('placed-key');
                keyClone.draggable = false;
                keyholeSlot.appendChild(keyClone);
                
                // Mark keyhole as filled
                this.classList.add('filled');
                
                // Remove original key from container
                draggedKey.remove();
                
                // Check if all keyholes are filled
                checkAllKeysPlaced();
            }
        }
        
        draggedKey = null;
    }

    function checkAllKeysPlaced() {
        const allKeyholes = document.querySelectorAll('.keyhole');
        const filledKeyholes = document.querySelectorAll('.keyhole.filled');
        
        // Need 7 keys (all except terminus)
        if (filledKeyholes.length === 7) {
            setTimeout(() => {
                unlockTerminusDoor();
            }, 500);
        }
    }

    function unlockTerminusDoor() {
        // Close puzzle overlay
        if (keyPuzzleOverlay) {
            keyPuzzleOverlay.style.display = 'none';
        }
        
        // Animate door opening
        if (terminusDoor) {
            terminusDoor.classList.add('unlocked', 'door-opening');
        }
        
        if (terminusLabel) {
            terminusLabel.textContent = '✨ The door opens... revealing a message of eternal love. ✨';
            terminusLabel.style.color = '#ffd700';
        }
        
        // Award terminus key (completion)
        awardKey('terminus');
        
        // Show completion message
        setTimeout(() => {
            alert('🌟 Thank you for completing this journey! 🌟\n\nThis adventure was crafted with love.\nMay your own journey be filled with light and wonder.');
        }, 1500);
    }

    // Close puzzle button
    if (closeKeyPuzzle) {
        closeKeyPuzzle.addEventListener('click', () => {
            if (keyPuzzleOverlay) {
                keyPuzzleOverlay.style.display = 'none';
            }
        });
    }

    // Close puzzle when clicking outside
    if (keyPuzzleOverlay) {
        keyPuzzleOverlay.addEventListener('click', (e) => {
            if (e.target === keyPuzzleOverlay) {
                keyPuzzleOverlay.style.display = 'none';
            }
        });
    }

    // Stellaron - Shadow Maze Game
    const startMazeBtn = document.getElementById('start-maze');
    const exitMazeBtn = document.getElementById('exit-maze');
    const mazeContainer = document.getElementById('maze-container');
    const mazeCanvas = document.getElementById('maze-canvas');
    const mazeLight = document.getElementById('maze-light');
    const mazeStatus = document.getElementById('maze-status');

    function closeMaze() {
        if (mazeContainer) mazeContainer.style.display = 'none';
        if (startMazeBtn) {
            startMazeBtn.style.display = 'block';
            startMazeBtn.textContent = 'Enter Again';
        }
        if (mazeStatus) {
            mazeStatus.textContent = 'Find the exit...';
            mazeStatus.style.color = '';
        }
    }

    if (startMazeBtn && mazeCanvas) {
        startMazeBtn.addEventListener('click', () => {
            startMazeBtn.style.display = 'none';
            if (mazeContainer) mazeContainer.style.display = 'block';
            initMaze();
        });
    }

    if (exitMazeBtn) {
        exitMazeBtn.addEventListener('click', closeMaze);
    }

    function initMaze() {
        const ctx = mazeCanvas.getContext('2d');
        const cellSize = 50;
        const cols = 10;
        const rows = 10;

        // Simple maze layout (1 = wall, 0 = path)
        const maze = [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,0,1],
            [1,0,1,0,0,0,1,0,0,1],
            [1,0,1,1,1,0,1,0,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,0,1,1,1,1,0,1],
            [1,0,0,0,1,0,0,0,0,1],
            [1,0,1,0,0,0,1,1,0,0],
            [1,1,1,1,1,1,1,1,1,1]
        ];

        let playerX = 1;
        let playerY = 1;
        const exitX = 9;
        const exitY = 8;

        function drawMaze() {
            // Fill with darkness
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, 500, 500);

            // Draw only visible area around player
            const visionRadius = 2;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const distance = Math.sqrt(Math.pow(col - playerX, 2) + Math.pow(row - playerY, 2));
                    
                    if (distance <= visionRadius) {
                        if (maze[row][col] === 1) {
                            // Wall
                            ctx.fillStyle = '#4B0000';
                            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                            ctx.strokeStyle = '#8B0000';
                            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
                        } else {
                            // Path
                            ctx.fillStyle = '#1a0000';
                            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                        }
                    }
                }
            }

            // Draw exit (if visible)
            const exitDistance = Math.sqrt(Math.pow(exitX - playerX, 2) + Math.pow(exitY - playerY, 2));
            if (exitDistance <= visionRadius) {
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(exitX * cellSize + 10, exitY * cellSize + 10, cellSize - 20, cellSize - 20);
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#FFD700';
                ctx.fillRect(exitX * cellSize + 10, exitY * cellSize + 10, cellSize - 20, cellSize - 20);
                ctx.shadowBlur = 0;
            }

            // Draw player
            ctx.fillStyle = '#DC143C';
            ctx.beginPath();
            ctx.arc(playerX * cellSize + cellSize/2, playerY * cellSize + cellSize/2, cellSize/3, 0, Math.PI * 2);
            ctx.fill();
        }

        function movePlayer(dx, dy) {
            const newX = playerX + dx;
            const newY = playerY + dy;

            // Check bounds and walls
            if (newX >= 0 && newX < cols && newY >= 0 && newY < rows && maze[newY][newX] === 0) {
                playerX = newX;
                playerY = newY;

                // Update light position
                if (mazeLight) {
                    mazeLight.style.left = (playerX * cellSize + cellSize/2) + 'px';
                    mazeLight.style.top = (playerY * cellSize + cellSize/2) + 'px';
                }

                // Check if reached exit
                if (playerX === exitX && playerY === exitY) {
                    winMaze();
                }

                drawMaze();
            }
        }

        function winMaze() {
            if (mazeStatus) {
                mazeStatus.textContent = '✨ You escaped the darkness! ✨';
                mazeStatus.style.color = '#FFD700';
            }
            
            const shadowMazeGame = document.querySelector('.shadow-maze-game');
            if (shadowMazeGame) {
                shadowMazeGame.style.boxShadow = '0 0 50px rgba(255, 215, 0, 0.9)';
                shadowMazeGame.style.borderColor = 'rgba(255, 215, 0, 0.8)';
            }

            // Unlock Terminus
            const terminusOrb = document.querySelector('.planet-option[data-planet="terminus"]');
            if (terminusOrb) {
                terminusOrb.classList.remove('locked');
                terminusOrb.classList.add('unlocked');
            }
            
            // Award Stellaron key
            awardKey('stellaron');
            
            saveProgress();

            // Auto-close maze after 2 seconds
            setTimeout(closeMaze, 2000);
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!mazeContainer || mazeContainer.style.display === 'none') return;

            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    movePlayer(1, 0);
                    break;
            }
        });

        // Initial draw
        drawMaze();
        if (mazeLight) {
            mazeLight.style.left = (playerX * cellSize + cellSize/2) + 'px';
            mazeLight.style.top = (playerY * cellSize + cellSize/2) + 'px';
        }
    }

    // Luofu Sanctum - Lotus Flower Memory Game
    const startCrossingBtn = document.getElementById('start-crossing');
    const steppingStones = document.querySelectorAll('.lotus-flower');
    const stoneFeedback = document.getElementById('stone-feedback');
    const stoneRoundEl = document.getElementById('stone-round');

    let stoneSequence = [];
    let playerSequence = [];
    let currentRound = 1;
    const maxRounds = 3;
    let isShowingSequence = false;
    let canClick = false;

    function generateSequence(length) {
        const sequence = [];
        for (let i = 0; i < length; i++) {
            sequence.push(Math.floor(Math.random() * 6) + 1);
        }
        return sequence;
    }

    function showSequence() {
        isShowingSequence = true;
        canClick = false;
        let index = 0;

        const interval = setInterval(() => {
            if (index < stoneSequence.length) {
                const stoneNum = stoneSequence[index];
                const stone = document.querySelector(`.lotus-flower[data-stone="${stoneNum}"]`);
                
                if (stone) {
                    stone.classList.add('active');
                    setTimeout(() => {
                        stone.classList.remove('active');
                    }, 500);
                }
                index++;
            } else {
                clearInterval(interval);
                isShowingSequence = false;
                canClick = true;
                if (stoneFeedback) {
                    stoneFeedback.textContent = 'Now repeat the pattern!';
                    stoneFeedback.style.color = '#F4A460';
                }
            }
        }, 800);
    }

    function checkPlayerStep(stoneNum) {
        const currentIndex = playerSequence.length - 1;
        const stone = document.querySelector(`.lotus-flower[data-stone="${stoneNum}"]`);

        if (stoneNum === stoneSequence[currentIndex]) {
            // Correct!
            if (stone) {
                stone.classList.add('correct');
                setTimeout(() => stone.classList.remove('correct'), 500);
            }

            if (playerSequence.length === stoneSequence.length) {
                // Round complete!
                canClick = false;
                if (stoneFeedback) {
                    stoneFeedback.textContent = '✨ Perfect crossing! ✨';
                    stoneFeedback.style.color = '#90EE90';
                }

                if (currentRound < maxRounds) {
                    currentRound++;
                    if (stoneRoundEl) stoneRoundEl.textContent = currentRound;
                    setTimeout(() => {
                        startNewRound();
                    }, 2000);
                } else {
                    // Game complete!
                    setTimeout(() => {
                        completeStoneGame();
                    }, 2000);
                }
            }
        } else {
            // Wrong!
            canClick = false;
            if (stone) {
                stone.classList.add('wrong');
                setTimeout(() => stone.classList.remove('wrong'), 500);
            }
            if (stoneFeedback) {
                stoneFeedback.textContent = 'Wrong step! Try again...';
                stoneFeedback.style.color = '#FF6B6B';
            }
            setTimeout(() => {
                playerSequence = [];
                showSequence();
            }, 1500);
        }
    }

    function startNewRound() {
        playerSequence = [];
        stoneSequence = generateSequence(currentRound + 2); // Round 1: 3 stones, Round 2: 4 stones, Round 3: 5 stones
        if (stoneFeedback) {
            stoneFeedback.textContent = 'Watch the stones...';
            stoneFeedback.style.color = '#F4A460';
        }
        setTimeout(() => {
            showSequence();
        }, 1000);
    }

    function completeStoneGame() {
        if (stoneFeedback) {
            stoneFeedback.textContent = '🌸 You have crossed the sacred river! 🌸';
            stoneFeedback.style.color = '#FFD700';
        }
        if (startCrossingBtn) {
            startCrossingBtn.textContent = 'Completed!';
            startCrossingBtn.disabled = true;
        }
        
        const lotusGame = document.querySelector('.lotus-game');
        if (lotusGame) {
            lotusGame.style.boxShadow = '0 0 50px rgba(82, 183, 136, 0.8)';
            lotusGame.style.borderColor = 'rgba(82, 183, 136, 0.9)';
        }

        // Unlock Stellaron
        const stellaronOrb = document.querySelector('.planet-option[data-planet="stellaron"]');
        if (stellaronOrb) {
            stellaronOrb.classList.remove('locked');
            stellaronOrb.classList.add('unlocked');
        }
        
        // Award Luofu key
        awardKey('luofu');
        
        saveProgress();
    }

    if (startCrossingBtn) {
        startCrossingBtn.addEventListener('click', () => {
            startCrossingBtn.disabled = true;
            currentRound = 1;
            if (stoneRoundEl) stoneRoundEl.textContent = currentRound;
            startNewRound();
        });
    }

    steppingStones.forEach(stone => {
        stone.addEventListener('click', () => {
            if (!canClick || isShowingSequence) return;

            const stoneNum = parseInt(stone.getAttribute('data-stone'));
            playerSequence.push(stoneNum);
            
            stone.classList.add('active');
            setTimeout(() => stone.classList.remove('active'), 300);

            checkPlayerStep(stoneNum);
        });
    });

    // Herta Station - Dimension Portal
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
            // Collect the missing piece
            missingPiece.style.animation = 'collect-piece 0.6s ease forwards';
            
            setTimeout(() => {
                // Return to Herta Station
                if (dimensionSpace) {
                    dimensionSpace.style.display = 'none';
                }

                // Complete the puzzle
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

                // Add completion effect
                const researchPuzzle = document.querySelector('.research-puzzle');
                if (researchPuzzle) {
                    researchPuzzle.style.boxShadow = '0 0 50px rgba(64, 255, 128, 0.8)';
                    researchPuzzle.style.borderColor = 'rgba(64, 255, 128, 0.8)';
                }

                // Unlock Luofu Sanctum
                const luofuOrb = document.querySelector('.planet-option[data-planet="luofu"]');
                if (luofuOrb) {
                    luofuOrb.classList.remove('locked');
                    luofuOrb.classList.add('unlocked');
                }
                
                // Award Herta key
                awardKey('herta');
                
                saveProgress();
            }, 600);
        });
    }

    // Jarilo-VI Puzzle Game - proper jigsaw puzzle
    const puzzlePieces = document.querySelectorAll('.puzzle-piece');
    const puzzleSlots = document.querySelectorAll('.puzzle-slot');
    const piecesCollectedEl = document.getElementById('pieces-collected');
    // collectedCount declared at top
    const totalPieces = 9;
    let draggedPiece = null;

    puzzlePieces.forEach(piece => {
        piece.addEventListener('dragstart', (e) => {
            draggedPiece = piece;
            piece.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        });

        piece.addEventListener('dragend', (e) => {
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

                // Check if piece matches slot
                if (piecePosition === slotPosition) {
                    // Correct position!
                    draggedPiece.classList.add('placed');
                    draggedPiece.style.position = 'static';
                    draggedPiece.style.top = 'auto';
                    draggedPiece.style.left = 'auto';
                    draggedPiece.style.right = 'auto';
                    draggedPiece.style.bottom = 'auto';
                    draggedPiece.draggable = false;
                    
                    slot.appendChild(draggedPiece);
                    slot.classList.add('filled');
                    
                    collectedCount++;
                    if (piecesCollectedEl) {
                        piecesCollectedEl.textContent = collectedCount;
                    }

                    // Check if puzzle is complete
                    if (collectedCount === totalPieces) {
                        setTimeout(() => {
                            completePuzzle();
                        }, 500);
                    }

                    saveProgress();
                }
                
                draggedPiece = null;
            }
        });
    });

    function completePuzzle() {
        const puzzleFrame = document.querySelector('.puzzle-frame');
        const puzzleGrid = document.querySelector('.puzzle-grid-container');
        
        if (puzzleFrame && puzzleGrid) {
            // Remove borders between pieces
            puzzleSlots.forEach(slot => {
                slot.style.border = 'none';
            });
            
            // Add glow effect
            puzzleFrame.style.boxShadow = '0 0 60px rgba(255, 215, 0, 0.9), 0 0 80px rgba(255, 150, 255, 0.7)';
            puzzleFrame.style.border = '3px solid rgba(255, 215, 0, 0.9)';
            puzzleGrid.style.border = '3px solid rgba(255, 215, 0, 0.6)';

            // Unlock Herta Station
            const hertaOrb = document.querySelector('.planet-option[data-planet="herta"]');
            if (hertaOrb) {
                hertaOrb.classList.remove('locked');
                hertaOrb.classList.add('unlocked');
            }
            
            // Award Jarilo key
            awardKey('jarilo');
            
            saveProgress();
        }
    }

    // Penacony Slot Machine Math Game
    const slotStartBtn = document.getElementById('slot-start-btn');
    const slotEquation = document.getElementById('slot-equation');
    const coinContainer = document.getElementById('coin-container');
    const penaconyFeedback = document.getElementById('penacony-feedback');

    let currentAnswer = null;
    let gameActive = false;
    let gamePhase = 'start'; // 'start', 'coins-shown', 'coin-selected'
    let selectedCoinValue = null;
    // problemsSolved declared at top
    let totalProblems = 3;

    function generateMathProblem() {
        const operators = ['+', '-', '*', '/'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let num1, num2, answer;

        if (operator === '+') {
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            answer = num1 + num2;
        } else if (operator === '-') {
            num1 = Math.floor(Math.random() * 50) + 20;
            num2 = Math.floor(Math.random() * 20) + 1;
            answer = num1 - num2;
        } else if (operator === '*') {
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
            answer = num1 * num2;
        } else { // division
            num2 = Math.floor(Math.random() * 10) + 2;
            answer = Math.floor(Math.random() * 15) + 1;
            num1 = num2 * answer;
        }

        return {
            equation: `${num1} ${operator} ${num2} = ?`,
            answer: answer
        };
    }

    function generateCoinOptions(correctAnswer) {
        const options = new Set([correctAnswer]);
        
        while (options.size < 7) {
            const offset = Math.floor(Math.random() * 20) - 10;
            const option = correctAnswer + offset;
            if (option > 0 && option !== correctAnswer) {
                options.add(option);
            }
        }

        return Array.from(options).sort(() => Math.random() - 0.5);
    }

    function showCoinsPhase(options, correctAnswer) {
        gamePhase = 'coins-shown';
        coinContainer.innerHTML = '';
        penaconyFeedback.textContent = 'Pick a coin to insert into the machine!';
        penaconyFeedback.style.color = '#ff99ff';
        
        options.forEach(value => {
            const coin = document.createElement('div');
            coin.className = 'coin coin-pop';
            coin.textContent = value;
            
            coin.addEventListener('click', () => {
                if (gamePhase !== 'coins-shown') return;
                
                selectedCoinValue = value;
                gamePhase = 'coin-selected';
                
                // Hide all coins with pop animation
                document.querySelectorAll('.coin').forEach(c => {
                    c.classList.add('coin-hide');
                });
                
                setTimeout(() => {
                    insertCoinPhase(value, correctAnswer);
                }, 500);
            });
            
            coinContainer.appendChild(coin);
        });
    }

    function insertCoinPhase(selectedValue, correctAnswer) {
        coinContainer.innerHTML = '';
        penaconyFeedback.textContent = `Inserting coin with value ${selectedValue}...`;
        penaconyFeedback.style.color = '#ffd700';
        
        setTimeout(() => {
            if (selectedValue === correctAnswer) {
                problemsSolved++;
                
                // Collect ticket shard
                const shard = document.getElementById(`shard-${problemsSolved}`);
                if (shard) {
                    shard.classList.remove('locked');
                    shard.classList.add('collected');
                }
                
                penaconyFeedback.textContent = `Correct! ✨ Ticket shard ${problemsSolved} collected!`;
                penaconyFeedback.style.color = '#55efc4';
                
                setTimeout(() => {
                    if (problemsSolved >= totalProblems) {
                        completeGame();
                    } else {
                        resetGame();
                    }
                }, 2000);
            } else {
                penaconyFeedback.textContent = `Wrong! The answer was ${correctAnswer}. (${problemsSolved}/${totalProblems} shards collected)`;
                penaconyFeedback.style.color = '#ff6b6b';
                
                setTimeout(() => {
                    resetGame();
                }, 2500);
            }
        }, 800);
    }

    function completeGame() {
        gameActive = false;
        gamePhase = 'completed';
        slotEquation.textContent = '🎉 WINNER! 🎉';
        penaconyFeedback.textContent = 'All 3 ticket shards collected! Jarilo-VI is now accessible!';
        penaconyFeedback.style.color = '#ffd700';
        slotStartBtn.textContent = 'PLAY AGAIN';
        slotStartBtn.disabled = false;

        // Unlock Jarilo-VI
        const jariloOrb = document.querySelector('.planet-option[data-planet="jarilo"]');
        if (jariloOrb) {
            jariloOrb.classList.remove('locked');
            jariloOrb.classList.add('unlocked');
        }
        
        // Award Penacony key
        awardKey('penacony');
        
        saveProgress();
    }

    function resetGame() {
        gameActive = false;
        gamePhase = 'start';
        currentAnswer = null;
        selectedCoinValue = null;
        slotEquation.textContent = problemsSolved > 0 ? `${problemsSolved}/${totalProblems} shards - Press Start` : 'Press Start';
        coinContainer.innerHTML = '';
        penaconyFeedback.textContent = '';
        slotStartBtn.textContent = 'START';
        slotStartBtn.disabled = false;
    }

    // Single event listener for slot machine start button
    if (slotStartBtn) {
        slotStartBtn.addEventListener('click', () => {
            // Handle replay after completion
            if (gamePhase === 'completed') {
                // Reset all shards
                problemsSolved = 0;
                for (let i = 1; i <= totalProblems; i++) {
                    const shard = document.getElementById(`shard-${i}`);
                    if (shard) {
                        shard.classList.remove('collected');
                        shard.classList.add('locked');
                    }
                }
                gamePhase = 'start';
                slotEquation.textContent = 'Press Start';
                return;
            }

            // Don't start if already active
            if (gameActive) return;
            
            gameActive = true;
            gamePhase = 'equation-showing';
            slotStartBtn.disabled = true;
            penaconyFeedback.textContent = '';
            
            // Slot machine animation
            slotEquation.textContent = '...';
            
            setTimeout(() => {
                const problem = generateMathProblem();
                currentAnswer = problem.answer;
                slotEquation.textContent = problem.equation;
                
                // Show coins after equation appears
                setTimeout(() => {
                    const coinOptions = generateCoinOptions(currentAnswer);
                    showCoinsPhase(coinOptions, currentAnswer);
                }, 500);
            }, 800);
        });
    }


    function generateEasyProblem() {
        // Only +, -, * with operands 1–99 so result stays small/clean
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let a = Math.floor(Math.random() * 99) + 1;
        let b = Math.floor(Math.random() * 99) + 1;

        // Keep subtraction non-negative
        if (op === '-' && b > a) [a, b] = [b, a];

        // Keep multiplication modest (<= 3 digits)
        if (op === '*') {
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 10) + 1;
        }

        let correct;
        if (op === '+') correct = a + b;
        else if (op === '-') correct = a - b;
        else correct = a * b;

        // Build 3 options: 1 correct, 2 nearby distractors
        const choices = new Set([correct]);
        while (choices.size < 3) {
            const delta = Math.floor(Math.random() * 9) - 4; // -4..+4
            const alt = correct + delta;
            if (alt > 0 && alt !== correct) choices.add(alt);
        }

        const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);

        return {
            text: `What is ${a} ${op} ${b} ?`,
            correct,
            options: shuffled
        };
    }

    if (false) {
        let currentAnswer = null;
        let questionsAsked = 0;
        const totalQuestions = 3;

        function renderProblem() {
            const { text, correct, options } = generateEasyProblem();
            currentAnswer = correct;

            options.forEach(val => {
                const btn = document.createElement('button');
                btn.textContent = val.toString();
                btn.addEventListener('click', () => {
                    if (val === currentAnswer) {
                        penaconyFeedback.textContent =
                            'Correct! Even in this dream, you’ve got this.';
                        penaconyFeedback.style.color = '#2ecc71';
                        questionsAsked += 1;

                        if (questionsAsked < totalQuestions) {
                            setTimeout(renderProblem, 600);
                        } else {
                            penaconyFeedback.textContent =
                                'You cleared all 3. Thank you for playing with me.';
                        }
                    } else {
                        penaconyFeedback.textContent =
                            'Close. Try another — this arcade never judges.';
                        penaconyFeedback.style.color = '#e67e22';
                    }
                });
                penaconyChoices.appendChild(btn);
            });
        }



    }


    // Belobog destination: celestial relic interactions
    const celestial1 = document.getElementById('belobog-celestial-1');
    const celestial2 = document.getElementById('belobog-celestial-2');
    const celestial3 = document.getElementById('belobog-celestial-3');
    const belobogFillGame = document.getElementById('belobog-fill-game');
    const belobogFillInput = document.getElementById('belobog-fill-input');
    const belobogFillSubmit = document.getElementById('belobog-fill-submit');
    const belobogFillFeedback = document.getElementById('belobog-fill-feedback');

    // Belobog mission dropdown
    const belobogMissionPanel = document.getElementById('belobog-mission-panel');
    const belobogMissionToggle = document.getElementById('belobog-mission-toggle');
    const belobogMissionContent = document.getElementById('belobog-mission-content');
    const belobogMissionPill = document.getElementById('belobog-mission-pill');

    if (belobogMissionPanel && belobogMissionToggle && belobogMissionContent) {
        // Start collapsed
        belobogMissionPanel.classList.remove('open');

        belobogMissionToggle.addEventListener('click', () => {
            belobogMissionPanel.classList.toggle('open');
        });
    }

    function openBelobogFillGame() {
        if (!belobogFillGame) return;
        belobogFillGame.style.display = 'flex';
        if (belobogFillInput) {
            belobogFillInput.value = '';
            belobogFillInput.focus();
        }
        if (belobogFillFeedback) {
            belobogFillFeedback.textContent = '';
        }
    }

    // Celestial 1: Fill-in-the-blank game trigger
    if (celestial1) {
        celestial1.addEventListener('click', () => {
            openBelobogFillGame();
        });
    }

    // Track completion of all three trials (variables declared at top)

    function checkAllTrialsComplete() {
        if (trial1Complete && trial2Complete && trial3Complete) {
            // Mark Belobog mission as complete
            const statusEl = document.getElementById('belobog-mission-status');
            if (statusEl) {
                statusEl.textContent = 'Complete — All trials cleared. Ticket forging conditions satisfied.';
                statusEl.classList.remove('status-pending');
                statusEl.classList.add('status-complete');
            }
            const ticketCard = document.querySelector('.belobog-mission-panel .ticket-card');
            if (ticketCard) {
                ticketCard.classList.remove('locked');
                const noteEl = ticketCard.querySelector('.ticket-note');
                if (noteEl) {
                    noteEl.textContent = 'Ready — Your resolve has lit the way to Xianzhou Luofu.';
                }
            }
            if (belobogMissionPill) {
                belobogMissionPill.textContent = 'Complete';
                belobogMissionPill.classList.remove('mission-pill-pending');
                belobogMissionPill.classList.add('mission-pill-complete');
            }
            if (belobogMissionPanel) {
                belobogMissionPanel.classList.add('open');
            }

            // Mark inventory as having the ticket ready
            const invStand = document.getElementById('inv-stand');
            if (invStand) {
                invStand.setAttribute('data-ticket-xianzhou', 'ready');
                invStand.classList.add('has-ticket-upgrade');
            }

            // Award Belobog key
            awardKey('belobog');
        }
    }

    // Celestial 2: Frostbound Seal fill-in-the-blank
    const belobogFillGame2 = document.getElementById('belobog-fill-game-2');
    const belobogFillInput2 = document.getElementById('belobog-fill-input-2');
    const belobogFillSubmit2 = document.getElementById('belobog-fill-submit-2');
    const belobogFillFeedback2 = document.getElementById('belobog-fill-feedback-2');

    if (celestial2) {
        celestial2.addEventListener('click', () => {
            if (belobogFillGame2) {
                belobogFillGame2.style.display = 'flex';
                if (belobogFillInput2) {
                    belobogFillInput2.value = '';
                    belobogFillInput2.focus();
                }
                if (belobogFillFeedback2) {
                    belobogFillFeedback2.textContent = '';
                }
            }
        });
    }

    // Celestial 3: Stellar Choir fill-in-the-blank
    const belobogFillGame3 = document.getElementById('belobog-fill-game-3');
    const belobogFillInput3 = document.getElementById('belobog-fill-input-3');
    const belobogFillSubmit3 = document.getElementById('belobog-fill-submit-3');
    const belobogFillFeedback3 = document.getElementById('belobog-fill-feedback-3');

    if (celestial3) {
        celestial3.addEventListener('click', () => {
            if (belobogFillGame3) {
                belobogFillGame3.style.display = 'flex';
                if (belobogFillInput3) {
                    belobogFillInput3.value = '';
                    belobogFillInput3.focus();
                }
                if (belobogFillFeedback3) {
                    belobogFillFeedback3.textContent = '';
                }
            }
        });
    }

    // Fill-in-the-blank game logic (with left-side options + explicit blank)
    if (belobogFillSubmit && belobogFillInput && belobogFillFeedback && belobogFillGame) {
        const correctWord = 'light';
        const optionButtons = document.querySelectorAll('.belobog-fill-option');
        const blankSpan = document.querySelector('.belobog-fill-blank');

        // Clicking an option fills the input and updates the blank for context
        optionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const chosen = btn.getAttribute('data-word') || '';
                belobogFillInput.value = chosen;
                if (blankSpan) {
                    blankSpan.textContent = chosen || '______';
                }
                if (belobogFillFeedback) {
                    belobogFillFeedback.textContent = '';
                }
            });
        });

        function evaluateFill() {
            const attempt = belobogFillInput.value.trim().toLowerCase();

            if (!attempt) {
                belobogFillFeedback.textContent = 'Hint: Pick from the left, then see it appear in the blank.';
                belobogFillFeedback.style.color = '#feca57';
                if (blankSpan) blankSpan.textContent = '______';
                return;
            }

            if (attempt === correctWord) {
                if (blankSpan) blankSpan.textContent = 'light';
                belobogFillFeedback.textContent =
                    'Correct. "You are my light among the stars." The castle itself seems to glow at your words.';
                belobogFillFeedback.style.color = '#55efc4';

                trial1Complete = true;

                setTimeout(() => {
                    belobogFillGame.style.display = 'none';
                    checkAllTrialsComplete();
                    saveProgress();
                }, 1600);
            } else {
                if (blankSpan) blankSpan.textContent = attempt;
                belobogFillFeedback.textContent =
                    'Not quite. Read it with your choice in the blank — only one truly feels like a guiding warmth.';
                belobogFillFeedback.style.color = '#e94560';
            }
        }

        belobogFillSubmit.addEventListener('click', evaluateFill);

        // Allow Enter key to submit in the mini-game
        belobogFillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                evaluateFill();
            }
        });
    }

    // Fill-in-the-blank game 2 logic (Frostbound Seal)
    if (belobogFillSubmit2 && belobogFillInput2 && belobogFillFeedback2 && belobogFillGame2) {
        const correctWord2 = 'warmth';
        const optionButtons2 = document.querySelectorAll('.belobog-fill-option-2');
        const blankSpan2 = document.querySelector('.belobog-fill-blank-2');

        optionButtons2.forEach(btn => {
            btn.addEventListener('click', () => {
                const chosen = btn.getAttribute('data-word') || '';
                belobogFillInput2.value = chosen;
                if (blankSpan2) {
                    blankSpan2.textContent = chosen || '______';
                }
                if (belobogFillFeedback2) {
                    belobogFillFeedback2.textContent = '';
                }
            });
        });

        function evaluateFill2() {
            const attempt = belobogFillInput2.value.trim().toLowerCase();

            if (!attempt) {
                belobogFillFeedback2.textContent = 'Hint: Pick from the left, then see it appear in the blank.';
                belobogFillFeedback2.style.color = '#feca57';
                if (blankSpan2) blankSpan2.textContent = '______';
                return;
            }

            if (attempt === correctWord2) {
                if (blankSpan2) blankSpan2.textContent = 'warmth';
                belobogFillFeedback2.textContent =
                    'Correct. "Your presence is my warmth in the cold." The frozen seal begins to thaw.';
                belobogFillFeedback2.style.color = '#55efc4';

                trial2Complete = true;

                setTimeout(() => {
                    belobogFillGame2.style.display = 'none';
                    checkAllTrialsComplete();
                    saveProgress();
                }, 1600);
            } else {
                if (blankSpan2) blankSpan2.textContent = attempt;
                belobogFillFeedback2.textContent =
                    'Not quite. Read it with your choice — only one truly melts the ice.';
                belobogFillFeedback2.style.color = '#e94560';
            }
        }

        belobogFillSubmit2.addEventListener('click', evaluateFill2);

        belobogFillInput2.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                evaluateFill2();
            }
        });
    }

    // Fill-in-the-blank game 3 logic (Stellar Choir)
    if (belobogFillSubmit3 && belobogFillInput3 && belobogFillFeedback3 && belobogFillGame3) {
        const correctWord3 = 'forever';
        const optionButtons3 = document.querySelectorAll('.belobog-fill-option-3');
        const blankSpan3 = document.querySelector('.belobog-fill-blank-3');

        optionButtons3.forEach(btn => {
            btn.addEventListener('click', () => {
                const chosen = btn.getAttribute('data-word') || '';
                belobogFillInput3.value = chosen;
                if (blankSpan3) {
                    blankSpan3.textContent = chosen || '______';
                }
                if (belobogFillFeedback3) {
                    belobogFillFeedback3.textContent = '';
                }
            });
        });

        function evaluateFill3() {
            const attempt = belobogFillInput3.value.trim().toLowerCase();

            if (!attempt) {
                belobogFillFeedback3.textContent = 'Hint: Pick from the left, then see it appear in the blank.';
                belobogFillFeedback3.style.color = '#feca57';
                if (blankSpan3) blankSpan3.textContent = '______';
                return;
            }

            if (attempt === correctWord3) {
                if (blankSpan3) blankSpan3.textContent = 'forever';
                belobogFillFeedback3.textContent =
                    'Correct. "I will love you forever, across all worlds." The stars sing in harmony with your vow.';
                belobogFillFeedback3.style.color = '#55efc4';

                trial3Complete = true;

                setTimeout(() => {
                    belobogFillGame3.style.display = 'none';
                    checkAllTrialsComplete();
                    saveProgress();
                }, 1600);
            } else {
                if (blankSpan3) blankSpan3.textContent = attempt;
                belobogFillFeedback3.textContent =
                    'Not quite. Listen to the stars — only one word echoes through eternity.';
                belobogFillFeedback3.style.color = '#e94560';
            }
        }

        belobogFillSubmit3.addEventListener('click', evaluateFill3);

        belobogFillInput3.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                evaluateFill3();
            }
        });
    }

    // Back buttons
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            showMainMenu();
        });
    }

    if (backToPlanetsBtn) {
        backToPlanetsBtn.addEventListener('click', () => {
            // Close any active Belobog mini-game overlay when going back
            if (belobogFillGame) belobogFillGame.style.display = 'none';
            showPlanetSelection();
        });
    }

    // ========================================
    // PHASE 1: INITIALIZE ENHANCEMENTS
    // ========================================
    initFloatingStars();
    initMuteToggle();
    initKeyboardShortcuts();

    // ========================================
    // PHASE 2 & 3: INITIALIZE AFTER ALL CODE LOADS
    // ========================================
    setTimeout(() => {
        // Phase 2
        if (typeof initSettingsPanel === 'function') initSettingsPanel();
        if (typeof initKeyPreview === 'function') initKeyPreview();
        
        // Phase 3
        if (typeof initCursorTrail === 'function') initCursorTrail();
        if (typeof initAudioSystem === 'function') initAudioSystem();
        
        // Randomize puzzles
        setTimeout(() => {
            if (typeof randomizeJariloPuzzle === 'function') randomizeJariloPuzzle();
        }, 1000);
    }, 100);
});

// ========================================
// PHASE 1: FOUNDATION FEATURES
// ========================================
    function initFloatingStars() {
        const container = document.getElementById('floating-stars');
        if (!container) return;

        const starCount = 50;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = `star layer-${(i % 3) + 1}`;
            
            // Random position
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            
            // Random animation delay
            star.style.animationDelay = Math.random() * 3 + 's';
            
            // Slow upward drift
            const duration = 20 + Math.random() * 30;
            star.style.animation += `, float-up ${duration}s linear infinite`;
            star.style.animationDelay = Math.random() * duration + 's';
            
            container.appendChild(star);
        }
        
        console.log('[Phase 1] Floating stars initialized');
    }

    // ========================================
    // PHASE 1: MUTE TOGGLE
    // ========================================
    function initMuteToggle() {
        const muteBtn = document.getElementById('mute-toggle');
        if (!muteBtn) return;

        // Load mute state from sessionStorage
        const isMuted = sessionStorage.getItem('audioMuted') === 'true';
        if (isMuted) {
            muteBtn.classList.add('muted');
            muteBtn.querySelector('.mute-icon').textContent = '🔇';
        }

        muteBtn.addEventListener('click', () => {
            const nowMuted = !muteBtn.classList.contains('muted');
            
            if (nowMuted) {
                muteBtn.classList.add('muted');
                muteBtn.querySelector('.mute-icon').textContent = '🔇';
                sessionStorage.setItem('audioMuted', 'true');
            } else {
                muteBtn.classList.remove('muted');
                muteBtn.querySelector('.mute-icon').textContent = '🔊';
                sessionStorage.setItem('audioMuted', 'false');
            }
            
            // Bounce animation
            muteBtn.style.animation = 'none';
            setTimeout(() => {
                muteBtn.style.animation = '';
            }, 10);
            
            console.log('[Phase 1] Audio muted:', nowMuted);
        });
        
        console.log('[Phase 1] Mute toggle initialized');
    }

    // ========================================
    // PHASE 1: PROGRESS BAR (TRAIN CARS)
    // ========================================
    function initProgressBar() {
        updateProgressBar();
        console.log('[Phase 1] Progress bar initialized');
    }

    function updateProgressBar() {
        const trainCars = document.querySelectorAll('.train-car');
        
        trainCars.forEach(car => {
            const planet = car.getAttribute('data-planet');
            
            // Check if this planet's key is collected
            if (collectedKeys[planet]) {
                car.classList.add('completed');
            } else {
                car.classList.remove('completed');
            }
        });
    }

    // Call updateProgressBar whenever a key is collected
    // (integrate with existing awardKey function)
    const originalAwardKey = awardKey;
    awardKey = function(planetName) {
        originalAwardKey(planetName);
        updateProgressBar();
    };

    // ========================================
    // PHASE 1: KEYBOARD SHORTCUTS
    // ========================================
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing (except ESC)
            const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
            if (isTyping && e.key !== 'Escape') return;

            const key = e.key.toLowerCase();

            switch(key) {
                case 'escape':
                    handleEscape();
                    e.preventDefault();
                    break;
                case 'enter':
                    if (!isTyping) {
                        handleEnter();
                        e.preventDefault();
                    }
                    break;
                case 'm':
                    document.getElementById('mute-toggle')?.click();
                    e.preventDefault();
                    break;
                case ' ':
                    // Space for music control (Phase 3)
                    e.preventDefault();
                    break;
                case 'h':
                    // Help - Show keyboard shortcuts
                    showHelpModal();
                    e.preventDefault();
                    break;
                case 'k':
                    // Show collected keys
                    showCollectedKeysModal();
                    e.preventDefault();
                    break;
                case 's':
                    // Settings (Phase 2)
                    if (!isTyping) {
                        openSettings();
                        e.preventDefault();
                    }
                    break;
                case 'r':
                    // Restart puzzle (with confirmation)
                    console.log('[Keyboard] Restart requested');
                    e.preventDefault();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                    // Quick jump to planets (if unlocked)
                    handlePlanetJump(parseInt(key));
                    e.preventDefault();
                    break;
            }
        });
        
        console.log('[Phase 1] Keyboard shortcuts initialized');
    }

    function handleEscape() {
        // Close any open modals
        if (keyPuzzleOverlay && keyPuzzleOverlay.style.display === 'flex') {
            keyPuzzleOverlay.style.display = 'none';
            return;
        }
        
        const invOverlay = document.getElementById('inventory-overlay');
        if (invOverlay && invOverlay.style.display === 'flex') {
            invOverlay.style.display = 'none';
            return;
        }
        
        // Close any fill-in-blank games
        const fillGames = document.querySelectorAll('[id^="belobog-fill-game"]');
        fillGames.forEach(game => {
            if (game.style.display === 'flex') {
                game.style.display = 'none';
            }
        });
        
        console.log('[Keyboard] ESC pressed - closing modals');
    }

    function handleEnter() {
        // Submit password if on welcome screen
        if (welcomeScreen && welcomeScreen.style.display !== 'none') {
            submitBtn?.click();
            return;
        }
        
        console.log('[Keyboard] Enter pressed');
    }

    function handlePlanetJump(number) {
        const planetMap = {
            1: 'belobog',
            2: 'xianzhou',
            3: 'penacony',
            4: 'jarilo',
            5: 'herta',
            6: 'luofu',
            7: 'stellaron',
            8: 'terminus'
        };
        
        const planetKey = planetMap[number];
        if (!planetKey) return;
        
        // Check if planet is unlocked
        const planetOrb = document.querySelector(`.planet-option[data-planet="${planetKey}"]`);
        if (planetOrb && planetOrb.classList.contains('unlocked')) {
            planetOrb.click();
            console.log(`[Keyboard] Jumped to planet: ${planetKey}`);
        } else {
            console.log(`[Keyboard] Planet ${planetKey} is locked`);
        }
    }

    // ========================================
    // LOADING INDICATOR
    // ========================================
    function showLoading(text = 'Loading...') {
        let indicator = document.getElementById('loading-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'loading-indicator';
            indicator.className = 'loading-indicator';
            indicator.innerHTML = `
                <div class="mini-train">
                    <div class="mini-train-body">
                        <div class="mini-train-wheel"></div>
                        <div class="mini-train-wheel"></div>
                    </div>
                </div>
                <div class="loading-text">${text}</div>
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.classList.add('active');
        indicator.querySelector('.loading-text').textContent = text;
    }

    function hideLoading() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.classList.remove('active');
        }
    }

    // Export for use in other functions
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    window.updateProgressBar = updateProgressBar;
    window.showKeyNotification = showKeyNotification;
    window.awardKey = awardKey;

    console.log('[Phase 1] All enhancements initialized! 🚀');

// ========================================
// PHASE 2: VISUAL POLISH
// ========================================

// 5. Fade to Black Transitions
function fadeTransition(callback) {
    let overlay = document.getElementById('transition-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'transition-overlay';
        overlay.className = 'transition-overlay';
        
        // Add stars to transition
        for (let i = 0; i < 30; i++) {
            const star = document.createElement('div');
            star.className = 'transition-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 2 + 's';
            overlay.appendChild(star);
        }
        
        document.body.appendChild(overlay);
    }
    
    // Fade out
    overlay.classList.add('active');
    
    setTimeout(() => {
        if (callback) callback();
        
        // Fade in
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 100);
    }, 600);
}

// 6. Key Preview on Hover
function initKeyPreview() {
    // Will be called when planet portal opens
    setTimeout(() => {
        const celestialOrbs = document.querySelectorAll('.celestial-orb');
        
        celestialOrbs.forEach(orb => {
            orb.addEventListener('mouseenter', function(e) {
                const planet = this.getAttribute('data-planet');
                if (planet && !collectedKeys[planet]) {
                    showKeyPreview(planet, this);
                }
            });
            
            orb.addEventListener('mouseleave', function() {
                hideKeyPreview();
            });
        });
    }, 1000);
    
    console.log('[Phase 2] Key preview initialized');
}

function showKeyPreview(planet, element) {
    let tooltip = document.getElementById('key-preview-tooltip');
    
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'key-preview-tooltip';
        tooltip.className = 'key-preview-tooltip';
        document.body.appendChild(tooltip);
    }
    
    const keyNames = {
        belobog: '🍬 Candy Key',
        xianzhou: '🔮 Memory Key',
        penacony: '🎰 Fortune Key',
        jarilo: '❄️ Frozen Key',
        herta: '🌌 Dimension Key',
        luofu: '🪷 Lotus Key',
        stellaron: '⭐ Stellaron Key',
        terminus: '🚪 Terminus Key'
    };
    
    tooltip.innerHTML = `
        <div class="key-preview-icon">${keyNames[planet]?.split(' ')[0] || '🔑'}</div>
        <div class="key-preview-name">${keyNames[planet] || 'Unknown Key'}</div>
        <div class="key-preview-hint">Complete puzzle to unlock</div>
    `;
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.top - 10 + 'px';
    tooltip.classList.add('show');
}

function hideKeyPreview() {
    const tooltip = document.getElementById('key-preview-tooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
    }
}

// 7. Settings Panel
function initSettingsPanel() {
    // Create settings panel if it doesn't exist
    let panel = document.getElementById('settings-panel');
    
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'settings-panel';
        panel.className = 'settings-panel';
        panel.innerHTML = `
            <div class="settings-header">
                <h2>⚙️ Settings</h2>
                <button class="close-settings-btn" id="close-settings">✕</button>
            </div>
            <div class="settings-content">
                <div class="setting-group">
                    <label>🎵 Music Volume</label>
                    <input type="range" id="music-volume" min="0" max="100" value="70">
                    <span id="music-value">70%</span>
                </div>
                <div class="setting-group">
                    <label>🔊 Sound Effects</label>
                    <input type="range" id="sfx-volume" min="0" max="100" value="80">
                    <span id="sfx-value">80%</span>
                </div>
                <div class="setting-group">
                    <label>✨ Visual Effects</label>
                    <div class="toggle-group">
                        <label class="toggle-label">
                            <input type="checkbox" id="particles-toggle" checked>
                            <span>Particles</span>
                        </label>
                        <label class="toggle-label">
                            <input type="checkbox" id="trails-toggle" checked>
                            <span>Cursor Trails</span>
                        </label>
                        <label class="toggle-label">
                            <input type="checkbox" id="animations-toggle" checked>
                            <span>Animations</span>
                        </label>
                    </div>
                </div>
                <div class="setting-group">
                    <label>♿ Accessibility</label>
                    <div class="toggle-group">
                        <label class="toggle-label">
                            <input type="checkbox" id="reduced-motion-toggle">
                            <span>Reduced Motion</span>
                        </label>
                    </div>
                </div>
                <div class="setting-group">
                    <button class="reset-progress-btn" id="reset-progress">🔄 Reset Progress</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }
    
    // Load saved settings
    loadSettings();
    
    // Event listeners
    document.getElementById('close-settings')?.addEventListener('click', closeSettings);
    document.getElementById('music-volume')?.addEventListener('input', updateMusicVolume);
    document.getElementById('sfx-volume')?.addEventListener('input', updateSfxVolume);
    document.getElementById('particles-toggle')?.addEventListener('change', saveSettings);
    document.getElementById('trails-toggle')?.addEventListener('change', (e) => {
        toggleTrail(e.target.checked);
        saveSettings();
    });
    document.getElementById('animations-toggle')?.addEventListener('change', saveSettings);
    document.getElementById('reduced-motion-toggle')?.addEventListener('change', saveSettings);
    document.getElementById('reset-progress')?.addEventListener('click', confirmResetProgress);
    
    console.log('[Phase 2] Settings panel initialized');
}

function openSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
        panel.classList.add('open');
    }
}

function closeSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
        panel.classList.remove('open');
    }
}

function loadSettings() {
    const settings = {
        musicVolume: sessionStorage.getItem('musicVolume') || '70',
        sfxVolume: sessionStorage.getItem('sfxVolume') || '80',
        particles: sessionStorage.getItem('particles') !== 'false',
        trails: sessionStorage.getItem('trails') !== 'false',
        animations: sessionStorage.getItem('animations') !== 'false',
        reducedMotion: sessionStorage.getItem('reducedMotion') === 'true'
    };
    
    // Apply to UI
    const musicSlider = document.getElementById('music-volume');
    const sfxSlider = document.getElementById('sfx-volume');
    const musicValue = document.getElementById('music-value');
    const sfxValue = document.getElementById('sfx-value');
    
    if (musicSlider) {
        musicSlider.value = settings.musicVolume;
        if (musicValue) musicValue.textContent = settings.musicVolume + '%';
    }
    if (sfxSlider) {
        sfxSlider.value = settings.sfxVolume;
        if (sfxValue) sfxValue.textContent = settings.sfxVolume + '%';
    }
    
    const particlesToggle = document.getElementById('particles-toggle');
    const trailsToggle = document.getElementById('trails-toggle');
    const animationsToggle = document.getElementById('animations-toggle');
    const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
    
    if (particlesToggle) particlesToggle.checked = settings.particles;
    if (trailsToggle) trailsToggle.checked = settings.trails;
    if (animationsToggle) animationsToggle.checked = settings.animations;
    if (reducedMotionToggle) reducedMotionToggle.checked = settings.reducedMotion;
}

function updateMusicVolume(e) {
    const value = e.target.value;
    document.getElementById('music-value').textContent = value + '%';
    sessionStorage.setItem('musicVolume', value);
}

function updateSfxVolume(e) {
    const value = e.target.value;
    document.getElementById('sfx-value').textContent = value + '%';
    sessionStorage.setItem('sfxVolume', value);
}

function saveSettings() {
    const particles = document.getElementById('particles-toggle')?.checked ?? true;
    const trails = document.getElementById('trails-toggle')?.checked ?? true;
    const animations = document.getElementById('animations-toggle')?.checked ?? true;
    const reducedMotion = document.getElementById('reduced-motion-toggle')?.checked ?? false;
    
    sessionStorage.setItem('particles', particles);
    sessionStorage.setItem('trails', trails);
    sessionStorage.setItem('animations', animations);
    sessionStorage.setItem('reducedMotion', reducedMotion);
    
    console.log('[Settings] Saved');
}

function confirmResetProgress() {
    if (confirm('Are you sure you want to reset all progress? This will clear all collected keys and completed puzzles.')) {
        sessionStorage.clear();
        location.reload();
    }
}

// Export Phase 2 functions
window.fadeTransition = fadeTransition;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.initKeyPreview = initKeyPreview;

console.log('[Phase 2] Visual polish features ready! ✨');


// ========================================
// PHASE 3: ADVANCED FEATURES
// ========================================

// 9. Key Collection Animation (Smooth Arc)
function animateKeyCollection(planetName, sourceElement) {
    // Create key element
    const keyIcon = document.createElement('div');
    keyIcon.className = 'flying-key';
    
    const keyEmojis = {
        belobog: '🍬',
        xianzhou: '🔮',
        penacony: '🎰',
        jarilo: '❄️',
        herta: '🌌',
        luofu: '🪷',
        stellaron: '⭐',
        terminus: '🚪'
    };
    
    keyIcon.textContent = keyEmojis[planetName] || '🔑';
    
    // Get source position
    const sourceRect = sourceElement.getBoundingClientRect();
    keyIcon.style.left = sourceRect.left + sourceRect.width / 2 + 'px';
    keyIcon.style.top = sourceRect.top + sourceRect.height / 2 + 'px';
    
    document.body.appendChild(keyIcon);
    
    // Animate appearance
    setTimeout(() => {
        keyIcon.classList.add('spawn');
    }, 50);
    
    // Calculate target position (top-right notification area)
    const targetX = window.innerWidth - 100;
    const targetY = 50;
    
    // Start arc animation after spawn
    setTimeout(() => {
        keyIcon.style.left = targetX + 'px';
        keyIcon.style.top = targetY + 'px';
        keyIcon.classList.add('flying');
    }, 600);
    
    // Show notification and remove key
    setTimeout(() => {
        keyIcon.classList.add('shrink');
        if (window.showKeyNotification) {
            window.showKeyNotification(planetName);
        }
    }, 1400);
    
    setTimeout(() => {
        keyIcon.remove();
    }, 1800);
}

// 10. Cursor Trail Effects
let trailEnabled = true;
let trailParticles = [];
let lastTrailTime = 0;

function initCursorTrail() {
    // Check if trails are enabled in settings
    trailEnabled = sessionStorage.getItem('trails') !== 'false';
    
    document.addEventListener('mousemove', (e) => {
        if (!trailEnabled) return;
        
        const now = Date.now();
        if (now - lastTrailTime < 30) return; // Throttle to 30ms
        lastTrailTime = now;
        
        createTrailParticle(e.clientX, e.clientY);
    });
    
    // Animation loop for particles
    setInterval(updateTrailParticles, 50);
    
    console.log('[Phase 3] Cursor trail initialized');
}

function createTrailParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'trail-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    // Random star or sparkle
    const shapes = ['⭐', '✨', '💫', '🌟'];
    particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    
    document.body.appendChild(particle);
    
    trailParticles.push({
        element: particle,
        createdAt: Date.now()
    });
    
    // Limit particles
    if (trailParticles.length > 20) {
        const old = trailParticles.shift();
        old.element.remove();
    }
}

function updateTrailParticles() {
    const now = Date.now();
    trailParticles = trailParticles.filter(p => {
        const age = now - p.createdAt;
        if (age > 1000) {
            p.element.remove();
            return false;
        }
        return true;
    });
}

function toggleTrail(enabled) {
    trailEnabled = enabled;
    if (!enabled) {
        // Clear all particles
        trailParticles.forEach(p => p.element.remove());
        trailParticles = [];
    }
}

// 11. Key Descriptions (Lore)
const keyDescriptions = {
    belobog: {
        name: 'Candy Key',
        icon: '🍬',
        description: 'A sweet key forged from crystallized memories of joy and laughter. Its sugary surface gleams with the warmth of cherished moments.',
        lore: 'Born from the sweetest dreams, this key unlocks paths paved with nostalgia.'
    },
    xianzhou: {
        name: 'Memory Key',
        icon: '🔮',
        description: 'A mystical key that holds fragments of forgotten memories. Its crystalline form reflects countless moments frozen in time.',
        lore: 'Within its depths lie echoes of what once was, waiting to be remembered.'
    },
    penacony: {
        name: 'Fortune Key',
        icon: '🎰',
        description: 'A golden key that shimmers with the thrill of chance and destiny. Each facet reflects a different possibility.',
        lore: 'Luck favors those who dare to spin the wheel of fate.'
    },
    jarilo: {
        name: 'Frozen Key',
        icon: '❄️',
        description: 'An icy key that never melts, preserving the beauty of winter eternal. Its cold touch brings clarity and peace.',
        lore: 'In the heart of winter, truth crystallizes into perfect form.'
    },
    herta: {
        name: 'Dimension Key',
        icon: '🌌',
        description: 'A cosmic key that bends space and time. Its surface ripples with the fabric of reality itself.',
        lore: 'Between dimensions, all paths converge into one.'
    },
    luofu: {
        name: 'Lotus Key',
        icon: '🪷',
        description: 'A serene key blooming with eternal grace. Its petals hold the wisdom of countless lifetimes.',
        lore: 'From muddy waters, the lotus rises pure and untainted.'
    },
    stellaron: {
        name: 'Stellaron Key',
        icon: '⭐',
        description: 'A radiant key pulsing with stellar energy. Its light guides travelers through the darkest voids.',
        lore: 'Even in darkness, stars remember how to shine.'
    },
    terminus: {
        name: 'Terminus Key',
        icon: '🚪',
        description: 'The final key, forged from all journeys taken. It opens the door to new beginnings.',
        lore: 'Every ending is but a doorway to another story.'
    }
};

function showKeyDescription(planetName) {
    const key = keyDescriptions[planetName];
    if (!key) return;
    
    let modal = document.getElementById('key-description-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'key-description-modal';
        modal.className = 'key-description-modal';
        modal.innerHTML = `
            <div class="key-description-panel">
                <button class="close-key-desc">✕</button>
                <div class="key-desc-icon"></div>
                <h2 class="key-desc-name"></h2>
                <p class="key-desc-description"></p>
                <div class="key-desc-lore"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.close-key-desc').addEventListener('click', () => {
            modal.classList.remove('show');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    // Update content
    modal.querySelector('.key-desc-icon').textContent = key.icon;
    modal.querySelector('.key-desc-name').textContent = key.name;
    modal.querySelector('.key-desc-description').textContent = key.description;
    modal.querySelector('.key-desc-lore').textContent = `"${key.lore}"`;
    
    modal.classList.add('show');
}

// 12. Ambient Music System (Placeholder - ready for audio files)
let audioContext = null;
let currentTrack = null;
let musicVolume = 0.7;
let sfxVolume = 0.8;
let isMusicMuted = false;

function initAudioSystem() {
    // Load volume settings
    musicVolume = parseInt(sessionStorage.getItem('musicVolume') || '70') / 100;
    sfxVolume = parseInt(sessionStorage.getItem('sfxVolume') || '80') / 100;
    isMusicMuted = sessionStorage.getItem('audioMuted') === 'true';
    
    console.log('[Phase 3] Audio system initialized (ready for audio files)');
    console.log(`Music: ${musicVolume * 100}%, SFX: ${sfxVolume * 100}%, Muted: ${isMusicMuted}`);
}

function playAmbientMusic(trackName) {
    if (isMusicMuted) return;
    
    console.log(`[Audio] Would play: ${trackName} at ${musicVolume * 100}% volume`);
    // TODO: Implement actual audio playback when audio files are added
    // const audio = new Audio(`audio/${trackName}.mp3`);
    // audio.volume = musicVolume;
    // audio.loop = true;
    // audio.play();
}

function playSoundEffect(sfxName) {
    if (isMusicMuted) return;
    
    console.log(`[Audio] Would play SFX: ${sfxName} at ${sfxVolume * 100}% volume`);
    // TODO: Implement actual SFX playback
    // const audio = new Audio(`audio/${sfxName}.mp3`);
    // audio.volume = sfxVolume;
    // audio.play();
}

function crossfadeMusic(fromTrack, toTrack, duration = 2000) {
    console.log(`[Audio] Would crossfade from ${fromTrack} to ${toTrack} over ${duration}ms`);
    // TODO: Implement crossfade logic
}

// 13. Randomization System
function randomizeJariloPuzzle() {
    // Randomize puzzle piece positions
    const pieces = document.querySelectorAll('.puzzle-piece');
    const positions = [];
    
    // Generate random positions around the puzzle frame
    pieces.forEach((piece, index) => {
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const distance = 200 + Math.random() * 150;
        
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        piece.style.left = `calc(50% + ${x}px)`;
        piece.style.top = `calc(50% + ${y}px)`;
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        // Add slight delay to animation
        piece.style.animationDelay = `${Math.random() * 2}s`;
    });
    
    console.log('[Phase 3] Jarilo puzzle randomized');
}

function randomizeHertaDimension() {
    // Randomize which piece is missing in the dimension puzzle
    const totalPieces = 9; // 3x3 grid
    const missingIndex = Math.floor(Math.random() * totalPieces);
    
    console.log(`[Phase 3] Herta dimension randomized - missing piece: ${missingIndex + 1}`);
    
    // Store for puzzle logic
    sessionStorage.setItem('hertaMissingPiece', missingIndex);
    
    return missingIndex;
}

// Update awardKey to use animation
const originalAwardKeyPhase3 = window.awardKey || function() {};
window.awardKey = function(planetName, sourceElement) {
    if (sourceElement) {
        animateKeyCollection(planetName, sourceElement);
    }
    
    // Call original function after animation starts
    setTimeout(() => {
        if (originalAwardKeyPhase3) originalAwardKeyPhase3(planetName);
    }, 100);
};

// Export Phase 3 functions
window.animateKeyCollection = animateKeyCollection;
window.toggleTrail = toggleTrail;
window.showKeyDescription = showKeyDescription;
window.playAmbientMusic = playAmbientMusic;
window.playSoundEffect = playSoundEffect;
window.randomizeJariloPuzzle = randomizeJariloPuzzle;
window.randomizeHertaDimension = randomizeHertaDimension;

console.log('[Phase 3] Advanced features ready! 🎨');


// Helper Functions for Phase 3
function showHelpModal() {
    const helpText = `
🎮 KEYBOARD SHORTCUTS

ESC - Close modal/go back
Enter - Submit answer
M - Toggle mute
S - Open settings
H - Show this help
K - View collected keys
1-8 - Jump to planets (if unlocked)

🎯 GAME TIPS

• Complete planets in order to unlock keys
• Collect all 8 keys to unlock the Terminus door
• Hover over planets to see what you'll unlock
• Your progress saves during the session
• Close the tab to reset and start fresh
• Press K to view your collected keys and their lore

✨ VISUAL EFFECTS

• Cursor trails can be toggled in settings (S)
• Reduced motion available for accessibility
• All animations respect your preferences
    `;
    
    alert(helpText);
}

function showCollectedKeysModal() {
    let modal = document.getElementById('collected-keys-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'collected-keys-modal';
        modal.className = 'key-description-modal';
        modal.innerHTML = `
            <div class="key-description-panel" style="max-width: 600px;">
                <button class="close-key-desc" onclick="this.closest('.key-description-modal').classList.remove('show')">✕</button>
                <h2 style="color: #ffd700; margin-bottom: 20px;">🔑 Collected Keys</h2>
                <div id="keys-list" style="display: grid; gap: 15px;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    // Update keys list
    const keysList = modal.querySelector('#keys-list');
    keysList.innerHTML = '';
    
    Object.keys(keyDescriptions).forEach(planetName => {
        const key = keyDescriptions[planetName];
        const isCollected = collectedKeys[planetName];
        
        const keyCard = document.createElement('div');
        keyCard.style.cssText = `
            padding: 15px;
            background: ${isCollected ? 'rgba(255, 215, 0, 0.1)' : 'rgba(100, 100, 100, 0.1)'};
            border: 2px solid ${isCollected ? '#ffd700' : '#666'};
            border-radius: 10px;
            display: flex;
            gap: 15px;
            align-items: center;
            cursor: ${isCollected ? 'pointer' : 'default'};
            opacity: ${isCollected ? '1' : '0.5'};
            transition: all 0.3s ease;
        `;
        
        if (isCollected) {
            keyCard.addEventListener('mouseenter', () => {
                keyCard.style.transform = 'scale(1.02)';
                keyCard.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
            });
            keyCard.addEventListener('mouseleave', () => {
                keyCard.style.transform = 'scale(1)';
                keyCard.style.boxShadow = 'none';
            });
            keyCard.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => showKeyDescription(planetName), 300);
            });
        }
        
        keyCard.innerHTML = `
            <div style="font-size: 40px;">${key.icon}</div>
            <div style="flex: 1; text-align: left;">
                <div style="color: ${isCollected ? '#ffd700' : '#666'}; font-weight: 700; margin-bottom: 5px;">
                    ${key.name}
                </div>
                <div style="color: #9ca3af; font-size: 12px;">
                    ${isCollected ? 'Click to view details' : 'Not yet collected'}
                </div>
            </div>
            ${isCollected ? '<div style="color: #55efc4; font-size: 20px;">✓</div>' : '<div style="color: #666; font-size: 20px;">🔒</div>'}
        `;
        
        keysList.appendChild(keyCard);
    });
    
    modal.classList.add('show');
}
