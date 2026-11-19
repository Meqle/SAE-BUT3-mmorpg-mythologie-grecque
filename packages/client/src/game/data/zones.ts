import { MAPS, GRAVITY, JUMP_VELOCITY, MAX_FALL_SPEED, PLAYER_HALF, PLAYER_SPEED } from '@greek-myth/shared';
import type { MoveInput, MovingBody, Rect, ViewMode } from '@greek-myth/shared';

export type ZoneId = 'agora' | 'plaines' | 'sanctuaire' | 'rivage';

export type ZoneSolidLook =
  | 'column'
  | 'olive'
  | 'wall'
  | 'ruin'
  | 'rock'
  | 'anvil'
  | 'tent'
  | 'altar'
  | 'platform'
  | 'block'
  | 'drum'
  | 'frieze';

export interface ZoneSolid extends Rect {
  look: ZoneSolidLook;
}

export interface ZonePortal extends Rect {
  id: string;
  toZone: ZoneId;
  spawnX: number;
  spawnY: number;
  label: string;
  requiredQuestCompleted?: string;
  lockedHint?: string;
}

export interface ZoneNpcPlacement {
  npcId: string;
  x: number;
  y: number;
}

export type InteractableKind = 'brasero' | 'bronze' | 'herb' | 'stele' | 'trial_stele';

export interface ZoneInteractable {
  id: string;
  targetId: string;
  label: string;
  kind: InteractableKind;
  x: number;
  y: number;
  radius: number;
  questId?: string;
}

export type EnemyType =
  | 'satyre'
  | 'harpie'
  | 'centaure'
  | 'automate'
  | 'gardien_airain'
  | 'sentinelle_poseidon';

export interface ZoneEnemySpawn {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  level: number;
  patrolRadius: number;
  respawnSeconds: number;
}

export interface ZoneDefinition {
  id: ZoneId;
  name: string;
  subtitle: string;
  realm: 'olympus' | 'elysium' | 'tartarus';
  viewMode: ViewMode;
  recommendedLevel: string;
  safeZone: boolean;
  catastrophe: 'calm' | 'storm' | 'quake' | 'surge';
  width: number;
  height: number;
  cameraMargin: number;
  defaultSpawn: { x: number; y: number };
  solids: ZoneSolid[];
  portals: ZonePortal[];
  npcs: ZoneNpcPlacement[];
  interactables: ZoneInteractable[];
  spawns: ZoneEnemySpawn[];
}

const pillar = (cx: number, cy: number): ZoneSolid => ({
  x: cx - 20,
  y: cy - 20,
  w: 40,
  h: 40,
  look: 'column'
});

const olive = (cx: number, cy: number): ZoneSolid => ({
  x: cx - 20,
  y: cy - 20,
  w: 40,
  h: 40,
  look: 'olive'
});

const rock = (cx: number, cy: number, w = 52, h = 40): ZoneSolid => ({
  x: cx - w / 2,
  y: cy - h / 2,
  w,
  h,
  look: 'rock'
});

const ruin = (x: number, y: number, w: number, h: number): ZoneSolid => ({
  x,
  y,
  w,
  h,
  look: 'ruin'
});

export const ZONES: Record<ZoneId, ZoneDefinition> = {
  agora: {
    id: 'agora',
    name: "Agora de l'Olympe",
    subtitle: 'Refuge des Survivants — Zone sûre',
    realm: 'olympus',
    viewMode: 'top-down',
    recommendedLevel: 'Niv. 1',
    safeZone: true,
    catastrophe: 'calm',
    width: 960,
    height: 600,
    cameraMargin: 48,
    defaultSpawn: { x: 480, y: 505 },
    solids: [
      pillar(665, 377), pillar(557, 485), pillar(403, 485), pillar(295, 377),
      pillar(295, 223), pillar(403, 115), pillar(557, 115), pillar(665, 223),
      olive(110, 100), olive(850, 100), olive(110, 500), olive(850, 500),
      { x: 0, y: 236, w: 72, h: 24, look: 'wall' },
      { x: 0, y: 340, w: 72, h: 24, look: 'wall' },
      { x: 888, y: 236, w: 72, h: 24, look: 'wall' },
      { x: 888, y: 340, w: 72, h: 24, look: 'wall' },
      { x: 682, y: 460, w: 48, h: 30, look: 'anvil' },
      { x: 196, y: 458, w: 54, h: 32, look: 'tent' }
    ],
    portals: [
      {
        id: 'agora_to_plaines',
        x: 888,
        y: 260,
        w: 72,
        h: 80,
        toZone: 'plaines',
        spawnX: 98,
        spawnY: 448,
        label: 'Plaines Foudroyées (Niv. 1-4)'
      },
      {
        id: 'agora_to_rivage',
        x: 0,
        y: 260,
        w: 72,
        h: 80,
        toZone: 'rivage',
        spawnX: 170,
        spawnY: 456,
        label: "Rivage d'Égée — Épreuve (Niv. 6)",
        requiredQuestCompleted: 'mq_1_etincelle',
        lockedHint: "Parlez d'abord à Lycos et ranimez le Brasero de Prométhée."
      }
    ],
    npcs: [
      { npcId: 'lycos', x: 480, y: 238 },
      { npcId: 'damon', x: 706, y: 425 },
      { npcId: 'cassandre', x: 223, y: 425 },
      { npcId: 'theron', x: 822, y: 236 }
    ],
    interactables: [
      {
        id: 'brasero_agora',
        targetId: 'brasero_promethee',
        label: 'Brasero de Prométhée',
        kind: 'brasero',
        x: 480,
        y: 300,
        radius: 48,
        questId: 'mq_1_etincelle'
      }
    ],
    spawns: []
  },

  plaines: {
    id: 'plaines',
    name: 'Plaines Foudroyées',
    subtitle: 'Route antique ravagée par Zeus',
    realm: 'olympus',
    viewMode: 'top-down',
    recommendedLevel: 'Niv. 1 - 4',
    safeZone: false,
    catastrophe: 'storm',
    width: 1440,
    height: 880,
    cameraMargin: 24,
    defaultSpawn: { x: 100, y: 448 },
    solids: [
      { x: 0, y: 374, w: 68, h: 24, look: 'wall' },
      { x: 0, y: 498, w: 68, h: 24, look: 'wall' },
      { x: 1372, y: 374, w: 68, h: 24, look: 'wall' },
      { x: 1372, y: 498, w: 68, h: 24, look: 'wall' },
      olive(190, 175), olive(310, 680), olive(690, 740), olive(1160, 185), olive(1180, 720),
      ruin(360, 210, 160, 26),
      ruin(360, 210, 26, 110),
      pillar(560, 224),
      pillar(640, 224),
      rock(290, 520, 60, 44),
      rock(660, 560, 74, 46),
      ruin(850, 170, 170, 26),
      ruin(920, 600, 160, 28),
      pillar(940, 250),
      pillar(1060, 540),
      rock(1120, 310, 66, 48)
    ],
    portals: [
      {
        id: 'plaines_to_agora',
        x: 0,
        y: 398,
        w: 68,
        h: 100,
        toZone: 'agora',
        spawnX: 830,
        spawnY: 300,
        label: "Retour : Agora de l'Olympe"
      },
      {
        id: 'plaines_to_sanctuaire',
        x: 1372,
        y: 398,
        w: 68,
        h: 100,
        toZone: 'sanctuaire',
        spawnX: 104,
        spawnY: 420,
        label: 'Sanctuaire Brisé (Niv. 4-7)'
      }
    ],
    npcs: [],
    interactables: [
      {
        id: 'bronze_1',
        targetId: 'fragment_bronze',
        label: 'Fragment de bronze',
        kind: 'bronze',
        x: 425,
        y: 270,
        radius: 42,
        questId: 'sq_bronze_ruines'
      },
      {
        id: 'bronze_2',
        targetId: 'fragment_bronze',
        label: 'Fragment de bronze',
        kind: 'bronze',
        x: 750,
        y: 640,
        radius: 42,
        questId: 'sq_bronze_ruines'
      },
      {
        id: 'bronze_3',
        targetId: 'fragment_bronze',
        label: 'Fragment de bronze',
        kind: 'bronze',
        x: 990,
        y: 265,
        radius: 42,
        questId: 'sq_bronze_ruines'
      },
      {
        id: 'herb_1',
        targetId: 'herbe_ambroisie',
        label: "Herbe d'ambroisie",
        kind: 'herb',
        x: 235,
        y: 215,
        radius: 42,
        questId: 'sq_ambroisie_perdue'
      },
      {
        id: 'herb_2',
        targetId: 'herbe_ambroisie',
        label: "Herbe d'ambroisie",
        kind: 'herb',
        x: 360,
        y: 715,
        radius: 42,
        questId: 'sq_ambroisie_perdue'
      },
      {
        id: 'herb_3',
        targetId: 'herbe_ambroisie',
        label: "Herbe d'ambroisie",
        kind: 'herb',
        x: 1120,
        y: 725,
        radius: 42,
        questId: 'sq_ambroisie_perdue'
      },
      {
        id: 'stele_chatiment_obj',
        targetId: 'stele_chatiment',
        label: 'Stèle du Châtiment',
        kind: 'stele',
        x: 735,
        y: 165,
        radius: 52,
        questId: 'mq_2_terres_foudroyees'
      }
    ],
    spawns: [
      { id: 'pl_sat_1', type: 'satyre', x: 350, y: 410, level: 1, patrolRadius: 70, respawnSeconds: 18 },
      { id: 'pl_sat_2', type: 'satyre', x: 560, y: 630, level: 2, patrolRadius: 80, respawnSeconds: 18 },
      { id: 'pl_sat_3', type: 'satyre', x: 760, y: 390, level: 2, patrolRadius: 75, respawnSeconds: 18 },
      { id: 'pl_sat_4', type: 'satyre', x: 960, y: 720, level: 2, patrolRadius: 70, respawnSeconds: 20 },
      { id: 'pl_har_1', type: 'harpie', x: 540, y: 310, level: 2, patrolRadius: 90, respawnSeconds: 22 },
      { id: 'pl_har_2', type: 'harpie', x: 890, y: 290, level: 3, patrolRadius: 90, respawnSeconds: 22 },
      { id: 'pl_har_3', type: 'harpie', x: 1080, y: 675, level: 3, patrolRadius: 85, respawnSeconds: 22 },
      { id: 'pl_cent_1', type: 'centaure', x: 1210, y: 445, level: 4, patrolRadius: 65, respawnSeconds: 32 }
    ]
  },

  sanctuaire: {
    id: 'sanctuaire',
    name: 'Sanctuaire Brisé',
    subtitle: 'Seuil des Vestiges Primordiaux',
    realm: 'elysium',
    viewMode: 'top-down',
    recommendedLevel: 'Niv. 4 - 7',
    safeZone: false,
    catastrophe: 'quake',
    width: 1320,
    height: 840,
    cameraMargin: 24,
    defaultSpawn: { x: 104, y: 420 },
    solids: [
      { x: 0, y: 354, w: 68, h: 24, look: 'wall' },
      { x: 0, y: 478, w: 68, h: 24, look: 'wall' },
      { x: 1252, y: 354, w: 68, h: 24, look: 'wall' },
      { x: 1252, y: 478, w: 68, h: 24, look: 'wall' },
      pillar(380, 220), pillar(380, 620),
      pillar(580, 180), pillar(580, 660),
      pillar(860, 220), pillar(860, 620),
      pillar(1060, 260), pillar(1060, 580),
      ruin(170, 150, 180, 26),
      ruin(170, 660, 180, 26),
      { x: 245, y: 205, w: 56, h: 36, look: 'altar' },
      rock(680, 310, 68, 44),
      rock(680, 530, 68, 44)
    ],
    portals: [
      {
        id: 'sanctuaire_to_plaines',
        x: 0,
        y: 378,
        w: 68,
        h: 100,
        toZone: 'plaines',
        spawnX: 1310,
        spawnY: 448,
        label: 'Retour : Plaines Foudroyées'
      },
      {
        id: 'sanctuaire_to_rivage',
        x: 1252,
        y: 378,
        w: 68,
        h: 100,
        toZone: 'rivage',
        spawnX: 170,
        spawnY: 456,
        label: "Épreuve : Rivage d'Égée (Vue de profil)"
      }
    ],
    npcs: [
      { npcId: 'echo_promethee', x: 273, y: 278 }
    ],
    interactables: [],
    spawns: [
      { id: 'sn_aut_1', type: 'automate', x: 540, y: 340, level: 5, patrolRadius: 65, respawnSeconds: 26 },
      { id: 'sn_aut_2', type: 'automate', x: 560, y: 540, level: 5, patrolRadius: 65, respawnSeconds: 26 },
      { id: 'sn_har_1', type: 'harpie', x: 780, y: 240, level: 5, patrolRadius: 85, respawnSeconds: 24 },
      { id: 'sn_har_2', type: 'harpie', x: 780, y: 610, level: 5, patrolRadius: 85, respawnSeconds: 24 },
      { id: 'sn_boss_1', type: 'gardien_airain', x: 980, y: 420, level: 6, patrolRadius: 60, respawnSeconds: 45 }
    ]
  },

  rivage: {
    id: 'rivage',
    name: "Rivage d'Égée",
    subtitle: 'Épreuve de Poséidon — Activez les 3 Stèles',
    realm: 'olympus',
    viewMode: 'side-view',
    recommendedLevel: 'Niv. 6 - 10',
    safeZone: false,
    catastrophe: 'surge',
    width: MAPS['side-view'].width,
    height: MAPS['side-view'].height,
    cameraMargin: 0,
    defaultSpawn: { x: 170, y: 456 },
    solids: MAPS['side-view'].solids.map((s) => ({
      ...s,
      look: s.h > 60 && s.w > 1000 ? 'wall' : s.h <= 20 ? 'platform' : s.x > 1100 ? 'frieze' : s.x > 800 ? 'drum' : 'block'
    })),
    portals: [
      {
        id: 'rivage_to_agora',
        x: 28,
        y: 384,
        w: 56,
        h: 88,
        toZone: 'agora',
        spawnX: 132,
        spawnY: 300,
        label: "Retour : Agora de l'Olympe"
      },
      {
        id: 'rivage_to_sanctuaire',
        x: 1516,
        y: 384,
        w: 56,
        h: 88,
        toZone: 'sanctuaire',
        spawnX: 1185,
        spawnY: 428,
        label: 'Retour : Sanctuaire Brisé'
      }
    ],
    npcs: [],
    interactables: [
      {
        id: 'rivage_stele_1',
        targetId: 'stele_rivage',
        label: 'Stèle de Prométhée (Ouest)',
        kind: 'trial_stele',
        x: 640,
        y: 186,
        radius: 44
      },
      {
        id: 'rivage_stele_2',
        targetId: 'stele_rivage',
        label: 'Stèle de Prométhée (Ruines)',
        kind: 'trial_stele',
        x: 1250,
        y: 246,
        radius: 44
      },
      {
        id: 'rivage_stele_3',
        targetId: 'stele_rivage',
        label: 'Stèle de Prométhée (Est)',
        kind: 'trial_stele',
        x: 1440,
        y: 336,
        radius: 44
      }
    ],
    spawns: [
      { id: 'rv_har_1', type: 'harpie', x: 470, y: 245, level: 5, patrolRadius: 90, respawnSeconds: 26 },
      { id: 'rv_har_2', type: 'harpie', x: 1090, y: 230, level: 6, patrolRadius: 90, respawnSeconds: 26 },
      { id: 'rv_boss', type: 'sentinelle_poseidon', x: 1040, y: 452, level: 8, patrolRadius: 190, respawnSeconds: 90 }
    ]
  }
};

function overlaps(body: MovingBody, r: Rect): boolean {
  return (
    Math.abs(body.x - (r.x + r.w / 2)) < PLAYER_HALF + r.w / 2 &&
    Math.abs(body.y - (r.y + r.h / 2)) < PLAYER_HALF + r.h / 2
  );
}

export function stepZoneMovement(
  body: MovingBody,
  input: MoveInput,
  zone: ZoneDefinition,
  dt: number,
  speedMultiplier = 1
): void {
  const mode: ViewMode = zone.viewMode;
  const speed = PLAYER_SPEED * speedMultiplier;
  const horizontal = Number(input.right) - Number(input.left);
  const vertical = Number(input.down) - Number(input.up);
  const acceleration = 1 - Math.pow(0.75, dt * 60);

  if (mode === 'top-down') {
    const length = Math.hypot(horizontal, vertical) || 1;
    body.vx += ((horizontal / length) * speed - body.vx) * acceleration;
    body.vy += ((vertical / length) * speed - body.vy) * acceleration;
    body.isGrounded = true;
  } else {
    body.vx += (horizontal * speed - body.vx) * acceleration;
    body.vy = Math.min(body.vy + GRAVITY * dt, MAX_FALL_SPEED);
    body.isGrounded = false;
  }

  body.x += body.vx * dt;
  for (const solid of zone.solids) {
    if (!overlaps(body, solid)) continue;
    body.x = body.vx > 0 ? solid.x - PLAYER_HALF : solid.x + solid.w + PLAYER_HALF;
    body.vx = 0;
  }
  const clampedX = Math.min(Math.max(body.x, PLAYER_HALF), zone.width - PLAYER_HALF);
  if (clampedX !== body.x) {
    body.x = clampedX;
    body.vx = 0;
  }

  body.y += body.vy * dt;
  for (const solid of zone.solids) {
    if (!overlaps(body, solid)) continue;
    if (body.vy > 0) {
      body.y = solid.y - PLAYER_HALF;
      body.isGrounded = true;
    } else {
      body.y = solid.y + solid.h + PLAYER_HALF;
    }
    body.vy = 0;
  }
  const clampedY = Math.min(Math.max(body.y, PLAYER_HALF), zone.height - PLAYER_HALF);
  if (clampedY !== body.y) {
    body.y = clampedY;
    body.vy = 0;
  }

  if (mode === 'side-view' && input.jumpStarted && body.isGrounded) {
    body.vy = JUMP_VELOCITY;
    body.isGrounded = false;
  }
}

export function zonePortalAt(body: MovingBody, zone: ZoneDefinition): ZonePortal | undefined {
  return zone.portals.find((p) => overlaps(body, p));
}
