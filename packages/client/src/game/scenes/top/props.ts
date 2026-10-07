// objets solides vus du dessus : colonnes ioniques, oliviers, murets des portes
// contour bleu nuit exactement sur le rectangle de collision ; ombres longues vers le bas a droite
import { Graphics } from 'pixi.js';
import type { Solid } from '@greek-myth/shared';
import { COLORS, mix } from '../palette';
import { castShadow, random, SHADOW_DX, SHADOW_DY } from './util';

const SILVER = 0xb7c08f; // reflets argentes des feuilles d'olivier
const OLIVE_MID = 0x6f7f40;
const GILD = 0xd9a93f;

// colonne ionique vue d'en haut : socle carre, tore, chapiteau a volutes
export function drawColumn(g: Graphics, shadows: Graphics, s: Solid): void {
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  // ombre longue du fut puis du chapiteau
  const len = 120;
  const ex = cx + SHADOW_DX * len;
  const ey = cy + SHADOW_DY * len;
  const nx = -SHADOW_DY * 14;
  const ny = SHADOW_DX * 14;
  shadows.rect(s.x, s.y, s.w, s.h);
  shadows.poly([cx + nx, cy + ny, ex + nx, ey + ny, ex - nx, ey - ny, cx - nx, cy - ny]);
  shadows.circle(cx, cy, 14);
  shadows.ellipse(ex, ey, 22, 13);
  shadows.fill({ color: 0x000000 });

  // socle carre (plinthe) avec biseaux
  g.rect(s.x, s.y, s.w, s.h).fill({ color: COLORS.marbleShade });
  g.poly([s.x, s.y, s.x + s.w, s.y, s.x + s.w - 4, s.y + 4, s.x + 4, s.y + 4]).fill({ color: COLORS.marbleLit });
  g.poly([s.x, s.y, s.x + 4, s.y + 4, s.x + 4, s.y + s.h - 4, s.x, s.y + s.h]).fill({ color: COLORS.marble });
  g.poly([s.x + s.w, s.y + s.h, s.x, s.y + s.h, s.x + 4, s.y + s.h - 4, s.x + s.w - 4, s.y + s.h - 4]).fill({ color: COLORS.marbleShadow });
  // volutes ioniques : deux rouleaux qui depassent a gauche et a droite du chapiteau
  for (const side of [-1, 1]) {
    const vx = cx + side * 14;
    g.ellipse(vx + 1, cy + 1, 5.5, 11).fill({ color: COLORS.marbleShadow });
    g.ellipse(vx, cy, 5.5, 11).fill({ color: COLORS.marble });
    g.ellipse(vx - 1.5, cy - 1, 2.5, 8.5).fill({ color: COLORS.marbleLit });
    g.rect(vx - 5, cy - 1, 10, 2).fill({ color: COLORS.marbleShade });
  }
  // chapiteau rond (echine) avec ses oves tout autour
  g.circle(cx + 1.5, cy + 1.5, 14).fill({ color: COLORS.marbleShadow });
  g.circle(cx, cy, 14).fill({ color: COLORS.marbleShade });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const lit = Math.cos(a + 0.8) < 0; // oves en haut a gauche plus clairs
    g.ellipse(cx + Math.cos(a) * 11.5, cy + Math.sin(a) * 11.5, 2, 2).fill({ color: lit ? COLORS.marbleLit : COLORS.marble });
  }
  // dessus du chapiteau : disque clair, eclaire en haut a gauche
  g.circle(cx, cy, 9).fill({ color: COLORS.marble });
  g.circle(cx - 1.5, cy - 1.5, 6.5).fill({ color: COLORS.marbleLit });
  g.circle(cx + 0.5, cy + 0.5, 2).fill({ color: COLORS.marbleShade });

  g.rect(s.x, s.y, s.w, s.h).stroke({ width: 2, color: COLORS.ink });
}

// olivier vu d'en haut : touffes de feuillage vert argente, lumiere en haut a gauche
export function drawOlive(g: Graphics, shadows: Graphics, s: Solid, seed: number): void {
  const rand = random(seed);
  const cx = s.x + s.w / 2 - 1;
  const cy = s.y + s.h / 2 - 3;
  // touffes autour du centre
  const blobs: [number, number, number][] = [[cx, cy, 16]];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rand() * 0.5;
    const d = 14 + rand() * 4;
    blobs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d, 10.5 + rand() * 4]);
  }
  for (const [x, y, r] of blobs) shadows.circle(x + SHADOW_DX * 34, y + SHADOW_DY * 34, r);
  shadows.circle(cx + SHADOW_DX * 12, cy + SHADOW_DY * 12, 10);
  shadows.fill({ color: 0x000000 });

  // quelques feuilles tombees au pied de l'arbre (plates, sous le feuillage)
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const d = 30 + rand() * 22;
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d;
    g.ellipse(x, y, 2.6, 1).fill({ color: rand() < 0.5 ? SILVER : 0xc9b46a, alpha: 0.8 });
  }

  // contour fin (le feuillage cache le tronc, c'est lui qui bloque)
  for (const [x, y, r] of blobs) g.circle(x, y, r + 1.6);
  g.fill({ color: COLORS.ink });
  for (const [x, y, r] of blobs) g.circle(x, y, r);
  g.fill({ color: COLORS.oliveDark });
  for (const [x, y, r] of blobs) g.circle(x - 1.5, y - 2, r * 0.82);
  g.fill({ color: OLIVE_MID });
  for (const [x, y, r] of blobs) g.circle(x - 3.5, y - 4, r * 0.48);
  g.fill({ color: mix(OLIVE_MID, SILVER, 0.55) });

  // petites feuilles allongees : argentees sur le dessus, sombres dans les creux
  for (let i = 0; i < 120; i++) {
    const [bx, by, br] = blobs[Math.floor(rand() * blobs.length)];
    const a = rand() * Math.PI * 2;
    const d = rand() * br * 0.9;
    const x = bx + Math.cos(a) * d;
    const y = by + Math.sin(a) * d;
    const lit = Math.cos(a) * -0.7 + Math.sin(a) * -0.7 + rand() * 0.8;
    const rot = rand() * Math.PI;
    const lx = Math.cos(rot) * 3;
    const ly = Math.sin(rot) * 3;
    g.poly([x - lx, y - ly, x - ly * 0.3, y + lx * 0.3, x + lx, y + ly, x + ly * 0.3, y - lx * 0.3]);
    g.fill({ color: lit > 0.4 ? SILVER : lit > -0.2 ? COLORS.olive : COLORS.oliveDark, alpha: 0.9 });
  }
  // quelques olives noires
  for (let i = 0; i < 6; i++) {
    const [bx, by, br] = blobs[1 + Math.floor(rand() * (blobs.length - 1))];
    g.circle(bx + (rand() - 0.5) * br, by + (rand() - 0.5) * br, 1.4).fill({ color: 0x3b2a3a });
  }
}

// muret de marbre a cote d'une porte, avec un pilier et une boule doree cote passage
export function drawLowWall(g: Graphics, shadows: Graphics, s: Solid, gateSide: number): void {
  castShadow(shadows, s.x, s.y, s.w, s.h, 18);
  g.rect(s.x, s.y, s.w, s.h).fill({ color: COLORS.marbleShadow });
  g.rect(s.x, s.y, s.w, s.h - 5).fill({ color: COLORS.marble });
  g.rect(s.x, s.y, s.w, 2.5).fill({ color: COLORS.marbleLit });
  // joints des blocs
  for (let x = s.x + 24; x < s.x + s.w; x += 24) g.rect(x, s.y + 2, 1, s.h - 7).fill({ color: COLORS.marbleShade });
  // pilier au bout, cote passage
  const px = gateSide > 0 ? s.x + s.w - 22 : s.x;
  g.rect(px - 1, s.y, 24, s.h).fill({ color: COLORS.marbleShade });
  g.rect(px + 1, s.y, 20, s.h - 6).fill({ color: COLORS.marbleLit });
  g.rect(px + 3, s.y + 2, 16, s.h - 10).fill({ color: COLORS.marble });
  const bx = px + 11;
  const by = s.y + s.h / 2 - 3;
  g.circle(bx + 2, by + 2, 6.5).fill({ color: COLORS.shadow, alpha: 0.3 });
  g.circle(bx, by, 6).fill({ color: 0xa8762a });
  g.circle(bx - 0.8, by - 0.8, 4.6).fill({ color: GILD });
  g.circle(bx - 2, by - 2, 1.8).fill({ color: 0xfff1c9 });
  g.rect(s.x, s.y, s.w, s.h).stroke({ width: 2, color: COLORS.ink });
}
