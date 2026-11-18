// le bord de l'ile entre la mer et le muret : sable, rochers, petits buissons (decor, hors de la zone jouable)
import { Graphics } from 'pixi.js';
import { COLORS, mix } from '../palette';
import { H, islandOutline, random, W, WALL } from './util';

const WET_SAND = 0xc9b07e;
const ROCK = 0xb9ae9a;
const ROCK_LIT = 0xe2d9c6;
const ROCK_DARK = 0x8a8273;
const SHRUB = 0x6f7f3c;
const SHRUB_DARK = 0x46552a;

// un rocher vu du dessus : forme irreguliere, face eclairee en haut a gauche
function rock(g: Graphics, x: number, y: number, size: number, rand: () => number): void {
  const pts: number[] = [];
  const lit: number[] = [];
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.4;
    const r = size * (0.75 + rand() * 0.35);
    pts.push(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.85);
    lit.push(x - size * 0.18 + Math.cos(a) * r * 0.62, y - size * 0.2 + Math.sin(a) * r * 0.5);
  }
  // ombre portee sur le sable ou l'eau
  g.poly(pts.map((v, i) => v + (i % 2 === 0 ? size * 0.5 : size * 0.3))).fill({ color: COLORS.shadow, alpha: 0.22 });
  g.poly(pts).fill({ color: ROCK_DARK });
  g.poly(pts.map((v, i) => v - (i % 2 === 0 ? 1.5 : 1.5))).fill({ color: ROCK });
  g.poly(lit).fill({ color: ROCK_LIT, alpha: 0.9 });
}

// petit buisson du maquis (lentisque) vu du dessus
function shrub(g: Graphics, x: number, y: number, size: number, rand: () => number): void {
  g.circle(x + size * 0.5, y + size * 0.35, size).fill({ color: COLORS.shadow, alpha: 0.18 });
  for (let i = 0; i < 5; i++) {
    const a = rand() * Math.PI * 2;
    g.circle(x + Math.cos(a) * size * 0.45, y + Math.sin(a) * size * 0.45, size * 0.6).fill({ color: SHRUB_DARK });
  }
  for (let i = 0; i < 4; i++) {
    const a = rand() * Math.PI * 2;
    g.circle(x - size * 0.2 + Math.cos(a) * size * 0.3, y - size * 0.2 + Math.sin(a) * size * 0.3, size * 0.42).fill({ color: SHRUB });
  }
  g.circle(x - size * 0.35, y - size * 0.35, size * 0.25).fill({ color: mix(SHRUB, COLORS.sun, 0.35) });
}

// est-ce que le point est dans le muret ou la place ? (pour ne rien poser dessus)
const onPlaza = (x: number, y: number, pad: number) => x > -WALL - pad && x < W + WALL + pad && y > -WALL - pad && y < H + WALL + pad;

export function drawShore(g: Graphics): void {
  // sable sec et sable mouille au bord de l'eau
  g.poly(islandOutline(0)).fill({ color: WET_SAND });
  g.poly(islandOutline(-7)).fill({ color: COLORS.sand });
  g.poly(islandOutline(-22)).fill({ color: mix(COLORS.sand, COLORS.marbleLit, 0.25) });

  // herbe seche et maquis colles au pied du muret
  const rand = random(3);
  g.rect(-WALL - 14, -WALL - 14, W + WALL * 2 + 28, H + WALL * 2 + 28).fill({ color: COLORS.grass, alpha: 0.35 });
  g.rect(-WALL - 7, -WALL - 7, W + WALL * 2 + 14, H + WALL * 2 + 14).fill({ color: COLORS.grass, alpha: 0.35 });

  // petits cailloux et traces dans le sable
  for (let i = 0; i < 260; i++) {
    const x = -WALL - 70 + rand() * (W + WALL * 2 + 140);
    const y = -WALL - 70 + rand() * (H + WALL * 2 + 140);
    if (onPlaza(x, y, 4)) continue;
    g.ellipse(x, y, 1 + rand() * 1.5, 0.8 + rand()).fill({ color: rand() < 0.5 ? ROCK_DARK : ROCK_LIT, alpha: 0.6 });
  }

  // rochers le long de l'eau (et quelques-uns dans l'eau), en groupes
  const outline = islandOutline(-4);
  const count = outline.length / 2;
  for (let i = 0; i < count; i += 1) {
    const x = outline[i * 2];
    const y = outline[i * 2 + 1];
    // pas de rochers devant les portes (petite plage)
    if (Math.abs(y - H / 2) < 90 && (x < 0 || x > W)) continue;
    const group = Math.sin(i * 0.21) + Math.sin(i * 0.53 + 1);
    if (group < 0.3 || rand() < 0.35) continue;
    rock(g, x + (rand() - 0.5) * 16, y + (rand() - 0.5) * 16, 5 + rand() * 9, rand);
  }

  // buissons entre le muret et la plage
  const inner = islandOutline(-24);
  for (let i = 0; i < inner.length / 2; i += 3) {
    const x = inner[i * 2];
    const y = inner[i * 2 + 1];
    if (onPlaza(x, y, 6) || (Math.abs(y - H / 2) < 70 && (x < 0 || x > W)) || rand() < 0.45) continue;
    shrub(g, x, y, 5 + rand() * 6, rand);
  }
}
