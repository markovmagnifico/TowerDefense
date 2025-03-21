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
        background: linear-gradient(
          to bottom,
          rgba(60, 45, 30, 0.95),
          rgba(40, 30, 20, 0.95)
        );
        padding: 15px;
        border-radius: 8px;
        color: #d4c4a8;
        font-family: 'Cinzel', serif;
        min-width: 240px;
        box-shadow: 
          0 0 0 1px #000,
          inset 0 0 0 1px rgba(255, 255, 255, 0.1),
          0 0 10px rgba(0, 0, 0, 0.5);
        border: 2px solid #483828;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }

      .wave-ui::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAkSURBVHjaYvz//z8DAwMDAxMDEFy9ehXIZARiIGYEYkYGgABjAAzJA6lk+dZkAAAAAElFTkSuQmCC');
        opacity: 0.05;
        border-radius: 6px;
        pointer-events: none;
      }

      .wave-header {
        font-size: 20px;
        margin-bottom: 12px;
        color: #ffd700;
        text-align: center;
        letter-spacing: 1px;
        position: relative;
      }

      .wave-header::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 10%;
        right: 10%;
        height: 1px;
        background: linear-gradient(
          to right,
          transparent,
          #ffd700,
          transparent
        );
      }

      .wave-info {
        font-size: 16px;
        margin-bottom: 8px;
        color: #e6d5ba;
      }

      .enemy-list {
        margin: 12px 0;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .enemy-item {
        color: #bdb088;
        margin: 6px 0;
        font-size: 14px;
        display: flex;
        align-items: center;
      }

      .enemy-item::before {
        content: '•';
        color: #ffd700;
        margin-right: 8px;
        font-size: 18px;
      }

      .wave-progress {
        margin: 12px 0;
        font-size: 16px;
        color: #ffd700;
        text-align: center;
      }

      .next-wave-button {
        background: linear-gradient(
          to bottom,
          #8b7355,
          #6b563c
        );
        color: #fff;
        border: 2px solid #483828;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Cinzel', serif;
        font-size: 16px;
        width: 100%;
        transition: all 0.2s ease;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        box-shadow:
          inset 0 1px rgba(255, 255, 255, 0.2),
          inset 0 -1px rgba(0, 0, 0, 0.2);
      }

      .next-wave-button:hover {
        background: linear-gradient(
          to bottom,
          #9b8365,
          #7b664c
        );
        border-color: #584838;
        transform: translateY(-1px);
        box-shadow:
          inset 0 1px rgba(255, 255, 255, 0.2),
          inset 0 -1px rgba(0, 0, 0, 0.2),
          0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .next-wave-button:active {
        transform: translateY(1px);
        box-shadow:
          inset 0 1px rgba(0, 0, 0, 0.2);
      }

      .next-wave-button:disabled {
        background: linear-gradient(
          to bottom,
          #5b5b5b,
          #3b3b3b
        );
        border-color: #2c2c2c;
        cursor: not-allowed;
        color: #888;
      }

      .wave-complete {
        color: #90EE90;
        font-weight: bold;
        text-align: center;
        margin: 12px 0;
        font-size: 18px;
        text-shadow: 0 0 10px rgba(144, 238, 144, 0.5);
      }

      @font-face {
        font-family: 'Cinzel';
        src: url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
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

  handleInput(input: InputState, _deltaTime: number): boolean {
    if (input.isMouseButtonPressed(0)) {
      const mousePos = input.getMousePosition();
      const { x, y } = this.getScreenCoordinates(mousePos.x, mousePos.y);

      if (this.containsPoint(x, y)) {
        const nextWaveButton = this.element.querySelector('.next-wave-button');
        if (nextWaveButton && this.isPointInElement(x, y, nextWaveButton) && this.onNextWaveClick) {
          this.onNextWaveClick();
          return true;
        }
      }
    }
    return false;
  }

  handleClick(): boolean {
    return true; // We handle our own clicks
  }

  private isPointInElement(x: number, y: number, element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }
}
