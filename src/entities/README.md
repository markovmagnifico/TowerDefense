# Entities

Entities are the core game objects in the tower defense game. They are managed by the `EntityManager` and can be updated each frame.

## Entity Types

```
Entity
├── Player
└── Tower (coming soon)
```

## Entity Base Class

The `Entity` base class provides:

- A Three.js Object3D for positioning and hierarchy
- Update method for frame-by-frame updates
- Disposal method for cleanup

## Interactable Interface

Some entities implement the `Interactable` interface:

- Player (movement and control)
- Tower (selection and upgrades)

## Component Diagram

```
│ Entity      │
├─────────────┤
│ Object3D    │
│ Interactable│
└─────────────┘
```

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

## Interactable Interface

Some entities implement the `Interactable` interface:

```ascii
┌───────────────┐
│ Interactable  │
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
