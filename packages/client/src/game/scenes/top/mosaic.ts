// grande mosaique plate au centre de l'agora : frise grecque, couronne de laurier, chouette d'Athena
// on marche dessus : pas de contour, pas de volume, juste des tesselles
import { Graphics } from 'pixi.js';
import { COLORS, mix } from '../palette';
import { CX, CY, RING_IN } from './floor';
import { random } from './util';

const CREAM = 0xf1e3c2;
const TERRACOTTA = 0xc0623f; // fond facon vase grec
const DARK = 0x3a2a22; // figures noires
const BLUE = 0x2c5f86;
const OCHRE = 0xd9a441;

// frise grecque qui fait le tour d'un cercle (meme dessin que drawMeander mais en rond)
function circularMeander(g: Graphics, r: number, u: number, color: number): void {
  const count = Math.round((Math.PI * 2 * r) / (4 * u));
  const step = (Math.PI * 2) / count; // angle d'un motif
  const at = (a: number, b: number): [number, number] => {
    const angle = (a / 4) * step;
    return [CX + Math.cos(angle) * (r - b * u), CY + Math.sin(angle) * (r - b * u)];
  };
  for (let i = 0; i < count; i++) {
    const a = i * 4;
    g.moveTo(...at(a, 4));
    for (const [da, db] of [[0, 0], [3, 0], [3, 3], [1, 3], [1, 1], [2, 1], [2, 2]]) g.lineTo(...at(a + da, db));
  }
  // ligne de base qui relie les motifs
  for (let i = 0; i <= count * 4; i++) {
    if (i === 0) g.moveTo(...at(0, 4));
    else g.lineTo(...at(i, 4));
  }
  g.stroke({ width: u * 0.8, color, join: 'miter' });
}

// couronne de laurier : deux branches qui partent du bas et se rejoignent en haut
function wreath(g: Graphics, r: number): void {
  const stem = mix(OCHRE, DARK, 0.35);
  for (const side of [-1, 1]) {
    // tige
    for (let i = 0; i <= 40; i++) {
      const a = Math.PI / 2 + side * (0.18 + (i / 40) * 2.8);
      const x = CX + Math.cos(a) * r;
      const y = CY + Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke({ width: 1.6, color: stem });
    // paires de feuilles pointues orientees vers le haut de la branche
    for (let i = 0; i < 17; i++) {
      const a = Math.PI / 2 + side * (0.25 + i * 0.165);
      const x = CX + Math.cos(a) * r;
      const y = CY + Math.sin(a) * r;
      const along = a + side * Math.PI / 2; // direction de la tige
      for (const out of [-1, 1]) {
        const dir = along + out * 0.55 * side;
        const len = 11;
        const tx = x + Math.cos(dir) * len;
        const ty = y + Math.sin(dir) * len;
        const mx = (x + tx) / 2;
        const my = (y + ty) / 2;
        const px = -Math.sin(dir) * 3.2;
        const py = Math.cos(dir) * 3.2;
        g.poly([x, y, mx + px, my + py, tx, ty, mx - px, my - py]).fill({ color: out > 0 ? OCHRE : mix(OCHRE, CREAM, 0.3) });
      }
    }
  }
  // ruban en bas
  g.circle(CX, CY + r, 3.5).fill({ color: TERRACOTTA });
}

// chouette d'Athena stylisee, en figure noire sur fond terre cuite
function owl(g: Graphics, x: number, y: number): void {
  // corps et tete
  g.ellipse(x, y + 10, 22, 28).fill({ color: DARK });
  g.ellipse(x, y - 16, 21, 16).fill({ color: DARK });
  g.poly([x - 20, y - 22, x - 17, y - 38, x - 8, y - 28]).fill({ color: DARK });
  g.poly([x + 20, y - 22, x + 17, y - 38, x + 8, y - 28]).fill({ color: DARK });
  // grands yeux
  for (const side of [-1, 1]) {
    g.circle(x + side * 9, y - 17, 8.5).fill({ color: CREAM });
    g.circle(x + side * 9, y - 17, 6).fill({ color: OCHRE });
    g.circle(x + side * 9, y - 17, 3.4).fill({ color: DARK });
    g.circle(x + side * 9 - 1.2, y - 18.5, 1.1).fill({ color: CREAM });
  }
  g.poly([x - 3, y - 10, x + 3, y - 10, x, y - 4]).fill({ color: OCHRE });
  // plumes de la poitrine (petits arcs) et ailes repliees
  for (let row = 0; row < 4; row++) {
    for (let k = -2; k <= 2; k++) {
      if (Math.abs(k) + row > 4) continue;
      const fx = x + k * 6 + (row % 2) * 3 - 1.5;
      const fy = y + 2 + row * 7;
      g.moveTo(fx - 2.5, fy).quadraticCurveTo(fx, fy + 3.5, fx + 2.5, fy);
    }
  }
  g.stroke({ width: 1.3, color: CREAM, alpha: 0.85 });
  for (const side of [-1, 1]) {
    g.moveTo(x + side * 15, y - 2).quadraticCurveTo(x + side * 21, y + 14, x + side * 13, y + 34);
    g.moveTo(x + side * 11, y + 4).quadraticCurveTo(x + side * 16, y + 18, x + side * 10, y + 32);
  }
  g.stroke({ width: 1.2, color: TERRACOTTA });
  // branche d'olivier sous les pattes
  g.moveTo(x - 34, y + 40).quadraticCurveTo(x, y + 34, x + 34, y + 42).stroke({ width: 2, color: DARK });
  for (let i = 0; i < 6; i++) {
    const lx = x - 28 + i * 11;
    const side = i % 2 === 0 ? -1 : 1;
    g.ellipse(lx, y + 38 + side * 4, 4.5, 1.8).fill({ color: DARK });
  }
  g.circle(x - 6, y + 44, 2).fill({ color: DARK });
  g.circle(x + 14, y + 45, 2).fill({ color: DARK });
  g.rect(x - 6, y + 34, 3, 5).fill({ color: OCHRE });
  g.rect(x + 3, y + 34, 3, 5).fill({ color: OCHRE });
}

// lettres A Θ E (comme sur les pieces d'Athenes) en traits de tesselles
function letters(g: Graphics, x: number, y: number): void {
  g.moveTo(x - 4, y + 7).lineTo(x, y - 7).lineTo(x + 4, y + 7);
  g.moveTo(x - 2, y + 2).lineTo(x + 2, y + 2);
  g.ellipse(x, y + 20, 4.5, 7);
  g.moveTo(x - 2, y + 20).lineTo(x + 2, y + 20);
  g.moveTo(x + 4, y + 33).lineTo(x - 4, y + 33).lineTo(x - 4, y + 47).lineTo(x + 4, y + 47);
  g.moveTo(x - 4, y + 40).lineTo(x + 2, y + 40);
  g.stroke({ width: 2, color: DARK });
}

export function drawMosaic(g: Graphics): void {
  const r = RING_IN - 2;
  // anneaux de couleur, de l'exterieur vers le centre
  const rings: [number, number][] = [
    [r, mix(TERRACOTTA, DARK, 0.3)],
    [r - 4, CREAM],
    [r - 27, TERRACOTTA],
    [r - 31, CREAM],
    [r - 35, BLUE],
    [r - 70, CREAM],
    [r - 74, TERRACOTTA]
  ];
  for (const [radius, color] of rings) g.circle(CX, CY, radius).fill({ color });
  circularMeander(g, r - 7, 4, DARK);
  wreath(g, r - 52);
  // petites baies dorees dans la couronne
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    g.circle(CX + Math.cos(a) * (r - 52), CY + Math.sin(a) * (r - 52), 1.6).fill({ color: CREAM, alpha: 0.7 });
  }
  owl(g, CX - 6, CY - 4);
  letters(g, CX + 40, CY - 28);

  // tesselles : quadrillage fin qui suit le cercle
  const t = 4;
  for (let d = -r + t; d < r; d += t) {
    const half = Math.sqrt(r * r - d * d);
    g.moveTo(CX - half, CY + d).lineTo(CX + half, CY + d);
    g.moveTo(CX + d, CY - half).lineTo(CX + d, CY + half);
  }
  g.stroke({ width: 0.6, color: DARK, alpha: 0.12 });

  // usure : quelques tesselles plus claires ou manquantes
  const rand = random(5);
  for (let i = 0; i < 260; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * (r - 3);
    const x = Math.round((CX + Math.cos(a) * d) / t) * t;
    const y = Math.round((CY + Math.sin(a) * d) / t) * t;
    g.rect(x, y, t - 0.6, t - 0.6).fill({ color: rand() < 0.5 ? COLORS.marbleLit : COLORS.stoneJoint, alpha: 0.18 + rand() * 0.2 });
  }
}
