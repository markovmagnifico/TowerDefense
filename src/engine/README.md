# Game Engine Architecture

The engine folder contains the core game loop and state management system. It's built around a central `GameEngine` class that orchestrates all the components.

## Core Components

```ascii
                  ┌─────────────────┐
                  │   GameEngine    │
                  └────────┬────────┘
         ┌─────────────────┼───────────────┐
         ▼                 ▼               ▼
    ┌──────────┐    ┌─────────────┐  ┌──────────┐
    │  Scene   │    │EntityManager│  │GameCamera│
    └──────────┘    └─────────────┘  └──────────┘
         │                 │               │
         │                 ▼               │
         │          ┌──────────┐           │
         └────────▶ │ Entities │ ◀─────────┘
                    └──────────┘
                         ▲
                         │
                    ┌──────────┐
                    │InputState│
                    └──────────┘
```

## State Management

The engine uses a component-based architecture where:

1. `GameEngine`: Central coordinator

   - Manages the game loop (update/render)
   - Holds references to all major systems
   - Handles window/context management

2. `EntityManager`: Entity lifecycle

   - Tracks all game entities
   - Handles entity creation/destruction
   - Updates entities each frame

3. `InputState`: Input handling

   - Tracks keyboard/mouse state
   - Converts screen coordinates to world space
   - Provides clean interface for input queries

4. `GameCamera`: View management
   - Controls player view
   - Handles orbital controls
   - Manages perspective and movement

## Control Flow

```ascii
Game Loop
┌─────────────────────────────────┐
│                                 │
│  ┌─────────┐    ┌────────────┐  │
└─▶│ Update  │───▶│  Render    │──┘
   └─────────┘    └────────────┘
        │              │
        ▼              ▼
   Entities       Three.js
   Physics        Scene
   Input          Camera
```

## Debug System

The engine includes a comprehensive debug system that can:

- Toggle debug overlays
- Monitor performance
- Visualize entity states
- Modify runtime values
