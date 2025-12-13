// ========== HUD SYSTEM ==========
const HUD = {
  elements: {},
  score: 0,
  buildingsDestroyed: 0,

  init: () => {
    // Cache DOM elements
    HUD.elements = {
      hud: document.getElementById('hud'),
      modeIcon: document.getElementById('mode-icon'),
      modeText: document.getElementById('mode-text'),
      locationName: document.getElementById('location-name'),
      fireFill: document.getElementById('fire-fill'),
      healthFill: document.getElementById('health-fill'),
      hintText: document.getElementById('hint-text'),
      minimapPlayer: document.getElementById('minimap-player')
    };
  },

  show: () => {
    if (HUD.elements.hud) {
      HUD.elements.hud.classList.remove('hidden');
    }
  },

  hide: () => {
    if (HUD.elements.hud) {
      HUD.elements.hud.classList.add('hidden');
    }
  },

  updateMode: (mode) => {
    if (mode === CONFIG.modes.DRAGON) {
      HUD.elements.modeIcon.textContent = '🐉';
      HUD.elements.modeText.textContent = 'DRAGON';
      HUD.elements.hintText.textContent = 'CLICK to breathe fire | TAB to switch to Human';
    } else {
      HUD.elements.modeIcon.textContent = '🧑';
      HUD.elements.modeText.textContent = 'HUMAN';
      HUD.elements.hintText.textContent = 'CLICK to grapple | E to call dragon | TAB to switch';
    }
  },

  updateFire: (percent) => {
    if (HUD.elements.fireFill) {
      HUD.elements.fireFill.style.width = (percent * 100) + '%';
      
      // Color based on level
      if (percent < 0.25) {
        HUD.elements.fireFill.style.background = 'linear-gradient(90deg, #ff0000, #ff4400)';
      } else if (percent < 0.5) {
        HUD.elements.fireFill.style.background = 'linear-gradient(90deg, #ff4400, #ff6600)';
      } else {
        HUD.elements.fireFill.style.background = 'linear-gradient(90deg, #ff4500, #ff8c00)';
      }
    }
  },

  updateHealth: (percent) => {
    if (HUD.elements.healthFill) {
      HUD.elements.healthFill.style.width = (percent * 100) + '%';
      
      // Color based on level
      if (percent < 0.25) {
        HUD.elements.healthFill.style.background = 'linear-gradient(90deg, #ff0000, #ff3333)';
      } else if (percent < 0.5) {
        HUD.elements.healthFill.style.background = 'linear-gradient(90deg, #ff6600, #ff9900)';
      } else {
        HUD.elements.healthFill.style.background = 'linear-gradient(90deg, #00ff00, #66ff66)';
      }
    }
  },

  updateMinimap: (position) => {
    if (!HUD.elements.minimapPlayer) return;

    // Convert world position to minimap position
    const mapSize = 100; // minimap is 100x100 px
    const worldSize = CONFIG.world.size;
    
    const x = ((position.x + worldSize / 2) / worldSize) * mapSize;
    const z = ((position.z + worldSize / 2) / worldSize) * mapSize;

    HUD.elements.minimapPlayer.style.left = Utils.clamp(x, 0, mapSize - 5) + 'px';
    HUD.elements.minimapPlayer.style.top = Utils.clamp(z, 0, mapSize - 5) + 'px';
  },

  updateLocation: (name) => {
    if (HUD.elements.locationName) {
      HUD.elements.locationName.textContent = name;
    }
  },

  setHint: (text) => {
    if (HUD.elements.hintText) {
      HUD.elements.hintText.textContent = text;
    }
  },

  addScore: (points) => {
    HUD.score += points;
    HUD.buildingsDestroyed++;
    
    // Show score popup
    HUD.showScorePopup(points);
  },

  showScorePopup: (points) => {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + points;
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 48px;
      font-weight: bold;
      color: #ff6600;
      text-shadow: 0 0 20px #ff4400;
      pointer-events: none;
      animation: scorePopup 1s ease-out forwards;
    `;
    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 1000);
  },

  showDamage: () => {
    // Red flash on screen
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(transparent 50%, rgba(255, 0, 0, 0.3));
      pointer-events: none;
      animation: damageFlash 0.3s ease-out forwards;
    `;
    document.body.appendChild(flash);

    setTimeout(() => flash.remove(), 300);
  },

  showMessage: (text, duration = 3000) => {
    const msg = document.createElement('div');
    msg.className = 'game-message';
    msg.textContent = text;
    msg.style.cssText = `
      position: fixed;
      top: 30%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 24px;
      color: #fff;
      text-shadow: 0 0 10px #000;
      background: rgba(0, 0, 0, 0.7);
      padding: 15px 30px;
      border-radius: 5px;
      border: 1px solid #ff6600;
      pointer-events: none;
    `;
    document.body.appendChild(msg);

    setTimeout(() => {
      msg.style.opacity = '0';
      msg.style.transition = 'opacity 0.5s';
      setTimeout(() => msg.remove(), 500);
    }, duration);
  },

  update: (mode) => {
    // Update minimap based on current mode
    const position = mode === CONFIG.modes.DRAGON 
      ? Dragon.getPosition() 
      : Human.getPosition();
    
    HUD.updateMinimap(position);
  }
};
