import * as THREE from 'three';
import { TerrainGrid } from '../level/TerrainGrid';
import { Config } from '../Config';
import { DebugComponent } from './DebugComponent';

export class TerrainDebug extends DebugComponent {
  private wireframeMesh: THREE.Mesh | null = null;
  private gridLabels: THREE.Sprite[] = [];

  constructor(
    scene: THREE.Scene,
    private terrainGrid: TerrainGrid
  ) {
    super(scene);
    this.createWireframe();
    this.createGridLabels();
  }

  private createWireframe(): void {
    const dimensions = this.terrainGrid.getDimensions();
    const geometry = new THREE.PlaneGeometry(
      dimensions.width * Config.TILE_SIZE,
      dimensions.height * Config.TILE_SIZE,
      dimensions.width,
      dimensions.height
    );

    // Apply heightmap to vertices
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i <= dimensions.height; i++) {
      for (let j = 0; j <= dimensions.width; j++) {
        const vertexIndex = (i * (dimensions.width + 1) + j) * 3;
        const height = this.terrainGrid.getGridHeight(
          Math.min(j, dimensions.width - 1),
          Math.min(i, dimensions.height - 1)
        );
        vertices[vertexIndex + 2] = height;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });

    this.wireframeMesh = new THREE.Mesh(geometry, material);
    this.wireframeMesh.rotation.x = -Math.PI / 2;
    this.wireframeMesh.position.set(
      (dimensions.width * Config.TILE_SIZE) / 2,
      0.1, // Slightly above terrain
      (dimensions.height * Config.TILE_SIZE) / 2
    );
    this.wireframeMesh.visible = false;
    this.scene.add(this.wireframeMesh);
  }

  private createGridLabels(): void {
    const dimensions = this.terrainGrid.getDimensions();

    for (let z = 0; z < dimensions.height; z++) {
      for (let x = 0; x < dimensions.width; x++) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = 64;
        canvas.height = 32;

        // Create label texture
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'yellow';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${x},${z}`, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0.8,
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        const worldPos = this.terrainGrid.gridToWorld(x, z);
        sprite.position.set(worldPos.x, worldPos.y + 0.5, worldPos.z); // Hover above terrain
        sprite.scale.set(0.5, 0.25, 1);
        sprite.visible = false;
        this.gridLabels.push(sprite);
        this.scene.add(sprite);
      }
    }
  }

  protected onToggle(enabled: boolean): void {
    if (this.wireframeMesh) {
      this.wireframeMesh.visible = enabled;
    }
    this.gridLabels.forEach((label) => {
      label.visible = enabled;
    });
  }

  update(deltaTime: number): void {
    if (!this.enabled) return;

    // Update label positions if terrain changes
    const dimensions = this.terrainGrid.getDimensions();
    for (let z = 0; z < dimensions.height; z++) {
      for (let x = 0; x < dimensions.width; x++) {
        const index = z * dimensions.width + x;
        const worldPos = this.terrainGrid.gridToWorld(x, z);
        this.gridLabels[index].position.set(worldPos.x, worldPos.y + 0.5, worldPos.z);
      }
    }
  }

  dispose(): void {
    if (this.wireframeMesh) {
      this.wireframeMesh.geometry.dispose();
      (this.wireframeMesh.material as THREE.Material).dispose();
      this.scene.remove(this.wireframeMesh);
    }

    this.gridLabels.forEach((label) => {
      (label.material as THREE.SpriteMaterial).map?.dispose();
      (label.material as THREE.Material).dispose();
      this.scene.remove(label);
    });
    this.gridLabels = [];
  }
}
