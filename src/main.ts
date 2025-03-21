import * as THREE from 'three';
import { GameEngine } from './engine/GameEngine';
import { Config } from './Config';
import { Player } from './entities/Player';
import { BuildBar } from './ui/BuildBar';
import { Prototypes } from './geometry/Prototypes';
import level1 from '../assets/levels/level1.json';

// Create game engine
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const engine = new GameEngine(canvas);

// Load level first
await engine.loadLevel(level1);

// Initialize player with height callback
const terrainGrid = engine.getLevel().getTerrainGrid();
const player = new Player(engine.getScene(), terrainGrid.createHeightCallback(), level1.dimensions);
engine.getEntityManager().addEntity('player', player);
engine.getInteractionManager().addInteractable(player);
player.setPosition(
  engine.getLevel().getBoardCenter().x,
  Config.DRONE.MOVEMENT.HOVER_HEIGHT,
  engine.getLevel().getBoardCenter().z
);

// Initialize UI after level is loaded
const buildBar = new BuildBar(engine.getBuildSystem());
engine.getInteractionManager().addInteractable(buildBar);

// Add enemy prototypes for visualization
const prototypes = [
  Prototypes.createArrowTower(),
  Prototypes.createMageTower(),
  Prototypes.createCannonTower(),
  Prototypes.createTeslaTower(),
  Prototypes.createWatchtowerArrow(),
  Prototypes.createRangerArrow(),
  Prototypes.createSpireArrow(),
  Prototypes.createCrystalline(),
  Prototypes.createTechno(),
  Prototypes.createSpiky(),
  Prototypes.createAlien(),
  Prototypes.createKnight(),
  Prototypes.createDragon(),
  Prototypes.createWizard(),
  Prototypes.createGolem(),
  Prototypes.createSpecter(),
  Prototypes.createConstructor(),
  Prototypes.createSlimePurple(),
  Prototypes.createSlimeGreen(),
];

// Position prototypes in a row
prototypes.forEach((prototype, index) => {
  const row = Math.floor(index / 5);
  const col = index % 5;
  prototype.position.set(col * 3, 1, 30 - row * 3); // Arrange in two rows
  engine.getScene().add(prototype);
});

// Track last time for delta time calculation
let lastTime = performance.now();

// Animation loop
function animate() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;

  // Update slime animations
  prototypes.forEach((prototype) => {
    if ((prototype as any).update) {
      (prototype as any).update(deltaTime);
    }
  });

  requestAnimationFrame(animate);
  engine.update(deltaTime);
}

// Connect player debug to main debug toggle
const debug = engine.getDebugSystem();
debug.addControl('Player', player, 'movementSpeed', 1, 10);
debug.addControl('Player', player, 'rotorSpeed', 0.1, 15);
player.setDebugEnabled(true);
animate();
