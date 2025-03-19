import { WaveUI } from '../ui/WaveUI';
import { Enemy } from '../entities/Enemy';
import { WaveData } from './LevelTypes';
import { EntityManager } from '../engine/EntityManager';
import { Level } from './Level';
import { SlimeEnemy } from '../entities/enemies/SlimeEnemy';
import { BossCubeEnemy } from '../entities/enemies/BossCubeEnemy';
import { TerrainGrid } from './TerrainGrid';

export enum WaveState {
  WAITING, // Waiting for player to start wave
  SPAWNING, // Currently spawning enemies
  IN_PROGRESS, // All enemies spawned, waiting for completion
  COMPLETED, // Wave is done
}

// Map enemy type strings to their constructor functions
const EnemyTypeMap: {
  [key: string]: new (terrainGrid: TerrainGrid, spawnPoint: { x: number; z: number }) => Enemy;
} = {
  cube: SlimeEnemy,
  boss_cube: BossCubeEnemy,
};

export class WaveManager {
  private currentWaveIndex: number = -1;
  private waves: WaveData[] = [];
  private waveState: WaveState = WaveState.WAITING;

  // Spawning state
  private spawnQueue: Array<{ type: string; path_id: string }> = [];
  private spawnInterval: number = 1.0; // Time between enemy spawns
  private timeSinceLastSpawn: number = 0;

  // Enemy tracking
  private activeEnemies: Map<string, Enemy> = new Map();
  private totalEnemiesInWave: number = 0;
  private level: Level | null = null;

  constructor(
    private waveUI: WaveUI,
    private entityManager: EntityManager,
    level: Level | null = null
  ) {
    this.level = level;
  }

  setLevel(level: Level): void {
    this.level = level;
  }

  initialize(waves: WaveData[]): void {
    if (!this.level) {
      throw new Error('Level must be set before initializing waves');
    }

    this.waves = waves;
    this.currentWaveIndex = -1;
    this.waveUI.setWaves(waves);
    this.waveUI.setCurrentWave(0);
    this.waveState = WaveState.WAITING;
    this.waveUI.setWaveState(this.waveState);
  }

  update(deltaTime: number): void {
    switch (this.waveState) {
      case WaveState.SPAWNING:
        this.updateSpawning(deltaTime);
        break;
      case WaveState.IN_PROGRESS:
        this.checkWaveCompletion();
        break;
    }

    // Update UI with current progress
    if (this.waveState === WaveState.SPAWNING || this.waveState === WaveState.IN_PROGRESS) {
      this.waveUI.setProgress(this.getProgress());
    }
  }

  private updateSpawning(deltaTime: number): void {
    this.timeSinceLastSpawn += deltaTime;

    if (this.timeSinceLastSpawn >= this.spawnInterval && this.spawnQueue.length > 0) {
      const enemyToSpawn = this.spawnQueue.shift()!;
      this.spawnEnemy(enemyToSpawn.type, enemyToSpawn.path_id);
      this.timeSinceLastSpawn = 0;
    }

    if (this.spawnQueue.length === 0) {
      this.waveState = WaveState.IN_PROGRESS;
      this.waveUI.setWaveState(this.waveState);
    }
  }

  private spawnEnemy(type: string, pathId: string): void {
    if (!this.level) {
      throw new Error('Cannot spawn enemies without a level');
    }

    // Find spawn point with matching ID
    const spawnNode = this.level
      .getLevelData()
      .paths.nodes.find(
        (node: { type?: string; id?: string }) => node.type === 'spawn' && node.id === pathId
      );

    if (!spawnNode) {
      console.error(`No spawn point found with id: ${pathId}`);
      return;
    }

    const EnemyConstructor = EnemyTypeMap[type];
    if (!EnemyConstructor) {
      console.error(`Unknown enemy type: ${type}`);
      return;
    }

    const enemyId = `enemy_${Date.now()}`;
    const enemy = new EnemyConstructor(this.level.getTerrainGrid(), {
      x: spawnNode.x,
      z: spawnNode.z,
    });

    this.activeEnemies.set(enemyId, enemy);
    this.entityManager.addEntity(enemyId, enemy);
  }

  startNextWave(): boolean {
    if (this.waveState !== WaveState.WAITING || this.currentWaveIndex >= this.waves.length - 1) {
      return false;
    }

    this.currentWaveIndex++;
    const wave = this.waves[this.currentWaveIndex];

    // Build spawn queue
    this.spawnQueue = [];
    this.totalEnemiesInWave = 0;
    this.activeEnemies.clear();

    wave.spawns.forEach((spawn) => {
      spawn.enemies.forEach((enemy) => {
        for (let i = 0; i < enemy.count; i++) {
          this.spawnQueue.push({ type: enemy.type, path_id: spawn.path_id });
          this.totalEnemiesInWave++;
        }
      });
    });

    this.waveState = WaveState.SPAWNING;
    this.timeSinceLastSpawn = 0;
    this.waveUI.setCurrentWave(this.currentWaveIndex);
    this.waveUI.setWaveState(this.waveState);
    return true;
  }

  private checkWaveCompletion(): void {
    // Remove dead enemies from tracking
    for (const [id, enemy] of this.activeEnemies) {
      if (enemy.isDead()) {
        this.activeEnemies.delete(id);
        this.entityManager.removeEntity(id);
      }
    }

    if (this.activeEnemies.size === 0) {
      this.completeCurrentWave();
    }
  }

  private completeCurrentWave(): void {
    this.waveState = WaveState.COMPLETED;
    this.waveUI.setWaveState(this.waveState);

    // Small delay before allowing next wave
    setTimeout(() => {
      if (this.hasMoreWaves()) {
        this.waveState = WaveState.WAITING;
        this.waveUI.setWaveState(this.waveState);
      }
    }, 1500);
  }

  getProgress(): { current: number; total: number } {
    return {
      current: this.totalEnemiesInWave - (this.spawnQueue.length + this.activeEnemies.size),
      total: this.totalEnemiesInWave,
    };
  }

  hasMoreWaves(): boolean {
    return this.currentWaveIndex < this.waves.length - 1;
  }
}
