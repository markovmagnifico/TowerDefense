import * as THREE from 'three';
import { LevelData } from './LevelTypes';
import { Config } from '../Config';
import { EntityManager } from '../engine/EntityManager';
import { AmbientLight, DirectionalLight } from '../entities/Light';
import colors from '../../assets/colors.json';
import { GridShader } from './shaders/GridShader';
import { NoiseShader } from './shaders/NoiseShader';
import { SteepnessShader } from './shaders/SteepnessShader';
import { RetroTerrainShader } from './shaders/RetroTerrainShader';
import { TerrainGrid, CellType } from './TerrainGrid';

type ColorMap = typeof colors.colors;
type ColorName = keyof ColorMap;

export class Level {
  private scene: THREE.Scene;
  private ground: THREE.Mesh | null = null;
  private levelData: LevelData;
  private entityManager: EntityManager;
  private terrainGrid: TerrainGrid;

  // Choose which shader to use by uncommenting one of these:
  //   private terrainShader = new GridShader();
  //   private terrainShader = new NoiseShader();
  //   private terrainShader = new SteepnessShader();
  private terrainShader = new RetroTerrainShader();

  constructor(scene: THREE.Scene, levelData: LevelData, entityManager: EntityManager) {
    this.scene = scene;
    this.levelData = levelData;
    this.entityManager = entityManager;
    this.terrainGrid = new TerrainGrid(levelData.dimensions, levelData.terrain.heightmap);
  }

  private resolveColor(colorRef: string): string {
    if (colorRef.startsWith('@')) {
      const colorName = colorRef.slice(1) as ColorName;
      return colors.colors[colorName] || colorRef;
    }
    return colorRef;
  }

  initialize(): void {
    // Create and add ground
    this.ground = this.createGround();
    this.scene.add(this.ground);

    // Create lights as entities
    this.createLights();

    // Initialize paths in terrain grid
    this.initializePaths();
  }

  private initializePaths(): void {
    // Mark path cells in the terrain grid
    this.levelData.paths.nodes.forEach((node) => {
      const type =
        node.type === 'spawn' ? CellType.SPAWN : node.type === 'end' ? CellType.END : CellType.PATH;
      this.terrainGrid.setCellType(node.x, node.y, type);
    });
  }

  private createLights(): void {
    // Create ambient light
    const ambient = new AmbientLight(
      Config.LIGHTING.AMBIENT.COLOR,
      Config.LIGHTING.AMBIENT.INTENSITY
    );
    this.entityManager.addEntity('ambient_light', ambient);

    // Create directional light
    const directional = new DirectionalLight(
      Config.LIGHTING.DIRECTIONAL.COLOR,
      Config.LIGHTING.DIRECTIONAL.INTENSITY,
      new THREE.Vector3(
        Config.LIGHTING.DIRECTIONAL.POSITION.x,
        Config.LIGHTING.DIRECTIONAL.POSITION.y,
        Config.LIGHTING.DIRECTIONAL.POSITION.z
      )
    );
    this.entityManager.addEntity('main_light', directional);
  }

  private createGround(): THREE.Mesh {
    const { width, height } = this.levelData.dimensions;

    const groundGeometry = new THREE.PlaneGeometry(
      width * Config.TILE_SIZE,
      height * Config.TILE_SIZE,
      width,
      height
    );

    // Apply heightmap to vertices
    const vertices = groundGeometry.attributes.position.array;
    const heightmap = this.levelData.terrain.heightmap;

    // PlaneGeometry creates width+1 x height+1 vertices
    for (let i = 0; i <= height; i++) {
      for (let j = 0; j <= width; j++) {
        const vertexIndex = (i * (width + 1) + j) * 3;
        // For vertices at the edges, use the nearest heightmap value
        const heightmapI = Math.min(i, heightmap.length - 1);
        const heightmapJ = Math.min(j, heightmap[0].length - 1);
        vertices[vertexIndex + 2] = heightmap[heightmapI][heightmapJ] * Config.TERRAIN.HEIGHT_SCALE;
      }
    }

    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    const groundMaterial = this.terrainShader.createMaterial(
      {
        primaryColor: this.resolveColor(this.levelData.terrain.ground.colors.primary),
        secondaryColor: this.resolveColor(this.levelData.terrain.ground.colors.secondary),
        tertiaryColor: this.resolveColor(this.levelData.terrain.ground.colors.tertiary),
      },
      { width, height }
    );

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set((width * Config.TILE_SIZE) / 2, 0, (height * Config.TILE_SIZE) / 2);
    return ground;
  }

  update(deltaTime: number): void {
    // Update shader (needed for NoiseShader animation)
    this.terrainShader.update(deltaTime);
  }

  getGroundHeight(x: number, z: number): number {
    return this.terrainGrid.getHeightAt(x, z);
  }

  canBuildTowerAt(x: number, z: number): boolean {
    return this.terrainGrid.canPlaceEntity(x, z);
  }

  worldToGrid(worldPos: THREE.Vector3): { x: number; z: number } {
    return this.terrainGrid.worldToGrid(worldPos);
  }

  gridToWorld(gridX: number, gridZ: number): THREE.Vector3 {
    return this.terrainGrid.gridToWorld(gridX, gridZ);
  }

  getTerrainGrid(): TerrainGrid {
    return this.terrainGrid;
  }

  getBoardCenter(): THREE.Vector3 {
    return new THREE.Vector3(
      this.levelData.dimensions.width / 2,
      0,
      this.levelData.dimensions.height / 2
    );
  }

  getBoardSize(): number {
    return Math.max(this.levelData.dimensions.width, this.levelData.dimensions.height);
  }

  getGroundMesh(): THREE.Mesh {
    if (!this.ground) {
      throw new Error('Ground mesh not initialized');
    }
    return this.ground;
  }

  dispose(): void {
    if (this.ground) {
      this.ground.geometry.dispose();
      if (Array.isArray(this.ground.material)) {
        this.ground.material.forEach((m) => m.dispose());
      } else {
        this.ground.material.dispose();
      }
      this.scene.remove(this.ground);
    }
  }
}
