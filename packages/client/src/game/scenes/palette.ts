// couleurs du jeu : style vase grec a figures noires
// regle : noir + contour creme = solide, terre cuite foncee = decor du fond
export const COLORS = {
  glaze: 0x1a1210, // vernis noir : fond autour de la carte, objets solides
  clay: 0xc8682f, // terre cuite : sol et murs
  clayLight: 0xd9834a,
  clayDark: 0xa9521f, // decor du fond (colonnes, frises)
  cream: 0xf1e3c6, // contours des objets solides et details
  wine: 0x7a2a1c, // rouge sombre pour quelques details
  shadow: 0x000000
} as const;

// 0xc8682f -> "#c8682f" (pour le HUD en CSS)
export const css = (color: number) => `#${color.toString(16).padStart(6, '0')}`;
