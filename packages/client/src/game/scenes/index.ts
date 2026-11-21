// une scene = tout le decor d'une vue, en couches (fond en parallaxe, decor, premier plan)
import { Container } from 'pixi.js';
import { ViewMode } from '@greek-myth/shared';
import { View } from '../camera';
import { createSideView } from './sideView';
import { createTopDown } from './topDown';

export interface Scene {
  back: Container; // derriere les joueurs : fond, decor, objets solides
  front: Container; // devant les joueurs : premier plan
  update: (view: View, time: number) => void; // place les couches et anime (time en secondes)
}

export function createScene(mode: ViewMode): Scene {
  return mode === 'top-down' ? createTopDown() : createSideView();
}
