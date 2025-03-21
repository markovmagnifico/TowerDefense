# Entities

This directory contains the core game objects in the tower defense game. Each entity is a self-contained unit that can be updated each frame and interacts with the game world through the Three.js scene graph.

## Entity Hierarchy

```ascii
                    Entity (abstract)
                         │
         ┌──────────────┼──────────────────┐
         ▼              ▼                  ▼
      Player         Enemy (abstract)    Light
         │              │
         │         ┌────┴────┐
         │         ▼         ▼
      Drone    SlimeEnemy  BossCube
```

## Core Components

### 1. Base Entity System (`Entity.ts`)

- Abstract base class for all game objects
- Core features:
  - Three.js Object3D management
  - Position and rotation control
  - Resource disposal (geometries, materials)
  - Abstract update method

### 2. Player System (`Player.ts`)

- Player-controlled drone
- Features:
  - Complex movement physics
  - Height-based terrain following
  - Rotor animation system
  - Debug visualization tools
  - Camera target integration

### 3. Enemy System (`Enemy.ts`, `/enemies/*`)

- Base enemy class and specific implementations
- Features:
  - Pathfinding on terrain grid
  - Health and damage system
  - Custom geometries and animations
  - Variants:
    - SlimeEnemy: Basic enemy with squash/stretch animation
    - BossCube: Larger, more powerful enemy

### 4. Light System (`Light.ts`)

- Environmental lighting management
- Features:
  - Ambient light control
  - Directional shadows
  - Dynamic intensity adjustment

## Interaction System

Entities can implement the `Interactable` interface:

```typescript
interface Interactable {
  handleInput(input: InputState, deltaTime: number): void;
  isSelected?: boolean;
  priority: InteractionPriority;
}
```

Priority levels:

- MACRO_UI (3): Global UI elements
- TOWER_UI (2): Tower placement/management
- ENEMY_UI (1): Enemy interaction
- WORLD (0): Terrain/world interaction

## Entity Component Structure

```ascii
┌────────────── Entity ──────────────┐
│                                    │
│  ┌─────────────┐   ┌────────────┐  │
│  │  Three.js   │   │ Game Logic │  │
│  │  Components │   │            │  │
│  └─────────────┘   └────────────┘  │
│                                    │
│  ┌─────────────┐   ┌────────────┐  │
│  │ Interaction │   │   Debug    │  │
│  │   System    │   │  Helpers   │  │
│  └─────────────┘   └────────────┘  │
│                                    │
└────────────────────────────────────┘
```

## Best Practices

1. Entity Creation

   - Always extend the base `Entity` class
   - Implement `dispose()` for proper cleanup
   - Use abstract methods for required functionality
   - Initialize Three.js components in constructor

2. Updates and Input

   - Keep update logic concise and focused
   - Use the priority system for input handling
   - Implement debug visualizations where helpful
   - Cache frequently accessed components

3. Resource Management
   - Properly dispose of Three.js resources
   - Use shared geometries when possible
   - Clean up event listeners and intervals
   - Remove from scene graph when disposed

## Debug Features

Each entity type supports various debug features:

- Player: Movement vectors, height rays, collision bounds
- Enemies: Path visualization, health indicators
- Lights: Helper objects for light direction/position

## Example Usage

```typescript
// Creating a new enemy
const enemy = new SlimeEnemy(
  terrainGrid,
  { x: 0, z: 0 }, // spawn point
  2.0, // speed
  100, // health
  1.0 // height
);

// Adding to the game
entityManager.addEntity('enemy1', enemy);

// Updating
enemy.update(deltaTime);

// Cleanup
enemy.dispose();
```
