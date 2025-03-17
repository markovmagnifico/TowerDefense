import * as THREE from 'three';
import { GameCamera } from './GameCamera';
import { Config } from '../Config';

export type InputCallback = (state: InputState) => void;

export class InputState {
  // Raw input state
  private keys = new Set<string>();
  private keysPressed = new Set<string>();
  private keysReleased = new Set<string>();
  private mouseButtons = new Set<number>();
  private mouseButtonsPressed = new Set<number>();
  private currentMousePosition = new THREE.Vector2();
  private mouseDelta = new THREE.Vector2();
  private wheelDelta = 0;

  // Processed state - updated once per frame
  private worldPosition: THREE.Vector3 | null = null;
  private raycaster = new THREE.Raycaster();
  private groundMesh: THREE.Mesh | null = null;

  // Event callbacks
  private keyPressCallbacks: InputCallback[] = [];
  private keyReleaseCallbacks: InputCallback[] = [];

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

    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (!this.keys.has(key)) {
        this.keys.add(key);
        this.keysPressed.add(key);
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      this.keys.delete(key);
      this.keysReleased.add(key);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.keysPressed.clear();
      this.keysReleased.clear();
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

    // Handle key press callbacks
    if (this.keysPressed.size > 0) {
      this.keyPressCallbacks.forEach((callback) => callback(this));
    }

    // Handle key release callbacks
    if (this.keysReleased.size > 0) {
      this.keyReleaseCallbacks.forEach((callback) => callback(this));
    }
  }

  endFrame() {
    // Reset per-frame values
    this.mouseDelta.set(0, 0);
    this.wheelDelta = 0;
    this.mouseButtonsPressed.clear();
    this.keysPressed.clear();
    this.keysReleased.clear();
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

  onKeyPress(callback: InputCallback): void {
    this.keyPressCallbacks.push(callback);
  }

  onKeyRelease(callback: InputCallback): void {
    this.keyReleaseCallbacks.push(callback);
  }

  removeKeyPressCallback(callback: InputCallback): void {
    const index = this.keyPressCallbacks.indexOf(callback);
    if (index !== -1) {
      this.keyPressCallbacks.splice(index, 1);
    }
  }

  removeKeyReleaseCallback(callback: InputCallback): void {
    const index = this.keyReleaseCallbacks.indexOf(callback);
    if (index !== -1) {
      this.keyReleaseCallbacks.splice(index, 1);
    }
  }

  isMouseButtonDown(button: number): boolean {
    return this.mouseButtons.has(button);
  }

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtonsPressed.has(button);
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key.toLowerCase());
  }

  isKeyDown(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  isKeyReleased(key: string): boolean {
    return this.keysReleased.has(key.toLowerCase());
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
