import { Entity } from '../entities/Entity';
import * as THREE from 'three';
import { DebugSystem } from '../debug/DebugSystem';

export class EntityManager {
  private entities = new Map<string, Entity>();

  constructor(
    private scene: THREE.Scene,
    private debugSystem: DebugSystem
  ) {}

  addEntity(id: string, entity: Entity): void {
    if (this.entities.has(id)) {
      console.warn(`Entity with id ${id} already exists. Overwriting.`);
      this.removeEntity(id);
    }

    this.entities.set(id, entity);
    this.scene.add(entity.getObject3D());

    // Create debug visualization
    this.debugSystem.createEntityDebug(entity);
  }

  removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      this.scene.remove(entity.getObject3D());
      // Remove debug visualization
      this.debugSystem.removeEntityDebug(entity);
      entity.dispose();
      this.entities.delete(id);
    }
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  update(deltaTime: number): void {
    this.entities.forEach((entity) => entity.update(deltaTime));
  }

  dispose(): void {
    this.entities.forEach((entity, id) => {
      this.removeEntity(id);
    });
    this.entities.clear();
  }
}
