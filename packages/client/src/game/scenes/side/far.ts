// lointain : montagnes dans la brume, puis une ile avec son acropole et un village blanc
import { Container, Graphics } from 'pixi.js';
import { COLORS, mix } from '../palette';
import { band, Part, ridge, rnd } from './draw';
import { drawCypress } from './trees';

const HAZE = COLORS.skyHorizon;
const ISLAND_X = 600; // centre de l'ile de l'acropole
const TOP = 252; // haut du plateau de l'acropole

function drawMountains(g: Graphics): void {
  // chaine du fond, tres pale
  ridge(g, 420, 10, (x) => 246 - 30 * Math.sin(x * 0.0042 + 1) - 16 * Math.sin(x * 0.011) - 6 * Math.sin(x * 0.031))
    .fill({ color: mix(COLORS.far, HAZE, 0.5) });
  // chaine plus proche, un peu plus bleue
  ridge(g, 420, 8, (x) => 284 - 18 * Math.sin(x * 0.0063 + 3) - 10 * Math.sin(x * 0.017 + 1) - 4 * Math.sin(x * 0.05))
    .fill({ color: mix(COLORS.far, 0x8fa8c4, 0.45) });
  // brume qui monte de la mer
  band(g, [[255, HAZE, 0], [310, HAZE, 0.75], [330, HAZE, 0.9]]);
}

// maisonnette blanche au toit de tuiles
function drawHouse(g: Graphics, x: number, y: number, w: number, h: number): void {
  const haze = 0.42;
  g.rect(x, y - h, w, h).fill({ color: mix(COLORS.marbleLit, COLORS.far, haze) });
  g.rect(x + w * 0.65, y - h, w * 0.35, h).fill({ color: mix(COLORS.marbleShadow, COLORS.far, haze) });
  g.poly([x - 1, y - h, x + w * 0.5, y - h - 4, x + w + 1, y - h]).fill({ color: mix(COLORS.tile, COLORS.far, 0.45) });
}

// hauteur de l'ile (d = distance au centre)
function islandY(d: number): number {
  if (d < -60) return TOP + 82 * Math.pow(Math.min(1, (-60 - d) / 330), 0.7) + Math.sin(d * 0.05) * 2;
  if (d > 70) return TOP + 82 * Math.pow(Math.min(1, (d - 70) / 340), 0.55) + Math.sin(d * 0.07) * 2;
  return TOP;
}

function drawIsland(g: Graphics): void {
  const cx = ISLAND_X;
  const land = mix(0x9aa88f, COLORS.far, 0.5);
  const shade = mix(0x7d8fa6, COLORS.far, 0.35);
  // colline : pente douce a gauche, plus raide a droite, plateau au sommet
  const pts: number[] = [];
  for (let d = -400; d <= 420; d += 10) pts.push(cx + d, islandY(d));
  g.poly([...pts, cx + 420, 340, cx - 400, 340]).fill({ color: land });
  // cote droit a l'ombre (lumiere venant de la gauche)
  const right: number[] = [];
  for (let d = 70; d <= 420; d += 10) right.push(cx + d, islandY(d));
  g.poly([...right, cx + 420, 340, cx + 40, 340, cx + 50, TOP + 30]).fill({ color: shade, alpha: 0.45 });
  // murailles de l'acropole
  g.rect(cx - 64, TOP, 138, 10).fill({ color: mix(0xd9c9a8, COLORS.far, 0.4) });
  g.rect(cx + 30, TOP, 44, 10).fill({ color: shade, alpha: 0.5 });

  // temple : marches, colonnes, fronton
  const tx = cx - 44;
  const lit = mix(COLORS.marbleLit, HAZE, 0.35);
  const mid = mix(COLORS.marble, COLORS.far, 0.5);
  const dark = mix(COLORS.marbleShadow, COLORS.far, 0.35);
  g.rect(tx - 4, TOP - 5, 96, 5).fill({ color: lit });
  g.rect(tx, TOP - 28, 88, 23).fill({ color: dark });
  for (let i = 0; i < 7; i++) g.rect(tx + 2 + i * 13.5, TOP - 28, 5, 23).fill({ color: i < 3 ? lit : mid });
  g.rect(tx - 2, TOP - 33, 92, 5).fill({ color: mid });
  g.poly([tx - 3, TOP - 33, tx + 44, TOP - 46, tx + 91, TOP - 33]).fill({ color: lit });
  g.poly([tx + 44, TOP - 46, tx + 91, TOP - 33, tx + 44, TOP - 33]).fill({ color: mid });
  // petit temple voisin
  g.rect(cx + 28, TOP - 14, 30, 14).fill({ color: mid });
  g.poly([cx + 26, TOP - 14, cx + 43, TOP - 21, cx + 60, TOP - 14]).fill({ color: lit });

  // village sur les pentes
  for (let i = 0; i < 16; i++) {
    const left = i < 9;
    const x = left ? cx - 250 + i * 20 + rnd(i) * 8 : cx + 110 + (i - 9) * 22 + rnd(i) * 8;
    const y = left ? 316 - (i / 9) * 38 + rnd(i * 2) * 8 : 296 + (i - 9) * 3 + rnd(i * 2) * 8;
    drawHouse(g, x, y, 9 + rnd(i * 5) * 7, 6 + rnd(i * 7) * 4);
  }
  for (let i = 0; i < 9; i++) drawCypress(g, cx - 290 + i * 70 + rnd(i * 9) * 30, 322 - (i < 5 ? i * 9 : (8 - i) * 6), 14 + rnd(i) * 8, 0.6);

  // autres iles basses
  g.ellipse(cx + 640, 330, 200, 34).fill({ color: mix(land, HAZE, 0.3) });
  g.ellipse(cx + 560, 330, 90, 22).fill({ color: mix(land, HAZE, 0.15) });
  g.ellipse(cx - 700, 330, 160, 26).fill({ color: mix(land, HAZE, 0.3) });
  // un voile de brume par dessus le bas de l'ile
  band(g, [[280, HAZE, 0], [322, HAZE, 0.55], [340, HAZE, 0.7]]);
}

export function createFar(): Part[] {
  const mountains = new Container();
  const m = new Graphics();
  drawMountains(m);
  mountains.addChild(m);
  const island = new Container();
  const i = new Graphics();
  drawIsland(i);
  island.addChild(i);
  return [
    { layer: mountains, depth: 0.14 },
    { layer: island, depth: 0.3 }
  ];
}
