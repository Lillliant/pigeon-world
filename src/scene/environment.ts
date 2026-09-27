import * as THREE from 'three';
import { getTerrainHeight, getTerrainNormal } from './terrain';
import { SceneryType } from '../types';
import {
  FOREST_TREES,
  FOREST_BOULDERS,
  BEACH_PALMS,
  BEACH_UMBRELLAS,
  FOUNTAIN_BENCHES,
  FOUNTAIN_CYPRESSES,
} from './obstacles';

export interface Cloud {
  group: THREE.Group;
  speed: number;
  initialY: number;
  bobOffset: number;
}

export interface EnvironmentResult {
  group: THREE.Group;
  clouds: Cloud[];
  windParticles: THREE.Points;
  update: (delta: number, time: number) => void;
  setScenery: (scenery: SceneryType) => void;
  dispose?: () => void;
}

/**
 * Creates soft, pure white, fluffy & airy translucent cumulus clouds.
 * Uses pure white color with white emissive so clouds never turn muddy gray in shadows or fog!
 */
function createCloudMesh(): THREE.Group {
  const cloudGroup = new THREE.Group();

  // Translucent luminous white material: stays bright white, fluffy and airy!
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.38, // Prevents cloud from darkening to gray
    roughness: 0.15,
    metalness: 0.0,
    transparent: true,
    opacity: 0.44,
    depthWrite: false, // Ensures smooth, ethereal blending without hard dark edges
    side: THREE.FrontSide, // FrontSide avoids internal dark overlap shadows
  });

  const puffGeom = new THREE.SphereGeometry(1, 16, 12);

  // 1. Horizontal elongated cloud foundation (3 to 4 billowy ellipsoids)
  const baseCount = 3 + Math.floor(Math.random() * 2);
  for (let i = 0; i < baseCount; i++) {
    const puff = new THREE.Mesh(puffGeom, cloudMaterial);
    const rx = 2.4 + Math.random() * 1.5;
    const ry = 0.9 + Math.random() * 0.4;
    const rz = 1.8 + Math.random() * 0.9;
    puff.scale.set(rx, ry, rz);
    puff.position.set(
      (i - (baseCount - 1) / 2) * 2.2 + (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.25,
      (Math.random() - 0.5) * 0.8
    );
    cloudGroup.add(puff);
  }

  // 2. Soft, airy upper billow domes
  const domeCount = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < domeCount; i++) {
    const dome = new THREE.Mesh(puffGeom, cloudMaterial);
    const s = 1.3 + Math.random() * 1.3;
    dome.scale.set(s * 1.15, s * 0.75, s * 1.05);
    dome.position.set(
      (Math.random() - 0.5) * 3.6,
      0.45 + Math.random() * 0.65,
      (Math.random() - 0.5) * 1.8
    );
    cloudGroup.add(dome);
  }

  // 3. Delicate outer wisps for extra fluffiness
  for (let w = 0; w < 2; w++) {
    const wisp = new THREE.Mesh(puffGeom, cloudMaterial);
    const s = 0.9 + Math.random() * 0.5;
    wisp.scale.set(s * 1.4, s * 0.5, s * 1.2);
    wisp.position.set((Math.random() - 0.5) * 5.0, -0.1 + Math.random() * 0.3, (Math.random() - 0.5) * 2.2);
    cloudGroup.add(wisp);
  }

  return cloudGroup;
}

/**
 * Creates retro pixel-faceted trees (Soft Pastel Conifer or Pastel Meadow Oak)
 */
function createPixelTree(isConifer: boolean): THREE.Group {
  const treeGroup = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x78533c,
    roughness: 0.85,
    metalness: 0.02,
    flatShading: true,
  });

  if (isConifer) {
    // Stepped faceted pyramidal conifer (pixel/voxel RPG style)
    // Trunk height 2.8, position y = 0.7 so base is at y = -0.7 (sunk deep into ground!)
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 2.8, 6), trunkMat);
    trunk.position.y = 0.7;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Soft pastel conifer needles (dreamy mint/sage)
    const needleColors = [0x78c691, 0x8ad4a0, 0x6bbd85, 0x86efac];
    const chosenColor = needleColors[Math.floor(Math.random() * needleColors.length)];
    const foliageMat = new THREE.MeshStandardMaterial({
      color: chosenColor,
      roughness: 0.8,
      flatShading: true,
    });

    // 4 stepped faceted tiers
    const tierCount = 4;
    for (let t = 0; t < tierCount; t++) {
      const radius = 1.95 - t * 0.36;
      const height = 1.45 - t * 0.1;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 6), foliageMat);
      cone.position.y = 1.5 + t * 0.85;
      cone.rotation.y = (t * Math.PI) / 6;
      cone.castShadow = true;
      cone.receiveShadow = true;
      treeGroup.add(cone);
    }
  } else {
    // Deciduous Oak: Faceted trunk and stepped blocky canopy puffs in soft pastel mint/pistachio
    // Trunk height 3.4, position y = 0.9
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.46, 3.4, 6), trunkMat);
    trunk.position.y = 0.9;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.2, 5), trunkMat);
    b1.position.set(0.3, 2.0, 0.1);
    b1.rotation.z = -0.52;
    treeGroup.add(b1);

    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 1.1, 5), trunkMat);
    b2.position.set(-0.28, 2.1, -0.1);
    b2.rotation.z = 0.48;
    treeGroup.add(b2);

    // Pastel canopy puffs (soft mint, spring pistachio, light celery)
    const oakPastelColors = [0x86efac, 0xa7f3d0, 0x93e8b0, 0xbbf7d0, 0x76d697];
    const puffCount = 6;
    const boxPuffGeom = new THREE.DodecahedronGeometry(1.15, 0); // Faceted low-poly puff!

    for (let p = 0; p < puffCount; p++) {
      const foliageMat = new THREE.MeshStandardMaterial({
        color: oakPastelColors[p % oakPastelColors.length],
        roughness: 0.8,
        flatShading: true,
      });
      const puff = new THREE.Mesh(boxPuffGeom, foliageMat);
      const s = 1.0 + Math.random() * 0.35;
      puff.scale.set(s * 1.1, s * 0.9, s * 1.05);

      const angle = (p / puffCount) * Math.PI * 2;
      const r = p === 0 ? 0 : 0.8 + Math.random() * 0.35;
      puff.position.set(
        Math.cos(angle) * r,
        2.9 + (p === 0 ? 0.65 : (Math.random() - 0.5) * 0.4),
        Math.sin(angle) * r
      );
      puff.rotation.set(Math.random(), Math.random(), Math.random());
      puff.castShadow = true;
      puff.receiveShadow = true;
      treeGroup.add(puff);
    }
  }

  const s = 1.1 + Math.random() * 0.35;
  treeGroup.scale.set(s, s, s);
  return treeGroup;
}

/**
 * Creates pixel-style faceted grass tufts in soft pastel meadow green
 */
function createPixelGrassTuft(): THREE.Group {
  const tuft = new THREE.Group();

  const grassPastels = [0x86efac, 0xa7f3d0, 0x6ee7b7, 0x98e6b1];
  const chosenColor = grassPastels[Math.floor(Math.random() * grassPastels.length)];
  const grassMat = new THREE.MeshStandardMaterial({
    color: chosenColor,
    roughness: 0.75,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const bladeCount = 5 + Math.floor(Math.random() * 3);
  for (let i = 0; i < bladeCount; i++) {
    const angle = (i / bladeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const height = 0.42 + Math.random() * 0.32;

    const bladeGeom = new THREE.ConeGeometry(0.045, height, 4);
    bladeGeom.translate(0, height / 2, 0);
    const blade = new THREE.Mesh(bladeGeom, grassMat);

    blade.rotation.y = angle;
    blade.rotation.z = 0.22 + Math.random() * 0.22;
    blade.castShadow = true;
    tuft.add(blade);
  }

  const s = 0.75 + Math.random() * 0.45;
  tuft.scale.set(s, s, s);
  return tuft;
}

/**
 * Creates pixel-like low-poly wildflower
 */
function createPixelWildflower(): THREE.Group {
  const flower = new THREE.Group();
  const petalColors = [0xffffff, 0xfef08a, 0xfbcfe8, 0xbfdbfe, 0xfde047, 0xf472b6, 0xe9d5ff];
  const chosen = petalColors[Math.floor(Math.random() * petalColors.length)];

  const petalMat = new THREE.MeshStandardMaterial({ color: chosen, roughness: 0.65, flatShading: true });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, flatShading: true });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.8, flatShading: true });

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.35, 5), stemMat);
  stem.position.y = 0.175;
  stem.castShadow = true;
  flower.add(stem);

  const center = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), centerMat);
  center.position.y = 0.35;
  flower.add(center);

  // 4 or 5 cute blocky pixel petals
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.09), petalMat);
    petal.position.set(Math.cos(angle) * 0.1, 0.34, Math.sin(angle) * 0.1);
    petal.rotation.y = -angle;
    petal.castShadow = true;
    flower.add(petal);
  }

  const scale = 0.85 + Math.random() * 0.4;
  flower.scale.set(scale, scale, scale);
  return flower;
}

/**
 * Creates cute pixel mushroom cluster
 */
function createPixelMushroomCluster(): THREE.Group {
  const cluster = new THREE.Group();
  const capMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6, flatShading: true });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8, flatShading: true });
  const dotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, flatShading: true });

  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const mush = new THREE.Group();
    const h = 0.22 + Math.random() * 0.18;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, h, 6), stemMat);
    stem.position.y = h / 2;
    mush.add(stem);

    const capR = 0.14 + Math.random() * 0.08;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(capR, capR * 1.1, 6), capMat);
    cap.position.y = h + capR * 0.4;
    mush.add(cap);

    // Cute white pixel dot on cap
    const dot = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), dotMat);
    dot.position.set(0, h + capR * 0.7, capR * 0.4);
    mush.add(dot);

    mush.position.set((i - 0.5) * 0.28, 0, (Math.random() - 0.5) * 0.2);
    cluster.add(mush);
  }

  return cluster;
}

/**
 * Creates cute low-poly pixel boulder / stone
 */
function createPixelBoulder(): THREE.Mesh {
  const geom = new THREE.DodecahedronGeometry(0.45 + Math.random() * 0.35, 0);
  geom.scale(1.2, 0.65, 0.9);
  geom.translate(0, -0.15, 0); // Nestles safely into the ground
  const mat = new THREE.MeshStandardMaterial({
    color: Math.random() > 0.5 ? 0x94a3b8 : 0xa1a1aa,
    roughness: 0.9,
    flatShading: true,
  });
  const boulder = new THREE.Mesh(geom, mat);
  boulder.castShadow = true;
  boulder.receiveShadow = true;
  boulder.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  return boulder;
}

/**
 * Creates authentic pixel-art / voxel tropical Palm Tree WITH COCONUTS!
 * Segmented curved trunk with distinct rings, stepped tiered fronds, and brown coconuts.
 */
function createPixelPalmTree(): THREE.Group {
  const palm = new THREE.Group();

  const trunkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x925b34,
    roughness: 0.85,
    metalness: 0.02,
    flatShading: true,
  });

  const trunkRingMat = new THREE.MeshStandardMaterial({
    color: 0x714323,
    roughness: 0.85,
    flatShading: true,
  });

  const frondMat1 = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.75,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const frondMat2 = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    roughness: 0.75,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const coconutMat = new THREE.MeshStandardMaterial({
    color: 0x603813, // rich warm brown coconut
    roughness: 0.72,
    metalness: 0.02,
    flatShading: true,
  });

  // 1. Curved Segmented Palm Trunk with Rings (Pixel-style stacked blocky segments)
  const segmentCount = 9;
  const height = 4.2 + Math.random() * 1.0;
  const leanAngle = Math.random() * Math.PI * 2;
  const leanAmount = 0.75 + Math.random() * 0.45;

  let currentPos = new THREE.Vector3(0, -0.6, 0); // Sunk 0.6 units into sand

  for (let i = 0; i < segmentCount; i++) {
    const t = i / (segmentCount - 1);
    const segH = height / segmentCount;
    const segW = 0.26 - t * 0.08;

    const segGeom = new THREE.CylinderGeometry(segW * 0.88, segW, segH * 1.02, 6);
    const segMat = i % 2 === 0 ? trunkWoodMat : trunkRingMat;
    const segMesh = new THREE.Mesh(segGeom, segMat);

    segMesh.position.copy(currentPos);
    segMesh.position.y += segH / 2;

    const leanX = Math.cos(leanAngle) * leanAmount * Math.pow(t, 1.5);
    const leanZ = Math.sin(leanAngle) * leanAmount * Math.pow(t, 1.5);
    segMesh.position.x = leanX;
    segMesh.position.z = leanZ;

    segMesh.castShadow = true;
    segMesh.receiveShadow = true;
    palm.add(segMesh);

    currentPos.set(leanX, (i + 1) * segH, leanZ);
  }

  const crownPos = currentPos.clone();

  // 2. Palm Fronds: 8 Arching, Layered Stepped Pixel Fronds
  const frondCount = 8;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
    const frondPivot = new THREE.Group();
    frondPivot.position.copy(crownPos);
    frondPivot.rotation.y = angle;

    const frondMat = i % 2 === 0 ? frondMat1 : frondMat2;

    // Stepped pixel leaf segments that curve and droop
    const leafSegments = 4;
    let leafPos = new THREE.Vector3(0, 0, 0);

    for (let s = 0; s < leafSegments; s++) {
      const st = s / leafSegments;
      const lw = (1.0 - Math.abs(st - 0.4) * 0.8) * 0.42;
      const lh = 0.04;
      const lLen = 0.65;

      const leafPart = new THREE.Mesh(new THREE.BoxGeometry(lw, lh, lLen), frondMat);
      leafPart.position.copy(leafPos);
      leafPart.position.z += lLen / 2;
      leafPart.rotation.x = -0.15 - st * 0.42; // Progressive droop
      leafPart.castShadow = true;
      frondPivot.add(leafPart);

      leafPos.z += lLen * Math.cos(-0.15 - st * 0.42);
      leafPos.y += lLen * Math.sin(-0.15 - st * 0.42);
    }

    palm.add(frondPivot);
  }

  // 3. Cluster of 4-5 Brown Coconuts under the crown!
  const cocoCount = 4 + Math.floor(Math.random() * 2);
  for (let c = 0; c < cocoCount; c++) {
    const cAngle = (c / cocoCount) * Math.PI * 2 + Math.random() * 0.4;
    const cDist = 0.22 + Math.random() * 0.08;
    const cocoGeom = new THREE.DodecahedronGeometry(0.18, 0); // Faceted pixel coconut!
    const coco = new THREE.Mesh(cocoGeom, coconutMat);

    coco.position.set(
      crownPos.x + Math.cos(cAngle) * cDist,
      crownPos.y - 0.22 + (Math.random() - 0.5) * 0.08,
      crownPos.z + Math.sin(cAngle) * cDist
    );
    coco.castShadow = true;
    coco.receiveShadow = true;
    palm.add(coco);
  }

  const s = 1.2 + Math.random() * 0.3;
  palm.scale.set(s, s, s);
  return palm;
}

/**
 * Creates retro pixel striped beach umbrella
 */
function createPixelBeachUmbrella(): THREE.Group {
  const umbrella = new THREE.Group();

  const poleMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8, flatShading: true });
  const fabricA = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.6, flatShading: true, side: THREE.DoubleSide }); // pastel coral pink
  const fabricB = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, flatShading: true, side: THREE.DoubleSide });

  // Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6), poleMat);
  pole.position.y = 1.3;
  pole.castShadow = true;
  umbrella.add(pole);

  // Faceted 8-segment canopy with alternating pastel colors
  const canopy = new THREE.Group();
  canopy.position.y = 2.45;
  canopy.rotation.z = 0.12;

  const segCount = 8;
  for (let i = 0; i < segCount; i++) {
    const a1 = (i / segCount) * Math.PI * 2;
    const a2 = ((i + 1) / segCount) * Math.PI * 2;
    const mat = i % 2 === 0 ? fabricA : fabricB;

    const triGeom = new THREE.ConeGeometry(1.65, 0.6, 1, 1, false, a1, (Math.PI * 2) / segCount);
    const mesh = new THREE.Mesh(triGeom, mat);
    mesh.castShadow = true;
    canopy.add(mesh);
  }

  umbrella.add(canopy);

  // Pastel Beach Towel beneath umbrella
  const towelMat = new THREE.MeshStandardMaterial({
    color: Math.random() > 0.5 ? 0x38bdf8 : 0xfde047,
    roughness: 0.8,
    flatShading: true,
  });
  const towel = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 1.5), towelMat);
  towel.position.set(0.65, 0.02, 0.35);
  towel.rotation.y = 0.4;
  towel.receiveShadow = true;
  umbrella.add(towel);

  return umbrella;
}

/**
 * Creates retro pixel sandcastle
 */
function createPixelSandcastle(): THREE.Group {
  const castle = new THREE.Group();
  const sandMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9, flatShading: true });
  const flagMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5, flatShading: true });

  // Center keep
  const keep = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.65), sandMat);
  keep.position.y = 0.275;
  keep.castShadow = true;
  castle.add(keep);

  // 4 corner towers
  for (const [cx, cz] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.7, 6), sandMat);
    tower.position.set(cx, 0.35, cz);
    tower.castShadow = true;
    castle.add(tower);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.25, 6), sandMat);
    roof.position.set(cx, 0.82, cz);
    castle.add(roof);
  }

  // Center banner flag
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4), sandMat);
  flagPole.position.set(0, 0.75, 0);
  castle.add(flagPole);

  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.01), flagMat);
  flag.position.set(0.08, 0.92, 0);
  castle.add(flag);

  return castle;
}

/**
 * Creates retro pixel wooden pier boardwalk
 */
function createPixelBeachBoardwalk(): THREE.Group {
  const pier = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.85, flatShading: true });
  const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9, flatShading: true });

  // Stepped walkway planks reaching out toward water edge
  const plankCount = 14;
  for (let p = 0; p < plankCount; p++) {
    const z = 2.0 + p * 0.55;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.48), woodMat);
    plank.position.set(0, 0.22, z);
    plank.castShadow = true;
    plank.receiveShadow = true;
    pier.add(plank);

    // Support pilings every 3 planks
    if (p % 3 === 0) {
      for (const px of [-0.7, 0.7]) {
        const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.2, 6), woodDarkMat);
        piling.position.set(px, -0.3, z);
        piling.castShadow = true;
        pier.add(piling);
      }
    }
  }

  return pier;
}

/**
 * Creates completely rock-solid, NON-GLITCHING Monumental Ancient Roman Fountain
 * Cleanly separated water geometry with depthWrite=false and zero z-fighting.
 */
function createGlitchFreeRomanFountain(): { group: THREE.Group; updateWater: (time: number, delta: number) => void } {
  const fountain = new THREE.Group();

  const travertineMat = new THREE.MeshStandardMaterial({
    color: 0xfbf6ee, // warm pastel Roman travertine
    roughness: 0.72,
    metalness: 0.04,
    flatShading: true,
  });

  const marbleTrimMat = new THREE.MeshStandardMaterial({
    color: 0xede0cb,
    roughness: 0.65,
    metalness: 0.06,
    flatShading: true,
  });

  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.4,
    metalness: 0.65,
    flatShading: true,
  });

  // Solid, beautiful translucent water materials with depthWrite=false
  const waterPoolMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.82,
    depthWrite: false, // Prevents z-fighting and flickering with ground/basin!
  });

  const waterCascadeMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    roughness: 0.05,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // 1. Lower Stepped Travertine Base (Faceted octagonal plinth)
  const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.3, 0.32, 16), travertineMat);
  basePlinth.position.y = 0.16;
  basePlinth.receiveShadow = true;
  basePlinth.castShadow = true;
  fountain.add(basePlinth);

  // 2. Ground Pool Basin Wall (16-faceted)
  const baseRim = new THREE.Mesh(new THREE.CylinderGeometry(2.85, 3.05, 0.72, 16), travertineMat);
  baseRim.position.y = 0.52;
  baseRim.castShadow = true;
  baseRim.receiveShadow = true;
  fountain.add(baseRim);

  // Molded rim trim
  const rimTrim = new THREE.Mesh(new THREE.TorusGeometry(2.86, 0.12, 8, 16), marbleTrimMat);
  rimTrim.rotation.x = Math.PI / 2;
  rimTrim.position.y = 0.92;
  fountain.add(rimTrim);

  // Ground Pool Water Surface (Placed safely inside rim with clear margins to avoid any edge bleeding)
  const baseWater = new THREE.Mesh(new THREE.CylinderGeometry(2.65, 2.65, 0.08, 16), waterPoolMat);
  baseWater.position.y = 0.80;
  fountain.add(baseWater);

  // 3. Central Fluted Pedestal
  const centralBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.1, 0.4, 12), marbleTrimMat);
  centralBase.position.y = 1.05;
  centralBase.castShadow = true;
  fountain.add(centralBase);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.72, 1.8, 12), travertineMat);
  pedestal.position.y = 1.95;
  pedestal.castShadow = true;
  fountain.add(pedestal);

  // 4 Sculpted Bronze Lion Spouts & Arced Water Streams
  const spouts: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI * 2) / 4;
    const lionHead = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), bronzeMat);
    lionHead.position.set(Math.cos(angle) * 0.7, 2.1, Math.sin(angle) * 0.7);
    lionHead.castShadow = true;
    fountain.add(lionHead);

    // Parabolic water curve from lion mouth into ground pool
    const curvePoints: THREE.Vector3[] = [];
    const start = lionHead.position.clone();
    const end = new THREE.Vector3(Math.cos(angle) * 2.1, 0.82, Math.sin(angle) * 2.1);
    for (let s = 0; s <= 8; s++) {
      const t = s / 8;
      const x = THREE.MathUtils.lerp(start.x, end.x, t);
      const z = THREE.MathUtils.lerp(start.z, end.z, t);
      const y = THREE.MathUtils.lerp(start.y, end.y, t) + Math.sin(t * Math.PI) * 0.38;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const arcPath = new THREE.CatmullRomCurve3(curvePoints);
    const spout = new THREE.Mesh(new THREE.TubeGeometry(arcPath, 12, 0.06, 6, false), waterCascadeMat);
    fountain.add(spout);
    spouts.push(spout);
  }

  // 4. Middle Tier Scalloped Basin (12-faceted)
  const midBasin = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 0.85, 0.5, 12), travertineMat);
  midBasin.position.y = 2.85;
  midBasin.castShadow = true;
  fountain.add(midBasin);

  // Middle Tier Water
  const midWater = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.08, 12), waterPoolMat);
  midWater.position.y = 3.05;
  fountain.add(midWater);

  // 6 Cascading overflow sheets from Middle Basin down to Ground Pool
  const midCascades: THREE.Mesh[] = [];
  for (let c = 0; c < 6; c++) {
    const angle = (c / 6) * Math.PI * 2;
    const cas = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.8, 0.06), waterCascadeMat);
    cas.position.set(Math.cos(angle) * 1.55, 2.05, Math.sin(angle) * 1.55);
    cas.rotation.y = angle + Math.PI / 2;
    fountain.add(cas);
    midCascades.push(cas);
  }

  // 5. Upper Tier Pillar & Top Basin
  const topPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 1.2, 10), travertineMat);
  topPillar.position.y = 3.65;
  topPillar.castShadow = true;
  fountain.add(topPillar);

  const topBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.4, 0.32, 10), travertineMat);
  topBasin.position.y = 4.3;
  topBasin.castShadow = true;
  fountain.add(topBasin);

  const topWater = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 10), waterPoolMat);
  topWater.position.y = 4.42;
  fountain.add(topWater);

  // Top overflow curtain
  const topCurtain = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.1, 1.1, 12, 1, true), waterCascadeMat);
  topCurtain.position.y = 3.75;
  fountain.add(topCurtain);

  // Bronze Eagle / Pinecone Finial
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.55, 8), bronzeMat);
  finial.position.y = 4.8;
  finial.castShadow = true;
  fountain.add(finial);

  // 6. Ascending Crown Water Jet
  const mainJet = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.4, 8), waterCascadeMat);
  mainJet.position.y = 5.45;
  fountain.add(mainJet);

  // Sparkling splash droplets with depthWrite=false
  const mistCount = 32;
  const mistGeo = new THREE.BufferGeometry();
  const mistPos: number[] = [];
  for (let m = 0; m < mistCount; m++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 2.4;
    mistPos.push(Math.cos(angle) * r, 0.85 + Math.random() * 4.2, Math.sin(angle) * r);
  }
  mistGeo.setAttribute('position', new THREE.Float32BufferAttribute(mistPos, 3));
  const mistMat = new THREE.PointsMaterial({
    color: 0xbae6fd,
    size: 0.18,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  const mistPoints = new THREE.Points(mistGeo, mistMat);
  fountain.add(mistPoints);

  // Stable animation without violent position shifts
  const updateWater = (time: number, delta: number) => {
    // Gentle jet breathing
    const s = 1.0 + Math.sin(time * 5) * 0.08;
    mainJet.scale.set(s, 1.0 + Math.cos(time * 4) * 0.08, s);

    // Gentle cascade sway
    topCurtain.rotation.y = time * 0.25;
    for (let c = 0; c < midCascades.length; c++) {
      midCascades[c].scale.x = 0.9 + Math.sin(time * 6 + c) * 0.1;
    }

    // Mist bobbing
    const pos = mistGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < mistCount; i++) {
      const idx = i * 3 + 1;
      pos[idx] += Math.sin(time * 3 + i) * delta * 0.4;
      if (pos[idx] > 5.5) pos[idx] = 1.0;
    }
    mistGeo.attributes.position.needsUpdate = true;
  };

  return { group: fountain, updateWater };
}

/**
 * Creates pixel-classical Roman Insula / Townhouse
 * Terracotta roof, warm pastel stucco walls, wooden shutters, arched doorways, balconies!
 */
function createRomanTownhouse(colorHex: number = 0xfed7aa): THREE.Group {
  const house = new THREE.Group();

  const stuccoMat = new THREE.MeshStandardMaterial({
    color: colorHex, // warm pastel peach, terracotta, or cream
    roughness: 0.85,
    flatShading: true,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0xc2410c, // Roman terracotta roof tiles
    roughness: 0.8,
    flatShading: true,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.7,
    flatShading: true,
  });

  const woodDoorMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.8,
    flatShading: true,
  });

  const windowShutterMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    roughness: 0.75,
    flatShading: true,
  });

  // 1. Two-Story Main Building Body
  const width = 5.2;
  const height = 5.6;
  const depth = 4.8;
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), stuccoMat);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  house.add(body);

  // 2. Terracotta Pitched Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.78, 1.8, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.28, 1, 1.15);
  roof.position.set(0, height + 0.85, 0);
  roof.castShadow = true;
  house.add(roof);

  // Roof Cornice Trim
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(width + 0.5, 0.28, depth + 0.5), trimMat);
  cornice.position.y = height;
  cornice.castShadow = true;
  house.add(cornice);

  // 3. Arched Front Entrance Doorway
  const doorArch = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.2), trimMat);
  doorArch.position.set(0, 1.3, depth / 2 + 0.08);
  doorArch.castShadow = true;
  house.add(doorArch);

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.15), woodDoorMat);
  door.position.set(0, 1.1, depth / 2 + 0.12);
  house.add(door);

  // 4. Second-Story Windows with Timber Shutters
  for (const wx of [-1.5, 1.5]) {
    // Window opening
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.12), trimMat);
    win.position.set(wx, 3.8, depth / 2 + 0.06);
    house.add(win);

    // Left & right shutters
    for (const sx of [-0.55, 0.55]) {
      const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.05, 0.08), windowShutterMat);
      shutter.position.set(wx + sx, 3.8, depth / 2 + 0.1);
      shutter.castShadow = true;
      house.add(shutter);
    }
  }

  // 5. Timber Balcony
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.85), trimMat);
  balcony.position.set(0, 2.9, depth / 2 + 0.42);
  balcony.castShadow = true;
  house.add(balcony);

  // Balcony railing
  const rail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 0.08), windowShutterMat);
  rail.position.set(0, 3.3, depth / 2 + 0.8);
  house.add(rail);

  return house;
}

/**
 * Creates Roman Taberna / Marketplace Shop with striped fabric awning and amphora display
 */
function createRomanTaberna(): THREE.Group {
  const shop = new THREE.Group();

  const stuccoMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.85, flatShading: true });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7, flatShading: true });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8, flatShading: true });
  const awningMatA = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.6, flatShading: true }); // Roman red
  const awningMatB = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6, flatShading: true }); // Roman gold
  const amphoraMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.75, flatShading: true });

  // 1. Building base
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3.6, 3.8), stuccoMat);
  body.position.y = 1.8;
  body.castShadow = true;
  body.receiveShadow = true;
  shop.add(body);

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 4.2), roofMat);
  roof.position.y = 3.75;
  roof.castShadow = true;
  shop.add(roof);

  // 2. Open Taberna counter
  const counter = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.95, 0.65), trimMat);
  counter.position.set(0, 0.48, 1.95);
  counter.castShadow = true;
  counter.receiveShadow = true;
  shop.add(counter);

  // 3. Striped fabric canopy awning
  const awningWidth = 3.6;
  const stripeCount = 6;
  for (let s = 0; s < stripeCount; s++) {
    const sw = awningWidth / stripeCount;
    const sx = -awningWidth / 2 + sw / 2 + s * sw;
    const mat = s % 2 === 0 ? awningMatA : awningMatB;

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.06, 1.25), mat);
    stripe.position.set(sx, 2.5, 2.5);
    stripe.rotation.x = 0.28;
    stripe.castShadow = true;
    shop.add(stripe);
  }

  // 4. Terracotta Amphora Storage Jars on Counter & Ground
  for (let a = 0; a < 4; a++) {
    const jar = new THREE.Group();
    const jarBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.42, 6), amphoraMat);
    jarBody.position.y = 0.21;
    jar.add(jarBody);
    const jarNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 6), amphoraMat);
    jarNeck.position.y = 0.45;
    jar.add(jarNeck);

    const onCounter = a < 2;
    if (onCounter) {
      jar.position.set(-0.8 + a * 0.4, 0.95, 2.0);
    } else {
      jar.position.set(1.4 + (a - 2) * 0.38, 0, 2.3);
    }
    jar.castShadow = true;
    shop.add(jar);
  }

  return shop;
}

/**
 * Creates Roman Villa with classical portico columns and courtyard
 */
function createRomanVilla(): THREE.Group {
  const villa = new THREE.Group();

  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8ede2, roughness: 0.72, flatShading: true });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8, flatShading: true });
  const stuccoMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.85, flatShading: true });

  // Main villa wing
  const mainWing = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4.4, 4.8), stuccoMat);
  mainWing.position.y = 2.2;
  mainWing.castShadow = true;
  mainWing.receiveShadow = true;
  villa.add(mainWing);

  // Terracotta hip roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.8, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.4, 1, 1.15);
  roof.position.set(0, 5.2, 0);
  roof.castShadow = true;
  villa.add(roof);

  // Classical portico colonnade front (4 columns)
  for (let c = 0; c < 4; c++) {
    const cx = -2.2 + c * 1.45;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.8, 8), marbleMat);
    col.position.set(cx, 1.9, 2.65);
    col.castShadow = true;
    villa.add(col);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.48), marbleMat);
    cap.position.set(cx, 3.8, 2.65);
    villa.add(cap);
  }

  // Portico canopy roof
  const porticoRoof = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 1.2), marbleMat);
  porticoRoof.position.set(0, 4.0, 2.65);
  porticoRoof.castShadow = true;
  villa.add(porticoRoof);

  return villa;
}

/**
 * Creates paved Roman stone trails (Via Appia style) with flagstones and stone curbs
 */
function createRomanPavedRoad(length: number, width: number = 3.2): THREE.Group {
  const road = new THREE.Group();

  const flagstoneMat1 = new THREE.MeshStandardMaterial({ color: 0xf1ebe1, roughness: 0.8, flatShading: true });
  const flagstoneMat2 = new THREE.MeshStandardMaterial({ color: 0xe2d6c6, roughness: 0.85, flatShading: true });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0xd6c7b3, roughness: 0.75, flatShading: true });

  // Main stone pavement base
  const roadBase = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, length), flagstoneMat1);
  roadBase.position.y = 0.04;
  roadBase.receiveShadow = true;
  road.add(roadBase);

  // Raised stone curbs flanking the road
  for (const cx of [-width / 2 - 0.1, width / 2 + 0.1]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, length), curbMat);
    curb.position.set(cx, 0.09, 0);
    curb.castShadow = true;
    curb.receiveShadow = true;
    road.add(curb);
  }

  // Individual mosaic flagstone inlays for authentic pixel paving texture
  const rows = Math.floor(length / 1.4);
  for (let r = 0; r < rows; r++) {
    const z = -length / 2 + 0.7 + r * 1.4;
    const flag = new THREE.Mesh(new THREE.BoxGeometry(width * 0.75, 0.02, 1.1), flagstoneMat2);
    flag.position.set((r % 2 === 0 ? -0.2 : 0.2), 0.09, z);
    flag.receiveShadow = true;
    road.add(flag);
  }

  return road;
}

/**
 * Creates classical Roman stone bench
 */
function createRomanBench(): THREE.Group {
  const bench = new THREE.Group();
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8efe2, roughness: 0.7, flatShading: true });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.55), marbleMat);
  seat.position.y = 0.45;
  seat.castShadow = true;
  bench.add(seat);

  for (const lx of [-0.6, 0.6]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.45), marbleMat);
    leg.position.set(lx, 0.225, 0);
    leg.castShadow = true;
    bench.add(leg);
  }

  return bench;
}

/**
 * Creates Italian Columnar Cypress in terracotta urn
 */
function createPixelItalianCypress(): THREE.Group {
  const cypress = new THREE.Group();

  const potMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.8, flatShading: true });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.28, 0.65, 8), potMat);
  pot.position.y = 0.325;
  pot.castShadow = true;
  cypress.add(pot);

  const foliageMat = new THREE.MeshStandardMaterial({
    color: Math.random() > 0.5 ? 0x14532d : 0x166534,
    roughness: 0.8,
    flatShading: true,
  });

  const tierCount = 5;
  const radii = [0.58, 0.52, 0.42, 0.34, 0.2];
  const heights = [1.5, 2.4, 3.2, 4.0, 4.7];

  for (let i = 0; i < tierCount; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(radii[i], 1.3, 8), foliageMat);
    cone.position.y = heights[i];
    cone.castShadow = true;
    cypress.add(cone);
  }

  const s = 0.85 + Math.random() * 0.25;
  cypress.scale.set(s, s, s);
  return cypress;
}

/**
 * Creates Roman Marble Statue
 */
function createPixelRomanStatue(): THREE.Group {
  const statue = new THREE.Group();
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xfcfaf7, roughness: 0.6, metalness: 0.05, flatShading: true });

  const ped = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), marbleMat);
  ped.position.y = 0.6;
  ped.castShadow = true;
  statue.add(ped);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 1.4, 8), marbleMat);
  body.position.y = 1.9;
  body.castShadow = true;
  statue.add(body);

  const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), marbleMat);
  head.position.y = 2.8;
  head.castShadow = true;
  statue.add(head);

  return statue;
}

/**
 * Creates Ancient Roman Temple
 */
function createPixelRomanTemple(): THREE.Group {
  const temple = new THREE.Group();

  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8efe2, roughness: 0.72, flatShading: true });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8, flatShading: true });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.7, flatShading: true });

  // Podium
  const podium = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.1, 11.2), marbleMat);
  podium.position.y = 0.55;
  podium.castShadow = true;
  podium.receiveShadow = true;
  temple.add(podium);

  // Access stairs
  for (let s = 0; s < 4; s++) {
    const stair = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.22, 0.65), marbleMat);
    stair.position.set(0, 0.11 + s * 0.22, 5.6 + s * 0.55);
    stair.receiveShadow = true;
    temple.add(stair);
  }

  // Cella
  const cella = new THREE.Mesh(new THREE.BoxGeometry(8.2, 4.4, 6.8), marbleMat);
  cella.position.set(0, 3.3, -1.4);
  cella.castShadow = true;
  temple.add(cella);

  // Front Colonnade (6 fluted columns)
  const frontColX = [-3.5, -2.1, -0.7, 0.7, 2.1, 3.5];
  for (const cx of frontColX) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 4.4, 10), marbleMat);
    col.position.set(cx, 3.3, 4.0);
    col.castShadow = true;
    temple.add(col);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.32, 0.72), marbleMat);
    cap.position.set(cx, 5.6, 4.0);
    temple.add(cap);
  }

  // Entablature
  const entablature = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.7, 11.6), marbleMat);
  entablature.position.set(0, 6.0, 0);
  temple.add(entablature);

  // Triangular Pediment
  const pediment = new THREE.Mesh(new THREE.ConeGeometry(5.8, 1.8, 4), marbleMat);
  pediment.rotation.y = Math.PI / 4;
  pediment.scale.set(1.22, 1, 0.32);
  pediment.position.set(0, 6.95, 4.8);
  temple.add(pediment);

  // Medallion
  const medallion = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.1, 10), goldMat);
  medallion.rotation.x = Math.PI / 2;
  medallion.position.set(0, 6.95, 5.1);
  temple.add(medallion);

  // Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(6.2, 1.8, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.24, 1, 1.12);
  roof.position.set(0, 7.25, -0.6);
  roof.castShadow = true;
  temple.add(roof);

  return temple;
}

/**
 * Creates Ancient Roman Triumphal Arch
 */
function createPixelRomanArch(): THREE.Group {
  const arch = new THREE.Group();

  const travertineMat = new THREE.MeshStandardMaterial({ color: 0xfbf4ea, roughness: 0.72, flatShading: true });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.6, flatShading: true });

  // Flanking Pylons
  const pylonLeft = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.2, 2.6), travertineMat);
  pylonLeft.position.set(-2.4, 2.6, 0);
  pylonLeft.castShadow = true;
  arch.add(pylonLeft);

  const pylonRight = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.2, 2.6), travertineMat);
  pylonRight.position.set(2.4, 2.6, 0);
  pylonRight.castShadow = true;
  arch.add(pylonRight);

  // Central Arch Span
  const archSpan = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 2.6), travertineMat);
  archSpan.position.set(0, 4.65, 0);
  archSpan.castShadow = true;
  arch.add(archSpan);

  // Attic Story
  const attic = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.8, 2.5), travertineMat);
  attic.position.set(0, 6.1, 0);
  attic.castShadow = true;
  arch.add(attic);

  // SPQR Golden Plaque
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.0, 0.15), trimMat);
  plaque.position.set(0, 6.1, 1.3);
  arch.add(plaque);

  return arch;
}

/**
 * Builds all environmental props, translucent drifting fluffy clouds, and wind particles with dynamic scenery switching
 */
export function createEnvironment(initialScenery: SceneryType = 'forest'): EnvironmentResult {
  const group = new THREE.Group();
  const clouds: Cloud[] = [];

  const sceneryPropsGroup = new THREE.Group();
  group.add(sceneryPropsGroup);

  // Fountain water updater
  let fountainWaterUpdater: ((time: number, delta: number) => void) | null = null;

  // 1. Translucent, fluffy, pure white drifting clouds (lowered to frame the cozy meadow)
  const cloudCount = 10;
  for (let i = 0; i < cloudCount; i++) {
    const cloudMesh = createCloudMesh();
    const x = (Math.random() - 0.5) * 60;
    const z = (Math.random() - 0.5) * 56;
    // Lowered cloud height (approx 8.5 to 12.0) closer to the treetops and world
    const y = 8.5 + Math.random() * 3.5;
    cloudMesh.position.set(x, y, z);
    group.add(cloudMesh);

    clouds.push({
      group: cloudMesh,
      speed: 0.6 + Math.random() * 0.8,
      initialY: y,
      bobOffset: Math.random() * Math.PI * 2,
    });
  }

  // 2. Dynamic Scenery Builder
  const populateScenery = (scenery: SceneryType) => {
    fountainWaterUpdater = null;

    // Clear old props cleanly
    while (sceneryPropsGroup.children.length > 0) {
      const child = sceneryPropsGroup.children[0];
      sceneryPropsGroup.remove(child);
      child.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry?.dispose();
          if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
          else c.material?.dispose();
        }
      });
    }

    if (scenery === 'forest') {
      // --- Forest: Soft pastel trees, pixel wildflowers, mushrooms, boulders ---
      FOREST_TREES.forEach((t) => {
        const y = getTerrainHeight(t.x, t.z, 'forest');
        const tree = createPixelTree(t.isPine);
        tree.position.set(t.x, y, t.z);
        const normal = getTerrainNormal(t.x, t.z, 'forest');
        tree.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        tree.rotateY((t.x * 3.7 + t.z * 1.9) % (Math.PI * 2));
        sceneryPropsGroup.add(tree);
      });

      // Pastel pixel grass tufts
      const tuftCount = 120;
      for (let i = 0; i < tuftCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 1.5 + Math.random() * 19;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const y = getTerrainHeight(x, z, 'forest');

        const tuft = createPixelGrassTuft();
        tuft.position.set(x, y, z);
        const normal = getTerrainNormal(x, z, 'forest');
        tuft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        sceneryPropsGroup.add(tuft);
      }

      // Pastel pixel wildflowers
      const flowerCount = 60;
      for (let i = 0; i < flowerCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 2 + Math.random() * 18;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const y = getTerrainHeight(x, z, 'forest');

        const flower = createPixelWildflower();
        flower.position.set(x, y, z);
        sceneryPropsGroup.add(flower);
      }

      // Cute pixel mushrooms
      for (let m = 0; m < 14; m++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 4.0 + Math.random() * 14;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const y = getTerrainHeight(x, z, 'forest');

        const mush = createPixelMushroomCluster();
        mush.position.set(x, y, z);
        sceneryPropsGroup.add(mush);
      }

      // Faceted boulders
      FOREST_BOULDERS.forEach((b) => {
        const y = getTerrainHeight(b.x, b.z, 'forest');
        const boulder = createPixelBoulder();
        boulder.position.set(b.x, y, b.z);
        sceneryPropsGroup.add(boulder);
      });
    } else if (scenery === 'beach') {
      // --- Beach: Ocean water, pixel palm trees strictly on dry sand, umbrellas, sandcastle, pier ---
      // 1. Crystal-clear pastel turquoise ocean water plane
      const waterGeom = new THREE.PlaneGeometry(75, 45);
      waterGeom.rotateX(-Math.PI / 2);
      const oceanMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8, // vibrant crystal turquoise
        roughness: 0.06,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
      });
      const ocean = new THREE.Mesh(waterGeom, oceanMat);
      ocean.position.set(0, 0.0, 24); // Water surface at y = 0.0, starting around z = 8.5
      sceneryPropsGroup.add(ocean);

      // Gentle white surf / foam edge at shoreline (z = 8.5)
      const foamGeom = new THREE.PlaneGeometry(75, 0.6);
      foamGeom.rotateX(-Math.PI / 2);
      const foamMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        transparent: true,
        opacity: 0.7,
      });
      const foam = new THREE.Mesh(foamGeom, foamMat);
      foam.position.set(0, 0.02, 8.5);
      sceneryPropsGroup.add(foam);

      // 2. Pixel Palm Trees WITH COCONUTS — strictly spawned on dry sand!
      BEACH_PALMS.forEach((p) => {
        const y = getTerrainHeight(p.x, p.z, 'beach');
        const palm = createPixelPalmTree();
        palm.position.set(p.x, y, p.z);
        palm.rotation.y = (p.x * 2.3 + p.z * 1.7) % (Math.PI * 2);
        sceneryPropsGroup.add(palm);
      });

      // 3. Pixel Beach Umbrellas on dry sand
      const umbrellaPositions = [
        { x: -5.5, z: 2.5 },
        { x: 5.8, z: 2.2 },
        { x: -8.5, z: -2.5 },
        { x: 8.2, z: -3.0 },
      ];
      umbrellaPositions.forEach((pos) => {
        const umbrella = createPixelBeachUmbrella();
        const y = getTerrainHeight(pos.x, pos.z, 'beach');
        umbrella.position.set(pos.x, y, pos.z);
        sceneryPropsGroup.add(umbrella);
      });

      // 4. Pixel Sandcastles on dry shore sand
      const sandcastle = createPixelSandcastle();
      const scY = getTerrainHeight(3.5, 4.8, 'beach');
      sandcastle.position.set(3.5, scY, 4.8);
      sceneryPropsGroup.add(sandcastle);

      // 5. Wooden Pier boardwalk extending out toward the water
      const pier = createPixelBeachBoardwalk();
      pier.position.set(-11.5, 0, 0);
      sceneryPropsGroup.add(pier);
    } else if (scenery === 'fountain') {
      // --- Ancient Rome: Full lively Forum town with houses, villas, taberna, paved trails & fountain ---
      // 1. Central Monumental Fountain (Completely glitch-free!)
      const fountainResult = createGlitchFreeRomanFountain();
      fountainResult.group.position.set(0, 0.14, 0);
      sceneryPropsGroup.add(fountainResult.group);
      fountainWaterUpdater = fountainResult.updateWater;

      // 2. Paved Stone Roads / Promenades connecting the grand Piazza to Civic monuments
      // North Avenue leading to the Temple
      const roadNorth = createRomanPavedRoad(8.5, 4.4);
      roadNorth.position.set(0, 0.14, -10.8);
      sceneryPropsGroup.add(roadNorth);

      // South Avenue leading to the Triumphal Arch
      const roadSouth = createRomanPavedRoad(8.5, 4.4);
      roadSouth.position.set(0, 0.14, 10.8);
      sceneryPropsGroup.add(roadSouth);

      // West Street leading to Roman Houses & Taberna
      const roadWest = createRomanPavedRoad(8.5, 4.0);
      roadWest.position.set(-10.5, 0.14, 0);
      roadWest.rotation.y = Math.PI / 2;
      sceneryPropsGroup.add(roadWest);

      // East Street leading to Roman Villa
      const roadEast = createRomanPavedRoad(8.5, 4.0);
      roadEast.position.set(10.5, 0.14, 0);
      roadEast.rotation.y = Math.PI / 2;
      sceneryPropsGroup.add(roadEast);

      // 3. Ancient Roman Civic Focal Points (North Temple & South Arch)
      const templeNorth = createPixelRomanTemple();
      const templeY = getTerrainHeight(0, -15.5, 'fountain');
      templeNorth.position.set(0, templeY, -15.5);
      templeNorth.scale.set(1.22, 1.22, 1.22);
      sceneryPropsGroup.add(templeNorth);

      const archSouth = createPixelRomanArch();
      const archY = getTerrainHeight(0, 15.0, 'fountain');
      archSouth.position.set(0, archY, 15.0);
      archSouth.rotation.y = Math.PI;
      archSouth.scale.set(1.2, 1.2, 1.2);
      sceneryPropsGroup.add(archSouth);

      // 4. Roman Town Houses / Insulae (Residential West Quarter)
      // House 1 (Pastel Peach Stucco)
      const houseWest1 = createRomanTownhouse(0xfed7aa);
      const h1y = getTerrainHeight(-13.5, -6.5, 'fountain');
      houseWest1.position.set(-13.5, h1y, -6.5);
      houseWest1.rotation.y = 0.35;
      houseWest1.scale.set(1.18, 1.18, 1.18);
      sceneryPropsGroup.add(houseWest1);

      // House 2 (Pastel Cream / Terracotta Stucco)
      const houseWest2 = createRomanTownhouse(0xfde68a);
      const h2y = getTerrainHeight(-13.5, 6.5, 'fountain');
      houseWest2.position.set(-13.5, h2y, 6.5);
      houseWest2.rotation.y = -0.35;
      houseWest2.scale.set(1.18, 1.18, 1.18);
      sceneryPropsGroup.add(houseWest2);

      // 5. Roman Taberna / Marketplace Shop (Along West Street)
      const taberna = createRomanTaberna();
      const ty = getTerrainHeight(-15.2, 0, 'fountain');
      taberna.position.set(-15.2, ty, 0);
      taberna.rotation.y = Math.PI / 2;
      taberna.scale.set(1.2, 1.2, 1.2);
      sceneryPropsGroup.add(taberna);

      // 6. Roman Villa (East Quarter)
      const villaEast = createRomanVilla();
      const vy = getTerrainHeight(14.8, 0, 'fountain');
      villaEast.position.set(14.8, vy, 0);
      villaEast.rotation.y = -Math.PI / 2;
      villaEast.scale.set(1.22, 1.22, 1.22);
      sceneryPropsGroup.add(villaEast);

      // Additional Townhouse behind Villa (North-East)
      const houseEast = createRomanTownhouse(0xf5d0b5);
      const hey = getTerrainHeight(14.2, -7.5, 'fountain');
      houseEast.position.set(14.2, hey, -7.5);
      houseEast.rotation.y = -0.4;
      houseEast.scale.set(1.18, 1.18, 1.18);
      sceneryPropsGroup.add(houseEast);

      // 7. Classical Stone Benches around Forum Piazza
      FOUNTAIN_BENCHES.forEach((bp) => {
        const bench = createRomanBench();
        const by = getTerrainHeight(bp.x, bp.z, 'fountain');
        bench.position.set(bp.x, by, bp.z);
        bench.rotation.y = bp.rot;
        sceneryPropsGroup.add(bench);
      });

      // 8. Classical Statues Guarding the South Promenade Avenue
      const statueLeft = createPixelRomanStatue();
      statueLeft.position.set(-4.5, getTerrainHeight(-4.5, 11.5, 'fountain'), 11.5);
      statueLeft.rotation.y = -0.3;
      statueLeft.scale.set(1.18, 1.18, 1.18);
      sceneryPropsGroup.add(statueLeft);

      const statueRight = createPixelRomanStatue();
      statueRight.position.set(4.5, getTerrainHeight(4.5, 11.5, 'fountain'), 11.5);
      statueRight.rotation.y = 0.3;
      statueRight.scale.set(1.18, 1.18, 1.18);
      sceneryPropsGroup.add(statueRight);

      // 9. Italian Columnar Cypress Trees framing forum streets & courtyards
      FOUNTAIN_CYPRESSES.forEach((pos) => {
        const cypress = createPixelItalianCypress();
        const y = getTerrainHeight(pos.x, pos.z, 'fountain');
        cypress.position.set(pos.x, y, pos.z);
        cypress.scale.set(1.2, 1.2, 1.2);
        sceneryPropsGroup.add(cypress);
      });
    }
  };

  populateScenery(initialScenery);

  // 3. Floating pollen / breeze particles
  const particleCount = 110;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos: number[] = [];
  const particleVel: { vx: number; vy: number; vz: number; seed: number }[] = [];

  for (let i = 0; i < particleCount; i++) {
    particlePos.push((Math.random() - 0.5) * 44, 0.8 + Math.random() * 8, (Math.random() - 0.5) * 44);
    particleVel.push({
      vx: 0.25 + Math.random() * 0.35,
      vy: (Math.random() - 0.5) * 0.15,
      vz: (Math.random() - 0.5) * 0.25,
      seed: Math.random() * 100,
    });
  }

  particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    transparent: true,
    opacity: 0.65,
  });
  const windParticles = new THREE.Points(particleGeo, particleMat);
  group.add(windParticles);

  // Update loop
  const update = (delta: number, time: number) => {
    // Drifting translucent fluffy white clouds
    for (const cloud of clouds) {
      cloud.group.position.x += cloud.speed * delta;
      cloud.group.position.y = cloud.initialY + Math.sin(time * 0.35 + cloud.bobOffset) * 0.3;
      if (cloud.group.position.x > 38) {
        cloud.group.position.x = -38;
        cloud.group.position.z = (Math.random() - 0.5) * 50;
      }
    }

    // Dynamic water animation (glitch-free)
    if (fountainWaterUpdater) {
      fountainWaterUpdater(time, delta);
    }

    // Gentle wind particles
    const positions = particleGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const v = particleVel[i];
      positions[idx] += (v.vx + Math.sin(time + v.seed) * 0.08) * delta * 1.8;
      positions[idx + 1] += (v.vy + Math.cos(time * 1.2 + v.seed) * 0.1) * delta;
      positions[idx + 2] += (v.vz + Math.sin(time * 0.8 + v.seed) * 0.08) * delta * 1.8;

      if (positions[idx] > 24) positions[idx] = -24;
      if (positions[idx + 1] < 0.4) positions[idx + 1] = 8;
      if (positions[idx + 1] > 9) positions[idx + 1] = 0.8;
      if (positions[idx + 2] > 24) positions[idx + 2] = -24;
      if (positions[idx + 2] < -24) positions[idx + 2] = 24;
    }
    particleGeo.attributes.position.needsUpdate = true;
  };

  return {
    group,
    clouds,
    windParticles,
    update,
    setScenery: populateScenery,
    dispose: () => {
      for (const cloud of clouds) {
        cloud.group.traverse((c) => {
          if (c instanceof THREE.Mesh) {
            c.geometry?.dispose();
            if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
            else c.material?.dispose();
          }
        });
      }
      particleGeo.dispose();
      particleMat.dispose();
      while (sceneryPropsGroup.children.length > 0) {
        const child = sceneryPropsGroup.children[0];
        sceneryPropsGroup.remove(child);
        child.traverse((c) => {
          if (c instanceof THREE.Mesh) {
            c.geometry?.dispose();
            if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
            else c.material?.dispose();
          }
        });
      }
    },
  };
}
