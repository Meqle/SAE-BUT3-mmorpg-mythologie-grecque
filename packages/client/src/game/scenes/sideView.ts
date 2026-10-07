// decor de la vue de profil : interieur de temple avec colonnes et frise
import { Graphics } from 'pixi.js';
import { MAPS } from '@greek-myth/shared';
import { COLORS } from './palette';
import { drawFrame, drawGate, drawSlab } from './props';

const COLUMN_X = [200, 440, 680];

export function drawSideView(background: Graphics, decor: Graphics): void {
  const map = MAPS['side-view'];

  // mur du fond
  background.rect(0, 0, map.width, map.height);
  background.fill({ color: COLORS.wall });

  // frise en haut : bande de lapis avec des triangles dores
  background.rect(0, 40, map.width, 30);
  background.fill({ color: COLORS.lapis });
  for (let x = 0; x < map.width; x += 30) {
    background.poly([x + 4, 66, x + 15, 44, x + 26, 66]);
  }
  background.fill({ color: COLORS.gold });
  drawFrame(background, map.width, map.height);

  // colonnes du fond (le joueur passe devant)
  for (const x of COLUMN_X) {
    decor.rect(x - 18, 100, 36, 372);
    decor.fill({ color: COLORS.sand });
    decor.stroke({ width: 2, color: COLORS.stoneDark });
    decor.rect(x - 28, 90, 56, 16);
    decor.fill({ color: COLORS.gold });
  }

  for (const solid of map.solids) drawSlab(decor, solid);
  for (const portal of map.portals) drawGate(decor, portal);
}
