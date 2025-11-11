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
    const correctPassword = 'my dearest, Maria';

    submitBtn.addEventListener('click', function() {
        const enteredPassword = passwordInput.value.trim();
        if (enteredPassword === correctPassword) {
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
            text = 'Penacony: Preview locked. The dreamscape will open in a future update.';
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

                if (option.classList.contains('locked')) {
                    if (planetLabel) {
                        planetLabel.textContent = 'This destination is locked for now. Only Belobog and Xianzhou Luofu are available.';
                    }
                    return;
                }

                // Unlocked planets route to portal screen:
                // - belobog -> existing Belobog castle portal
                // - xianzhou -> use same portal shell, but keep content WIP/placeholder for now
                showDestinationPortal(planetKey);
            });
        });
    }

    // Xianzhou Luofu: shattered mirror memory interactions (no start button; shards are live)
    const xianzhouLabel = document.getElementById('xianzhou-label');
    const xianzhouShards = document.querySelectorAll('.xianzhou-glass-layer .glass-shard');
    const xianzhouBackPlanets = document.getElementById('xianzhou-back-planets');
    const xianzhouRedShard = document.getElementById('xianzhou-red-shard');

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

    // Red shard: interactive input — user can "write" their own memory on click
    if (xianzhouRedShard) {
        xianzhouRedShard.addEventListener('click', () => {
            // Simple inline prompt overlay using built-in prompt (keeps this self-contained)
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

    // Belobog destination: celestial relic interactions
    const celestial1 = document.getElementById('belobog-celestial-1');
    const celestial2 = document.getElementById('belobog-celestial-2');
    const celestial3 = document.getElementById('belobog-celestial-3');
    const belobogFillGame = document.getElementById('belobog-fill-game');
    const belobogFillInput = document.getElementById('belobog-fill-input');
    const belobogFillSubmit = document.getElementById('belobog-fill-submit');
    const belobogFillFeedback = document.getElementById('belobog-fill-feedback');

    // Belobog mission dropdown + circular ticket forge
    const belobogMissionPanel = document.getElementById('belobog-mission-panel');
    const belobogMissionToggle = document.getElementById('belobog-mission-toggle');
    const belobogMissionContent = document.getElementById('belobog-mission-content');
    const belobogMissionPill = document.getElementById('belobog-mission-pill');

    const belobogTicketForge = document.getElementById('belobog-ticket-forge');
    const belobogTicketForgeCircle = document.getElementById('belobog-ticket-forge-circle');
    const belobogTicketForgeFill = document.getElementById('belobog-ticket-forge-fill');

    if (belobogMissionPanel && belobogMissionToggle && belobogMissionContent) {
        // Start collapsed
        belobogMissionPanel.classList.remove('open');

        belobogMissionToggle.addEventListener('click', () => {
            belobogMissionPanel.classList.toggle('open');
        });
    }

    // Helper to set forge ring progress (0 to 1 -> 0deg to 270deg sweep)
    function setBelobogForgeProgress(ratio) {
        if (!belobogTicketForgeFill) return;
        const clamped = Math.max(0, Math.min(1, ratio));
        const maxDeg = 270; // not full, feels like "forging" arc
        const deg = -90 + maxDeg * clamped;
        belobogTicketForgeFill.style.transform = `rotate(${deg}deg)`;
    }

    // Initial: reached Belobog portal = some progress shown
    setBelobogForgeProgress(0.3);

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

    // Celestial 2 & 3: placeholder redirects/logs for future mini-games
    if (celestial2) {
        celestial2.addEventListener('click', () => {
            console.log('[Belobog] Frostbound Seal mini-game (coming soon).');
        });
    }

    if (celestial3) {
        celestial3.addEventListener('click', () => {
            console.log('[Belobog] Stellar Choir mini-game (coming soon).');
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

                // Mark Belobog mission as complete + visually hint ticket progress
                const statusEl = document.getElementById('belobog-mission-status');
                if (statusEl) {
                    statusEl.textContent = 'Complete — Ticket forging conditions satisfied.';
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

                // Fill the circular forge ring = ticket card forged
                setBelobogForgeProgress(1);
                if (belobogTicketForgeCircle) {
                    belobogTicketForgeCircle.classList.add('complete');
                }

                setTimeout(() => {
                    belobogFillGame.style.display = 'none';
                }, 1600);

                // Simulate transferring the forged ticket into Inventory (Main Menu)
                const invStand = document.getElementById('inv-stand');
                if (invStand) {
                    invStand.setAttribute('data-ticket-xianzhou', 'ready');
                    // Optional subtle visual cue hook:
                    invStand.classList.add('has-ticket-upgrade');
                }
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