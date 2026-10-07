// couleurs du jeu : l'Acropole, marbre blanc et mer Egee
// regle : marbre avec un contour bleu nuit = solide, le reste (pale, sans contour) = decor
export const COLORS = {
  ink: 0x1f3550, // bleu nuit : contours des objets solides, texte
  sea: 0x1d5f8c, // mer autour de la carte
  seaLight: 0x3d84b3,
  sky: 0x8fc9e8,
  skyLight: 0xdcf0f8,
  far: 0xa9c3d6, // decor tres loin (ile, temple au loin)
  marble: 0xf4f1e8, // objets solides
  marbleShade: 0xd9d2c1,
  stone: 0xe6dcc6, // dalles du sol (on marche dessus)
  stoneJoint: 0xcbbfa4,
  olive: 0x6b7d3a,
  oliveDark: 0x4c5a28,
  tile: 0xb5523b, // terre cuite des tuiles et amphores
  bronze: 0xc08a3e, // casques
  gold: 0xe0b94f, // lumiere divine (portes)
  cloud: 0xffffff,
  shadow: 0x000000
} as const;

// 0x1f3550 -> "#1f3550" (pour le HUD en CSS)
export const css = (color: number) => `#${color.toString(16).padStart(6, '0')}`;
