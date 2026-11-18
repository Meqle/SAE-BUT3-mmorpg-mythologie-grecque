// portes de la vue du dessus : un puits de lumiere divine doree qu'on traverse (vu d'en haut)
// au sol : un cercle de laurier dore ; au-dessus : halo qui respire, onde de lumiere, poussieres d'or
import { Container, FillGradient, Graphics } from 'pixi.js';
import type { Portal } from '@greek-myth/shared';
import { COLORS } from '../palette';
import { drawLaurel } from '../shapes';

const LIGHT = 0xfff4cf;

export interface Gate {
  floor: Container; // dessin au sol (sous les joueurs)
  light: Container; // lumiere (au-dessus des joueurs, en mode "add")
  update: (time: number) => void;
}

// disque lumineux qui s'efface vers l'exterieur
function glow(radius: number, color: number, alpha: number): Graphics {
  const fill = new FillGradient({
    type: 'radial',
    center: { x: 0.5, y: 0.5 },
    innerRadius: 0,
    outerCenter: { x: 0.5, y: 0.5 },
    outerRadius: 0.5,
    colorStops: [
      { offset: 0, color: `rgba(${color >> 16},${(color >> 8) & 255},${color & 255},${alpha})` },
      { offset: 0.45, color: `rgba(${color >> 16},${(color >> 8) & 255},${color & 255},${alpha * 0.45})` },
      { offset: 1, color: `rgba(${color >> 16},${(color >> 8) & 255},${color & 255},0)` }
    ],
    textureSpace: 'local'
  });
  return new Graphics().circle(0, 0, radius).fill(fill);
}

export function createGate(portal: Portal): Gate {
  const cx = portal.x + portal.w / 2;
  const cy = portal.y + portal.h / 2;
  // la lumiere deborde dans l'ouverture du muret, vers l'exterieur
  const out = cx < 480 ? -1 : 1;

  const floor = new Container();
  floor.position.set(cx, cy);
  const mark = new Graphics();
  // lueur doree sur les dalles et les marches
  mark.ellipse(out * 18, 0, 64, 46).fill({ color: COLORS.gold, alpha: 0.18 });
  mark.ellipse(out * 8, 0, 46, 36).fill({ color: COLORS.gold, alpha: 0.18 });
  // cercle de laurier dore incruste dans le sol
  mark.circle(0, 0, 33).stroke({ width: 1.5, color: COLORS.gold, alpha: 0.9 });
  drawLaurel(mark, 0, 0, 27, 0xd9a93f);
  mark.circle(0, 0, 19).fill({ color: COLORS.gold, alpha: 0.35 });
  mark.circle(0, 0, 19).stroke({ width: 1.2, color: COLORS.gold });
  floor.addChild(mark);

  const light = new Container();
  light.position.set(cx, cy);
  light.blendMode = 'add';
  const halo = glow(84, COLORS.gold, 0.32);
  const core = glow(30, LIGHT, 0.28);
  const wave = new Graphics().circle(0, 0, 30).stroke({ width: 3, color: COLORS.gold });
  light.addChild(halo, wave, core);

  // poussieres d'or qui tournent et montent vers nous (grossissent puis s'effacent)
  const motes: Graphics[] = [];
  for (let i = 0; i < 18; i++) {
    const m = new Graphics().circle(0, 0, 1.6).fill({ color: LIGHT });
    light.addChild(m);
    motes.push(m);
  }

  const update = (time: number) => {
    const pulse = Math.sin(time * 2.2);
    halo.scale.set(1 + 0.06 * pulse);
    halo.alpha = 0.75 + 0.25 * pulse;
    core.scale.set(1 + 0.12 * Math.sin(time * 3.1));
    const w = (time * 0.6) % 1;
    wave.scale.set(0.5 + w * 1.4);
    wave.alpha = (1 - w) * 0.7;
    motes.forEach((m, i) => {
      const life = (time * 0.35 + i / motes.length) % 1;
      const a = i * 2.4 + time * 0.8 + life * 1.5;
      const r = 8 + ((i * 7) % 26) + life * 10;
      m.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.9 - life * 10);
      m.scale.set(0.6 + life * 1.4);
      m.alpha = Math.sin(life * Math.PI) * 0.9;
    });
  };
  return { floor, light, update };
}
