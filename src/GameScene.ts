import * as THREE from 'three';
import { Config } from './Config';

export class GameScene {
  private scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.initialize();
  }

  private initialize() {
    // Add ground
    this.scene.add(this.createGround());

    // Add lighting
    this.setupLighting();
  }

  private createGround(): THREE.Mesh {
    const groundGeometry = new THREE.PlaneGeometry(
      Config.BOARD_SIZE * Config.TILE_SIZE,
      Config.BOARD_SIZE * Config.TILE_SIZE,
      Config.BOARD_SIZE,
      Config.BOARD_SIZE
    );

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
          vec2 coord = floor(vUv * ${Config.BOARD_SIZE}.0);
          bool isLight = mod(coord.x + coord.y, 2.0) == 0.0;
          gl_FragColor = vec4(isLight ? lightColor : darkColor, 1.0);
        }
      `,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(Config.BOARD_SIZE / 2, 0, Config.BOARD_SIZE / 2);
    return ground;
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(
      Config.LIGHTING.AMBIENT.COLOR,
      Config.LIGHTING.AMBIENT.INTENSITY
    );
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      Config.LIGHTING.DIRECTIONAL.COLOR,
      Config.LIGHTING.DIRECTIONAL.INTENSITY
    );
    directionalLight.position.set(
      Config.LIGHTING.DIRECTIONAL.POSITION.x,
      Config.LIGHTING.DIRECTIONAL.POSITION.y,
      Config.LIGHTING.DIRECTIONAL.POSITION.z
    );
    this.scene.add(directionalLight);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getBoardCenter(): THREE.Vector3 {
    return new THREE.Vector3(Config.BOARD_SIZE / 2, 0, Config.BOARD_SIZE / 2);
  }

  public getBoardSize(): number {
    return Config.BOARD_SIZE;
  }
}
