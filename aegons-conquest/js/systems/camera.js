// ========== CAMERA SYSTEM ==========
// Fixed 3rd person camera that follows cursor
const CameraSystem = {
  camera: null,
  yaw: 0,      // Horizontal angle (left/right)
  pitch: 0.3,  // Vertical angle (up/down) - start slightly looking down
  
  // Camera settings
  dragonDistance: 40,
  dragonHeight: 15,
  humanDistance: 12,
  humanHeight: 4,
  
  sensitivity: 0.002,
  smoothing: 0.1,

  create: (scene) => {
    // Create a free camera (we control it manually)
    CameraSystem.camera = new BABYLON.FreeCamera(
      'mainCamera',
      new BABYLON.Vector3(0, 60, -50),
      scene
    );

    // Remove default controls
    CameraSystem.camera.inputs.clear();

    // Set as active
    scene.activeCamera = CameraSystem.camera;

    return CameraSystem.camera;
  },

  update: (mode) => {
    if (!CameraSystem.camera) return;

    // Handle mouse input for rotation
    if (Controls.isPointerLocked) {
      CameraSystem.yaw += Controls.mouse.dx * CameraSystem.sensitivity;
      CameraSystem.pitch += Controls.mouse.dy * CameraSystem.sensitivity;

      // Clamp pitch (don't flip over)
      CameraSystem.pitch = Utils.clamp(CameraSystem.pitch, -1.2, 1.2);
    }

    // Get target position based on mode
    let targetPos, distance, height;

    if (mode === CONFIG.modes.DRAGON) {
      targetPos = Dragon.getPosition();
      distance = CameraSystem.dragonDistance;
      height = CameraSystem.dragonHeight;
    } else {
      targetPos = Human.getPosition();
      distance = CameraSystem.humanDistance;
      height = CameraSystem.humanHeight;
    }

    // Calculate camera position (behind and above target)
    const camX = targetPos.x - Math.sin(CameraSystem.yaw) * Math.cos(CameraSystem.pitch) * distance;
    const camY = targetPos.y + height + Math.sin(CameraSystem.pitch) * distance * 0.5;
    const camZ = targetPos.z - Math.cos(CameraSystem.yaw) * Math.cos(CameraSystem.pitch) * distance;

    const desiredPos = new BABYLON.Vector3(camX, camY, camZ);

    // Smooth camera movement
    CameraSystem.camera.position = BABYLON.Vector3.Lerp(
      CameraSystem.camera.position,
      desiredPos,
      CameraSystem.smoothing
    );

    // Look at target
    const lookTarget = targetPos.clone();
    lookTarget.y += (mode === CONFIG.modes.DRAGON) ? 5 : 2;
    CameraSystem.camera.setTarget(lookTarget);

    // Reset mouse delta
    Controls.resetMouseDelta();
  },

  // Camera shake for impacts
  shake: (intensity = 1, duration = 200) => {
    const startTime = Date.now();
    const originalSmoothing = CameraSystem.smoothing;
    
    CameraSystem.smoothing = 0.3; // Faster response during shake

    const shakeLoop = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        CameraSystem.smoothing = originalSmoothing;
        return;
      }

      const progress = elapsed / duration;
      const shake = intensity * (1 - progress);

      CameraSystem.camera.position.x += (Math.random() - 0.5) * shake;
      CameraSystem.camera.position.y += (Math.random() - 0.5) * shake * 0.5;

      requestAnimationFrame(shakeLoop);
    };

    shakeLoop();
  },

  transitionTo: (mode) => {
    // Could add smooth transition here
  }
};
