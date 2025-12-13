// ========== DRAGON FLIGHT 3D ==========
import * as THREE from 'three';

let scene, camera, renderer;
let dragonGroup;
let obstacles = [];
let fireParticles = [];

const game = {
  state: 'menu',
  score: 0,
  speed: 0.5,
  spawnTimer: 0,
  spawnRate: 80,
  fireEnergy: 100
};

const dragon = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  wingAngle: 0,
  leftWing: null,
  rightWing: null
};

const keys = {};
let mouseDown = false;
let mouseDeltaX = 0;
let mouseDeltaY = 0;
let dragonAngleX = 0;  // Pitch (up/down)
let dragonAngleZ = 0;  // Roll (left/right tilt)
let isPointerLocked = false;

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0a2e);
  scene.fog = new THREE.Fog(0x1a0a2e, 30, 150);

  // Camera - BEHIND the dragon looking FORWARD
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 8, -25);
  camera.lookAt(0, 0, 50);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0x6666aa, 0.6));
  const sun = new THREE.DirectionalLight(0xff8844, 1);
  sun.position.set(5, 10, 10);
  scene.add(sun);

  // Create everything
  createDragon();
  createEnvironment();

  // Events
  window.addEventListener('resize', onResize);
  document.addEventListener('keydown', e => { 
    keys[e.code] = true; 
    if (e.code === 'Space') e.preventDefault(); 
  });
  document.addEventListener('keyup', e => keys[e.code] = false);
  document.addEventListener('mousedown', () => mouseDown = true);
  document.addEventListener('mouseup', () => mouseDown = false);
  
  // Pointer lock (shift lock) for mouse control
  document.addEventListener('mousemove', (e) => {
    if (isPointerLocked) {
      mouseDeltaX = e.movementX;
      mouseDeltaY = e.movementY;
    }
  });

  // Pointer lock change
  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
  });

  // Click canvas to lock pointer
  renderer.domElement.addEventListener('click', () => {
    if (game.state === 'playing' && !isPointerLocked) {
      renderer.domElement.requestPointerLock();
    }
  });

  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', startGame);

  animate();
}

function createDragon() {
  dragonGroup = new THREE.Group();

  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x220808 });
  const wingMat = new THREE.MeshLambertMaterial({ color: 0x331515, side: THREE.DoubleSide });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });

  // BODY - elongated along Z (forward)
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(1.2, 4, 8, 12),
    bodyMat
  );
  body.rotation.x = Math.PI / 2; // Lay it horizontal along Z
  dragonGroup.add(body);

  // NECK - going forward and up
  const neck = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.6, 2, 6, 8),
    bodyMat
  );
  neck.position.set(0, 0.8, 3);
  neck.rotation.x = Math.PI / 4;
  dragonGroup.add(neck);

  // HEAD
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1, 1.8),
    bodyMat
  );
  head.position.set(0, 2, 4.5);
  dragonGroup.add(head);

  // SNOUT - pointing forward
  const snout = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.5, 6),
    bodyMat
  );
  snout.position.set(0, 1.8, 5.8);
  snout.rotation.x = Math.PI / 2;
  dragonGroup.add(snout);

  // EYES
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), eyeMat);
  eyeL.position.set(0.5, 2.3, 4.8);
  dragonGroup.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), eyeMat);
  eyeR.position.set(-0.5, 2.3, 4.8);
  dragonGroup.add(eyeR);

  // HORNS
  const hornMat = new THREE.MeshLambertMaterial({ color: 0x442222 });
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1, 6), hornMat);
  hornL.position.set(0.4, 2.8, 4);
  hornL.rotation.x = -0.3;
  dragonGroup.add(hornL);
  const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1, 6), hornMat);
  hornR.position.set(-0.4, 2.8, 4);
  hornR.rotation.x = -0.3;
  dragonGroup.add(hornR);

  // WINGS - spread out to the sides
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(0, 4);
  wingShape.lineTo(6, 3);
  wingShape.lineTo(7, 0);
  wingShape.lineTo(4, -1);
  wingShape.lineTo(0, 0);

  const wingGeo = new THREE.ShapeGeometry(wingShape);

  dragon.leftWing = new THREE.Mesh(wingGeo, wingMat);
  dragon.leftWing.position.set(1.5, 0.5, 0);
  dragon.leftWing.rotation.y = Math.PI / 2;
  dragon.leftWing.rotation.x = 0.2;
  dragonGroup.add(dragon.leftWing);

  dragon.rightWing = new THREE.Mesh(wingGeo, wingMat);
  dragon.rightWing.position.set(-1.5, 0.5, 0);
  dragon.rightWing.rotation.y = -Math.PI / 2;
  dragon.rightWing.rotation.x = 0.2;
  dragon.rightWing.scale.x = -1;
  dragonGroup.add(dragon.rightWing);

  // TAIL - going backward
  for (let i = 0; i < 6; i++) {
    const size = 0.8 - i * 0.1;
    const tail = new THREE.Mesh(
      new THREE.SphereGeometry(size, 8, 8),
      bodyMat
    );
    tail.position.set(0, Math.sin(i * 0.3) * 0.3, -3 - i * 1);
    dragonGroup.add(tail);
  }

  // Tail spike
  const spike = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 1.2, 4),
    hornMat
  );
  spike.position.set(0, 0, -9.5);
  spike.rotation.x = -Math.PI / 2;
  dragonGroup.add(spike);

  // LEGS
  const legGeo = new THREE.CapsuleGeometry(0.25, 1, 4, 6);
  [[1, -1.2, 1], [-1, -1.2, 1], [1, -1.2, -1], [-1, -1.2, -1]].forEach(pos => {
    const leg = new THREE.Mesh(legGeo, bodyMat);
    leg.position.set(...pos);
    dragonGroup.add(leg);
  });

  // SPINES on back
  for (let i = 0; i < 8; i++) {
    const spine = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.5, 4),
      hornMat
    );
    spine.position.set(0, 1.5, 2 - i * 0.8);
    dragonGroup.add(spine);
  }

  scene.add(dragonGroup);
}

function createEnvironment() {
  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 400),
    new THREE.MeshLambertMaterial({ color: 0x1a2a1a })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -12, 150);
  scene.add(ground);

  // Canyon walls
  const wallMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3a });
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(8, 40, 400), wallMat);
  leftWall.position.set(-25, 5, 150);
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(8, 40, 400), wallMat);
  rightWall.position.set(25, 5, 150);
  scene.add(rightWall);

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 300; i++) {
    starPos.push((Math.random() - 0.5) * 150, Math.random() * 60 + 20, Math.random() * 300);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.4 })));
}

function spawnObstacle() {
  const rand = Math.random();
  const x = (Math.random() - 0.5) * 30;
  const y = (Math.random() - 0.5) * 10;

  let mesh;
  
  if (rand < 0.35) {
    // RING - fly through for bonus points!
    const ringGeo = new THREE.TorusGeometry(5, 0.4, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ff88,
      emissive: 0x00ff88
    });
    mesh = new THREE.Mesh(ringGeo, ringMat);
    mesh.userData = { type: 'ring', passed: false };
    
    // Add glow effect (inner ring)
    const glowGeo = new THREE.TorusGeometry(5, 0.8, 8, 24);
    const glowMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ff88,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    mesh.add(glow);
    
  } else if (rand < 0.65) {
    // BARRIER - burn through
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(3, 10, 2),
      new THREE.MeshLambertMaterial({ color: 0x8b4513 })
    );
    mesh.userData = { type: 'barrier', health: 60, passed: false };
  } else {
    // ROCK - dodge
    mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.5, 12, 8),
      new THREE.MeshLambertMaterial({ color: 0x5a5a6a })
    );
    mesh.userData = { type: 'rock', passed: false };
  }

  mesh.position.set(x, y, 120);
  scene.add(mesh);
  obstacles.push(mesh);
}

function createFire(x, y, z) {
  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(0.3 + Math.random() * 0.4, 6, 6),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.05 + Math.random() * 0.08, 1, 0.5),
      transparent: true,
      opacity: 1
    })
  );
  particle.position.set(x, y, z);
  particle.userData = { vz: 1 + Math.random() * 0.5, life: 25 };
  scene.add(particle);
  fireParticles.push(particle);
}

function update() {
  if (game.state !== 'playing') return;

  // EXPONENTIAL SPEED UP every frame
  game.speed *= 1.0003;  // Exponential increase (multiplier)
  
  // Dragon movement - WASD style
  // W = forward (speed up more), S = backward (slow down)
  // A = left, D = right
  // SPACE = fly up
  if (keys['KeyW'] || keys['ArrowUp']) game.speed *= 1.002;  // Speed boost
  if (keys['KeyS'] || keys['ArrowDown']) game.speed = Math.max(0.5, game.speed * 0.99);  // Slow down
  if (keys['KeyA'] || keys['ArrowLeft']) dragon.vx += 0.04;
  if (keys['KeyD'] || keys['ArrowRight']) dragon.vx -= 0.04;
  if (keys['Space']) dragon.vy += 0.06;

  // Gravity pulls down slightly
  dragon.vy -= 0.01;

  dragon.vx *= 0.92;
  dragon.vy *= 0.92;
  dragon.x += dragon.vx;
  dragon.y += dragon.vy;

  // Bounds
  dragon.x = Math.max(-15, Math.min(15, dragon.x));
  dragon.y = Math.max(-8, Math.min(12, dragon.y));

  // Update dragon position
  dragonGroup.position.x = dragon.x;
  dragonGroup.position.y = dragon.y;

  // Mouse controls dragon angle (POINTER LOCK / SHIFT LOCK)
  if (isPointerLocked) {
    dragonAngleZ -= mouseDeltaX * 0.003;  // Roll left/right
    dragonAngleX -= mouseDeltaY * 0.003;  // Pitch up/down
    
    // Clamp angles
    dragonAngleZ = Math.max(-0.8, Math.min(0.8, dragonAngleZ));
    dragonAngleX = Math.max(-0.5, Math.min(0.5, dragonAngleX));
    
    // Reset deltas
    mouseDeltaX = 0;
    mouseDeltaY = 0;
  }
  
  // Apply rotation smoothly
  dragonGroup.rotation.z += (dragonAngleZ - dragonGroup.rotation.z) * 0.15;
  dragonGroup.rotation.x += (dragonAngleX - dragonGroup.rotation.x) * 0.15;
  
  // Slowly return to neutral when not moving mouse
  dragonAngleZ *= 0.98;
  dragonAngleX *= 0.98;

  // Wing flap
  dragon.wingAngle += 0.2;
  const flap = Math.sin(dragon.wingAngle) * 0.3;
  if (dragon.leftWing) dragon.leftWing.rotation.z = flap;
  if (dragon.rightWing) dragon.rightWing.rotation.z = -flap;

  // Fire - LEFT CLICK only
  const breathing = mouseDown && game.fireEnergy > 0;
  if (breathing) {
    game.fireEnergy -= 1.2;
    for (let i = 0; i < 2; i++) {
      createFire(
        dragon.x + (Math.random() - 0.5) * 0.5,
        dragon.y + 1.8,
        7
      );
    }
  } else {
    game.fireEnergy = Math.min(100, game.fireEnergy + 0.4);
  }
  document.getElementById('fire-fill').style.width = game.fireEnergy + '%';

  // Spawn
  game.spawnTimer++;
  if (game.spawnTimer >= game.spawnRate) {
    game.spawnTimer = 0;
    spawnObstacle();
  }

  // Update obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.position.z -= game.speed;

    const dx = Math.abs(obs.position.x - dragon.x);
    const dy = Math.abs(obs.position.y - dragon.y);
    const dz = obs.position.z;

    if (obs.userData.type === 'ring') {
      // RING - fly through to score!
      // Check if dragon passes through the ring center
      if (!obs.userData.passed && dz < 3 && dz > -3) {
        if (dx < 4 && dy < 4) {
          // Passed through the ring!
          obs.userData.passed = true;
          game.score += 100;
          updateScore();
          
          // Visual feedback - ring turns gold and shrinks
          obs.material.color.setHex(0xffdd00);
          obs.scale.set(1.5, 1.5, 1.5);
        }
      }
      // Animate ring rotation
      obs.rotation.y += 0.02;
      
    } else if (obs.userData.type === 'rock') {
      if (dx < 3.5 && dy < 4 && dz < 5 && dz > -3) {
        gameOver();
      }
      if (!obs.userData.passed && dz < -5) {
        obs.userData.passed = true;
        game.score += 10;
        updateScore();
      }
    } else if (obs.userData.type === 'barrier') {
      if (obs.userData.health > 0) {
        // Fire damage
        if (breathing && dx < 4 && dy < 6 && dz < 20 && dz > 0) {
          obs.userData.health -= 2;
          obs.material.color.setHex(0xff4400);
        }
        // Collision
        if (dx < 3 && dy < 6 && dz < 4 && dz > -2) {
          gameOver();
        }
      }
      if (obs.userData.health <= 0 && !obs.userData.passed) {
        obs.userData.passed = true;
        game.score += 50;
        updateScore();
        obs.scale.set(0.01, 0.01, 0.01);
      }
    }

    if (obs.position.z < -30) {
      scene.remove(obs);
      obstacles.splice(i, 1);
    }
  }

  // Update fire particles
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    const p = fireParticles[i];
    p.position.z += p.userData.vz;
    p.userData.life--;
    p.material.opacity = p.userData.life / 25;
    p.scale.multiplyScalar(0.96);

    // Hit barriers
    obstacles.forEach(obs => {
      if (obs.userData.type === 'barrier' && obs.userData.health > 0) {
        const dx = Math.abs(p.position.x - obs.position.x);
        const dy = Math.abs(p.position.y - obs.position.y);
        const dz = Math.abs(p.position.z - obs.position.z);
        if (dx < 2 && dy < 6 && dz < 2) {
          obs.userData.health -= 0.5;
        }
      }
    });

    if (p.userData.life <= 0) {
      scene.remove(p);
      fireParticles.splice(i, 1);
    }
  }

  // Camera follows dragon smoothly
  camera.position.x += (dragon.x * 0.3 - camera.position.x) * 0.05;
  camera.position.y += (dragon.y * 0.3 + 8 - camera.position.y) * 0.05;
}

function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateScore() {
  document.getElementById('score').textContent = game.score;
}

function gameOver() {
  game.state = 'over';
  document.getElementById('final-score').textContent = game.score;
  document.getElementById('game-over').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
  
  // Release pointer lock
  document.exitPointerLock();
}

function startGame() {
  game.state = 'playing';
  game.score = 0;
  game.speed = 2;  // Start at speed 2
  game.spawnTimer = 0;
  game.fireEnergy = 100;

  dragon.x = 0;
  dragon.y = 0;
  dragon.vx = 0;
  dragon.vy = 0;
  dragonAngleX = 0;
  dragonAngleZ = 0;

  obstacles.forEach(o => scene.remove(o));
  obstacles = [];
  fireParticles.forEach(p => scene.remove(p));
  fireParticles = [];

  dragonGroup.position.set(0, 0, 0);
  dragonGroup.rotation.set(0, 0, 0);

  updateScore();
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-over').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  
  // Request pointer lock when game starts
  renderer.domElement.requestPointerLock();
}

init();
