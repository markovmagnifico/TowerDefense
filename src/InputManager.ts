export class InputManager {
  private static instance: InputManager;
  private keysPressed: Set<string> = new Set();
  private keyListeners: Map<string, Set<(pressed: boolean) => void>> = new Map();

  private constructor() {
    window.addEventListener('keydown', (event) => {
      this.keysPressed.add(event.key);
      this.notifyListeners(event.key, true);
    });

    window.addEventListener('keyup', (event) => {
      this.keysPressed.delete(event.key);
      this.notifyListeners(event.key, false);
    });
  }

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  public isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key) || this.keysPressed.has(key.toLowerCase());
  }

  public addKeyListener(key: string, callback: (pressed: boolean) => void): void {
    const listeners = this.keyListeners.get(key) || new Set();
    listeners.add(callback);
    this.keyListeners.set(key, listeners);
  }

  public removeKeyListener(key: string, callback: (pressed: boolean) => void): void {
    const listeners = this.keyListeners.get(key);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private notifyListeners(key: string, pressed: boolean): void {
    const listeners = this.keyListeners.get(key);
    if (listeners) {
      listeners.forEach((callback) => callback(pressed));
    }
  }
}
