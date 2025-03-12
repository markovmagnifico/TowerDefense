import * as THREE from 'three';

export abstract class Entity {
  protected object3D: THREE.Object3D;
  protected position: THREE.Vector3;
  protected rotation: THREE.Euler;

  constructor() {
    this.object3D = new THREE.Group();
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Euler();
  }

  abstract update(deltaTime: number): void;

  getObject3D(): THREE.Object3D {
    return this.object3D;
  }

  setPosition(x: number, y: number, z: number): void {
    this.position.set(x, y, z);
    this.object3D.position.copy(this.position);
  }

  setRotation(x: number, y: number, z: number): void {
    this.rotation.set(x, y, z);
    this.object3D.rotation.copy(this.rotation);
  }
}
