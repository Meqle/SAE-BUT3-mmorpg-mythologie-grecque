// vue du dessus : une agora de marbre sur une petite ile de la mer Egee, en fin d'apres-midi
// couches (du fond vers l'avant) : mer, rivage, sol + mosaique, ombres, muret + objets solides, portes
import { AlphaFilter, Container, Graphics } from 'pixi.js';
import { MAPS } from '@greek-myth/shared';
import { placeLayer, View } from '../camera';
import type { Scene } from '.';
import { createAmbient } from './top/ambient';
import { drawFloor } from './top/floor';
import { createGate } from './top/gates';
import { drawMosaic } from './top/mosaic';
import { drawColumn, drawLowWall, drawOlive } from './top/props';
import { createSea } from './top/sea';
import { drawShore } from './top/shore';
import { drawWall } from './top/wall';

export function createTopDown(): Scene {
  const map = MAPS['top-down'];
  const back = new Container();
  const front = new Container();

  const sea = createSea();
  const shore = new Graphics();
  drawShore(shore);
  const floor = new Graphics();
  drawFloor(floor);
  drawMosaic(floor);

  // toutes les ombres dans un seul calque, rendu transparent d'un coup (pas de zones plus sombres quand elles se croisent)
  const shadows = new Graphics();
  shadows.filters = [new AlphaFilter({ alpha: 0.26 })];
  const solids = new Graphics();
  drawWall(solids, shadows);
  let olives = 0;
  for (const solid of map.solids) {
    if (solid.look === 'column') drawColumn(solids, shadows, solid);
    else if (solid.look === 'olive') drawOlive(solids, shadows, solid, 40 + olives++);
    else drawLowWall(solids, shadows, solid, solid.x < map.width / 2 ? 1 : -1);
  }

  const gates = map.portals.map(createGate);
  back.addChild(sea.view, shore, floor, ...gates.map((gate) => gate.floor), shadows, solids);

  const ambient = createAmbient();
  front.addChild(...gates.map((gate) => gate.light), ambient.view);

  return {
    back,
    front,
    update: (view: View, time: number) => {
      placeLayer(back, view);
      placeLayer(front, view);
      sea.update(time);
      gates.forEach((gate) => gate.update(time));
      ambient.update(time);
    }
  };
}
