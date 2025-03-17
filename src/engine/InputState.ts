import * as THREE from 'three';
import { GameCamera } from './GameCamera';

export class InputState {
  // Raw input state
  private keys = new Set<string>();
  private mouseButtons = new Set<number>();
  private mouseButtonsPressed = new Set<number>();
  private currentMousePosition = new THREE.Vector2();
  private mouseDelta = new THREE.Vector2();
  private wheelDelta = 0;

  // Processed state - updated once per frame
  private worldPosition: THREE.Vector3 | null = null;
  private raycaster = new THREE.Raycaster();
  private groundMesh: THREE.Mesh | null = null;

  constructor(private camera: GameCamera) {
    // Mouse move - just store raw position
    window.addEventListener('mousemove', (e) => {
      this.currentMousePosition.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      this.mouseDelta.set(e.movementX / window.innerWidth, -e.movementY / window.innerHeight);
    });

    // Mouse buttons - just store button state
    window.addEventListener('mousedown', (e) => {
      this.mouseButtons.add(e.button);
      this.mouseButtonsPressed.add(e.button);
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtons.delete(e.button);
    });

    window.addEventListener('wheel', (e) => {
      this.wheelDelta = Math.sign(e.deltaY);
    });

    window.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseButtons.clear();
      this.mouseButtonsPressed.clear();
    });
  }

  setGroundMesh(mesh: THREE.Mesh) {
    this.groundMesh = mesh;
  }

  update() {
    // Update world position with current camera state
    this.updateWorldPosition();
  }

  endFrame() {
    // Reset per-frame values
    this.mouseDelta.set(0, 0);
    this.wheelDelta = 0;
    this.mouseButtonsPressed.clear();
  }

  private updateWorldPosition() {
    if (!this.groundMesh) return;

    this.raycaster.setFromCamera(this.currentMousePosition, this.camera.getCamera());
    const intersects = this.raycaster.intersectObject(this.groundMesh);

    if (intersects.length > 0) {
      this.worldPosition = intersects[0].point;
    } else {
      this.worldPosition = null;
    }
  }

  isMouseButtonDown(button: number): boolean {
    return this.mouseButtons.has(button);
  }

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtonsPressed.has(button);
  }

  isKeyPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  getMousePosition(): THREE.Vector2 {
    return this.currentMousePosition.clone();
  }

  getMouseDelta(): THREE.Vector2 {
    return this.mouseDelta.clone();
  }

  getWheelDelta(): number {
    return this.wheelDelta;
  }

  getWorldPosition(): THREE.Vector3 | null {
    return this.worldPosition?.clone() ?? null;
  }
}
