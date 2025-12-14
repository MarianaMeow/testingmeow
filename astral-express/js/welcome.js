import { gameState, saveProgress, loadProgress, applyProgress, updateProgressBar } from './state.js';

export function initWelcome() {
    const passwordInput = document.getElementById('password-input');
    const submitBtn = document.getElementById('submit-btn');
    const message = document.getElementById('message');
    const hint = document.getElementById('hint');
    const welcomeScreen = document.getElementById('welcome-screen');

    let attempts = 0;
    const correctPassword = 'maria';

    let savedProgress = null;
    setTimeout(() => {
        savedProgress = loadProgress();
    }, 100);

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const enteredPassword = passwordInput.value.trim().toLowerCase();
            if (enteredPassword === correctPassword || enteredPassword === 'my dearest, maria' || enteredPassword === 'skip') {
                if (message) {
                    message.textContent = 'Welcome aboard the Astral Express!';
                    message.style.color = '#55efc4';
                }
                if (hint) hint.style.display = 'none';

                setTimeout(() => {
                    // Navigate to loading page
                    window.location.href = 'pages/loading.html';
                }, 1000);
            } else {
                attempts++;
                if (attempts >= 2 && hint) {
                    hint.style.display = 'block';
                }
                if (message) {
                    message.textContent = 'Incorrect password. Please try again.';
                    message.style.color = '#ff7675';
                }
            }
        });
    }

    if (passwordInput && submitBtn) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    }
}