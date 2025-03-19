import * as THREE from 'three';
import { EntityManager } from './EntityManager';
import { Level } from '../level/Level';
import { InputState } from './InputState';
import { LevelData } from '../level/LevelTypes';
import { GameCamera } from './GameCamera';
import { Config } from '../Config';
import { InteractionManager, InteractionPriority } from './InteractionManager';
import { DebugSystem } from '../debug/DebugSystem';
import { Debug } from '../debug/Debug';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: GameCamera;
  private renderer: THREE.WebGLRenderer;
  private entityManager: EntityManager;
  private currentLevel: Level | null = null;
  private inputState: InputState;
  private interactionManager: InteractionManager;
  private debugSystem: DebugSystem;

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

    this.inputState = new InputState(this.camera);
    this.interactionManager = new InteractionManager(this.inputState);
    this.debugSystem = new DebugSystem(this.scene, this.inputState);

    const debug = new Debug(this.scene, this.camera);
    this.debugSystem.addComponent(debug);

    this.entityManager = new EntityManager(this.scene, this.debugSystem);

    // Add camera to interaction manager
    this.interactionManager.addInteractable(this.camera);

    window.addEventListener('resize', this.handleResize.bind(this));
  }

  loadLevel(levelData: LevelData): void {
    if (this.currentLevel) {
      this.currentLevel.dispose();
    }

    this.currentLevel = new Level(this.scene, levelData, this.entityManager);
    this.currentLevel.initialize();

    this.debugSystem.createTerrainDebug(this.currentLevel.getTerrainGrid());

    this.inputState.setGroundMesh(this.currentLevel.getGroundMesh());

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
    this.interactionManager.update(deltaTime);
    this.entityManager.update(deltaTime);
    this.debugSystem.update(deltaTime);

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

  getInteractionManager(): InteractionManager {
    return this.interactionManager;
  }

  getLevel(): Level {
    if (!this.currentLevel) {
      throw new Error('Level not loaded');
    }
    return this.currentLevel;
  }

  getDebugSystem(): DebugSystem {
    return this.debugSystem;
  }

  dispose(): void {
    if (this.currentLevel) {
      this.currentLevel.dispose();
    }
    this.entityManager.dispose();
    this.debugSystem.dispose();
  }
}
