import { InputState } from '../engine/InputState';
import { DebugComponent } from './DebugComponent';
import { Debug } from './Debug';
import { Entity } from '../entities/Entity';
import { TerrainGrid } from '../level/TerrainGrid';
import { TerrainDebug } from './TerrainDebug';
import { EntityDebug } from './EntityDebug';
import * as THREE from 'three';

// Map to track debug components by their target object
type DebugMap = Map<object, DebugComponent>;

export class DebugSystem {
  private components: DebugComponent[] = [];
  private enabled = false;
  private mainDebug: Debug | null = null;

  // Track debug components by type and target
  private debugComponents = new Map<string, DebugMap>();

  constructor(
    private scene: THREE.Scene,
    private inputState: InputState
  ) {
    // Listen for debug toggle (backtick key)
    this.inputState.onKeyPress((state) => {
      if (state.isKeyPressed('`')) {
        this.setEnabled(!this.enabled);
      }
    });
  }

  addComponent(component: DebugComponent): void {
    this.components.push(component);
    component.setEnabled(this.enabled);
    if (component instanceof Debug) {
      this.mainDebug = component;
    }
  }

  removeComponent(component: DebugComponent): void {
    const index = this.components.indexOf(component);
    if (index !== -1) {
      if (component === this.mainDebug) {
        this.mainDebug = null;
      }
      this.components.splice(index, 1);
    }
  }

  // Debug Factory methods
  createTerrainDebug(terrain: TerrainGrid): void {
    const debug = new TerrainDebug(this.scene, terrain, this.inputState);
    this.addComponent(debug);
    this.trackDebugComponent('terrain', terrain, debug);
  }

  createEntityDebug(entity: Entity): void {
    const debug = new EntityDebug(this.scene, entity);
    this.addComponent(debug);
    this.trackDebugComponent('entity', entity, debug);
  }

  removeEntityDebug(entity: Entity): void {
    this.removeDebugComponent('entity', entity);
  }

  private trackDebugComponent(type: string, target: object, component: DebugComponent): void {
    if (!this.debugComponents.has(type)) {
      this.debugComponents.set(type, new Map());
    }
    const typeMap = this.debugComponents.get(type)!;
    typeMap.set(target, component);
  }

  private removeDebugComponent(type: string, target: object): void {
    const typeMap = this.debugComponents.get(type);
    if (!typeMap) return;

    const component = typeMap.get(target);
    if (component) {
      this.removeComponent(component);
      typeMap.delete(target);
    }
  }

  update(deltaTime: number): void {
    if (!this.enabled) return;
    this.components.forEach((component) => component.update(deltaTime));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.components.forEach((component) => component.setEnabled(enabled));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  addControl(label: string, target: any, property: string, min?: number, max?: number): void {
    if (!this.mainDebug) {
      console.warn('Cannot add control: Main debug component not initialized');
      return;
    }
    this.mainDebug.addControl(label, target, property, min, max);
  }

  dispose(): void {
    this.components.forEach((component) => {
      component.dispose();
    });
    this.components = [];
    this.mainDebug = null;

    // Clear debug component maps
    this.debugComponents.forEach((typeMap) => typeMap.clear());
    this.debugComponents.clear();
  }
}
