// couleurs communes du jeu : Grece antique en fin d'apres-midi (lumiere chaude venant du haut a gauche)
// regle : objet solide = marbre avec un contour bleu nuit (ink) ; decor = sans contour, plus pale au loin
export const COLORS = {
  ink: 0x1f3550, // contour des objets solides, texte
  skyTop: 0x3f6fb5,
  sky: 0x8fc3e6,
  skyHorizon: 0xf6d9a8, // ciel pres de l'horizon (peche dore)
  sun: 0xfff1c9,
  cloud: 0xfffaf2,
  seaDeep: 0x14507a,
  sea: 0x1f6f9e,
  seaLight: 0x58a7cf,
  foam: 0xe8f6fb,
  far: 0xa9c3d6, // montagnes et ruines tres loin (brume)
  marbleLit: 0xfffaf0, // face eclairee du marbre
  marble: 0xf4ede0,
  marbleShade: 0xd8cdb8,
  marbleShadow: 0xb3a99b, // face a l'ombre (un peu froide)
  stone: 0xe8dcc3, // dalles du sol
  stoneJoint: 0xcdbd9c,
  sand: 0xe9d3a4,
  grass: 0x8a9a4b,
  olive: 0x7d8c4a,
  oliveDark: 0x4f5d2c,
  cypress: 0x2f4a2a,
  tile: 0xb5523b, // terre cuite (tuiles, amphores, cimier)
  bronze: 0xc08a3e,
  gold: 0xe9c35a, // lumiere divine (portes)
  shadow: 0x1b2338 // ombres (toujours avec une transparence)
} as const;

// 0x1f3550 -> "#1f3550" (pour le HUD en CSS)
export const css = (color: number) => `#${color.toString(16).padStart(6, '0')}`;

// melange de deux couleurs (t = 0 -> a, t = 1 -> b), pratique pour la brume au loin
export function mix(a: number, b: number, t: number): number {
  const channel = (shift: number) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t);
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}
