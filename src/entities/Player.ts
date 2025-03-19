import * as THREE from 'three';
import { Config } from '../Config';
import { Entity } from './Entity';
import { InputState } from '../engine/InputState';
import { Interactable } from '../engine/Interactable';
import { HeightCallback } from '../level/TerrainGrid';
import { GridDimensions } from '../level/LevelTypes';
import { InteractionPriority } from '../engine/InteractionManager';

export class Player extends Entity implements Interactable {
  private bodyGroup: THREE.Group;
  private body!: THREE.Mesh;
  private rotors: THREE.Mesh[] = [];
  private rotorGroups: THREE.Group[] = [];
  public isSelected = false;
  public priority = InteractionPriority.WORLD;

  private targetPoint: THREE.Vector3 | null = null;
  private currentPath: THREE.CubicBezierCurve3 | null = null;
  private pathProgress = 0;
  private isMoving = false;
  public movementSpeed = Config.DRONE.MOVEMENT.HOVER_SPEED;
  public rotorSpeed = 7.0;
  private currentRotorTilt = 0;
  private currentBodyTilt = new THREE.Vector3();
  private targetBodyTilt = new THREE.Vector3();

  private debugTargetMarker!: THREE.Mesh;
  private debugPathLine!: THREE.Line;
  private debugEnabled = false;

  constructor(
    private scene: THREE.Scene,
    private getGroundHeight: HeightCallback,
    private dimensions: GridDimensions
  ) {
    super();
    this.bodyGroup = new THREE.Group();
    this.object3D.add(this.bodyGroup);
    this.createBody();
    this.createRotors();
    this.initializeDebugVisuals();
    this.object3D.position.y = Config.DRONE.MOVEMENT.HOVER_HEIGHT;
  }

  handleInput(input: InputState): void {
    if (input.isMouseButtonPressed(2)) {
      const worldPos = input.getWorldPosition();
      if (worldPos) {
        const groundHeight = this.getGroundHeight(worldPos.x, worldPos.z);
        worldPos.y = groundHeight + Config.DRONE.MOVEMENT.HOVER_HEIGHT;
        this.moveTo(worldPos);
      }
    }
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

  private findMaxTerrainHeight(start: THREE.Vector3, end: THREE.Vector3): number {
    const steps = 20; // Increased sampling resolution
    let maxHeight = -Infinity;

    // Sample along a wider corridor to catch nearby high points
    const normalizedDir = new THREE.Vector3().subVectors(end, start).normalize();
    const perpendicular = new THREE.Vector3(-normalizedDir.z, 0, normalizedDir.x);
    const corridorWidth = 1.0; // Width of sampling corridor

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const baseX = start.x + (end.x - start.x) * t;
      const baseZ = start.z + (end.z - start.z) * t;

      // Sample points in a cross pattern
      const offsets = [-corridorWidth, 0, corridorWidth];
      for (const offset of offsets) {
        const x = baseX + perpendicular.x * offset;
        const z = baseZ + perpendicular.z * offset;
        if (this.isValidPosition(new THREE.Vector3(x, 0, z))) {
          const height = this.getGroundHeight(x, z);
          maxHeight = Math.max(maxHeight, height);
        }
      }
    }

    return maxHeight;
  }

  private createCurvedPath(targetPoint: THREE.Vector3): THREE.CubicBezierCurve3 {
    const startPoint = this.object3D.position.clone();
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.object3D.quaternion);
    const toTarget = new THREE.Vector3().subVectors(targetPoint, startPoint).normalize();
    const distance = startPoint.distanceTo(targetPoint);
    const controlDist = distance * 0.5;

    // Create initial control points
    const control1 = startPoint.clone().add(forward.multiplyScalar(controlDist));
    const control2 = targetPoint.clone().sub(toTarget.multiplyScalar(controlDist));

    // Calculate path characteristics
    const maxTerrainHeight = this.findMaxTerrainHeight(startPoint, targetPoint);
    const pathHeight = Math.max(startPoint.y, targetPoint.y);
    const heightDiff = Math.abs(targetPoint.y - startPoint.y);

    // Determine if this should be a flat path
    const flatPathThreshold = Config.DRONE.MOVEMENT.HOVER_HEIGHT * 0.5; // More strict threshold
    const isHeightFlat = heightDiff < flatPathThreshold;
    const hasObstacles = maxTerrainHeight > Math.min(startPoint.y, targetPoint.y);
    const shouldBeFlatPath = isHeightFlat && !hasObstacles;

    // Base clearance and obstacle calculations
    const minClearance = Config.DRONE.MOVEMENT.HOVER_HEIGHT * 1.5;
    const obstacleHeight = Math.max(0, maxTerrainHeight - Math.min(startPoint.y, targetPoint.y));

    let clearance;
    if (shouldBeFlatPath) {
      // Minimal clearance for flat paths
      clearance = minClearance;
    } else if (hasObstacles) {
      // High clearance for obstacles
      const obstacleFactor = Math.min(obstacleHeight / distance, 1);
      clearance = distance * 0.3 + minClearance * (2 + obstacleFactor * 3);
    } else {
      // Moderate clearance for height changes
      clearance = minClearance * 2;
    }

    // Adjust control points based on path type
    if (shouldBeFlatPath) {
      // For flat paths, maintain the average height with minimal variation
      const avgHeight = (startPoint.y + targetPoint.y) / 2;
      control1.y = avgHeight;
      control2.y = avgHeight;
    } else if (hasObstacles) {
      // For paths with obstacles, create a higher arc
      const peakHeight = maxTerrainHeight + clearance;
      control1.y = (startPoint.y + peakHeight) * 0.6;
      control2.y = (targetPoint.y + peakHeight) * 0.6;

      // Pull control points inward for smoother arc
      control1.sub(startPoint).multiplyScalar(0.4).add(startPoint);
      control2.sub(targetPoint).multiplyScalar(0.4).add(targetPoint);
    } else {
      // For height changes without obstacles
      const isAscending = targetPoint.y > startPoint.y;
      if (isAscending) {
        control1.y = startPoint.y + clearance;
        control2.y = targetPoint.y + clearance * 0.3;
        control1.sub(startPoint).multiplyScalar(0.3).add(startPoint);
      } else {
        control1.y = startPoint.y + clearance * 0.3;
        control2.y = targetPoint.y + clearance;
        control2.sub(targetPoint).multiplyScalar(0.7).add(targetPoint);
      }
    }

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

      // Calculate pitch based on path direction
      const horizontalDist = Math.sqrt(tangent.x * tangent.x + tangent.z * tangent.z);
      const pitch = Math.atan2(-tangent.y, horizontalDist);
      const clampedPitch = THREE.MathUtils.clamp(
        pitch,
        -Config.DRONE.BODY.MAX_TILT_ANGLE / 2,
        Config.DRONE.BODY.MAX_TILT_ANGLE / 2
      );

      // Bank angle for turns
      const maxTiltAngle = Config.DRONE.BODY.MAX_TILT_ANGLE;
      const tiltFactor = this.movementSpeed / Config.DRONE.MOVEMENT.SPRINT_SPEED;
      const turnSharpness = Math.min(Math.abs(turnRate) * 15, 1);
      const bankAngle = -Math.sign(turnRate) * maxTiltAngle * turnSharpness * tiltFactor;

      this.targetBodyTilt.z = bankAngle;
      this.targetBodyTilt.x = clampedPitch;
    }

    const tiltSpeed = Config.DRONE.BODY.TILT_SPEED * deltaTime;
    this.currentBodyTilt.lerp(this.targetBodyTilt, tiltSpeed);
    this.bodyGroup.rotation.x = this.currentBodyTilt.x;
    this.bodyGroup.rotation.z = this.currentBodyTilt.z;
  }

  update(deltaTime: number): void {
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
      this.object3D.position.copy(newPos);

      if (this.pathProgress < 1) {
        const tangent = this.currentPath.getTangentAt(this.pathProgress);
        this.object3D.rotation.y = Math.atan2(tangent.x, tangent.z);
      }

      if (this.pathProgress >= 1) {
        this.isMoving = false;
        this.currentPath = null;
        this.targetPoint = null;
      }
      this.updateDebugVisuals();
    } else {
      // Update height even when not moving (for terrain that might change)
      const pos = this.object3D.position;
      const groundHeight = this.getGroundHeight(pos.x, pos.z);
      pos.y =
        groundHeight +
        Config.DRONE.MOVEMENT.HOVER_HEIGHT +
        Math.sin(performance.now() * Config.DRONE.MOVEMENT.HOVER_ANIM_SPEED) *
          Config.DRONE.MOVEMENT.HOVER_AMPLITUDE;
    }
  }

  moveTo(point: THREE.Vector3): void {
    if (!this.isValidPosition(point)) return;

    const groundHeight = this.getGroundHeight(point.x, point.z);
    point.y = groundHeight + Config.DRONE.MOVEMENT.HOVER_HEIGHT;
    this.targetPoint = point;
    this.currentPath = this.createCurvedPath(point);
    this.pathProgress = 0;
    this.isMoving = true;
    this.updateDebugVisuals();
  }

  setDebugEnabled(enabled: boolean): void {
    this.debugEnabled = enabled;
    this.updateDebugVisuals();
  }

  private initializeDebugVisuals(): void {
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
    this.scene.add(this.debugTargetMarker);

    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: Config.DEBUG.PATH_LINE.COLOR,
      transparent: true,
      opacity: Config.DEBUG.PATH_LINE.OPACITY,
    });
    this.debugPathLine = new THREE.Line(lineGeometry, lineMaterial);
    this.debugPathLine.visible = false;
    this.scene.add(this.debugPathLine);
  }

  private updateDebugVisuals(): void {
    if (!this.debugEnabled || !this.isMoving || !this.currentPath) {
      this.debugTargetMarker.visible = false;
      this.debugPathLine.visible = false;
      return;
    }

    if (this.targetPoint) {
      this.debugTargetMarker.position.copy(this.targetPoint);
      this.debugTargetMarker.position.y = 0.1;
      this.debugTargetMarker.visible = true;
    } else {
      this.debugTargetMarker.visible = false;
    }

    const points = this.currentPath.getPoints(50);
    this.debugPathLine.geometry.setFromPoints(points);
    this.debugPathLine.visible = true;
  }

  private isValidPosition(point: THREE.Vector3): boolean {
    return (
      point.x >= 0 &&
      point.x <= this.dimensions.width &&
      point.z >= 0 &&
      point.z <= this.dimensions.height
    );
  }
}
