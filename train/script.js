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
    // LOCALSTORAGE PROGRESS SYSTEM
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

        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }

    function loadProgress() {
        const saved = localStorage.getItem(STORAGE_KEY);
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

    // Terminus Door Interaction
    const terminusDoor = document.getElementById('terminus-door');
    const terminusLabel = document.getElementById('terminus-label');
    
    if (terminusDoor) {
        terminusDoor.addEventListener('click', () => {
            if (terminusLabel) {
                terminusLabel.textContent = 'The door opens... revealing a message of eternal love.';
                terminusLabel.style.color = '#ffd700';
            }
            
            // Add unlock animation
            terminusDoor.classList.add('unlocked');
            
            // Show a special message after a moment
            setTimeout(() => {
                alert('🌟 Thank you for completing this journey! 🌟\n\nThis adventure was crafted with love.\nMay your own journey be filled with light and wonder.');
            }, 800);
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
});