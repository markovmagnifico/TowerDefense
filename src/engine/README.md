# Game Engine Architecture

The engine directory contains the core systems that power the tower defense game. It's built around a central `GameEngine` class that orchestrates all components through a component-based architecture.

## Core Components

```ascii
                     ┌─────────────────┐
                     │   GameEngine    │
                     └───────┬─────────┘
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   ┌──────────┐     ┌─────────────┐    ┌──────────────┐
   │  Scene   │     │EntityManager│    │GameCamera    │
   └────┬─────┘     └──────┬──────┘    └─────┬────────┘
        │                  │                 │
        │            ┌─────▼─────┐           │
        └──────────▶ │ Entities  │ ◀─────────┘
                     └─────┬─────┘
                           │
                    ┌──────▼──────┐
                    │ Interaction │
                    │   System    │
                    └─────────────┘
```

## Component Overview

### 1. GameEngine (`GameEngine.ts`)

- Central coordinator for all game systems
- Manages the main game loop (update/render cycle)
- Handles window/context management and resizing
- Coordinates level loading and wave systems

### 2. Entity System (`EntityManager.ts`)

- Manages entity lifecycle (creation, updates, destruction)
- Tracks all game entities in the scene
- Integrates with debug system for entity monitoring
- Provides centralized entity querying and management

### 3. Input System (`InputState.ts`, `Interactable.ts`, `InteractionManager.ts`)

- Hierarchical input handling with priority levels:
  - MACRO_UI (3): High-level game UI
  - TOWER_UI (2): Tower placement and management
  - ENEMY_UI (1): Enemy interaction
  - WORLD (0): World/terrain interaction
- Tracks keyboard and mouse state
- Converts screen coordinates to world space
- Raycasting for 3D object interaction

### 4. Camera System (`GameCamera.ts`)

- Controls player view and perspective
- Handles orbital camera controls
- Supports different view modes (top-down, orbital)
- Manages camera boundaries and constraints

## Interaction Flow

```ascii
Input Event
     │
     ▼
┌──────────┐
│InputState│──────┐
└──────────┘      │
                  ▼
          ┌───────────────┐
          │Interaction    │
          │Manager        │
          └───────┬───────┘
                  │
        ┌─────────▼─────────┐
        │Priority-based     │
        │Input Distribution │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │Entity/UI Response │
        └─────────┬─────────┘
                  │
                  ▼
            Game Update
```

## Usage Example

```typescript
// Initialize the game engine
const engine = new GameEngine(canvas);

// Add an interactable entity
const entity: Interactable = {
  handleInput(input: InputState, deltaTime: number) {
    // Handle input for this entity
  },
  priority: InteractionPriority.WORLD,
};
engine.getInteractionManager().addInteractable(entity);

// Start the game loop
engine.update(deltaTime);
```

## Debug Features

- Comprehensive entity state monitoring
- Visual debugging overlays
- Performance monitoring
- Runtime value modification
- Terrain grid visualization

## Best Practices

- Always dispose of entities and resources when no longer needed
- Use the priority system for proper input handling
- Leverage the debug system during development
- Follow the component-based architecture for new features
