// elements de decor communs aux deux vues
import { Graphics } from 'pixi.js';
import { Rect } from '@greek-myth/shared';
import { COLORS } from './palette';

const FRAME = 24; // epaisseur du cadre noir autour de la carte

// frise grecque (meandre) le long d'une bande, u = taille d'un trait
export function drawMeander(g: Graphics, x: number, y: number, length: number, u: number, color: number, vertical = false): void {
  // (a, b) = (le long de la bande, en travers) -> coordonnees reelles
  const at = (a: number, b: number): [number, number] => (vertical ? [x + b, y + a] : [x + a, y + b]);
  g.moveTo(...at(0, 4 * u));
  g.lineTo(...at(length, 4 * u));
  for (let a = 0; a + 4 * u <= length; a += 4 * u) {
    g.moveTo(...at(a, 4 * u));
    for (const [da, db] of [[0, 0], [3, 0], [3, 3], [1, 3], [1, 1], [2, 1], [2, 2]]) {
      g.lineTo(...at(a + da * u, db * u));
    }
  }
  g.stroke({ width: u * 0.7, color });
}

// cadre noir (comme le vernis du vase) avec une frise creme, a l'exterieur de la carte
export function drawFrame(g: Graphics, width: number, height: number): void {
  g.rect(-FRAME, -FRAME, width + FRAME * 2, height + FRAME * 2);
  g.fill({ color: COLORS.glaze });
  drawMeander(g, 0, -FRAME + 4, width, 4, COLORS.cream);
  drawMeander(g, 0, height + 4, width, 4, COLORS.cream);
  drawMeander(g, -FRAME + 4, 0, height, 4, COLORS.cream, true);
  drawMeander(g, width + 4, 0, height, 4, COLORS.cream, true);
}

// objet solide : noir avec un contour creme (sol, plateformes, tours)
export function drawSlab(g: Graphics, r: Rect): void {
  g.rect(r.x, r.y, r.w, r.h);
  g.fill({ color: COLORS.glaze });
  g.stroke({ width: 2, color: COLORS.cream });
}

// colonne vue de dessus : abaque carre noir et le haut du fut en anneaux
export function drawColumnTop(g: Graphics, r: Rect): void {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  g.ellipse(cx + 5, cy + 6, r.w * 0.6, r.h * 0.5); // ombre
  g.fill({ color: COLORS.shadow, alpha: 0.25 });
  drawSlab(g, r);
  g.circle(cx, cy, r.w * 0.34);
  g.stroke({ width: 2, color: COLORS.cream });
  g.circle(cx, cy, r.w * 0.16);
  g.stroke({ width: 2, color: COLORS.cream });
}
