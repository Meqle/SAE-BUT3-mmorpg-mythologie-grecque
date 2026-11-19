import { MAPS, GRAVITY, JUMP_VELOCITY, MAX_FALL_SPEED, PLAYER_HALF, PLAYER_SPEED } from '@greek-myth/shared';
import type { MoveInput, MovingBody, Rect, ViewMode } from '@greek-myth/shared';

export type ZoneId = 'agora' | 'plaines' | 'sanctuaire' | 'rivage' | 'labyrinthe' | 'marecages';

export type ZoneSolidLook =
  | 'column'
  | 'olive'
  | 'cypress'
  | 'wall'
  | 'house'
  | 'stall'
  | 'fountain'
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
  variant?: number;
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

export type InteractableKind = 'brasero' | 'bronze' | 'herb' | 'stele' | 'trial_stele' | 'chest';

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
  | 'sentinelle_poseidon'
  | 'squelette'
  | 'minotaure'
  | 'serpent_lerne'
  | 'hydre_lerne';

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

const pillar = (cx: number, cy: number): ZoneSolid => ({ x: cx - 20, y: cy - 20, w: 40, h: 40, look: 'column' });
const olive = (cx: number, cy: number): ZoneSolid => ({ x: cx - 20, y: cy - 20, w: 40, h: 40, look: 'olive' });
const cypress = (cx: number, cy: number): ZoneSolid => ({ x: cx - 14, y: cy - 14, w: 28, h: 28, look: 'cypress' });
const rock = (cx: number, cy: number, w = 52, h = 40): ZoneSolid => ({ x: cx - w / 2, y: cy - h / 2, w, h, look: 'rock' });
const ruin = (x: number, y: number, w: number, h: number): ZoneSolid => ({ x, y, w, h, look: 'ruin' });
const house = (x: number, y: number, w: number, h: number, variant = 0): ZoneSolid => ({ x, y, w, h, look: 'house', variant });
const stall = (x: number, y: number, w: number, h: number, variant = 0): ZoneSolid => ({ x, y, w, h, look: 'stall', variant });

export const ZONES: Record<ZoneId, ZoneDefinition> = {
  agora: {
    id: 'agora',
    name: "Cité de l'Agora",
    subtitle: 'Refuge des Survivants',
    realm: 'olympus',
    viewMode: 'top-down',
    recommendedLevel: 'Zone sûre',
    safeZone: true,
    width: 2160,
    height: 1440,
    cameraMargin: 40,
    defaultSpawn: { x: 1080, y: 920 },
    solids: [
      // 8 colonnes autour de la place centrale (centre 1080, 660)
      pillar(1265, 737), pillar(1157, 845), pillar(1003, 845), pillar(895, 737),
      pillar(895, 583), pillar(1003, 475), pillar(1157, 475), pillar(1265, 583),

      // Murets de la porte Ouest (Quais d'Egee) et Est (Rempart royal)
      { x: 0, y: 604, w: 80, h: 28, look: 'wall' },
      { x: 0, y: 748, w: 80, h: 28, look: 'wall' },
      { x: 2080, y: 604, w: 80, h: 28, look: 'wall' },
      { x: 2080, y: 748, w: 80, h: 28, look: 'wall' },

      // Quartier des survivants (Nord-Ouest : maisons grecques a toits de tuiles)
      house(340, 210, 190, 120, 0),
      house(590, 190, 175, 115, 1),
      house(360, 410, 165, 110, 2),
      cypress(300, 270), cypress(560, 355), cypress(790, 250), olive(690, 430),

      // Bastion & terrasse Nord-Est (maisons + tour de guet)
      house(1400, 195, 185, 115, 1),
      house(1650, 210, 190, 120, 0),
      pillar(1430, 455), pillar(1590, 455),
      olive(1890, 260), cypress(1350, 310), cypress(1860, 430),

      // Quartier du Marche & Forge (Sud-Est)
      { x: 1515, y: 885, w: 62, h: 36, look: 'anvil' },
      stall(1365, 1045, 96, 44, 0),
      stall(1510, 1045, 96, 44, 1),
      stall(1660, 995, 92, 44, 2),
      house(1670, 1140, 195, 120, 2),
      olive(1900, 1090), olive(1320, 1220), cypress(1920, 880),

      // Jardin de soins de Cassandre (Sud-Ouest)
      { x: 470, y: 950, w: 68, h: 40, look: 'tent' },
      { x: 605, y: 955, w: 58, h: 58, look: 'fountain' },
      house(450, 1140, 180, 115, 0),
      olive(390, 960), olive(735, 1110), olive(840, 1250), cypress(720, 930),

      // Bosquets decoratifs autour de l'avenue sud
      olive(930, 1150), olive(1230, 1150),
      cypress(960, 290), cypress(1200, 290)
    ],
    portals: [
      {
        id: 'agora_to_plaines',
        x: 2080,
        y: 632,
        w: 80,
        h: 116,
        toZone: 'plaines',
        spawnX: 115,
        spawnY: 560,
        label: 'Plaines Foudroyées'
      },
      {
        id: 'agora_to_rivage',
        x: 0,
        y: 632,
        w: 80,
        h: 116,
        toZone: 'rivage',
        spawnX: 170,
        spawnY: 456,
        label: "Rivage d'Égée",
        requiredQuestCompleted: 'mq_1_etincelle',
        lockedHint: "Ranimez d'abord le Brasero de Prométhée sur la place centrale."
      }
    ],
    npcs: [
      { npcId: 'lycos', x: 1080, y: 585 },
      { npcId: 'damon', x: 1546, y: 845 },
      { npcId: 'elena', x: 1412, y: 1005 },
      { npcId: 'cassandre', x: 545, y: 912 },
      { npcId: 'theron', x: 1995, y: 590 },
      { npcId: 'iris', x: 1510, y: 395 },
      { npcId: 'philon', x: 645, y: 365 },
      { npcId: 'neree', x: 240, y: 715 }
    ],
    interactables: [
      {
        id: 'brasero_agora',
        targetId: 'brasero_promethee',
        label: 'Brasero de Prométhée',
        kind: 'brasero',
        x: 1080,
        y: 660,
        radius: 50,
        questId: 'mq_1_etincelle'
      }
    ],
    spawns: []
  },

  plaines: {
    id: 'plaines',
    name: 'Plaines Foudroyées',
    subtitle: 'Routes ravagées',
    realm: 'olympus',
    viewMode: 'top-down',
    recommendedLevel: 'Niv. 1 - 4',
    safeZone: false,
    width: 1840,
    height: 1120,
    cameraMargin: 28,
    defaultSpawn: { x: 115, y: 560 },
    solids: [
      { x: 0, y: 484, w: 72, h: 26, look: 'wall' },
      { x: 0, y: 610, w: 72, h: 26, look: 'wall' },
      { x: 1768, y: 484, w: 72, h: 26, look: 'wall' },
      { x: 1768, y: 610, w: 72, h: 26, look: 'wall' },
      // Avant-poste ruine a l'entree ouest (zone tampon sans monstres)
      ruin(175, 420, 120, 24),
      ruin(175, 676, 120, 24),
      olive(140, 250), olive(190, 860),
      // Ruines nord & sud + bosquets
      ruin(520, 250, 180, 26),
      ruin(520, 250, 26, 120),
      pillar(750, 265), pillar(840, 265),
      olive(430, 820), olive(860, 910), olive(1320, 220), olive(1410, 890),
      cypress(640, 180), cypress(1190, 180), cypress(1260, 920),
      rock(490, 690, 66, 46),
      rock(870, 720, 76, 48),
      ruin(1090, 230, 180, 26),
      ruin(1120, 760, 175, 28),
      pillar(1180, 325), pillar(1310, 700),
      rock(1450, 360, 70, 50)
    ],
    portals: [
      {
        id: 'plaines_to_agora',
        x: 0,
        y: 510,
        w: 72,
        h: 100,
        toZone: 'agora',
        spawnX: 2015,
        spawnY: 690,
        label: "Cité de l'Agora"
      },
      {
        id: 'plaines_to_sanctuaire',
        x: 1768,
        y: 510,
        w: 72,
        h: 100,
        toZone: 'sanctuaire',
        spawnX: 115,
        spawnY: 510,
        label: 'Sanctuaire Brisé'
      }
    ],
    npcs: [],
    interactables: [
      { id: 'bronze_1', targetId: 'fragment_bronze', label: 'Fragment de bronze', kind: 'bronze', x: 595, y: 325, radius: 42, questId: 'sq_bronze_ruines' },
      { id: 'bronze_2', targetId: 'fragment_bronze', label: 'Fragment de bronze', kind: 'bronze', x: 965, y: 810, radius: 42, questId: 'sq_bronze_ruines' },
      { id: 'bronze_3', targetId: 'fragment_bronze', label: 'Fragment de bronze', kind: 'bronze', x: 1245, y: 310, radius: 42, questId: 'sq_bronze_ruines' },
      { id: 'herb_1', targetId: 'herbe_ambroisie', label: "Herbe d'ambroisie", kind: 'herb', x: 205, y: 285, radius: 42, questId: 'sq_ambroisie_perdue' },
      { id: 'herb_2', targetId: 'herbe_ambroisie', label: "Herbe d'ambroisie", kind: 'herb', x: 495, y: 865, radius: 42, questId: 'sq_ambroisie_perdue' },
      { id: 'herb_3', targetId: 'herbe_ambroisie', label: "Herbe d'ambroisie", kind: 'herb', x: 1355, y: 925, radius: 42, questId: 'sq_ambroisie_perdue' },
      { id: 'stele_chatiment_obj', targetId: 'stele_chatiment', label: 'Stèle du Châtiment', kind: 'stele', x: 950, y: 185, radius: 52, questId: 'mq_2_terres_foudroyees' },
      { id: 'coffre_plaines_1', targetId: 'chest_loot', label: 'Coffre antique', kind: 'chest', x: 1126, y: 205, radius: 42 },
      { id: 'coffre_plaines_2', targetId: 'chest_loot', label: 'Coffre antique', kind: 'chest', x: 640, y: 940, radius: 42 }
    ],
    spawns: [
      { id: 'pl_sat_1', type: 'satyre', x: 570, y: 545, level: 1, patrolRadius: 75, respawnSeconds: 18 },
      { id: 'pl_sat_2', type: 'satyre', x: 760, y: 780, level: 2, patrolRadius: 80, respawnSeconds: 18 },
      { id: 'pl_sat_3', type: 'satyre', x: 990, y: 490, level: 2, patrolRadius: 80, respawnSeconds: 18 },
      { id: 'pl_sat_4', type: 'satyre', x: 1180, y: 880, level: 2, patrolRadius: 75, respawnSeconds: 20 },
      { id: 'pl_har_1', type: 'harpie', x: 740, y: 370, level: 2, patrolRadius: 95, respawnSeconds: 22 },
      { id: 'pl_har_2', type: 'harpie', x: 1120, y: 380, level: 3, patrolRadius: 95, respawnSeconds: 22 },
      { id: 'pl_har_3', type: 'harpie', x: 1350, y: 810, level: 3, patrolRadius: 90, respawnSeconds: 22 },
      { id: 'pl_cent_1', type: 'centaure', x: 1560, y: 560, level: 4, patrolRadius: 75, respawnSeconds: 32 }
    ]
  },

  sanctuaire: {
    id: 'sanctuaire',
    name: 'Sanctuaire Brisé',
    subtitle: 'Seuil des Vestiges',
    realm: 'elysium',
    viewMode: 'top-down',
    recommendedLevel: 'Niv. 4 - 7',
    safeZone: false,
    width: 1600,
    height: 1020,
    cameraMargin: 28,
    defaultSpawn: { x: 115, y: 510 },
    solids: [
      { x: 0, y: 434, w: 72, h: 26, look: 'wall' },
      { x: 0, y: 560, w: 72, h: 26, look: 'wall' },
      { x: 1528, y: 434, w: 72, h: 26, look: 'wall' },
      { x: 1528, y: 560, w: 72, h: 26, look: 'wall' },
      { x: 716, y: 0, w: 26, h: 64, look: 'wall' },
      { x: 858, y: 0, w: 26, h: 64, look: 'wall' },
      { x: 716, y: 956, w: 26, h: 64, look: 'wall' },
      { x: 858, y: 956, w: 26, h: 64, look: 'wall' },
      ruin(185, 190, 210, 26),
      ruin(185, 800, 210, 26),
      { x: 265, y: 250, w: 60, h: 38, look: 'altar' },
      pillar(480, 250), pillar(480, 770),
      pillar(720, 210), pillar(720, 810),
      pillar(1020, 250), pillar(1020, 770),
      pillar(1280, 310), pillar(1280, 710),
      rock(850, 370, 68, 44),
      rock(850, 650, 68, 44)
    ],
    portals: [
      {
        id: 'sanctuaire_to_plaines',
        x: 0,
        y: 460,
        w: 72,
        h: 100,
        toZone: 'plaines',
        spawnX: 1695,
        spawnY: 560,
        label: 'Plaines Foudroyées'
      },
      {
        id: 'sanctuaire_to_rivage',
        x: 1528,
        y: 460,
        w: 72,
        h: 100,
        toZone: 'rivage',
        spawnX: 170,
        spawnY: 456,
        label: "Rivage d'Égée"
      },
      {
        id: 'sanctuaire_to_labyrinthe',
        x: 742,
        y: 0,
        w: 116,
        h: 64,
        toZone: 'labyrinthe',
        spawnX: 165,
        spawnY: 985,
        label: 'Labyrinthe des Brumes'
      },
      {
        id: 'sanctuaire_to_marecages',
        x: 742,
        y: 956,
        w: 116,
        h: 64,
        toZone: 'marecages',
        spawnX: 880,
        spawnY: 115,
        label: 'Marécages de Lerne'
      }
    ],
    npcs: [
      { npcId: 'echo_promethee', x: 295, y: 332 }
    ],
    interactables: [
      { id: 'coffre_sanctuaire_1', targetId: 'chest_loot', label: 'Coffre des Titans', kind: 'chest', x: 1410, y: 880, radius: 44 }
    ],
    spawns: [
      { id: 'sn_aut_1', type: 'automate', x: 690, y: 410, level: 5, patrolRadius: 65, respawnSeconds: 26 },
      { id: 'sn_aut_2', type: 'automate', x: 700, y: 635, level: 5, patrolRadius: 65, respawnSeconds: 26 },
      { id: 'sn_har_1', type: 'harpie', x: 960, y: 290, level: 5, patrolRadius: 85, respawnSeconds: 24 },
      { id: 'sn_har_2', type: 'harpie', x: 960, y: 735, level: 5, patrolRadius: 85, respawnSeconds: 24 },
      { id: 'sn_boss_1', type: 'gardien_airain', x: 1210, y: 510, level: 6, patrolRadius: 65, respawnSeconds: 45 }
    ]
  },

  rivage: {
    id: 'rivage',
    name: "Rivage d'Égée",
    subtitle: 'Épreuve de Poséidon',
    realm: 'olympus',
    viewMode: 'side-view',
    recommendedLevel: 'Niv. 6 - 10',
    safeZone: false,
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
        spawnX: 145,
        spawnY: 690,
        label: "Cité de l'Agora"
      },
      {
        id: 'rivage_to_sanctuaire',
        x: 1516,
        y: 384,
        w: 56,
        h: 88,
        toZone: 'sanctuaire',
        spawnX: 1455,
        spawnY: 510,
        label: 'Sanctuaire Brisé'
      }
    ],
    npcs: [],
    interactables: [
      { id: 'rivage_stele_1', targetId: 'stele_rivage', label: 'Stèle de Prométhée', kind: 'trial_stele', x: 640, y: 186, radius: 44 },
      { id: 'rivage_stele_2', targetId: 'stele_rivage', label: 'Stèle de Prométhée', kind: 'trial_stele', x: 1250, y: 246, radius: 44 },
      { id: 'rivage_stele_3', targetId: 'stele_rivage', label: 'Stèle de Prométhée', kind: 'trial_stele', x: 1440, y: 336, radius: 44 }
    ],
    spawns: [
      { id: 'rv_har_1', type: 'harpie', x: 470, y: 245, level: 5, patrolRadius: 90, respawnSeconds: 26 },
      { id: 'rv_har_2', type: 'harpie', x: 1090, y: 230, level: 6, patrolRadius: 90, respawnSeconds: 26 },
      { id: 'rv_boss', type: 'sentinelle_poseidon', x: 1060, y: 452, level: 8, patrolRadius: 190, respawnSeconds: 90 }
    ]
  },

  labyrinthe: {
    id: 'labyrinthe',
    name: 'Labyrinthe des Brumes',
    subtitle: 'Donjon du Minotaure',
    realm: 'tartarus',
    viewMode: 'top-down',
    recommendedLevel: 'Niv. 7 - 10',
    safeZone: false,
    width: 1680,
    height: 1160,
    cameraMargin: 28,
    defaultSpawn: { x: 165, y: 985 },
    solids: [
      // Murets de la porte sud-ouest (retour Sanctuaire)
      { x: 74, y: 1086, w: 26, h: 74, look: 'wall' },
      { x: 230, y: 1086, w: 26, h: 74, look: 'wall' },

      // Murs du labyrinthe (couloirs larges >= 150px)
      ruin(340, 740, 28, 420),
      ruin(340, 420, 28, 170),
      ruin(340, 120, 28, 160),

      ruin(340, 420, 340, 28),
      ruin(520, 740, 460, 28),
      ruin(660, 180, 28, 268),
      ruin(660, 560, 28, 180),

      ruin(960, 160, 28, 320),
      ruin(960, 650, 28, 360),
      ruin(660, 180, 328, 28),

      // Colonnes de la salle du Minotaure (Est, centre 1330, 560)
      pillar(1140, 320), pillar(1520, 320),
      pillar(1140, 800), pillar(1520, 800),
      pillar(180, 520), pillar(510, 940)
    ],
    portals: [
      {
        id: 'labyrinthe_to_sanctuaire',
        x: 100,
        y: 1086,
        w: 130,
        h: 74,
        toZone: 'sanctuaire',
        spawnX: 800,
        spawnY: 112,
        label: 'Sanctuaire Brisé'
      }
    ],
    npcs: [],
    interactables: [
      { id: 'fil_ariane_obj', targetId: 'fil_ariane', label: "Autel du Fil d'Ariane", kind: 'stele', x: 185, y: 190, radius: 50 },
      { id: 'coffre_laby_1', targetId: 'chest_loot', label: 'Coffre crétois', kind: 'chest', x: 510, y: 295, radius: 44 },
      { id: 'coffre_laby_2', targetId: 'chest_loot', label: 'Coffre crétois', kind: 'chest', x: 820, y: 940, radius: 44 }
    ],
    spawns: [
      { id: 'lb_sq_1', type: 'squelette', x: 190, y: 690, level: 7, patrolRadius: 65, respawnSeconds: 24 },
      { id: 'lb_sq_2', type: 'squelette', x: 200, y: 340, level: 7, patrolRadius: 60, respawnSeconds: 24 },
      { id: 'lb_sq_3', type: 'squelette', x: 810, y: 580, level: 8, patrolRadius: 75, respawnSeconds: 26 },
      { id: 'lb_aut_1', type: 'automate', x: 810, y: 315, level: 8, patrolRadius: 60, respawnSeconds: 28 },
      { id: 'lb_sq_4', type: 'squelette', x: 580, y: 930, level: 8, patrolRadius: 70, respawnSeconds: 26 },
      { id: 'lb_boss', type: 'minotaure', x: 1340, y: 560, level: 9, patrolRadius: 85, respawnSeconds: 75 }
    ]
  }
,
  marecages: {
    id: 'marecages',
    name: 'Marécages de Lerne',
    subtitle: 'Antre Toxique de l’Hydre',
    realm: 'elysium',
    viewMode: 'top-down',
    recommendedLevel: 'Niv. 7 - 10',
    safeZone: false,
    width: 1760,
    height: 1140,
    cameraMargin: 28,
    defaultSpawn: { x: 880, y: 115 },
    solids: [
      { x: 796, y: 0, w: 26, h: 64, look: 'wall' },
      { x: 938, y: 0, w: 26, h: 64, look: 'wall' },
      ruin(210, 210, 175, 26),
      ruin(1360, 210, 175, 26),
      ruin(220, 820, 170, 26),
      ruin(1360, 820, 170, 26),
      pillar(640, 290),
      pillar(1120, 290),
      pillar(560, 620),
      pillar(1200, 620),
      pillar(690, 960),
      pillar(1070, 960),
      rock(380, 440, 74, 48),
      rock(1310, 440, 74, 48),
      rock(420, 720, 66, 44),
      rock(1290, 720, 66, 44),
      cypress(160, 140),
      cypress(1570, 140),
      cypress(150, 560),
      cypress(1580, 560),
      cypress(180, 980),
      cypress(1550, 980)
    ],
    portals: [
      {
        id: 'marecages_to_sanctuaire',
        x: 822,
        y: 0,
        w: 116,
        h: 64,
        toZone: 'sanctuaire',
        spawnX: 800,
        spawnY: 905,
        label: 'Sanctuaire Brisé'
      }
    ],
    npcs: [],
    interactables: [
      { id: 'autel_soufre_1', targetId: 'autel_soufre', label: 'Autel de Soufre (Ouest)', kind: 'stele', x: 295, y: 315, radius: 52 },
      { id: 'autel_soufre_2', targetId: 'autel_soufre', label: 'Autel de Soufre (Est)', kind: 'stele', x: 1455, y: 315, radius: 52 },
      { id: 'coffre_marecages_1', targetId: 'chest_loot', label: 'Coffre englouti', kind: 'chest', x: 280, y: 920, radius: 42 },
      { id: 'coffre_marecages_2', targetId: 'chest_loot', label: 'Coffre de Lerne', kind: 'chest', x: 1470, y: 920, radius: 42 }
    ],
    spawns: [
      { id: 'mar_vip_1', type: 'serpent_lerne', x: 520, y: 250, level: 7, patrolRadius: 105, respawnSeconds: 18 },
      { id: 'mar_vip_2', type: 'serpent_lerne', x: 1240, y: 250, level: 7, patrolRadius: 105, respawnSeconds: 18 },
      { id: 'mar_vip_3', type: 'serpent_lerne', x: 340, y: 560, level: 8, patrolRadius: 105, respawnSeconds: 19 },
      { id: 'mar_vip_4', type: 'serpent_lerne', x: 1410, y: 560, level: 8, patrolRadius: 105, respawnSeconds: 19 },
      { id: 'mar_vip_5', type: 'serpent_lerne', x: 520, y: 890, level: 8, patrolRadius: 105, respawnSeconds: 19 },
      { id: 'mar_vip_6', type: 'serpent_lerne', x: 1230, y: 890, level: 8, patrolRadius: 105, respawnSeconds: 19 },
      { id: 'mar_har_1', type: 'harpie', x: 740, y: 440, level: 7, patrolRadius: 105, respawnSeconds: 20 },
      { id: 'mar_har_2', type: 'harpie', x: 1020, y: 440, level: 7, patrolRadius: 105, respawnSeconds: 20 },
      { id: 'mar_boss_hydre', type: 'hydre_lerne', x: 880, y: 780, level: 9, patrolRadius: 85, respawnSeconds: 45 }
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
