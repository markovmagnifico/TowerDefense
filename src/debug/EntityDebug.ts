import * as THREE from 'three';
import { Entity } from '../entities/Entity';
import { DebugComponent } from './DebugComponent';

export class EntityDebug extends DebugComponent {
  private boundingBox: THREE.Box3Helper | null = null;
  private axisHelper: THREE.AxesHelper | null = null;

  constructor(
    scene: THREE.Scene,
    private entity: Entity
  ) {
    super(scene);
    this.createDebugVisuals();
  }

  private createDebugVisuals(): void {
    // Create bounding box helper
    const box = new THREE.Box3();
    box.setFromObject(this.entity.getObject3D());
    this.boundingBox = new THREE.Box3Helper(box, 0xffff00);
    this.boundingBox.visible = false;
    this.scene.add(this.boundingBox);

    // Create local axis helper
    this.axisHelper = new THREE.AxesHelper(0.5);
    this.axisHelper.visible = false;
    this.entity.getObject3D().add(this.axisHelper);
  }

  protected onToggle(enabled: boolean): void {
    if (this.boundingBox) {
      this.boundingBox.visible = enabled;
    }
    if (this.axisHelper) {
      this.axisHelper.visible = enabled;
    }
  }

  update(deltaTime: number): void {
    if (!this.enabled || !this.boundingBox) return;

    // Update bounding box to match entity
    const box = new THREE.Box3();
    box.setFromObject(this.entity.getObject3D());
    this.boundingBox.box = box;
  }

  dispose(): void {
    if (this.boundingBox) {
      this.scene.remove(this.boundingBox);
      this.boundingBox.geometry.dispose();
      (this.boundingBox.material as THREE.Material).dispose();
    }
    if (this.axisHelper) {
      this.entity.getObject3D().remove(this.axisHelper);
      this.axisHelper.geometry.dispose();
      (this.axisHelper.material as THREE.Material).dispose();
    }
  }
}
