// decor de la vue du dessus : place de temple avec un disque solaire au centre
import { Graphics } from 'pixi.js';
import { MAPS } from '@greek-myth/shared';
import { COLORS } from './palette';
import { drawFrame, drawGate, drawSlab } from './props';

const TILE = 40;

export function drawTopDown(background: Graphics, decor: Graphics): void {
  const map = MAPS['top-down'];
  const cx = map.width / 2;
  const cy = map.height / 2;

  // sol en damier de sable
  for (let x = 0; x < map.width; x += TILE) {
    for (let y = 0; y < map.height; y += TILE) {
      background.rect(x, y, TILE, TILE);
      background.fill({ color: (x + y) / TILE % 2 === 0 ? COLORS.sand : COLORS.sandDark });
    }
  }
  drawFrame(background, map.width, map.height);

  // place centrale : anneau, disque bleu et soleil dore avec ses rayons
  decor.circle(cx, cy, 140);
  decor.fill({ color: COLORS.sandDark });
  decor.stroke({ width: 4, color: COLORS.gold });
  decor.circle(cx, cy, 95);
  decor.fill({ color: COLORS.lapis });
  decor.stroke({ width: 2, color: COLORS.gold });
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    decor.moveTo(cx + Math.cos(angle) * 36, cy + Math.sin(angle) * 36);
    decor.lineTo(cx + Math.cos(angle) * 70, cy + Math.sin(angle) * 70);
    decor.stroke({ width: 3, color: COLORS.gold });
  }
  decor.circle(cx, cy, 28);
  decor.fill({ color: COLORS.gold });

  for (const pillar of map.solids) drawSlab(decor, pillar);
  for (const portal of map.portals) drawGate(decor, portal);
}
