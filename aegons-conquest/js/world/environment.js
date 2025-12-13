// ========== ENVIRONMENT (Sky, Lighting, Fog) ==========
const Environment = {
  skybox: null,
  sun: null,
  ambientLight: null,

  create: (scene) => {
    // Clear color (sky)
    scene.clearColor = Utils.hexToColor4('#0a0a1a');

    // Fog for atmosphere
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.003;
    scene.fogColor = Utils.hexToColor3('#1a1a2a');

    // Ambient light
    Environment.ambientLight = new BABYLON.HemisphericLight(
      'ambientLight',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    Environment.ambientLight.intensity = 0.4;
    Environment.ambientLight.diffuse = Utils.hexToColor3('#ffccaa');
    Environment.ambientLight.groundColor = Utils.hexToColor3('#222244');

    // Sun/directional light
    Environment.sun = new BABYLON.DirectionalLight(
      'sun',
      new BABYLON.Vector3(-1, -2, -1),
      scene
    );
    Environment.sun.intensity = 0.8;
    Environment.sun.diffuse = Utils.hexToColor3('#ff8866');

    // Shadows
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, Environment.sun);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    Environment.shadowGenerator = shadowGenerator;

    // Create skybox
    Environment.createSkybox(scene);

    // Create clouds
    Environment.createClouds(scene);

    // Create ambient particles (ash/embers)
    Environment.createAmbientParticles(scene);

    return Environment;
  },

  createSkybox: (scene) => {
    // Simple gradient skybox using a large sphere
    const skybox = BABYLON.MeshBuilder.CreateSphere('skybox', {
      diameter: CONFIG.world.size * 3,
      segments: 32
    }, scene);
    
    const skyMat = new BABYLON.StandardMaterial('skyMat', scene);
    skyMat.backFaceCulling = false;
    skyMat.disableLighting = true;
    
    // Gradient effect
    skyMat.emissiveColor = Utils.hexToColor3('#1a1a2a');
    
    skybox.material = skyMat;
    skybox.infiniteDistance = true;
    
    Environment.skybox = skybox;
  },

  createClouds: (scene) => {
    // Simplified clouds - just 5 static ones for performance
    const cloudMat = new BABYLON.StandardMaterial('cloudMat', scene);
    cloudMat.diffuseColor = Utils.hexToColor3('#2a2a3a');
    cloudMat.alpha = 0.3;
    cloudMat.backFaceCulling = false;

    for (let i = 0; i < 5; i++) {
      const cloud = BABYLON.MeshBuilder.CreatePlane('cloud-' + i, {
        width: Utils.random(40, 60),
        height: Utils.random(15, 25)
      }, scene);

      cloud.position.set(
        Utils.random(-150, 150),
        Utils.random(100, 140),
        Utils.random(-150, 150)
      );
      cloud.rotation.x = Math.PI / 2;
      cloud.material = cloudMat;
    }
  },

  createAmbientParticles: (scene) => {
    // Disabled for performance - can enable later if needed
    Environment.ambientParticles = null;
  },

  // Update environment based on destruction level
  updateAtmosphere: (destructionPercent) => {
    // More destruction = more red/orange atmosphere
    const intensity = destructionPercent / 100;
    
    if (Environment.ambientLight) {
      Environment.ambientLight.diffuse = new BABYLON.Color3(
        1,
        0.8 - intensity * 0.3,
        0.6 - intensity * 0.4
      );
    }

    // Increase fog with destruction
    if (Game.scene) {
      Game.scene.fogDensity = 0.003 + intensity * 0.005;
    }
  }
};
