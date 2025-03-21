import * as THREE from 'three';
import { InputState } from './InputState';
import { Interactable } from './Interactable';

export enum InteractionPriority {
  MACRO_UI = 4,
  BUILD_MODE = 3,
  TOWER_UI = 2,
  ENEMY_UI = 1,
  WORLD = 0,
}

export class InteractionManager {
  private interactables: Map<Interactable, InteractionPriority> = new Map();
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  addInteractable(
    interactable: Interactable,
    priority: InteractionPriority = InteractionPriority.WORLD
  ): void {
    this.interactables.set(interactable, priority);
  }

  removeInteractable(interactable: Interactable): void {
    this.interactables.delete(interactable);
  }

  handleInput(input: InputState, deltaTime: number): void {
    // Convert interactables map to array and sort by priority
    const sortedInteractables = Array.from(this.interactables.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([interactable]) => interactable);

    // Update mouse position for raycaster
    const mousePos = input.getMousePosition();
    this.mouse.x = mousePos.x;
    this.mouse.y = mousePos.y;

    // Handle input for each interactable in priority order
    for (const interactable of sortedInteractables) {
      interactable.handleInput(input, deltaTime);
      // If the interactable is selected, stop processing further interactions
      if (input.getSelection() === interactable) {
        break;
      }
    }
  }

  dispose(): void {
    this.interactables.clear();
  }
}
