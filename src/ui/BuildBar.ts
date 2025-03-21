import { InputState } from '../engine/InputState';
import { InteractionPriority } from '../engine/InteractionManager';
import { HTMLUIElement } from './UITypes';
import { RangerTower } from '../entities/towers/RangerTower';
import { BuildSystem } from '../engine/BuildSystem';
import { Tower } from '../entities/towers/Tower';

type TowerConstructor = new (...args: any[]) => Tower;

export class BuildBar extends HTMLUIElement {
  private slots: HTMLElement[] = [];
  private activeSlot: number | null = null;
  private readonly numSlots = 8;
  priority = InteractionPriority.MACRO_UI;

  // Define which tower goes in which slot
  private towerTypes: (TowerConstructor | null)[] = [
    RangerTower, // Slot 0
    null, // Slot 1
    null, // Slot 2
    null, // Slot 3
    null, // Slot 4
    null, // Slot 5
    null, // Slot 6
    null, // Slot 7
  ];

  constructor(private buildSystem: BuildSystem) {
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
        background: linear-gradient(
          to bottom,
          rgba(74, 74, 74, 0.95),
          rgba(35, 35, 35, 0.95)
        );
        padding: 12px;
        border-radius: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 
          0 0 0 1px #000,
          inset 0 0 0 1px rgba(255, 255, 255, 0.1),
          0 0 10px rgba(0, 0, 0, 0.5);
        border: 2px solid #595959;
      }

      .build-bar::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkY1QzlCMjY2NTU1MTFFMDhDNDJGMTgyMjVFNzg2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkZGNUM5QjI3NjU1NTExRTA4QzQyRjE4MjI1RTc4NiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkZGNUM5QjI0NjU1NTExRTA4QzQyRjE4MjI1RTc4NiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGRjVDOUIyNTY1NTUxMUUwOEM0MkYxODIyNUU3ODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7YvZKAAAAASUlEQVR42mL8//8/AyMjIwMTAxBcvXoVyGQEYiBmBGJGBkZGRjCfCchkZgJSmICYhQEImBmBEoxAzALETEwMDAwAAQYAGS4HqU6vdkIAAAAASUVORK5CYII=');
        opacity: 0.1;
        border-radius: 6px;
        pointer-events: none;
      }

      .build-bar-slots {
        display: flex;
        gap: 8px;
        position: relative;
        z-index: 1;
      }

      .build-slot {
        width: 64px;
        height: 64px;
        background: linear-gradient(
          135deg,
          rgba(80, 80, 80, 0.9),
          rgba(40, 40, 40, 0.9)
        );
        border: 2px solid #2a2a2a;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        box-shadow: 
          inset 0 0 0 1px rgba(255, 255, 255, 0.1),
          inset 2px 2px 4px rgba(255, 255, 255, 0.1),
          inset -2px -2px 4px rgba(0, 0, 0, 0.3);
      }

      .build-slot::before {
        content: '';
        position: absolute;
        top: 1px;
        left: 1px;
        right: 1px;
        bottom: 1px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        pointer-events: none;
      }

      .build-slot:hover {
        border-color: #4a4a4a;
        background: linear-gradient(
          135deg,
          rgba(100, 100, 100, 0.9),
          rgba(60, 60, 60, 0.9)
        );
        transform: translateY(-1px);
        box-shadow: 
          inset 0 0 0 1px rgba(255, 255, 255, 0.15),
          inset 2px 2px 4px rgba(255, 255, 255, 0.15),
          inset -2px -2px 4px rgba(0, 0, 0, 0.3),
          0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .build-slot.active {
        background: linear-gradient(
          135deg,
          rgba(255, 215, 0, 0.2),
          rgba(218, 165, 32, 0.2)
        );
        border-color: #ffd700;
        box-shadow: 
          inset 0 0 0 1px rgba(255, 255, 255, 0.2),
          inset 2px 2px 4px rgba(255, 215, 0, 0.1),
          inset -2px -2px 4px rgba(0, 0, 0, 0.3),
          0 0 15px rgba(255, 215, 0, 0.3);
      }

      .build-slot.active::before {
        border-color: rgba(255, 215, 0, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  handleInput(input: InputState): boolean {
    if (input.isMouseButtonPressed(0)) {
      const mousePos = input.getMousePosition();
      const { x, y } = this.getScreenCoordinates(mousePos.x, mousePos.y);

      if (this.containsPoint(x, y)) {
        const slot = this.getSlotAtPoint(x, y);
        if (slot !== null) {
          this.toggleSlot(slot);
        }
        return true; // Consume input when over the UI, even if no slot was clicked
      }
    }
    return false; // Don't consume input if not over the UI
  }

  handleClick(): boolean {
    return true; // Always consume clicks when they reach this UI element
  }

  private toggleSlot(index: number): void {
    if (this.activeSlot === index) {
      // Deactivate current slot
      this.slots[index].classList.remove('active');
      this.activeSlot = null;
      this.buildSystem.deactivate();
    } else {
      // Deactivate previous slot if any
      if (this.activeSlot !== null) {
        this.slots[this.activeSlot].classList.remove('active');
      }

      // Activate new slot if it has a tower type
      const TowerClass = this.towerTypes[index];
      if (TowerClass) {
        this.slots[index].classList.add('active');
        this.activeSlot = index;
        this.buildSystem.activate(TowerClass);
      }
    }
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

  dispose(): void {
    document.body.removeChild(this.element);
  }
}
