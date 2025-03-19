import * as THREE from 'three';
import { Enemy } from '../Enemy';
import { TerrainGrid } from '../../level/TerrainGrid';

export class SlimeEnemy extends Enemy {
  private body!: THREE.Mesh;
  private eyes!: THREE.Group;
  private originalScale!: THREE.Vector3;
  private time: number = 0;

  // Animation parameters
  private readonly wobbleSpeed = 3;
  private readonly squashSpeed = 4;
  private readonly wobbleAmount = 0.2; // Increased from 0.1
  private readonly squashAmount = 0.15; // Increased from 0.1

  constructor(terrainGrid: TerrainGrid, spawnPoint: { x: number; z: number }) {
    // Pass core parameters to base class
    super(
      terrainGrid,
      spawnPoint,
      1.0, // speed
      100, // health
      0.15 // height
    );

    // Create geometry after super() call
    this.createGeometry();
  }

  protected createGeometry(): void {
    // Create main body
    const bodyGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x50c878,
      metalness: 0.1,
      roughness: 0.2,
      transmission: 0.6,
      thickness: 0.5,
      transparent: true,
      opacity: 0.8,
    });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    // Create eyes
    this.eyes = new THREE.Group();
    const eyeGeometry = new THREE.SphereGeometry(0.04, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);

    leftEye.position.set(-0.08, 0.1, 0.15);
    rightEye.position.set(0.08, 0.1, 0.15);
    this.eyes.add(leftEye, rightEye);

    // Store original scale for animations
    this.originalScale = new THREE.Vector3(1, 0.8, 1);
    this.body.scale.copy(this.originalScale);

    // Add everything to the object3D
    this.object3D.add(this.body, this.eyes);
  }

  protected updateAnimation(deltaTime: number): void {
    this.time += deltaTime;
    const t = this.time;

    // Wobble animation
    const wobbleX = Math.sin(t * this.wobbleSpeed) * this.wobbleAmount;
    const wobbleZ = Math.cos(t * (this.wobbleSpeed * 0.7)) * this.wobbleAmount;
    this.body.rotation.x = wobbleX;
    this.body.rotation.z = wobbleZ;

    // Stretching animation
    const stretchY = Math.sin(t * this.squashSpeed) * this.squashAmount + 1;
    const squashXZ = 1 / Math.sqrt(stretchY); // Preserve volume
    this.body.scale.set(
      this.originalScale.x * squashXZ,
      this.originalScale.y * stretchY,
      this.originalScale.z * squashXZ
    );

    // Eye movement
    const eyeOffset = Math.sin(t * 3) * 0.02;
    this.eyes.position.y = 0.1 + eyeOffset;
  }
}
