// colline proche derriere le sol : oliviers, cypres, et a droite les ruines du temple (decor, sans contour)
import { Container, Graphics } from 'pixi.js';
import { COLORS, mix } from '../palette';
import { band, Part, ridge, rnd } from './draw';
import { drawCypress, drawOlive, drawRuinColumn } from './trees';

const HAZE = 0.3;
const HILL = 0x9aa25c; // herbe seche dans la lumiere doree
const HILL_FAR = 0xb7b98a;
const ROCK = 0xcbbb9c;

// hauteur de la colline (plus basse a droite, la ou sont les ruines)
function hill(x: number): number {
  return 418 - 22 * Math.sin(x * 0.006 + 0.5) - 9 * Math.sin(x * 0.019) - 3 * Math.sin(x * 0.07) + Math.max(0, x - 600) * 0.012;
}

// tas de gravats arrondis au pied des ruines
function drawRubble(g: Graphics, x: number, base: number, seed: number): void {
  for (let i = 0; i < 5; i++) {
    const r = 4 + rnd(seed + i) * 7;
    const cx = x + (i - 2) * 9 + rnd(seed * 3 + i) * 6;
    g.ellipse(cx, base - r * 0.5, r * 1.3, r).fill({ color: mix(ROCK, COLORS.far, HAZE) });
    g.ellipse(cx - r * 0.3, base - r * 0.8, r * 0.7, r * 0.45).fill({ color: mix(COLORS.marbleLit, COLORS.far, HAZE), alpha: 0.8 });
  }
}

function drawCoast(g: Graphics): void {
  // colline du fond, plus pale
  ridge(g, 700, 8, (x) => hill(x * 0.7 + 300) - 18).fill({ color: mix(HILL_FAR, COLORS.far, 0.45) });
  for (let i = 0; i < 9; i++) drawCypress(g, -200 + i * 230 + rnd(i * 5) * 90, hill((-200 + i * 230) * 0.7 + 300) - 14, 40 + rnd(i) * 30, 0.55);

  // grands arbres de la colline proche (avant la colline pour que leur pied soit cache)
  const trees: [number, number][] = [[-120, 1], [40, 0], [150, 1], [300, 1], [470, 0], [520, 1], [960, 1], [1230, 0], [1500, 1], [1700, 0]];
  for (const [x, kind] of trees) {
    if (kind === 1) drawCypress(g, x, hill(x) + 8, 100 + rnd(x) * 60, HAZE);
    else drawOlive(g, x, hill(x) + 6, 1.5, HAZE, x);
  }

  // colline proche avec un filet dore sur la crete
  ridge(g, 700, 6, hill).fill({ color: mix(HILL, COLORS.far, HAZE) });
  ridge(g, 700, 6, (x) => hill(x) + 3).fill({ color: mix(0x7f8a4c, COLORS.far, HAZE) });
  band(g, [[400, COLORS.shadow, 0], [470, COLORS.shadow, 0.12]]);
  for (const x of [-60, 100, 380, 600]) drawOlive(g, x, hill(x) + 22, 1.1, HAZE + 0.05, x * 3);

  // ruines du temple (moitie droite) : colonnes de hauteurs differentes, certaines cassees
  const columns: [number, number, boolean][] = [
    [700, 48, true], [780, 92, false], [818, 70, true],
    [1000, 96, false], [1180, 96, false], [1222, 62, true], [1300, 70, true]
  ];
  for (const [x, h, broken] of columns) drawRuinColumn(g, x, 470, 16, h, 0.6, broken, x);
  // tambours tombes et gravats
  for (const x of [730, 870, 1000, 1190, 1330, 1460]) drawRubble(g, x, 472, x);
  g.ellipse(965, 462, 26, 10).fill({ color: mix(COLORS.marble, COLORS.far, HAZE) });
  g.ellipse(958, 458, 20, 6).fill({ color: mix(COLORS.marbleLit, COLORS.far, HAZE) });
}

export function createCoast(): Part[] {
  const coast = new Container();
  const g = new Graphics();
  drawCoast(g);
  coast.addChild(g);
  return [{ layer: coast, depth: 0.62 }];
}
