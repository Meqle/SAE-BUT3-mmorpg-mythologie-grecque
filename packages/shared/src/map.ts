// cartes du jeu : une par vue (tout en pixels, coin haut gauche = 0,0)
import type { ViewMode } from './types.js';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// zone qui change la vue quand on marche dedans, le joueur reapparait en (spawnX, spawnY)
export interface Portal extends Rect {
  to: ViewMode;
  spawnX: number;
  spawnY: number;
}

// obstacle qui bloque le joueur ; look = comment le dessiner (bloc de marbre par defaut)
export interface Solid extends Rect {
  look?: 'column' | 'olive';
}

export interface GameMap {
  width: number;
  height: number;
  solids: Solid[];
  portals: Portal[];
}

// ou le joueur apparait en entrant dans le jeu (vue du dessus)
export const SPAWN_POINT = { x: 480, y: 500 };

// colonne et olivier de 40 px centres en (cx, cy)
const pillar = (cx: number, cy: number): Solid => ({ x: cx - 20, y: cy - 20, w: 40, h: 40, look: 'column' });
const olive = (cx: number, cy: number): Solid => ({ x: cx - 20, y: cy - 20, w: 40, h: 40, look: 'olive' });

export const MAPS: Record<ViewMode, GameMap> = {
  // vue du dessus : une agora avec 8 colonnes autour de la mosaique centrale,
  // un olivier dans chaque coin et une porte (entre deux murets) au milieu des cotes
  'top-down': {
    width: 960,
    height: 600,
    solids: [
      pillar(665, 377), pillar(557, 485), pillar(403, 485), pillar(295, 377),
      pillar(295, 223), pillar(403, 115), pillar(557, 115), pillar(665, 223),
      olive(110, 100), olive(850, 100), olive(110, 500), olive(850, 500),
      { x: 0, y: 236, w: 72, h: 24 }, // murets de la porte gauche
      { x: 0, y: 340, w: 72, h: 24 },
      { x: 888, y: 236, w: 72, h: 24 }, // murets de la porte droite
      { x: 888, y: 340, w: 72, h: 24 }
    ],
    portals: [
      { x: 0, y: 260, w: 72, h: 80, to: 'side-view', spawnX: 200, spawnY: 456 },
      { x: 888, y: 260, w: 72, h: 80, to: 'side-view', spawnX: 1400, spawnY: 456 }
    ]
  },

  // vue de profil : un rivage plus large que l'ecran (la camera defile, le fond est en parallaxe)
  // gauche : 3 plateformes en escalier ; droite : ruines d'un temple ; une porte a chaque bout
  // le sol est a y = 472 (456 = sol du serveur + 16 = demi-taille du joueur)
  'side-view': {
    width: 1600,
    height: 540,
    solids: [
      { x: 0, y: 472, w: 1600, h: 68 }, // sol
      { x: 120, y: 382, w: 160, h: 16 }, // plateforme 1
      { x: 340, y: 292, w: 160, h: 16 }, // plateforme 2
      { x: 560, y: 202, w: 160, h: 16 }, // plateforme 3
      { x: 600, y: 412, w: 50, h: 60 }, // bloc a sauter
      { x: 860, y: 402, w: 60, h: 70 }, // reste de colonne
      { x: 960, y: 332, w: 180, h: 16 }, // ruines : plateforme basse
      { x: 1180, y: 262, w: 140, h: 16 }, // ruines : plateforme haute
      { x: 1240, y: 412, w: 80, h: 60 }, // bloc tombe
      { x: 1380, y: 352, w: 120, h: 16 } // plateforme pres de la porte
    ],
    portals: [
      { x: 28, y: 384, w: 56, h: 88, to: 'top-down', spawnX: 170, spawnY: 300 },
      { x: 1516, y: 384, w: 56, h: 88, to: 'top-down', spawnX: 790, spawnY: 300 }
    ]
  }
};
