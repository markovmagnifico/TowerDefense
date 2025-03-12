import * as THREE from 'three';
import { Entity } from './Entity';

export class AmbientLight extends Entity {
  constructor(color: THREE.ColorRepresentation, intensity: number) {
    super();
    this.object3D = new THREE.AmbientLight(color, intensity);
  }

  update(deltaTime: number): void {
    // Ambient lights don't need updates
  }
}

export class DirectionalLight extends Entity {
  constructor(color: THREE.ColorRepresentation, intensity: number, position: THREE.Vector3) {
    super();
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.copy(position);
    this.object3D = light;
  }

  update(deltaTime: number): void {
    // Directional lights might have updates later (e.g., day/night cycle)
  }

  getLight(): THREE.DirectionalLight {
    return this.object3D as THREE.DirectionalLight;
  }
}
