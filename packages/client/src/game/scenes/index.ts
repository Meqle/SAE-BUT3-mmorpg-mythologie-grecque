// dessine le decor de la vue demandee
import { Graphics } from 'pixi.js';
import { ViewMode } from '@greek-myth/shared';
import { drawSideView } from './sideView';
import { drawTopDown } from './topDown';

export function drawWorld(background: Graphics, decor: Graphics, mode: ViewMode): void {
  background.clear();
  decor.clear();
  if (mode === 'top-down') drawTopDown(background, decor);
  else drawSideView(background, decor);
}
