import * as THREE from 'three';
import { SceneryType } from '../types';
import { getTerrainHeight } from './terrain';

export type ObstacleShape = 'cylinder' | 'box';

export interface PerchSpot {
  x: number;
  y: number;
  z: number;
  yaw: number;
  type: 'fountain_rim' | 'bench' | 'pier';
}

export interface Obstacle {
  id: string;
  name: string;
  shape: ObstacleShape;
  x: number;
  z: number;
  y: number;
  height: number;
  // Cylinder properties
  radius?: number;
  // Box properties
  width?: number; // along local X
  depth?: number; // along local Z
  rotationY?: number;
  // Interactivity
  canPerch?: boolean;
  perchHeight?: number;
  perchRadius?: number;
}

// Deterministic tree coordinates for Forest scenery so environment meshes and collision match 1:1
export const FOREST_TREES: { x: number; z: number; isPine: boolean }[] = [
  { x: 13.5, z: 2.1, isPine: true },
  { x: 12.2, z: 6.8, isPine: false },
  { x: 9.8, z: 11.2, isPine: true },
  { x: 5.6, z: 14.3, isPine: false },
  { x: 0.8, z: 15.5, isPine: true },
  { x: -5.2, z: 14.8, isPine: false },
  { x: -10.4, z: 11.6, isPine: true },
  { x: -14.1, z: 6.4, isPine: false },
  { x: -15.6, z: 1.2, isPine: true },
  { x: -14.8, z: -5.5, isPine: false },
  { x: -11.5, z: -10.8, isPine: true },
  { x: -6.2, z: -14.6, isPine: false },
  { x: -0.5, z: -16.0, isPine: true },
  { x: 5.8, z: -15.1, isPine: false },
  { x: 11.2, z: -11.4, isPine: true },
  { x: 14.6, z: -5.8, isPine: false },
  // Outer layer
  { x: 17.8, z: 4.5, isPine: true },
  { x: 14.5, z: 13.8, isPine: false },
  { x: 6.2, z: 18.4, isPine: true },
  { x: -4.5, z: 18.9, isPine: false },
  { x: -14.2, z: 15.2, isPine: true },
  { x: -18.6, z: 6.8, isPine: false },
  { x: -18.9, z: -3.5, isPine: true },
  { x: -15.4, z: -13.5, isPine: false },
  { x: -5.5, z: -19.2, isPine: true },
  { x: 4.8, z: -18.6, isPine: false },
  { x: 14.2, z: -14.8, isPine: true },
  { x: 18.5, z: -4.2, isPine: false },
];

export const FOREST_BOULDERS: { x: number; z: number; radius: number }[] = [
  { x: 6.8, z: 4.5, radius: 0.95 },
  { x: -7.2, z: 5.1, radius: 1.1 },
  { x: 8.5, z: -6.2, radius: 0.85 },
  { x: -6.4, z: -7.8, radius: 1.05 },
  { x: 11.5, z: -1.5, radius: 0.9 },
  { x: -11.8, z: 2.4, radius: 1.15 },
  { x: 1.5, z: 9.8, radius: 0.8 },
  { x: -2.4, z: -10.5, radius: 0.95 },
  { x: 9.6, z: 8.4, radius: 1.0 },
  { x: -9.8, z: -3.8, radius: 0.85 },
];

// Deterministic palm trees on dry beach sand
export const BEACH_PALMS: { x: number; z: number }[] = [
  { x: -12.5, z: 3.8 },
  { x: -15.2, z: -1.5 },
  { x: -13.8, z: -7.2 },
  { x: -9.5, z: -11.5 },
  { x: -4.2, z: -12.8 },
  { x: 2.5, z: -13.2 },
  { x: 8.8, z: -11.8 },
  { x: 14.2, z: -8.5 },
  { x: 15.6, z: -2.8 },
  { x: 12.8, z: 3.5 },
  { x: 14.5, z: -13.5 },
  { x: -16.2, z: -12.2 },
  { x: -7.8, z: 4.8 },
  { x: 9.4, z: 4.2 },
  { x: -2.8, z: -7.5 },
  { x: 4.5, z: -7.8 },
];

export const BEACH_UMBRELLAS: { x: number; z: number }[] = [
  { x: -5.5, z: 2.5 },
  { x: 5.8, z: 2.2 },
  { x: -8.5, z: -2.5 },
  { x: 8.2, z: -3.0 },
];

export const FOUNTAIN_BENCHES: { x: number; z: number; rot: number }[] = [
  { x: -7.2, z: -6.5, rot: 0.785 },
  { x: 7.2, z: -6.5, rot: -0.785 },
  { x: -7.2, z: 6.5, rot: 2.356 },
  { x: 7.2, z: 6.5, rot: -2.356 },
];

export const FOUNTAIN_CYPRESSES: { x: number; z: number }[] = [
  { x: -10.5, z: -14.5 },
  { x: 10.5, z: -14.5 },
  { x: -10.5, z: 14.5 },
  { x: 10.5, z: 14.5 },
  { x: -16.5, z: -7.0 },
  { x: 16.5, z: -7.0 },
  { x: -16.5, z: 7.0 },
  { x: 16.5, z: 7.0 },
  { x: -7.5, z: -18.5 },
  { x: 7.5, z: -18.5 },
];

/**
 * Builds the obstacles list for the active scenery
 */
export function getObstaclesForScenery(scenery: SceneryType): Obstacle[] {
  const obstacles: Obstacle[] = [];

  if (scenery === 'fountain') {
    // 1. Central Monumental Roman Fountain (proud scale with open piazza perimeter)
    obstacles.push({
      id: 'fountain-base',
      name: 'Roman Fountain Plinth & Basin Wall',
      shape: 'cylinder',
      x: 0,
      z: 0,
      y: 0.14,
      radius: 3.3,
      height: 1.0,
      canPerch: true,
      perchHeight: 0.92, // top rim where pigeons can sit and drink
      perchRadius: 2.95,
    });

    // Central pedestal and upper basin
    obstacles.push({
      id: 'fountain-core',
      name: 'Fountain Pedestal & Spouts',
      shape: 'cylinder',
      x: 0,
      z: 0,
      y: 0.92,
      radius: 1.35,
      height: 4.6,
    });

    // 2. Temple North (podium + cella framing the grand forum north vista)
    obstacles.push({
      id: 'temple-north',
      name: 'Roman Temple',
      shape: 'box',
      x: 0,
      z: -15.5,
      y: 0.14,
      width: 12.0,
      depth: 13.0,
      height: 8.5,
      rotationY: 0,
    });

    // 3. Triumphal Arch South (monumental portal)
    obstacles.push({
      id: 'arch-pylon-left',
      name: 'Triumphal Arch Left Pylon',
      shape: 'box',
      x: -2.6,
      z: 15.0,
      y: 0.14,
      width: 2.8,
      depth: 3.0,
      height: 7.5,
      rotationY: 0,
    });

    obstacles.push({
      id: 'arch-pylon-right',
      name: 'Triumphal Arch Right Pylon',
      shape: 'box',
      x: 2.6,
      z: 15.0,
      y: 0.14,
      width: 2.8,
      depth: 3.0,
      height: 7.5,
      rotationY: 0,
    });

    // 4. Roman Townhouses & Villa
    obstacles.push({
      id: 'house-west-1',
      name: 'Townhouse West 1',
      shape: 'box',
      x: -13.5,
      z: -6.5,
      y: 0.14,
      width: 6.2,
      depth: 5.8,
      height: 7.2,
      rotationY: 0.35,
    });

    obstacles.push({
      id: 'house-west-2',
      name: 'Townhouse West 2',
      shape: 'box',
      x: -13.5,
      z: 6.5,
      y: 0.14,
      width: 6.2,
      depth: 5.8,
      height: 7.2,
      rotationY: -0.35,
    });

    obstacles.push({
      id: 'taberna-west',
      name: 'Roman Taberna Shop',
      shape: 'box',
      x: -15.2,
      z: 0,
      y: 0.14,
      width: 5.8,
      depth: 5.2,
      height: 5.2,
      rotationY: Math.PI / 2,
    });

    obstacles.push({
      id: 'villa-east',
      name: 'Roman Villa',
      shape: 'box',
      x: 14.8,
      z: 0,
      y: 0.14,
      width: 8.5,
      depth: 6.2,
      height: 6.8,
      rotationY: -Math.PI / 2,
    });

    obstacles.push({
      id: 'house-east',
      name: 'Townhouse East',
      shape: 'box',
      x: 14.2,
      z: -7.5,
      y: 0.14,
      width: 6.2,
      depth: 5.8,
      height: 7.2,
      rotationY: -0.4,
    });

    // 5. Stone Benches around Piazza
    FOUNTAIN_BENCHES.forEach((b, idx) => {
      obstacles.push({
        id: `bench-${idx + 1}`,
        name: `Roman Bench ${idx + 1}`,
        shape: 'box',
        x: b.x,
        z: b.z,
        y: 0.14,
        width: 1.8,
        depth: 0.75,
        height: 0.55,
        rotationY: b.rot,
        canPerch: true,
        perchHeight: 0.5,
      });
    });

    // 6. Classical Statues (flanking south avenue)
    obstacles.push({
      id: 'statue-left',
      name: 'Roman Statue Left',
      shape: 'cylinder',
      x: -4.5,
      z: 11.5,
      y: 0.14,
      radius: 0.75,
      height: 3.8,
    });

    obstacles.push({
      id: 'statue-right',
      name: 'Roman Statue Right',
      shape: 'cylinder',
      x: 4.5,
      z: 11.5,
      y: 0.14,
      radius: 0.75,
      height: 3.8,
    });

    // 7. Columnar Cypresses (urn + tree)
    FOUNTAIN_CYPRESSES.forEach((c, idx) => {
      obstacles.push({
        id: `cypress-${idx + 1}`,
        name: `Cypress Urn ${idx + 1}`,
        shape: 'cylinder',
        x: c.x,
        z: c.z,
        y: 0.14,
        radius: 0.55,
        height: 4.5,
      });
    });
  } else if (scenery === 'beach') {
    // 1. Palm trees on sand
    BEACH_PALMS.forEach((p, idx) => {
      obstacles.push({
        id: `palm-${idx + 1}`,
        name: `Palm Tree ${idx + 1}`,
        shape: 'cylinder',
        x: p.x,
        z: p.z,
        y: getTerrainHeight(p.x, p.z, 'beach'),
        radius: 0.45,
        height: 4.5,
      });
    });

    // 2. Beach umbrellas
    BEACH_UMBRELLAS.forEach((u, idx) => {
      obstacles.push({
        id: `umbrella-${idx + 1}`,
        name: `Beach Umbrella ${idx + 1}`,
        shape: 'cylinder',
        x: u.x,
        z: u.z,
        y: getTerrainHeight(u.x, u.z, 'beach'),
        radius: 0.35,
        height: 2.6,
      });
    });

    // 3. Sandcastle
    obstacles.push({
      id: 'sandcastle',
      name: 'Sandcastle',
      shape: 'cylinder',
      x: 3.5,
      z: 4.8,
      y: getTerrainHeight(3.5, 4.8, 'beach'),
      radius: 0.95,
      height: 0.85,
    });

    // 4. Boardwalk / Pier
    obstacles.push({
      id: 'boardwalk',
      name: 'Wooden Pier Boardwalk',
      shape: 'box',
      x: -11.5,
      z: 5.8,
      y: 0.0,
      width: 1.8,
      depth: 8.5,
      height: 0.4,
      rotationY: 0,
      canPerch: true,
      perchHeight: 0.24,
    });
  } else {
    // Forest: 28 trees + 10 boulders
    FOREST_TREES.forEach((t, idx) => {
      obstacles.push({
        id: `forest-tree-${idx + 1}`,
        name: `Tree ${idx + 1}`,
        shape: 'cylinder',
        x: t.x,
        z: t.z,
        y: getTerrainHeight(t.x, t.z, 'forest'),
        radius: 0.45,
        height: 4.0,
      });
    });

    FOREST_BOULDERS.forEach((b, idx) => {
      obstacles.push({
        id: `forest-boulder-${idx + 1}`,
        name: `Boulder ${idx + 1}`,
        shape: 'cylinder',
        x: b.x,
        z: b.z,
        y: getTerrainHeight(b.x, b.z, 'forest'),
        radius: b.radius,
        height: 0.85,
      });
    });
  }

  return obstacles;
}

/**
 * Checks and resolves collision between a moving point (with radius) and all scenery obstacles.
 * Modifies position in-place if collision occurs, pushing out along the contact normal.
 */
export function resolvePigeonCollision(
  pos: THREE.Vector3,
  radius: number,
  scenery: SceneryType,
  isPerched: boolean = false
): { collided: boolean; normal: THREE.Vector3; obstacle?: Obstacle } {
  const result = {
    collided: false,
    normal: new THREE.Vector3(0, 0, 0),
    obstacle: undefined as Obstacle | undefined,
  };

  // If perching on the fountain rim or a bench, normal ground collision is bypassed
  if (isPerched) return result;

  const obstacles = getObstaclesForScenery(scenery);

  // 1. Beach Ocean shoreline constraint:
  // Water begins at z = 8.5, shoreline surf at 8.5. Dry walkable sand strictly stops at z <= 6.5!
  if (scenery === 'beach') {
    const maxZ = 6.5;
    if (pos.z > maxZ) {
      pos.z = maxZ;
      result.collided = true;
      result.normal.set(0, 0, -1);
    }
  }

  // 2. World perimeter boundary constraint (keeps pigeons inside the scenic diorama)
  const maxWorldRadius = scenery === 'beach' ? 18.5 : 17.5;
  const dCenter = Math.hypot(pos.x, pos.z);
  if (dCenter > maxWorldRadius) {
    const factor = maxWorldRadius / dCenter;
    pos.x *= factor;
    pos.z *= factor;
    result.collided = true;
    result.normal.set(-pos.x / dCenter, 0, -pos.z / dCenter);
  }

  // 3. Scenery Props Obstacles (Fountain, Benches, Houses, Trees, Boulders)
  for (const obs of obstacles) {
    if (obs.shape === 'cylinder') {
      const obsR = obs.radius ?? 1.0;
      const combinedR = obsR + radius;
      const dx = pos.x - obs.x;
      const dz = pos.z - obs.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < combinedR * combinedR && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const overlap = combinedR - dist;
        const nx = dx / dist;
        const nz = dz / dist;

        // Push out along radial normal
        pos.x += nx * overlap;
        pos.z += nz * overlap;

        result.collided = true;
        result.normal.set(nx, 0, nz);
        result.obstacle = obs;
      }
    } else if (obs.shape === 'box') {
      const hw = (obs.width ?? 2.0) / 2 + radius;
      const hd = (obs.depth ?? 2.0) / 2 + radius;
      const rot = obs.rotationY ?? 0;

      // Transform point to box local coordinates
      const cos = Math.cos(-rot);
      const sin = Math.sin(-rot);
      const dx = pos.x - obs.x;
      const dz = pos.z - obs.z;
      const localX = cos * dx - sin * dz;
      const localZ = sin * dx + cos * dz;

      if (Math.abs(localX) < hw && Math.abs(localZ) < hd) {
        // Penetration along X and Z
        const penX = hw - Math.abs(localX);
        const penZ = hd - Math.abs(localZ);

        let pushLocalX = 0;
        let pushLocalZ = 0;
        let localNx = 0;
        let localNz = 0;

        if (penX < penZ) {
          pushLocalX = localX >= 0 ? penX : -penX;
          localNx = localX >= 0 ? 1 : -1;
        } else {
          pushLocalZ = localZ >= 0 ? penZ : -penZ;
          localNz = localZ >= 0 ? 1 : -1;
        }

        // Transform push back to world space
        const cosR = Math.cos(rot);
        const sinR = Math.sin(rot);
        pos.x += cosR * pushLocalX - sinR * pushLocalZ;
        pos.z += sinR * pushLocalX + cosR * pushLocalZ;

        const worldNx = cosR * localNx - sinR * localNz;
        const worldNz = sinR * localNx + cosR * localNz;

        result.collided = true;
        result.normal.set(worldNx, 0, worldNz);
        result.obstacle = obs;
      }
    }
  }

  return result;
}

/**
 * Verifies if a 2D ground coordinate is cleanly walkable and free of obstacles
 */
export function isPositionWalkable(x: number, z: number, scenery: SceneryType, margin: number = 0.5): boolean {
  if (scenery === 'beach' && z > 6.4) {
    return false; // too close to or in ocean water
  }

  const dCenter = Math.hypot(x, z);
  const maxR = scenery === 'beach' ? 18.0 : 17.0;
  if (dCenter > maxR) {
    return false;
  }

  const obstacles = getObstaclesForScenery(scenery);
  for (const obs of obstacles) {
    if (obs.shape === 'cylinder') {
      const r = (obs.radius ?? 1.0) + margin;
      const dx = x - obs.x;
      const dz = z - obs.z;
      if (dx * dx + dz * dz < r * r) {
        return false;
      }
    } else if (obs.shape === 'box') {
      const hw = (obs.width ?? 2.0) / 2 + margin;
      const hd = (obs.depth ?? 2.0) / 2 + margin;
      const rot = obs.rotationY ?? 0;
      const cos = Math.cos(-rot);
      const sin = Math.sin(-rot);
      const dx = x - obs.x;
      const dz = z - obs.z;
      const localX = cos * dx - sin * dz;
      const localZ = sin * dx + cos * dz;
      if (Math.abs(localX) < hw && Math.abs(localZ) < hd) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Finds the nearest valid walkable point if a coordinate lands inside an obstacle
 */
export function getNearestWalkablePosition(x: number, z: number, scenery: SceneryType): { x: number; z: number } {
  if (isPositionWalkable(x, z, scenery)) {
    return { x, z };
  }

  const testAngles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, -(3 * Math.PI) / 4, -Math.PI / 2, -Math.PI / 4];
  for (let r = 0.8; r <= 8.0; r += 0.8) {
    for (const a of testAngles) {
      const tx = x + Math.cos(a) * r;
      const tz = z + Math.sin(a) * r;
      if (isPositionWalkable(tx, tz, scenery)) {
        return { x: tx, z: tz };
      }
    }
  }

  // Safe fallback to central open space
  if (scenery === 'fountain') {
    return { x: 4.5, z: 0 }; // Open Piazza stone pavement just outside fountain rim
  }
  return { x: 0, z: 0 };
}

/**
 * Retrieves attractive perching spots (e.g. Roman fountain rim, stone benches)
 */
export function getAvailablePerchSpots(scenery: SceneryType): PerchSpot[] {
  const perches: PerchSpot[] = [];

  if (scenery === 'fountain') {
    // 14 points along the Roman fountain marble rim
    const rimRadius = 2.95;
    const rimHeight = 0.92;
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      perches.push({
        x: Math.cos(angle) * rimRadius,
        y: rimHeight,
        z: Math.sin(angle) * rimRadius,
        yaw: angle + Math.PI, // Facing inward toward water, or turn to face outward
        type: 'fountain_rim',
      });
    }

    // Benches
    FOUNTAIN_BENCHES.forEach((b) => {
      perches.push({
        x: b.x,
        y: 0.5,
        z: b.z,
        yaw: b.rot,
        type: 'bench',
      });
    });
  } else if (scenery === 'beach') {
    // Pier boardwalk spots
    for (let p = 0; p < 4; p++) {
      perches.push({
        x: -11.5 + (p % 2 === 0 ? -0.5 : 0.5),
        y: 0.24,
        z: 3.5 + p * 1.4,
        yaw: Math.PI / 2,
        type: 'pier',
      });
    }
  }

  return perches;
}

/**
 * Returns a random interesting exploration destination that is guaranteed open and walkable
 */
export function getRandomWalkableTarget(scenery: SceneryType, currentPos?: THREE.Vector3): THREE.Vector3 {
  let attempts = 0;
  while (attempts < 25) {
    attempts++;
    let x = 0;
    let z = 0;

    if (scenery === 'fountain') {
      // Pigeons love the grand open travertine piazza and stone avenue promenades
      const randMode = Math.random();
      if (randMode < 0.65) {
        // Wide open travertine piazza (radius 3.0 to 15.0m)
        const angle = Math.random() * Math.PI * 2;
        const r = 3.0 + Math.random() * 12.0;
        x = Math.cos(angle) * r;
        z = Math.sin(angle) * r;
      } else if (randMode < 0.85) {
        // Walk along North/South or East/West Roman stone avenues
        if (Math.random() < 0.5) {
          x = (Math.random() - 0.5) * 3.5;
          z = (Math.random() > 0.5 ? 1 : -1) * (11.0 + Math.random() * 6.5);
        } else {
          x = (Math.random() > 0.5 ? 1 : -1) * (11.0 + Math.random() * 6.5);
          z = (Math.random() - 0.5) * 3.5;
        }
      } else {
        // General forum exploration around perimeter terraces
        x = (Math.random() - 0.5) * 22.0;
        z = (Math.random() - 0.5) * 22.0;
      }
    } else if (scenery === 'beach') {
      // Dry sand and gentle dune crests
      x = (Math.random() - 0.5) * 16.0;
      z = -10.0 + Math.random() * 15.5; // strictly <= 5.5, dry sand
    } else {
      // Forest cozy meadow
      const angle = Math.random() * Math.PI * 2;
      const r = 1.0 + Math.random() * 12.0;
      x = Math.cos(angle) * r;
      z = Math.sin(angle) * r;
    }

    if (isPositionWalkable(x, z, scenery)) {
      const y = getTerrainHeight(x, z, scenery);
      return new THREE.Vector3(x, y, z);
    }
  }

  // Safe fallback
  const fallback = getNearestWalkablePosition(currentPos?.x ?? 0, currentPos?.z ?? 0, scenery);
  return new THREE.Vector3(fallback.x, getTerrainHeight(fallback.x, fallback.z, scenery), fallback.z);
}
