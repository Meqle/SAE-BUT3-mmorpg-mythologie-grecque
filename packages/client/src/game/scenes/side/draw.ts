// outils de dessin communs a la vue de profil (degrades, lumiere douce, hasard stable)
import { Container, FillGradient, Graphics } from 'pixi.js';
import type { View } from '../../camera';

// une couche du decor : son conteneur, sa profondeur (parallaxe) et son animation
export interface Part {
  layer: Container;
  depth: number;
  animate?: (time: number, view: View) => void;
}

// on dessine chaque couche assez large pour ne jamais voir de bord
export const LEFT = -300;
export const WIDE = 2200;

// couleur 0xrrggbb + transparence -> "rgba(...)" pour les degrades
export function rgba(color: number, a = 1): string {
  return `rgba(${(color >> 16) & 255},${(color >> 8) & 255},${color & 255},${a})`;
}

// hasard qui donne toujours le meme resultat pour le meme i (0 a 1)
export function rnd(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// degrade vertical ; stops = [y, couleur, alpha] avec des y absolus
export function vgrad(stops: [number, number, number?][]): FillGradient {
  const y0 = stops[0][0];
  const y1 = stops[stops.length - 1][0];
  return new FillGradient({
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    textureSpace: 'local',
    colorStops: stops.map(([y, c, a = 1]) => ({ offset: (y - y0) / (y1 - y0), color: rgba(c, a) }))
  });
}

// degrade horizontal (offsets de 0 a 1)
export function hgrad(stops: [number, number, number?][]): FillGradient {
  return new FillGradient({
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
    textureSpace: 'local',
    colorStops: stops.map(([o, c, a = 1]) => ({ offset: o, color: rgba(c, a) }))
  });
}

// bande verticale en degrade de LEFT a LEFT + WIDE
export function band(g: Graphics, stops: [number, number, number?][]): void {
  const y0 = stops[0][0];
  g.rect(LEFT, y0, WIDE, stops[stops.length - 1][0] - y0).fill(vgrad(stops));
}

// tache de lumiere douce (degrade radial qui s'efface sur les bords)
export function glow(g: Graphics, x: number, y: number, rx: number, ry: number, color: number, alpha: number): void {
  const grad = new FillGradient({
    type: 'radial',
    center: { x: 0.5, y: 0.5 },
    innerRadius: 0,
    outerCenter: { x: 0.5, y: 0.5 },
    outerRadius: 0.5,
    textureSpace: 'local',
    colorStops: [
      { offset: 0, color: rgba(color, alpha) },
      { offset: 0.35, color: rgba(color, alpha * 0.55) },
      { offset: 0.7, color: rgba(color, alpha * 0.15) },
      { offset: 1, color: rgba(color, 0) }
    ]
  });
  g.ellipse(x, y, rx, ry).fill(grad);
}

// ligne de crete : suite de points de LEFT a LEFT + WIDE, ferme vers le bas
export function ridge(g: Graphics, bottom: number, step: number, height: (x: number) => number): Graphics {
  const pts: number[] = [LEFT, bottom];
  for (let x = LEFT; x <= LEFT + WIDE; x += step) pts.push(x, height(x));
  pts.push(LEFT + WIDE, bottom);
  return g.poly(pts);
}
