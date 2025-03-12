import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { InputManager } from './InputManager';
import { Config } from './Config';

export class GameCamera {
  private camera: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private inputManager: InputManager;
  public MOVEMENT_SPEED: number;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(
      Config.CAMERA.FOV,
      aspect,
      Config.CAMERA.NEAR,
      Config.CAMERA.FAR
    );
    this.inputManager = InputManager.getInstance();
    this.MOVEMENT_SPEED = Config.CAMERA.MOVEMENT_SPEED;
  }

  public initialize(
    renderer: THREE.WebGLRenderer,
    initialPosition: THREE.Vector3,
    lookAtPoint: THREE.Vector3
  ) {
    // Set up orbit controls
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;

    // Set initial position and look target
    this.camera.position.copy(initialPosition);
    this.controls.target.copy(lookAtPoint);
  }

  public update() {
    this.handleKeyboardMovement();
    this.controls.update();
  }

  public onResize(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  private handleKeyboardMovement() {
    // Create a direction vector pointing in the camera's view direction
    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);

    // Project the camera direction onto the XZ plane and normalize
    const forward = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();

    // Calculate right vector using cross product with world up
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // Calculate movement based on keys pressed
    const moveDirection = new THREE.Vector3(0, 0, 0);

    if (this.inputManager.isKeyPressed('w') || this.inputManager.isKeyPressed('ArrowUp')) {
      moveDirection.add(forward);
    }
    if (this.inputManager.isKeyPressed('s') || this.inputManager.isKeyPressed('ArrowDown')) {
      moveDirection.sub(forward);
    }
    if (this.inputManager.isKeyPressed('a') || this.inputManager.isKeyPressed('ArrowLeft')) {
      moveDirection.sub(right);
    }
    if (this.inputManager.isKeyPressed('d') || this.inputManager.isKeyPressed('ArrowRight')) {
      moveDirection.add(right);
    }

    // Normalize and apply movement
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      moveDirection.multiplyScalar(this.MOVEMENT_SPEED);

      // Move both camera and target together to maintain relative position
      this.camera.position.add(moveDirection);
      this.controls.target.add(moveDirection);
    }
  }
}
