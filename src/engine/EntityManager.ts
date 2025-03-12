import { Entity } from '../entities/Entity';
import * as THREE from 'three';

export class EntityManager {
  private entities: Map<string, Entity>;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.entities = new Map();
    this.scene = scene;
  }

  addEntity(id: string, entity: Entity): void {
    this.entities.set(id, entity);
    const object3D = entity.getObject3D();
    if (object3D) {
      this.scene.add(object3D);
    }
  }

  removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      const object3D = entity.getObject3D();
      if (object3D) {
        this.scene.remove(object3D);
      }
      this.entities.delete(id);
    }
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  update(deltaTime: number): void {
    this.entities.forEach((entity) => entity.update(deltaTime));
  }
}
