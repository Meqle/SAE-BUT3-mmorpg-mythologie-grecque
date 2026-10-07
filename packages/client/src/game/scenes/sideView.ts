// decor de la vue de profil : la scene est peinte comme sur un vase
// noir + contour creme = on peut marcher dessus, terre cuite foncee = decor du fond
import { Graphics } from 'pixi.js';
import { MAPS } from '@greek-myth/shared';
import { COLORS } from './palette';
import { drawGateSide } from './gates';
import { drawFrame, drawMeander, drawSlab } from './props';

const COLUMN_X = [230, 450, 750];

export function drawSideView(background: Graphics, decor: Graphics, glow: Graphics): void {
  const map = MAPS['side-view'];

  // mur du fond en terre cuite et frise en meandre en haut
  drawFrame(background, map.width, map.height);
  background.rect(0, 0, map.width, map.height);
  background.fill({ color: COLORS.clay });
  background.rect(0, 30, map.width, 3);
  background.rect(0, 67, map.width, 3);
  background.fill({ color: COLORS.clayDark });
  drawMeander(background, 4, 40, map.width - 8, 5, COLORS.clayDark);

  // colonnes doriques du fond (le joueur passe devant)
  for (const x of COLUMN_X) {
    decor.rect(x - 15, 112, 30, 360);
    decor.poly([x - 22, 102, x + 22, 102, x + 15, 112, x - 15, 112]);
    decor.rect(x - 26, 94, 52, 8);
    decor.fill({ color: COLORS.clayDark });
    for (const dx of [-7, 0, 7]) decor.moveTo(x + dx, 118).lineTo(x + dx, 466);
    decor.stroke({ width: 2, color: COLORS.clay, alpha: 0.6 });
  }

  for (const solid of map.solids) drawSlab(decor, solid);
  // frise creme sur le devant du sol, comme le bas d'un vase
  const ground = map.solids[0];
  drawMeander(decor, ground.x + 8, ground.y + 18, ground.w - 16, 4, COLORS.cream);

  for (const portal of map.portals) drawGateSide(decor, glow, portal);
}
