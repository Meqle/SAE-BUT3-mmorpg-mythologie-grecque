// sol de l'agora : dalles de pierre variees, allee vers les portes, cercle de dalles autour de la mosaique
// tout est plat (on marche dessus) : pas de contour, pas de volume
import { Graphics } from 'pixi.js';
import { MAPS } from '@greek-myth/shared';
import { COLORS, mix } from '../palette';
import { H, random, W } from './util';

export const CX = W / 2;
export const CY = H / 2;
export const RING_IN = 158; // bord de la mosaique
export const RING_OUT = 236; // bord du cercle de dalles (les colonnes sont dessus, a r = 200)

const BORDER = 24; // bande de grandes dalles le long du muret
const ROW = 46;
const MOSS = 0x7f8f45;
const BLADE = 0x6b7d36;

// une dalle : couleur un peu variee, bord haut-gauche clair, bas-droite fonce
function slab(g: Graphics, x: number, y: number, w: number, h: number, color: number): void {
  g.rect(x + 1, y + 1, w - 2, h - 2).fill({ color });
  g.rect(x + 1, y + 1, w - 2, 1.5).fill({ color: COLORS.marbleLit, alpha: 0.45 });
  g.rect(x + 1, y + h - 2.5, w - 2, 1.5).fill({ color: COLORS.marbleShadow, alpha: 0.3 });
}

// teinte d'une dalle : pierre de base melangee a du marbre, du sable ou de l'ocre
function tint(rand: () => number, light: number): number {
  const others = [COLORS.marble, COLORS.sand, COLORS.marbleShade, 0xe3cfa6];
  const c = mix(COLORS.stone, others[Math.floor(rand() * others.length)], 0.2 + rand() * 0.35);
  return mix(c, COLORS.marbleLit, light);
}

// touffe d'herbe qui pousse entre deux dalles
function tuft(g: Graphics, x: number, y: number, rand: () => number): void {
  g.ellipse(x + 1, y + 1, 5, 3).fill({ color: MOSS, alpha: 0.35 });
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (rand() - 0.5) * 2.4;
    const len = 3 + rand() * 4;
    g.moveTo(x, y).quadraticCurveTo(x + Math.cos(a) * len * 0.5 - 1, y + Math.sin(a) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len);
  }
  g.stroke({ width: 1.2, color: BLADE, cap: 'round' });
}

// secteur d'anneau (dalle courbe du cercle)
function arcSlab(g: Graphics, r0: number, r1: number, a0: number, a1: number, color: number): void {
  const pts: number[] = [];
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push(CX + Math.cos(a) * r1, CY + Math.sin(a) * r1);
  }
  for (let i = n; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0);
  }
  g.poly(pts).fill({ color });
}

export function drawFloor(g: Graphics): void {
  const rand = random(11);
  g.rect(0, 0, W, H).fill({ color: COLORS.stoneJoint });

  // bande de grandes dalles claires le long du muret
  for (let x = 0; x < W; x += 80) {
    slab(g, x, 0, 80, BORDER, tint(rand, 0.35));
    slab(g, x, H - BORDER, 80, BORDER, tint(rand, 0.35));
  }
  for (let y = BORDER; y < H - BORDER; y += 69) {
    const h = Math.min(69, H - BORDER - y);
    slab(g, 0, y, BORDER, h, tint(rand, 0.35));
    slab(g, W - BORDER, y, BORDER, h, tint(rand, 0.35));
  }

  // dalles du milieu en rangees decalees ; l'allee entre les portes est plus claire
  const gate = MAPS['top-down'].portals[0];
  for (let y = BORDER; y < H - BORDER; y += ROW) {
    const path = y + ROW > gate.y - 10 && y < gate.y + gate.h + 10;
    let x = BORDER - rand() * 40;
    while (x < W - BORDER) {
      const w = path ? 92 : 46 + Math.floor(rand() * 3) * 23;
      const x0 = Math.max(BORDER, x);
      const x1 = Math.min(W - BORDER, x + w);
      slab(g, x0, y, x1 - x0, ROW, path ? tint(rand, 0.45) : tint(rand, 0.05));
      x += w;
    }
  }

  // le cercle de dalles autour de la mosaique (deux anneaux de pierres courbes)
  g.circle(CX, CY, RING_OUT).fill({ color: COLORS.stoneJoint });
  const mid = 197;
  for (const [r0, r1, n, light] of [[RING_IN, mid, 24, 0.5], [mid, RING_OUT, 32, 0.4]]) {
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2 + 0.006 * 60 / r0;
      const a1 = ((i + 1) / n) * Math.PI * 2 - 0.006 * 60 / r0;
      arcSlab(g, r0 + 1, r1 - 1, a0, a1, tint(rand, light));
    }
  }
  // fin filet de marbre clair au bord du cercle
  g.circle(CX, CY, RING_OUT).stroke({ width: 2, color: COLORS.marbleLit, alpha: 0.6 });

  // usure : taches et fissures discretes
  for (let i = 0; i < 40; i++) {
    const x = 30 + rand() * (W - 60);
    const y = 30 + rand() * (H - 60);
    g.ellipse(x, y, 10 + rand() * 30, 6 + rand() * 18).fill({ color: COLORS.marbleShadow, alpha: 0.05 });
  }
  for (let i = 0; i < 14; i++) {
    let x = 30 + rand() * (W - 60);
    let y = 30 + rand() * (H - 60);
    if (Math.hypot(x - CX, y - CY) < RING_OUT + 10) continue;
    g.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      x += (rand() - 0.3) * 14;
      y += (rand() - 0.5) * 12;
      g.lineTo(x, y);
    }
  }
  g.stroke({ width: 1, color: mix(COLORS.stoneJoint, COLORS.shadow, 0.3), alpha: 0.6 });

  // herbe et mousse entre les dalles pres des bords (plus il est loin du centre, plus il y en a)
  for (let i = 0; i < 170; i++) {
    const x = 6 + rand() * (W - 12);
    const y = 6 + rand() * (H - 12);
    const edge = Math.min(x, y, W - x, H - y);
    if (rand() * 90 < edge) continue;
    // on se cale sur un joint (horizontal le plus souvent)
    const jy = Math.round((y - BORDER) / ROW) * ROW + BORDER;
    tuft(g, x, Math.abs(jy - y) < 14 ? jy : y, rand);
  }

  // quelques fleurs sauvages (coquelicots et marguerites) dans les coins herbeux
  for (let i = 0; i < 60; i++) {
    const x = 8 + rand() * (W - 16);
    const y = 8 + rand() * (H - 16);
    if (Math.min(x, y, W - x, H - y) > 26 + rand() * 30) continue;
    const red = rand() < 0.45;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      g.circle(x + Math.cos(a) * 1.6, y + Math.sin(a) * 1.6, red ? 1.6 : 1.3);
    }
    g.fill({ color: red ? 0xc8432f : 0xfbf6ea });
    g.circle(x, y, 0.9).fill({ color: red ? 0x2a1d1a : 0xe9b83c });
  }
}
