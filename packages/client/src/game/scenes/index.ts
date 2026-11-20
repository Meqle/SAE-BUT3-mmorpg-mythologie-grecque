import { Container } from 'pixi.js';
import { ViewMode } from '@greek-myth/shared';
import type { ZoneDefinition } from '../data/zones';
import { View } from '../camera';
import { createSideView } from './sideView';
import { createTopDown } from './topDown';
import { createZoneScene } from './zones/zoneScenes';

export interface Scene {
  back: Container;
  front: Container;
  update: (view: View, time: number) => void;
}

export function createScene(mode: ViewMode): Scene {
  return mode === 'top-down' ? createTopDown() : createSideView();
}

export { createZoneScene };
export type { ZoneDefinition };
