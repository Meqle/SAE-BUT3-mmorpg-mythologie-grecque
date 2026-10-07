// couleurs et petits outils communs aux deux dessins du heros (hoplite)
import { FillGradient } from 'pixi.js';
import { COLORS, mix } from '../scenes/palette';

export const SKIN = 0xe2ad7f;
export const SKIN_SHADE = 0xb47c55;
export const LINEN = 0xf8f0df; // tunique en lin
export const LINEN_SHADE = 0xd3c3a5;
export const BRONZE = 0xd29a4c;
export const BRONZE_LIT = 0xffe2a0;
export const BRONZE_SHADE = 0x8a5626;
export const LEATHER = 0x6b4126;
export const WOOD = 0x8d5d34;
const WARM_DARK = 0x3a1f2e; // pour assombrir sans verdir le jaune

// contour fin bleu nuit
export const LINE = { width: 0.9, color: COLORS.ink, alpha: 0.95, join: 'round' as const, cap: 'round' as const };

export const lighter = (color: number, t = 0.4) => mix(color, COLORS.sun, t);
export const darker = (color: number, t = 0.35) => mix(color, WARM_DARK, t);

// degrade du haut-gauche (eclaire) vers le bas-droite (ombre)
export function shaded(lit: number, dark: number): FillGradient {
  return new FillGradient({
    type: 'linear',
    start: { x: 0.2, y: 0 },
    end: { x: 0.6, y: 1 },
    colorStops: [
      { offset: 0, color: lit },
      { offset: 1, color: dark }
    ],
    textureSpace: 'local'
  });
}

// degrade rond pour les formes bombees (casque, bouclier)
export function dome(lit: number, mid: number, dark: number): FillGradient {
  return new FillGradient({
    type: 'radial',
    center: { x: 0.35, y: 0.3 },
    innerRadius: 0,
    outerCenter: { x: 0.45, y: 0.45 },
    outerRadius: 0.75,
    colorStops: [
      { offset: 0, color: lit },
      { offset: 0.5, color: mid },
      { offset: 1, color: dark }
    ],
    textureSpace: 'local'
  });
}
