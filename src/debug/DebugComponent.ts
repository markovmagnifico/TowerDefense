import * as THREE from 'three';

export abstract class DebugComponent {
  protected enabled = false;

  constructor(protected scene: THREE.Scene) {}

  abstract update(deltaTime: number): void;
  abstract dispose(): void;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.onToggle(enabled);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  protected abstract onToggle(enabled: boolean): void;
}
