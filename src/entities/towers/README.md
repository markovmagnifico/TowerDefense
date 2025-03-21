# Tower System (Planning)

This document outlines the planned tower defense system architecture and features.

## Core Mechanics

### Build Mode

```ascii
┌─────── Build Mode Flow ──────┐
│                             │
│  Select Tower from BuildBar │
│            ▼                │
│    Enter Building Mode      │
│            ▼                │
│   Show Preview on Hover     │──┐
│            ▼                │  │
│   [Mouse Wheel/QE] Rotate   │  │
│            ▼                │  │
│   Left Click to Place      │  │
│            ▼                │  │
│   Right Click to Cancel    │  │
└─────────────────────────────┘  │
         ▲                       │
         └───────────────────────┘
```

### Tower Interaction

- Click to select tower
- Show floating UI for upgrades/selling
- Auto-hide UI when moving away
- Show range visualization on select
- Configurable target priority

## Tower Components

### 1. Base Structure

- Common base geometry for all towers
- Modular upgrade attachments
- Height-based model adjustments
- Rotation support

### 2. Range System

```ascii
Height Bonus System
┌────────────┐
│ Base Range │ + Height Modifier (0/+1/+2/+3)
└────────────┘

Range Types
├── Circular (radius)
├── Linear (directional)
├── Cross Pattern
└── Custom Patterns
```

### 3. Upgrade System

```ascii
Example Upgrade Trees:

Linear:                Branch:     Single Tier:
   A                      A           A
   │                    ╱ │ ╲         │
   B                   B  C  D        B
   │                   │  │  │
   C                   E  F  G
```

### 4. Combat System

- Attack Types & Weaknesses
- Base Stats:
  - Damage
  - Attack Speed
  - Range
  - Special Effects

### 5. Visual Effects

- Placement preview
- Range indicators
- Attack animations
- Upgrade visual changes
- Height bonus indicators

## Technical Architecture

### 1. Core Classes

```typescript
abstract class Tower extends Entity {
  // Base tower functionality
  abstract upgradeTree: UpgradeNode[];
  abstract range: Range;
  abstract stats: TowerStats;
}

interface Range {
  type: RangeType;
  getTargetableCells(position: Vector3): GridCell[];
  visualize(): void;
}

interface UpgradeNode {
  id: string;
  requirements: string[];
  apply(tower: Tower): void;
  visualize(tower: Tower): void;
}
```

### 2. State Management

```typescript
interface TowerState {
  level: number;
  rotation: number;
  upgrades: string[];
  targetPriority: TargetPriority;
}

enum TargetPriority {
  FIRST,
  LAST,
  STRONGEST,
  WEAKEST,
  NEAREST,
  FURTHEST,
}
```

### 3. Visual Components

```typescript
interface TowerVisuals {
  base: THREE.Group;
  upgrades: Map<string, THREE.Object3D>;
  rangeIndicator: THREE.Object3D;
  attackEffects: ParticleSystem;
}
```

## Implementation Phases

1. **Foundation**

   - Base tower class
   - Build mode system
   - Basic placement mechanics
   - Simple range visualization

2. **Core Systems**

   - Upgrade system
   - Height bonus calculation
   - Target priority system
   - Basic attack mechanics

3. **Visual Polish**

   - Attack animations
   - Upgrade visual effects
   - UI improvements
   - Range indicators

4. **Advanced Features**
   - Complex range patterns
   - Type/weakness system
   - Special abilities
   - Advanced targeting

## Considerations

### Performance

- Efficient range calculations
- Batched visual updates
- Pooled particle systems
- Optimized target selection

### Extensibility

- Modular tower designs
- Pluggable upgrade systems
- Flexible range patterns
- Reusable visual effects

### UX/UI

- Clear build indicators
- Intuitive rotation controls
- Visible range bonuses
- Responsive upgrade UI

## Next Steps

1. Implement basic build mode
2. Create base tower class
3. Add simple range visualization
4. Implement rotation system
5. Add basic upgrade UI
6. Create first tower type
