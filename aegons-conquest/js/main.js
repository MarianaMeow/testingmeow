// ========== MAIN GAME ==========
const Game = {
  canvas: null,
  engine: null,
  scene: null,
  state: CONFIG.states.LOADING,
  mode: CONFIG.modes.DRAGON,
  isRunning: false,

  // Initialize the game
  init: async () => {
    console.log('Initializing Aegon\'s Conquest...');

    // Get canvas
    Game.canvas = document.getElementById('game-canvas');
    
    // Create Babylon engine
    Game.engine = new BABYLON.Engine(Game.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      Game.engine.resize();
    });

    // Initialize UI systems
    Menu.init();
    HUD.init();

    // Load the game
    await Game.load();
  },

  // Load game assets and create scene
  load: async () => {
    Menu.updateLoading(10, 'Creating world...');

    // Create scene
    Game.scene = new BABYLON.Scene(Game.engine);
    Game.scene.collisionsEnabled = true;

    Menu.updateLoading(20, 'Setting up environment...');
    await Game.delay(200);

    // Create environment (sky, lights, fog)
    Environment.create(Game.scene);

    Menu.updateLoading(35, 'Generating terrain...');
    await Game.delay(200);

    // Create terrain
    Terrain.create(Game.scene);

    Menu.updateLoading(50, 'Building city...');
    await Game.delay(200);

    // Create city
    City.create(Game.scene);

    Menu.updateLoading(65, 'Summoning dragon...');
    await Game.delay(200);

    // Create dragon
    Dragon.create(Game.scene);

    Menu.updateLoading(75, 'Preparing warrior...');
    await Game.delay(200);

    // Create human
    Human.create(Game.scene);

    Menu.updateLoading(85, 'Setting up camera...');
    await Game.delay(200);

    // Create camera
    CameraSystem.create(Game.scene);

    Menu.updateLoading(90, 'Initializing fire system...');
    await Game.delay(200);

    // Initialize fire system
    Fire.init(Game.scene);

    Menu.updateLoading(95, 'Initializing controls...');
    await Game.delay(200);

    // Initialize controls
    Controls.init();

    Menu.updateLoading(100, 'Ready!');
    await Game.delay(500);

    // Hide loading, show menu
    Menu.hideLoading();
    Menu.showMenu();

    Game.state = CONFIG.states.MENU;

    // Start render loop (but game logic paused)
    Game.engine.runRenderLoop(() => {
      Game.scene.render();
    });
  },

  // Start the game
  start: () => {
    console.log('Starting conquest!');
    
    Game.state = CONFIG.states.PLAYING;
    Game.isRunning = true;
    Game.mode = CONFIG.modes.DRAGON;

    // Show HUD
    HUD.show();
    HUD.updateMode(Game.mode);

    // Show intro message
    HUD.showMessage('BURN THEM ALL!', 2000);

    // Request pointer lock
    Game.canvas.requestPointerLock();

    // Start game loop
    Game.scene.registerBeforeRender(Game.update);
  },

  // Main game update loop
  update: () => {
    if (Game.state !== CONFIG.states.PLAYING) return;

    const deltaTime = Game.engine.getDeltaTime();

    // Update based on current mode
    if (Game.mode === CONFIG.modes.DRAGON) {
      const input = Controls.getDragonInput();
      Dragon.update(deltaTime, input);
    } else {
      const input = Controls.getHumanInput();
      Human.update(deltaTime, input);
    }

    // Update camera
    CameraSystem.update(Game.mode);

    // Update fire system
    Fire.update();

    // Update HUD
    HUD.update(Game.mode);

    // Check win condition
    Game.checkWinCondition();
  },

  // Switch between dragon and human mode
  switchMode: () => {
    if (Game.mode === CONFIG.modes.DRAGON) {
      Game.mode = CONFIG.modes.HUMAN;
      
      // Position human near dragon
      Human.position = Dragon.position.clone();
      Human.position.y = Terrain.getGroundHeight(Human.position.x, Human.position.z) + 1;
      Human.mesh.position = Human.position.clone();
      
      HUD.showMessage('Human Mode', 1500);
    } else {
      Game.mode = CONFIG.modes.DRAGON;
      HUD.showMessage('Dragon Mode', 1500);
    }

    HUD.updateMode(Game.mode);
    CameraSystem.transitionTo(Game.mode);
  },

  // Check if player has won
  checkWinCondition: () => {
    const destroyedCount = City.buildings.filter(b => b.destroyed).length;
    const totalBuildings = City.buildings.length;

    // Win when 80% destroyed
    if (destroyedCount >= totalBuildings * 0.8) {
      Game.win();
    }
  },

  // Player wins
  win: () => {
    Game.state = CONFIG.states.MENU;
    Game.isRunning = false;
    
    HUD.hide();
    document.exitPointerLock();

    Menu.showGameOver({
      buildingsDestroyed: HUD.buildingsDestroyed,
      score: HUD.score
    });
  },

  // Pause game
  pause: () => {
    Game.state = CONFIG.states.PAUSED;
    document.exitPointerLock();
    Menu.showPause();
  },

  // Resume game
  resume: () => {
    Game.state = CONFIG.states.PLAYING;
    Game.canvas.requestPointerLock();
    Menu.hidePause();
  },

  // Stop game
  stop: () => {
    Game.state = CONFIG.states.MENU;
    Game.isRunning = false;
    HUD.hide();
    document.exitPointerLock();
  },

  // Restart game
  restart: () => {
    // Reset score
    HUD.score = 0;
    HUD.buildingsDestroyed = 0;

    // Reset dragon
    Dragon.position = new BABYLON.Vector3(0, 50, -50);
    Dragon.rotation = new BABYLON.Vector3(0, 0, 0);
    Dragon.fireEnergy = CONFIG.dragon.fireEnergy;
    Dragon.mesh.position = Dragon.position.clone();

    // Reset human
    Human.position = new BABYLON.Vector3(0, 1, -50);
    Human.health = 100;
    Human.mesh.position = Human.position.clone();

    // Rebuild city (dispose old, create new)
    City.buildings.forEach(b => {
      if (b.mesh) b.mesh.dispose();
      if (b.roof) b.roof.dispose();
    });
    City.buildings = [];
    City.create(Game.scene);

    // Clear fires
    Fire.dispose();
    Fire.init(Game.scene);

    // Start fresh
    Game.start();
  },

  // Utility delay
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Start when page loads
window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
