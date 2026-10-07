// petits nuages de poussiere doree quand le joueur marche, saute ou atterrit
import { Graphics } from 'pixi.js';
import { COLORS, mix } from './scenes/palette';

const DUST = mix(COLORS.sand, COLORS.bronze, 0.3); // beige dore
const DUST_LIT = mix(COLORS.sun, COLORS.sand, 0.3);
const MAX_PUFFS = 90;

interface Puff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  spark: boolean; // petite paillette doree
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function createDust() {
  const puffs: Puff[] = [];
  const graphics = new Graphics();

  const add = (x: number, y: number, vx: number, vy: number, size: number, life: number, spark = false) => {
    if (puffs.length >= MAX_PUFFS) puffs.shift();
    puffs.push({ x, y, vx, vy, size, life, maxLife: life, spark });
  };

  return {
    graphics,
    // un peu de poussiere derriere les pieds
    trail: (x: number, y: number) => {
      if (Math.random() < 0.3) add(x + rand(-5, 5), y - 1, rand(-0.3, 0.3), rand(-0.3, -0.12), rand(1.6, 2.4), Math.round(rand(24, 34)));
    },
    // nuage qui part sur les cotes (saut, atterrissage) avec quelques paillettes
    burst: (x: number, y: number) => {
      for (let i = 0; i < 12; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        add(x + dir * rand(3, 7), y - 1, dir * rand(0.7, 2.2), rand(-0.6, -0.05), rand(1.8, 3), Math.round(rand(26, 38)));
      }
      for (let i = 0; i < 3; i++) add(x + rand(-8, 8), y - 2, rand(-0.4, 0.4), rand(-0.9, -0.4), 0.8, 30, true);
    },
    // efface tout (changement de vue)
    clear: () => {
      puffs.length = 0;
      graphics.clear();
    },
    update: () => {
      graphics.clear();
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.92;
        p.vy *= 0.97;
        p.life--;
        if (p.life <= 0) {
          puffs.splice(i, 1);
          continue;
        }
        const t = p.life / p.maxLife; // 1 -> 0
        if (p.spark) {
          graphics.circle(p.x, p.y, p.size).fill({ color: COLORS.gold, alpha: t * 0.9 });
          graphics.circle(p.x, p.y, p.size * 2.2).fill({ color: COLORS.sun, alpha: t * 0.25 });
          continue;
        }
        const r = p.size * (1 + (1 - t) * 1.6);
        const alpha = Math.min(1, t * 1.6) * 0.4;
        graphics.circle(p.x, p.y, r * 1.5).fill({ color: DUST, alpha: alpha * 0.3 }); // halo doux
        graphics.circle(p.x, p.y, r).fill({ color: DUST, alpha });
        graphics.circle(p.x - r * 0.25, p.y - r * 0.25, r * 0.55).fill({ color: DUST_LIT, alpha: alpha * 0.8 });
      }
    }
  };
}
