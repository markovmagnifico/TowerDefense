import * as THREE from 'three';
import { GameEngine } from './engine/GameEngine';
import { Debug } from './Debug';
import { Config } from './Config';
import { Player } from './entities/Player';
import level1 from '../assets/levels/level1.json';

// Initialize game engine
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const engine = new GameEngine(canvas);

// Load initial level
engine.loadLevel(level1);

// Initialize player
const player = new Player(engine.getScene());
engine.getEntityManager().addEntity('player', player);
engine.getGameControls().addControllable(player);
player.setPosition(
  Config.BOARD_SIZE / 2,
  Config.DRONE.MOVEMENT.HOVER_HEIGHT,
  Config.BOARD_SIZE / 2
);

// Initialize debug tools
const debug = Debug.initialize(engine.getScene(), engine.getCamera());

// Track last time for delta time calculation
let lastTime = performance.now();

// Animation loop
function animate() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;

  requestAnimationFrame(animate);
  engine.update(deltaTime);
  debug.update();
}

// Connect player debug to main debug toggle
debug.addControl('Player', player, 'movementSpeed', 1, 10);
debug.addControl('Player', player, 'rotorSpeed', 0.1, 5);
player.setDebugEnabled(true);

animate();
