import * as THREE from 'three';

export interface EnemyConfig {
  geometry: () => THREE.BufferGeometry;
  material: () => THREE.Material;
  scale: THREE.Vector3;
  health: number;
  speed: number;
  height: number; // Height above ground
}

export const EnemyTypes: { [key: string]: EnemyConfig } = {
  cube: {
    geometry: () => new THREE.BoxGeometry(1, 1, 1),
    material: () =>
      new THREE.MeshPhongMaterial({
        color: 0xff0000,
        shininess: 30,
      }),
    scale: new THREE.Vector3(0.5, 0.5, 0.5),
    health: 100,
    speed: 2.0,
    height: 0.5,
  },
  boss_cube: {
    geometry: () => new THREE.BoxGeometry(1, 1, 1),
    material: () =>
      new THREE.MeshPhongMaterial({
        color: 0x8b0000,
        shininess: 50,
        emissive: 0x330000,
      }),
    scale: new THREE.Vector3(0.8, 0.8, 0.8),
    health: 500,
    speed: 1.0,
    height: 0.8,
  },
};
