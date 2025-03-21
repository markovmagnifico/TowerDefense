import * as THREE from 'three';
import { Entity } from './Entity';
import { InputState } from '../engine/InputState';
import { Interactable } from '../engine/Interactable';
import { InteractionPriority } from '../engine/InteractionManager';
import { TerrainGrid, CellType } from '../level/TerrainGrid';

export abstract class Enemy extends Entity implements Interactable {
  public isSelected = false;
  public priority = InteractionPriority.ENEMY_UI;
  protected currentGridPos: { x: number; z: number };
  protected reachedEnd: boolean = false;
  protected lastDirection: { x: number; z: number } | null = null;

  constructor(
    protected terrainGrid: TerrainGrid,
    spawnPoint: { x: number; z: number },
    protected speed: number,
    protected health: number,
    protected height: number
  ) {
    super();
    this.currentGridPos = { ...spawnPoint };

    // Initialize position
    const worldPos = this.terrainGrid.gridToWorld(spawnPoint.x, spawnPoint.z);
    this.object3D.position.copy(worldPos);
    this.object3D.position.y = this.height;
  }

  // Abstract methods that each enemy type must implement
  protected abstract createGeometry(): void;
  protected abstract updateAnimation(deltaTime: number): void;

  handleInput(_input: InputState, _deltaTime: number): void {
    // Enemy input handling will be implemented later
  }

  update(deltaTime: number): void {
    if (this.reachedEnd || this.isDead()) return;

    // Get current cell's available directions
    const directions = this.terrainGrid.getPathDirections(
      this.currentGridPos.x,
      this.currentGridPos.z
    );

    // Choose next direction based on available paths
    const nextDir = this.chooseNextDirection(directions);
    if (!nextDir) {
      this.reachedEnd = true;
      return;
    }

    // Calculate target position in world space
    const targetPos = this.terrainGrid.gridToWorld(
      this.currentGridPos.x + nextDir.x,
      this.currentGridPos.z + nextDir.z
    );

    // Move towards target
    const currentPos = this.object3D.position;
    const direction = targetPos.clone().sub(currentPos);
    direction.y = 0; // Keep y position constant
    const distance = direction.length();

    if (distance < 0.1) {
      // Reached next cell
      this.currentGridPos.x += nextDir.x;
      this.currentGridPos.z += nextDir.z;
      this.lastDirection = null; // Reset last direction to allow new choices
    } else {
      // Move towards next cell
      direction.normalize();
      const movement = direction.multiplyScalar(this.speed * deltaTime);
      currentPos.add(movement);
      this.object3D.rotation.y = Math.atan2(direction.x, direction.z);
    }

    // Update animation
    this.updateAnimation(deltaTime);
  }

  private chooseNextDirection(directions: number[]): { x: number; z: number } | null {
    // Convert direction array [up, right, down, left] to coordinates
    const dirMap = [
      { x: 0, z: -1 }, // up
      { x: 1, z: 0 }, // right
      { x: 0, z: 1 }, // down
      { x: -1, z: 0 }, // left
    ];

    // Get valid directions
    const validDirs = directions
      .map((val, i) => (val === 1 ? dirMap[i] : null))
      .filter((dir): dir is { x: number; z: number } => dir !== null);

    if (validDirs.length === 0) {
      // Check if we're at an end point
      const cellType = this.terrainGrid.getCellType(this.currentGridPos.x, this.currentGridPos.z);
      if (cellType === CellType.END) {
        this.reachedEnd = true;
      }
      return null;
    }

    if (this.lastDirection) {
      // Prefer continuing in the same direction if possible
      const sameDir = validDirs.find(
        (dir) => dir.x === this.lastDirection!.x && dir.z === this.lastDirection!.z
      );
      if (sameDir) {
        return sameDir;
      }
    }

    // Otherwise take the first valid direction
    this.lastDirection = validDirs[0];
    return this.lastDirection;
  }

  isDead(): boolean {
    return this.health <= 0 || this.reachedEnd;
  }

  takeDamage(amount: number): void {
    this.health -= amount;
  }
}
