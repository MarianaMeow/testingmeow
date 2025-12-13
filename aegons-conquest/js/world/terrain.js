// ========== TERRAIN GENERATION ==========
const Terrain = {
  ground: null,
  water: null,

  create: (scene) => {
    // Create main ground (reduced subdivisions for performance)
    Terrain.ground = BABYLON.MeshBuilder.CreateGround('ground', {
      width: CONFIG.world.size,
      height: CONFIG.world.size,
      subdivisions: 20
    }, scene);

    // Ground material
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = Utils.hexToColor3('#1a2a1a');
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    
    // Add some texture variation with procedural texture
    const noiseTexture = new BABYLON.NoiseProceduralTexture('groundNoise', 512, scene);
    noiseTexture.animationSpeedFactor = 0;
    noiseTexture.persistence = 0.5;
    noiseTexture.brightness = 0.3;
    noiseTexture.octaves = 4;
    groundMat.diffuseTexture = noiseTexture;
    
    Terrain.ground.material = groundMat;
    Terrain.ground.receiveShadows = true;

    // Create water around the edges (sea)
    Terrain.createWater(scene);

    // Create some terrain features
    Terrain.createHills(scene);

    return Terrain.ground;
  },

  createWater: (scene) => {
    // Water plane surrounding the land
    const waterSize = CONFIG.world.size * 2;
    Terrain.water = BABYLON.MeshBuilder.CreateGround('water', {
      width: waterSize,
      height: waterSize
    }, scene);
    Terrain.water.position.y = -0.5;

    const waterMat = new BABYLON.StandardMaterial('waterMat', scene);
    waterMat.diffuseColor = Utils.hexToColor3('#0a2a4a');
    waterMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.4);
    waterMat.alpha = 0.8;
    Terrain.water.material = waterMat;

    // Animate water slightly
    scene.registerBeforeRender(() => {
      Terrain.water.position.y = -0.5 + Math.sin(Date.now() * 0.001) * 0.1;
    });
  },

  createHills: (scene) => {
    // Create some random hills/mountains (reduced for performance)
    const hillCount = 4;
    
    for (let i = 0; i < hillCount; i++) {
      const radius = Utils.random(10, 25);
      const height = Utils.random(5, 15);
      
      const hill = BABYLON.MeshBuilder.CreateCylinder('hill' + i, {
        diameterTop: 0,
        diameterBottom: radius * 2,
        height: height,
        tessellation: 8
      }, scene);

      // Position randomly but away from center (where city is)
      const angle = Utils.random(0, Math.PI * 2);
      const distance = Utils.random(120, 200);
      hill.position.x = Math.cos(angle) * distance;
      hill.position.z = Math.sin(angle) * distance;
      hill.position.y = height / 2;

      const hillMat = new BABYLON.StandardMaterial('hillMat' + i, scene);
      hillMat.diffuseColor = Utils.hexToColor3('#2a3a2a');
      hill.material = hillMat;
      hill.receiveShadows = true;
    }
  },

  // Check if position is on ground
  getGroundHeight: (x, z) => {
    // For now, flat terrain
    return CONFIG.world.groundLevel;
  }
};
