import * as THREE from 'three';
import { LevelData } from './LevelTypes';
import { Config } from '../Config';
import { EntityManager } from '../engine/EntityManager';
import { AmbientLight, DirectionalLight } from '../entities/Light';

export class Level {
  private scene: THREE.Scene;
  private ground: THREE.Mesh | null = null;
  private levelData: LevelData;
  private entityManager: EntityManager;

  constructor(scene: THREE.Scene, levelData: LevelData, entityManager: EntityManager) {
    this.scene = scene;
    this.levelData = levelData;
    this.entityManager = entityManager;
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
    const groundGeometry = new THREE.PlaneGeometry(
      this.levelData.dimensions.width * Config.TILE_SIZE,
      this.levelData.dimensions.height * Config.TILE_SIZE,
      this.levelData.dimensions.width,
      this.levelData.dimensions.height
    );

    // TODO: Use colors from level file
    const groundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tileSize: { value: Config.TILE_SIZE },
        lightColor: { value: new THREE.Color(Config.COLORS.LIGHT_GREEN) },
        darkColor: { value: new THREE.Color(Config.COLORS.DARK_GREEN) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float tileSize;
        uniform vec3 lightColor;
        uniform vec3 darkColor;
        varying vec2 vUv;
        
        void main() {
          vec2 coord = floor(vUv * ${this.levelData.dimensions.width}.0);
          bool isLight = mod(coord.x + coord.y, 2.0) == 0.0;
          gl_FragColor = vec4(isLight ? lightColor : darkColor, 1.0);
        }
      `,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(
      this.levelData.dimensions.width / 2,
      0,
      this.levelData.dimensions.height / 2
    );
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
