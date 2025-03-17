import * as THREE from 'three';
import { Config } from '../Config';
import { GridDimensions } from './LevelTypes';
import { Entity } from '../entities/Entity';

export enum CellType {
  EMPTY, // Default state
  PATH, // Part of enemy path
  SPAWN, // Enemy spawn point
  END, // Enemy exit point
  BLOCKED, // Environmental/terrain blocking
}

interface GridCell {
  type: CellType;
  entity: Entity | null;
}

export type HeightCallback = (x: number, z: number) => number;

export class TerrainGrid {
  private cells: GridCell[][];
  private heightmap: number[][];
  private dimensions: GridDimensions;

  constructor(dimensions: GridDimensions, heightmap: number[][]) {
    this.dimensions = dimensions;
    this.heightmap = heightmap;

    // Initialize all cells as EMPTY with no entity
    this.cells = Array(dimensions.height)
      .fill(0)
      .map(() =>
        Array(dimensions.width)
          .fill(0)
          .map(() => ({
            type: CellType.EMPTY,
            entity: null,
          }))
      );
  }

  // Grid cell management
  getCellType(gridX: number, gridZ: number): CellType {
    if (this.isValidGridPosition(gridX, gridZ)) {
      return this.cells[gridZ][gridX].type;
    }
    return CellType.BLOCKED;
  }

  setCellType(gridX: number, gridZ: number, type: CellType): boolean {
    if (this.isValidGridPosition(gridX, gridZ)) {
      this.cells[gridZ][gridX].type = type;
      return true;
    }
    return false;
  }

  getEntity(gridX: number, gridZ: number): Entity | null {
    if (this.isValidGridPosition(gridX, gridZ)) {
      return this.cells[gridZ][gridX].entity;
    }
    return null;
  }

  setEntity(gridX: number, gridZ: number, entity: Entity | null): boolean {
    if (this.isValidGridPosition(gridX, gridZ)) {
      this.cells[gridZ][gridX].entity = entity;
      return true;
    }
    return false;
  }

  canPlaceEntity(gridX: number, gridZ: number): boolean {
    if (!this.isValidGridPosition(gridX, gridZ)) return false;
    const cell = this.cells[gridZ][gridX];
    return cell.type === CellType.EMPTY && cell.entity === null;
  }

  // Height management
  getGridHeight(gridX: number, gridZ: number): number {
    if (!this.isValidGridPosition(gridX, gridZ)) {
      return 0;
    }
    return this.heightmap[gridZ][gridX] * Config.TERRAIN.HEIGHT_SCALE;
  }

  getHeightAt(worldX: number, worldZ: number): number {
    // Convert world coordinates to grid space
    const gridX = worldX / Config.TILE_SIZE;
    const gridZ = worldZ / Config.TILE_SIZE;

    // Get the four surrounding grid points
    const x0 = Math.floor(gridX);
    const x1 = Math.ceil(gridX);
    const z0 = Math.floor(gridZ);
    const z1 = Math.ceil(gridZ);

    // Get fractional position between grid points
    const fx = gridX - x0;
    const fz = gridZ - z0;

    // Get heights at grid points
    const h00 = this.getGridHeight(x0, z0);
    const h10 = this.getGridHeight(x1, z0);
    const h01 = this.getGridHeight(x0, z1);
    const h11 = this.getGridHeight(x1, z1);

    // Bilinear interpolation
    const h0 = h00 * (1 - fx) + h10 * fx;
    const h1 = h01 * (1 - fx) + h11 * fx;
    return h0 * (1 - fz) + h1 * fz;
  }

  // Coordinate conversion
  worldToGrid(worldPos: THREE.Vector3): { x: number; z: number } {
    return {
      x: Math.floor(worldPos.x / Config.TILE_SIZE),
      z: Math.floor(worldPos.z / Config.TILE_SIZE),
    };
  }

  gridToWorld(gridX: number, gridZ: number): THREE.Vector3 {
    return new THREE.Vector3(
      (gridX + 0.5) * Config.TILE_SIZE,
      this.getGridHeight(gridX, gridZ),
      (gridZ + 0.5) * Config.TILE_SIZE
    );
  }

  // Utility
  private isValidGridPosition(x: number, z: number): boolean {
    return x >= 0 && x < this.dimensions.width && z >= 0 && z < this.dimensions.height;
  }

  getDimensions(): GridDimensions {
    return { ...this.dimensions };
  }

  forEachCell(callback: (x: number, z: number, cell: GridCell) => void): void {
    for (let z = 0; z < this.dimensions.height; z++) {
      for (let x = 0; x < this.dimensions.width; x++) {
        callback(x, z, this.cells[z][x]);
      }
    }
  }

  createHeightCallback(): HeightCallback {
    return (x: number, z: number) => this.getHeightAt(x, z);
  }
}
