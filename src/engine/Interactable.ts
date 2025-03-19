import { InputState } from './InputState';
import { InteractionPriority } from './InteractionManager';

export interface Interactable {
  handleInput(input: InputState, deltaTime: number): void;
  isSelected?: boolean;
  priority: InteractionPriority;
}
