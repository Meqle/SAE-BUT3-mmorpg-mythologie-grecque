// vue de profil : rivage grec en fin d'apres-midi, decor en parallaxe sur plusieurs couches
// loin -> pres : ciel, nuages, montagnes, ile et acropole, mer, colline et ruines, sol (gameplay), portes, premier plan
import { Container } from 'pixi.js';
import { placeLayer, View } from '../camera';
import type { Scene } from '.';
import { Part } from './side/draw';
import { createSky } from './side/sky';
import { createFar } from './side/far';
import { createSea } from './side/sea';
import { createCoast } from './side/coast';
import { createGround } from './side/ground';
import { createGates } from './side/gates';
import { createAmbient } from './side/ambient';

export function createSideView(): Scene {
  const backParts: Part[] = [...createSky(), ...createFar(), ...createSea(), ...createCoast(), ...createGround(), ...createGates()];
  const frontParts: Part[] = createAmbient();
  const back = new Container();
  const front = new Container();
  for (const part of backParts) back.addChild(part.layer);
  for (const part of frontParts) front.addChild(part.layer);
  const parts = [...backParts, ...frontParts];

  return {
    back,
    front,
    update: (view: View, time: number) => {
      for (const part of parts) {
        placeLayer(part.layer, view, part.depth);
        part.animate?.(time, view);
      }
    }
  };
}
