import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { ZoneInteractable } from '../data/zones';
import { COLORS } from '../scenes/palette';
import { BRONZE, BRONZE_LIT, BRONZE_SHADE, LINE, WOOD, shaded } from '../hero/look';

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  fromPlayer: boolean;
  life: number;
  color: number;
  style: 'arrow' | 'orb' | 'wave';
  piercing?: boolean;
  hitIds: Set<string>;
}

export interface SlashFx {
  x: number;
  y: number;
  angle: number;
  radius: number;
  color: number;
  life: number;
  maxLife: number;
  kind: 'arc' | 'ring' | 'bolt';
}

export interface FloatingTextItem {
  node: Text;
  vy: number;
  life: number;
  maxLife: number;
}

export function createCombatFxLayer() {
  const container = new Container();
  const gfx = new Graphics();
  const textLayer = new Container();
  container.addChild(gfx, textLayer);

  const projectiles: Projectile[] = [];
  const slashes: SlashFx[] = [];
  const texts: FloatingTextItem[] = [];

  const spawnText = (x: number, y: number, message: string, color: number, size = 13) => {
    const node = new Text({
      text: message,
      resolution: 3,
      style: new TextStyle({
        fontFamily: 'Cinzel, serif',
        fontSize: size,
        fontWeight: '700',
        fill: color,
        stroke: { color: COLORS.ink, width: 3.5, join: 'round' }
      })
    });
    node.anchor.set(0.5, 0.5);
    node.position.set(x, y);
    textLayer.addChild(node);
    texts.push({ node, vy: -36, life: 0.85, maxLife: 0.85 });
  };

  const spawnSlash = (x: number, y: number, angle: number, radius: number, color: number, kind: SlashFx['kind'] = 'arc') => {
    slashes.push({ x, y, angle, radius, color, life: kind === 'ring' ? 0.36 : 0.22, maxLife: kind === 'ring' ? 0.36 : 0.22, kind });
  };

  const spawnProjectile = (p: Omit<Projectile, 'hitIds'>) => {
    projectiles.push({ ...p, hitIds: new Set() });
  };

  const clear = () => {
    projectiles.length = 0;
    slashes.length = 0;
    for (const t of texts) t.node.destroy();
    texts.length = 0;
    gfx.clear();
  };

  const render = (dt: number) => {
    gfx.clear();

    for (let i = slashes.length - 1; i >= 0; i--) {
      const s = slashes[i];
      s.life -= dt;
      if (s.life <= 0) {
        slashes.splice(i, 1);
        continue;
      }
      const t = s.life / s.maxLife;
      if (s.kind === 'arc') {
        const span = 1.25;
        gfx.moveTo(s.x, s.y);
        gfx.arc(s.x, s.y, s.radius * (1.08 - t * 0.12), s.angle - span / 2, s.angle + span / 2);
        gfx.closePath().fill({ color: s.color, alpha: t * 0.32 });
        gfx.arc(s.x, s.y, s.radius, s.angle - span / 2, s.angle + span / 2)
          .stroke({ width: 4 * t + 1, color: s.color, alpha: t * 0.9, cap: 'round' });
      } else if (s.kind === 'ring') {
        const r = s.radius * (1.15 - t * 0.65);
        gfx.circle(s.x, s.y, r).fill({ color: s.color, alpha: t * 0.22 });
        gfx.circle(s.x, s.y, r).stroke({ width: 4.5 * t + 1, color: s.color, alpha: t * 0.9 });
      } else {
        gfx.moveTo(s.x, s.y - 160).lineTo(s.x - 10, s.y - 80).lineTo(s.x + 8, s.y - 40).lineTo(s.x, s.y)
          .stroke({ width: 5 * t, color: COLORS.sun, alpha: t });
        gfx.circle(s.x, s.y, s.radius * (1.1 - t * 0.4)).stroke({ width: 3 * t, color: s.color, alpha: t });
      }
    }

    for (const p of projectiles) {
      if (p.style === 'arrow') {
        const a = Math.atan2(p.vy, p.vx);
        const cx = Math.cos(a);
        const sy = Math.sin(a);
        gfx.moveTo(p.x - cx * 10, p.y - sy * 10).lineTo(p.x + cx * 8, p.y + sy * 8)
          .stroke({ width: 2.2, color: WOOD, cap: 'round' });
        gfx.circle(p.x + cx * 8, p.y + sy * 8, 2.6).fill({ color: BRONZE_LIT });
      } else if (p.style === 'wave') {
        gfx.ellipse(p.x, p.y, 16, 22).fill({ color: COLORS.seaLight, alpha: 0.72 });
        gfx.ellipse(p.x, p.y - 6, 12, 12).fill({ color: COLORS.foam, alpha: 0.85 });
        gfx.ellipse(p.x, p.y, 16, 22).stroke({ width: 1.8, color: COLORS.ink });
      } else {
        gfx.circle(p.x, p.y, p.radius + 4).fill({ color: p.color, alpha: 0.28 });
        gfx.circle(p.x, p.y, p.radius).fill({ color: p.color });
        gfx.circle(p.x, p.y, p.radius * 0.5).fill({ color: COLORS.sun });
      }
    }

    for (let i = texts.length - 1; i >= 0; i--) {
      const item = texts[i];
      item.life -= dt;
      item.node.y += item.vy * dt;
      item.vy *= 0.94;
      item.node.alpha = Math.max(0, item.life / item.maxLife);
      if (item.life <= 0) {
        item.node.destroy();
        texts.splice(i, 1);
      }
    }
  };

  return {
    container,
    projectiles,
    spawnText,
    spawnSlash,
    spawnProjectile,
    clear,
    render
  };
}

export interface InteractableSprite {
  def: ZoneInteractable;
  container: Container;
  update: (time: number, done: boolean, nearPlayer: boolean) => void;
}

export function createInteractableSprite(def: ZoneInteractable): InteractableSprite {
  const container = new Container();
  container.position.set(def.x, def.y);

  const ring = new Graphics();
  const base = new Graphics();
  const glow = new Graphics();
  const label = new Text({
    text: def.label,
    resolution: 3,
    style: new TextStyle({
      fontFamily: 'Outfit, sans-serif',
      fontSize: 9,
      fontWeight: '700',
      fill: COLORS.gold,
      stroke: { color: COLORS.ink, width: 2.6, join: 'round' }
    })
  });
  label.anchor.set(0.5, 1);
  label.y = -24;

  if (def.kind === 'brasero') {
    base.circle(0, 0, 18).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 1.8 });
    base.circle(0, 0, 12).fill({ color: 0x3b1f14 });
    label.y = -26;
  } else if (def.kind === 'bronze') {
    base.poly([-9, 4, -3, -7, 8, -3, 10, 6, -2, 8]).fill(shaded(BRONZE_LIT, BRONZE)).stroke(LINE);
    base.poly([-4, 1, 2, -4, 5, 2]).fill({ color: COLORS.gold, alpha: 0.7 });
  } else if (def.kind === 'herb') {
    for (const a of [-0.7, 0, 0.7]) {
      base.ellipse(Math.sin(a) * 6, -Math.cos(a) * 4, 3.5, 7).fill({ color: COLORS.olive }).stroke({ ...LINE, width: 0.8 });
    }
    base.circle(0, -6, 3.5).fill({ color: COLORS.gold });
  } else if (def.kind === 'stele' || def.kind === 'trial_stele') {
    const h = def.kind === 'trial_stele' ? 38 : 34;
    base.roundRect(-10, -h, 20, h, 3).fill(shaded(COLORS.marbleLit, COLORS.marbleShade)).stroke({ ...LINE, width: 1.6 });
    base.rect(-13, -6, 26, 7).fill(COLORS.marbleShade).stroke(LINE);
    base.moveTo(0, -h + 8).lineTo(0, -10).stroke({ width: 2, color: COLORS.gold });
    label.y = -h - 8;
  }

  container.addChild(ring, base, glow, label);

  return {
    def,
    container,
    update: (time, done, nearPlayer) => {
      if ((def.kind === 'bronze' || def.kind === 'herb') && done) {
        container.visible = false;
        return;
      }
      container.visible = true;
      glow.clear();
      ring.clear();

      if (def.kind === 'brasero') {
        const flameR = done ? 11 + Math.sin(time * 9) * 2.5 : 5 + Math.sin(time * 4) * 1.2;
        glow.circle(0, 0, flameR * 1.9).fill({ color: 0xf97316, alpha: done ? 0.34 : 0.14 });
        glow.circle(0, 0, flameR).fill({ color: done ? 0xf97316 : 0xb45309, alpha: 0.9 });
        glow.circle(0, 0, flameR * 0.55).fill({ color: 0xfef08a });
      } else if (def.kind === 'trial_stele') {
        const activeColor = done ? 0xf97316 : COLORS.gold;
        glow.circle(0, -24, done ? 18 + Math.sin(time * 7) * 3 : 11 + Math.sin(time * 3) * 2)
          .fill({ color: activeColor, alpha: done ? 0.42 : 0.2 });
        glow.circle(0, -24, done ? 7 : 4).fill({ color: done ? 0xfef08a : COLORS.sun });
      } else {
        const pulse = 0.5 + 0.5 * Math.sin(time * 4.5 + def.x);
        glow.circle(0, -4, 12 + pulse * 4).fill({ color: COLORS.gold, alpha: 0.14 + pulse * 0.14 });
      }

      if (nearPlayer && !done) {
        ring.circle(0, def.kind === 'trial_stele' ? -14 : 0, 22 + Math.sin(time * 6) * 2)
          .stroke({ width: 1.8, color: COLORS.gold, alpha: 0.85 });
      }
      label.visible = nearPlayer || (!done && (def.kind === 'brasero' || def.kind === 'stele' || def.kind === 'trial_stele'));
    }
  };
}
