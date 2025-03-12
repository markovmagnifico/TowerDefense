import * as THREE from 'three';
import { GameEngine } from './engine/GameEngine';
import { Debug } from './Debug';
import { Config } from './Config';
import { Player } from './Player';
import level1 from '../assets/levels/level1.json';

// Initialize game engine
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const engine = new GameEngine(canvas);

// Load initial level
engine.loadLevel(level1);

// Initialize player
const player = new Player(engine.getScene());
player.setPosition(Config.BOARD_SIZE / 2, Config.BOARD_SIZE / 2); // Start in center
engine.getScene().add(player.getMesh());

// Initialize debug tools
const debug = Debug.initialize(engine.getScene(), engine.getCamera());

// Set up click handling
const raycaster = new THREE.Raycaster();
const clickPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const mouse = new THREE.Vector2();
const intersectPoint = new THREE.Vector3();

function handleClick(event: MouseEvent) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, engine.getCamera().getCamera());

  // Calculate the point of intersection with the ground plane
  if (raycaster.ray.intersectPlane(clickPlane, intersectPoint)) {
    // Check if the point is within the game board
    if (Player.isValidPosition(intersectPoint)) {
      player.moveTo(intersectPoint);
    }
  }
}

window.addEventListener('click', handleClick);

// Track last time for delta time calculation
let lastTime = performance.now();

// Animation loop
function animate() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;

  requestAnimationFrame(animate);
  engine.update(deltaTime);
  player.update(deltaTime);
  debug.update();
}

// Connect player debug to main debug toggle
debug.addControl('Player', player, 'movementSpeed', 1, 10);
debug.addControl('Player', player, 'rotorSpeed', 0.1, 5);
player.setDebugEnabled(true);

animate();
