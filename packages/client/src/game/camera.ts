// camera : quelle partie du monde on voit, et a quel zoom
import { Container } from 'pixi.js';
import { GameMap } from '@greek-myth/shared';

// hauteur du monde visible a l'ecran (en pixels du monde) : le zoom s'adapte a la fenetre
export const VIEW_HEIGHT = 480;
// largeur du monde qu'on veut voir au minimum (sur un telephone en portrait on dezoome)
const VIEW_MIN_WIDTH = 560;
const MIN_ZOOM = 0.6;

// x, y = coin haut gauche visible (coordonnees du monde) ; width, height = taille visible
export interface View {
  x: number;
  y: number;
  zoom: number;
  width: number;
  height: number;
}

// vue centree sur le joueur sans sortir de la carte (centree si la carte est plus petite)
// margin = combien on peut voir au-dela du bord de la carte (pour voir le muret autour)
export function viewAround(px: number, py: number, map: GameMap, screenW: number, screenH: number, margin = 0): View {
  const zoom = Math.max(MIN_ZOOM, Math.min(screenH / VIEW_HEIGHT, screenW / VIEW_MIN_WIDTH));
  const width = screenW / zoom;
  const height = screenH / zoom;
  const axis = (p: number, mapSize: number, size: number) =>
    mapSize + margin * 2 <= size
      ? (mapSize - size) / 2
      : Math.min(mapSize - size + margin, Math.max(-margin, p - size / 2));
  return { x: axis(px, map.width, width), y: axis(py, map.height, height), zoom, width, height };
}

// place une couche a l'ecran ; depth < 1 = plus loin (bouge moins vite), > 1 = premier plan
export function placeLayer(layer: Container, view: View, depth = 1): void {
  layer.scale.set(view.zoom);
  layer.position.set(-view.x * depth * view.zoom, -view.y * depth * view.zoom);
}
