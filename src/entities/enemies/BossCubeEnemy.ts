import * as THREE from 'three';
import { Enemy } from '../Enemy';
import { TerrainGrid } from '../../level/TerrainGrid';

export class BossCubeEnemy extends Enemy {
  private body!: THREE.Mesh;

  constructor(terrainGrid: TerrainGrid, spawnPoint: { x: number; z: number }) {
    // Pass core parameters to base class
    super(
      terrainGrid,
      spawnPoint,
      1.0, // speed
      500, // health (high health for boss)
      0.8 // height
    );

    // Create geometry after super() call
    this.createGeometry();
  }

  protected createGeometry(): void {
    // Create main body
    const bodyGeometry = new THREE.BoxGeometry(1, 1, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b0000,
      shininess: 50,
      emissive: 0x330000,
    });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.scale.set(0.8, 0.8, 0.8);

    // Add to object3D
    this.object3D.add(this.body);
  }

  protected updateAnimation(_deltaTime: number): void {
    // Boss cube currently has no animation
  }
}
