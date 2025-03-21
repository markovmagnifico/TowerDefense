# Enemies

This directory contains all enemy types for the tower defense game. Each enemy is a separate class that extends the base `Enemy` class.

## Structure

```
enemies/
├── SlimeEnemy.ts     - Basic enemy with wobble/squash animations
├── BossCubeEnemy.ts  - Tough boss enemy with high health
└── README.md         - This file
```

## Creating New Enemies

To create a new enemy:

1. Create a new file in this directory (e.g., `MyNewEnemy.ts`)
2. Extend the base `Enemy` class
3. Implement required methods:
   - `createGeometry()`: Set up the enemy's 3D model
   - `updateAnimation(deltaTime)`: Handle any per-frame animations

Example:

```typescript
export class MyNewEnemy extends Enemy {
  private body!: THREE.Mesh;

  constructor(terrainGrid: TerrainGrid, spawnPoint: { x: number; z: number }) {
    super(
      terrainGrid,
      spawnPoint,
      speed, // Movement speed
      health, // Hit points
      height // Height above ground
    );
    this.createGeometry();
  }

  protected createGeometry(): void {
    // Create your 3D model here
    this.body = new THREE.Mesh(geometry, material);
    this.object3D.add(this.body);
  }

  protected updateAnimation(deltaTime: number): void {
    // Update animations here (optional)
  }
}
```

## Adding to Wave System

After creating a new enemy:

1. Import it in `src/level/WaveManager.ts`
2. Add it to the `EnemyTypeMap`:

```typescript
const EnemyTypeMap = {
  enemy_id: MyNewEnemy, // Use this ID in level JSON files
};
```

## Best Practices

1. **Encapsulation**: Keep all enemy-specific logic within its class
2. **Animation**: Complex animations should be self-contained in the `updateAnimation` method
3. **Performance**: Use appropriate geometry detail levels based on the enemy's size
4. **Memory**: Clean up any resources in a `dispose` method if needed
5. **Scale**: Keep enemy sizes consistent with existing enemies (around 0.3-0.8 units)

## Current Enemy Types

### SlimeEnemy

- Basic enemy type
- Features wobble and squash animations
- Green, translucent material
- Speed: 1.0, Health: 100

### BossCubeEnemy

- Tough, boss-type enemy
- Red, emissive material
- Speed: 1.0, Health: 500
- No animations (intimidating stillness)
