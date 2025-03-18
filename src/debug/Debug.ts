import * as THREE from 'three';
import Stats from 'stats.js';
import GUI from 'lil-gui';
import { GameCamera } from '../engine/GameCamera';
import { DebugComponent } from './DebugComponent';
import { Config } from '../Config';

interface DebugControl {
  folder: string;
  target: any;
  property: string;
  min?: number;
  max?: number;
}

export class Debug extends DebugComponent {
  private axisHelper: THREE.AxesHelper;
  private axisLabels: THREE.Sprite[] = [];
  private controls: DebugControl[] = [];
  private stats: Stats;
  private gui: GUI;

  constructor(
    scene: THREE.Scene,
    private camera: GameCamera
  ) {
    super(scene);

    // Initialize Stats
    this.stats = new Stats();
    this.stats.dom.style.position = 'absolute';
    this.setStatsPosition(Config.DEBUG.STATS_POSITION);
    document.body.appendChild(this.stats.dom);
    this.stats.dom.style.display = 'none';

    // Initialize GUI
    this.gui = new GUI({ width: Config.DEBUG.CONTROLS_WIDTH });
    this.gui.hide();

    // Initialize Axis Helper
    this.axisHelper = new THREE.AxesHelper(Config.DEBUG.AXIS_HELPER_SIZE);
    this.axisHelper.visible = false;
    scene.add(this.axisHelper);

    // Create axis labels
    this.createAxisLabels();
  }

  private createAxisLabels(): void {
    const labels = ['X', 'Y', 'Z'];
    const colors = [0xff0000, 0x00ff00, 0x0000ff]; // Red, Green, Blue to match Three.js axes
    const positions = [
      new THREE.Vector3(Config.DEBUG.AXIS_HELPER_SIZE + 0.5, 0, 0),
      new THREE.Vector3(0, Config.DEBUG.AXIS_HELPER_SIZE + 0.5, 0),
      new THREE.Vector3(0, 0, Config.DEBUG.AXIS_HELPER_SIZE + 0.5),
    ];

    labels.forEach((label, index) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 64;
      canvas.height = 64;

      // Create label texture
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#' + colors[index].toString(16).padStart(6, '0');
      ctx.fillText(label, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        sizeAttenuation: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(positions[index]);
      sprite.scale.set(0.05, 0.05, 1);
      sprite.visible = false;
      this.axisLabels.push(sprite);
      this.scene.add(sprite);
    });
  }

  private setStatsPosition(position: string) {
    switch (position) {
      case 'topLeft':
        this.stats.dom.style.left = '0px';
        this.stats.dom.style.top = '0px';
        break;
      case 'topRight':
        this.stats.dom.style.right = '0px';
        this.stats.dom.style.top = '0px';
        break;
      case 'bottomLeft':
        this.stats.dom.style.left = '0px';
        this.stats.dom.style.bottom = '0px';
        break;
      case 'bottomRight':
        this.stats.dom.style.right = '0px';
        this.stats.dom.style.bottom = '0px';
        break;
    }
  }

  addControl(folder: string, target: any, property: string, min?: number, max?: number): void {
    this.controls.push({ folder, target, property, min, max });
    this.updateGUI();
  }

  private updateGUI(): void {
    if (!this.enabled) return;

    // Clear existing GUI
    this.gui.destroy();
    this.gui = new GUI({ width: Config.DEBUG.CONTROLS_WIDTH });

    // Group controls by folder
    const folderMap = new Map<string, GUI>();

    this.controls.forEach((control) => {
      let folder = folderMap.get(control.folder);
      if (!folder) {
        folder = this.gui.addFolder(control.folder);
        folderMap.set(control.folder, folder);
      }

      if (typeof control.min === 'number' && typeof control.max === 'number') {
        folder
          .add(control.target, control.property, control.min, control.max)
          .name(control.property);
      } else {
        folder.add(control.target, control.property).name(control.property);
      }
    });
  }

  protected onToggle(enabled: boolean): void {
    this.axisHelper.visible = enabled;
    this.axisLabels.forEach((label) => (label.visible = enabled));
    this.stats.dom.style.display = enabled ? 'block' : 'none';
    if (enabled) {
      this.gui.show();
      this.updateGUI();
    } else {
      this.gui.hide();
    }
  }

  update(deltaTime: number): void {
    if (!this.enabled) return;
    this.stats.update();
  }

  dispose(): void {
    this.scene.remove(this.axisHelper);
    this.axisLabels.forEach((label) => {
      (label.material as THREE.SpriteMaterial).map?.dispose();
      (label.material as THREE.Material).dispose();
      this.scene.remove(label);
    });
    document.body.removeChild(this.stats.dom);
    this.gui.destroy();
  }
}
