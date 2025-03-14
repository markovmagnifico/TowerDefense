import * as THREE from 'three';
import { EntityManager } from './EntityManager';
import { Level } from '../level/Level';
import { InputState } from './InputState';
import { LevelData } from '../level/LevelTypes';
import { GameCamera } from './GameCamera';
import { Config } from '../Config';
import { GameControls } from './GameControls';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: GameCamera;
  private renderer: THREE.WebGLRenderer;
  private entityManager: EntityManager;
  private currentLevel: Level | null = null;
  private inputState: InputState;
  private gameControls: GameControls;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#2c3e50');

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.camera = new GameCamera(window.innerWidth / window.innerHeight);
    this.camera.initialize(this.renderer, new THREE.Vector3(0, 5, 5), new THREE.Vector3(0, 0, 0));

    this.entityManager = new EntityManager(this.scene);
    this.inputState = new InputState(this.camera);
    this.gameControls = new GameControls(this.inputState);
    this.gameControls.addControllable(this.camera);

    window.addEventListener('resize', this.handleResize.bind(this));
  }

  loadLevel(levelData: LevelData): void {
    if (this.currentLevel) {
      this.currentLevel.dispose();
    }

    this.currentLevel = new Level(this.scene, levelData, this.entityManager);
    this.currentLevel.initialize();

    const center = this.currentLevel.getBoardCenter();
    const size = this.currentLevel.getBoardSize();
    this.camera.initialize(
      this.renderer,
      new THREE.Vector3(
        center.x,
        size * Config.CAMERA.INITIAL_HEIGHT,
        center.z + size * Config.CAMERA.INITIAL_DISTANCE
      ),
      center
    );
  }

  update(deltaTime: number): void {
    this.camera.update();
    this.inputState.update();
    this.gameControls.update(deltaTime);
    this.entityManager.update(deltaTime);

    if (this.currentLevel) {
      this.currentLevel.update(deltaTime);
    }

    this.renderer.render(this.scene, this.camera.getCamera());
    this.inputState.endFrame();
  }

  private handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.onResize(width / height);
    this.renderer.setSize(width, height);
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): GameCamera {
    return this.camera;
  }

  getEntityManager(): EntityManager {
    return this.entityManager;
  }

  getGameControls(): GameControls {
    return this.gameControls;
  }
}
