# Level System

This directory contains the core level management system for the tower defense game. It handles terrain generation, wave management, and level loading/saving.

## Architecture Overview

```ascii
                    ┌─────────────┐
                    │  LevelData  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Level    │
                    └──────┬──────┘
            ┌───────────┬──┴───┬───────────┐
            ▼           ▼      ▼           ▼
    ┌─────────────┐  ┌───┐  ┌───┐  ┌────────────┐
    │TerrainGrid  │  │...│  │...│  │WaveManager │
    └─────────────┘  └───┘  └───┘  └────────────┘
```

## Core Components

### 1. Level System (`Level.ts`)

- Main container for level state and systems
- Features:
  - Level loading and initialization
  - Terrain and path management
  - Entity placement validation
  - World-to-grid coordinate conversion
  - Debug visualization tools

### 2. Terrain System (`TerrainGrid.ts`)

- Grid-based terrain management
- Features:
  - Height-based terrain with interpolation
  - Cell type management (PATH, SPAWN, END, etc.)
  - Entity placement validation
  - Path finding support
  - World/grid coordinate conversion

### 3. Wave System (`WaveManager.ts`)

- Enemy wave management and spawning
- Features:
  - Wave progression tracking
  - Enemy spawning queue
  - Wave state management (WAITING, SPAWNING, etc.)
  - Progress tracking and UI integration
  - Dynamic enemy type loading

### 4. Level Data Types (`LevelTypes.ts`)

- Type definitions for level data structures
- Key interfaces:
  ```typescript
  interface LevelData {
    metadata: { id: string; name: string; description: string };
    dimensions: GridDimensions;
    terrain: { heightmap: number[][]; ground: GroundConfig };
    paths: { color: string; nodes: PathNode[] };
    waves: WaveData[];
  }
  ```

## Grid System

The terrain uses a grid-based system with multiple cell types:

```ascii
┌────────────── Grid Cell ──────────────┐
│ Type: EMPTY | PATH | SPAWN | END      │
│ Entity: Tower | null                  │
│ Height: number                        │
│ Directions: [up, right, down, left]   │
└─────────────────────────────────────┘
```

Cell Types:

- EMPTY: Available for tower placement
- PATH: Part of enemy path
- SPAWN: Enemy spawn points
- END: Enemy exit points
- BLOCKED: Unusable terrain

## Wave System

Waves are managed through a state machine:

```ascii
┌─────────┐      ┌──────────┐      ┌────────────┐
│ WAITING │─────▶│ SPAWNING │─────▶│IN_PROGRESS │
└─────────┘      └──────────┘      └────────────┘
                                          │
                                          ▼
                                   ┌────────────┐
                                   │ COMPLETED  │
                                   └────────────┘
```

## Example Usage

```typescript
// Loading a level
const levelData: LevelData = loadLevelFromJSON('level1.json');
const level = new Level(scene, levelData, entityManager);
level.initialize();

// Working with terrain
const terrainGrid = level.getTerrainGrid();
const height = terrainGrid.getHeightAt(worldX, worldZ);
const canPlace = terrainGrid.canPlaceEntity(gridX, gridZ);

// Managing waves
const waveManager = new WaveManager(waveUI, entityManager, level);
waveManager.initialize(levelData.waves);
waveManager.startNextWave();
```

## Debug Features

The level system includes various debug visualizations:

- Grid cell types and heights
- Path visualization
- Spawn and end points
- Wave spawn queues
- Entity placement validity

## Best Practices

1. Level Design

   - Keep paths clear and well-defined
   - Balance spawn points and exit locations
   - Use height variation for visual interest
   - Consider line-of-sight for towers

2. Wave Design

   - Progressive difficulty increase
   - Mix enemy types within waves
   - Allow for strategy development
   - Include breather periods between waves

3. Performance
   - Use efficient grid operations
   - Batch terrain updates
   - Cache frequently accessed values
   - Use spatial indexing for entity queries
