// ciel de fin d'apres-midi : degrade azur -> peche, halo du soleil bas a gauche, nuages qui derivent
import { Container, Graphics } from 'pixi.js';
import { COLORS, mix } from '../palette';
import { band, glow, Part, rnd } from './draw';

// soleil fixe a l'ecran (couche de profondeur 0)
export const SUN_X = 200;
export const SUN_Y = 172;
const CLOUD_SPAN = 1500; // les nuages se repetent tous les 1500 px

const CLOUD_SHADE = 0xd4c8d6; // dessous des nuages, mauve
const CLOUD_LIT = 0xfffbf3;

function drawSky(g: Graphics): void {
  band(g, [
    [-100, 0x2c5ea6],
    [40, 0x3f74bb],
    [150, 0x7fb3df],
    [225, 0xbcd7e4],
    [265, 0xf0dcc0],
    [300, COLORS.skyHorizon],
    [340, 0xf6c993],
    [640, 0xf6c993]
  ]);
  // halo du soleil : grand voile chaud puis coeur lumineux, pas de rayons
  glow(g, SUN_X, SUN_Y, 900, 420, 0xffd9a0, 0.45);
  glow(g, SUN_X, SUN_Y, 320, 220, 0xffe7b8, 0.6);
  glow(g, SUN_X, SUN_Y, 90, 90, 0xfff3d6, 0.9);
  g.circle(SUN_X, SUN_Y, 22).fill({ color: 0xfffbea });
}

// un nuage : base plate a l'ombre, bosses eclairees par le haut a gauche
function drawCloud(g: Graphics, x: number, y: number, w: number, seed: number, haze: number): void {
  const n = 4 + Math.floor(w / 40);
  const shade = mix(CLOUD_SHADE, COLORS.skyHorizon, haze);
  const lit = mix(CLOUD_LIT, COLORS.sky, haze * 0.6);
  g.ellipse(x, y, w * 0.55, w * 0.07).fill({ color: shade });
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const r = (w * 0.1 + rnd(seed + i) * w * 0.07) * (1 - Math.abs(t - 0.4) * 0.9);
    g.circle(x - w * 0.45 + t * w * 0.9 + 3, y - r * 0.55 + 3, r).fill({ color: shade });
  }
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const r = (w * 0.1 + rnd(seed + i) * w * 0.07) * (1 - Math.abs(t - 0.4) * 0.9);
    g.circle(x - w * 0.45 + t * w * 0.9, y - r * 0.55, r * 0.92).fill({ color: lit });
  }
}

function drawClouds(g: Graphics): void {
  for (let i = 0; i < 6; i++) {
    const x = (i / 6) * CLOUD_SPAN + rnd(i * 7) * 140;
    const y = 40 + rnd(i * 3) * 90;
    drawCloud(g, x, y, 70 + rnd(i * 5) * 120, i * 11, (y - 30) / 160);
  }
  // voiles fins et flous pres de l'horizon
  for (let i = 0; i < 8; i++) {
    const x = rnd(i * 13 + 1) * CLOUD_SPAN;
    glow(g, x, 150 + rnd(i * 17) * 70, 160 + rnd(i) * 140, 9 + rnd(i * 2) * 6, 0xfff4e4, 0.5);
  }
}

export function createSky(): Part[] {
  const sky = new Container();
  const g = new Graphics();
  drawSky(g);
  sky.addChild(g);

  // nuages : deux copies cote a cote qui glissent lentement
  const clouds = new Container();
  const a = new Graphics();
  drawClouds(a);
  const b = new Graphics(a.context);
  const c = new Graphics(a.context);
  const drift = new Container();
  drift.addChild(a, b, c);
  b.x = CLOUD_SPAN;
  c.x = -CLOUD_SPAN;
  clouds.addChild(drift);

  return [
    { layer: sky, depth: 0 },
    {
      layer: clouds,
      depth: 0.06,
      animate: (time) => {
        drift.x = (time * 4) % CLOUD_SPAN;
      }
    }
  ];
}
