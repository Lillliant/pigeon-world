import * as THREE from 'three';
import { getTerrainHeight, getTerrainNormal } from './terrain';
import { soundManager } from '../audio/soundManager';
import { PigeonState, Breadcrumb, SceneryType } from '../types';
import {
  resolvePigeonCollision,
  isPositionWalkable,
  getRandomWalkableTarget,
  getAvailablePerchSpots,
  PerchSpot,
} from './obstacles';

export class Pigeon {
  public id: string;
  public group: THREE.Group;
  public state: PigeonState = 'IDLE';

  // Hierarchical 3D body parts
  private bodyMesh: THREE.Mesh;
  private breastMesh: THREE.Mesh;
  private neckGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftWing: THREE.Group;
  private rightWing: THREE.Group;
  private tailMesh: THREE.Mesh;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;

  // Spatial & physical state
  public position: THREE.Vector3;
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public forward: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  public currentYaw: number = 0;
  public targetYaw: number = 0;
  public pitch: number = 0;
  public roll: number = 0;

  // Scenery reference
  private currentScenery: SceneryType = 'forest';

  // AI Timers & targets
  private stateTimer: number = 0;
  private walkTarget: THREE.Vector3 = new THREE.Vector3();
  private flightTimer: number = 0;
  private maxFlightDuration: number = 5.5;
  private landingTarget: THREE.Vector3 = new THREE.Vector3();

  // Stuck detection metrics
  private lastPositionCheck: THREE.Vector3 = new THREE.Vector3();
  private stuckTimer: number = 0;
  private consecutiveStuckCount: number = 0;

  // Perch state metrics
  private currentPerch: PerchSpot | null = null;
  private isPerched: boolean = false;
  private perchActionTimer: number = 0;

  // Animation variables
  private animClock: number = Math.random() * 100;
  private wingFlapSpeed: number = 0;
  private headTwitchAngle: number = 0;
  private isSelected: boolean = false;

  // Physical personal space radius
  public readonly personalRadius: number = 0.38;

  constructor(id: string, initialX: number, initialZ: number, initialScenery: SceneryType = 'forest') {
    this.id = id;
    this.currentScenery = initialScenery;

    // Ensure initial spawn is in a strictly walkable, valid location
    let spawnX = initialX;
    let spawnZ = initialZ;
    if (!isPositionWalkable(spawnX, spawnZ, initialScenery)) {
      const safe = getRandomWalkableTarget(initialScenery);
      spawnX = safe.x;
      spawnZ = safe.z;
    }

    const groundY = getTerrainHeight(spawnX, spawnZ, initialScenery);
    this.position = new THREE.Vector3(spawnX, groundY, spawnZ);
    this.lastPositionCheck.copy(this.position);

    this.currentYaw = Math.random() * Math.PI * 2;
    this.targetYaw = this.currentYaw;

    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    // Build the 3D pigeon model
    const { body, breast, neck, head, leftWing, rightWing, tail, leftLeg, rightLeg } = this.buildPigeonModel();
    this.bodyMesh = body;
    this.breastMesh = breast;
    this.neckGroup = neck;
    this.headGroup = head;
    this.leftWing = leftWing;
    this.rightWing = rightWing;
    this.tailMesh = tail;
    this.leftLeg = leftLeg;
    this.rightLeg = rightLeg;

    this.maxFlightDuration = 4 + Math.random() * 4;
    this.pickNewWalkTarget();
  }

  public setScenery(scenery: SceneryType) {
    this.currentScenery = scenery;
    this.isPerched = false;
    this.currentPerch = null;

    if (!isPositionWalkable(this.position.x, this.position.z, scenery)) {
      const safe = getRandomWalkableTarget(scenery);
      this.position.x = safe.x;
      this.position.z = safe.z;
    }

    if (this.state !== 'FLY' && this.state !== 'TAKEOFF') {
      this.position.y = Math.max(0.05, getTerrainHeight(this.position.x, this.position.z, this.currentScenery));
    }

    this.pickNewWalkTarget();
  }

  private buildPigeonModel() {
    const featherWhite = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      roughness: 0.75,
      metalness: 0.04,
    });

    const neckIridescent = new THREE.MeshStandardMaterial({
      color: 0xf3f0fa,
      roughness: 0.52,
      metalness: 0.16,
    });

    const beakMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.45,
    });

    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.15,
    });

    const eyeRingMaterial = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.4,
    });

    const feetMaterial = new THREE.MeshStandardMaterial({
      color: 0xf87171,
      roughness: 0.6,
    });

    // Body
    const bodyGeom = new THREE.SphereGeometry(0.42, 20, 16);
    const body = new THREE.Mesh(bodyGeom, featherWhite);
    body.scale.set(0.82, 0.78, 1.25);
    body.position.set(0, 0.42, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    this.group.add(body);

    // Breast / Crop transition collar (anchored on body, creates a seamless throat-to-chest contour)
    const breastGeom = new THREE.SphereGeometry(0.26, 16, 14);
    const breast = new THREE.Mesh(breastGeom, neckIridescent);
    breast.scale.set(0.92, 0.96, 1.15);
    breast.position.set(0, 0.46, 0.22);
    breast.rotation.x = 0.32;
    breast.castShadow = true;
    breast.receiveShadow = true;
    this.group.add(breast);

    // Neck Pivot Group (hinged at the upper chest / breast socket)
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, 0.46, 0.22);

    // Base collar that sits deep inside the breast socket
    const neckBaseGeom = new THREE.SphereGeometry(0.20, 16, 12);
    const neckBase = new THREE.Mesh(neckBaseGeom, neckIridescent);
    neckBase.position.set(0, 0.02, 0.02);
    neckBase.castShadow = true;
    neckGroup.add(neckBase);

    // Main iridescent neck column
    const neckGeom = new THREE.CylinderGeometry(0.15, 0.20, 0.32, 16);
    const neck = new THREE.Mesh(neckGeom, neckIridescent);
    neck.position.set(0, 0.14, 0.04);
    neck.rotation.x = 0.16;
    neck.castShadow = true;
    neckGroup.add(neck);

    // Head mounted at top of neckGroup
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.26, 0.08);

    const headGeom = new THREE.SphereGeometry(0.21, 18, 14);
    const headMesh = new THREE.Mesh(headGeom, featherWhite);
    headMesh.position.set(0, 0.04, 0.04);
    headMesh.scale.set(0.92, 0.96, 1.06);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Beak
    const beakGeom = new THREE.ConeGeometry(0.065, 0.24, 12);
    beakGeom.rotateX(Math.PI / 2);
    const beak = new THREE.Mesh(beakGeom, beakMaterial);
    beak.position.set(0, 0.01, 0.26);
    beak.scale.set(0.9, 0.7, 1);
    beak.castShadow = true;
    headGroup.add(beak);

    // Eyes
    const eyeGeom = new THREE.SphereGeometry(0.045, 12, 10);
    const leftEye = new THREE.Mesh(eyeGeom, eyeMaterial);
    leftEye.position.set(-0.16, 0.06, 0.08);
    headGroup.add(leftEye);

    const eyeRingGeom = new THREE.RingGeometry(0.04, 0.065, 16);
    eyeRingGeom.rotateY(-Math.PI / 2);
    const leftEyeRing = new THREE.Mesh(eyeRingGeom, eyeRingMaterial);
    leftEyeRing.position.set(-0.165, 0.06, 0.08);
    headGroup.add(leftEyeRing);

    const rightEye = new THREE.Mesh(eyeGeom, eyeMaterial);
    rightEye.position.set(0.16, 0.06, 0.08);
    headGroup.add(rightEye);

    const rightEyeRing = new THREE.Mesh(eyeRingGeom, eyeRingMaterial);
    rightEyeRing.position.set(0.165, 0.06, 0.08);
    rightEyeRing.rotation.y = Math.PI;
    headGroup.add(rightEyeRing);

    neckGroup.add(headGroup);
    this.group.add(neckGroup);

    // Wings
    const createWingMesh = (isLeft: boolean): THREE.Group => {
      const wingPivot = new THREE.Group();
      wingPivot.position.set(isLeft ? -0.32 : 0.32, 0.46, 0.05);

      const wingGeom = new THREE.BoxGeometry(0.12, 0.65, 0.25);
      wingGeom.translate(0, 0, -0.2);
      const wingMesh = new THREE.Mesh(wingGeom, featherWhite);
      wingMesh.scale.set(0.6, 0.25, 2.2);
      wingMesh.rotation.x = -0.15;
      wingMesh.castShadow = true;
      wingPivot.add(wingMesh);

      return wingPivot;
    };

    const leftWing = createWingMesh(true);
    const rightWing = createWingMesh(false);
    this.group.add(leftWing);
    this.group.add(rightWing);

    // Tail
    const tailGeom = new THREE.BoxGeometry(0.32, 0.04, 0.45);
    tailGeom.translate(0, 0, -0.22);
    const tail = new THREE.Mesh(tailGeom, featherWhite);
    tail.position.set(0, 0.36, -0.42);
    tail.rotation.x = -0.35;
    tail.castShadow = true;
    this.group.add(tail);

    // Feet
    const createLeg = (isLeft: boolean): THREE.Group => {
      const legGroup = new THREE.Group();
      legGroup.position.set(isLeft ? -0.12 : 0.12, 0.18, 0.0);

      const legGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.2, 8);
      const leg = new THREE.Mesh(legGeom, feetMaterial);
      leg.position.y = -0.05;
      legGroup.add(leg);

      const toeGeom = new THREE.BoxGeometry(0.12, 0.02, 0.15);
      toeGeom.translate(0, 0, 0.05);
      const toe = new THREE.Mesh(toeGeom, feetMaterial);
      toe.position.set(0, -0.15, 0);
      legGroup.add(toe);

      return legGroup;
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    this.group.add(leftLeg);
    this.group.add(rightLeg);

    return { body, breast, neck: neckGroup, head: headGroup, leftWing, rightWing, tail, leftLeg, rightLeg };
  }

  public setSelected(selected: boolean) {
    this.isSelected = selected;
  }

  public scare(origin?: THREE.Vector3) {
    if (this.state === 'TAKEOFF' || this.state === 'FLY') return;

    this.isPerched = false;
    this.currentPerch = null;
    this.state = 'TAKEOFF';
    this.stateTimer = 0;
    this.flightTimer = 0;
    this.maxFlightDuration = 4 + Math.random() * 4;

    if (origin) {
      const fleeDir = new THREE.Vector3().subVectors(this.position, origin).normalize();
      fleeDir.y = 0;
      if (fleeDir.lengthSq() < 0.01) {
        fleeDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
      }
      this.targetYaw = Math.atan2(fleeDir.x, fleeDir.z) + (Math.random() - 0.5) * 0.5;
      this.currentYaw = this.targetYaw; // Instantly face flee direction for ultra-responsive scatter!
      this.velocity.set(fleeDir.x * 5.2, 6.8 + Math.random() * 2.2, fleeDir.z * 5.2);
    } else {
      const angle = this.currentYaw + (Math.random() - 0.5) * 1.2;
      this.targetYaw = angle;
      this.currentYaw = this.targetYaw;
      this.velocity.set(Math.sin(angle) * 5.2, 6.8 + Math.random() * 2.0, Math.cos(angle) * 5.2);
    }

    soundManager.playWingFlap(1.0);
    if (Math.random() < 0.35) {
      soundManager.playCoo();
    }
  }

  /**
   * Intelligently picks a new walkable destination, avoiding obstacles and encouraging exploration
   */
  private pickNewWalkTarget() {
    this.isPerched = false;
    this.currentPerch = null;

    // Check for interesting nearby perches (like the Roman fountain rim or bench)
    if (this.currentScenery === 'fountain' && Math.random() < 0.18) {
      const perches = getAvailablePerchSpots(this.currentScenery);
      if (perches.length > 0) {
        // Pick nearest or random perch
        const perch = perches[Math.floor(Math.random() * perches.length)];
        const dist = Math.hypot(perch.x - this.position.x, perch.z - this.position.z);
        if (dist < 10) {
          this.currentPerch = perch;
          this.walkTarget.set(perch.x, perch.y, perch.z);
          const dir = new THREE.Vector3().subVectors(this.walkTarget, this.position);
          this.targetYaw = Math.atan2(dir.x, dir.z);
          return;
        }
      }
    }

    const target = getRandomWalkableTarget(this.currentScenery, this.position);
    this.walkTarget.copy(target);
    const dir = new THREE.Vector3().subVectors(this.walkTarget, this.position);
    this.targetYaw = Math.atan2(dir.x, dir.z);
  }

  /**
   * Main update loop with obstacle collision avoidance, pigeon repulsion, and stuck resolution
   */
  public update(
    delta: number,
    cursorPos: THREE.Vector3 | null,
    cursorSpeed: number,
    otherPigeons: Pigeon[],
    breadcrumbs: Breadcrumb[],
    onPeckSeed?: (seed: Breadcrumb, pigeonForward: THREE.Vector3) => void
  ) {
    this.animClock += delta;
    this.stateTimer += delta;

    switch (this.state) {
      case 'IDLE':
        this.updateIdle(delta, breadcrumbs);
        break;
      case 'WALK':
        this.updateWalk(delta, breadcrumbs, onPeckSeed);
        break;
      case 'PECK':
        this.updatePeck(delta, breadcrumbs, onPeckSeed);
        break;
      case 'ALERT':
        this.updateAlert(delta);
        break;
      case 'PERCH':
        this.updatePerch(delta);
        break;
      case 'HOP':
        this.updateHop(delta);
        break;
      case 'TAKEOFF':
        this.updateTakeoff(delta);
        break;
      case 'FLY':
      case 'GLIDE':
        this.updateFly(delta, otherPigeons, cursorPos);
        break;
      case 'LAND':
        this.updateLand(delta);
        break;
    }

    // Apply ground-level pigeon-to-pigeon physical soft-body repulsion (prevents merging into 1 blob!)
    if (this.state === 'IDLE' || this.state === 'WALK' || this.state === 'PECK') {
      this.resolveFlockGroundSeparation(otherPigeons, delta);
    }

    // Flock panic contagion: nearby grounded flockmates react when a neighbor bursts into flight
    if (this.state === 'IDLE' || this.state === 'WALK' || this.state === 'PECK' || this.state === 'PERCH') {
      for (const other of otherPigeons) {
        if (other === this) continue;
        if (other.state === 'TAKEOFF' && other.stateTimer < 0.20) {
          const d = this.position.distanceTo(other.position);
          if (d < 1.6 && Math.random() < 0.45) {
            this.scare(other.position);
            break;
          }
        }
      }
    }

    // Apply obstacle collision resolution on ground
    if (this.state !== 'FLY' && this.state !== 'TAKEOFF' && this.state !== 'PERCH') {
      const colResult = resolvePigeonCollision(this.position, this.personalRadius, this.currentScenery, this.isPerched);
      if (colResult.collided && this.state === 'WALK') {
        // If walking directly into an obstacle, slide tangentially along normal
        const normal = colResult.normal;
        const forward = new THREE.Vector3(Math.sin(this.currentYaw), 0, Math.cos(this.currentYaw));
        const dot = forward.dot(normal);
        if (dot < -0.1) {
          // Deflect forward vector along wall surface
          forward.sub(normal.clone().multiplyScalar(dot)).normalize();
          this.targetYaw = Math.atan2(forward.x, forward.z);
        }
      }
    }

    // Turn yaw smoothly toward targetYaw
    let angleDiff = this.targetYaw - this.currentYaw;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    const turnSpeed = this.state === 'FLY' ? 3.8 : 5.8;
    this.currentYaw += angleDiff * Math.min(delta * turnSpeed, 1.0);

    // Synchronize 3D Group
    this.group.position.copy(this.position);
    this.group.rotation.set(0, 0, 0);
    this.group.rotateY(this.currentYaw);
    this.group.rotateX(this.pitch);
    this.group.rotateZ(this.roll);

    this.animateModel(delta);
  }

  /**
   * Soft repulsion force keeping pigeons from occupying the same space on the ground
   */
  private resolveFlockGroundSeparation(otherPigeons: Pigeon[], delta: number) {
    const minDistance = this.personalRadius * 2; // ~0.76m
    const pushForce = new THREE.Vector3();

    for (const other of otherPigeons) {
      if (other === this) continue;
      if (other.state === 'FLY' || other.state === 'TAKEOFF' || other.state === 'PERCH') continue;

      const dx = this.position.x - other.position.x;
      const dz = this.position.z - other.position.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < minDistance * minDistance && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const overlap = (minDistance - dist) * 0.5;
        const nx = dx / dist;
        const nz = dz / dist;

        pushForce.x += nx * overlap * 3.5;
        pushForce.z += nz * overlap * 3.5;
      }
    }

    if (pushForce.lengthSq() > 0.0001) {
      this.position.x += pushForce.x * delta;
      this.position.z += pushForce.z * delta;
    }
  }

  private updateIdle(delta: number, breadcrumbs: Breadcrumb[]) {
    // Check for nearby food that isn't already mobbed
    const nearestBread = this.findBestBreadcrumb(breadcrumbs, 14);
    if (nearestBread) {
      this.walkTarget.set(nearestBread.x, nearestBread.y, nearestBread.z);
      const dir = new THREE.Vector3().subVectors(this.walkTarget, this.position);
      this.targetYaw = Math.atan2(dir.x, dir.z);
      this.state = 'WALK';
      this.stateTimer = 0;
      return;
    }

    if (this.stateTimer > 0.5 && Math.random() < 0.06) {
      this.headTwitchAngle = (Math.random() - 0.5) * 0.8;
      if (Math.random() < 0.035) {
        soundManager.playCoo();
      }
    }

    // Active wandering: don't sit still forever! Pick a new walk target after 1.4 to 3.2s
    if (this.stateTimer > 1.4 + Math.random() * 1.8) {
      // Small chance to do an agile hop
      if (Math.random() < 0.12) {
        this.initiateHop();
        return;
      }

      this.state = 'WALK';
      this.stateTimer = 0;
      this.pickNewWalkTarget();
    }

    this.pitch = THREE.MathUtils.lerp(this.pitch, 0, delta * 8);
    this.roll = THREE.MathUtils.lerp(this.roll, 0, delta * 8);
  }

  private updateWalk(
    delta: number,
    breadcrumbs: Breadcrumb[],
    onPeckSeed?: (seed: Breadcrumb, forward: THREE.Vector3) => void
  ) {
    const nearestBread = this.findBestBreadcrumb(breadcrumbs, 14);
    if (nearestBread) {
      this.walkTarget.set(nearestBread.x, nearestBread.y, nearestBread.z);
    }

    const toTarget = new THREE.Vector3().subVectors(this.walkTarget, this.position);
    toTarget.y = 0;
    const dist = toTarget.length();

    // Check if arrived at target
    if (dist < 0.45) {
      if (nearestBread && dist < 0.75) {
        this.state = 'PECK';
        this.stateTimer = 0;
        return;
      }

      // If walking to a perch on the fountain rim or bench, hop up to perch!
      if (this.currentPerch && dist < 0.8) {
        this.isPerched = true;
        this.state = 'PERCH';
        this.stateTimer = 0;
        this.position.set(this.currentPerch.x, this.currentPerch.y, this.currentPerch.z);
        this.targetYaw = this.currentPerch.yaw;
        return;
      }

      this.state = 'IDLE';
      this.stateTimer = 0;
      return;
    }

    // Look-ahead obstacle avoidance steering (whiskers)
    const forwardX = Math.sin(this.currentYaw);
    const forwardZ = Math.cos(this.currentYaw);
    const probeDist = 1.0;
    const probeX = this.position.x + forwardX * probeDist;
    const probeZ = this.position.z + forwardZ * probeDist;

    if (!isPositionWalkable(probeX, probeZ, this.currentScenery, this.personalRadius)) {
      // Steer tangential to the obstacle to glide around it
      const leftX = Math.sin(this.currentYaw - 0.75) * probeDist;
      const leftZ = Math.cos(this.currentYaw - 0.75) * probeDist;
      const isLeftClear = isPositionWalkable(this.position.x + leftX, this.position.z + leftZ, this.currentScenery);

      if (isLeftClear) {
        this.targetYaw -= 0.6;
      } else {
        this.targetYaw += 0.6;
      }
    } else {
      this.targetYaw = Math.atan2(toTarget.x, toTarget.z);
    }

    const walkSpeed = 1.45;
    this.position.x += forwardX * walkSpeed * delta;
    this.position.z += forwardZ * walkSpeed * delta;

    // Ground elevation
    this.position.y = Math.max(0.05, getTerrainHeight(this.position.x, this.position.z, this.currentScenery));

    // Pitch & roll match terrain slope
    const normal = getTerrainNormal(this.position.x, this.position.z, this.currentScenery);
    const targetPitch = normal.z * 0.26;
    const targetRoll = -normal.x * 0.26;
    this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch, delta * 6);
    this.roll = THREE.MathUtils.lerp(this.roll, targetRoll, delta * 6);

    // --- STUCK DETECTION ---
    this.stuckTimer += delta;
    if (this.stuckTimer > 0.6) {
      const movedDist = this.position.distanceTo(this.lastPositionCheck);
      this.lastPositionCheck.copy(this.position);
      this.stuckTimer = 0;

      if (movedDist < 0.08) {
        this.consecutiveStuckCount++;
        // Pigeon is stuck against a wall or obstacle!
        if (this.consecutiveStuckCount >= 2) {
          // Do a hop or reverse completely
          this.consecutiveStuckCount = 0;
          if (Math.random() < 0.45) {
            this.initiateHop();
          } else {
            this.targetYaw += Math.PI + (Math.random() - 0.5) * 0.8;
            this.pickNewWalkTarget();
          }
          return;
        }
      } else {
        this.consecutiveStuckCount = 0;
      }
    }

    // After 5.5s walking, transition to new target or idle
    if (this.stateTimer > 5.5) {
      this.state = 'IDLE';
      this.stateTimer = 0;
    }
  }

  private updatePeck(
    delta: number,
    breadcrumbs: Breadcrumb[],
    onPeckSeed?: (seed: Breadcrumb, forward: THREE.Vector3) => void
  ) {
    // Find closest breadcrumb within pecking reach
    let closestBread: Breadcrumb | null = null;
    let minDist = 0.85;

    for (const b of breadcrumbs) {
      if (b.remainingBites <= 0) continue;
      const d = Math.hypot(b.x - this.position.x, b.z - this.position.z);
      if (d < minDist) {
        minDist = d;
        closestBread = b;
      }
    }

    if (closestBread && onPeckSeed && Math.random() < 0.08) {
      const forward = new THREE.Vector3(Math.sin(this.currentYaw), 0, Math.cos(this.currentYaw));
      onPeckSeed(closestBread, forward);
    }

    if (this.stateTimer > 1.6 + Math.random() * 1.2) {
      // Finished eating this crumb: don't freeze! Look for next or wander off
      this.state = 'IDLE';
      this.stateTimer = 0;
      if (Math.random() < 0.3) {
        soundManager.playCoo();
      }
    }

    this.pitch = THREE.MathUtils.lerp(this.pitch, 0, delta * 8);
    this.roll = THREE.MathUtils.lerp(this.roll, 0, delta * 8);
  }

  /**
   * Perching state on the Roman fountain rim or bench
   */
  private updatePerch(delta: number) {
    this.perchActionTimer += delta;

    // Subtle head preening / drinking / looking around
    if (this.perchActionTimer > 0.8 && Math.random() < 0.08) {
      this.headTwitchAngle = (Math.random() - 0.5) * 1.1;
      // Head dipping to drink fountain water!
      if (this.currentPerch?.type === 'fountain_rim' && Math.random() < 0.4) {
        soundManager.playWaterSplash();
      }
    }

    // Leave perch after 3 to 7 seconds
    if (this.stateTimer > 3.0 + Math.random() * 4.0) {
      this.isPerched = false;
      this.currentPerch = null;
      if (Math.random() < 0.4) {
        this.scare(); // fly off
      } else {
        this.initiateHop(); // hop down to stone pavement
      }
    }
  }

  /**
   * Agile flutter hop to clear obstacles or reposition
   */
  private initiateHop() {
    this.state = 'HOP';
    this.stateTimer = 0;
    const forwardX = Math.sin(this.currentYaw);
    const forwardZ = Math.cos(this.currentYaw);
    this.velocity.set(forwardX * 2.2, 3.2, forwardZ * 2.2);
    soundManager.playWingFlap(0.5);
  }

  private updateHop(delta: number) {
    this.velocity.y -= 14.0 * delta;
    this.position.addScaledVector(this.velocity, delta);

    const groundY = Math.max(0.05, getTerrainHeight(this.position.x, this.position.z, this.currentScenery));
    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocity.set(0, 0, 0);
      this.state = 'IDLE';
      this.stateTimer = 0;
      this.pickNewWalkTarget();
    }
  }

  private updateAlert(delta: number) {
    if (this.stateTimer > 1.0) {
      this.state = 'IDLE';
      this.stateTimer = 0;
    }
  }

  private updateTakeoff(delta: number) {
    this.position.addScaledVector(this.velocity, delta);
    this.velocity.y += 1.2 * delta;
    this.pitch = -0.35;

    const terrainY = getTerrainHeight(this.position.x, this.position.z, this.currentScenery);
    if (this.position.y > terrainY + 2.4 || this.stateTimer > 0.7) {
      this.state = 'FLY';
      this.stateTimer = 0;
      this.flightTimer = 0;
    }
  }

  private updateFly(delta: number, otherPigeons: Pigeon[], cursorPos: THREE.Vector3 | null) {
    this.flightTimer += delta;
    const steer = new THREE.Vector3();

    // Flight altitude
    const groundY = getTerrainHeight(this.position.x, this.position.z, this.currentScenery);
    const targetAltitude = groundY + 2.8 + Math.sin(this.animClock * 0.8 + this.position.x * 0.12) * 1.0;
    const altitudeError = targetAltitude - this.position.y;
    steer.y = altitudeError * 1.8;

    // Firm circular boundary pull keeping flock inside diorama
    const distFromCenter = Math.hypot(this.position.x, this.position.z);
    if (distFromCenter > 11.5) {
      const pull = (distFromCenter - 11.5) * 0.85;
      steer.x -= (this.position.x / distFromCenter) * pull;
      steer.z -= (this.position.z / distFromCenter) * pull;
    }

    if (this.currentScenery === 'beach' && this.position.z > 5.5) {
      steer.z -= (this.position.z - 5.5) * 3.0;
    }

    if (cursorPos) {
      const toPigeon = new THREE.Vector3().subVectors(this.position, cursorPos);
      const dCursor = toPigeon.length();
      if (dCursor < 8) {
        toPigeon.normalize();
        steer.x += toPigeon.x * (9 - dCursor) * 1.2;
        steer.z += toPigeon.z * (9 - dCursor) * 1.2;
      }
    }

    let neighborCount = 0;
    const avgVelocity = new THREE.Vector3();
    const separation = new THREE.Vector3();

    for (const other of otherPigeons) {
      if (other === this || (other.state !== 'FLY' && other.state !== 'TAKEOFF')) continue;
      const dist = this.position.distanceTo(other.position);
      if (dist < 6) {
        neighborCount++;
        avgVelocity.add(other.velocity);
        if (dist < 2.0) {
          const repel = new THREE.Vector3().subVectors(this.position, other.position).normalize();
          separation.add(repel.multiplyScalar((2.0 - dist) * 2));
        }
      }
    }

    if (neighborCount > 0) {
      avgVelocity.divideScalar(neighborCount);
      steer.add(avgVelocity.multiplyScalar(0.4));
      steer.add(separation.multiplyScalar(1.2));
    }

    steer.x += Math.sin(this.animClock * 1.1 + this.position.z * 0.12) * 1.6;
    steer.z += Math.cos(this.animClock * 0.9 + this.position.x * 0.12) * 1.6;

    this.velocity.addScaledVector(steer, delta * 3.5);
    const horizSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    const minSpeed = 3.6;
    const maxSpeed = 6.2;
    if (horizSpeed < minSpeed) {
      const f = minSpeed / Math.max(horizSpeed, 0.01);
      this.velocity.x *= f;
      this.velocity.z *= f;
    } else if (horizSpeed > maxSpeed) {
      const f = maxSpeed / horizSpeed;
      this.velocity.x *= f;
      this.velocity.z *= f;
    }
    this.velocity.y = THREE.MathUtils.clamp(this.velocity.y, -2.4, 2.8);

    this.position.addScaledVector(this.velocity, delta);
    this.targetYaw = Math.atan2(this.velocity.x, this.velocity.z);

    let yawDiff = this.targetYaw - this.currentYaw;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
    this.roll = THREE.MathUtils.lerp(this.roll, -yawDiff * 0.7, delta * 4);
    this.pitch = THREE.MathUtils.lerp(this.pitch, -this.velocity.y * 0.08, delta * 4);

    if (this.flightTimer > this.maxFlightDuration) {
      const cursorDist = cursorPos ? this.position.distanceTo(cursorPos) : 999;
      if (cursorDist > 6) {
        this.initiateLanding();
      }
    }
  }

  private initiateLanding() {
    this.state = 'LAND';
    this.stateTimer = 0;

    const safeTarget = getRandomWalkableTarget(this.currentScenery);
    this.landingTarget.copy(safeTarget);
  }

  private updateLand(delta: number) {
    const toTarget = new THREE.Vector3().subVectors(this.landingTarget, this.position);
    const horizDist = Math.hypot(toTarget.x, toTarget.z);
    const groundY = Math.max(0.05, getTerrainHeight(this.position.x, this.position.z, this.currentScenery));

    if (this.position.y <= groundY + 0.1 || horizDist < 0.4 || this.stateTimer > 4.0) {
      this.position.y = groundY;
      this.state = 'IDLE';
      this.stateTimer = 0;
      this.velocity.set(0, 0, 0);
      this.pitch = 0;
      this.roll = 0;
      if (Math.random() < 0.25) {
        soundManager.playCoo();
      }
      return;
    }

    this.targetYaw = Math.atan2(toTarget.x, toTarget.z);
    const approachSpeed = THREE.MathUtils.clamp(horizDist * 1.5, 1.8, 4.2);
    this.position.x += Math.sin(this.currentYaw) * approachSpeed * delta;
    this.position.z += Math.cos(this.currentYaw) * approachSpeed * delta;
    this.position.y = THREE.MathUtils.lerp(this.position.y, groundY, delta * 2.5);

    this.pitch = THREE.MathUtils.lerp(this.pitch, 0.3, delta * 3);
    this.roll = THREE.MathUtils.lerp(this.roll, 0, delta * 4);
  }

  private animateModel(delta: number) {
    if (this.state === 'FLY' || this.state === 'TAKEOFF' || this.state === 'LAND' || this.state === 'HOP') {
      this.wingFlapSpeed = this.state === 'TAKEOFF' ? 24 : this.state === 'LAND' ? 11 : 16;
      const flapPhase = Math.sin(this.animClock * this.wingFlapSpeed);

      this.leftWing.rotation.z = Math.PI / 2 + flapPhase * 0.85;
      this.rightWing.rotation.z = -Math.PI / 2 - flapPhase * 0.85;
      this.leftWing.rotation.x = -flapPhase * 0.2;
      this.rightWing.rotation.x = -flapPhase * 0.2;

      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 1.2, delta * 6);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 1.2, delta * 6);

      this.tailMesh.rotation.x = -0.15 + flapPhase * 0.1;
      this.bodyMesh.rotation.x = 0;
      this.bodyMesh.rotation.z = 0;

      // Streamlined neck & head aligned with flight
      this.neckGroup.position.set(0, 0.46, 0.23);
      this.neckGroup.rotation.x = -0.14;
      this.neckGroup.rotation.y = 0;
      this.headGroup.position.set(0, 0.26, 0.08);
      this.headGroup.rotation.x = 0.12;
      this.headGroup.rotation.y = 0;
    } else if (this.state === 'WALK') {
      this.leftWing.rotation.z = 0.08;
      this.rightWing.rotation.z = -0.08;
      this.leftWing.rotation.x = -0.15;
      this.rightWing.rotation.x = -0.15;

      const stepFreq = 8.5;
      const stepCycle = this.animClock * stepFreq;
      const thrust = (Math.sin(stepCycle) + 1) * 0.5;

      // Natural pigeon head bobbing hinged at breast anchor - zero disconnection!
      this.neckGroup.position.set(
        0,
        0.46 + Math.abs(Math.sin(stepCycle * 2)) * 0.012,
        0.22 + thrust * 0.03
      );
      this.neckGroup.rotation.x = 0.06 + thrust * 0.24;
      this.neckGroup.rotation.y = this.headTwitchAngle * 0.25;

      this.headGroup.position.set(0, 0.26, 0.08);
      this.headGroup.rotation.x = -thrust * 0.20;
      this.headGroup.rotation.y = this.headTwitchAngle * 0.35;

      this.leftLeg.rotation.x = Math.sin(stepCycle) * 0.65;
      this.rightLeg.rotation.x = -Math.sin(stepCycle) * 0.65;

      this.bodyMesh.rotation.x = 0;
      this.bodyMesh.rotation.z = Math.sin(stepCycle) * 0.06;
      this.tailMesh.rotation.x = -0.35 + Math.sin(stepCycle) * 0.05;
    } else if (this.state === 'PECK') {
      this.leftWing.rotation.z = 0.08;
      this.rightWing.rotation.z = -0.08;
      this.leftWing.rotation.x = -0.15;
      this.rightWing.rotation.x = -0.15;

      const peckFreq = 7.0;
      const peckCycle = Math.sin(this.animClock * peckFreq);

      // Neck pivots smoothly down from chest toward food while base stays firmly embedded
      this.neckGroup.position.set(0, 0.44 - (peckCycle + 1) * 0.025, 0.22);
      this.neckGroup.rotation.x = 0.68 + peckCycle * 0.28;
      this.neckGroup.rotation.y = 0;

      // Head tilts beak directly into crumbs
      this.headGroup.position.set(0, 0.26, 0.08);
      this.headGroup.rotation.x = 0.26 + peckCycle * 0.16;
      this.headGroup.rotation.y = 0;

      // Body dips naturally with the peck
      this.bodyMesh.rotation.x = 0.12 + peckCycle * 0.06;
      this.bodyMesh.rotation.z = 0;
      this.tailMesh.rotation.x = -0.55 - peckCycle * 0.12;

      this.leftLeg.rotation.x = 0.1;
      this.rightLeg.rotation.x = -0.05;
    } else if (this.state === 'PERCH') {
      // Calmer, regal sitting posture on the fountain marble rim or bench
      this.leftWing.rotation.z = 0.05;
      this.rightWing.rotation.z = -0.05;
      this.leftWing.rotation.x = -0.12;
      this.rightWing.rotation.x = -0.12;

      this.neckGroup.position.set(0, 0.46, 0.22);
      this.neckGroup.rotation.x = -0.04;
      this.neckGroup.rotation.y = THREE.MathUtils.lerp(
        this.neckGroup.rotation.y,
        this.headTwitchAngle * 0.5,
        delta * 10
      );

      this.headGroup.position.set(0, 0.26, 0.08);
      this.headGroup.rotation.x = 0.04;
      this.headGroup.rotation.y = THREE.MathUtils.lerp(
        this.headGroup.rotation.y,
        this.headTwitchAngle,
        delta * 10
      );

      // Tucked feet
      this.leftLeg.rotation.x = 0.4;
      this.rightLeg.rotation.x = 0.4;
      this.bodyMesh.rotation.x = 0;
      this.bodyMesh.rotation.z = 0;
      this.tailMesh.rotation.x = -0.28;
    } else {
      // IDLE
      this.leftWing.rotation.z = 0.06;
      this.rightWing.rotation.z = -0.06;
      this.leftWing.rotation.x = -0.15;
      this.rightWing.rotation.x = -0.15;

      this.neckGroup.position.set(0, 0.46, 0.22);
      this.neckGroup.rotation.x = THREE.MathUtils.lerp(this.neckGroup.rotation.x, 0, delta * 10);
      this.neckGroup.rotation.y = THREE.MathUtils.lerp(
        this.neckGroup.rotation.y,
        this.headTwitchAngle * 0.4,
        delta * 12
      );

      this.headGroup.position.set(0, 0.26, 0.08);
      this.headGroup.rotation.x = THREE.MathUtils.lerp(this.headGroup.rotation.x, 0, delta * 8);
      this.headGroup.rotation.y = THREE.MathUtils.lerp(
        this.headGroup.rotation.y,
        this.headTwitchAngle * 0.6,
        delta * 12
      );

      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.bodyMesh.rotation.x = THREE.MathUtils.lerp(this.bodyMesh.rotation.x, 0, delta * 8);
      this.bodyMesh.rotation.z = 0;
      this.tailMesh.rotation.x = -0.35;
    }
  }

  /**
   * Selects best breadcrumb considering distance and crowding (avoids 28 pigeons targeting 1 seed!)
   */
  private findBestBreadcrumb(breadcrumbs: Breadcrumb[], maxDistance: number): Breadcrumb | null {
    let best: Breadcrumb | null = null;
    let bestScore = Infinity;

    for (const b of breadcrumbs) {
      if (b.remainingBites <= 0) continue;
      // If already has 2 or more pigeons actively pecking it, deprioritize
      const crowding = b.targetedByCount || 0;
      if (crowding >= 2) continue;

      const d = Math.hypot(b.x - this.position.x, b.z - this.position.z);
      if (d < maxDistance) {
        // Score based on distance and crowd penalty
        const score = d + crowding * 3.0;
        if (score < bestScore) {
          bestScore = score;
          best = b;
        }
      }
    }

    return best;
  }

  public dispose() {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  }
}
