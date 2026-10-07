// les deux sortes de portes : vue de dessus (cercle au sol) et vue de profil (arche)
import { Graphics } from 'pixi.js';
import { MAPS, Portal } from '@greek-myth/shared';
import { COLORS } from './palette';

// porte vue de dessus : passage entre deux tours, avec un cercle magique au sol
export function drawGateFromAbove(g: Graphics, p: Portal): void {
  const onLeft = p.x < MAPS['top-down'].width / 2;
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;

  g.rect(p.x, p.y, p.w, p.h);
  g.fill({ color: COLORS.stoneDark });

  // seuil dore, du cote de la place
  g.rect(onLeft ? p.x + p.w - 4 : p.x, p.y, 4, p.h);
  g.fill({ color: COLORS.gold });

  g.circle(cx, cy, 26);
  g.fill({ color: COLORS.turquoise, alpha: 0.3 });
  g.stroke({ width: 3, color: COLORS.gold });
  g.circle(cx, cy, 12);
  g.fill({ color: COLORS.gold, alpha: 0.8 });
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

// porte vue de profil : arche de pierre dans le mur du fond, interieur sombre qui brille
// (pas de filet dore : l'or est reserve aux elements sur lesquels on peut marcher)
export function drawGateSide(g: Graphics, p: Portal): void {
  const cx = p.x + p.w / 2;
  const floor = p.y + p.h;
  const radius = p.w / 2;

  g.poly(archPoints(cx, p.y, radius + 12, floor));
  g.fill({ color: COLORS.stone });
  g.stroke({ width: 2, color: COLORS.stoneDark });

  g.poly(archPoints(cx, p.y, radius, floor));
  g.fill({ color: COLORS.doorway });
  g.poly(archPoints(cx, p.y, radius, floor));
  g.fill({ color: COLORS.turquoise, alpha: 0.28 });

  // signes graves sur les deux montants
  for (let i = 0; i < 3; i++) {
    g.rect(p.x - 9, p.y + 12 + i * 22, 6, 8);
    g.rect(p.x + p.w + 3, p.y + 12 + i * 22, 6, 8);
  }
  g.fill({ color: COLORS.stoneDark });
}
