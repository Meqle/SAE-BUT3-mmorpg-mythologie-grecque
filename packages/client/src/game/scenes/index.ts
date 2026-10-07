// dessine le decor de la vue demandee
import { Graphics } from 'pixi.js';
import { ViewMode } from '@greek-myth/shared';
import { drawSideView } from './sideView';
import { drawTopDown } from './topDown';

// background = sol et murs, decor = objets, glow = lumiere des portes (animee)
export function drawWorld(background: Graphics, decor: Graphics, glow: Graphics, mode: ViewMode): void {
  background.clear();
  decor.clear();
  glow.clear();
  if (mode === 'top-down') drawTopDown(background, decor, glow);
  else drawSideView(background, decor, glow);
}
