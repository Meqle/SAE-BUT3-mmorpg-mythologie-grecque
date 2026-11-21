// portes : passages de lumiere divine doree qu'on traverse (pas de pierre), laurier d'or au-dessus
import { Container, Graphics } from 'pixi.js';
import { MAPS } from '@greek-myth/shared';
import { COLORS } from '../palette';
import { drawLaurel } from '../shapes';
import { glow, Part, rnd, vgrad } from './draw';

const LIGHT = 0xfff3c8;
const GOLD_DARK = 0xa87a26;
const SPARKS = 18;

type Gate = { halo: Graphics; beam: Graphics; laurel: Graphics; sparks: Graphics[]; x: number; y: number; w: number; h: number };

// colonne de lumiere en arc (haut arrondi), plus forte en bas
function drawBeam(g: Graphics, cx: number, top: number, bottom: number, half: number, color: number, alpha: number): void {
  g.moveTo(cx - half, bottom)
    .lineTo(cx - half, top + half)
    .arc(cx, top + half, half, Math.PI, 0)
    .lineTo(cx + half, bottom)
    .closePath()
    .fill(vgrad([[top, color, 0], [top + half + 10, color, alpha * 0.55], [bottom, color, alpha]]));
}

function createGate(x: number, y: number, w: number, h: number): Gate {
  const cx = x + w / 2;
  const bottom = y + h;

  // lumiere additive : halo, rayon venu du ciel, sol illumine
  const halo = new Graphics();
  halo.rect(cx - w * 0.3, bottom - 420, w * 0.6, 420).fill(vgrad([[0, COLORS.gold, 0], [0.7, COLORS.gold, 0.1], [1, COLORS.gold, 0.22]]));
  glow(halo, cx, bottom - h * 0.45, w * 1.4, h * 1.0, COLORS.gold, 0.28);
  glow(halo, cx, bottom + 2, w * 1.3, 14, COLORS.gold, 0.5);

  // arche de lumiere (melange normal pour garder la couleur doree)
  const beam = new Graphics();
  drawBeam(beam, cx, y + 2, bottom, w / 2 - 2, COLORS.gold, 0.5);
  drawBeam(beam, cx, y + 14, bottom, w / 3, 0xffe08a, 0.45);
  drawBeam(beam, cx, y + 30, bottom, w / 7, LIGHT, 0.75);
  for (let i = 0; i < 6; i++) {
    const rx = x + 8 + i * ((w - 16) / 5);
    const top = y + 24 + rnd(i + x) * 22;
    beam.rect(rx, top, 1.3, bottom - top).fill(vgrad([[0, LIGHT, 0], [1, LIGHT, 0.7]]));
  }
  beam.ellipse(cx, bottom, w / 2, 3.5).fill({ color: LIGHT, alpha: 0.85 });

  // laurier d'or qui flotte au-dessus
  const laurel = new Graphics();
  drawLaurel(laurel, 0.8, 1.2, 13, GOLD_DARK);
  drawLaurel(laurel, 0, 0, 13, COLORS.gold);
  laurel.position.set(cx, y - 10);

  const sparks: Graphics[] = [];
  for (let i = 0; i < SPARKS; i++) {
    const s = new Graphics();
    s.circle(0, 0, 3).fill({ color: COLORS.gold, alpha: 0.4 });
    s.circle(0, 0, 1 + rnd(i) * 0.8).fill({ color: 0xfffbe6 });
    sparks.push(s);
  }
  return { halo, beam, laurel, sparks, x, y, w, h };
}

export function createGates(): Part[] {
  const glowLayer = new Container();
  glowLayer.blendMode = 'add';
  const shapeLayer = new Container();
  const gates = MAPS['side-view'].portals.map((p) => createGate(p.x, p.y, p.w, p.h));
  for (const gate of gates) {
    glowLayer.addChild(gate.halo, ...gate.sparks);
    shapeLayer.addChild(gate.beam, gate.laurel);
  }

  const animate = (time: number) => {
    gates.forEach((gate, k) => {
      gate.halo.alpha = 0.75 + 0.25 * Math.sin(time * 2.2 + k);
      gate.beam.alpha = 0.85 + 0.15 * Math.sin(time * 3.1 + k);
      gate.laurel.y = gate.y - 10 + Math.sin(time * 1.6 + k) * 2;
      gate.laurel.rotation = Math.sin(time * 0.9 + k) * 0.05;
      gate.sparks.forEach((s, i) => {
        const t = (time * (0.25 + rnd(i * 3) * 0.2) + rnd(i + k * 50)) % 1;
        s.x = gate.x + 6 + rnd(i * 7 + k) * (gate.w - 12) + Math.sin(time * 2 + i) * 3;
        s.y = gate.y + gate.h - t * (gate.h + 10);
        s.alpha = Math.sin(t * Math.PI);
      });
    });
  };
  return [
    { layer: glowLayer, depth: 1 },
    { layer: shapeLayer, depth: 1, animate }
  ];
}
