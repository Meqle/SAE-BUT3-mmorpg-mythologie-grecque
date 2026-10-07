// dessin du decor (formes simples en attendant les cartes Tiled)
import { Graphics } from 'pixi.js';
import { GROUND_Y, ViewMode } from '@greek-myth/shared';

// le sol dessine est sous les pieds du joueur (rayon 24)
const GROUND_LINE = GROUND_Y + 24;

export function drawWorld(background: Graphics, decor: Graphics, mode: ViewMode, color: number): void {
  background.clear();
  decor.clear();
  if (mode === 'top-down') drawTopDown(background, decor, color);
  else drawSideView(background, decor);
}

function drawTopDown(background: Graphics, decor: Graphics, color: number) {
  // damier de 64 px
  const tile = 64;
  const size = 2400;
  for (let x = -size / 2; x < size / 2; x += tile) {
    for (let y = -size / 2; y < size / 2; y += tile) {
      const even = Math.floor((x + y) / tile) % 2 === 0;
      background.rect(x, y, tile, tile);
      background.fill({ color: even ? 0x1e293b : 0x151f30 });
      background.stroke({ width: 1, color: 0x334155, alpha: 0.5 });
    }
  }

  // cercles au centre de la place
  decor.circle(400, 300, 180);
  decor.fill({ color: 0x0f172a, alpha: 0.6 });
  decor.stroke({ width: 4, color: 0xd4af37, alpha: 0.8 });
  decor.circle(400, 300, 120);
  decor.stroke({ width: 2, color, alpha: 0.9 });

  // piliers vus du dessus
  const pillars = [
    { x: 100, y: 100 }, { x: 700, y: 100 },
    { x: 100, y: 500 }, { x: 700, y: 500 },
    { x: 400, y: 50 }, { x: 400, y: 550 },
    { x: -100, y: 300 }, { x: 900, y: 300 }
  ];
  for (const p of pillars) {
    decor.circle(p.x, p.y + 10, 34);
    decor.fill({ color: 0x000000, alpha: 0.45 });
    decor.circle(p.x, p.y, 30);
    decor.fill({ color: 0xca8a04 });
    decor.circle(p.x, p.y, 24);
    decor.fill({ color: 0xf1f5f9 });
    decor.stroke({ width: 3, color: 0x854d0e });
    decor.circle(p.x, p.y, 8);
    decor.fill({ color });
  }
}

function drawSideView(background: Graphics, decor: Graphics) {
  background.rect(-2000, -1000, 4000, 2000);
  background.fill({ color: 0x0b1120 });

  // montagnes au fond
  decor.moveTo(-800, GROUND_LINE);
  decor.lineTo(-200, GROUND_LINE - 260);
  decor.lineTo(200, GROUND_LINE - 180);
  decor.lineTo(600, GROUND_LINE - 320);
  decor.lineTo(1200, GROUND_LINE - 140);
  decor.lineTo(1800, GROUND_LINE);
  decor.fill({ color: 0x1e293b, alpha: 0.7 });

  // sol
  decor.rect(-1500, GROUND_LINE, 3000, 400);
  decor.fill({ color: 0x1e293b });
  decor.stroke({ width: 4, color: 0xd4af37 });

  // colonnes
  for (const x of [-300, 100, 400, 700, 1100]) {
    decor.rect(x, GROUND_LINE - 280, 40, 280);
    decor.fill({ color: 0x334155 });
    decor.stroke({ width: 2, color: 0x64748b });
    decor.rect(x - 8, GROUND_LINE - 295, 56, 18);
    decor.fill({ color: 0xfacc15 });
  }

  // plateformes (decoratives pour l'instant : pas encore de collision)
  const platforms = [
    { x: 200, y: GROUND_LINE - 110, w: 180 },
    { x: 500, y: GROUND_LINE - 170, w: 200 },
    { x: 100, y: GROUND_LINE - 240, w: 160 },
    { x: 650, y: GROUND_LINE - 260, w: 180 }
  ];
  for (const p of platforms) {
    decor.roundRect(p.x, p.y, p.w, 18, 6);
    decor.fill({ color: 0x1e293b });
    decor.stroke({ width: 3, color: 0xfacc15 });
  }
}
