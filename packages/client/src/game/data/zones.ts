import { MAPS, GRAVITY, JUMP_VELOCITY, MAX_FALL_SPEED, PLAYER_HALF, PLAYER_SPEED } from '@greek-myth/shared';
import type { MoveInput, MovingBody, Rect, ViewMode } from '@greek-myth/shared';

export type ZoneId = 'agora' | 'plaines' | 'sanctuaire' | 'rivage' | 'labyrinthe' | 'marecages' | 'taverne_interieur' | 'forge_interieur' | 'apothicairerie_interieur';

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
  | 'frieze'
  | 'water';

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

export type InteractableKind = 'brasero' | 'bronze' | 'herb' | 'stele' | 'trial_stele' | 'chest' | 'workbench';

export interface ChestSealRequirement {
  zoneId: ZoneId;
  requiredKills: number;
  enemyType?: EnemyType;
  hint: string;
}

export interface ZoneInteractable {
  id: string;
  targetId: string;
  label: string;
  kind: InteractableKind;
  x: number;
  y: number;
  radius: number;
  questId?: string;
  seal?: ChestSealRequirement;
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
      cypress(960, 290), cypress(1200, 290),

      // Interdiction de marcher sur l'eau du port Sud-Ouest
      { x: 0, y: 778, w: 248, h: 662, look: 'water' },

      // Enrichissement des coins de la cite (maisons, bosquets, colonnes)
      house(95, 110, 175, 110, 2),
      olive(120, 290), cypress(220, 460), cypress(95, 480),
      house(1895, 105, 175, 110, 1),
      cypress(1985, 295), olive(1990, 445),
      house(1910, 1225, 175, 110, 0),
      cypress(1995, 1005), olive(1480, 1295),
      cypress(330, 1295), olive(670, 1295)
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
        label: 'Plaines Foudroyées',
        requiredQuestCompleted: 'mq_1_etincelle',
        lockedHint: "Parlez d'abord à Lycos et ranimez le Brasero de Prométhée sur l'Agora."
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
      },
      {
        id: 'agora_to_taverne',
        x: 412,
        y: 332,
        w: 46,
        h: 26,
        toZone: 'taverne_interieur',
        spawnX: 480,
        spawnY: 575,
        label: 'Entrer : Taverne'
      },
      {
        id: 'agora_to_forge',
        x: 1744,
        y: 1262,
        w: 46,
        h: 26,
        toZone: 'forge_interieur',
        spawnX: 460,
        spawnY: 555,
        label: 'Entrer : Forge'
      },
      {
        id: 'agora_to_apothicairerie',
        x: 517,
        y: 1257,
        w: 46,
        h: 26,
        toZone: 'apothicairerie_interieur',
        spawnX: 460,
        spawnY: 555,
        label: 'Entrer : Infirmerie'
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
      {
        id: 'coffre_plaines_1',
        targetId: 'chest_loot',
        label: 'Coffre dissimulé',
        kind: 'chest',
        x: 1695,
        y: 125,
        radius: 40
      },
      {
        id: 'coffre_plaines_2',
        targetId: 'chest_loot',
        label: 'Coffre scellé des Plaines',
        kind: 'chest',
        x: 155,
        y: 985,
        radius: 44,
        seal: {
          zoneId: 'plaines',
          requiredKills: 4,
          hint: 'Sceau antique : terrassez 4 créatures dans les Plaines pour briser ce sceau.'
        }
      }
    ],
    spawns: [
      { id: 'pl_sat_1', type: 'satyre', x: 570, y: 545, level: 1, patrolRadius: 75, respawnSeconds: 120 },
      { id: 'pl_sat_2', type: 'satyre', x: 760, y: 780, level: 2, patrolRadius: 80, respawnSeconds: 120 },
      { id: 'pl_sat_3', type: 'satyre', x: 990, y: 490, level: 2, patrolRadius: 80, respawnSeconds: 120 },
      { id: 'pl_sat_4', type: 'satyre', x: 1180, y: 880, level: 2, patrolRadius: 75, respawnSeconds: 120 },
      { id: 'pl_har_1', type: 'harpie', x: 740, y: 370, level: 2, patrolRadius: 95, respawnSeconds: 120 },
      { id: 'pl_har_2', type: 'harpie', x: 1120, y: 380, level: 3, patrolRadius: 95, respawnSeconds: 120 },
      { id: 'pl_har_3', type: 'harpie', x: 1350, y: 810, level: 3, patrolRadius: 90, respawnSeconds: 120 },
      { id: 'pl_cent_1', type: 'centaure', x: 1560, y: 560, level: 4, patrolRadius: 75, respawnSeconds: 150 }
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
        label: "Rivage d'Égée",
        requiredQuestCompleted: 'mq_3_sanctuaire',
        lockedHint: "Vainquez le Gardien d'Airain et validez la quête du Sanctuaire."
      },
      {
        id: 'sanctuaire_to_labyrinthe',
        x: 742,
        y: 0,
        w: 116,
        h: 64,
        toZone: 'labyrinthe',
        spawnX: 170,
        spawnY: 1545,
        label: 'Labyrinthe des Brumes',
        requiredQuestCompleted: 'mq_4_rivage_epreuve',
        lockedHint: "Terminez d'abord l'épreuve du Rivage d'Égée auprès de Lycos."
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
        label: 'Marécages de Lerne',
        requiredQuestCompleted: 'mq_5_labyrinthe',
        lockedHint: "Vainquez d'abord le Minotaure et validez la quête du Labyrinthe."
      }
    ],
    npcs: [
      { npcId: 'echo_promethee', x: 295, y: 332 }
    ],
    interactables: [
      {
        id: 'coffre_sanctuaire_1',
        targetId: 'chest_loot',
        label: "Coffre scellé d'Héphaïstos",
        kind: 'chest',
        x: 1475,
        y: 910,
        radius: 44,
        seal: {
          zoneId: 'sanctuaire',
          requiredKills: 2,
          enemyType: 'automate',
          hint: "Sceau d'Héphaïstos : détruisez 2 Automates pour ouvrir ce coffre."
        }
      }
    ],
    spawns: [
      { id: 'sn_aut_1', type: 'automate', x: 690, y: 410, level: 5, patrolRadius: 65, respawnSeconds: 150 },
      { id: 'sn_aut_2', type: 'automate', x: 700, y: 635, level: 5, patrolRadius: 65, respawnSeconds: 150 },
      { id: 'sn_har_1', type: 'harpie', x: 960, y: 290, level: 5, patrolRadius: 85, respawnSeconds: 150 },
      { id: 'sn_har_2', type: 'harpie', x: 960, y: 735, level: 5, patrolRadius: 85, respawnSeconds: 150 },
      { id: 'sn_boss_1', type: 'gardien_airain', x: 1210, y: 510, level: 6, patrolRadius: 65, respawnSeconds: 180 }
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
      { id: 'rv_har_1', type: 'harpie', x: 470, y: 245, level: 5, patrolRadius: 90, respawnSeconds: 150 },
      { id: 'rv_har_2', type: 'harpie', x: 1090, y: 230, level: 6, patrolRadius: 90, respawnSeconds: 150 },
      { id: 'rv_boss', type: 'sentinelle_poseidon', x: 1060, y: 452, level: 8, patrolRadius: 190, respawnSeconds: 180 }
    ]
  },

  labyrinthe: {
    id: 'labyrinthe',
    name: 'Labyrinthe des Brumes',
    subtitle: 'Dédale de Crète',
    realm: 'elysium',
    viewMode: 'top-down',
    recommendedLevel: 'Niv. 7 - 10',
    safeZone: false,
    width: 2480,
    height: 1720,
    cameraMargin: 28,
    defaultSpawn: { x: 170, y: 1545 },
    solids: [
      // Porte Sud d'entree (x=110..230, y=1656..1720)
      { x: 76, y: 1656, w: 32, h: 64, look: 'wall' },
      { x: 232, y: 1656, w: 32, h: 64, look: 'wall' },

      // Murs du dedale (couloirs larges de 200-240px, vrais embranchements et impasses)
      // Colonne 1 (x=360)
      { x: 360, y: 1220, w: 34, h: 500, look: 'wall' },
      { x: 360, y: 360, w: 34, h: 640, look: 'wall' },
      // Traverses Ouest
      { x: 0, y: 1180, w: 210, h: 34, look: 'wall' },
      { x: 150, y: 740, w: 244, h: 34, look: 'wall' },
      { x: 0, y: 360, w: 220, h: 34, look: 'wall' },

      // Colonne 2 (x=760)
      { x: 760, y: 0, w: 34, h: 420, look: 'wall' },
      { x: 760, y: 600, w: 34, h: 560, look: 'wall' },
      { x: 760, y: 1340, w: 34, h: 380, look: 'wall' },
      // Traverses Centre-Ouest
      { x: 360, y: 1340, w: 240, h: 34, look: 'wall' },
      { x: 540, y: 960, w: 254, h: 34, look: 'wall' },
      { x: 360, y: 560, w: 240, h: 34, look: 'wall' },
      { x: 540, y: 200, w: 254, h: 34, look: 'wall' },

      // Colonne 3 (x=1180)
      { x: 1180, y: 200, w: 34, h: 580, look: 'wall' },
      { x: 1180, y: 980, w: 34, h: 520, look: 'wall' },
      // Traverses Centre
      { x: 760, y: 1126, w: 260, h: 34, look: 'wall' },
      { x: 960, y: 746, w: 254, h: 34, look: 'wall' },
      { x: 760, y: 386, w: 260, h: 34, look: 'wall' },
      { x: 960, y: 1480, w: 254, h: 34, look: 'wall' },

      // Colonne 4 (x=1620) — Avant-mur de la Salle du Minotaure (ouverture centrale y=740..980)
      { x: 1620, y: 0, w: 36, h: 740, look: 'wall' },
      { x: 1620, y: 980, w: 36, h: 740, look: 'wall' },
      // Traverses Centre-Est
      { x: 1180, y: 1220, w: 270, h: 34, look: 'wall' },
      { x: 1380, y: 520, w: 276, h: 34, look: 'wall' },
      { x: 1180, y: 200, w: 260, h: 34, look: 'wall' },

      // 4 Piliers massifs encadrant la salle du Minotaure (centre 2060, 860)
      pillar(1830, 560), pillar(2280, 560),
      pillar(1830, 1160), pillar(2280, 1160)
    ],
    portals: [
      {
        id: 'labyrinthe_to_sanctuaire',
        x: 110,
        y: 1656,
        w: 120,
        h: 64,
        toZone: 'sanctuaire',
        spawnX: 800,
        spawnY: 115,
        label: 'Sanctuaire Brisé'
      }
    ],
    npcs: [],
    interactables: [
      // Fil d'Ariane cache tout au nord-est du dedale (avant la salle du boss)
      { id: 'fil_ariane_autel', targetId: 'fil_ariane', label: "Autel du Fil d'Ariane", kind: 'stele', x: 1380, y: 105, radius: 52 },
      // Coffre scelle dans une impasse sud-centre
      {
        id: 'coffre_laby_1',
        targetId: 'chest_loot',
        label: 'Coffre scellé de Dédale',
        kind: 'chest',
        x: 560,
        y: 1525,
        radius: 44,
        seal: {
          zoneId: 'labyrinthe',
          requiredKills: 3,
          enemyType: 'squelette',
          hint: 'Sceau de Dédale : abattez 3 Squelettes hoplites.'
        }
      },
      // Coffre dissimule dans l'impasse nord-ouest
      {
        id: 'coffre_laby_2',
        targetId: 'chest_loot',
        label: 'Coffre oublié',
        kind: 'chest',
        x: 145,
        y: 140,
        radius: 40
      }
    ],
    spawns: [
      { id: 'lab_sq_1', type: 'squelette', x: 190, y: 980, level: 7, patrolRadius: 95, respawnSeconds: 130 },
      { id: 'lab_sq_2', type: 'squelette', x: 190, y: 550, level: 7, patrolRadius: 95, respawnSeconds: 130 },
      { id: 'lab_sq_3', type: 'squelette', x: 560, y: 1150, level: 7, patrolRadius: 95, respawnSeconds: 130 },
      { id: 'lab_sq_4', type: 'squelette', x: 560, y: 760, level: 8, patrolRadius: 95, respawnSeconds: 130 },
      { id: 'lab_sq_5', type: 'squelette', x: 560, y: 390, level: 8, patrolRadius: 95, respawnSeconds: 130 },
      { id: 'lab_sq_6', type: 'squelette', x: 970, y: 1300, level: 8, patrolRadius: 95, respawnSeconds: 130 },
      { id: 'lab_sq_7', type: 'squelette', x: 970, y: 940, level: 8, patrolRadius: 95, respawnSeconds: 130 },
      { id: 'lab_sq_8', type: 'squelette', x: 970, y: 560, level: 8, patrolRadius: 95, respawnSeconds: 130 },
      { id: 'lab_sq_9', type: 'squelette', x: 1400, y: 1020, level: 8, patrolRadius: 100, respawnSeconds: 135 },
      { id: 'lab_sq_10', type: 'squelette', x: 1400, y: 340, level: 8, patrolRadius: 100, respawnSeconds: 135 },
      { id: 'lab_boss_minotaure', type: 'minotaure', x: 2060, y: 860, level: 9, patrolRadius: 95, respawnSeconds: 180 }
    ]
  },
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
      {
        id: 'coffre_marecages_1',
        targetId: 'chest_loot',
        label: 'Coffre scellé de Lerne',
        kind: 'chest',
        x: 240,
        y: 1020,
        radius: 44,
        seal: {
          zoneId: 'marecages',
          requiredKills: 3,
          enemyType: 'serpent_lerne',
          hint: 'Sceau de Lerne : éliminez 3 Vipères de Lerne pour briser ce sceau.'
        }
      },
      {
        id: 'coffre_marecages_2',
        targetId: 'chest_loot',
        label: 'Coffre des roseaux',
        kind: 'chest',
        x: 1580,
        y: 1030,
        radius: 40
      }
    ],
    spawns: [
      { id: 'mar_vip_1', type: 'serpent_lerne', x: 520, y: 250, level: 7, patrolRadius: 105, respawnSeconds: 120 },
      { id: 'mar_vip_2', type: 'serpent_lerne', x: 1240, y: 250, level: 7, patrolRadius: 105, respawnSeconds: 120 },
      { id: 'mar_vip_3', type: 'serpent_lerne', x: 340, y: 560, level: 8, patrolRadius: 105, respawnSeconds: 120 },
      { id: 'mar_vip_4', type: 'serpent_lerne', x: 1410, y: 560, level: 8, patrolRadius: 105, respawnSeconds: 120 },
      { id: 'mar_vip_5', type: 'serpent_lerne', x: 520, y: 890, level: 8, patrolRadius: 105, respawnSeconds: 120 },
      { id: 'mar_vip_6', type: 'serpent_lerne', x: 1230, y: 890, level: 8, patrolRadius: 105, respawnSeconds: 120 },
      { id: 'mar_har_1', type: 'harpie', x: 740, y: 440, level: 7, patrolRadius: 105, respawnSeconds: 120 },
      { id: 'mar_har_2', type: 'harpie', x: 1020, y: 440, level: 7, patrolRadius: 105, respawnSeconds: 120 },
      { id: 'mar_boss_hydre', type: 'hydre_lerne', x: 880, y: 780, level: 9, patrolRadius: 85, respawnSeconds: 180 }
    ]
  }
,
  taverne_interieur: {
    id: 'taverne_interieur',
    name: 'Taverne des Héros',
    subtitle: 'Intérieur — Cité de l’Agora',
    realm: 'olympus',
    viewMode: 'top-down',
    recommendedLevel: 'Zone sûre',
    safeZone: true,
    width: 960,
    height: 680,
    cameraMargin: 24,
    defaultSpawn: { x: 480, y: 565 },
    solids: [
      { x: 0, y: 0, w: 960, h: 48, look: 'wall' },
      { x: 0, y: 0, w: 36, h: 680, look: 'wall' },
      { x: 924, y: 0, w: 36, h: 680, look: 'wall' },
      { x: 0, y: 644, w: 420, h: 36, look: 'wall' },
      { x: 540, y: 644, w: 420, h: 36, look: 'wall' },
      // Comptoir nord & tables de banquet
      stall(360, 110, 240, 44, 0),
      stall(130, 270, 145, 52, 1),
      stall(685, 270, 145, 52, 1),
      stall(130, 440, 145, 52, 2),
      stall(685, 440, 145, 52, 2)
    ],
    portals: [
      {
        id: 'taverne_to_agora',
        x: 428,
        y: 630,
        w: 104,
        h: 48,
        toZone: 'agora',
        spawnX: 435,
        spawnY: 382,
        label: "Sortir : Cité de l'Agora"
      }
    ],
    npcs: [
      { npcId: 'dionysios', x: 480, y: 194 },
      { npcId: 'homere', x: 760, y: 185 }
    ],
    interactables: [],
    spawns: []
  },
  forge_interieur: {
    id: 'forge_interieur',
    name: 'Atelier de la Forge',
    subtitle: 'Intérieur — Forge de Damon',
    realm: 'olympus',
    viewMode: 'top-down',
    recommendedLevel: 'Zone sûre',
    safeZone: true,
    width: 920,
    height: 660,
    cameraMargin: 24,
    defaultSpawn: { x: 460, y: 550 },
    solids: [
      { x: 0, y: 0, w: 920, h: 48, look: 'wall' },
      { x: 0, y: 0, w: 36, h: 660, look: 'wall' },
      { x: 884, y: 0, w: 36, h: 660, look: 'wall' },
      { x: 0, y: 624, w: 400, h: 36, look: 'wall' },
      { x: 520, y: 624, w: 400, h: 36, look: 'wall' },
      // Fourneau nord, enclumes et rateliers d'armes
      { x: 375, y: 78, w: 170, h: 58, look: 'altar' },
      { x: 428, y: 245, w: 64, h: 38, look: 'anvil' },
      stall(110, 180, 110, 44, 0),
      stall(700, 180, 110, 44, 0),
      stall(110, 390, 110, 44, 2),
      stall(700, 390, 110, 44, 2)
    ],
    portals: [
      {
        id: 'forge_to_agora',
        x: 408,
        y: 610,
        w: 104,
        h: 48,
        toZone: 'agora',
        spawnX: 1767,
        spawnY: 1315,
        label: "Sortir : Cité de l'Agora"
      }
    ],
    npcs: [
      { npcId: 'damon', x: 325, y: 265 }
    ],
    interactables: [
      { id: 'etabli_forge', targetId: 'craft_forge', label: 'Forger des équipements', kind: 'workbench', x: 460, y: 318, radius: 56 }
    ],
    spawns: []
  },
  apothicairerie_interieur: {
    id: 'apothicairerie_interieur',
    name: 'Infirmerie de Cassandre',
    subtitle: 'Intérieur — Alchimie & Soins',
    realm: 'olympus',
    viewMode: 'top-down',
    recommendedLevel: 'Zone sûre',
    safeZone: true,
    width: 920,
    height: 660,
    cameraMargin: 24,
    defaultSpawn: { x: 460, y: 550 },
    solids: [
      { x: 0, y: 0, w: 920, h: 48, look: 'wall' },
      { x: 0, y: 0, w: 36, h: 660, look: 'wall' },
      { x: 884, y: 0, w: 36, h: 660, look: 'wall' },
      { x: 0, y: 624, w: 400, h: 36, look: 'wall' },
      { x: 520, y: 624, w: 400, h: 36, look: 'wall' },
      { x: 430, y: 225, w: 60, h: 60, look: 'fountain' },
      stall(115, 165, 120, 44, 1),
      stall(685, 165, 120, 44, 1),
      stall(115, 385, 120, 44, 1),
      stall(685, 385, 120, 44, 1)
    ],
    portals: [
      {
        id: 'apoth_to_agora',
        x: 408,
        y: 610,
        w: 104,
        h: 48,
        toZone: 'agora',
        spawnX: 540,
        spawnY: 1308,
        label: "Sortir : Cité de l'Agora"
      }
    ],
    npcs: [
      { npcId: 'cassandre', x: 340, y: 265 }
    ],
    interactables: [
      { id: 'etabli_alchimie', targetId: 'craft_alchimie', label: 'Brasser des potions (Alchimie)', kind: 'workbench', x: 460, y: 325, radius: 56 }
    ],
    spawns: []
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
