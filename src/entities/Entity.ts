import * as THREE from 'three';

export abstract class Entity {
  protected object3D: THREE.Object3D;

  constructor() {
    this.object3D = new THREE.Object3D();
  }

  abstract update(deltaTime: number): void;

  getObject3D(): THREE.Object3D {
    return this.object3D;
  }

  setPosition(x: number, y: number, z: number): void {
    this.object3D.position.set(x, y, z);
  }

  getPosition(): THREE.Vector3 {
    return this.object3D.position;
  }

  setRotation(x: number, y: number, z: number): void {
    this.object3D.rotation.set(x, y, z);
  }

  dispose(): void {
    // Recursively dispose of all geometries and materials
    this.object3D.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }
    });
  }
}
