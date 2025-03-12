import * as THREE from 'three';

export abstract class Entity {
  protected position: THREE.Vector3;
  protected rotation: THREE.Euler;
  protected object3D: THREE.Object3D | null = null;

  constructor() {
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Euler();
  }

  abstract update(deltaTime: number): void;

  getObject3D(): THREE.Object3D | null {
    return this.object3D;
  }

  setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
    if (this.object3D) {
      this.object3D.position.copy(this.position);
    }
  }

  setRotation(x: number, y: number, z: number): void {
    this.rotation.set(x, y, z);
    if (this.object3D) {
      this.object3D.rotation.copy(this.rotation);
    }
  }
}
