// ambiance devant les joueurs : pollen dore, feuilles d'olivier qui tombent, herbes floues au premier plan
import { BlurFilter, Container, Graphics } from 'pixi.js';
import { COLORS, mix } from '../palette';
import { glow, Part, rnd } from './draw';
import { SUN_X, SUN_Y } from './sky';

const MOTES = 36;
const LEAVES = 9;
const SPAN_X = 1800;
const FRONT = 0x2b3a22; // feuillage sombre du premier plan

// grains de lumiere qui flottent
function createMotes(): Part {
  const layer = new Container();
  layer.blendMode = 'add';
  const motes: Graphics[] = [];
  for (let i = 0; i < MOTES; i++) {
    const m = new Graphics();
    m.circle(0, 0, 3).fill({ color: 0xffd98a, alpha: 0.25 });
    m.circle(0, 0, 1 + rnd(i) * 0.8).fill({ color: 0xfff6d8, alpha: 0.9 });
    motes.push(m);
  }
  layer.addChild(...motes);
  return {
    layer,
    depth: 0.95,
    animate: (time) =>
      motes.forEach((m, i) => {
        const t = time * (0.01 + rnd(i * 2) * 0.012) + rnd(i * 5);
        m.x = -100 + ((rnd(i) * SPAN_X + time * 6) % SPAN_X) + Math.sin(time * 0.7 + i) * 10;
        m.y = 540 - (t % 1) * 560 + Math.sin(time * 1.3 + i * 2) * 6;
        m.alpha = 0.3 + 0.7 * Math.abs(Math.sin(time * (0.8 + rnd(i * 3)) + i));
      })
  };
}

// feuilles qui descendent en se balancant
function createLeaves(): Part {
  const layer = new Container();
  const leaves: Graphics[] = [];
  for (let i = 0; i < LEAVES; i++) {
    const l = new Graphics();
    l.ellipse(0, 0, 4.5, 1.6).fill({ color: i % 2 ? 0x8f9a5e : 0xb9bf94 });
    l.rect(-1, -0.3, 2.5, 0.6).fill({ color: COLORS.oliveDark });
    leaves.push(l);
  }
  layer.addChild(...leaves);
  return {
    layer,
    depth: 1,
    animate: (time) =>
      leaves.forEach((l, i) => {
        const t = (time * (0.03 + rnd(i * 4) * 0.02) + rnd(i * 9)) % 1;
        l.x = -100 + rnd(i * 6) * SPAN_X + t * 160 + Math.sin(time * 1.2 + i) * 18;
        l.y = -20 + t * 520;
        l.rotation = Math.sin(time * 2 + i * 3) * 1.1;
        l.alpha = Math.min(1, (1 - t) * 6);
      })
  };
}

// herbes et fleurs sombres et floues tout en bas de l'ecran
function drawClump(g: Graphics, x: number, base: number, s: number, seed: number): void {
  for (let i = 0; i < 9; i++) {
    const dx = (i - 4) * 4 * s;
    const h = (24 + rnd(seed + i) * 26) * s;
    const lean = (rnd(seed * 3 + i) - 0.5) * 18 * s;
    g.moveTo(x + dx - 3 * s, base)
      .quadraticCurveTo(x + dx + lean * 0.2, base - h * 0.6, x + dx + lean, base - h)
      .quadraticCurveTo(x + dx + lean * 0.4, base - h * 0.5, x + dx + 3 * s, base)
      .fill({ color: mix(FRONT, COLORS.shadow, (i % 3) * 0.2) });
  }
  // une ou deux fleurs (coquelicot, camomille)
  if (rnd(seed) > 0.4) {
    const fx = x + (rnd(seed * 7) - 0.5) * 20 * s;
    const fy = base - (34 + rnd(seed * 5) * 14) * s;
    g.moveTo(fx, base).lineTo(fx + 2, fy).stroke({ width: 1.5 * s, color: FRONT });
    g.circle(fx + 2, fy, 4 * s).fill({ color: rnd(seed * 11) > 0.5 ? 0xb8402e : 0xf2ead2 });
    g.circle(fx + 2, fy, 1.4 * s).fill({ color: 0x3a2a1a });
  }
}

function createFront(): Part {
  const layer = new Container();
  const g = new Graphics();
  for (let x = -250; x < 2300; x += 230 + rnd(x) * 260) drawClump(g, x, 575, 0.9 + rnd(x * 2) * 0.5, x);
  g.filters = [new BlurFilter({ strength: 2.5, quality: 3 })];
  layer.addChild(g);
  return { layer, depth: 1.25 };
}

// voile de lumiere doree venant du soleil (fixe a l'ecran) + coins un peu assombris
function createLight(): Part {
  const layer = new Container();
  const light = new Graphics();
  glow(light, SUN_X, SUN_Y - 40, 1100, 700, 0xffc970, 0.16);
  light.blendMode = 'add';
  const shade = new Graphics();
  glow(shade, 1600, 640, 1400, 500, COLORS.shadow, 0.2);
  layer.addChild(shade, light);
  return { layer, depth: 0 };
}

export function createAmbient(): Part[] {
  return [createMotes(), createLeaves(), createFront(), createLight()];
}
