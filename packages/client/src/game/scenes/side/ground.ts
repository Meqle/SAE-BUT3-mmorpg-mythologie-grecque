// le gameplay : sol, plateformes et blocs en marbre dessines EXACTEMENT sur leurs rectangles
// marbre + contour bleu nuit = solide
import { Container, Graphics } from 'pixi.js';
import { MAPS } from '@greek-myth/shared';
import { COLORS, mix } from '../palette';
import { drawMeander } from '../shapes';
import { hgrad, Part, rnd, vgrad } from './draw';

type Rect = { x: number; y: number; w: number; h: number };

const MOSS = 0x6f7f3a;
const MOSS_LIT = 0x9bab55;
const RUINS_X = 850; // a droite : ruines du temple (corniches a denticules)

// touffe d'herbe posee sur un bord (decor, deborde de quelques px)
function drawTuft(g: Graphics, x: number, y: number, s: number, seed: number): void {
  for (let i = 0; i < 6; i++) {
    const dx = (i - 2.5) * 2.2 * s;
    const h = (4 + rnd(seed + i) * 6) * s;
    const lean = (rnd(seed * 2 + i) - 0.4) * 4 * s;
    g.moveTo(x + dx - 1.4 * s, y).quadraticCurveTo(x + dx + lean * 0.3, y - h * 0.6, x + dx + lean, y - h).lineTo(x + dx + 1.4 * s, y).fill({ color: i % 2 ? MOSS : MOSS_LIT });
  }
}

// fissure en zigzag
function drawCrack(g: Graphics, x: number, y: number, len: number, seed: number): void {
  g.moveTo(x, y);
  for (let i = 1; i <= 4; i++) g.lineTo(x + (rnd(seed + i) - 0.5) * 6, y + (len * i) / 4);
  g.stroke({ width: 1, color: COLORS.marbleShadow, alpha: 0.9 });
}

function drawGround(g: Graphics, r: Rect): void {
  const top = r.y;
  g.rect(r.x, top, r.w, r.h).fill(vgrad([[top, COLORS.marble], [top + 30, COLORS.marble], [top + r.h, COLORS.marbleShade]]));
  // dessus eclaire (on le voit un peu d'en haut)
  g.rect(r.x, top, r.w, 7).fill(vgrad([[0, COLORS.marbleLit], [1, 0xf7f0e2]]));
  g.rect(r.x, top + 7, r.w, 2).fill({ color: COLORS.marbleShadow, alpha: 0.7 });
  // frise grecque sur une bande
  g.rect(r.x, top + 12, r.w, 22).fill({ color: mix(COLORS.marbleShade, COLORS.marble, 0.4) });
  drawMeander(g, r.x + 4, top + 17, r.w - 8, 3, mix(COLORS.ink, COLORS.marbleShade, 0.3));
  g.rect(r.x, top + 34, r.w, 2).fill({ color: COLORS.marbleShadow, alpha: 0.6 });
  // blocs du bas : joints decales, quelques fissures
  for (let x = r.x + 70; x < r.x + r.w; x += 110) {
    g.rect(x, top + 9, 1.5, 3).fill({ color: COLORS.stoneJoint });
    g.rect(x + 40, top + 36, 1.5, r.h - 36).fill({ color: COLORS.stoneJoint });
    g.rect(x + 41.5, top + 36, 4, r.h - 36).fill({ color: COLORS.marbleLit, alpha: 0.5 });
    if (rnd(x) > 0.6) drawCrack(g, x + 70, top + 38, 18, x);
  }
  // ombre douce en bas
  g.rect(r.x, top + r.h - 14, r.w, 14).fill(vgrad([[0, COLORS.shadow, 0], [1, COLORS.shadow, 0.25]]));
  g.rect(r.x, top, r.w, r.h).stroke({ width: 2, color: COLORS.ink, alignment: 1 });
  // herbe et mousse le long du bord
  for (let x = r.x + 20; x < r.x + r.w; x += 46 + rnd(x) * 70) drawTuft(g, x, top + 1, 0.8 + rnd(x * 2) * 0.5, x);
}

function drawPlatform(g: Graphics, r: Rect): void {
  const ruin = r.x > RUINS_X;
  // ombre portee sous la plateforme (vers la droite)
  g.poly([r.x + 6, r.y + r.h, r.x + r.w, r.y + r.h, r.x + r.w + 6, r.y + r.h + 5, r.x + 12, r.y + r.h + 5]).fill({ color: COLORS.shadow, alpha: 0.18 });
  g.rect(r.x, r.y, r.w, r.h).fill(vgrad([[0, COLORS.marble], [1, COLORS.marbleShade]]));
  g.rect(r.x, r.y, r.w, 4).fill({ color: COLORS.marbleLit });
  g.rect(r.x, r.y + 4, r.w, 1).fill({ color: COLORS.marbleShade });
  if (ruin) {
    // corniche de temple : rangee de denticules
    for (let x = r.x + 5; x < r.x + r.w - 6; x += 9) g.rect(x, r.y + 9, 5, 5).fill({ color: COLORS.marbleShadow, alpha: 0.75 });
    drawCrack(g, r.x + r.w * 0.62, r.y + 4, 11, r.x);
  } else {
    drawMeander(g, r.x + 6, r.y + 7, r.w - 12, 1.7, mix(COLORS.ink, COLORS.marbleShade, 0.45));
  }
  // bouts : gauche eclaire, droite a l'ombre
  g.rect(r.x, r.y, 3, r.h).fill({ color: COLORS.marbleLit, alpha: 0.8 });
  g.rect(r.x + r.w - 5, r.y + 4, 5, r.h - 4).fill({ color: COLORS.marbleShadow, alpha: 0.5 });
  g.rect(r.x, r.y, r.w, r.h).stroke({ width: 1.5, color: COLORS.ink, alignment: 1 });
  // mousse qui pend dessous
  for (let i = 0; i < 3; i++) {
    const x = r.x + 14 + rnd(r.x + i) * (r.w - 28);
    const len = 4 + rnd(r.x * 2 + i) * 7;
    g.moveTo(x - 4, r.y + r.h - 1).quadraticCurveTo(x, r.y + r.h + len, x + 4, r.y + r.h - 1).fill({ color: MOSS, alpha: 0.9 });
  }
  drawTuft(g, r.x + 8 + rnd(r.y) * (r.w - 16), r.y + 1, 0.6, r.y);
}

// ombre portee d'un objet pose au sol, vers la droite
function drawGroundShadow(g: Graphics, r: Rect): void {
  const b = r.y + r.h;
  g.poly([r.x, b, r.x + r.w + 26, b, r.x + r.w + 18, b + 7, r.x + 4, b + 7]).fill({ color: COLORS.shadow, alpha: 0.2 });
}

// bloc taille dans le marbre
function drawBlock(g: Graphics, r: Rect): void {
  g.rect(r.x, r.y, r.w, r.h).fill(hgrad([[0, COLORS.marbleLit], [0.25, COLORS.marble], [0.8, COLORS.marbleShade], [1, COLORS.marbleShadow]]));
  g.rect(r.x, r.y, r.w, 4).fill({ color: COLORS.marbleLit });
  g.rect(r.x + 4, r.y + 8, r.w - 8, r.h - 14).stroke({ width: 1, color: COLORS.marbleShade });
  drawCrack(g, r.x + r.w * 0.7, r.y + 4, r.h * 0.4, r.x);
  g.rect(r.x, r.y, r.w, r.h).stroke({ width: 1.5, color: COLORS.ink, alignment: 1 });
  drawTuft(g, r.x + 3, r.y + r.h, 1, r.x);
}

// tambour de colonne cannele (reste de colonne)
function drawDrum(g: Graphics, r: Rect): void {
  g.rect(r.x, r.y, r.w, r.h).fill(hgrad([[0, COLORS.marble], [0.18, COLORS.marbleLit], [0.45, COLORS.marble], [0.85, COLORS.marbleShade], [1, COLORS.marbleShadow]]));
  for (let i = 1; i < 7; i++) {
    const x = r.x + (i / 7) * r.w;
    g.rect(x - 1, r.y + 6, 2, r.h - 16).fill({ color: COLORS.marbleShadow, alpha: 0.35 + (i / 7) * 0.3 });
  }
  g.rect(r.x, r.y, r.w, 5).fill({ color: COLORS.marbleLit });
  g.rect(r.x, r.y + r.h * 0.45, r.w, 1.5).fill({ color: COLORS.marbleShadow });
  g.rect(r.x, r.y + r.h - 8, r.w, 8).fill(vgrad([[0, COLORS.marbleShade], [1, COLORS.marbleShadow]]));
  // eclat casse au coin haut droit
  g.poly([r.x + r.w - 12, r.y, r.x + r.w, r.y, r.x + r.w, r.y + 8]).fill({ color: COLORS.marbleShadow });
  g.rect(r.x, r.y, r.w, r.h).stroke({ width: 1.5, color: COLORS.ink, alignment: 1 });
  drawTuft(g, r.x + r.w - 4, r.y + r.h, 0.9, r.x);
}

// bloc de frise dorique tombe : triglyphes et metopes
function drawFrieze(g: Graphics, r: Rect): void {
  g.rect(r.x, r.y, r.w, r.h).fill(hgrad([[0, COLORS.marbleLit], [0.3, COLORS.marble], [1, COLORS.marbleShade]]));
  g.rect(r.x, r.y, r.w, 8).fill({ color: COLORS.marbleLit });
  g.rect(r.x, r.y + 8, r.w, 2).fill({ color: COLORS.marbleShadow, alpha: 0.7 });
  for (const tx of [r.x + 6, r.x + r.w / 2 - 7, r.x + r.w - 20]) {
    g.rect(tx, r.y + 14, 14, r.h - 22).fill({ color: COLORS.marbleShade });
    g.rect(tx + 3.5, r.y + 16, 2, r.h - 26).fill({ color: COLORS.marbleShadow });
    g.rect(tx + 8.5, r.y + 16, 2, r.h - 26).fill({ color: COLORS.marbleShadow });
  }
  g.rect(r.x, r.y + r.h - 6, r.w, 6).fill({ color: COLORS.marbleShadow, alpha: 0.5 });
  g.rect(r.x, r.y, r.w, r.h).stroke({ width: 1.5, color: COLORS.ink, alignment: 1 });
  drawTuft(g, r.x + 2, r.y + r.h, 1.1, r.x);
  drawTuft(g, r.x + r.w - 2, r.y + r.h, 0.8, r.x + 1);
}

export function createGround(): Part[] {
  const world = new Container();
  const g = new Graphics();
  const [ground, ...others] = MAPS['side-view'].solids;
  drawGround(g, ground);
  for (const r of others) {
    if (r.h > 20) drawGroundShadow(g, r);
    if (r.h <= 20) drawPlatform(g, r);
    else if (r.x > RUINS_X + 200) drawFrieze(g, r);
    else if (r.x > RUINS_X) drawDrum(g, r);
    else drawBlock(g, r);
  }
  world.addChild(g);
  return [{ layer: world, depth: 1 }];
}
