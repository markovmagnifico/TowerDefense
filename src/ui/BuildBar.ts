import { InputState } from '../engine/InputState';
import { InteractionPriority } from '../engine/InteractionManager';
import { HTMLUIElement } from './UITypes';

export class BuildBar extends HTMLUIElement {
  private slots: HTMLElement[] = [];
  private activeSlot: number | null = null;
  private readonly numSlots = 8;
  priority = InteractionPriority.MACRO_UI;

  constructor() {
    super('build-bar', '', 'build-bar');
    this.setupHTML();
    this.setupStyles();
    this.setVisibility(true);
  }

  private setupHTML() {
    this.element.innerHTML = `
      <div class="build-bar-slots">
        ${Array(this.numSlots)
          .fill(0)
          .map((_, i) => `<div class="build-slot" data-slot="${i}"></div>`)
          .join('')}
      </div>
    `;
    this.slots = Array.from(this.element.querySelectorAll('.build-slot'));
  }

  private setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .build-bar {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        padding: 10px;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .build-bar-slots {
        display: flex;
        gap: 10px;
      }

      .build-slot {
        width: 60px;
        height: 60px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .build-slot:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
      }

      .build-slot.active {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
      }
    `;
    document.head.appendChild(style);
  }

  handleInput(input: InputState, _deltaTime: number): void {
    if (input.isMouseButtonPressed(0)) {
      const mousePos = input.getMousePosition();
      const { x, y } = this.getScreenCoordinates(mousePos.x, mousePos.y);

      if (this.containsPoint(x, y)) {
        const slot = this.getSlotAtPoint(x, y);
        if (slot !== null) {
          this.activateSlot(slot);
          input.setSelection(this);
        }
      } else if (this.isSelected) {
        this.clearActiveSlot();
        input.clearSelection();
      }
    }
  }

  handleClick(): boolean {
    return this.isSelected;
  }

  private getSlotAtPoint(x: number, y: number): number | null {
    for (let i = 0; i < this.slots.length; i++) {
      const rect = this.slots[i].getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return i;
      }
    }
    return null;
  }

  private activateSlot(index: number): void {
    if (this.activeSlot !== null) {
      this.slots[this.activeSlot].classList.remove('active');
    }

    if (this.activeSlot !== index) {
      this.slots[index].classList.add('active');
      this.activeSlot = index;
    } else {
      this.activeSlot = null;
    }
  }

  private clearActiveSlot(): void {
    if (this.activeSlot !== null) {
      this.slots[this.activeSlot].classList.remove('active');
      this.activeSlot = null;
    }
  }

  dispose(): void {
    document.body.removeChild(this.element);
  }
}
