// ========== DRAGON ENTITY ==========
const Dragon = {
  mesh: null,
  position: new BABYLON.Vector3(0, 50, 0),
  rotation: new BABYLON.Vector3(0, 0, 0),
  velocity: new BABYLON.Vector3(0, 0, 0),
  fireEnergy: CONFIG.dragon.fireEnergy,
  isBreathingFire: false,
  yaw: 0,    // Horizontal rotation (left/right)
  pitch: 0,  // Vertical rotation (up/down)

  create: (scene) => {
    const dragonRoot = new BABYLON.TransformNode('dragonRoot', scene);

    // Materials
    const bodyMat = new BABYLON.StandardMaterial('dragonBodyMat', scene);
    bodyMat.diffuseColor = Utils.hexToColor3('#1a0808');
    bodyMat.specularColor = Utils.hexToColor3('#331111');

    const scaleMat = new BABYLON.StandardMaterial('scaleMat', scene);
    scaleMat.diffuseColor = Utils.hexToColor3('#2a0a0a');

    const wingMat = new BABYLON.StandardMaterial('wingMat', scene);
    wingMat.diffuseColor = Utils.hexToColor3('#3a1515');
    wingMat.alpha = 0.85;
    wingMat.backFaceCulling = false;

    const eyeMat = new BABYLON.StandardMaterial('eyeMat', scene);
    eyeMat.emissiveColor = Utils.hexToColor3('#ff4400');
    eyeMat.diffuseColor = Utils.hexToColor3('#ff2200');

    // === BODY (main torso) ===
    const body = BABYLON.MeshBuilder.CreateCapsule('body', {
      height: 8,
      radius: 2
    }, scene);
    body.rotation.x = Math.PI / 2;
    body.parent = dragonRoot;
    body.material = bodyMat;

    // === NECK ===
    const neck = BABYLON.MeshBuilder.CreateCapsule('neck', {
      height: 5,
      radius: 1
    }, scene);
    neck.position.set(0, 1.5, 5);
    neck.rotation.x = Math.PI / 4;
    neck.parent = dragonRoot;
    neck.material = bodyMat;

    // === HEAD ===
    const head = BABYLON.MeshBuilder.CreateBox('head', {
      width: 2,
      height: 1.5,
      depth: 3
    }, scene);
    head.position.set(0, 4, 7);
    head.parent = dragonRoot;
    head.material = bodyMat;

    // Snout
    const snout = BABYLON.MeshBuilder.CreateBox('snout', {
      width: 1.2,
      height: 0.8,
      depth: 2.5
    }, scene);
    snout.position.set(0, 3.7, 9);
    snout.parent = dragonRoot;
    snout.material = bodyMat;

    // Lower jaw
    const jaw = BABYLON.MeshBuilder.CreateBox('jaw', {
      width: 1,
      height: 0.4,
      depth: 2
    }, scene);
    jaw.position.set(0, 3.2, 8.5);
    jaw.parent = dragonRoot;
    jaw.material = bodyMat;

    // Horns
    const hornLeft = BABYLON.MeshBuilder.CreateCylinder('hornL', {
      height: 2,
      diameterTop: 0,
      diameterBottom: 0.4,
      tessellation: 6
    }, scene);
    hornLeft.position.set(-0.7, 5.5, 6.5);
    hornLeft.rotation.x = -0.5;
    hornLeft.rotation.z = -0.3;
    hornLeft.parent = dragonRoot;
    hornLeft.material = scaleMat;

    const hornRight = hornLeft.clone('hornR');
    hornRight.position.x = 0.7;
    hornRight.rotation.z = 0.3;
    hornRight.parent = dragonRoot;

    // Eyes (glowing)
    const eyeL = BABYLON.MeshBuilder.CreateSphere('eyeL', { diameter: 0.4 }, scene);
    eyeL.position.set(-0.6, 4.3, 8);
    eyeL.parent = dragonRoot;
    eyeL.material = eyeMat;

    const eyeR = eyeL.clone('eyeR');
    eyeR.position.x = 0.6;
    eyeR.parent = dragonRoot;

    // === WINGS ===
    // Wing bones
    const createWing = (side) => {
      const sign = side === 'left' ? -1 : 1;
      const wingRoot = new BABYLON.TransformNode('wing' + side, scene);
      wingRoot.parent = dragonRoot;
      wingRoot.position.set(sign * 1.5, 1, 0);

      // Upper arm
      const upperArm = BABYLON.MeshBuilder.CreateCylinder('upperArm' + side, {
        height: 6,
        diameter: 0.5
      }, scene);
      upperArm.rotation.z = sign * 1.2;
      upperArm.position.set(sign * 3, 1, 0);
      upperArm.parent = wingRoot;
      upperArm.material = bodyMat;

      // Forearm
      const forearm = BABYLON.MeshBuilder.CreateCylinder('forearm' + side, {
        height: 8,
        diameter: 0.35
      }, scene);
      forearm.rotation.z = sign * 0.3;
      forearm.position.set(sign * 7, 3, 0);
      forearm.parent = wingRoot;
      forearm.material = bodyMat;

      // Wing membrane (triangle shape)
      const wingMembrane = BABYLON.MeshBuilder.CreateDisc('membrane' + side, {
        radius: 10,
        arc: 0.5,
        tessellation: 8
      }, scene);
      wingMembrane.rotation.y = sign * Math.PI / 2;
      wingMembrane.rotation.x = 0.2;
      wingMembrane.position.set(sign * 6, 0, 2);
      wingMembrane.parent = wingRoot;
      wingMembrane.material = wingMat;

      return wingRoot;
    };

    Dragon.leftWing = createWing('left');
    Dragon.rightWing = createWing('right');

    // === TAIL ===
    let tailPrev = dragonRoot;
    let zPos = -4;
    for (let i = 0; i < 6; i++) {
      const size = 1.5 - (i * 0.2);
      const segment = BABYLON.MeshBuilder.CreateSphere('tail' + i, {
        diameter: size
      }, scene);
      segment.position.set(0, -0.5 + i * 0.1, zPos);
      segment.parent = dragonRoot;
      segment.material = bodyMat;
      zPos -= size * 0.9;
    }

    // Tail spike
    const tailSpike = BABYLON.MeshBuilder.CreateCylinder('tailSpike', {
      height: 2,
      diameterTop: 0,
      diameterBottom: 0.6,
      tessellation: 4
    }, scene);
    tailSpike.position.set(0, -0.3, zPos - 0.5);
    tailSpike.rotation.x = -Math.PI / 2;
    tailSpike.parent = dragonRoot;
    tailSpike.material = scaleMat;

    // === LEGS ===
    const createLeg = (x, z, isFront) => {
      const leg = BABYLON.MeshBuilder.CreateCylinder('leg', {
        height: isFront ? 2.5 : 3,
        diameter: 0.6
      }, scene);
      leg.position.set(x, -2, z);
      leg.parent = dragonRoot;
      leg.material = bodyMat;

      // Claws
      for (let c = 0; c < 3; c++) {
        const claw = BABYLON.MeshBuilder.CreateCylinder('claw', {
          height: 0.5,
          diameterTop: 0,
          diameterBottom: 0.15
        }, scene);
        claw.position.set(x + (c - 1) * 0.2, -3.5, z + 0.3);
        claw.rotation.x = 0.5;
        claw.parent = dragonRoot;
        claw.material = scaleMat;
      }
    };

    createLeg(-1.5, 2, true);
    createLeg(1.5, 2, true);
    createLeg(-1.5, -2, false);
    createLeg(1.5, -2, false);

    // === SPINES along back ===
    for (let i = 0; i < 8; i++) {
      const spine = BABYLON.MeshBuilder.CreateCylinder('spine' + i, {
        height: 1 + Math.sin(i * 0.5) * 0.5,
        diameterTop: 0,
        diameterBottom: 0.3
      }, scene);
      spine.position.set(0, 2.5, 3 - i * 1.2);
      spine.parent = dragonRoot;
      spine.material = scaleMat;
    }

    // Position dragon
    dragonRoot.position = Dragon.position.clone();

    Dragon.mesh = dragonRoot;
    Dragon.scene = scene;

    // Wing flap animation
    let wingTime = 0;
    scene.registerBeforeRender(() => {
      wingTime += 0.1;
      const flap = Math.sin(wingTime) * 0.2;
      if (Dragon.leftWing) Dragon.leftWing.rotation.z = flap;
      if (Dragon.rightWing) Dragon.rightWing.rotation.z = -flap;
    });

    return dragonRoot;
  },

  update: (deltaTime, input) => {
    if (!Dragon.mesh) return;

    const cfg = CONFIG.dragon;

    // Get camera yaw for movement direction
    const camYaw = CameraSystem.yaw;

    // Calculate movement direction based on camera
    let moveX = 0;
    let moveZ = 0;

    if (input.forward) moveZ = 1;
    if (input.backward) moveZ = -1;
    if (input.left) moveX = 1;
    if (input.right) moveX = -1;

    if (moveX !== 0 || moveZ !== 0) {
      // Move relative to camera direction
      const angle = camYaw;
      const dx = Math.sin(angle) * moveZ + Math.cos(angle) * moveX;
      const dz = Math.cos(angle) * moveZ - Math.sin(angle) * moveX;

      Dragon.velocity.x = dx * cfg.speed;
      Dragon.velocity.z = dz * cfg.speed;

      // Rotate dragon to face movement direction
      Dragon.yaw = Math.atan2(dx, dz);
    } else {
      Dragon.velocity.x *= 0.95;
      Dragon.velocity.z *= 0.95;
    }

    // Vertical movement
    if (input.space) Dragon.velocity.y = cfg.verticalSpeed;
    else if (input.shift) Dragon.velocity.y = -cfg.verticalSpeed;
    else Dragon.velocity.y *= 0.9;

    // Apply velocity
    Dragon.position.addInPlace(Dragon.velocity);

    // Clamp height
    Dragon.position.y = Utils.clamp(Dragon.position.y, cfg.minHeight, cfg.maxHeight);

    // Clamp to world bounds
    const halfWorld = CONFIG.world.size / 2;
    Dragon.position.x = Utils.clamp(Dragon.position.x, -halfWorld, halfWorld);
    Dragon.position.z = Utils.clamp(Dragon.position.z, -halfWorld, halfWorld);

    // Update mesh position and rotation
    Dragon.mesh.position = Dragon.position.clone();
    Dragon.mesh.rotation.y = Dragon.yaw;

    // Tilt based on movement
    Dragon.mesh.rotation.x = -Dragon.velocity.y * 0.5;
    Dragon.mesh.rotation.z = -Dragon.velocity.x * 0.3;

    // Fire breathing
    if (input.fire && Dragon.fireEnergy > 0) {
      Dragon.breatheFire();
    } else {
      Dragon.stopFire();
      Dragon.fireEnergy = Math.min(cfg.fireEnergy, Dragon.fireEnergy + cfg.fireRegenRate);
    }

    // Update HUD
    if (typeof HUD !== 'undefined') {
      HUD.updateFire(Dragon.fireEnergy / cfg.fireEnergy);
    }
  },

  breatheFire: () => {
    if (Dragon.fireEnergy <= 0) return;

    Dragon.isBreathingFire = true;
    Dragon.fireEnergy -= CONFIG.dragon.fireCost;

    if (typeof Fire !== 'undefined') {
      const fireOrigin = Dragon.getFireOrigin();
      const fireDirection = Dragon.getFireDirection();
      Fire.breathe(fireOrigin, fireDirection);
    }
  },

  stopFire: () => {
    Dragon.isBreathingFire = false;
    if (typeof Fire !== 'undefined') {
      Fire.stop();
    }
  },

  getFireOrigin: () => {
    // Position in front of snout
    const offset = new BABYLON.Vector3(0, 0, 11);
    const matrix = BABYLON.Matrix.RotationY(Dragon.yaw);
    const rotatedOffset = BABYLON.Vector3.TransformCoordinates(offset, matrix);
    return Dragon.position.add(rotatedOffset).add(new BABYLON.Vector3(0, 4, 0));
  },

  getFireDirection: () => {
    // Fire in direction camera is looking
    return new BABYLON.Vector3(
      Math.sin(CameraSystem.yaw) * Math.cos(CameraSystem.pitch),
      -Math.sin(CameraSystem.pitch),
      Math.cos(CameraSystem.yaw) * Math.cos(CameraSystem.pitch)
    );
  },

  getPosition: () => Dragon.position.clone(),
  getRotation: () => new BABYLON.Vector3(0, Dragon.yaw, 0)
};
