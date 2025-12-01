import { awardKey, saveProgress, gameState } from '../state.js';
import { showPlanetSelection } from '../navigation.js';

export function initLuofuScene() {
    const luofuBackPlanets = document.getElementById('luofu-back-planets');
    if (luofuBackPlanets) {
        luofuBackPlanets.addEventListener('click', () => {
            const luofuPortalEl = document.getElementById('luofu-portal');
            if (luofuPortalEl) luofuPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

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
            if (stone) {
                stone.classList.add('correct');
                setTimeout(() => stone.classList.remove('correct'), 500);
            }

            if (playerSequence.length === stoneSequence.length) {
                canClick = false;
                if (stoneFeedback) {
                    stoneFeedback.textContent = '✓ Perfect crossing! ✓';
                    stoneFeedback.style.color = '#90EE90';
                }

                if (currentRound < maxRounds) {
                    currentRound++;
                    if (stoneRoundEl) stoneRoundEl.textContent = currentRound;
                    setTimeout(() => {
                        startNewRound();
                    }, 2000);
                } else {
                    setTimeout(() => {
                        completeStoneGame();
                    }, 2000);
                }
            }
        } else {
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
        stoneSequence = generateSequence(currentRound + 2);
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
            stoneFeedback.textContent = '🧭 You have crossed the sacred river! 🧭';
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

        const stellaronOrb = document.querySelector('.planet-option[data-planet="stellaron"]');
        if (stellaronOrb) {
            stellaronOrb.classList.remove('locked');
            stellaronOrb.classList.add('unlocked');
        }
        
        awardKey('luofu');
        saveProgress(gameState);
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

            const stoneNum = parseInt(stone.getAttribute('data-stone'), 10);
            playerSequence.push(stoneNum);
            
            stone.classList.add('active');
            setTimeout(() => stone.classList.remove('active'), 300);

            checkPlayerStep(stoneNum);
        });
    });
}
