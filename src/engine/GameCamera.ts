import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Config } from '../Config';
import { Controllable } from './Controllable';
import { InputState } from './InputState';

export class GameCamera implements Controllable {
  private camera: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  public movementSpeed: number;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(
      Config.CAMERA.FOV,
      aspect,
      Config.CAMERA.NEAR,
      Config.CAMERA.FAR
    );
    this.movementSpeed = Config.CAMERA.MOVEMENT_SPEED;
  }

  initialize(
    renderer: THREE.WebGLRenderer,
    initialPosition: THREE.Vector3,
    lookAtPoint: THREE.Vector3
  ): void {
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = Config.CAMERA.DAMPING;
    this.controls.screenSpacePanning = false;

    this.camera.position.copy(initialPosition);
    this.controls.target.copy(lookAtPoint);
  }

  handleInput(input: InputState, deltaTime: number): void {
    const moveDirection = new THREE.Vector3();
    const forward = this.getForwardDirection();
    const right = this.getRightDirection();

    if (input.isKeyPressed('w')) moveDirection.add(forward);
    if (input.isKeyPressed('s')) moveDirection.sub(forward);
    if (input.isKeyPressed('d')) moveDirection.add(right);
    if (input.isKeyPressed('a')) moveDirection.sub(right);

    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      this.moveInDirection(moveDirection);
    }
  }

  update(): void {
    this.controls.update();
  }

  onResize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getMovementSpeed(): number {
    return this.movementSpeed;
  }

  private moveInDirection(direction: THREE.Vector3): void {
    const movement = direction.multiplyScalar(this.movementSpeed);
    this.camera.position.add(movement);
    this.controls.target.add(movement);
  }

  private getForwardDirection(): THREE.Vector3 {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    return forward.normalize();
  }

  private getRightDirection(): THREE.Vector3 {
    const forward = this.getForwardDirection();
    const right = new THREE.Vector3();
    return right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  }
}
