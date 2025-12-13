// ========== FIRE SYSTEM ==========
const Fire = {
  dragonFireSystem: null,
  buildingFires: [],
  isActive: false,

  init: (scene) => {
    Fire.scene = scene;
    Fire.createDragonFireSystem(scene);
  },

  createDragonFireSystem: (scene) => {
    // Main fire breath particle system (reduced for performance)
    const fireSystem = new BABYLON.ParticleSystem('dragonFire', 150, scene);
    
    // Use a simple texture
    fireSystem.particleTexture = new BABYLON.Texture(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA' +
      'MklEQVQ4T2NkoBAwUqifYdQAhtEwYBgNA4bRMGAYDQOG0TBgGA0DhtEwYBgNA4bRMAAALvwH' +
      'AQnHuggAAAAASUVORK5CYII=',
      scene
    );

    // Emitter (will be updated to dragon's mouth)
    fireSystem.emitter = new BABYLON.Vector3(0, 0, 0);
    fireSystem.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
    fireSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);

    // Fire colors
    fireSystem.color1 = Utils.hexToColor4('#ff4400', 1);
    fireSystem.color2 = Utils.hexToColor4('#ff8800', 1);
    fireSystem.colorDead = Utils.hexToColor4('#220000', 0);

    // Size over lifetime
    fireSystem.minSize = 1;
    fireSystem.maxSize = 3;
    fireSystem.minScaleX = 1;
    fireSystem.maxScaleX = 2;

    // Lifetime
    fireSystem.minLifeTime = 0.3;
    fireSystem.maxLifeTime = 0.8;

    // Emission rate (reduced for performance)
    fireSystem.emitRate = 100;

    // Speed and direction
    fireSystem.minEmitPower = 15;
    fireSystem.maxEmitPower = 25;
    fireSystem.updateSpeed = 0.01;

    // Blend mode for fire effect
    fireSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // Gravity (slight downward)
    fireSystem.gravity = new BABYLON.Vector3(0, -2, 0);

    // Don't start yet
    Fire.dragonFireSystem = fireSystem;
  },

  breathe: (origin, direction) => {
    if (!Fire.dragonFireSystem) return;

    Fire.isActive = true;

    // Update emitter position
    Fire.dragonFireSystem.emitter = origin;

    // Set direction
    Fire.dragonFireSystem.direction1 = direction.scale(1);
    Fire.dragonFireSystem.direction2 = direction.add(
      new BABYLON.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      )
    );

    // Start if not running
    if (!Fire.dragonFireSystem.isStarted()) {
      Fire.dragonFireSystem.start();
    }

    // Check for building hits
    Fire.checkBuildingHits(origin, direction);
  },

  stop: () => {
    Fire.isActive = false;
    if (Fire.dragonFireSystem && Fire.dragonFireSystem.isStarted()) {
      Fire.dragonFireSystem.stop();
    }
  },

  checkBuildingHits: (origin, direction) => {
    if (!Fire.scene) return;

    // Raycast to find buildings in fire path
    const ray = new BABYLON.Ray(origin, direction, CONFIG.dragon.fireRange);
    
    const hits = Fire.scene.multiPickWithRay(ray, (mesh) => {
      return mesh.name.includes('building') || 
             mesh.name.includes('castle') ||
             mesh.name.includes('tower');
    });

    hits.forEach(hit => {
      if (hit.hit) {
        // Find the building data
        const building = City.buildings.find(b => 
          b.mesh === hit.pickedMesh || 
          (b.mesh && hit.pickedMesh.name.includes(b.mesh.name))
        );
        
        if (building && !building.destroyed) {
          City.damageBuilding(building, 2);
        }
      }
    });
  },

  addBuildingFire: (building) => {
    if (!Fire.scene) return;

    // Create fire particles on burning building (reduced for performance)
    const fireSystem = new BABYLON.ParticleSystem(
      'buildingFire-' + building.mesh.name,
      30,
      Fire.scene
    );

    fireSystem.particleTexture = new BABYLON.Texture(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA' +
      'MklEQVQ4T2NkoBAwUqifYdQAhtEwYBgNA4bRMGAYDQOG0TBgGA0DhtEwYBgNA4bRMAAALvwH' +
      'AQnHuggAAAAASUVORK5CYII=',
      Fire.scene
    );

    // Position on top of building
    const pos = building.mesh.position.clone();
    pos.y = building.mesh.getBoundingInfo().boundingBox.maximumWorld.y;
    fireSystem.emitter = pos;

    const size = building.mesh.getBoundingInfo().boundingBox.extendSize;
    fireSystem.minEmitBox = new BABYLON.Vector3(-size.x, 0, -size.z);
    fireSystem.maxEmitBox = new BABYLON.Vector3(size.x, 0, size.z);

    // Fire colors
    fireSystem.color1 = Utils.hexToColor4('#ff4400', 1);
    fireSystem.color2 = Utils.hexToColor4('#ff6600', 0.8);
    fireSystem.colorDead = Utils.hexToColor4('#111111', 0);

    fireSystem.minSize = 1;
    fireSystem.maxSize = 2;
    fireSystem.minLifeTime = 0.3;
    fireSystem.maxLifeTime = 0.8;
    fireSystem.emitRate = 15;
    fireSystem.minEmitPower = 2;
    fireSystem.maxEmitPower = 5;
    fireSystem.direction1 = new BABYLON.Vector3(-0.2, 1, -0.2);
    fireSystem.direction2 = new BABYLON.Vector3(0.2, 1, 0.2);
    fireSystem.gravity = new BABYLON.Vector3(0, 2, 0);
    fireSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    fireSystem.start();

    Fire.buildingFires.push({
      building: building,
      system: fireSystem
    });
  },

  removeBuildingFire: (building) => {
    const index = Fire.buildingFires.findIndex(f => f.building === building);
    if (index !== -1) {
      Fire.buildingFires[index].system.stop();
      Fire.buildingFires[index].system.dispose();
      Fire.buildingFires.splice(index, 1);
    }
  },

  update: () => {
    // Update building fires
    Fire.buildingFires.forEach(fire => {
      if (fire.building.destroyed) {
        Fire.removeBuildingFire(fire.building);
      }
    });
  },

  dispose: () => {
    if (Fire.dragonFireSystem) {
      Fire.dragonFireSystem.dispose();
    }
    Fire.buildingFires.forEach(fire => {
      fire.system.dispose();
    });
    Fire.buildingFires = [];
  }
};
