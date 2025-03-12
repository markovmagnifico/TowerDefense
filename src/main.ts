import * as THREE from 'three';
import { GameCamera } from './GameCamera';
import { GameScene } from './GameScene';
import { Debug } from './Debug';
import { Config } from './Config';
import { Player } from './Player';

// Initialize renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(Config.COLORS.BACKGROUND);
document.body.appendChild(renderer.domElement);

// Initialize scene
const gameScene = new GameScene();

// Initialize camera
const gameCamera = new GameCamera(window.innerWidth / window.innerHeight);
gameCamera.initialize(
  renderer,
  new THREE.Vector3(
    gameScene.getBoardSize() / 2,
    gameScene.getBoardSize() * Config.CAMERA.INITIAL_HEIGHT,
    gameScene.getBoardSize() * Config.CAMERA.INITIAL_DISTANCE
  ),
  gameScene.getBoardCenter()
);

// Initialize player
const player = new Player(gameScene.getScene());
player.setPosition(Config.BOARD_SIZE / 2, Config.BOARD_SIZE / 2); // Start in center
gameScene.getScene().add(player.getMesh());

// Initialize debug tools
const debug = Debug.initialize(gameScene.getScene(), gameCamera);

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
  raycaster.setFromCamera(mouse, gameCamera.getCamera());

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
  gameCamera.update();
  player.update(deltaTime);
  debug.update();
  renderer.render(gameScene.getScene(), gameCamera.getCamera());
}

// Handle window resizing
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  gameCamera.onResize(width / height);
});

// Connect player debug to main debug toggle
debug.addControl('Player', player, 'movementSpeed', 1, 10);
debug.addControl('Player', player, 'rotorSpeed', 0.1, 5);
player.setDebugEnabled(true);

animate();
