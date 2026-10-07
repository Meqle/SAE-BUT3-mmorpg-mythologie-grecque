// decor de la vue de profil : bord de mer avec un temple au loin
// marbre + contour bleu nuit = on peut marcher dessus ; ciel, mer, ile et oliviers du fond = decor
import { Container, Graphics } from 'pixi.js';
import { placeLayer, View } from '../camera';
import type { Scene } from '.';
import { MAPS } from '@greek-myth/shared';
import { COLORS } from './palette';
import { drawGateSide } from './gates';
import { drawFrame, drawMeander, drawSlab } from './props';

const HORIZON = 330;
const SKY_BANDS = 12;

// melange de deux couleurs (t = 0 -> a, t = 1 -> b)
function mix(a: number, b: number, t: number): number {
  const channel = (shift: number) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t);
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}

// ile au loin (moitie d'ellipse posee sur l'horizon) avec un temple : colonnes et fronton
function drawFarIsland(g: Graphics, x: number): void {
  const hill = [];
  for (let i = 0; i <= 20; i++) {
    const a = Math.PI + (i / 20) * Math.PI;
    hill.push(x + Math.cos(a) * 140, HORIZON + Math.sin(a) * 34);
  }
  g.poly(hill);
  g.fill({ color: mix(COLORS.far, COLORS.sea, 0.25) });
  const y = HORIZON - 26;
  g.rect(x - 50, y - 6, 100, 6);
  for (let i = 0; i < 5; i++) g.rect(x - 42 + i * 20, y - 36, 6, 30);
  g.rect(x - 47, y - 42, 94, 6);
  g.poly([x - 50, y - 42, x, y - 60, x + 50, y - 42]);
  g.fill({ color: COLORS.far });
}

// olivier du fond : tronc et feuillage pales
function drawFarOlive(g: Graphics, x: number, ground: number): void {
  g.rect(x - 4, ground - 70, 8, 70);
  g.fill({ color: COLORS.far });
  for (const [dx, dy, r] of [[0, -90, 30], [-26, -76, 22], [26, -78, 22]]) g.circle(x + dx, ground + dy, r);
  g.fill({ color: mix(COLORS.olive, COLORS.sky, 0.55) });
}

function drawSideView(background: Graphics, decor: Graphics, glow: Graphics): void {
  const map = MAPS['side-view'];
  const ground = map.solids[0];

  // ciel en degrade (bandes) puis mer jusqu'au sol
  drawFrame(background, map.width, map.height);
  for (let i = 0; i < SKY_BANDS; i++) {
    const h = HORIZON / SKY_BANDS;
    background.rect(0, i * h, map.width, h + 1);
    background.fill({ color: mix(COLORS.sky, COLORS.foam, i / (SKY_BANDS - 1)) });
  }
  background.rect(0, HORIZON, map.width, ground.y - HORIZON);
  background.fill({ color: COLORS.sea });
  for (let y = HORIZON + 14; y < ground.y; y += 22) {
    for (let x = ((y / 22) % 2) * 40; x < map.width; x += 80) background.moveTo(x, y).lineTo(x + 26, y);
  }
  background.stroke({ width: 2, color: COLORS.seaLight });

  // nuages, ile avec son temple, oliviers
  for (const [x, y] of [[150, 70], [470, 120], [800, 80]]) {
    background.ellipse(x, y, 46, 14);
    background.ellipse(x + 30, y - 8, 30, 14);
    background.ellipse(x - 26, y - 4, 24, 10);
  }
  background.fill({ color: COLORS.cloud, alpha: 0.85 });
  drawFarIsland(background, 820);
  drawFarOlive(decor, 360, ground.y);
  drawFarOlive(decor, 760, ground.y);

  // sol, plateformes et bloc en marbre ; frise bleue sur le devant du sol
  for (const solid of map.solids) drawSlab(decor, solid);
  for (let x = ground.x + 96; x < ground.x + ground.w; x += 96) decor.moveTo(x, ground.y + 2).lineTo(x, ground.y + 14);
  decor.stroke({ width: 1, color: COLORS.marbleShade });
  drawMeander(decor, ground.x + 8, ground.y + 22, ground.w - 16, 4, COLORS.ink);

  for (const portal of map.portals) drawGateSide(glow, portal);
}

// version provisoire : une seule couche
export function createSideView(): Scene {
  const back = new Container();
  const background = new Graphics();
  const decor = new Graphics();
  const glow = new Graphics();
  back.addChild(background, decor, glow);
  drawSideView(background, decor, glow);
  return {
    back,
    front: new Container(),
    update: (view: View, time: number) => {
      placeLayer(back, view);
      glow.alpha = 0.75 + 0.25 * Math.sin(time * 2.5);
    }
  };
}
