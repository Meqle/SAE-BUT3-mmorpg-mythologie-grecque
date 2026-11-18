// formes grecques communes aux deux vues (frise, laurier)
import { Graphics } from 'pixi.js';

// frise grecque (meandre) le long d'une bande, u = taille d'un trait
export function drawMeander(g: Graphics, x: number, y: number, length: number, u: number, color: number, vertical = false): void {
  // (a, b) = (le long de la bande, en travers) -> coordonnees reelles
  const at = (a: number, b: number): [number, number] => (vertical ? [x + b, y + a] : [x + a, y + b]);
  g.moveTo(...at(0, 4 * u));
  g.lineTo(...at(length, 4 * u));
  for (let a = 0; a + 4 * u <= length; a += 4 * u) {
    g.moveTo(...at(a, 4 * u));
    for (const [da, db] of [[0, 0], [3, 0], [3, 3], [1, 3], [1, 1], [2, 1], [2, 2]]) {
      g.lineTo(...at(a + da * u, db * u));
    }
  }
  g.stroke({ width: u * 0.7, color });
}

// couronne de laurier : deux branches de feuilles autour d'un cercle
export function drawLaurel(g: Graphics, cx: number, cy: number, radius: number, color: number): void {
  for (const side of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      const a = Math.PI / 2 + side * (0.3 + i * 0.19); // part du bas, monte de chaque cote
      const r = radius + (i % 2 === 0 ? 3 : -3); // une feuille dehors, une dedans
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      const t = a + Math.PI / 2; // la feuille suit le cercle
      const len = Math.max(4, radius * 0.13);
      const wid = len * 0.4;
      g.poly([
        x - Math.cos(t) * len, y - Math.sin(t) * len,
        x - Math.sin(t) * wid, y + Math.cos(t) * wid,
        x + Math.cos(t) * len, y + Math.sin(t) * len,
        x + Math.sin(t) * wid, y - Math.cos(t) * wid
      ]);
    }
  }
  g.fill({ color });
}
