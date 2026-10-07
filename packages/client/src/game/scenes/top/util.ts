// petits outils communs a la vue du dessus : hasard reproductible, contour de l'ile, ombres
import { Graphics } from 'pixi.js';

export const W = 960; // taille de la carte
export const H = 600;
export const WALL = 36; // epaisseur du muret qui entoure la place (en dehors de la carte)

// direction des ombres : soleil bas en haut a gauche -> ombres longues vers le bas a droite
export const SHADOW_DX = 0.86;
export const SHADOW_DY = 0.5;

// hasard toujours pareil (meme decor a chaque chargement)
export function random(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// contour de l'ile : rectangle arrondi autour du muret, bord irregulier
// extra = decalage vers le large (pour la mer peu profonde, l'ecume...)
export function islandOutline(extra: number): number[] {
  const r = 70; // rayon des coins
  const hw = W / 2 + WALL - r;
  const hh = H / 2 + WALL - r;
  // bords (point de depart, direction) puis coins (centre, angle de depart)
  const raw: number[][] = []; // [x, y, nx, ny]
  const edge = (x0: number, y0: number, dx: number, dy: number, len: number, nx: number, ny: number) => {
    for (let d = 0; d < len; d += 10) raw.push([x0 + dx * d, y0 + dy * d, nx, ny]);
  };
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i < 11; i++) {
      const a = a0 + (i / 11) * (Math.PI / 2);
      raw.push([cx, cy, Math.cos(a), Math.sin(a)]);
    }
  };
  edge(-hw, -hh, 1, 0, hw * 2, 0, -1);
  corner(hw, -hh, -Math.PI / 2);
  edge(hw, -hh, 0, 1, hh * 2, 1, 0);
  corner(hw, hh, 0);
  edge(hw, hh, -1, 0, hw * 2, 0, 1);
  corner(-hw, hh, Math.PI / 2);
  edge(-hw, hh, 0, -1, hh * 2, -1, 0);
  corner(-hw, -hh, Math.PI);
  const points: number[] = [];
  raw.forEach(([x, y, nx, ny], i) => {
    const a = (i / raw.length) * Math.PI * 2;
    // bord irregulier (sinus qui bouclent sur le tour complet)
    let bump = 34 + 12 * Math.sin(a * 5 + 1) + 7 * Math.sin(a * 13 + 2) + 3 * Math.sin(a * 37) + extra;
    // petite plage plus large devant les deux portes
    if (nx !== 0 && ny === 0) bump += 30 * Math.exp(-((y / 60) ** 2));
    points.push(W / 2 + x + nx * (r + bump), H / 2 + y + ny * (r + bump));
  });
  return points;
}

// ombre portee d'un objet de hauteur h pose sur le rectangle (x, y, w, h0) : on etire vers le bas a droite
export function castShadow(g: Graphics, x: number, y: number, w: number, h0: number, length: number): void {
  const dx = SHADOW_DX * length;
  const dy = SHADOW_DY * length;
  g.poly([x + w, y, x + w + dx, y + dy, x + w + dx, y + h0 + dy, x + dx, y + h0 + dy, x, y + h0, x + w, y + h0]);
  g.fill({ color: 0x000000 });
}
