import { awardKey, saveProgress, gameState } from '../state.js';
import { showPlanetSelection } from '../navigation.js';

export function initPenaconyScene() {
    const penaconyBackPlanets = document.getElementById('penacony-back-planets');
    if (penaconyBackPlanets) {
        penaconyBackPlanets.addEventListener('click', () => {
            const penaconyPortalEl = document.getElementById('penacony-portal');
            if (penaconyPortalEl) penaconyPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

    const slotStartBtn = document.getElementById('slot-start-btn');
    const slotEquation = document.getElementById('slot-equation');
    const coinContainer = document.getElementById('coin-container');
    const penaconyFeedback = document.getElementById('penacony-feedback');

    let currentAnswer = null;
    let gameActive = false;
    let gamePhase = 'start';
    let selectedCoinValue = null;
    const totalProblems = 3;

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
            } else {
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
                    gameState.problemsSolved++;
                    
                    const shard = document.getElementById(`shard-${gameState.problemsSolved}`);
                    if (shard) {
                        shard.classList.remove('locked');
                        shard.classList.add('collected');
                    }
                    
                    penaconyFeedback.textContent = `Correct! ✓ Ticket shard ${gameState.problemsSolved} collected!`;
                    penaconyFeedback.style.color = '#55efc4';
                    
                    setTimeout(() => {
                        if (gameState.problemsSolved >= totalProblems) {
                            completeGame();
                        } else {
                            resetGame();
                        }
                    }, 2000);
                } else {
                    penaconyFeedback.textContent = `Wrong! The answer was ${correctAnswer}. (${gameState.problemsSolved}/${totalProblems} shards collected)`;
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
            slotEquation.textContent = '🎰 WINNER! 🎰';
            penaconyFeedback.textContent = 'All 3 ticket shards collected! Jarilo-VI is now accessible!';
            penaconyFeedback.style.color = '#ffd700';
            slotStartBtn.textContent = 'PLAY AGAIN';
            slotStartBtn.disabled = false;

            const jariloOrb = document.querySelector('.planet-option[data-planet="jarilo"]');
            if (jariloOrb) {
                jariloOrb.classList.remove('locked');
                jariloOrb.classList.add('unlocked');
            }
            
            awardKey('penacony');
            saveProgress(gameState);
        }

    function resetGame() {
            gameActive = false;
            gamePhase = 'start';
            currentAnswer = null;
            selectedCoinValue = null;
            slotEquation.textContent = gameState.problemsSolved > 0 ? `${gameState.problemsSolved}/${totalProblems} shards - Press Start` : 'Press Start';
            coinContainer.innerHTML = '';
            penaconyFeedback.textContent = '';
            slotStartBtn.textContent = 'START';
            slotStartBtn.disabled = false;
        }

    if (slotStartBtn) {
        slotStartBtn.addEventListener('click', () => {
            if (gamePhase === 'completed') {
                gameState.problemsSolved = 0;
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

            if (gameActive) return;
            
            gameActive = true;
            gamePhase = 'equation-showing';
            slotStartBtn.disabled = true;
            penaconyFeedback.textContent = '';
            
            slotEquation.textContent = '...';
            
            setTimeout(() => {
                const problem = generateMathProblem();
                currentAnswer = problem.answer;
                slotEquation.textContent = problem.equation;
                
                setTimeout(() => {
                    const coinOptions = generateCoinOptions(currentAnswer);
                    showCoinsPhase(coinOptions, currentAnswer);
                }, 500);
            }, 800);
        });
    }
}
