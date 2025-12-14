import { awardKey, saveProgress, gameState } from './state.js';
import { initEnhancements } from './enhancements.js';

document.addEventListener('DOMContentLoaded', () => {
    initEnhancements();
    initBelobogScene();
});

function initBelobogScene() {
    const celestial1 = document.getElementById('belobog-celestial-1');
    const celestial2 = document.getElementById('belobog-celestial-2');
    const celestial3 = document.getElementById('belobog-celestial-3');
    
    const belobogFillGame = document.getElementById('belobog-fill-game');
    const belobogFillInput = document.getElementById('belobog-fill-input');
    const belobogFillSubmit = document.getElementById('belobog-fill-submit');
    const belobogFillFeedback = document.getElementById('belobog-fill-feedback');

    const belobogFillGame2 = document.getElementById('belobog-fill-game-2');
    const belobogFillInput2 = document.getElementById('belobog-fill-input-2');
    const belobogFillSubmit2 = document.getElementById('belobog-fill-submit-2');
    const belobogFillFeedback2 = document.getElementById('belobog-fill-feedback-2');

    const belobogFillGame3 = document.getElementById('belobog-fill-game-3');
    const belobogFillInput3 = document.getElementById('belobog-fill-input-3');
    const belobogFillSubmit3 = document.getElementById('belobog-fill-submit-3');
    const belobogFillFeedback3 = document.getElementById('belobog-fill-feedback-3');

    const belobogMissionPanel = document.getElementById('belobog-mission-panel');
    const belobogMissionToggle = document.getElementById('belobog-mission-toggle');
    const belobogMissionPill = document.getElementById('belobog-mission-pill');
    const backToPlanetsBtn = document.getElementById('back-to-planets');

    // Mission panel toggle
    if (belobogMissionPanel && belobogMissionToggle) {
        belobogMissionPanel.classList.remove('open');
        belobogMissionToggle.addEventListener('click', () => {
            belobogMissionPanel.classList.toggle('open');
        });
    }

    // Celestial 1 - opens fill game 1
    if (celestial1) {
        celestial1.addEventListener('click', () => {
            if (belobogFillGame) {
                belobogFillGame.style.display = 'flex';
                if (belobogFillInput) {
                    belobogFillInput.value = '';
                    belobogFillInput.focus();
                }
                if (belobogFillFeedback) belobogFillFeedback.textContent = '';
            }
        });
    }

    // Celestial 2 - opens fill game 2
    if (celestial2) {
        celestial2.addEventListener('click', () => {
            if (belobogFillGame2) {
                belobogFillGame2.style.display = 'flex';
                if (belobogFillInput2) {
                    belobogFillInput2.value = '';
                    belobogFillInput2.focus();
                }
                if (belobogFillFeedback2) belobogFillFeedback2.textContent = '';
            }
        });
    }

    // Celestial 3 - opens fill game 3
    if (celestial3) {
        celestial3.addEventListener('click', () => {
            if (belobogFillGame3) {
                belobogFillGame3.style.display = 'flex';
                if (belobogFillInput3) {
                    belobogFillInput3.value = '';
                    belobogFillInput3.focus();
                }
                if (belobogFillFeedback3) belobogFillFeedback3.textContent = '';
            }
        });
    }

    // Check if all trials complete
    function checkAllTrialsComplete() {
        if (gameState.trial1Complete && gameState.trial2Complete && gameState.trial3Complete) {
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
                if (noteEl) noteEl.textContent = 'Ready — Your resolve has lit the way to Xianzhou Luofu.';
            }
            if (belobogMissionPill) {
                belobogMissionPill.textContent = 'Complete';
                belobogMissionPill.classList.remove('mission-pill-pending');
                belobogMissionPill.classList.add('mission-pill-complete');
            }
            if (belobogMissionPanel) belobogMissionPanel.classList.add('open');
            awardKey('belobog');
        }
    }

    // Fill game 1 logic
    if (belobogFillSubmit && belobogFillInput && belobogFillFeedback && belobogFillGame) {
        const correctWord = 'light';
        const optionButtons = document.querySelectorAll('.belobog-fill-option');
        const blankSpan = document.querySelector('.belobog-fill-blank');

        optionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const chosen = btn.getAttribute('data-word') || '';
                belobogFillInput.value = chosen;
                if (blankSpan) blankSpan.textContent = chosen || '______';
                if (belobogFillFeedback) belobogFillFeedback.textContent = '';
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
                belobogFillFeedback.textContent = 'Correct. "You are my light among the stars." The castle glows at your words.';
                belobogFillFeedback.style.color = '#55efc4';
                gameState.trial1Complete = true;
                setTimeout(() => {
                    belobogFillGame.style.display = 'none';
                    checkAllTrialsComplete();
                    saveProgress(gameState);
                }, 1600);
            } else {
                if (blankSpan) blankSpan.textContent = attempt;
                belobogFillFeedback.textContent = 'Not quite. Only one truly feels like a guiding warmth.';
                belobogFillFeedback.style.color = '#e94560';
            }
        }

        belobogFillSubmit.addEventListener('click', evaluateFill);
        belobogFillInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') evaluateFill(); });
    }

    // Fill game 2 logic
    if (belobogFillSubmit2 && belobogFillInput2 && belobogFillFeedback2 && belobogFillGame2) {
        const correctWord2 = 'warmth';
        const optionButtons2 = document.querySelectorAll('.belobog-fill-option-2');
        const blankSpan2 = document.querySelector('.belobog-fill-blank-2');

        optionButtons2.forEach(btn => {
            btn.addEventListener('click', () => {
                const chosen = btn.getAttribute('data-word') || '';
                belobogFillInput2.value = chosen;
                if (blankSpan2) blankSpan2.textContent = chosen || '______';
                if (belobogFillFeedback2) belobogFillFeedback2.textContent = '';
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
                belobogFillFeedback2.textContent = 'Correct. "Your presence is my warmth in the cold." The frozen seal thaws.';
                belobogFillFeedback2.style.color = '#55efc4';
                gameState.trial2Complete = true;
                setTimeout(() => {
                    belobogFillGame2.style.display = 'none';
                    checkAllTrialsComplete();
                    saveProgress(gameState);
                }, 1600);
            } else {
                if (blankSpan2) blankSpan2.textContent = attempt;
                belobogFillFeedback2.textContent = 'Not quite. Only one truly melts the ice.';
                belobogFillFeedback2.style.color = '#e94560';
            }
        }

        belobogFillSubmit2.addEventListener('click', evaluateFill2);
        belobogFillInput2.addEventListener('keypress', (e) => { if (e.key === 'Enter') evaluateFill2(); });
    }

    // Fill game 3 logic
    if (belobogFillSubmit3 && belobogFillInput3 && belobogFillFeedback3 && belobogFillGame3) {
        const correctWord3 = 'forever';
        const optionButtons3 = document.querySelectorAll('.belobog-fill-option-3');
        const blankSpan3 = document.querySelector('.belobog-fill-blank-3');

        optionButtons3.forEach(btn => {
            btn.addEventListener('click', () => {
                const chosen = btn.getAttribute('data-word') || '';
                belobogFillInput3.value = chosen;
                if (blankSpan3) blankSpan3.textContent = chosen || '______';
                if (belobogFillFeedback3) belobogFillFeedback3.textContent = '';
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
                belobogFillFeedback3.textContent = 'Correct. "I will love you forever, across all worlds." The stars sing in harmony.';
                belobogFillFeedback3.style.color = '#55efc4';
                gameState.trial3Complete = true;
                setTimeout(() => {
                    belobogFillGame3.style.display = 'none';
                    checkAllTrialsComplete();
                    saveProgress(gameState);
                }, 1600);
            } else {
                if (blankSpan3) blankSpan3.textContent = attempt;
                belobogFillFeedback3.textContent = 'Not quite. Only one word echoes through eternity.';
                belobogFillFeedback3.style.color = '#e94560';
            }
        }

        belobogFillSubmit3.addEventListener('click', evaluateFill3);
        belobogFillInput3.addEventListener('keypress', (e) => { if (e.key === 'Enter') evaluateFill3(); });
    }

    // Back to planets
    if (backToPlanetsBtn) {
        backToPlanetsBtn.addEventListener('click', () => {
            if (belobogFillGame) belobogFillGame.style.display = 'none';
            if (belobogFillGame2) belobogFillGame2.style.display = 'none';
            if (belobogFillGame3) belobogFillGame3.style.display = 'none';
            window.location.href = 'planet-selection.html';
        });
    }
}
