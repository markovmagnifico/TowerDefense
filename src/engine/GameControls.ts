import { InputState } from './InputState';
import { Controllable } from './Controllable';

export class GameControls {
  private controllables: Controllable[] = [];

  constructor(private input: InputState) {}

  addControllable(controllable: Controllable): void {
    this.controllables.push(controllable);
  }

  removeControllable(controllable: Controllable): void {
    const index = this.controllables.indexOf(controllable);
    if (index !== -1) {
      this.controllables.splice(index, 1);
    }
  }

  update(deltaTime: number): void {
    this.controllables.forEach((controllable) => {
      controllable.handleInput(this.input, deltaTime);
    });
  }
}
