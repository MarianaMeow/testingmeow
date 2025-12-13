// ========== INPUT/CONTROLS SYSTEM ==========
const Controls = {
  keys: {},
  mouse: {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    leftButton: false,
    rightButton: false
  },
  isPointerLocked: false,

  init: () => {
    // Keyboard events
    window.addEventListener('keydown', Controls.onKeyDown);
    window.addEventListener('keyup', Controls.onKeyUp);

    // Mouse events
    window.addEventListener('mousemove', Controls.onMouseMove);
    window.addEventListener('mousedown', Controls.onMouseDown);
    window.addEventListener('mouseup', Controls.onMouseUp);

    // Pointer lock
    document.addEventListener('pointerlockchange', Controls.onPointerLockChange);

    // Click to lock pointer during game
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click', () => {
      if (Game.state === CONFIG.states.PLAYING && !Controls.isPointerLocked) {
        canvas.requestPointerLock();
      }
    });
  },

  onKeyDown: (e) => {
    Controls.keys[e.code] = true;

    // Prevent default for game keys
    if (['Space', 'Tab', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
      e.preventDefault();
    }

    // Tab to switch modes
    if (e.code === 'Tab' && Game.state === CONFIG.states.PLAYING) {
      e.preventDefault();
      Game.switchMode();
    }

    // E to call dragon (human mode only)
    if (e.code === 'KeyE' && Game.mode === CONFIG.modes.HUMAN) {
      Human.callDragon();
    }

    // Escape to pause/unlock
    if (e.code === 'Escape') {
      if (Controls.isPointerLocked) {
        document.exitPointerLock();
      }
    }
  },

  onKeyUp: (e) => {
    Controls.keys[e.code] = false;
  },

  onMouseMove: (e) => {
    if (Controls.isPointerLocked) {
      Controls.mouse.dx = e.movementX;
      Controls.mouse.dy = e.movementY;
    } else {
      Controls.mouse.x = e.clientX;
      Controls.mouse.y = e.clientY;
    }
  },

  onMouseDown: (e) => {
    if (e.button === 0) Controls.mouse.leftButton = true;
    if (e.button === 2) Controls.mouse.rightButton = true;

    // Fire grapple in human mode
    if (e.button === 0 && Game.mode === CONFIG.modes.HUMAN && Game.state === CONFIG.states.PLAYING) {
      Controls.handleGrapple();
    }
  },

  onMouseUp: (e) => {
    if (e.button === 0) Controls.mouse.leftButton = false;
    if (e.button === 2) Controls.mouse.rightButton = false;

    // Release grapple
    if (e.button === 0 && Human.isGrappling) {
      Human.releaseGrapple();
    }
  },

  onPointerLockChange: () => {
    Controls.isPointerLocked = document.pointerLockElement === document.getElementById('game-canvas');
  },

  handleGrapple: () => {
    // Raycast from camera to find grapple target
    const scene = Game.scene;
    const camera = scene.activeCamera;
    
    const ray = camera.getForwardRay(CONFIG.human.grappleRange);
    const hit = scene.pickWithRay(ray, (mesh) => {
      // Can grapple to buildings, walls, etc.
      return mesh.name.includes('building') || 
             mesh.name.includes('wall') || 
             mesh.name.includes('castle') ||
             mesh.name.includes('tower');
    });

    if (hit.hit) {
      Human.fireGrapple(hit.pickedPoint);
    }
  },

  // Get current input state for dragon
  getDragonInput: () => {
    return {
      forward: Controls.keys['KeyW'],
      backward: Controls.keys['KeyS'],
      left: Controls.keys['KeyA'],
      right: Controls.keys['KeyD'],
      space: Controls.keys['Space'],
      shift: Controls.keys['ShiftLeft'] || Controls.keys['ShiftRight'],
      fire: Controls.mouse.leftButton
    };
  },

  // Get current input state for human
  getHumanInput: () => {
    return {
      forward: Controls.keys['KeyW'],
      backward: Controls.keys['KeyS'],
      left: Controls.keys['KeyA'],
      right: Controls.keys['KeyD'],
      space: Controls.keys['Space'],
      grapple: Controls.mouse.leftButton,
      callDragon: Controls.keys['KeyE']
    };
  },

  // Reset mouse delta (call after processing)
  resetMouseDelta: () => {
    Controls.mouse.dx = 0;
    Controls.mouse.dy = 0;
  }
};
