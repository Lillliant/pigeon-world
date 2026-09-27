import * as THREE from 'three';
import { Breadcrumb, SceneryType } from '../types';
import { getTerrainHeight } from './terrain';
import { getObstaclesForScenery, getNearestWalkablePosition } from './obstacles';
import { soundManager } from '../audio/soundManager';

interface CrumbParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

export class FeedManager {
  private scene: THREE.Scene;
  public breadcrumbs: Breadcrumb[] = [];
  private seedMeshMap: Map<string, THREE.Group> = new Map();
  private particles: CrumbParticle[] = [];
  private particleGroup: THREE.Group = new THREE.Group();

  // Materials & Geometries reused for performance
  private seedMaterial: THREE.MeshStandardMaterial;
  private crumbMaterial: THREE.MeshStandardMaterial;
  private waterSplashMaterial: THREE.MeshBasicMaterial;
  private seedGeometry: THREE.SphereGeometry;
  private crumbGeometry: THREE.DodecahedronGeometry;
  private ringGeometry: THREE.RingGeometry;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.particleGroup);

    this.seedMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // warm golden bread / seed
      roughness: 0.6,
      metalness: 0.05,
      flatShading: true,
    });

    this.crumbMaterial = new THREE.MeshStandardMaterial({
      color: 0xfde047, // bright golden crumb
      roughness: 0.5,
      flatShading: true,
    });

    this.waterSplashMaterial = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });

    this.seedGeometry = new THREE.SphereGeometry(0.08, 8, 6);
    this.seedGeometry.scale(1.35, 0.75, 1.0);
    this.crumbGeometry = new THREE.DodecahedronGeometry(0.04, 0);
    this.ringGeometry = new THREE.RingGeometry(0.05, 0.15, 12);
    this.ringGeometry.rotateX(-Math.PI / 2);
  }

  /**
   * Tosses a burst of physical seeds with parabolic ballistic physics from an origin toward a target point
   */
  public tossSeeds(
    targetX: number,
    targetZ: number,
    scenery: SceneryType,
    tossOrigin?: THREE.Vector3,
    count: number = 5
  ) {
    soundManager.ensureContext();
    soundManager.playSeedDrop();

    // Verify target doesn't land deep inside an impenetrable building
    const safeTarget = getNearestWalkablePosition(targetX, targetZ, scenery);

    const origin = tossOrigin || new THREE.Vector3(
      safeTarget.x + (Math.random() - 0.5) * 1.5,
      getTerrainHeight(safeTarget.x, safeTarget.z, scenery) + 2.4,
      safeTarget.z + (Math.random() - 0.5) * 1.5
    );

    const seedCount = count + Math.floor(Math.random() * 2);

    for (let i = 0; i < seedCount; i++) {
      const angle = (i / seedCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const spreadDist = 0.4 + Math.random() * 1.6;

      const destX = safeTarget.x + Math.cos(angle) * spreadDist;
      const destZ = safeTarget.z + Math.sin(angle) * spreadDist;

      // Calculate ballistic launch velocity
      const flightDuration = 0.45 + Math.random() * 0.25;
      const vx = (destX - origin.x) / flightDuration + (Math.random() - 0.5) * 0.8;
      const vz = (destZ - origin.z) / flightDuration + (Math.random() - 0.5) * 0.8;
      const vy = 2.4 + Math.random() * 1.8;

      const seed: Breadcrumb = {
        id: `seed-${Date.now()}-${Math.random()}`,
        x: origin.x,
        y: origin.y,
        z: origin.z,
        vx,
        vy,
        vz,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        vRotX: (Math.random() - 0.5) * 12,
        vRotY: (Math.random() - 0.5) * 12,
        vRotZ: (Math.random() - 0.5) * 12,
        isSettled: false,
        bounces: 0,
        remainingBites: 3.5,
        maxBites: 3.5,
        createdAt: Date.now(),
        targetedByCount: 0,
        inWater: false,
      };

      this.breadcrumbs.push(seed);

      // Create 3D Seed Mesh (cluster of 2-3 grains for cute tactile look)
      const seedGroup = new THREE.Group();
      const mainGrain = new THREE.Mesh(this.seedGeometry, this.seedMaterial);
      mainGrain.castShadow = true;
      seedGroup.add(mainGrain);

      if (Math.random() > 0.3) {
        const miniGrain = new THREE.Mesh(this.seedGeometry, this.seedMaterial);
        miniGrain.scale.set(0.65, 0.65, 0.65);
        miniGrain.position.set(0.06, 0.02, 0.05);
        miniGrain.rotation.set(0.3, 0.8, -0.2);
        seedGroup.add(miniGrain);
      }

      seedGroup.position.set(seed.x, seed.y, seed.z);
      this.scene.add(seedGroup);
      this.seedMeshMap.set(seed.id, seedGroup);
    }
  }

  /**
   * Applies an impulse to a seed when pecked by a pigeon's beak, generating crumbs
   */
  public applyPeckImpulse(seed: Breadcrumb, pigeonForward: THREE.Vector3, scenery: SceneryType) {
    seed.remainingBites -= 0.85;

    // Physical nudge from beak
    seed.vx += pigeonForward.x * 0.6 + (Math.random() - 0.5) * 0.4;
    seed.vz += pigeonForward.z * 0.6 + (Math.random() - 0.5) * 0.4;
    seed.vy += 0.4 + Math.random() * 0.4;
    seed.isSettled = false;

    soundManager.playSeedPeck();

    // Spawn tiny golden crumb explosion
    this.spawnCrumbParticles(seed.x, seed.y + 0.04, seed.z, 4);

    // If seed was on water in fountain, play gentle water splash
    if (seed.inWater) {
      soundManager.playWaterSplash();
      this.spawnWaterRipple(seed.x, seed.y, seed.z);
    }
  }

  private spawnCrumbParticles(x: number, y: number, z: number, count: number) {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.crumbGeometry, this.crumbMaterial);
      mesh.position.set(x, y, z);
      const s = 0.5 + Math.random() * 0.6;
      mesh.scale.set(s, s, s);
      this.particleGroup.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.5;
      this.particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: 1.2 + Math.random() * 1.8,
        vz: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
      });
    }
  }

  private spawnWaterRipple(x: number, y: number, z: number) {
    const ring = new THREE.Mesh(this.ringGeometry, this.waterSplashMaterial.clone());
    ring.position.set(x, y + 0.02, z);
    this.particleGroup.add(ring);

    this.particles.push({
      mesh: ring,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 0.6,
    });
  }

  /**
   * Updates physical simulation for all seeds and particles
   */
  public update(delta: number, scenery: SceneryType) {
    const gravity = -18.0;
    const obstacles = getObstaclesForScenery(scenery);

    // 1. Update Seeds Physics
    for (let i = this.breadcrumbs.length - 1; i >= 0; i--) {
      const seed = this.breadcrumbs[i];
      const mesh = this.seedMeshMap.get(seed.id);

      // Despawn condition: fully eaten or expired after 45 seconds
      if (seed.remainingBites <= 0 || Date.now() - seed.createdAt > 45000) {
        if (mesh) {
          this.scene.remove(mesh);
          mesh.traverse((c) => {
            if (c instanceof THREE.Mesh) {
              c.geometry.dispose();
              if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
              else c.material.dispose();
            }
          });
          this.seedMeshMap.delete(seed.id);
        }
        this.spawnCrumbParticles(seed.x, seed.y, seed.z, 5);
        this.breadcrumbs.splice(i, 1);
        continue;
      }

      if (!seed.isSettled) {
        // Apply ballistic gravity & air resistance
        seed.vy += gravity * delta;
        seed.vx *= Math.max(0, 1 - 0.6 * delta);
        seed.vz *= Math.max(0, 1 - 0.6 * delta);

        seed.x += seed.vx * delta;
        seed.y += seed.vy * delta;
        seed.z += seed.vz * delta;

        // Rotation spin
        seed.rotX += seed.vRotX * delta;
        seed.rotY += seed.vRotY * delta;
        seed.rotZ += seed.vRotZ * delta;

        // Terrain collision
        const terrainY = getTerrainHeight(seed.x, seed.z, scenery);
        let contactY = terrainY + 0.04;
        let onSpecialSurface = false;

        // Scenery-specific physical object interactions (Fountain Rim, Water Basin, Benches)
        if (scenery === 'fountain') {
          const dCenter = Math.hypot(seed.x, seed.z);
          // Fountain outer rim: radius ~4.25, height 0.94
          if (dCenter >= 3.85 && dCenter <= 4.85) {
            contactY = 0.94; // lands on marble fountain rim
            onSpecialSurface = true;
          } else if (dCenter < 3.85) {
            // Lands in fountain water pool!
            contactY = 0.82;
            onSpecialSurface = true;
            if (!seed.inWater && seed.y <= 0.86) {
              seed.inWater = true;
              soundManager.playWaterSplash();
              this.spawnWaterRipple(seed.x, 0.82, seed.z);
              // Float drag in water
              seed.vx *= 0.25;
              seed.vz *= 0.25;
            }
          }
        } else if (scenery === 'beach' && seed.z >= 8.5) {
          // Ocean water plane at y = 0.0
          contactY = 0.02;
          onSpecialSurface = true;
          if (!seed.inWater && seed.y <= 0.05) {
            seed.inWater = true;
            soundManager.playWaterSplash();
            this.spawnWaterRipple(seed.x, 0.02, seed.z);
          }
        }

        // Benches collision check
        if (!onSpecialSurface) {
          for (const obs of obstacles) {
            if (obs.canPerch && obs.shape === 'box') {
              const dx = seed.x - obs.x;
              const dz = seed.z - obs.z;
              const hw = (obs.width ?? 1.8) / 2;
              const hd = (obs.depth ?? 0.75) / 2;
              if (Math.abs(dx) < hw && Math.abs(dz) < hd) {
                contactY = obs.perchHeight ?? 0.5;
                onSpecialSurface = true;
                break;
              }
            }
          }
        }

        // Handle ground or surface impact bounce
        if (seed.y <= contactY) {
          seed.y = contactY;
          seed.bounces++;

          if (seed.inWater) {
            // Floats calmly on water surface
            seed.vy = 0;
            seed.vx = 0;
            seed.vz = 0;
            seed.isSettled = true;
          } else {
            // Elastic bounce off solid surface
            const restitution = 0.36;
            seed.vy = -seed.vy * restitution;
            seed.vx *= 0.65;
            seed.vz *= 0.65;

            if (Math.abs(seed.vy) > 0.4) {
              soundManager.playSeedBounce();
            }

            // Settle threshold
            const horizSpeed = Math.hypot(seed.vx, seed.vz);
            if ((Math.abs(seed.vy) < 0.25 && horizSpeed < 0.22) || seed.bounces > 4) {
              seed.isSettled = true;
              seed.vx = 0;
              seed.vy = 0;
              seed.vz = 0;
            }
          }
        }

        // If settled on ground, verify it didn't land inside a solid building wall
        if (seed.isSettled && !onSpecialSurface) {
          const safe = getNearestWalkablePosition(seed.x, seed.z, scenery);
          seed.x = safe.x;
          seed.z = safe.z;
          seed.y = getTerrainHeight(seed.x, seed.z, scenery) + 0.04;
        }
      }

      // Sync 3D Mesh
      if (mesh) {
        mesh.position.set(seed.x, seed.y, seed.z);
        if (!seed.isSettled) {
          mesh.rotation.set(seed.rotX, seed.rotY, seed.rotZ);
        } else if (seed.inWater) {
          // Gentle water bobbing
          const t = Date.now() * 0.003;
          mesh.position.y = seed.y + Math.sin(t + seed.x * 2) * 0.012;
        }

        // Scale seed smoothly as bites are eaten
        const scale = THREE.MathUtils.clamp(seed.remainingBites / seed.maxBites, 0.25, 1.0);
        mesh.scale.set(scale, scale, scale);
      }
    }

    // 2. Update Crumb & Splash Particles
    for (let p = this.particles.length - 1; p >= 0; p--) {
      const part = this.particles[p];
      part.life += delta;

      if (part.life >= part.maxLife) {
        this.particleGroup.remove(part.mesh);
        part.mesh.geometry.dispose();
        if (Array.isArray(part.mesh.material)) part.mesh.material.forEach((m) => m.dispose());
        else part.mesh.material.dispose();
        this.particles.splice(p, 1);
        continue;
      }

      // Animate particle
      const t = part.life / part.maxLife;
      if (part.vy !== 0 || part.vx !== 0) {
        part.vy += gravity * delta * 0.8;
        part.mesh.position.x += part.vx * delta;
        part.mesh.position.y += part.vy * delta;
        part.mesh.position.z += part.vz * delta;
        const s = (1 - t) * 0.8;
        part.mesh.scale.set(s, s, s);
      } else {
        // Water ripple expand & fade
        const rScale = 1.0 + t * 2.8;
        part.mesh.scale.set(rScale, rScale, rScale);
        if (part.mesh.material instanceof THREE.Material) {
          part.mesh.material.opacity = (1 - t) * 0.7;
        }
      }
    }
  }

  /**
   * Adapts existing feeds when switching sceneries:
   * Repositions seeds onto the new terrain/obstacles, preventing them from floating or being buried.
   */
  public remapSeedsToScenery(newScenery: SceneryType) {
    for (const seed of this.breadcrumbs) {
      // 1. Relocate seed out of any solid walls/buildings in the new scenery
      const safe = getNearestWalkablePosition(seed.x, seed.z, newScenery);
      seed.x = safe.x;
      seed.z = safe.z;

      // 2. Calculate new surface elevation
      let targetY = getTerrainHeight(seed.x, seed.z, newScenery) + 0.04;
      seed.inWater = false;

      if (newScenery === 'fountain') {
        const dCenter = Math.hypot(seed.x, seed.z);
        if (dCenter >= 3.85 && dCenter <= 4.85) {
          targetY = 0.94; // Fountain rim
        } else if (dCenter < 3.85) {
          targetY = 0.82; // Fountain water
          seed.inWater = true;
        }
      } else if (newScenery === 'beach' && seed.z >= 8.5) {
        targetY = 0.02;
        seed.inWater = true;
      }

      // 3. Give a soft drop animation so seeds land naturally on the new terrain
      seed.y = targetY + 0.8;
      seed.vy = 0.5;
      seed.vx = (Math.random() - 0.5) * 0.2;
      seed.vz = (Math.random() - 0.5) * 0.2;
      seed.isSettled = false;
      seed.bounces = 0;

      const mesh = this.seedMeshMap.get(seed.id);
      if (mesh) {
        mesh.position.set(seed.x, seed.y, seed.z);
      }
    }
  }

  public clearAll() {
    for (const [, mesh] of this.seedMeshMap) {
      this.scene.remove(mesh);
      mesh.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry.dispose();
          if (Array.isArray(c.material)) {
            c.material.forEach((m) => m.dispose());
          } else {
            c.material.dispose();
          }
        }
      });
    }
    this.seedMeshMap.clear();
    this.breadcrumbs = [];

    for (const part of this.particles) {
      this.particleGroup.remove(part.mesh);
      part.mesh.geometry.dispose();
      if (Array.isArray(part.mesh.material)) {
        part.mesh.material.forEach((m) => m.dispose());
      } else {
        part.mesh.material.dispose();
      }
    }
    this.particles = [];
  }

  public dispose() {
    this.clearAll();
    this.scene.remove(this.particleGroup);
    this.seedMaterial.dispose();
    this.crumbMaterial.dispose();
    this.waterSplashMaterial.dispose();
    this.seedGeometry.dispose();
    this.crumbGeometry.dispose();
    this.ringGeometry.dispose();
  }
}
