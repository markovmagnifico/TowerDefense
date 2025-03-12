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
type ColorMap = typeof colors.colors;
type ColorName = keyof ColorMap;

export class Level {
  private scene: THREE.Scene;
  private ground: THREE.Mesh | null = null;
  private levelData: LevelData;
  private entityManager: EntityManager;

  // Choose which shader to use by uncommenting one of these:
  //   private terrainShader = new GridShader();
  //   private terrainShader = new NoiseShader();
  //   private terrainShader = new SteepnessShader();
  private terrainShader = new RetroTerrainShader();

  constructor(scene: THREE.Scene, levelData: LevelData, entityManager: EntityManager) {
    this.scene = scene;
    this.levelData = levelData;
    this.entityManager = entityManager;
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

    // TODO: Draw paths
    this.drawPaths();
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

    for (let i = 0; i <= height; i++) {
      for (let j = 0; j <= width; j++) {
        const vertexIndex = (i * (width + 1) + j) * 3;
        vertices[vertexIndex + 2] = heightmap[i][j] * Config.TERRAIN.HEIGHT_SCALE;
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
      width
    );

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set((width * Config.TILE_SIZE) / 2, 0, (height * Config.TILE_SIZE) / 2);
    return ground;
  }

  private drawPaths(): void {
    // TODO: Implement path drawing
    // 1. Create meshes for each path node
    // 2. Add visual indicators for spawn and end points
    // 3. Add debug visualization for directions
    console.log('Path drawing not yet implemented');
  }

  update(deltaTime: number): void {
    // Update shader (needed for NoiseShader animation)
    this.terrainShader.update(deltaTime);

    // TODO: Update any level animations/effects
  }

  getGroundHeight(x: number, z: number): number {
    // TODO: Implement heightmap lookup
    return 0;
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
