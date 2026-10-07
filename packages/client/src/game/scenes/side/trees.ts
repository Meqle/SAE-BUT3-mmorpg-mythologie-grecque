// arbres et colonnes du decor (sans contour : ce n'est pas solide)
// haze = 0 -> couleurs franches, 1 -> fondu dans la brume
import { Graphics } from 'pixi.js';
import { COLORS, mix } from '../palette';
import { rnd } from './draw';

const FOG = 0xbfcbd6; // couleur de la brume pres du sol
const RUIN_FOG = 0xa9b7c7; // brume plus bleue pour les ruines (elles restent derriere)

// cypres : flamme sombre, face gauche eclairee
export function drawCypress(g: Graphics, x: number, base: number, h: number, haze: number): void {
  const w = h * 0.13;
  const dark = mix(COLORS.cypress, FOG, haze);
  const lit = mix(0x56703a, FOG, haze);
  g.moveTo(x, base - h)
    .bezierCurveTo(x + w * 1.1, base - h * 0.6, x + w * 1.2, base - h * 0.15, x + w * 0.4, base)
    .lineTo(x - w * 0.4, base)
    .bezierCurveTo(x - w * 1.2, base - h * 0.15, x - w * 1.1, base - h * 0.6, x, base - h)
    .fill({ color: dark });
  g.moveTo(x - w * 0.1, base - h * 0.92)
    .bezierCurveTo(x - w * 0.9, base - h * 0.55, x - w * 1.0, base - h * 0.2, x - w * 0.35, base - h * 0.04)
    .bezierCurveTo(x - w * 0.3, base - h * 0.4, x - w * 0.2, base - h * 0.7, x - w * 0.1, base - h * 0.92)
    .fill({ color: lit });
}

// olivier : tronc tordu et feuillage argente en boules
export function drawOlive(g: Graphics, x: number, base: number, s: number, haze: number, seed: number): void {
  const trunk = mix(0x6b5a45, FOG, haze);
  g.moveTo(x - 4 * s, base)
    .bezierCurveTo(x - 2 * s, base - 14 * s, x - 7 * s, base - 22 * s, x - 3 * s, base - 32 * s)
    .lineTo(x + 3 * s, base - 30 * s)
    .bezierCurveTo(x + 1 * s, base - 20 * s, x + 6 * s, base - 12 * s, x + 4 * s, base)
    .fill({ color: trunk });
  const dark = mix(COLORS.oliveDark, FOG, haze);
  const mid = mix(COLORS.olive, FOG, haze);
  const lit = mix(0xb4bd8a, FOG, haze);
  const puffs: [number, number, number][] = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI;
    puffs.push([Math.cos(a) * 20 * s, -36 * s - Math.sin(a) * 12 * s + rnd(seed + i) * 6 * s, (9 + rnd(seed + i * 3) * 5) * s]);
  }
  for (const [dx, dy, r] of puffs) g.circle(x + dx + 2 * s, base + dy + 2 * s, r).fill({ color: dark });
  for (const [dx, dy, r] of puffs) g.circle(x + dx, base + dy, r * 0.85).fill({ color: mid });
  for (const [dx, dy, r] of puffs) g.circle(x + dx - r * 0.3, base + dy - r * 0.3, r * 0.45).fill({ color: lit });
}

// colonne du decor (cannelee) ; broken = sommet casse, sinon chapiteau dorique
export function drawRuinColumn(g: Graphics, x: number, base: number, w: number, h: number, haze: number, broken: boolean, seed: number): void {
  const lit = mix(COLORS.marbleLit, RUIN_FOG, haze);
  const mid = mix(COLORS.marble, RUIN_FOG, haze);
  const shade = mix(COLORS.marbleShadow, RUIN_FOG, haze);
  const top = base - h;
  if (broken) {
    const pts = [x, base, x, top + rnd(seed) * 6];
    for (let i = 1; i < 5; i++) pts.push(x + (i / 5) * w, top + rnd(seed + i) * 14 - 4);
    pts.push(x + w, top + 8 + rnd(seed + 9) * 6, x + w, base);
    g.poly(pts).fill({ color: mid });
  } else {
    g.rect(x, top + 10, w, h - 10).fill({ color: mid });
    g.rect(x - w * 0.25, top, w * 1.5, 5).fill({ color: lit });
    g.moveTo(x - w * 0.12, top + 5).lineTo(x + w * 1.12, top + 5).lineTo(x + w, top + 10).lineTo(x, top + 10).fill({ color: mid });
    g.rect(x + w * 0.6, top, w * 0.65, 5).fill({ color: shade, alpha: 0.6 });
  }
  // face gauche eclairee, droite a l'ombre, cannelures
  g.rect(x, top + 12, w * 0.3, h - 12).fill({ color: lit, alpha: 0.8 });
  g.rect(x + w * 0.62, top + 12, w * 0.38, h - 12).fill({ color: shade, alpha: 0.85 });
  for (let i = 1; i < 4; i++) g.rect(x + (i / 4) * w - 0.5, top + 14, 1, h - 16).fill({ color: shade, alpha: 0.35 });
}
