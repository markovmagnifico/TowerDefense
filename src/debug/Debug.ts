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
    document.body.removeChild(this.stats.dom);
    this.gui.destroy();
  }
}
