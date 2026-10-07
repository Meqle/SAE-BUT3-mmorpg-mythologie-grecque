// decor de la vue du dessus : une agora sur une ile, entouree par la mer Egee
// marbre + contour bleu nuit = solide (colonnes, oliviers, murets) ; le sol et la mosaique = decor
import { Graphics } from 'pixi.js';
import { MAPS } from '@greek-myth/shared';
import { COLORS } from './palette';
import { drawGateFromAbove } from './gates';
import { drawColumnTop, drawFrame, drawLaurel, drawOliveTop, drawSlab } from './props';

const SEA = 700; // largeur de mer dessinee autour de la carte
const TILE_W = 60;
const TILE_H = 40;

export function drawTopDown(background: Graphics, decor: Graphics, glow: Graphics): void {
  const map = MAPS['top-down'];
  const cx = map.width / 2;
  const cy = map.height / 2;

  // la mer et quelques vagues
  background.rect(-SEA, -SEA, map.width + SEA * 2, map.height + SEA * 2);
  background.fill({ color: COLORS.sea });
  for (let x = -SEA; x < map.width + SEA; x += 90) {
    for (let y = -SEA; y < map.height + SEA; y += 50) {
      const wx = x + ((y / 50) % 2) * 45;
      background.moveTo(wx, y).quadraticCurveTo(wx + 12, y - 6, wx + 24, y);
    }
  }
  background.stroke({ width: 2, color: COLORS.seaLight });

  // dalles de pierre posees en quinconce
  drawFrame(background, map.width, map.height);
  background.rect(0, 0, map.width, map.height);
  background.fill({ color: COLORS.stone });
  for (let y = 0; y < map.height; y += TILE_H) {
    background.moveTo(0, y).lineTo(map.width, y);
    const shift = (y / TILE_H) % 2 === 0 ? 0 : TILE_W / 2;
    for (let x = shift; x < map.width; x += TILE_W) background.moveTo(x, y).lineTo(x, y + TILE_H);
  }
  background.stroke({ width: 1, color: COLORS.stoneJoint });

  // mosaique centrale : anneaux bleus, carres en damier et couronne de laurier
  decor.circle(cx, cy, 145);
  decor.fill({ color: COLORS.marbleShade });
  decor.circle(cx, cy, 132);
  decor.fill({ color: COLORS.seaLight });
  for (let i = 0; i < 40; i++) {
    const a = (i * Math.PI) / 20;
    decor.rect(cx + Math.cos(a) * 138 - 3, cy + Math.sin(a) * 138 - 3, 6, 6);
  }
  decor.fill({ color: COLORS.ink });
  decor.circle(cx, cy, 118);
  decor.fill({ color: COLORS.skyLight });
  decor.circle(cx, cy, 70);
  decor.fill({ color: COLORS.sky });
  drawLaurel(decor, cx, cy, 92, COLORS.olive);
  decor.circle(cx, cy, 22);
  decor.fill({ color: COLORS.tile });

  for (const solid of map.solids) {
    if (solid.look === 'column') drawColumnTop(decor, solid);
    else if (solid.look === 'olive') drawOliveTop(decor, solid);
    else drawSlab(decor, solid);
  }
  for (const portal of map.portals) drawGateFromAbove(decor, glow, portal);
}
