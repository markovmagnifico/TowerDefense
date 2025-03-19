import { HTMLUIElement } from './UITypes';
import { InputState } from '../engine/InputState';
import { InteractionPriority } from '../engine/InteractionManager';
import { WaveState } from '../level/WaveManager';

interface WaveInfo {
  id: string;
  name: string;
  spawns: {
    path_id: string;
    enemies: Array<{
      type: string;
      count: number;
    }>;
  }[];
}

export class WaveUI extends HTMLUIElement {
  priority = InteractionPriority.MACRO_UI;
  private currentWave: number = 0;
  private waves: WaveInfo[] = [];
  private waveState: WaveState = WaveState.WAITING;
  private progress: { current: number; total: number } = { current: 0, total: 0 };
  private onNextWaveClick: (() => void) | null = null;

  constructor() {
    super('wave-ui', '', 'wave-ui');
    this.setupStyles();
    this.setVisibility(true);
  }

  private setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .wave-ui {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        padding: 15px;
        border-radius: 10px;
        color: white;
        font-family: Arial, sans-serif;
        min-width: 200px;
      }

      .wave-header {
        font-size: 18px;
        margin-bottom: 10px;
        color: #4a9eff;
      }

      .wave-info {
        font-size: 14px;
        margin-bottom: 5px;
      }

      .enemy-list {
        margin-top: 8px;
        padding-left: 15px;
        margin-bottom: 15px;
      }

      .enemy-item {
        color: #ccc;
        margin: 3px 0;
        font-size: 12px;
      }

      .wave-progress {
        margin: 10px 0;
        font-size: 14px;
        color: #4a9eff;
      }

      .next-wave-button {
        background: #4a9eff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
        width: 100%;
      }

      .next-wave-button:hover {
        background: #2c7cd6;
      }

      .next-wave-button:disabled {
        background: #2c3e50;
        cursor: not-allowed;
      }

      .wave-complete {
        color: #4ade80;
        font-weight: bold;
        text-align: center;
        margin: 10px 0;
      }
    `;
    document.head.appendChild(style);
  }

  setWaves(waves: WaveInfo[]): void {
    this.waves = waves;
    this.updateDisplay();
  }

  setCurrentWave(index: number): void {
    this.currentWave = index;
    this.updateDisplay();
  }

  setWaveState(state: WaveState): void {
    this.waveState = state;
    this.updateDisplay();
  }

  setProgress(progress: { current: number; total: number }): void {
    this.progress = progress;
    this.updateDisplay();
  }

  setNextWaveCallback(callback: () => void): void {
    this.onNextWaveClick = callback;
  }

  private updateDisplay(): void {
    const currentWave = this.waves[this.currentWave];
    const nextWave = this.waves[this.currentWave + 1];
    const hasMoreWaves = this.currentWave < this.waves.length - 1;

    let html = `
      <div class="wave-header">Wave ${this.currentWave + 1} of ${this.waves.length}</div>
    `;

    if (this.waveState === WaveState.COMPLETED) {
      html += `<div class="wave-complete">Wave Complete!</div>`;
    } else if (this.waveState === WaveState.IN_PROGRESS || this.waveState === WaveState.SPAWNING) {
      html += `
        <div class="wave-progress">
          Progress: ${this.progress.current}/${this.progress.total} enemies defeated
        </div>
      `;
    }

    if (
      nextWave &&
      (this.waveState === WaveState.WAITING || this.waveState === WaveState.COMPLETED)
    ) {
      html += `
        <div class="wave-info">Next Wave: ${nextWave.name}</div>
        <div class="enemy-list">
          ${this.formatEnemyList(nextWave)}
        </div>
        <button class="next-wave-button">Start Next Wave</button>
      `;
    }

    this.element.innerHTML = html;
  }

  private formatEnemyList(wave: WaveInfo): string {
    const enemies = new Map<string, number>();

    // Combine enemy counts across all spawn points
    wave.spawns.forEach((spawn) => {
      spawn.enemies.forEach((enemy) => {
        const current = enemies.get(enemy.type) || 0;
        enemies.set(enemy.type, current + enemy.count);
      });
    });

    return Array.from(enemies.entries())
      .map(
        ([type, count]) => `
        <div class="enemy-item">
          ${count}x ${type
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </div>
      `
      )
      .join('');
  }

  handleInput(input: InputState, _deltaTime: number): void {
    if (input.isMouseButtonPressed(0)) {
      const mousePos = input.getMousePosition();
      const { x, y } = this.getScreenCoordinates(mousePos.x, mousePos.y);

      if (this.containsPoint(x, y)) {
        const nextWaveButton = this.element.querySelector('.next-wave-button');
        if (nextWaveButton && this.isPointInElement(x, y, nextWaveButton) && this.onNextWaveClick) {
          this.onNextWaveClick();
        }
      }
    }
  }

  handleClick(): boolean {
    return true; // We handle our own clicks
  }

  private isPointInElement(x: number, y: number, element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }
}
