import * as THREE from 'three';
import { TerrainGrid } from '../level/TerrainGrid';
import { EntityManager } from './EntityManager';
import { InputState } from './InputState';
import { Interactable } from './Interactable';
import { InteractionPriority } from './InteractionManager';
import { Tower } from '../entities/towers/Tower';

type ConcreteTowerConstructor = new (
  terrainGrid: TerrainGrid,
  gridPos?: { x: number; z: number }
) => Tower;

export class BuildSystem implements Interactable {
  public isSelected = false;
  public priority = InteractionPriority.BUILD_MODE;

  private activeTowerType: ConcreteTowerConstructor | null = null;
  private previewMesh: THREE.Group | null = null;
  private hoveredCell: { x: number; z: number } | null = null;
  private isActive = false;
  private terrainGrid: TerrainGrid | null = null;

  constructor(
    private scene: THREE.Scene,
    terrainGrid: TerrainGrid | null,
    private entityManager: EntityManager
  ) {
    this.terrainGrid = terrainGrid;
  }

  setTerrainGrid(terrainGrid: TerrainGrid): void {
    this.terrainGrid = terrainGrid;
  }

  activate(towerType: ConcreteTowerConstructor): void {
    if (!this.terrainGrid) return;

    if (this.isActive) {
      this.deactivate();
    }

    this.activeTowerType = towerType;
    this.isActive = true;
    this.createPreviewMesh();
  }

  deactivate(): void {
    this.isActive = false;
    this.activeTowerType = null;
    this.hoveredCell = null;

    if (this.previewMesh) {
      this.scene.remove(this.previewMesh);
      this.previewMesh?.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
          if (child.geometry) {
            child.geometry.dispose();
          }
        }
      });
      this.previewMesh = null;
    }
  }

  private createPreviewMesh(): void {
    if (!this.activeTowerType || !this.terrainGrid) return;

    // Create tower without grid position just to get geometry
    const dummyTower = new this.activeTowerType(this.terrainGrid);
    const geometry = dummyTower.createGeometry();

    if (geometry instanceof THREE.Group) {
      this.previewMesh = geometry.clone();

      // Make preview semi-transparent
      this.previewMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((m) => {
              const mat = m.clone();
              mat.transparent = true;
              mat.opacity = 0.5;
              return mat;
            });
          } else if (child.material) {
            const mat = child.material.clone();
            mat.transparent = true;
            mat.opacity = 0.5;
            child.material = mat;
          }
        }
      });

      // Start at a visible position
      this.previewMesh.position.set(0, 5, 0);
      this.scene.add(this.previewMesh);
      this.previewMesh.visible = false;
    }

    // Clean up the dummy tower
    dummyTower.dispose();
  }

  handleInput(input: InputState): boolean {
    if (!this.isActive || !this.previewMesh || !this.terrainGrid) return false;

    const worldPos = input.getWorldPosition();
    if (!worldPos) {
      // Hide preview when not over terrain
      this.previewMesh.visible = false;
      return false;
    }

    // Get grid position and update preview
    const gridPos = this.terrainGrid.worldToGrid(worldPos);
    const canBuild = this.terrainGrid.canPlaceEntity(gridPos.x, gridPos.z);

    // Get the actual world position for this grid cell
    const previewPos = this.terrainGrid.gridToWorld(gridPos.x, gridPos.z);
    this.previewMesh.position.copy(previewPos);
    this.previewMesh.visible = true;

    // Update color based on whether we can build here
    const color = canBuild ? 0x00ff00 : 0xff0000;
    this.previewMesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            if ('color' in m) m.color.setHex(color);
          });
        } else if ('color' in child.material) {
          child.material.color.setHex(color);
        }
      }
    });

    // Only consume mouse input
    if (input.isMouseButtonPressed(0)) {
      if (canBuild) {
        this.placeTower(gridPos);
      }
      return true; // Consume left clicks in build mode whether we can build or not
    } else if (input.isMouseButtonPressed(2)) {
      this.deactivate();
      return true; // Consume right clicks in build mode
    }

    // Allow all other input (like keyboard) to pass through
    return false;
  }

  private placeTower(gridPos: { x: number; z: number }): void {
    if (!this.activeTowerType || !this.terrainGrid) return;

    const tower = new this.activeTowerType(this.terrainGrid, gridPos);
    this.entityManager.addEntity(`tower_${Date.now()}`, tower);
    this.terrainGrid.setEntity(gridPos.x, gridPos.z, tower);
  }

  isInBuildMode(): boolean {
    return this.isActive;
  }

  getActiveTowerType(): ConcreteTowerConstructor | null {
    return this.activeTowerType;
  }

  dispose(): void {
    this.deactivate();
  }
}
