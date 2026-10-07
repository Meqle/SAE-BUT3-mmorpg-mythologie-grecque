// les deux sortes de portes : vue de dessus (passage entre deux tours) et vue de profil (arche)
// la lumiere de la porte est dessinee dans "glow", qui clignote doucement (voir GameCanvas)
import { Graphics } from 'pixi.js';
import { MAPS, Portal } from '@greek-myth/shared';
import { COLORS } from './palette';

// porte vue de dessus : sol rouge sombre, seuil cote place, cercles de lumiere
export function drawGateFromAbove(g: Graphics, glow: Graphics, p: Portal): void {
  const onLeft = p.x < MAPS['top-down'].width / 2;
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;

  g.rect(p.x, p.y, p.w, p.h);
  g.fill({ color: COLORS.wine });
  g.rect(onLeft ? p.x + p.w - 6 : p.x, p.y, 6, p.h); // seuil
  g.fill({ color: COLORS.clayDark });

  glow.circle(cx, cy, 26);
  glow.stroke({ width: 3, color: COLORS.cream });
  glow.circle(cx, cy, 14);
  glow.fill({ color: COLORS.cream, alpha: 0.7 });
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

// porte vue de profil : arche du fond (decor, donc terre cuite foncee) et passage lumineux
export function drawGateSide(g: Graphics, glow: Graphics, p: Portal): void {
  const cx = p.x + p.w / 2;
  const floor = p.y + p.h;
  const radius = p.w / 2;

  g.poly(archPoints(cx, p.y, radius + 12, floor));
  g.fill({ color: COLORS.clayDark });
  g.poly(archPoints(cx, p.y, radius, floor));
  g.fill({ color: COLORS.wine });

  glow.poly(archPoints(cx, p.y + 6, radius - 6, floor));
  glow.fill({ color: COLORS.cream, alpha: 0.35 });
  glow.poly(archPoints(cx, p.y + 6, radius - 6, floor));
  glow.stroke({ width: 2, color: COLORS.cream });
}
