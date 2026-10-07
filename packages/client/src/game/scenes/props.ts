// elements de decor communs aux deux vues
import { Graphics } from 'pixi.js';
import { Rect } from '@greek-myth/shared';
import { COLORS } from './palette';

const FRAME = 24; // epaisseur du muret de marbre autour de la carte

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

// muret de marbre autour de la carte, avec une frise bleue
export function drawFrame(g: Graphics, width: number, height: number): void {
  g.rect(-FRAME, -FRAME, width + FRAME * 2, height + FRAME * 2);
  g.fill({ color: COLORS.marble });
  g.stroke({ width: 2, color: COLORS.ink });
  drawMeander(g, 0, -FRAME + 4, width, 4, COLORS.ink);
  drawMeander(g, 0, height + 4, width, 4, COLORS.ink);
  drawMeander(g, -FRAME + 4, 0, height, 4, COLORS.ink, true);
  drawMeander(g, width + 4, 0, height, 4, COLORS.ink, true);
}

// bloc de marbre solide : ombre en bas et contour bleu nuit (sol, plateformes, murets)
export function drawSlab(g: Graphics, r: Rect): void {
  g.rect(r.x, r.y, r.w, r.h);
  g.fill({ color: COLORS.marble });
  g.rect(r.x, r.y + r.h - Math.min(5, r.h / 3), r.w, Math.min(5, r.h / 3));
  g.fill({ color: COLORS.marbleShade });
  g.rect(r.x, r.y, r.w, r.h);
  g.stroke({ width: 2, color: COLORS.ink });
}

// ombre portee au sol (vue de dessus), toujours vers le bas a droite
export function drawShadow(g: Graphics, cx: number, cy: number, radius: number): void {
  g.ellipse(cx + 6, cy + 8, radius, radius * 0.8);
  g.fill({ color: COLORS.shadow, alpha: 0.18 });
}

// colonne ionique vue de dessus : socle carre et fut rond cannele
export function drawColumnTop(g: Graphics, r: Rect): void {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  drawShadow(g, cx, cy, r.w * 0.6);
  drawSlab(g, r);
  g.circle(cx, cy, r.w * 0.36);
  g.fill({ color: COLORS.marble });
  g.stroke({ width: 2, color: COLORS.ink });
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    g.circle(cx + Math.cos(a) * r.w * 0.28, cy + Math.sin(a) * r.w * 0.28, 1.5);
  }
  g.fill({ color: COLORS.marbleShade });
}

// olivier vu de dessus : feuillage en plusieurs boules
export function drawOliveTop(g: Graphics, r: Rect): void {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  drawShadow(g, cx, cy, r.w * 0.7);
  const blobs = [[0, 0, 15], [-11, -7, 11], [10, -9, 11], [11, 8, 11], [-10, 9, 11]];
  for (const [dx, dy, rad] of blobs) g.circle(cx + dx, cy + dy, rad);
  g.fill({ color: COLORS.oliveDark });
  g.stroke({ width: 2, color: COLORS.ink });
  for (const [dx, dy, rad] of blobs) g.circle(cx + dx - 2, cy + dy - 2, rad * 0.6);
  g.fill({ color: COLORS.olive });
}

// couronne de laurier : deux branches de feuilles autour d'un cercle
export function drawLaurel(g: Graphics, cx: number, cy: number, radius: number, color: number): void {
  for (const side of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      const a = Math.PI / 2 + side * (0.3 + i * 0.19); // part du bas, monte de chaque cote
      const r = radius + (i % 2 === 0 ? 3 : -3); // une feuille dehors, une dedans
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      const t = a + Math.PI / 2; // la feuille suit le cercle
      const len = Math.max(4, radius * 0.13);
      const wid = len * 0.4;
      g.poly([
        x - Math.cos(t) * len, y - Math.sin(t) * len,
        x - Math.sin(t) * wid, y + Math.cos(t) * wid,
        x + Math.cos(t) * len, y + Math.sin(t) * len,
        x + Math.sin(t) * wid, y - Math.cos(t) * wid
      ]);
    }
  }
  g.fill({ color });
}
