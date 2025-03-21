import * as THREE from 'three';
import { TerrainGrid, CellType } from '../level/TerrainGrid';
import { Config } from '../Config';
import { DebugComponent } from './DebugComponent';
import { InputState } from '../engine/InputState';

type DirectionMeshes = THREE.Mesh[] | null;

export class TerrainDebug extends DebugComponent {
  private wireframeMesh: THREE.Mesh | null = null;
  private gridLabels: THREE.Sprite[] = [];
  private directionIndicators: DirectionMeshes[][] = [];
  private hoveredTile: { x: number; z: number } | null = null;
  private arrowGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
  private arrowMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  private hoverHighlight: THREE.Mesh | null = null;

  constructor(
    scene: THREE.Scene,
    private terrainGrid: TerrainGrid,
    private inputState: InputState
  ) {
    super(scene);
    this.createArrowGeometry();
    this.createWireframe();
    this.createGridLabels();
    this.createDirectionIndicators();
    this.createHoverHighlight();
  }

  private createArrowGeometry(): void {
    // Create a simple arrow shape
    const shape = new THREE.Shape();
    // Arrow body
    shape.moveTo(-0.1, -0.2);
    shape.lineTo(0.1, -0.2);
    shape.lineTo(0.1, 0.1);
    shape.lineTo(0.2, 0.1);
    shape.lineTo(0, 0.3);
    shape.lineTo(-0.2, 0.1);
    shape.lineTo(-0.1, 0.1);
    shape.lineTo(-0.1, -0.2);

    const extrudeSettings = {
      depth: 0.02,
      bevelEnabled: false,
    };

    this.arrowGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    this.arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });
  }

  private createDirectionIndicators(): void {
    const dimensions = this.terrainGrid.getDimensions();
    const directions = ['up', 'right', 'down', 'left'];
    const rotations = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

    this.directionIndicators = Array(dimensions.height)
      .fill(null)
      .map(() => Array(dimensions.width).fill(null));

    // Create meshes for each cell
    for (let z = 0; z < dimensions.height; z++) {
      for (let x = 0; x < dimensions.width; x++) {
        const cell = this.terrainGrid.getCellType(x, z);
        if (cell === CellType.PATH || cell === CellType.SPAWN || cell === CellType.END) {
          const cellMeshes: THREE.Mesh[] = [];
          const worldPos = this.terrainGrid.gridToWorld(x, z);

          // Create an arrow mesh for each direction
          directions.forEach((dir, index) => {
            const arrow = new THREE.Mesh(this.arrowGeometry, this.arrowMaterial);
            const offset = 0; // Offset from center

            // Position arrows
            switch (dir) {
              case 'up':
                arrow.position.set(worldPos.x, worldPos.y + 0.5, worldPos.z - offset);
                break;
              case 'right':
                arrow.position.set(worldPos.x + offset, worldPos.y + 0.5, worldPos.z);
                break;
              case 'down':
                arrow.position.set(worldPos.x, worldPos.y + 0.5, worldPos.z + offset);
                break;
              case 'left':
                arrow.position.set(worldPos.x - offset, worldPos.y + 0.5, worldPos.z);
                break;
            }

            // First rotate arrow to lie flat on XZ plane
            arrow.rotation.x = -Math.PI / 2;
            // Then rotate around Y axis to point in correct direction
            arrow.rotation.z = -rotations[index];

            arrow.visible = false;
            cellMeshes.push(arrow);
            this.scene.add(arrow);
          });

          this.directionIndicators[z][x] = cellMeshes;
        }
      }
    }
  }

  private updateDirectionIndicators(): void {
    if (!this.enabled) {
      this.hideAllDirectionIndicators();
      return;
    }

    const dimensions = this.terrainGrid.getDimensions();
    for (let z = 0; z < dimensions.height; z++) {
      for (let x = 0; x < dimensions.width; x++) {
        const cell = this.terrainGrid.getCellType(x, z);
        if (cell === CellType.PATH || cell === CellType.SPAWN || cell === CellType.END) {
          const directions = this.terrainGrid.getPathDirections(x, z);
          const meshes = this.directionIndicators[z][x];
          if (meshes) {
            meshes.forEach((mesh, index) => {
              mesh.visible = this.enabled && directions[index] === 1;
            });
          }
        }
      }
    }
  }

  private hideAllDirectionIndicators(): void {
    this.directionIndicators.forEach((row) => {
      row.forEach((meshes) => {
        if (meshes) {
          meshes.forEach((mesh) => {
            mesh.visible = false;
          });
        }
      });
    });
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
        sprite.position.set(worldPos.x, worldPos.y + 0.5, worldPos.z);
        sprite.scale.set(0.5, 0.25, 1);
        sprite.visible = false;
        this.gridLabels.push(sprite);
        this.scene.add(sprite);
      }
    }
  }

  private createHoverHighlight(): void {
    // Create a plane geometry for the tile size
    const geometry = new THREE.PlaneGeometry(Config.TILE_SIZE, Config.TILE_SIZE);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false, // Prevent z-fighting with terrain
    });

    this.hoverHighlight = new THREE.Mesh(geometry, material);
    this.hoverHighlight.rotation.x = -Math.PI / 2; // Lay flat on XZ plane
    this.hoverHighlight.visible = false;
    this.scene.add(this.hoverHighlight);
  }

  private updateHoverHighlight(): void {
    if (!this.hoverHighlight || !this.hoveredTile) {
      if (this.hoverHighlight) {
        this.hoverHighlight.visible = false;
      }
      return;
    }

    const worldPos = this.terrainGrid.gridToWorld(this.hoveredTile.x, this.hoveredTile.z);
    this.hoverHighlight.position.set(worldPos.x, worldPos.y + 0.1, worldPos.z); // Slightly above terrain
    this.hoverHighlight.visible = this.enabled;
  }

  protected onToggle(enabled: boolean): void {
    if (this.wireframeMesh) {
      this.wireframeMesh.visible = enabled;
    }
    if (this.hoverHighlight) {
      this.hoverHighlight.visible = enabled && this.hoveredTile !== null;
    }
    if (!enabled) {
      this.hideAllLabels();
      this.hideAllDirectionIndicators();
    } else {
      this.updateDirectionIndicators();
    }
  }

  update(deltaTime: number): void {
    if (!this.enabled) {
      this.hideAllLabels();
      this.hideAllDirectionIndicators();
      return;
    }

    // Update wireframe if needed
    if (this.wireframeMesh) {
      this.wireframeMesh.visible = true;
    }

    this.updateDirectionIndicators();

    // Get current mouse position in world space
    const worldPos = this.inputState.getWorldPosition();
    if (worldPos) {
      const gridPos = this.terrainGrid.worldToGrid(worldPos);

      // Check if we're hovering over a new tile
      if (
        !this.hoveredTile ||
        this.hoveredTile.x !== gridPos.x ||
        this.hoveredTile.z !== gridPos.z
      ) {
        // Hide previous label
        if (this.hoveredTile) {
          this.hideLabel(this.hoveredTile.x, this.hoveredTile.z);
        }

        // Show new label if it's a valid position
        const dimensions = this.terrainGrid.getDimensions();
        if (
          gridPos.x >= 0 &&
          gridPos.x < dimensions.width &&
          gridPos.z >= 0 &&
          gridPos.z < dimensions.height
        ) {
          this.showLabel(gridPos.x, gridPos.z);
          this.hoveredTile = gridPos;
        } else {
          this.hoveredTile = null;
        }
      }
    } else {
      // Mouse not over terrain
      if (this.hoveredTile) {
        this.hideLabel(this.hoveredTile.x, this.hoveredTile.z);
        this.hoveredTile = null;
      }
    }

    // Update visible label positions and hover highlight
    if (this.hoveredTile) {
      const index =
        this.hoveredTile.z * this.terrainGrid.getDimensions().width + this.hoveredTile.x;
      const worldPos = this.terrainGrid.gridToWorld(this.hoveredTile.x, this.hoveredTile.z);
      this.gridLabels[index].position.set(worldPos.x, worldPos.y + 0.5, worldPos.z);
    }
    this.updateHoverHighlight();
  }

  private showLabel(x: number, z: number): void {
    const dimensions = this.terrainGrid.getDimensions();
    const index = z * dimensions.width + x;
    if (index >= 0 && index < this.gridLabels.length) {
      this.gridLabels[index].visible = true;
    }
  }

  private hideLabel(x: number, z: number): void {
    const dimensions = this.terrainGrid.getDimensions();
    const index = z * dimensions.width + x;
    if (index >= 0 && index < this.gridLabels.length) {
      this.gridLabels[index].visible = false;
    }
  }

  private hideAllLabels(): void {
    this.gridLabels.forEach((label) => (label.visible = false));
    this.hoveredTile = null;
  }

  dispose(): void {
    if (this.wireframeMesh) {
      this.wireframeMesh.geometry.dispose();
      (this.wireframeMesh.material as THREE.Material).dispose();
      this.scene.remove(this.wireframeMesh);
    }

    if (this.hoverHighlight) {
      this.hoverHighlight.geometry.dispose();
      (this.hoverHighlight.material as THREE.Material).dispose();
      this.scene.remove(this.hoverHighlight);
    }

    this.gridLabels.forEach((label) => {
      (label.material as THREE.SpriteMaterial).map?.dispose();
      (label.material as THREE.Material).dispose();
      this.scene.remove(label);
    });
    this.gridLabels = [];

    this.directionIndicators.forEach((row) => {
      row.forEach((meshes) => {
        if (meshes) {
          meshes.forEach((mesh) => {
            this.scene.remove(mesh);
          });
        }
      });
    });
    this.directionIndicators = [];

    this.arrowGeometry.dispose();
    this.arrowMaterial.dispose();
  }
}
