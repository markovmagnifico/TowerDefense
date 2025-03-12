import * as THREE from 'three';
import Stats from 'stats.js';
import GUI from 'lil-gui';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Config } from './Config';
import { GameCamera } from './engine/GameCamera';

export class Debug {
  private static instance: Debug | null = null;
  private scene: THREE.Scene;
  private camera: GameCamera;
  private stats!: Stats;
  private gui!: GUI;
  private axesHelper!: THREE.AxesHelper;
  private labelRenderer!: CSS2DRenderer;
  private axisLabels: CSS2DObject[] = [];
  private isVisible: boolean = false;

  private constructor(scene: THREE.Scene, camera: GameCamera) {
    this.scene = scene;
    this.camera = camera;

    // Initialize Stats (FPS counter)
    this.stats = new Stats();
    this.stats.dom.style.position = 'absolute';
    this.setStatsPosition(Config.DEBUG.STATS_POSITION);
    document.body.appendChild(this.stats.dom);
    this.stats.dom.style.display = 'none';

    // Initialize GUI
    this.gui = new GUI({ width: Config.DEBUG.CONTROLS_WIDTH });
    this.gui.hide();

    // Camera controls folder
    const cameraFolder = this.gui.addFolder('Camera');
    cameraFolder.add(this.camera, 'movementSpeed', 0.1, 2.0).name('Movement Speed');

    // Initialize CSS2D renderer for labels
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0px';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(this.labelRenderer.domElement);

    // Initialize Axes Helper with labels
    this.initializeAxesHelper();

    // Add keyboard listener for toggle
    window.addEventListener('keydown', (event) => {
      if (event.key === Config.DEBUG.TOGGLE_KEY) {
        this.toggle();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private initializeAxesHelper() {
    // Create axes helper
    this.axesHelper = new THREE.AxesHelper(Config.DEBUG.AXIS_HELPER_SIZE);
    this.scene.add(this.axesHelper);
    this.axesHelper.visible = false;

    // Create labels for each axis
    const createLabel = (text: string, position: THREE.Vector3, className: string) => {
      const div = document.createElement('div');
      div.className = `axis-label ${className}`;
      div.textContent = text;
      const label = new CSS2DObject(div);
      label.position.copy(position);
      this.scene.add(label);
      this.axisLabels.push(label);
      label.visible = false;
      return label;
    };

    // Position labels at the end of each axis
    const size = Config.DEBUG.AXIS_HELPER_SIZE;
    createLabel('X', new THREE.Vector3(size, 0, 0), 'x');
    createLabel('Y', new THREE.Vector3(0, size, 0), 'y');
    createLabel('Z', new THREE.Vector3(0, 0, size), 'z');
  }

  public static initialize(scene: THREE.Scene, camera: GameCamera): Debug {
    if (!Debug.instance) {
      Debug.instance = new Debug(scene, camera);
    }
    return Debug.instance;
  }

  public static getInstance(): Debug {
    if (!Debug.instance) {
      throw new Error('Debug must be initialized first');
    }
    return Debug.instance;
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

  public toggle() {
    this.isVisible = !this.isVisible;
    this.stats.dom.style.display = this.isVisible ? 'block' : 'none';
    this.axesHelper.visible = this.isVisible;
    this.axisLabels.forEach((label) => (label.visible = this.isVisible));
    this.labelRenderer.domElement.style.display = this.isVisible ? 'block' : 'none';
    if (this.isVisible) {
      this.gui.show();
    } else {
      this.gui.hide();
    }
  }

  public update() {
    if (this.isVisible) {
      this.stats.update();
      this.labelRenderer.render(this.scene, this.camera.getCamera());
    }
  }

  public addControl<T extends object>(
    folderName: string,
    object: T,
    property: keyof T & string,
    min?: number,
    max?: number
  ): void {
    let folder = this.gui.folders.find((f) => f._title === folderName);
    if (!folder) {
      folder = this.gui.addFolder(folderName);
    }

    if (typeof min === 'number' && typeof max === 'number') {
      folder.add(object, property, min, max).name(property);
    } else {
      folder.add(object, property).name(property);
    }
  }
}
