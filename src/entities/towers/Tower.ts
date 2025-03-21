import * as THREE from 'three';
import { Entity } from '../Entity';
import { Interactable } from '../../engine/Interactable';
import { InputState } from '../../engine/InputState';
import { InteractionPriority } from '../../engine/InteractionManager';
import { TerrainGrid } from '../../level/TerrainGrid';

export abstract class Tower extends Entity implements Interactable {
  public isSelected = false;
  public priority = InteractionPriority.TOWER_UI;
  protected geometry: THREE.Group;

  constructor(
    protected terrainGrid: TerrainGrid,
    gridPos?: { x: number; z: number }
  ) {
    super();
    this.geometry = this.createGeometry();
    // Add the geometry to the object3D
    this.object3D = this.geometry;

    // Only position if grid position is provided
    if (gridPos) {
      const worldPos = terrainGrid.gridToWorld(gridPos.x, gridPos.z);
      this.setPosition(worldPos.x, worldPos.y, worldPos.z);
    }
  }

  abstract createGeometry(): THREE.Group;

  getObject3D(): THREE.Object3D {
    return this.object3D;
  }

  handleInput(input: InputState, deltaTime: number): void {
    // Basic click handling - will be expanded later for upgrades/targeting
    if (input.isMouseButtonPressed(0)) {
      const mousePos = input.getMousePosition();
      if (this.isPointOverTower(mousePos.x, mousePos.y)) {
        input.setSelection(this);
      }
    }
  }

  update(deltaTime: number): void {
    // Will be implemented later for attack animations, targeting, etc.
  }

  private isPointOverTower(x: number, y: number): boolean {
    // TODO: Implement proper raycasting for tower selection
    // For now, return false to avoid unimplemented functionality
    return false;
  }

  dispose(): void {
    super.dispose();
    // Additional cleanup if needed
  }
}
