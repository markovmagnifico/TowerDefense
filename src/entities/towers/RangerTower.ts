import * as THREE from 'three';
import { Tower } from './Tower';

export class RangerTower extends Tower {
  createGeometry(): THREE.Group {
    const group = new THREE.Group();

    // Materials
    const woodMat = new THREE.MeshPhongMaterial({
      color: 0x8b4513,
      flatShading: true,
    });

    // Main platform
    const platformGeo = new THREE.BoxGeometry(0.9, 0.1, 0.9);
    const platform = new THREE.Mesh(platformGeo, woodMat);
    platform.position.y = 1;
    group.add(platform);

    // Support posts
    const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6);
    const angleOffset = 0.1;
    for (let x of [-0.3, 0.3]) {
      for (let z of [-0.3, 0.3]) {
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(x, 0.7, z);
        // Angle posts slightly outward
        post.rotation.x = (z > 0 ? -1 : 1) * angleOffset;
        post.rotation.z = (x > 0 ? 1 : -1) * angleOffset;
        group.add(post);
      }
    }

    // Cross braces for stability
    const braceGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 6);
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
      const brace = new THREE.Mesh(braceGeo, woodMat);
      brace.position.y = 0.4;
      brace.rotation.z = Math.PI / 4;
      brace.rotation.y = angle;
      brace.position.x = Math.sin(angle) * 0.3;
      brace.position.z = Math.cos(angle) * 0.3;
      group.add(brace);
    }

    // Railing
    const railingGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const rail = new THREE.Mesh(railingGeo, woodMat);
      rail.position.y = 1.15;
      rail.position.x = Math.sin(angle) * 0.4;
      rail.position.z = Math.cos(angle) * 0.4;
      group.add(rail);
    }

    // Top railing connector
    const topRailGeo = new THREE.TorusGeometry(0.4, 0.02, 8, 16);
    const topRail = new THREE.Mesh(topRailGeo, woodMat);
    topRail.position.y = 1.3;
    topRail.rotation.x = Math.PI / 2;
    group.add(topRail);

    return group;
  }
}
