// elements de decor communs aux deux vues
import { Graphics } from 'pixi.js';
import { Rect } from '@greek-myth/shared';
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

// bloc de pierre avec un filet dore sur le dessus (sol, plateformes, piliers)
export function drawSlab(g: Graphics, r: Rect): void {
  g.rect(r.x, r.y, r.w, r.h);
  g.fill({ color: COLORS.stone });
  g.stroke({ width: 2, color: COLORS.stoneDark });
  g.rect(r.x, r.y, r.w, Math.min(4, r.h));
  g.fill({ color: COLORS.gold });
}

// colonne vue de dessus : dalle carree (abaque) avec le fut rond au milieu
export function drawColumnTop(g: Graphics, r: Rect): void {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  g.rect(r.x + 4, r.y + 5, r.w, r.h); // ombre
  g.fill({ color: COLORS.shadow, alpha: 0.3 });
  g.rect(r.x, r.y, r.w, r.h);
  g.fill({ color: COLORS.marble });
  g.stroke({ width: 2, color: COLORS.stoneDark });
  g.circle(cx, cy, r.w * 0.36);
  g.fill({ color: COLORS.marbleLight });
  g.stroke({ width: 2, color: COLORS.stoneDark });
  g.circle(cx, cy, 4);
  g.fill({ color: COLORS.gold });
}
