import { InputState } from '../engine/InputState';
import { Interactable } from '../engine/Interactable';

export type UIElementType = 'fixed' | 'radial' | 'world';

export interface UIElement {
  readonly id: string;
  readonly type: UIElementType;

  show(): void;
  hide(): void;
  update(deltaTime: number): void;

  containsPoint(x: number, y: number): boolean;
  handleClick(): boolean;

  onMouseEnter?(): void;
  onMouseLeave?(): void;
}

export abstract class HTMLUIElement implements UIElement, Interactable {
  protected element: HTMLElement;
  readonly type: UIElementType = 'fixed';

  constructor(
    readonly id: string,
    template: string,
    protected className: string
  ) {
    this.element = document.createElement('div');
    this.element.id = id;
    this.element.className = className;
    this.element.innerHTML = template;
    this.element.style.position = 'absolute';
    this.element.style.display = 'none';
    document.body.appendChild(this.element);
  }

  show(): void {
    this.setVisibility(true);
  }

  hide(): void {
    this.setVisibility(false);
  }

  protected setVisibility(visible: boolean): void {
    this.element.style.display = visible ? 'block' : 'none';
  }

  update(_deltaTime: number): void {
    // Default implementation does nothing
  }

  containsPoint(x: number, y: number): boolean {
    const rect = this.element.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  abstract handleClick(): boolean;
  abstract handleInput(input: InputState, deltaTime: number): void;
  abstract priority: number;
  isSelected = false;

  protected getScreenCoordinates(
    normalizedX: number,
    normalizedY: number
  ): { x: number; y: number } {
    return {
      x: ((normalizedX + 1) / 2) * window.innerWidth,
      y: ((-normalizedY + 1) / 2) * window.innerHeight,
    };
  }

  dispose(): void {
    document.body.removeChild(this.element);
  }
}
