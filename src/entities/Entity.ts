import * as THREE from 'three';

export abstract class Entity {
  protected object3D: THREE.Object3D;

  constructor() {
    this.object3D = new THREE.Group();
  }

  abstract update(deltaTime: number): void;

  getObject3D(): THREE.Object3D {
    return this.object3D;
  }

  setPosition(x: number, y: number, z: number): void {
    this.object3D.position.set(x, y, z);
  }

  setRotation(x: number, y: number, z: number): void {
    this.object3D.rotation.set(x, y, z);
  }
}
