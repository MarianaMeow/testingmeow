// ========== CITY GENERATION ==========
const City = {
  buildings: [],
  
  create: (scene) => {
    City.buildings = [];
    
    // Create the main castle/keep in center
    City.createCastle(scene);
    
    // Create surrounding buildings
    City.createBuildings(scene);
    
    // Create city walls
    City.createWalls(scene);
    
    return City.buildings;
  },

  createCastle: (scene) => {
    // Main keep - tall central tower
    const keep = BABYLON.MeshBuilder.CreateBox('castle-keep', {
      width: 15,
      height: 40,
      depth: 15
    }, scene);
    keep.position.y = 20;

    const keepMat = new BABYLON.StandardMaterial('keepMat', scene);
    keepMat.diffuseColor = Utils.hexToColor3('#4a4a5a');
    keep.material = keepMat;
    keep.receiveShadows = true;

    // Castle towers at corners
    const towerPositions = [
      { x: -10, z: -10 },
      { x: 10, z: -10 },
      { x: -10, z: 10 },
      { x: 10, z: 10 }
    ];

    towerPositions.forEach((pos, i) => {
      const tower = BABYLON.MeshBuilder.CreateCylinder('castle-tower-' + i, {
        diameter: 6,
        height: 35,
        tessellation: 8
      }, scene);
      tower.position.set(pos.x, 17.5, pos.z);
      tower.material = keepMat;
      tower.receiveShadows = true;

      // Tower top (cone)
      const towerTop = BABYLON.MeshBuilder.CreateCylinder('tower-top-' + i, {
        diameterTop: 0,
        diameterBottom: 8,
        height: 8,
        tessellation: 8
      }, scene);
      towerTop.position.set(pos.x, 39, pos.z);
      
      const roofMat = new BABYLON.StandardMaterial('roofMat', scene);
      roofMat.diffuseColor = Utils.hexToColor3('#8b0000');
      towerTop.material = roofMat;
    });

    City.buildings.push({
      mesh: keep,
      health: 200,
      burning: false,
      destroyed: false,
      type: 'castle'
    });
  },

  createBuildings: (scene) => {
    const buildingMat = new BABYLON.StandardMaterial('buildingMat', scene);
    buildingMat.diffuseColor = Utils.hexToColor3('#3a3a4a');

    const roofMat = new BABYLON.StandardMaterial('buildingRoofMat', scene);
    roofMat.diffuseColor = Utils.hexToColor3('#5a4a3a');

    for (let i = 0; i < CONFIG.city.buildingCount; i++) {
      // Random position in city area (avoiding center castle)
      let x, z;
      do {
        const angle = Utils.random(0, Math.PI * 2);
        const distance = Utils.random(25, CONFIG.city.spreadRadius);
        x = Math.cos(angle) * distance;
        z = Math.sin(angle) * distance;
      } while (Math.abs(x) < 20 && Math.abs(z) < 20); // Avoid castle

      const width = Utils.random(CONFIG.city.minWidth, CONFIG.city.maxWidth);
      const height = Utils.random(CONFIG.city.minHeight, CONFIG.city.maxHeight);
      const depth = Utils.random(CONFIG.city.minWidth, CONFIG.city.maxWidth);

      // Building base
      const building = BABYLON.MeshBuilder.CreateBox('building-' + i, {
        width: width,
        height: height,
        depth: depth
      }, scene);
      building.position.set(x, height / 2, z);
      building.material = buildingMat;
      building.receiveShadows = true;

      // Roof
      const roof = BABYLON.MeshBuilder.CreateCylinder('roof-' + i, {
        diameterTop: 0,
        diameterBottom: Math.max(width, depth) * 1.3,
        height: height * 0.3,
        tessellation: 4
      }, scene);
      roof.position.set(x, height + (height * 0.15), z);
      roof.rotation.y = Math.PI / 4;
      roof.material = roofMat;

      // Windows removed for performance

      City.buildings.push({
        mesh: building,
        roof: roof,
        health: 100,
        burning: false,
        destroyed: false,
        type: 'building',
        position: { x, z }
      });
    }
  },

  addWindows: (scene, building, width, height, depth, x, z) => {
    const windowMat = new BABYLON.StandardMaterial('windowMat', scene);
    windowMat.diffuseColor = Utils.hexToColor3('#ffff99');
    windowMat.emissiveColor = Utils.hexToColor3('#ffff66');

    const windowRows = Math.floor(height / 4);
    const windowCols = Math.floor(width / 2);

    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        if (Math.random() > 0.5) continue; // Random windows

        const win = BABYLON.MeshBuilder.CreateBox('window', {
          width: 0.8,
          height: 1.2,
          depth: 0.1
        }, scene);
        
        win.position.set(
          x + (col - windowCols / 2) * 2 + 1,
          row * 4 + 3,
          z + depth / 2 + 0.1
        );
        win.material = windowMat;
      }
    }
  },

  createWalls: (scene) => {
    const wallMat = new BABYLON.StandardMaterial('wallMat', scene);
    wallMat.diffuseColor = Utils.hexToColor3('#5a5a6a');

    const wallRadius = CONFIG.city.spreadRadius + 20;
    const wallHeight = 8;
    const wallThickness = 3;
    const segments = 12;

    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;

      const x1 = Math.cos(angle1) * wallRadius;
      const z1 = Math.sin(angle1) * wallRadius;
      const x2 = Math.cos(angle2) * wallRadius;
      const z2 = Math.sin(angle2) * wallRadius;

      const length = Utils.distance2D({ x: x1, z: z1 }, { x: x2, z: z2 });

      const wall = BABYLON.MeshBuilder.CreateBox('wall-' + i, {
        width: length,
        height: wallHeight,
        depth: wallThickness
      }, scene);

      wall.position.set((x1 + x2) / 2, wallHeight / 2, (z1 + z2) / 2);
      wall.rotation.y = Math.atan2(z2 - z1, x2 - x1);
      wall.material = wallMat;
      wall.receiveShadows = true;
    }
  },

  // Damage a building
  damageBuilding: (building, damage) => {
    if (building.destroyed) return;

    building.health -= damage;

    if (!building.burning && building.health < 70) {
      building.burning = true;
      City.startBurning(building);
    }

    if (building.health <= 0) {
      City.destroyBuilding(building);
    }
  },

  startBurning: (building) => {
    // Change material to burning
    const burningMat = new BABYLON.StandardMaterial('burningMat', Game.scene);
    burningMat.diffuseColor = Utils.hexToColor3('#4a2a1a');
    burningMat.emissiveColor = Utils.hexToColor3('#ff4500');
    building.mesh.material = burningMat;

    // Add fire particles (handled by Fire system)
    if (typeof Fire !== 'undefined') {
      Fire.addBuildingFire(building);
    }
  },

  destroyBuilding: (building) => {
    building.destroyed = true;
    building.burning = false;

    // Collapse animation
    const destroyedMat = new BABYLON.StandardMaterial('destroyedMat', Game.scene);
    destroyedMat.diffuseColor = Utils.hexToColor3('#1a1a1a');
    building.mesh.material = destroyedMat;

    // Shrink/collapse
    const collapse = () => {
      if (building.mesh.scaling.y > 0.3) {
        building.mesh.scaling.y -= 0.02;
        building.mesh.position.y = (building.mesh.getBoundingInfo().boundingBox.extendSize.y * building.mesh.scaling.y);
        requestAnimationFrame(collapse);
      }
    };
    collapse();

    // Hide roof
    if (building.roof) {
      building.roof.dispose();
    }

    // Update score
    if (typeof HUD !== 'undefined') {
      HUD.addScore(building.type === 'castle' ? 500 : 100);
    }
  }
};
