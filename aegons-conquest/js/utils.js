// ========== UTILITY FUNCTIONS ==========
const Utils = {
  // Random number between min and max
  random: (min, max) => Math.random() * (max - min) + min,

  // Random integer between min and max
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  // Clamp value between min and max
  clamp: (value, min, max) => Math.min(Math.max(value, min), max),

  // Linear interpolation
  lerp: (start, end, factor) => start + (end - start) * factor,

  // Distance between two 3D points
  distance3D: (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  // Distance between two 2D points (ignoring Y)
  distance2D: (p1, p2) => {
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dz * dz);
  },

  // Convert degrees to radians
  degToRad: (degrees) => degrees * (Math.PI / 180),

  // Convert radians to degrees
  radToDeg: (radians) => radians * (180 / Math.PI),

  // Create a Babylon Color3 from hex
  hexToColor3: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return new BABYLON.Color3(
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
      );
    }
    return new BABYLON.Color3(1, 1, 1);
  },

  // Create a Babylon Color4 from hex with alpha
  hexToColor4: (hex, alpha = 1) => {
    const color3 = Utils.hexToColor3(hex);
    return new BABYLON.Color4(color3.r, color3.g, color3.b, alpha);
  },

  // Ease in out quad
  easeInOutQuad: (t) => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Check if point is inside bounds
  isInBounds: (point, bounds) => {
    return point.x >= bounds.minX && point.x <= bounds.maxX &&
           point.z >= bounds.minZ && point.z <= bounds.maxZ;
  },

  // Get direction vector from rotation
  getForwardVector: (rotation) => {
    return new BABYLON.Vector3(
      Math.sin(rotation.y),
      0,
      Math.cos(rotation.y)
    );
  }
};
