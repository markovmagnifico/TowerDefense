import * as THREE from 'three';
import { Config } from './Config';

export class Player {
  private mesh: THREE.Group;
  private bodyGroup: THREE.Group;
  private body!: THREE.Mesh;
  private rotors: THREE.Mesh[];
  private rotorGroups: THREE.Group[];

  private targetPoint: THREE.Vector3 | null = null;
  private currentPath: THREE.CubicBezierCurve3 | null = null;
  private pathProgress: number = 0;
  private isMoving: boolean = false;
  private movementSpeed: number = Config.DRONE.MOVEMENT.HOVER_SPEED;
  private rotorSpeed: number = 7.0;
  private currentRotorTilt: number = 0;
  private currentBodyTilt: THREE.Vector3 = new THREE.Vector3();
  private targetBodyTilt: THREE.Vector3 = new THREE.Vector3();

  private debugTargetMarker: THREE.Mesh | null = null;
  private debugPathLine: THREE.Line | null = null;
  private debugEnabled: boolean = false;

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.rotors = [];
    this.rotorGroups = [];

    this.mesh.add(this.bodyGroup);
    this.createBody();
    this.createRotors();
    this.initializeDebugVisuals(scene);
    this.mesh.position.y = Config.DRONE.MOVEMENT.HOVER_HEIGHT;
  }

  private createBody(): void {
    const bodyGeometry = new THREE.OctahedronGeometry(Config.DRONE.BODY.SIZE);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: Config.DRONE.BODY.COLOR,
      shininess: 100,
      flatShading: true,
    });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.scale.y = Config.DRONE.BODY.HEIGHT_SCALE;
    this.bodyGroup.add(this.body);
  }

  private createRotorCross(): THREE.Mesh {
    const crossGeometry = new THREE.BoxGeometry(
      Config.DRONE.ROTOR.CROSS.LENGTH,
      Config.DRONE.ROTOR.CROSS.WIDTH,
      0.001
    );
    const crossMaterial = new THREE.MeshPhongMaterial({
      color: Config.DRONE.ROTOR.CROSS.COLOR,
      shininess: 100,
      flatShading: true,
    });
    return new THREE.Mesh(crossGeometry, crossMaterial);
  }

  private createRotors(): void {
    const rotorGeometry = new THREE.TorusGeometry(
      Config.DRONE.ROTOR.RADIUS,
      Config.DRONE.ROTOR.THICKNESS,
      8,
      16
    );
    const rotorMaterial = new THREE.MeshPhongMaterial({
      color: Config.DRONE.ROTOR.COLOR,
      shininess: 100,
      flatShading: true,
    });

    const rotorConfigs = [
      { pos: new THREE.Vector3(1, 0, 1), rotation: Math.PI / 4 },
      { pos: new THREE.Vector3(-1, 0, 1), rotation: -Math.PI / 4 },
      { pos: new THREE.Vector3(1, 0, -1), rotation: -Math.PI / 4 },
      { pos: new THREE.Vector3(-1, 0, -1), rotation: Math.PI / 4 },
    ];

    rotorConfigs.forEach((config) => {
      const rotorGroup = new THREE.Group();
      rotorGroup.position.copy(config.pos.multiplyScalar(Config.DRONE.ROTOR.OFFSET));

      const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
      rotor.rotation.x = Math.PI / 2;

      const cross1 = this.createRotorCross();
      const cross2 = this.createRotorCross();
      cross1.rotation.z = Math.PI / 4;
      cross2.rotation.z = -Math.PI / 4;
      cross1.position.z = 0.001;
      cross2.position.z = 0.001;
      rotor.add(cross1, cross2);

      rotorGroup.add(rotor);
      rotorGroup.rotation.y = config.rotation;

      this.rotors.push(rotor);
      this.rotorGroups.push(rotorGroup);
      this.bodyGroup.add(rotorGroup);
    });
  }

  private createCurvedPath(targetPoint: THREE.Vector3): THREE.CubicBezierCurve3 {
    const startPoint = this.mesh.position.clone();
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
    const toTarget = new THREE.Vector3().subVectors(targetPoint, startPoint).normalize();
    const distance = startPoint.distanceTo(targetPoint);
    const controlDist = distance * 0.5;

    const control1 = startPoint.clone().add(forward.multiplyScalar(controlDist));
    const control2 = targetPoint.clone().sub(toTarget.multiplyScalar(controlDist));

    return new THREE.CubicBezierCurve3(startPoint, control1, control2, targetPoint);
  }

  private updateRotorTilt(deltaTime: number): void {
    const targetTilt = this.isMoving ? Config.DRONE.ROTOR.TILT_ANGLE : 0;
    const tiltDiff = targetTilt - this.currentRotorTilt;

    if (Math.abs(tiltDiff) > 0.001) {
      const tiltDelta = tiltDiff * Math.min(deltaTime * Config.DRONE.ROTOR.TILT_SPEED, 1);
      this.currentRotorTilt += tiltDelta;
      this.rotorGroups.forEach((group) => (group.rotation.x = this.currentRotorTilt));
    }
  }

  private updateMovementSpeed(deltaTime: number): void {
    if (this.isMoving) {
      const speedDiff = Config.DRONE.MOVEMENT.SPRINT_SPEED - this.movementSpeed;
      if (speedDiff > 0) {
        this.movementSpeed +=
          speedDiff * Math.min(deltaTime * Config.DRONE.MOVEMENT.ACCELERATION, 1);
      }
    } else {
      const speedDiff = Config.DRONE.MOVEMENT.HOVER_SPEED - this.movementSpeed;
      this.movementSpeed +=
        speedDiff * Math.min(deltaTime * Config.DRONE.MOVEMENT.ACCELERATION * 2, 1);
    }
  }

  private updateBodyTilt(deltaTime: number): void {
    if (!this.currentPath || !this.isMoving) {
      this.targetBodyTilt.set(0, 0, 0);
    } else {
      const tangent = this.currentPath.getTangentAt(this.pathProgress);
      const nextTangent = this.currentPath.getTangentAt(Math.min(this.pathProgress + 0.05, 1));
      const turnRate = new THREE.Vector3().crossVectors(tangent, nextTangent).y;

      const maxTiltAngle = Config.DRONE.BODY.MAX_TILT_ANGLE;
      const tiltFactor = this.movementSpeed / Config.DRONE.MOVEMENT.SPRINT_SPEED;
      const turnSharpness = Math.min(Math.abs(turnRate) * 15, 1);
      const bankAngle = -Math.sign(turnRate) * maxTiltAngle * turnSharpness * tiltFactor;

      this.targetBodyTilt.z = bankAngle;
      const forwardTilt =
        (this.movementSpeed / Config.DRONE.MOVEMENT.SPRINT_SPEED) * maxTiltAngle * 0.5;
      this.targetBodyTilt.x = forwardTilt * (1 - Math.abs(turnSharpness) * 0.3);
    }

    const tiltSpeed = Config.DRONE.BODY.TILT_SPEED * deltaTime;
    this.currentBodyTilt.lerp(this.targetBodyTilt, tiltSpeed);
    this.bodyGroup.rotation.x = this.currentBodyTilt.x;
    this.bodyGroup.rotation.z = this.currentBodyTilt.z;
  }

  public update(deltaTime: number): void {
    this.rotors.forEach((rotor, index) => {
      rotor.rotation.z += this.rotorSpeed * deltaTime * (index % 2 ? 1 : -1);
    });

    this.updateRotorTilt(deltaTime);
    this.updateMovementSpeed(deltaTime);
    this.updateBodyTilt(deltaTime);

    if (this.isMoving && this.currentPath) {
      const movement = (this.movementSpeed * deltaTime) / this.currentPath.getLength();
      this.pathProgress = Math.min(this.pathProgress + movement, 1);

      const newPos = this.currentPath.getPointAt(this.pathProgress);
      this.mesh.position.copy(newPos);

      if (this.pathProgress < 1) {
        const tangent = this.currentPath.getTangentAt(this.pathProgress);
        this.mesh.rotation.y = Math.atan2(tangent.x, tangent.z);
      }

      if (this.pathProgress >= 1) {
        this.isMoving = false;
        this.currentPath = null;
        this.targetPoint = null;
      }
      this.updateDebugVisuals();
    }

    const hoverDelta = Math.sin(performance.now() * Config.DRONE.MOVEMENT.HOVER_ANIM_SPEED);
    this.mesh.position.y =
      Config.DRONE.MOVEMENT.HOVER_HEIGHT + hoverDelta * Config.DRONE.MOVEMENT.HOVER_AMPLITUDE;
  }

  public getMesh(): THREE.Group {
    return this.mesh;
  }

  public setPosition(x: number, z: number): void {
    this.mesh.position.x = x;
    this.mesh.position.z = z;
  }

  public moveTo(point: THREE.Vector3): void {
    point.y = this.mesh.position.y;
    this.targetPoint = point;
    this.currentPath = this.createCurvedPath(point);
    this.pathProgress = 0;
    this.isMoving = true;
    this.updateDebugVisuals();
  }

  public setDebugEnabled(enabled: boolean): void {
    this.debugEnabled = enabled;
    this.updateDebugVisuals();
  }

  public static isValidPosition(point: THREE.Vector3): boolean {
    return (
      point.x >= 0 && point.x <= Config.BOARD_SIZE && point.z >= 0 && point.z <= Config.BOARD_SIZE
    );
  }

  private initializeDebugVisuals(scene: THREE.Scene): void {
    const markerGeometry = new THREE.RingGeometry(
      Config.DEBUG.TARGET_MARKER.INNER_RADIUS,
      Config.DEBUG.TARGET_MARKER.OUTER_RADIUS,
      16
    );
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: Config.DEBUG.TARGET_MARKER.COLOR,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: Config.DEBUG.TARGET_MARKER.OPACITY,
    });
    this.debugTargetMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    this.debugTargetMarker.rotation.x = -Math.PI / 2;
    this.debugTargetMarker.visible = false;
    scene.add(this.debugTargetMarker);

    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: Config.DEBUG.PATH_LINE.COLOR,
      transparent: true,
      opacity: Config.DEBUG.PATH_LINE.OPACITY,
    });
    this.debugPathLine = new THREE.Line(lineGeometry, lineMaterial);
    this.debugPathLine.visible = false;
    scene.add(this.debugPathLine);
  }

  private updateDebugVisuals(): void {
    if (!this.debugEnabled || !this.isMoving || !this.currentPath) {
      if (this.debugTargetMarker) this.debugTargetMarker.visible = false;
      if (this.debugPathLine) this.debugPathLine.visible = false;
      return;
    }

    if (this.debugTargetMarker && this.targetPoint) {
      this.debugTargetMarker.position.copy(this.targetPoint);
      this.debugTargetMarker.visible = true;
    }

    if (this.debugPathLine) {
      const points = this.currentPath.getPoints(50);
      this.debugPathLine.geometry.setFromPoints(points);
      this.debugPathLine.visible = true;
    }
  }
}
