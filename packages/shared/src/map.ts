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

export interface GameMap {
  width: number;
  height: number;
  solids: Rect[]; // obstacles qui bloquent le joueur
  portals: Portal[];
}

// ou le joueur apparait en entrant dans le jeu (vue du dessus)
export const SPAWN_POINT = { x: 480, y: 500 };

export const MAPS: Record<ViewMode, GameMap> = {
  // vue du dessus : une place avec 4 piliers et une porte de chaque cote
  'top-down': {
    width: 960,
    height: 600,
    solids: [
      { x: 310, y: 180, w: 40, h: 40 },
      { x: 610, y: 180, w: 40, h: 40 },
      { x: 310, y: 380, w: 40, h: 40 },
      { x: 610, y: 380, w: 40, h: 40 }
    ],
    portals: [
      { x: 24, y: 260, w: 64, h: 80, to: 'side-view', spawnX: 200, spawnY: 456 },
      { x: 872, y: 260, w: 64, h: 80, to: 'side-view', spawnX: 760, spawnY: 456 }
    ]
  },

  // vue de profil : sol, 3 plateformes en escalier, un bloc, une porte de chaque cote
  // le sol est a y = 472 (456 = sol du serveur + 16 = demi-taille du joueur)
  'side-view': {
    width: 960,
    height: 540,
    solids: [
      { x: 0, y: 472, w: 960, h: 68 }, // sol
      { x: 120, y: 382, w: 160, h: 16 }, // plateforme 1
      { x: 340, y: 292, w: 160, h: 16 }, // plateforme 2
      { x: 560, y: 202, w: 160, h: 16 }, // plateforme 3
      { x: 600, y: 412, w: 50, h: 60 } // bloc a sauter
    ],
    portals: [
      { x: 24, y: 392, w: 64, h: 80, to: 'top-down', spawnX: 170, spawnY: 300 },
      { x: 872, y: 392, w: 64, h: 80, to: 'top-down', spawnX: 790, spawnY: 300 }
    ]
  }
};
