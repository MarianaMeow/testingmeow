import { awardKey, saveProgress, gameState } from '../state.js';
import { showPlanetSelection } from '../navigation.js';

export function initStellaronScene() {
    const stellaronBackPlanets = document.getElementById('stellaron-back-planets');
    if (stellaronBackPlanets) {
        stellaronBackPlanets.addEventListener('click', () => {
            const stellaronPortalEl = document.getElementById('stellaron-portal');
            if (stellaronPortalEl) stellaronPortalEl.style.display = 'none';
            showPlanetSelection();
        });
    }

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
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, 500, 500);

            const visionRadius = 2;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const distance = Math.abs(col - playerX) + Math.abs(row - playerY);
                    if (distance <= visionRadius) {
                        if (maze[row][col] === 1) {
                            ctx.fillStyle = '#222';
                            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                        } else {
                            ctx.fillStyle = '#1a1a1a';
                            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                            ctx.strokeStyle = '#333';
                            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
                        }
                    }
                }
            }

            ctx.fillStyle = '#7c3aed';
            ctx.beginPath();
            ctx.arc(playerX * cellSize + cellSize/2, playerY * cellSize + cellSize/2, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#e11d48';
            ctx.beginPath();
            ctx.arc(exitX * cellSize + cellSize/2, exitY * cellSize + cellSize/2, 12, 0, Math.PI * 2);
            ctx.fill();

            if (mazeLight) {
                mazeLight.style.left = (playerX * cellSize + cellSize/2) + 'px';
                mazeLight.style.top = (playerY * cellSize + cellSize/2) + 'px';
            }
        }

        function tryMove(dx, dy) {
            const newX = playerX + dx;
            const newY = playerY + dy;

            if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) return;
            if (maze[newY][newX] === 1) return;

            playerX = newX;
            playerY = newY;
            drawMaze();

            if (playerX === exitX && playerY === exitY) {
                if (mazeStatus) {
                    mazeStatus.textContent = 'You escaped the shadow maze! Key obtained!';
                    mazeStatus.style.color = '#55efc4';
                }
                
                awardKey('stellaron');
                saveProgress(gameState);

                setTimeout(closeMaze, 2000);
            }
        }

        document.addEventListener('keydown', (e) => {
            if (!mazeContainer || mazeContainer.style.display === 'none') return;

            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    tryMove(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    tryMove(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    tryMove(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    tryMove(1, 0);
                    break;
            }
        });

        drawMaze();
        if (mazeLight) {
            mazeLight.style.left = (playerX * cellSize + cellSize/2) + 'px';
            mazeLight.style.top = (playerY * cellSize + cellSize/2) + 'px';
        }
    }
}
