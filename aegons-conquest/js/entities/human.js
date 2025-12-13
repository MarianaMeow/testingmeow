// ========== HUMAN ENTITY ==========
const Human = {
  mesh: null,
  position: new BABYLON.Vector3(0, 1, -50),
  rotation: new BABYLON.Vector3(0, 0, 0),
  velocity: new BABYLON.Vector3(0, 0, 0),
  isGrounded: true,
  isGrappling: false,
  grappleTarget: null,
  grappleLine: null,
  health: 100,

  create: (scene) => {
    const humanRoot = new BABYLON.TransformNode('humanRoot', scene);

    // Body
    const body = BABYLON.MeshBuilder.CreateCylinder('humanBody', {
      height: 1.5,
      diameterTop: 0.4,
      diameterBottom: 0.5,
      tessellation: 8
    }, scene);
    body.parent = humanRoot;
    body.position.y = 1.25;

    // Head
    const head = BABYLON.MeshBuilder.CreateSphere('humanHead', {
      diameter: 0.5
    }, scene);
    head.parent = humanRoot;
    head.position.y = 2.25;

    // Arms
    const leftArm = BABYLON.MeshBuilder.CreateCylinder('leftArm', {
      height: 0.8,
      diameter: 0.15
    }, scene);
    leftArm.parent = humanRoot;
    leftArm.position.set(-0.4, 1.5, 0);
    leftArm.rotation.z = 0.3;

    const rightArm = BABYLON.MeshBuilder.CreateCylinder('rightArm', {
      height: 0.8,
      diameter: 0.15
    }, scene);
    rightArm.parent = humanRoot;
    rightArm.position.set(0.4, 1.5, 0);
    rightArm.rotation.z = -0.3;

    // Legs
    const leftLeg = BABYLON.MeshBuilder.CreateCylinder('leftLeg', {
      height: 1,
      diameter: 0.2
    }, scene);
    leftLeg.parent = humanRoot;
    leftLeg.position.set(-0.15, 0.5, 0);

    const rightLeg = BABYLON.MeshBuilder.CreateCylinder('rightLeg', {
      height: 1,
      diameter: 0.2
    }, scene);
    rightLeg.parent = humanRoot;
    rightLeg.position.set(0.15, 0.5, 0);

    // Cape (Targaryen style)
    const cape = BABYLON.MeshBuilder.CreatePlane('cape', {
      width: 0.8,
      height: 1.2
    }, scene);
    cape.parent = humanRoot;
    cape.position.set(0, 1.3, -0.3);
    
    const capeMat = new BABYLON.StandardMaterial('capeMat', scene);
    capeMat.diffuseColor = Utils.hexToColor3('#2a0a0a');
    capeMat.backFaceCulling = false;
    cape.material = capeMat;

    // Grapple device on arms (glowing)
    const grappleDeviceMat = new BABYLON.StandardMaterial('grappleDeviceMat', scene);
    grappleDeviceMat.emissiveColor = Utils.hexToColor3('#ff4400');

    const leftGrapple = BABYLON.MeshBuilder.CreateBox('leftGrapple', {
      width: 0.2,
      height: 0.3,
      depth: 0.1
    }, scene);
    leftGrapple.parent = humanRoot;
    leftGrapple.position.set(-0.5, 1.2, 0.1);
    leftGrapple.material = grappleDeviceMat;

    const rightGrapple = BABYLON.MeshBuilder.CreateBox('rightGrapple', {
      width: 0.2,
      height: 0.3,
      depth: 0.1
    }, scene);
    rightGrapple.parent = humanRoot;
    rightGrapple.position.set(0.5, 1.2, 0.1);
    rightGrapple.material = grappleDeviceMat;

    // Body material
    const humanMat = new BABYLON.StandardMaterial('humanMat', scene);
    humanMat.diffuseColor = Utils.hexToColor3('#3a3a4a');

    const skinMat = new BABYLON.StandardMaterial('skinMat', scene);
    skinMat.diffuseColor = Utils.hexToColor3('#d4a574');

    body.material = humanMat;
    head.material = skinMat;
    leftArm.material = humanMat;
    rightArm.material = humanMat;
    leftLeg.material = humanMat;
    rightLeg.material = humanMat;

    humanRoot.position = Human.position.clone();

    // Add to shadows
    if (Environment.shadowGenerator) {
      humanRoot.getChildMeshes().forEach(mesh => {
        Environment.shadowGenerator.addShadowCaster(mesh);
      });
    }

    Human.mesh = humanRoot;
    Human.leftArm = leftArm;
    Human.rightArm = rightArm;
    Human.cape = cape;

    // Create grapple line (hidden initially)
    Human.createGrappleLine(scene);

    return humanRoot;
  },

  createGrappleLine: (scene) => {
    // Line for grapple hook visualization
    const points = [
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, 0, 1)
    ];
    
    Human.grappleLine = BABYLON.MeshBuilder.CreateLines('grappleLine', {
      points: points,
      updatable: true
    }, scene);
    
    Human.grappleLine.color = Utils.hexToColor3('#ff6600');
    Human.grappleLine.isVisible = false;
  },

  update: (deltaTime, input) => {
    if (!Human.mesh) return;

    const cfg = CONFIG.human;

    // Rotation (mouse look handled by camera)
    if (input.left) Human.rotation.y += 0.05;
    if (input.right) Human.rotation.y -= 0.05;

    // Movement
    let moveX = 0;
    let moveZ = 0;

    if (input.forward) moveZ = 1;
    if (input.backward) moveZ = -1;
    if (input.left) moveX = 1;
    if (input.right) moveX = -1;

    // Calculate movement direction based on rotation
    if (moveX !== 0 || moveZ !== 0) {
      const angle = Human.rotation.y;
      const dx = Math.sin(angle) * moveZ + Math.cos(angle) * moveX;
      const dz = Math.cos(angle) * moveZ - Math.sin(angle) * moveX;
      
      Human.velocity.x = dx * cfg.speed;
      Human.velocity.z = dz * cfg.speed;
    } else if (!Human.isGrappling) {
      // Friction
      Human.velocity.x *= 0.9;
      Human.velocity.z *= 0.9;
    }

    // Jumping
    if (input.space && Human.isGrounded) {
      Human.velocity.y = cfg.jumpForce;
      Human.isGrounded = false;
    }

    // Gravity
    if (!Human.isGrappling) {
      Human.velocity.y -= cfg.gravity;
    }

    // Grappling
    if (Human.isGrappling && Human.grappleTarget) {
      Human.updateGrapple();
    }

    // Apply velocity
    Human.position.addInPlace(Human.velocity);

    // Ground collision
    const groundHeight = Terrain.getGroundHeight(Human.position.x, Human.position.z);
    if (Human.position.y <= groundHeight + 1) {
      Human.position.y = groundHeight + 1;
      Human.velocity.y = 0;
      Human.isGrounded = true;
    }

    // World bounds
    const halfWorld = CONFIG.world.size / 2;
    Human.position.x = Utils.clamp(Human.position.x, -halfWorld, halfWorld);
    Human.position.z = Utils.clamp(Human.position.z, -halfWorld, halfWorld);

    // Update mesh
    Human.mesh.position = Human.position.clone();
    Human.mesh.rotation.y = Human.rotation.y;

    // Animate cape
    Human.cape.rotation.x = Math.sin(Date.now() * 0.005) * 0.1;

    // Update HUD
    if (typeof HUD !== 'undefined') {
      HUD.updateHealth(Human.health / 100);
    }
  },

  fireGrapple: (targetPoint) => {
    if (Human.isGrappling) return;

    // Check range
    const distance = Utils.distance3D(Human.position, targetPoint);
    if (distance > CONFIG.human.grappleRange) {
      console.log('Target too far for grapple');
      return;
    }

    Human.isGrappling = true;
    Human.grappleTarget = targetPoint.clone();
    Human.grappleLine.isVisible = true;

    // Calculate direction to target
    const direction = Human.grappleTarget.subtract(Human.position).normalize();
    Human.velocity = direction.scale(CONFIG.human.grappleSpeed);
  },

  updateGrapple: () => {
    if (!Human.grappleTarget) return;

    // Update grapple line
    const points = [
      Human.position.clone(),
      Human.grappleTarget.clone()
    ];
    Human.grappleLine = BABYLON.MeshBuilder.CreateLines('grappleLine', {
      points: points,
      instance: Human.grappleLine
    });

    // Check if reached target
    const distance = Utils.distance3D(Human.position, Human.grappleTarget);
    if (distance < 3) {
      Human.releaseGrapple();
    }

    // Pull towards target
    const direction = Human.grappleTarget.subtract(Human.position).normalize();
    Human.velocity = direction.scale(CONFIG.human.grappleSpeed);
  },

  releaseGrapple: () => {
    Human.isGrappling = false;
    Human.grappleTarget = null;
    Human.grappleLine.isVisible = false;
    
    // Keep some momentum
    Human.velocity.scaleInPlace(0.5);
  },

  callDragon: () => {
    // Move dragon to human's position
    if (Dragon.mesh) {
      const targetPos = Human.position.clone();
      targetPos.y += 20; // Above human
      
      // Animate dragon coming
      const startPos = Dragon.position.clone();
      let t = 0;
      
      const animateDragon = () => {
        t += 0.02;
        if (t >= 1) {
          Dragon.position = targetPos;
          Dragon.mesh.position = targetPos;
          return;
        }
        
        Dragon.position = BABYLON.Vector3.Lerp(startPos, targetPos, Utils.easeInOutQuad(t));
        Dragon.mesh.position = Dragon.position.clone();
        requestAnimationFrame(animateDragon);
      };
      
      animateDragon();
    }
  },

  takeDamage: (amount) => {
    Human.health = Math.max(0, Human.health - amount);
    
    // Visual feedback
    if (typeof HUD !== 'undefined') {
      HUD.showDamage();
    }

    if (Human.health <= 0) {
      Human.die();
    }
  },

  die: () => {
    console.log('Human died!');
    // Handle death - respawn or game over
  },

  getPosition: () => Human.position.clone(),
  getRotation: () => Human.rotation.clone()
};
