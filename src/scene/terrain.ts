import * as THREE from 'three';
import { SceneryType } from '../types';

export function getTerrainHeight(x: number, z: number, scenery: SceneryType = 'forest'): number {
  const d2 = x * x + z * z;

  if (scenery === 'beach') {
    // Shoreline is at z = 8.5.
    // z <= 5: dry sandy dunes (0.35 to 1.8)
    // z between 5 and 8.5: gentle beach slope down to water's edge (0.35 down to 0.0)
    // z > 8.5: ocean seabed below water level (-0.2 down to -2.0)
    if (z > 8.5) {
      const depth = Math.min(2.2, (z - 8.5) * 0.28);
      const underwaterWaves = Math.sin(x * 0.25) * 0.1;
      return -depth + underwaterWaves;
    }

    const shoreT = (8.5 - z) / 8.5; // 0 at water edge, 1 at z=0, >1 behind
    const baseSlope = shoreT * 0.45;
    const dunes = Math.sin(x * 0.14) * Math.cos(z * 0.12) * 0.55 + Math.sin(x * 0.07 + 1.2) * 0.4;
    const backRise = z < -4 ? Math.min(1.8, (-4 - z) * 0.18) : 0;
    return Math.max(0.02, baseSlope + dunes + backRise);
  }

  if (scenery === 'fountain') {
    // Redesigned Grand Roman Piazza:
    // Expansive, level travertine square (up to radius 13.5m or |x| < 13.0 & |z| < 13.0)
    // providing wide open space for the entire flock to roam, peck, and gather freely!
    const dist = Math.sqrt(d2);
    const inCentralPiazza = dist < 13.5 || (Math.abs(x) < 13.0 && Math.abs(z) < 13.0);
    if (inCentralPiazza) {
      return 0.14; // smooth, vast open travertine piazza floor
    }

    // Broad Roman avenues extending out to temple, arch, and villas
    const isNorthSouthAvenue = Math.abs(x) < 4.4;
    const isEastWestAvenue = Math.abs(z) < 4.4;
    if (isNorthSouthAvenue || isEastWestAvenue) {
      return 0.14; // level paved streets
    }

    // Gentle terrace rise framing the outer perimeter for colonnades and villas
    const edge = Math.min(0.9, (dist - 13.5) * 0.12);
    const gentleHills = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.2;
    return 0.14 + edge + gentleHills;
  }

  // Default: forest rolling hills scaled for a cozy, pastel meadow
  const dist = Math.sqrt(d2);
  const wave1 = Math.sin(x * 0.09) * Math.cos(z * 0.09) * 1.35;
  const wave2 = Math.sin(x * 0.18 + 1.2) * 0.38;
  const wave3 = Math.cos(z * 0.16 - 0.7) * 0.35;
  const mound = Math.sin((x + 6) * 0.08) * Math.cos((z - 5) * 0.08) * 0.7;
  // Gentle rim rise around middle edges (dist 14 to 24) to frame the cozy meadow basin
  let rimRise = 0;
  if (dist > 14 && dist <= 24) {
    rimRise = (dist - 14) * 0.16;
  } else if (dist > 24) {
    rimRise = Math.max(0, 1.6 - (dist - 24) * 0.08);
  }
  const baseH = wave1 + wave2 + wave3 + mound + rimRise;
  // Smoothly blend outer perimeter so the horizon stays clean and wide
  if (dist > 32) {
    const fade = Math.max(0, 1 - (dist - 32) / 16);
    return baseH * fade + 0.15 * (1 - fade);
  }
  return baseH;
}

export function getTerrainNormal(x: number, z: number, scenery: SceneryType = 'forest'): THREE.Vector3 {
  const eps = 0.15;
  const hL = getTerrainHeight(x - eps, z, scenery);
  const hR = getTerrainHeight(x + eps, z, scenery);
  const hD = getTerrainHeight(x, z - eps, scenery);
  const hU = getTerrainHeight(x, z + eps, scenery);

  const normal = new THREE.Vector3(hL - hR, 2 * eps, hD - hU);
  normal.normalize();
  return normal;
}

export interface TerrainMeshResult {
  mesh: THREE.Group;
  mainMesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  width: number;
  depth: number;
  updateScenery: (scenery: SceneryType) => void;
  dispose?: () => void;
}

export function createRollingTerrain(
  size: number = 100,
  segments: number = 140,
  initialScenery: SceneryType = 'forest'
): TerrainMeshResult {
  const terrainGroup = new THREE.Group();
  terrainGroup.name = 'terrainGroup';

  // Main terrain surface with flatShading enabled for a charming pixel/faceted game diorama look!
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true, // Distinctive retro pixel-like faceted aesthetic!
    roughness: 0.85,
    metalness: 0.02,
    side: THREE.DoubleSide, // Prevents any invisible backface clipping glitches!
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.name = 'terrain';
  terrainGroup.add(mesh);

  // Perimeter skirt mesh that drops 12 units deep into the earth around all 4 edges
  // This guarantees there is NEVER any empty space or floating cut visible under the terrain!
  const skirtMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  // Create 4 skirt strips (North, South, East, West)
  const halfSize = size / 2;
  const skirtDepth = -12.0;
  const skirtSegs = Math.min(segments, 60);

  const skirtGeo = new THREE.BufferGeometry();
  // We will build skirt vertices dynamically when scenery is applied
  const skirtMesh = new THREE.Mesh(skirtGeo, skirtMat);
  skirtMesh.name = 'skirt';
  skirtMesh.receiveShadow = true;
  terrainGroup.add(skirtMesh);

  const applyScenery = (scenery: SceneryType) => {
    const posAttr = geometry.attributes.position;
    const colors: number[] = [];

    // Pastel-tuned palettes:
    let baseLowColor: THREE.Color;
    let midColor: THREE.Color;
    let highColor: THREE.Color;
    let skirtColor: THREE.Color;

    if (scenery === 'beach') {
      baseLowColor = new THREE.Color('#fbe8c8'); // soft warm pastel shore sand
      midColor = new THREE.Color('#fef3c7');     // pastel sunny cream dune
      highColor = new THREE.Color('#fed7aa');    // warm pastel apricot rise
      skirtColor = new THREE.Color('#e2be9b');
    } else if (scenery === 'fountain') {
      baseLowColor = new THREE.Color('#eee6db'); // soft pastel Roman travertine paving
      midColor = new THREE.Color('#f4ede4');     // sunlit piazza flagstones
      highColor = new THREE.Color('#fbeee0');    // warm pastel terracotta terrace
      skirtColor = new THREE.Color('#b8a896');
    } else {
      // Forest: Soft, beautiful pastel greens!
      baseLowColor = new THREE.Color('#86efac'); // pastel meadow green
      midColor = new THREE.Color('#a7f3d0');     // soft pastel mint
      highColor = new THREE.Color('#bbf7d0');    // airy pastel celery / spring highlight
      skirtColor = new THREE.Color('#588968');   // deep earth bedrock
    }

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = getTerrainHeight(x, z, scenery);
      posAttr.setY(i, y);

      const normalizedY = THREE.MathUtils.clamp((y + 1.5) / 4.5, 0, 1);
      const vertexColor = new THREE.Color();
      if (normalizedY < 0.5) {
        vertexColor.lerpColors(baseLowColor, midColor, normalizedY * 2);
      } else {
        vertexColor.lerpColors(midColor, highColor, (normalizedY - 0.5) * 2);
      }

      // If beach and underwater, tint seabed to lovely pastel turquoise-sand
      if (scenery === 'beach' && z > 8.5) {
        const waterDepthT = THREE.MathUtils.clamp((z - 8.5) / 10, 0, 1);
        vertexColor.lerp(new THREE.Color('#93c5fd'), waterDepthT * 0.45);
      }

      // If Rome and on the paved road/piazza, give crisp travertine tint
      if (scenery === 'fountain') {
        const dist = Math.sqrt(x * x + z * z);
        const inCentralPiazza = dist < 13.5 || (Math.abs(x) < 13.0 && Math.abs(z) < 13.0);
        const onAvenue = Math.abs(x) < 4.4 || Math.abs(z) < 4.4;
        if (inCentralPiazza || onAvenue) {
          // Warm sunlit Roman travertine flagstones
          const stoneJitter = Math.sin(x * 1.4) * Math.cos(z * 1.4) * 0.04;
          const travertineTint = new THREE.Color(0xfcf8f2).addScalar(stoneJitter);
          vertexColor.lerp(travertineTint, 0.55);
        }
      }

      // Subtle, clean pastel noise variance (gentle, not dirty)
      const jitter = (Math.random() - 0.5) * 0.015;
      vertexColor.r = THREE.MathUtils.clamp(vertexColor.r + jitter, 0, 1);
      vertexColor.g = THREE.MathUtils.clamp(vertexColor.g + jitter, 0, 1);
      vertexColor.b = THREE.MathUtils.clamp(vertexColor.b + jitter, 0, 1);

      colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();

    // Generate Skirt Vertices
    const skirtPositions: number[] = [];
    const skirtColors: number[] = [];

    // Helper to add quad along boundary
    const addSkirtQuad = (x1: number, z1: number, x2: number, z2: number) => {
      const y1 = getTerrainHeight(x1, z1, scenery);
      const y2 = getTerrainHeight(x2, z2, scenery);

      // Two triangles: (Top1, Bottom1, Top2) & (Top2, Bottom1, Bottom2)
      const pTop1 = [x1, y1, z1];
      const pBot1 = [x1, skirtDepth, z1];
      const pTop2 = [x2, y2, z2];
      const pBot2 = [x2, skirtDepth, z2];

      const cTop = baseLowColor;
      const cBot = skirtColor;

      // Tri 1
      skirtPositions.push(...pTop1, ...pBot1, ...pTop2);
      skirtColors.push(cTop.r, cTop.g, cTop.b, cBot.r, cBot.g, cBot.b, cTop.r, cTop.g, cTop.b);

      // Tri 2
      skirtPositions.push(...pTop2, ...pBot1, ...pBot2);
      skirtColors.push(cTop.r, cTop.g, cTop.b, cBot.r, cBot.g, cBot.b, cBot.r, cBot.g, cBot.b);
    };

    // North Edge (z = -halfSize, x from -halfSize to halfSize)
    for (let s = 0; s < skirtSegs; s++) {
      const x1 = -halfSize + (s / skirtSegs) * size;
      const x2 = -halfSize + ((s + 1) / skirtSegs) * size;
      addSkirtQuad(x1, -halfSize, x2, -halfSize);
    }
    // South Edge (z = halfSize)
    for (let s = 0; s < skirtSegs; s++) {
      const x1 = halfSize - (s / skirtSegs) * size;
      const x2 = halfSize - ((s + 1) / skirtSegs) * size;
      addSkirtQuad(x1, halfSize, x2, halfSize);
    }
    // East Edge (x = halfSize)
    for (let s = 0; s < skirtSegs; s++) {
      const z1 = -halfSize + (s / skirtSegs) * size;
      const z2 = -halfSize + ((s + 1) / skirtSegs) * size;
      addSkirtQuad(halfSize, z1, halfSize, z2);
    }
    // West Edge (x = -halfSize)
    for (let s = 0; s < skirtSegs; s++) {
      const z1 = halfSize - (s / skirtSegs) * size;
      const z2 = halfSize - ((s + 1) / skirtSegs) * size;
      addSkirtQuad(-halfSize, z1, -halfSize, z2);
    }

    skirtGeo.setAttribute('position', new THREE.Float32BufferAttribute(skirtPositions, 3));
    skirtGeo.setAttribute('color', new THREE.Float32BufferAttribute(skirtColors, 3));
    skirtGeo.computeVertexNormals();
  };

  applyScenery(initialScenery);

  return {
    mesh: terrainGroup,
    mainMesh: mesh,
    material,
    width: size,
    depth: size,
    updateScenery: applyScenery,
    dispose: () => {
      geometry.dispose();
      material.dispose();
      skirtGeo.dispose();
      skirtMat.dispose();
    },
  };
}

