import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createRollingTerrain, getTerrainHeight } from './terrain';
import { createEnvironment, EnvironmentResult } from './environment';
import { Pigeon } from './pigeon';
import { TimeOfDay, FlockStats, MeadowTheme, SceneryType } from '../types';
import { soundManager } from '../audio/soundManager';
import { FeedManager } from './feedManager';
import { getNearestWalkablePosition, getRandomWalkableTarget } from './obstacles';

export interface TimeStop {
  progress: number;
  timeOfDay: TimeOfDay;
  skyColorTop: string;
  skyColorBottom: string;
  fogColor: string;
  sunColor: string;
  sunIntensity: number;
  ambientSky: string;
  ambientGround: string;
  sunPosition: [number, number, number];
}

export const TIME_STOPS: TimeStop[] = [
  {
    progress: 0,
    timeOfDay: 'morning',
    skyColorTop: '#cce4f9',
    skyColorBottom: '#ffe7e0',
    fogColor: '#fbe6df',
    sunColor: '#fff2e2',
    sunIntensity: 1.35,
    ambientSky: '#f8effa',
    ambientGround: '#7ec994', // soft pastel meadow green
    sunPosition: [24, 18, 12],
  },
  {
    progress: 33,
    timeOfDay: 'noon',
    skyColorTop: '#bfe8fa',
    skyColorBottom: '#ebf7fe',
    fogColor: '#d5f0fc',
    sunColor: '#fffaf0',
    sunIntensity: 1.45,
    ambientSky: '#eaf6ff',
    ambientGround: '#6bbd85', // soft pastel mint-meadow
    sunPosition: [10, 42, 14],
  },
  {
    progress: 66,
    timeOfDay: 'sunset',
    skyColorTop: '#f7c4a8',
    skyColorBottom: '#ffe2cc',
    fogColor: '#facab0',
    sunColor: '#ffa76c',
    sunIntensity: 1.55,
    ambientSky: '#fee4d4',
    ambientGround: '#82a87a',
    sunPosition: [-24, 16, 10],
  },
  {
    progress: 100,
    timeOfDay: 'twilight',
    skyColorTop: '#7088b8',
    skyColorBottom: '#b7b0d4',
    fogColor: '#8f9bc4',
    sunColor: '#ccbbf0',
    sunIntensity: 0.85,
    ambientSky: '#7983aa',
    ambientGround: '#3a5944',
    sunPosition: [-14, 26, -16],
  },
];

export const MEADOW_THEMES: Record<TimeOfDay, MeadowTheme> = {
  noon: {
    name: 'Sunny Noon',
    skyColorTop: '#bfe8fa',
    skyColorBottom: '#ebf7fe',
    fogColor: '#d5f0fc',
    sunColor: '#fffaf0',
    sunIntensity: 1.45,
    ambientSky: '#eaf6ff',
    ambientGround: '#6bbd85',
    grassColor: '#a7f3d0',
    hillColor: '#86efac',
    cloudColor: '#ffffff',
  },
  morning: {
    name: 'Pastel Morning',
    skyColorTop: '#cce4f9',
    skyColorBottom: '#ffe7e0',
    fogColor: '#fbe6df',
    sunColor: '#fff2e2',
    sunIntensity: 1.35,
    ambientSky: '#f8effa',
    ambientGround: '#7ec994',
    grassColor: '#bbf7d0',
    hillColor: '#a7f3d0',
    cloudColor: '#fff9f6',
  },
  sunset: {
    name: 'Golden Sunset',
    skyColorTop: '#f7c4a8',
    skyColorBottom: '#ffe2cc',
    fogColor: '#facab0',
    sunColor: '#ffa76c',
    sunIntensity: 1.55,
    ambientSky: '#fee4d4',
    ambientGround: '#82a87a',
    grassColor: '#86efac',
    hillColor: '#6ee7b7',
    cloudColor: '#ffede5',
  },
  twilight: {
    name: 'Dreamy Twilight',
    skyColorTop: '#7088b8',
    skyColorBottom: '#b7b0d4',
    fogColor: '#8f9bc4',
    sunColor: '#ccbbf0',
    sunIntensity: 0.85,
    ambientSky: '#7983aa',
    ambientGround: '#3a5944',
    grassColor: '#6ee7b7',
    hillColor: '#5eead4',
    cloudColor: '#e8e2fa',
  },
};

export class SceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  // Environment & Lighting
  private ambientLight: THREE.HemisphereLight;
  private dirLight: THREE.DirectionalLight;
  private skyDome: THREE.Mesh;
  private terrainResult: ReturnType<typeof createRollingTerrain>;
  private environment: EnvironmentResult;

  // Flock & Props
  private pigeons: Pigeon[] = [];
  public feedManager: FeedManager;

  // Raycasting & Cursor Chase
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouseCoords: THREE.Vector2 = new THREE.Vector2(-999, -999);
  private cursorGroundPos: THREE.Vector3 | null = null;
  private lastCursorGroundPos: THREE.Vector3 = new THREE.Vector3();
  private cursorSpeed: number = 0;
  private cursorMarker: THREE.Group;

  // State & Animation
  private clock: THREE.Clock = new THREE.Clock();
  private animId: number = 0;
  private isDestroyed: boolean = false;
  private timeOfDay: TimeOfDay = 'noon';
  private targetPigeonCount: number = 28;
  private followingPigeonId: string | null = null;
  private currentScenery: SceneryType = 'forest';

  // Click & Double-Click Timing
  private clickTimeout: number | null = null;
  private lastClickTime: number = 0;
  private lastClickPos: { x: number; y: number } = { x: 0, y: 0 };

  // Callbacks
  public onStatsUpdate?: (stats: FlockStats) => void;

  constructor(container: HTMLElement) {
    this.container = container;

    this.scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(46, width / height, 0.2, 220);
    this.camera.position.set(0, 7.8, 12.8);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.16;
    this.controls.minDistance = 2.8;
    this.controls.maxDistance = 28;
    this.controls.target.set(0, 1.0, 0);

    this.skyDome = this.createSkyDome();
    this.scene.add(this.skyDome);

    this.ambientLight = new THREE.HemisphereLight(0xeaf6ff, 0x6bbd85, 0.95);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfff8ea, 1.45);
    this.dirLight.position.set(18, 32, 14);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far = 80;
    const d = 20;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0003;
    this.scene.add(this.dirLight);

    this.terrainResult = createRollingTerrain(100, 140, this.currentScenery);
    this.scene.add(this.terrainResult.mesh);

    this.environment = createEnvironment(this.currentScenery);
    this.scene.add(this.environment.group);

    // Dedicated physical feeds manager
    this.feedManager = new FeedManager(this.scene);

    this.cursorMarker = this.createCursorMarker();
    this.scene.add(this.cursorMarker);

    this.updateFlockCount(this.targetPigeonCount);

    const theme = MEADOW_THEMES[this.timeOfDay];
    this.scene.fog = new THREE.FogExp2(theme.fogColor, 0.015);

    this.setupListeners();
    this.animate();
  }

  public setScenery(scenery: SceneryType) {
    this.currentScenery = scenery;
    this.terrainResult.updateScenery(scenery);
    this.environment.setScenery(scenery);
    this.feedManager.remapSeedsToScenery(scenery);

    for (const pigeon of this.pigeons) {
      pigeon.setScenery(scenery);
    }

    if (scenery === 'beach') {
      this.ambientLight.groundColor.set('#fde68a');
    } else if (scenery === 'fountain') {
      this.ambientLight.groundColor.set('#e2d3c2');
    } else {
      this.ambientLight.groundColor.set('#6bbd85');
    }
  }

  private createSkyDome(): THREE.Mesh {
    const geom = new THREE.SphereGeometry(100, 32, 24);
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        float factor = clamp((h + 0.1) * 1.1, 0.0, 1.0);
        gl_FragColor = vec4(mix(bottomColor, topColor, factor), 1.0);
      }
    `;

    const theme = MEADOW_THEMES[this.timeOfDay];
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        topColor: { value: new THREE.Color(theme.skyColorTop) },
        bottomColor: { value: new THREE.Color(theme.skyColorBottom) },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });

    return new THREE.Mesh(geom, mat);
  }

  private createCursorMarker(): THREE.Group {
    const marker = new THREE.Group();

    const ringGeom = new THREE.RingGeometry(0.55, 0.7, 24);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.name = 'ring';
    marker.add(ring);

    const dotGeom = new THREE.CircleGeometry(0.18, 16);
    dotGeom.rotateX(-Math.PI / 2);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const dot = new THREE.Mesh(dotGeom, dotMat);
    marker.add(dot);

    marker.visible = false;
    return marker;
  }

  private setupListeners() {
    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;
    let isDragging = false;

    const onPointerMove = (e: PointerEvent) => {
      const rect = this.container.getBoundingClientRect();
      this.mouseCoords.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseCoords.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (pointerDownTime > 0 && !isDragging) {
        const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
        if (dist > 7) {
          isDragging = true;
        }
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = performance.now();
      isDragging = false;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const duration = performance.now() - pointerDownTime;
      const wasDrag = isDragging || duration > 380;
      pointerDownTime = 0;
      isDragging = false;

      if (wasDrag) {
        return;
      }

      if (!this.cursorGroundPos) return;

      const clickX = this.cursorGroundPos.x;
      const clickZ = this.cursorGroundPos.z;
      const now = performance.now();
      const distFromLastClick = Math.hypot(e.clientX - this.lastClickPos.x, e.clientY - this.lastClickPos.y);

      // Check for DOUBLE CLICK (< 300ms and nearby screen position)
      if (now - this.lastClickTime < 300 && distFromLastClick < 28) {
        // DOUBLE CLICK -> FEED PIGEONS!
        this.lastClickTime = 0;
        this.dropBreadcrumbsAt(clickX, clickZ);
        return;
      }

      this.lastClickTime = now;
      this.lastClickPos = { x: e.clientX, y: e.clientY };

      // SINGLE CLICK -> INSTANTLY SCARE PIGEONS! Zero delay, ultra-responsive!
      this.scareAt(clickX, clickZ);
    };

    const onDblClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      this.lastClickTime = 0;
      if (this.cursorGroundPos) {
        this.dropBreadcrumbsAt(this.cursorGroundPos.x, this.cursorGroundPos.z);
      }
    };

    const onResize = () => {
      if (this.isDestroyed) return;
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(this.animId);
    };

    const onContextRestored = () => {
      this.animate();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    this.renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    this.renderer.domElement.addEventListener('dblclick', onDblClick);
    window.addEventListener('resize', onResize);
    this.renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    this.renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);

    this.cleanups.push(() => {
      window.removeEventListener('pointermove', onPointerMove);
      this.renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      this.renderer.domElement.removeEventListener('dblclick', onDblClick);
      window.removeEventListener('resize', onResize);
      this.renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      this.renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
    });
  }

  private cleanups: (() => void)[] = [];

  public updateFlockCount(count: number) {
    this.targetPigeonCount = Math.max(5, Math.min(100, Math.round(count)));

    while (this.pigeons.length < this.targetPigeonCount) {
      const id = `pigeon-${Date.now()}-${Math.random()}`;
      const safe = getRandomWalkableTarget(this.currentScenery);
      const pigeon = new Pigeon(id, safe.x, safe.z, this.currentScenery);
      this.pigeons.push(pigeon);
      this.scene.add(pigeon.group);
    }

    while (this.pigeons.length > this.targetPigeonCount) {
      const removed = this.pigeons.pop();
      if (removed) {
        if (this.followingPigeonId === removed.id) {
          this.followingPigeonId = null;
        }
        this.scene.remove(removed.group);
        removed.dispose();
      }
    }
  }

  public scatterAll() {
    soundManager.ensureContext();
    soundManager.playWingFlap(1.2);
    for (const pigeon of this.pigeons) {
      pigeon.scare(this.cursorGroundPos || undefined);
    }
  }

  /**
   * Scares pigeons directly around the clicked cursor location (~2.5m direct scatter range)
   */
  public scareAt(x: number, z: number) {
    soundManager.ensureContext();
    soundManager.playWingFlap(1.15);

    const groundY = getTerrainHeight(x, z, this.currentScenery);
    const hitVec = new THREE.Vector3(x, groundY, z);
    let scaredCount = 0;

    // 1. Direct scatter zone (~2.5m) - pigeons within this range scatter immediately
    for (const pigeon of this.pigeons) {
      if (pigeon.state !== 'FLY' && pigeon.state !== 'TAKEOFF') {
        const d = Math.hypot(pigeon.position.x - x, pigeon.position.z - z);
        if (d < 2.5) {
          pigeon.scare(hitVec);
          scaredCount++;
        }
      }
    }

    // 2. Fringe zone (2.5m to 3.5m) - moderate startle probability
    for (const pigeon of this.pigeons) {
      if (pigeon.state !== 'FLY' && pigeon.state !== 'TAKEOFF') {
        const d = Math.hypot(pigeon.position.x - x, pigeon.position.z - z);
        if (d >= 2.5 && d < 3.5) {
          if (Math.random() < 0.35) {
            pigeon.scare(hitVec);
            scaredCount++;
          }
        }
      }
    }

    // 3. Close miss helper: if click was just outside 2.5m, still scare the nearest bird up to 2.8m
    if (scaredCount === 0) {
      const candidates = this.pigeons
        .filter((p) => p.state !== 'FLY' && p.state !== 'TAKEOFF')
        .map((p) => ({ pigeon: p, dist: Math.hypot(p.position.x - x, p.position.z - z) }))
        .sort((a, b) => a.dist - b.dist);

      if (candidates.length > 0 && candidates[0].dist < 2.8) {
        candidates[0].pigeon.scare(hitVec);
      }
    }

    // Visual expanding shockwave ripple on the ground
    this.createShockwaveRipple(x, groundY, z);

    // Pulse animation on the cursor ring
    const ring = this.cursorMarker.getObjectByName('ring') as THREE.Mesh;
    if (ring) {
      ring.scale.set(2.6, 2.6, 2.6);
      (ring.material as THREE.MeshBasicMaterial).color.set(0xf87171);
      setTimeout(() => {
        if (ring) {
          (ring.material as THREE.MeshBasicMaterial).color.set(0xffffff);
        }
      }, 250);
    }
  }

  /**
   * Spawns an expanding, fading shockwave ring on the ground matching the ~2.5m scatter range
   */
  private createShockwaveRipple(x: number, y: number, z: number) {
    const geom = new THREE.RingGeometry(0.18, 0.42, 32);
    geom.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xfca5a5,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ripple = new THREE.Mesh(geom, mat);
    ripple.position.set(x, y + 0.05, z);
    this.scene.add(ripple);

    const startTime = performance.now();
    const duration = 340;
    const animateRipple = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const scale = 1.0 + progress * 2.8;
      ripple.scale.set(scale, scale, scale);
      mat.opacity = (1 - progress) * 0.85;

      if (progress < 1) {
        requestAnimationFrame(animateRipple);
      } else {
        this.scene.remove(ripple);
        geom.dispose();
        mat.dispose();
      }
    };
    requestAnimationFrame(animateRipple);
  }

  /**
   * Tosses physical breadcrumbs/seeds with ballistic arcs and bounces
   */
  public dropBreadcrumbsAt(x: number, z: number) {
    const origin = this.cursorGroundPos
      ? new THREE.Vector3(this.cursorGroundPos.x, this.cursorGroundPos.y + 2.5, this.cursorGroundPos.z)
      : undefined;

    this.feedManager.tossSeeds(x, z, this.currentScenery, origin, 5);

    // Alert nearby pigeons to head towards the seeds
    for (const p of this.pigeons) {
      if (p.state === 'IDLE' || p.state === 'WALK') {
        const d = Math.hypot(p.position.x - x, p.position.z - z);
        if (d < 15) {
          if (Math.random() < 0.3) soundManager.playCoo();
        }
      }
    }

    // Golden feed pulse animation on cursor marker
    const ring = this.cursorMarker.getObjectByName('ring') as THREE.Mesh;
    if (ring) {
      ring.scale.set(2.2, 2.2, 2.2);
      (ring.material as THREE.MeshBasicMaterial).color.set(0xfbbf24);
      setTimeout(() => {
        if (ring) {
          (ring.material as THREE.MeshBasicMaterial).color.set(0xffffff);
        }
      }, 350);
    }
  }

  public dropSeedsInCenter() {
    const center = this.controls.target;
    // Ensure seeds don't land inside the fountain core!
    const safe = getNearestWalkablePosition(center.x, center.z, this.currentScenery);
    this.dropBreadcrumbsAt(safe.x, safe.z);
  }

  public setTimeProgress(progress: number) {
    const p = Math.max(0, Math.min(100, progress));

    let stopA = TIME_STOPS[0];
    let stopB = TIME_STOPS[TIME_STOPS.length - 1];

    for (let i = 0; i < TIME_STOPS.length - 1; i++) {
      if (p >= TIME_STOPS[i].progress && p <= TIME_STOPS[i + 1].progress) {
        stopA = TIME_STOPS[i];
        stopB = TIME_STOPS[i + 1];
        break;
      }
    }

    const span = Math.max(0.001, stopB.progress - stopA.progress);
    const t = Math.max(0, Math.min(1, (p - stopA.progress) / span));

    const topColor = new THREE.Color(stopA.skyColorTop).lerp(new THREE.Color(stopB.skyColorTop), t);
    const bottomColor = new THREE.Color(stopA.skyColorBottom).lerp(new THREE.Color(stopB.skyColorBottom), t);
    const fogColor = new THREE.Color(stopA.fogColor).lerp(new THREE.Color(stopB.fogColor), t);
    const sunColor = new THREE.Color(stopA.sunColor).lerp(new THREE.Color(stopB.sunColor), t);
    const ambientSky = new THREE.Color(stopA.ambientSky).lerp(new THREE.Color(stopB.ambientSky), t);
    const ambientGround = new THREE.Color(stopA.ambientGround).lerp(new THREE.Color(stopB.ambientGround), t);

    const sunIntensity = THREE.MathUtils.lerp(stopA.sunIntensity, stopB.sunIntensity, t);
    const sunPosA = new THREE.Vector3(...stopA.sunPosition);
    const sunPosB = new THREE.Vector3(...stopB.sunPosition);
    const sunPos = new THREE.Vector3().lerpVectors(sunPosA, sunPosB, t);

    const skyMat = this.skyDome.material as THREE.ShaderMaterial;
    skyMat.uniforms.topColor.value.copy(topColor);
    skyMat.uniforms.bottomColor.value.copy(bottomColor);

    this.ambientLight.color.copy(ambientSky);
    if (this.currentScenery === 'forest') {
      this.ambientLight.groundColor.copy(ambientGround);
    }

    this.dirLight.color.copy(sunColor);
    this.dirLight.intensity = sunIntensity;
    this.dirLight.position.copy(sunPos);

    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.copy(fogColor);
    }
  }

  public setTimeOfDay(time: TimeOfDay) {
    this.timeOfDay = time;
    const progressMap: Record<TimeOfDay, number> = {
      morning: 0,
      noon: 33,
      sunset: 66,
      twilight: 100,
    };
    this.setTimeProgress(progressMap[time]);
  }

  public toggleFollowPigeon() {
    if (this.followingPigeonId) {
      this.followingPigeonId = null;
    } else if (this.pigeons.length > 0) {
      const flyingPigeon = this.pigeons.find((p) => p.state === 'FLY') || this.pigeons[0];
      this.followingPigeonId = flyingPigeon.id;
    }
    return this.followingPigeonId !== null;
  }

  public resetCamera() {
    this.followingPigeonId = null;
    this.controls.target.set(0, 1.0, 0);
    this.camera.position.set(0, 7.8, 12.8);
    this.controls.update();
  }

  private animate = () => {
    if (this.isDestroyed) return;
    this.animId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    this.raycaster.setFromCamera(this.mouseCoords, this.camera);
    const intersects = this.raycaster.intersectObject(this.terrainResult.mainMesh, false);

    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      if (!this.cursorGroundPos) {
        this.cursorGroundPos = hitPoint.clone();
        this.lastCursorGroundPos.copy(hitPoint);
      } else {
        const moveDist = hitPoint.distanceTo(this.lastCursorGroundPos);
        this.cursorSpeed = delta > 0 ? moveDist / delta : 0;
        this.cursorGroundPos.copy(hitPoint);
        this.lastCursorGroundPos.copy(hitPoint);
      }

      this.cursorMarker.position.copy(hitPoint);
      this.cursorMarker.position.y += 0.08;
      this.cursorMarker.visible = true;

      const ring = this.cursorMarker.getObjectByName('ring') as THREE.Mesh;
      if (ring) {
        const s = 1.0 + Math.sin(elapsedTime * 6) * 0.15;
        ring.scale.set(s, s, s);
      }
    } else {
      this.cursorGroundPos = null;
      this.cursorSpeed = 0;
      this.cursorMarker.visible = false;
    }

    this.environment.update(delta, elapsedTime);

    // Update physical seeds and particle bursts
    this.feedManager.update(delta, this.currentScenery);

    let flyingCount = 0;
    let walkingCount = 0;
    let peckingCount = 0;

    for (const pigeon of this.pigeons) {
      pigeon.update(
        delta,
        this.cursorGroundPos,
        this.cursorSpeed,
        this.pigeons,
        this.feedManager.breadcrumbs,
        (seed, forward) => {
          this.feedManager.applyPeckImpulse(seed, forward, this.currentScenery);
        }
      );

      if (pigeon.state === 'FLY' || pigeon.state === 'TAKEOFF' || pigeon.state === 'LAND') {
        flyingCount++;
      } else if (pigeon.state === 'WALK' || pigeon.state === 'HOP') {
        walkingCount++;
      } else if (pigeon.state === 'PECK' || pigeon.state === 'PERCH') {
        peckingCount++;
      }
    }

    if (this.followingPigeonId) {
      const targetPigeon = this.pigeons.find((p) => p.id === this.followingPigeonId);
      if (targetPigeon) {
        const pPos = targetPigeon.position;
        const offset = new THREE.Vector3(
          -Math.sin(targetPigeon.currentYaw) * 4.2,
          2.0,
          -Math.cos(targetPigeon.currentYaw) * 4.2
        );
        const camTargetPos = new THREE.Vector3().addVectors(pPos, offset);
        this.camera.position.lerp(camTargetPos, delta * 3.5);
        this.controls.target.lerp(new THREE.Vector3(pPos.x, pPos.y + 0.6, pPos.z), delta * 4.5);
      } else {
        this.followingPigeonId = null;
      }
    } else {
      // Free camera: Prevent camera from clipping through terrain or dipping underground
      const camTerrainY = getTerrainHeight(this.camera.position.x, this.camera.position.z, this.currentScenery);
      const minCamY = camTerrainY + 1.25;
      if (this.camera.position.y < minCamY) {
        this.camera.position.y = minCamY;
      }

      // Keep controls target clamped to reasonable meadow area and above ground
      const targetGroundY = getTerrainHeight(this.controls.target.x, this.controls.target.z, this.currentScenery);
      if (this.controls.target.y < targetGroundY + 0.8) {
        this.controls.target.y = targetGroundY + 0.8;
      }
      const maxTargetDist = 18;
      const targetDist = Math.hypot(this.controls.target.x, this.controls.target.z);
      if (targetDist > maxTargetDist) {
        this.controls.target.x = (this.controls.target.x / targetDist) * maxTargetDist;
        this.controls.target.z = (this.controls.target.z / targetDist) * maxTargetDist;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    if (this.onStatsUpdate && Math.floor(elapsedTime * 10) % 3 === 0) {
      this.onStatsUpdate({
        total: this.pigeons.length,
        flying: flyingCount,
        walking: walkingCount,
        pecking: peckingCount,
      });
    }
  };

  public getPigeonCount(): number {
    return this.pigeons.length;
  }

  public getFollowingPigeonId(): string | null {
    return this.followingPigeonId;
  }

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animId);

    if (this.clickTimeout !== null) {
      window.clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }

    for (const cleanup of this.cleanups) {
      cleanup();
    }

    for (const pigeon of this.pigeons) {
      pigeon.dispose();
    }
    this.pigeons = [];

    if (this.terrainResult.dispose) {
      this.terrainResult.dispose();
    }
    if (this.environment.dispose) {
      this.environment.dispose();
    }

    this.skyDome.geometry.dispose();
    if (Array.isArray(this.skyDome.material)) {
      this.skyDome.material.forEach((m) => m.dispose());
    } else {
      this.skyDome.material.dispose();
    }

    this.cursorMarker.traverse((c) => {
      if (c instanceof THREE.Mesh) {
        c.geometry?.dispose();
        if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
        else c.material?.dispose();
      }
    });

    this.feedManager.dispose();
    this.controls.dispose();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
