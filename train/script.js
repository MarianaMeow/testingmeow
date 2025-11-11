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

    function showDestinationPortal(planetKey) {
        if (!destinationPortal || !planetSelection) return;
        planetSelection.style.display = 'none';
        destinationPortal.style.display = 'flex';

        let text = 'Destination portal initialized.';
        if (planetKey === 'belobog') {
            text = 'Belobog Portal: You step into the frozen-yet-warm city under the aegis of the Astral Express.';
        } else if (planetKey === 'xianzhou') {
            text = 'Xianzhou Luofu: Preview locked. The jade immortals await in a future update.';
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
                        planetLabel.textContent = 'This destination is locked for now. Only Belobog is available.';
                    }
                    return;
                }

                // Unlocked planet -> go to its portal
                showDestinationPortal(planetKey);
            });
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
            showPlanetSelection();
        });
    }
});