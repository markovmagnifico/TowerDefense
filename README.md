# Tower Defense Game

A modern 3D tower defense game built with Three.js and TypeScript. Features a unique drone-based player character that can interact with the game world in real-time.

## Architecture Overview

```ascii
                  ┌───────────────┐
                  │    Config     │
                  └───────┬───────┘
                          │
                   ┌──────▼──────┐
            ┌─────▶│  Game Loop  │◀─────┐
            │      └──────┬──────┘      │
            │             │             │
     ┌──────┴─────┐ ┌────▼────┐   ┌─────┴─────┐
     │   Engine   │ │Entities │   │   Debug   │
     └──────┬─────┘ └────┬────┘   └─────┬─────┘
            │            │              │
            └────────────┴──────────────┘
```

## Key Features

- Real-time 3D graphics with Three.js
- Component-based entity system
- Dynamic lighting and shadows
- Smooth drone controls with physics
- Debug tools and visualization
- Level loading system

## Project Structure

```
src/
├── engine/          # Core game engine components
├── entities/        # Game entities and objects
├── level/          # Level system and data
├── Config.ts       # Global configuration
├── Debug.ts        # Debug utilities
└── main.ts         # Entry point
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Controls

- WASD: Move camera
- Mouse: Aim/target
- Left Click: Move drone
- \`: Toggle debug overlay

## Debug Features

- FPS counter
- Entity properties
- Movement visualization
- Axis helpers
- Runtime property editing

## Development

The project uses:

- TypeScript for type safety
- Three.js for 3D rendering
- Vite for development and building
- ESLint for code quality
