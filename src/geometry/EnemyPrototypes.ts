import * as THREE from 'three';

export class EnemyPrototypes {
  private static createLabel(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;

    context.font = 'Bold 36px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText(text, 128, 44);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 0.25, 1);
    sprite.position.y = 1.2; // Position above the model

    return sprite;
  }

  static createCrystalline(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Crystalline'));

    // Main body - octahedron
    const bodyGeo = new THREE.OctahedronGeometry(0.5, 0);
    const bodyMat = new THREE.MeshPhongMaterial({
      color: 0x660022,
      flatShading: true,
      shininess: 50,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xff0000,
      emissiveIntensity: 0.8,
    });

    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(-0.2, 0.2, 0.3);
    eye2.position.set(0.2, 0.2, 0.3);
    group.add(eye1, eye2);

    return group;
  }

  static createTechno(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Techno'));

    // Core - wireframe cube
    const coreGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      wireframe: true,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Single cyclopean eye
    const eyeGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1,
    });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0, 0, 0.3);
    group.add(eye);

    return group;
  }

  static createSpiky(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Spiky'));

    // Core sphere
    const bodyGeo = new THREE.SphereGeometry(0.4, 4, 4);
    const bodyMat = new THREE.MeshPhongMaterial({
      color: 0x800000,
      flatShading: true,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Spikes
    const spikeGeo = new THREE.ConeGeometry(0.1, 0.3, 4);
    const spikeMat = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      flatShading: true,
    });

    // Add spikes in a circle
    for (let i = 0; i < 8; i++) {
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      const angle = (i / 8) * Math.PI * 2;
      spike.position.set(Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 0);
      spike.rotation.z = angle + Math.PI / 2;
      group.add(spike);
    }

    // Evil eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMat = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: 0xff0000,
      emissiveIntensity: 1,
    });

    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(-0.15, 0.15, 0.3);
    eye2.position.set(0.15, 0.15, 0.3);
    group.add(eye1, eye2);

    return group;
  }

  static createAlien(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Alien'));

    // Body made of torus
    const bodyGeo = new THREE.TorusGeometry(0.3, 0.15, 8, 16);
    const bodyMat = new THREE.MeshPhongMaterial({
      color: 0x4b0082,
      flatShading: true,
      shininess: 80,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Multiple small eyes
    const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x00ff00,
      emissiveIntensity: 0.8,
    });

    // Create a ring of eyes
    for (let i = 0; i < 6; i++) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      const angle = (i / 6) * Math.PI * 2;
      eye.position.set(Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, 0.2);
      group.add(eye);
    }

    return group;
  }

  static createKnight(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Knight'));

    // Body (torso)
    const torsoGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.6, 8);
    const armorMat = new THREE.MeshPhongMaterial({
      color: 0x808080,
      flatShading: true,
      shininess: 100,
    });
    const torso = new THREE.Mesh(torsoGeo, armorMat);
    torso.position.y = 0.3;
    group.add(torso);

    // Head with helmet
    const helmetGeo = new THREE.ConeGeometry(0.2, 0.3, 8);
    const helmet = new THREE.Mesh(helmetGeo, armorMat);
    helmet.position.set(0, 0.7, 0);
    group.add(helmet);

    // Visor (eyes)
    const visorGeo = new THREE.BoxGeometry(0.3, 0.05, 0.1);
    const visorMat = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: 0x666666,
      emissiveIntensity: 0.5,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.65, 0.1);
    group.add(visor);

    // Shield
    const shieldGeo = new THREE.BoxGeometry(0.3, 0.4, 0.05);
    const shield = new THREE.Mesh(shieldGeo, armorMat);
    shield.position.set(-0.3, 0.3, 0);
    group.add(shield);

    // Sword
    const swordGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08);
    const swordMat = new THREE.MeshPhongMaterial({
      color: 0xc0c0c0,
      shininess: 150,
    });
    const sword = new THREE.Mesh(swordGeo, swordMat);
    sword.position.set(0.3, 0.3, 0);
    group.add(sword);

    return group;
  }

  static createDragon(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Dragon'));

    // Body
    const bodyGeo = new THREE.ConeGeometry(0.3, 0.8, 4);
    const bodyMat = new THREE.MeshPhongMaterial({
      color: 0x228b22,
      flatShading: true,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = -Math.PI / 2;
    body.position.z = -0.2;
    group.add(body);

    // Head
    const headGeo = new THREE.TetrahedronGeometry(0.25);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 0.2, 0.3);
    head.rotation.x = 0.5;
    group.add(head);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMat = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0xff4500,
      emissiveIntensity: 0.5,
    });

    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(-0.1, 0.2, 0.4);
    eye2.position.set(0.1, 0.2, 0.4);
    group.add(eye1, eye2);

    // Wings
    const wingGeo = new THREE.ConeGeometry(0.3, 0.6, 3);
    const wing1 = new THREE.Mesh(wingGeo, bodyMat);
    const wing2 = new THREE.Mesh(wingGeo, bodyMat);

    wing1.rotation.z = Math.PI / 2;
    wing2.rotation.z = -Math.PI / 2;
    wing1.position.set(-0.3, 0.1, -0.2);
    wing2.position.set(0.3, 0.1, -0.2);

    group.add(wing1, wing2);

    return group;
  }

  static createWizard(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Wizard'));

    // Create materials we'll reuse
    const robeMat = new THREE.MeshPhongMaterial({
      color: 0x4b0082,
      flatShading: true,
    });

    // Create staff group first - this keeps the staff and orb together
    const staffGroup = new THREE.Group();

    const staffGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8);
    const staffMat = new THREE.MeshPhongMaterial({
      color: 0x8b4513,
    });
    const staff = new THREE.Mesh(staffGeo, staffMat);
    // Center the staff at origin, we'll position the group later
    staff.position.y = 0.4; // Move up so bottom aligns with wizard base

    const orbGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const orbMat = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 0.8; // Position at top of staff

    staffGroup.add(staff, orb);
    staffGroup.position.x = 0.2; // Moved inward from 0.25
    staffGroup.rotation.z = -0.2;

    // Robe (body)
    const robeGeo = new THREE.ConeGeometry(0.3, 0.8, 8);
    const robe = new THREE.Mesh(robeGeo, robeMat);

    // Head (sphere instead of hidden in robe)
    const headGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const head = new THREE.Mesh(headGeo, robeMat);
    head.position.y = 0.4; // Position above robe

    // Hat
    const hatGeo = new THREE.ConeGeometry(0.2, 0.4, 8);
    const hat = new THREE.Mesh(hatGeo, robeMat);
    hat.position.y = 0.6; // Position above head

    // Face (glowing eyes) - positioned relative to head
    const eyeGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const eyeMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffff00,
      emissiveIntensity: 0.8,
    });

    const eyeGroup = new THREE.Group();
    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(-0.06, -0.02, 0.12); // Moved down slightly
    eye2.position.set(0.06, -0.02, 0.12);
    eyeGroup.add(eye1, eye2);
    eyeGroup.position.y = 0.4;

    // Add everything to main group
    group.add(robe, head, hat, eyeGroup, staffGroup);

    return group;
  }

  static createGolem(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Golem'));

    // Create materials
    const stoneMat = new THREE.MeshPhongMaterial({
      color: 0x707070,
      flatShading: true,
      shininess: 0,
    });

    // Body - multiple cubes for blocky look
    const bodyGroup = new THREE.Group();

    // Main torso
    const torsoGeo = new THREE.BoxGeometry(0.4, 0.5, 0.3);
    const torso = new THREE.Mesh(torsoGeo, stoneMat);
    bodyGroup.add(torso);

    // Shoulders - slightly darker
    const shoulderMat = stoneMat.clone();
    shoulderMat.color.offsetHSL(0, 0, -0.1);
    const shoulderGeo = new THREE.BoxGeometry(0.5, 0.2, 0.2);
    const shoulders = new THREE.Mesh(shoulderGeo, shoulderMat);
    shoulders.position.y = 0.2;
    bodyGroup.add(shoulders);

    // Head - angular and geometric
    const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const head = new THREE.Mesh(headGeo, stoneMat);
    head.position.y = 0.4;

    // Glowing runes (small cubes) on body
    const runeGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const runeMat = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5,
    });

    [-0.1, 0.1].forEach((x) => {
      const rune = new THREE.Mesh(runeGeo, runeMat);
      rune.position.set(x, 0, 0.16);
      torso.add(rune);
    });

    // Eyes - geometric slits
    const eyeGeo = new THREE.BoxGeometry(0.08, 0.03, 0.05);
    const eyeMat = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 1,
    });

    const eyeGroup = new THREE.Group();
    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(-0.08, 0, 0.15);
    eye2.position.set(0.08, 0, 0.15);
    eyeGroup.add(eye1, eye2);
    eyeGroup.position.y = 0.4;

    group.add(bodyGroup, head, eyeGroup);
    return group;
  }

  static createSpecter(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Specter'));

    // Create ghostly material
    const ghostMat = new THREE.MeshPhongMaterial({
      color: 0x3333ff,
      transparent: true,
      opacity: 0.5,
      flatShading: true,
    });

    // Main body - elongated cone for ghostly shape
    const bodyGeo = new THREE.ConeGeometry(0.3, 0.8, 8);
    const body = new THREE.Mesh(bodyGeo, ghostMat);

    // Wispy top - smaller cone
    const topGeo = new THREE.ConeGeometry(0.15, 0.3, 8);
    const top = new THREE.Mesh(topGeo, ghostMat);
    top.position.y = 0.5;

    // Eyes - more ethereal and glowing
    const eyeGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const eyeMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x0000ff,
      emissiveIntensity: 1,
    });

    const eyeGroup = new THREE.Group();
    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(-0.08, 0.2, 0.15);
    eye2.position.set(0.08, 0.2, 0.15);
    eyeGroup.add(eye1, eye2);

    group.add(body, top, eyeGroup);
    return group;
  }

  static createConstructor(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Constructor'));

    // Base material
    const metalMat = new THREE.MeshPhongMaterial({
      color: 0xb87333, // Bronze color
      flatShading: true,
      shininess: 60,
    });

    // Core mechanism - rotating gears
    const coreGroup = new THREE.Group();

    // Main gear
    const gearGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 8);
    const gear = new THREE.Mesh(gearGeo, metalMat);
    gear.rotation.x = Math.PI / 2;

    // Gear teeth
    const toothGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    for (let i = 0; i < 8; i++) {
      const tooth = new THREE.Mesh(toothGeo, metalMat);
      const angle = (i / 8) * Math.PI * 2;
      tooth.position.set(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0);
      gear.add(tooth);
    }

    coreGroup.add(gear);

    // Floating construction tools
    const toolGroup = new THREE.Group();

    // Hammer head
    const hammerGeo = new THREE.BoxGeometry(0.2, 0.15, 0.1);
    const hammer = new THREE.Mesh(hammerGeo, metalMat);
    hammer.position.set(0.3, 0.2, 0);

    // Wrench
    const wrenchGeo = new THREE.TorusGeometry(0.15, 0.03, 8, 8, Math.PI);
    const wrench = new THREE.Mesh(wrenchGeo, metalMat);
    wrench.position.set(-0.3, 0.2, 0);

    toolGroup.add(hammer, wrench);

    // Energy core
    const coreGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0xffa500,
      emissive: 0xffa500,
      emissiveIntensity: 0.5,
    });
    const energyCore = new THREE.Mesh(coreGeo, coreMat);

    group.add(coreGroup, toolGroup, energyCore);
    return group;
  }

  static createSlimePurple(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Purple Slime'));

    // Main body with more purple hue
    const bodyGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x9370db,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5,
      transparent: true,
      opacity: 0.6,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.y = 0.7;

    // Bubbles inside
    const bubbleGroup = new THREE.Group();
    const bubbleMat = new THREE.MeshPhongMaterial({
      color: 0xb19cd9,
      transparent: true,
      opacity: 0.5,
    });

    // Create more bubbles for this variation
    for (let i = 0; i < 8; i++) {
      const size = 0.03 + Math.random() * 0.08;
      const bubbleGeo = new THREE.SphereGeometry(size, 8, 8);
      const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
      bubble.position.set(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.4
      );
      // Store original position for animation
      (bubble as any).originalY = bubble.position.y;
      (bubble as any).floatOffset = Math.random() * Math.PI * 2;
      bubbleGroup.add(bubble);
    }

    // Eyes with bubble effect
    const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMat = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.5,
      thickness: 0.5,
    });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.15, 0.1, 0.3);
    rightEye.position.set(0.15, 0.1, 0.3);

    // Add animation properties
    (body as any).originalScale = body.scale.clone();
    (group as any).time = 0;
    (group as any).update = (deltaTime: number) => {
      (group as any).time += deltaTime;
      const t = (group as any).time;

      // Pulsing body animation
      const pulseScale = Math.sin(t * 2) * 0.1 + 1;
      body.scale.x = (body as any).originalScale.x * pulseScale;
      body.scale.z = (body as any).originalScale.z * pulseScale;
      body.scale.y = (body as any).originalScale.y * (2 - pulseScale);

      // Floating bubbles animation
      bubbleGroup.children.forEach((bubble: THREE.Mesh, i) => {
        const floatSpeed = 1 + (i % 3) * 0.2;
        bubble.position.y =
          (bubble as any).originalY + Math.sin(t * floatSpeed + (bubble as any).floatOffset) * 0.1;
      });

      // Subtle eye movement
      const eyeOffset = Math.sin(t * 3) * 0.02;
      leftEye.position.y = 0.1 + eyeOffset;
      rightEye.position.y = 0.1 + eyeOffset;
    };

    group.add(body, bubbleGroup, leftEye, rightEye);
    return group;
  }

  static createSlimeGreen(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createLabel('Green Slime'));

    // Main body with green hue
    const bodyGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x50c878,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5,
      transparent: true,
      opacity: 0.6,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.y = 0.7;

    // Core sphere
    const coreGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x2e8b57,
      transparent: true,
      opacity: 0.7,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);

    // Eyes with bubble effect
    const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMat = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.5,
      thickness: 0.5,
    });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.15, 0.1, 0.3);
    rightEye.position.set(0.15, 0.1, 0.3);

    // Add animation properties
    (body as any).originalScale = body.scale.clone();
    (group as any).time = 0;
    (group as any).update = (deltaTime: number) => {
      (group as any).time += deltaTime;
      const t = (group as any).time;

      // Wobble animation
      const wobbleX = Math.sin(t * 3) * 0.2;
      const wobbleZ = Math.cos(t * 2) * 0.2;
      body.rotation.x = wobbleX;
      body.rotation.z = wobbleZ;

      // Stretching animation
      const stretchY = Math.sin(t * 4) * 0.2 + 1;
      const squashXZ = 1 / Math.sqrt(stretchY); // Preserve volume
      body.scale.set(
        (body as any).originalScale.x * squashXZ,
        (body as any).originalScale.y * stretchY,
        (body as any).originalScale.z * squashXZ
      );

      // Core rotation
      core.rotation.y += deltaTime * 2;
      core.rotation.x = Math.sin(t) * 0.3;

      // Eye squash based on body stretch
      const eyeSquash = 1 / stretchY;
      leftEye.scale.set(1, eyeSquash, 1);
      rightEye.scale.set(1, eyeSquash, 1);
    };

    group.add(body, core, leftEye, rightEye);
    return group;
  }
}
