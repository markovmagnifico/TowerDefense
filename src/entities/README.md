# Game Entities

This folder contains all game entities that can exist in the game world. Each entity extends the base `Entity` class and can be managed by the `EntityManager`.

## Entity Architecture

```ascii
           ┌───────────────┐
           │    Entity     │
           └───────┬───────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   ┌─────────┐         ┌──────────┐
   │ Player  │         │  Light   │
   └─────────┘         └──────────┘
        │
   ┌─────────┐
   │ Drone   │
   └─────────┘
```

## Entity Components

Each entity is composed of:

```ascii
Entity
┌────────────────────────┐
│                        │
│  ┌──────────────┐      │
│  │  Three.js    │      │
│  │  Object3D    │      │
│  └──────────────┘      │
│                        │
│  ┌──────────────┐      │
│  │  Update      │      │
│  │  Logic       │      │
│  └──────────────┘      │
│                        │
│  ┌──────────────┐      │
│  │  Debug       │      │
│  │  Visuals     │      │
│  └──────────────┘      │
│                        │
└────────────────────────┘
```

## Entity Types

1. `Player` (Drone)

   - Complex movement system with acceleration and tilt
   - Visual components (body, rotors)
   - Debug visualization for movement paths
   - Configurable speeds and behaviors

2. `Light`
   - Ambient and directional lighting
   - Configurable intensities and colors
   - Shadows and environmental effects

## Controllable Interface

Some entities implement the `Controllable` interface:

```ascii
┌───────────────┐
│ Controllable  │
└───────┬───────┘
        │
    handleInput()
        │
        ▼
┌───────────────┐
│    Entity     │
└───────────────┘
```

This allows them to:

- Receive input events
- Respond to user controls
- Integrate with the debug system
- Be managed by `GameControls`
