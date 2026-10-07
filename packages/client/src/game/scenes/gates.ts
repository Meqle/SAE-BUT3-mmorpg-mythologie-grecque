// les portes sont des passages de lumiere divine : on les traverse, donc pas de contour bleu nuit
// la lumiere est dessinee dans "glow", qui pulse doucement (voir GameCanvas)
import { Graphics } from 'pixi.js';
import { Portal } from '@greek-myth/shared';
import { COLORS } from './palette';
import { drawLaurel } from './props';

// vue de dessus : cercle de mosaique bleue au sol, entoure de lumiere et de laurier
export function drawGateFromAbove(decor: Graphics, glow: Graphics, p: Portal): void {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;

  decor.circle(cx, cy, 30);
  decor.fill({ color: COLORS.skyLight });
  decor.stroke({ width: 3, color: COLORS.seaLight });

  glow.circle(cx, cy, 24);
  glow.fill({ color: COLORS.gold, alpha: 0.35 });
  glow.circle(cx, cy, 10);
  glow.fill({ color: COLORS.gold, alpha: 0.8 });
  drawLaurel(glow, cx, cy, 34, COLORS.gold);
}

// points d'une arche : deux cotes droits jusqu'a baseY puis un demi-cercle
function archPoints(cx: number, baseY: number, radius: number, bottomY: number): number[] {
  const points = [cx - radius, bottomY, cx - radius, baseY];
  for (let i = 1; i < 16; i++) {
    const angle = Math.PI + (i / 16) * Math.PI;
    points.push(cx + radius * Math.cos(angle), baseY + radius * Math.sin(angle));
  }
  points.push(cx + radius, baseY, cx + radius, bottomY);
  return points;
}

// vue de profil : arche de lumiere posee sur le sol, une couronne de laurier flotte au-dessus
export function drawGateSide(glow: Graphics, p: Portal): void {
  const cx = p.x + p.w / 2;
  const floor = p.y + p.h;
  const radius = p.w / 2;

  glow.poly(archPoints(cx, p.y + radius, radius, floor));
  glow.fill({ color: COLORS.gold, alpha: 0.3 });
  glow.poly(archPoints(cx, p.y + radius, radius - 8, floor));
  glow.fill({ color: COLORS.skyLight, alpha: 0.5 });
  glow.poly(archPoints(cx, p.y + radius, radius, floor));
  glow.stroke({ width: 3, color: COLORS.gold });
  drawLaurel(glow, cx, p.y - 16, 14, COLORS.gold);
}
