// balustrade de marbre qui entoure la place, juste en dehors de la carte (le joueur bute contre elle)
// vue du dessus : socle large, main courante plus haute, piliers ; ombres vers le bas a droite
import { Graphics } from 'pixi.js';
import { MAPS } from '@greek-myth/shared';
import { COLORS } from '../palette';
import { H, W, WALL } from './util';

const URN = 0xa9553c;
const URN_DARK = 0x6e3326;
const LAUREL = 0x5d6e34;

const gate = MAPS['top-down'].portals[0]; // les deux portes sont a la meme hauteur
const GAP_TOP = gate.y;
const GAP_BOTTOM = gate.y + gate.h;

// morceaux du muret (x, y, w, h) : haut, bas, et cotes coupes par les portes
const PIECES: [number, number, number, number][] = [
  [-WALL, -WALL, W + WALL * 2, WALL],
  [-WALL, H, W + WALL * 2, WALL],
  [-WALL, 0, WALL, GAP_TOP],
  [-WALL, GAP_BOTTOM, WALL, H - GAP_BOTTOM],
  [W, 0, WALL, GAP_TOP],
  [W, GAP_BOTTOM, WALL, H - GAP_BOTTOM]
];

// socle + main courante d'un morceau ; ombres des balustres en bandes sur le socle
function railPiece(g: Graphics, shadows: Graphics, x: number, y: number, w: number, h: number): void {
  const flat = w > h;
  g.rect(x, y, w, h).fill({ color: COLORS.marbleShade });
  // bord eclaire du socle (haut et gauche)
  g.rect(x, y, w, 2).fill({ color: COLORS.marble });
  g.rect(x, y, 2, h).fill({ color: COLORS.marble });
  // face sud visible du socle (a l'ombre)
  if (flat) g.rect(x, y + h - 4, w, 4).fill({ color: COLORS.marbleShadow });

  // main courante au milieu du socle
  const t = 13;
  const rx = flat ? x : x + (w - t) / 2;
  const ry = flat ? y + (h - t) / 2 - 2 : y;
  const rw = flat ? w : t;
  const rh = flat ? t : h;
  // ombre des balustres : bandes sous la main courante, decalees vers le bas a droite
  for (let d = 4; d < (flat ? w : h); d += 10) {
    if (flat) g.poly([x + d, ry + rh, x + d + 5, ry + rh, x + d + 11, ry + rh + 8, x + d + 6, ry + rh + 8]);
    else g.poly([rx + rw, y + d, rx + rw, y + d + 5, rx + rw + 9, y + d + 10, rx + rw + 9, y + d + 5]);
  }
  g.fill({ color: COLORS.shadow, alpha: 0.13 });
  // ombre de la main courante sur le sol de la place ou le sable (filtre commun des ombres)
  shadows.rect(rx + 6, ry + 5, rw, rh).fill({ color: 0x000000 });
  g.rect(rx, ry, rw, rh).fill({ color: COLORS.marble });
  g.rect(rx, ry, rw, 3).fill({ color: COLORS.marbleLit });
  g.rect(rx, ry, 3, rh).fill({ color: COLORS.marbleLit });
  if (flat) g.rect(rx, ry + rh - 3, rw, 3).fill({ color: COLORS.marbleShade });
  else g.rect(rx + rw - 3, ry, 3, rh).fill({ color: COLORS.marbleShade });
}

// pilier carre vu du dessus, avec une boule de marbre (ou une urne aux coins)
function post(g: Graphics, shadows: Graphics, cx: number, cy: number, s: number, urn: boolean): void {
  const x = cx - s / 2;
  const y = cy - s / 2;
  shadows.poly([x + s, y, x + s + 22, y + 13, x + s + 22, y + s + 13, x + 22, y + s + 13, x, y + s]).fill({ color: 0x000000 });
  g.rect(x, y, s, s).fill({ color: COLORS.marbleShadow });
  g.rect(x, y, s, s - 4).fill({ color: COLORS.marbleShade });
  g.rect(x + 3, y + 3, s - 6, s - 9).fill({ color: COLORS.marble });
  g.rect(x + 3, y + 3, s - 6, 2).fill({ color: COLORS.marbleLit });
  g.rect(x + 3, y + 3, 2, s - 9).fill({ color: COLORS.marbleLit });
  g.rect(x, y, s, s).stroke({ width: 1.5, color: COLORS.ink, alpha: 0.85 });
  if (urn) {
    // urne en terre cuite avec un petit laurier dedans
    const r = s * 0.36;
    g.circle(cx + 3, cy + 2, r).fill({ color: COLORS.shadow, alpha: 0.3 });
    g.circle(cx, cy - 2, r).fill({ color: URN_DARK });
    g.circle(cx - 0.6, cy - 2.6, r - 1.5).fill({ color: URN });
    g.circle(cx, cy - 2, r - 4).fill({ color: URN_DARK });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      g.circle(cx + Math.cos(a) * 4, cy - 2 + Math.sin(a) * 4, 4).fill({ color: LAUREL });
    }
    g.circle(cx - 2, cy - 4.5, 3.5).fill({ color: 0x8a9a52 });
  } else {
    const r = s * 0.26;
    g.circle(cx + 2, cy + 1, r).fill({ color: COLORS.shadow, alpha: 0.25 });
    g.circle(cx, cy - 1, r).fill({ color: COLORS.marbleShade });
    g.circle(cx - 1, cy - 2, r * 0.7).fill({ color: COLORS.marble });
    g.circle(cx - 1.6, cy - 2.6, r * 0.32).fill({ color: COLORS.marbleLit });
  }
}

// marches qui descendent vers la plage dans l'ouverture du muret
function steps(g: Graphics, x0: number, dir: number): void {
  for (let i = 0; i < 4; i++) {
    const x = dir > 0 ? x0 + i * 9 : x0 - (i + 1) * 9;
    const tone = [COLORS.marble, COLORS.marbleShade, 0xd2c4a6, 0xc9b994][i];
    g.rect(x, GAP_TOP, 9, GAP_BOTTOM - GAP_TOP).fill({ color: tone });
    // nez de marche : eclaire cote soleil (a gauche), a l'ombre a droite
    const edge = dir > 0 ? x + 7 : x;
    g.rect(edge, GAP_TOP, 2, GAP_BOTTOM - GAP_TOP).fill({ color: dir > 0 ? COLORS.marbleShadow : COLORS.marbleLit });
  }
}

export function drawWall(g: Graphics, shadows: Graphics): void {
  steps(g, 0, -1);
  steps(g, W, 1);
  for (const [x, y, w, h] of PIECES) railPiece(g, shadows, x, y, w, h);
  // contour bleu nuit : le muret est solide (bord de la carte)
  for (const [x, y, w, h] of PIECES) g.rect(x, y, w, h);
  g.stroke({ width: 2, color: COLORS.ink });

  // piliers le long du muret, de chaque cote des portes, et urnes aux coins
  const half = -WALL / 2;
  for (const x of [160, 320, 640, 800]) {
    post(g, shadows, x, half, 24, false);
    post(g, shadows, x, H - half, 24, false);
  }
  for (const y of [120, 480, GAP_TOP - 12, GAP_BOTTOM + 12]) {
    post(g, shadows, half, y, 24, false);
    post(g, shadows, W - half, y, 24, false);
  }
  for (const [x, y] of [[half, half], [W - half, half], [half, H - half], [W - half, H - half]]) post(g, shadows, x, y, 42, true);
}
