// decor de la vue du dessus : place en terre cuite avec un medaillon au centre
// (comme le fond d'une coupe grecque) ; noir + contour creme = solide
import { Graphics } from 'pixi.js';
import { MAPS } from '@greek-myth/shared';
import { COLORS } from './palette';
import { drawGateFromAbove } from './gates';
import { drawColumnTop, drawFrame, drawSlab } from './props';

const TILE = 40;

export function drawTopDown(background: Graphics, decor: Graphics, glow: Graphics): void {
  const map = MAPS['top-down'];
  const cx = map.width / 2;
  const cy = map.height / 2;

  // sol en dalles de terre cuite
  drawFrame(background, map.width, map.height);
  background.rect(0, 0, map.width, map.height);
  background.fill({ color: COLORS.clay });
  for (let x = TILE; x < map.width; x += TILE) background.moveTo(x, 0).lineTo(x, map.height);
  for (let y = TILE; y < map.height; y += TILE) background.moveTo(0, y).lineTo(map.width, y);
  background.stroke({ width: 1, color: COLORS.clayDark, alpha: 0.5 });

  // medaillon central : anneau perle, disque clair et soleil rouge sombre
  decor.circle(cx, cy, 142);
  decor.fill({ color: COLORS.clayDark });
  for (let i = 0; i < 32; i++) {
    const angle = (i * Math.PI) / 16;
    decor.circle(cx + Math.cos(angle) * 134, cy + Math.sin(angle) * 134, 3);
  }
  decor.fill({ color: COLORS.clayLight });
  decor.circle(cx, cy, 124);
  decor.fill({ color: COLORS.clayLight });
  decor.circle(cx, cy, 100);
  decor.stroke({ width: 3, color: COLORS.clayDark });
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    const side = Math.PI / 24;
    decor.poly([
      cx + Math.cos(a - side) * 36, cy + Math.sin(a - side) * 36,
      cx + Math.cos(a) * 74, cy + Math.sin(a) * 74,
      cx + Math.cos(a + side) * 36, cy + Math.sin(a + side) * 36
    ]);
  }
  decor.fill({ color: COLORS.wine });
  decor.circle(cx, cy, 28);
  decor.fill({ color: COLORS.wine });

  for (const solid of map.solids) {
    if (solid.column) drawColumnTop(decor, solid);
    else drawSlab(decor, solid);
  }
  for (const portal of map.portals) drawGateFromAbove(decor, glow, portal);
}
