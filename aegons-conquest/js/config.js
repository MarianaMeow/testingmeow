// ========== GAME CONFIGURATION ==========
const CONFIG = {
  // World settings
  world: {
    size: 500,           // World size (500x500 units)
    groundLevel: 0,
    skyHeight: 200
  },

  // Dragon settings
  dragon: {
    speed: 0.8,
    turnSpeed: 0.03,
    verticalSpeed: 0.5,
    minHeight: 10,
    maxHeight: 150,
    fireRange: 50,
    fireCooldown: 100,    // ms between fire bursts
    fireEnergy: 100,
    fireRegenRate: 0.2,
    fireCost: 1
  },

  // Human settings
  human: {
    speed: 0.3,
    jumpForce: 0.5,
    gravity: 0.02,
    grappleSpeed: 0.8,
    grappleRange: 80,
    grappleCooldown: 500
  },

  // Camera settings
  camera: {
    dragonDistance: 30,
    dragonHeight: 10,
    humanDistance: 15,
    humanHeight: 5,
    smoothing: 0.1
  },

  // City settings
  city: {
    buildingCount: 20,  // Reduced for performance
    minHeight: 5,
    maxHeight: 25,
    minWidth: 3,
    maxWidth: 8,
    spreadRadius: 80
  },

  // Colors
  colors: {
    fire: '#ff4500',
    fireGlow: '#ff8c00',
    dragon: '#2a0a0a',
    ground: '#2a3a2a',
    building: '#3a3a4a',
    buildingBurning: '#ff6600',
    sky: '#0a0a1a'
  },

  // Game states
  states: {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused'
  },

  // Control modes
  modes: {
    DRAGON: 'dragon',
    HUMAN: 'human'
  }
};

// Freeze config to prevent accidental changes
Object.freeze(CONFIG);
