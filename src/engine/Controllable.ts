import { InputState } from './InputState';

export interface Controllable {
  handleInput(input: InputState, deltaTime: number): void;
}
