// elements de decor communs aux deux vues
import { Graphics } from 'pixi.js';
import { Portal, Rect } from '@greek-myth/shared';
import { COLORS } from './palette';

const FRAME = 24; // epaisseur du cadre de pierre autour de la carte

// cadre de pierre avec une frise doree, dessine a l'exterieur de la carte
export function drawFrame(g: Graphics, width: number, height: number): void {
  g.rect(-FRAME, -FRAME, width + FRAME * 2, FRAME);
  g.rect(-FRAME, height, width + FRAME * 2, FRAME);
  g.rect(-FRAME, 0, FRAME, height);
  g.rect(width, 0, FRAME, height);
  g.fill({ color: COLORS.stone });

  // petits carres dores sur les bandes du haut et du bas
  for (let x = 0; x < width; x += 24) {
    g.rect(x + 6, -FRAME + 7, 10, 10);
    g.rect(x + 6, height + 7, 10, 10);
  }
  g.fill({ color: COLORS.gold });

  g.rect(0, 0, width, height);
  g.stroke({ width: 3, color: COLORS.gold });
}

// bloc de pierre avec un liseré dore sur le dessus (sol, plateformes, piliers)
export function drawSlab(g: Graphics, r: Rect): void {
  g.rect(r.x, r.y, r.w, r.h);
  g.fill({ color: COLORS.stone });
  g.stroke({ width: 2, color: COLORS.stoneDark });
  g.rect(r.x, r.y, r.w, Math.min(4, r.h));
  g.fill({ color: COLORS.gold });
}

// porte de temple : deux montants, un linteau dore et une lueur au milieu
export function drawGate(g: Graphics, p: Portal): void {
  g.rect(p.x, p.y, p.w, p.h);
  g.fill({ color: COLORS.turquoise, alpha: 0.25 });

  for (const x of [p.x - 6, p.x + p.w - 8]) {
    g.rect(x, p.y - 12, 14, p.h + 12);
    g.fill({ color: COLORS.stone });
    g.stroke({ width: 2, color: COLORS.stoneDark });
  }

  g.rect(p.x - 10, p.y - 18, p.w + 20, 12);
  g.fill({ color: COLORS.gold });
  g.stroke({ width: 2, color: COLORS.stoneDark });
}
