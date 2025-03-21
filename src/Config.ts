export const Config = {
  // Board configuration
  TILE_SIZE: 2.0,
  COLORS: {
    LIGHT_GREEN: 0xf4d03f, // Warm sand
    DARK_GREEN: 0xd4ac0d, // Darker sand
    BACKGROUND: 0x2c3e50,
  },

  // Camera configuration
  CAMERA: {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
    INITIAL_HEIGHT: 0.7, // Relative to board size
    INITIAL_DISTANCE: 1.5, // Relative to board size
    MOVEMENT_SPEED: 1.0,
    DAMPING: 0.05,
  },

  // Drone configuration
  DRONE: {
    BODY: {
      SIZE: 0.4,
      HEIGHT_SCALE: 0.3,
      COLOR: 0x3498db,
      MAX_TILT_ANGLE: Math.PI / 4,
      TILT_SPEED: 4.0,
    },
    ROTOR: {
      RADIUS: 0.2,
      THICKNESS: 0.02,
      COLOR: 0xbdc3c7,
      TILT_ANGLE: Math.PI / 6,
      TILT_SPEED: 5.0,
      OFFSET: 0.3,
      CROSS: {
        LENGTH: 0.37,
        WIDTH: 0.04,
        COLOR: 0x2980b9,
      },
    },
    MOVEMENT: {
      HOVER_SPEED: 4.5,
      SPRINT_SPEED: 8.0,
      ACCELERATION: 1.0,
      HOVER_HEIGHT: 3,
      HOVER_ANIM_SPEED: 0.003,
      HOVER_AMPLITUDE: 0.05,
    },
  },

  // Lighting configuration
  LIGHTING: {
    AMBIENT: {
      COLOR: 0xffffff,
      INTENSITY: 0.6,
    },
    DIRECTIONAL: {
      COLOR: 0xffffff,
      INTENSITY: 0.8,
      POSITION: { x: 20, y: 40, z: 20 },
    },
  },

  // Terrain configuration
  TERRAIN: {
    HEIGHT_SCALE: 2.0,
  },

  // Debug configuration
  DEBUG: {
    TOGGLE_KEY: '`',
    AXIS_HELPER_SIZE: 10,
    STATS_POSITION: 'bottomLeft',
    CONTROLS_WIDTH: 300,
    TARGET_MARKER: {
      INNER_RADIUS: 0.4,
      OUTER_RADIUS: 0.6,
      COLOR: 0xffff00,
      OPACITY: 0.5,
    },
    PATH_LINE: {
      COLOR: 0xffff00,
      OPACITY: 0.5,
    },
  },
};
