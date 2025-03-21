# Debug System

This directory contains the game's debug and development tools. The system provides real-time visualization and modification of game state, making development and testing easier.

## Architecture Overview

```ascii
                    ┌─────────────┐
                    │DebugSystem  │
                    └──────┬──────┘
            ┌───────────┬──┴───┬───────────┐
            ▼           ▼      ▼           ▼
    ┌─────────────┐  ┌───┐  ┌───┐  ┌────────────┐
    │TerrainDebug │  │...│  │...│  │EntityDebug │
    └─────────────┘  └───┘  └───┘  └────────────┘
```

## Core Components

### 1. Debug System (`DebugSystem.ts`)

- Central manager for all debug components
- Features:
  - Toggle debug mode (backtick key)
  - Component lifecycle management
  - Debug control panel integration
  - Factory methods for debug components

### 2. Debug Component Base (`DebugComponent.ts`)

- Abstract base class for debug visualizations
- Features:
  - Scene management
  - Enable/disable functionality
  - Resource cleanup
  - Update lifecycle

### 3. Terrain Debug (`TerrainDebug.ts`)

- Grid-based terrain visualization
- Features:
  - Wireframe overlay
  - Grid cell labels
  - Path direction indicators
  - Hover state tracking
  - Height visualization

### 4. Entity Debug (`EntityDebug.ts`)

- Entity state visualization
- Features:
  - Bounding boxes
  - Movement vectors
  - State indicators
  - Selection highlighting

### 5. Main Debug Panel (`Debug.ts`)

- Runtime value modification interface
- Features:
  - Property controls
  - Value sliders
  - State toggles
  - Performance monitoring

## Debug Controls

The debug system can be controlled through:

```typescript
// Toggle debug mode
` (backtick key)

// Add runtime controls
debugSystem.addControl(
  "Player Speed",    // Label
  player,           // Target object
  "movementSpeed",  // Property to modify
  0,               // Min value
  10              // Max value
);
```

## Visual Elements

```ascii
┌────────── Debug Overlay ───────────┐
│                                    │
│  ┌─────────────┐   ┌────────────┐  │
│  │  Grid       │   │  Entity    │  │
│  │  Overlay    │   │  Debug     │  │
│  └─────────────┘   └────────────┘  │
│                                    │
│  ┌─────────────┐   ┌────────────┐  │
│  │  Control    │   │  State     │  │
│  │  Panel      │   │  Display   │  │
│  └─────────────┘   └────────────┘  │
│                                    │
└────────────────────────────────────┘
```

## Usage Example

```typescript
// Create debug system
const debugSystem = new DebugSystem(scene, inputState);

// Add terrain debugging
debugSystem.createTerrainDebug(terrainGrid);

// Add entity debugging
debugSystem.createEntityDebug(player);

// Add runtime controls
debugSystem.addControl('Camera Height', camera, 'height', 5, 20);

// Update in game loop
debugSystem.update(deltaTime);
```

## Best Practices

1. Component Creation

   - Extend DebugComponent for new visualizations
   - Use factory methods when possible
   - Clean up resources in dispose()
   - Keep visual elements minimal and clear

2. Performance

   - Only update when debug mode is enabled
   - Use efficient geometries for visualizations
   - Batch similar visual elements
   - Cache frequently used objects

3. Usability

   - Use clear color coding
   - Add meaningful labels
   - Group related controls
   - Provide value constraints

4. Development
   - Use for testing game mechanics
   - Validate entity states
   - Check collision boundaries
   - Monitor performance metrics
