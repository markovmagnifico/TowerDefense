import { Entity } from '../entities/Entity';
import * as THREE from 'three';

export class EntityManager {
  private entities = new Map<string, Entity>();

  constructor(private scene: THREE.Scene) {}

  addEntity(id: string, entity: Entity): void {
    this.entities.set(id, entity);
    this.scene.add(entity.getObject3D());
  }

  removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      this.scene.remove(entity.getObject3D());
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
