import { InputState } from './InputState';
import { Interactable } from './Interactable';

export enum InteractionPriority {
  MACRO_UI = 100, // Escape menu, build bar
  TOWER_UI = 80, // Tower radial menus
  ENEMY_UI = 60, // Enemy health bars, info
  WORLD = 40, // World interactions (placing towers, moving player)
}

export class InteractionManager {
  private interactables: Interactable[] = [];

  addInteractable(interactable: Interactable): void {
    this.interactables.push(interactable);
    // Sort by priority (highest first)
    this.interactables.sort((a, b) => b.priority - a.priority);
  }

  removeInteractable(interactable: Interactable): void {
    const index = this.interactables.findIndex((item) => item === interactable);
    if (index !== -1) {
      this.interactables.splice(index, 1);
    }
  }

  update(deltaTime: number): void {
    // Update in priority order (already sorted)
    for (const interactable of this.interactables) {
      interactable.handleInput(this.input, deltaTime);
    }
  }

  constructor(private input: InputState) {}
}
