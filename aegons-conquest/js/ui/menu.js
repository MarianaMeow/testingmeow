// ========== MENU SYSTEM ==========
const Menu = {
  elements: {},

  init: () => {
    // Cache DOM elements
    Menu.elements = {
      loadingScreen: document.getElementById('loading-screen'),
      loadingFill: document.getElementById('loading-fill'),
      loadingText: document.getElementById('loading-text'),
      startMenu: document.getElementById('start-menu'),
      startBtn: document.getElementById('start-btn'),
      controlsBtn: document.getElementById('controls-btn'),
      controlsModal: document.getElementById('controls-modal'),
      closeControls: document.getElementById('close-controls')
    };

    // Bind events
    Menu.bindEvents();
  },

  bindEvents: () => {
    // Start button
    if (Menu.elements.startBtn) {
      Menu.elements.startBtn.addEventListener('click', () => {
        Menu.hideMenu();
        Game.start();
      });
    }

    // Controls button
    if (Menu.elements.controlsBtn) {
      Menu.elements.controlsBtn.addEventListener('click', () => {
        Menu.showControls();
      });
    }

    // Close controls
    if (Menu.elements.closeControls) {
      Menu.elements.closeControls.addEventListener('click', () => {
        Menu.hideControls();
      });
    }

    // Close modal on outside click
    if (Menu.elements.controlsModal) {
      Menu.elements.controlsModal.addEventListener('click', (e) => {
        if (e.target === Menu.elements.controlsModal) {
          Menu.hideControls();
        }
      });
    }
  },

  // Loading screen methods
  updateLoading: (progress, text) => {
    if (Menu.elements.loadingFill) {
      Menu.elements.loadingFill.style.width = progress + '%';
    }
    if (Menu.elements.loadingText) {
      Menu.elements.loadingText.textContent = text;
    }
  },

  hideLoading: () => {
    if (Menu.elements.loadingScreen) {
      Menu.elements.loadingScreen.style.opacity = '0';
      Menu.elements.loadingScreen.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        Menu.elements.loadingScreen.classList.add('hidden');
      }, 500);
    }
  },

  // Start menu methods
  showMenu: () => {
    if (Menu.elements.startMenu) {
      Menu.elements.startMenu.classList.remove('hidden');
      Menu.elements.startMenu.style.opacity = '0';
      setTimeout(() => {
        Menu.elements.startMenu.style.opacity = '1';
        Menu.elements.startMenu.style.transition = 'opacity 0.5s';
      }, 50);
    }
  },

  hideMenu: () => {
    if (Menu.elements.startMenu) {
      Menu.elements.startMenu.style.opacity = '0';
      setTimeout(() => {
        Menu.elements.startMenu.classList.add('hidden');
      }, 500);
    }
  },

  // Controls modal methods
  showControls: () => {
    if (Menu.elements.controlsModal) {
      Menu.elements.controlsModal.classList.remove('hidden');
    }
  },

  hideControls: () => {
    if (Menu.elements.controlsModal) {
      Menu.elements.controlsModal.classList.add('hidden');
    }
  },

  // Game over screen
  showGameOver: (stats) => {
    const overlay = document.createElement('div');
    overlay.id = 'game-over';
    overlay.innerHTML = `
      <div class="game-over-content">
        <h1>CONQUEST COMPLETE</h1>
        <div class="stats">
          <p>Buildings Destroyed: ${stats.buildingsDestroyed}</p>
          <p>Score: ${stats.score}</p>
        </div>
        <button id="restart-btn" class="menu-btn primary">CONQUER AGAIN</button>
        <button id="menu-btn" class="menu-btn">MAIN MENU</button>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;
    document.body.appendChild(overlay);

    // Bind restart
    document.getElementById('restart-btn').addEventListener('click', () => {
      overlay.remove();
      Game.restart();
    });

    document.getElementById('menu-btn').addEventListener('click', () => {
      overlay.remove();
      Menu.showMenu();
    });
  },

  // Pause menu
  showPause: () => {
    const overlay = document.createElement('div');
    overlay.id = 'pause-menu';
    overlay.innerHTML = `
      <div class="pause-content">
        <h1>PAUSED</h1>
        <button id="resume-btn" class="menu-btn primary">RESUME</button>
        <button id="quit-btn" class="menu-btn">QUIT TO MENU</button>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;
    document.body.appendChild(overlay);

    document.getElementById('resume-btn').addEventListener('click', () => {
      overlay.remove();
      Game.resume();
    });

    document.getElementById('quit-btn').addEventListener('click', () => {
      overlay.remove();
      Game.stop();
      Menu.showMenu();
    });
  },

  hidePause: () => {
    const pause = document.getElementById('pause-menu');
    if (pause) pause.remove();
  }
};
