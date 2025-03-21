import { InputState } from './InputState';
import { InteractionPriority } from './InteractionManager';

export interface Interactable {
  /**
   * Handle input for this interactable
   * @returns true if the input was consumed and should not be passed to lower priority interactables
   */
  handleInput(input: InputState, deltaTime: number): boolean;
  isSelected?: boolean;
  priority: InteractionPriority;
}
