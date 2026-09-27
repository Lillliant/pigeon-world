export type TimeOfDay = 'morning' | 'noon' | 'sunset' | 'twilight';

export type SceneryType = 'forest' | 'beach' | 'fountain';

export type PigeonState =
  | 'IDLE'
  | 'WALK'
  | 'PECK'
  | 'ALERT'
  | 'TAKEOFF'
  | 'FLY'
  | 'GLIDE'
  | 'LAND'
  | 'PERCH'
  | 'HOP';

export interface Breadcrumb {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  isSettled: boolean;
  bounces: number;
  remainingBites: number;
  maxBites: number;
  createdAt: number;
  targetedByCount: number;
  inWater?: boolean;
}

export interface FlockStats {
  total: number;
  flying: number;
  walking: number;
  pecking: number;
}

export interface MeadowTheme {
  name: string;
  skyColorTop: string;
  skyColorBottom: string;
  fogColor: string;
  sunColor: string;
  sunIntensity: number;
  ambientSky: string;
  ambientGround: string;
  grassColor: string;
  hillColor: string;
  cloudColor: string;
}
