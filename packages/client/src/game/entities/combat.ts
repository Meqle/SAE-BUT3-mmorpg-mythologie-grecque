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
  style: 'arrow' | 'orb' | 'wave' | 'feather' | 'fireball' | 'venom';
  piercing?: boolean;
  hitIds: Set<string>;
}

export interface HazardZone {
  x: number;
  y: number;
  radius: number;
  delay: number;
  maxDelay: number;
  damage: number;
  color: number;
  triggered: boolean;
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

export interface GroundLootDrop {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  itemId: string;
  label: string;
  rarity: 'commun' | 'rare' | 'epique' | 'legendaire';
  color: number;
  life: number;
  age: number;
  node: Text;
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
  const hazards: HazardZone[] = [];
  const slashes: SlashFx[] = [];
  const texts: FloatingTextItem[] = [];
  const lootDrops: GroundLootDrop[] = [];
  let nextLootId = 1;

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

  const spawnHazard = (x: number, y: number, radius: number, delay: number, damage: number, color: number = COLORS.seaLight) => {
    hazards.push({ x, y, radius, delay, maxDelay: delay, damage, color, triggered: false });
  };

  const spawnLootDrop = (
    x: number,
    y: number,
    itemId: string,
    label: string,
    rarity: 'commun' | 'rare' | 'epique' | 'legendaire',
    color: number
  ) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 55 + Math.random() * 45;
    const node = new Text({
      text: label,
      resolution: 3,
      style: new TextStyle({
        fontFamily: 'Outfit, sans-serif',
        fontSize: rarity === 'legendaire' ? 11.5 : 10,
        fontWeight: '700',
        fill: color,
        stroke: { color: COLORS.ink, width: 3, join: 'round' }
      })
    });
    node.anchor.set(0.5, 1);
    node.position.set(x, y - 16);
    textLayer.addChild(node);
    lootDrops.push({
      id: nextLootId++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      itemId,
      label,
      rarity,
      color,
      life: 45,
      age: 0,
      node
    });
  };

  const collectNearbyLoot = (px: number, py: number, radius = 40): GroundLootDrop[] => {
    const picked: GroundLootDrop[] = [];
    for (let i = lootDrops.length - 1; i >= 0; i--) {
      const drop = lootDrops[i];
      if (drop.age < 0.32) continue;
      if (Math.hypot(drop.x - px, drop.y - py) <= radius) {
        drop.node.destroy();
        picked.push(drop);
        lootDrops.splice(i, 1);
      }
    }
    return picked;
  };

  const clear = () => {
    projectiles.length = 0;
    hazards.length = 0;
    slashes.length = 0;
    for (const t of texts) t.node.destroy();
    texts.length = 0;
    gfx.clear();
  };

  const render = (dt: number) => {
    gfx.clear();

    for (const h of hazards) {
      const progress = 1 - Math.max(0, h.delay / h.maxDelay);
      gfx.circle(h.x, h.y, h.radius).fill({ color: h.color, alpha: 0.14 + progress * 0.2 });
      gfx.circle(h.x, h.y, h.radius * progress).stroke({ width: 2, color: COLORS.sun, alpha: 0.85 });
      gfx.circle(h.x, h.y, h.radius).stroke({ width: 1.8, color: h.color, alpha: 0.9 });
    }

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
        gfx.moveTo(s.x, s.y - 180).lineTo(s.x - 10, s.y - 90).lineTo(s.x + 8, s.y - 45).lineTo(s.x, s.y)
          .stroke({ width: 5.5 * t, color: COLORS.sun, alpha: t });
        gfx.circle(s.x, s.y, s.radius * (1.1 - t * 0.4)).stroke({ width: 3 * t, color: s.color, alpha: t });
      }
    }

    for (const p of projectiles) {
      if (p.style === 'arrow') {
        const a = Math.atan2(p.vy, p.vx);
        const cx = Math.cos(a);
        const sy = Math.sin(a);
        gfx.moveTo(p.x - cx * 11, p.y - sy * 11).lineTo(p.x + cx * 8, p.y + sy * 8)
          .stroke({ width: 2.2, color: WOOD, cap: 'round' });
        gfx.circle(p.x + cx * 8, p.y + sy * 8, 2.7).fill({ color: BRONZE_LIT });
      } else if (p.style === 'feather') {
        const a = Math.atan2(p.vy, p.vx);
        const cx = Math.cos(a);
        const sy = Math.sin(a);
        const px = -sy;
        const py = cx;
        gfx.poly([
          p.x + cx * 10, p.y + sy * 10,
          p.x - cx * 4 + px * 4, p.y - sy * 4 + py * 4,
          p.x - cx * 10, p.y - sy * 10,
          p.x - cx * 4 - px * 4, p.y - sy * 4 - py * 4
        ]).fill({ color: 0x38bdf8 }).stroke({ width: 1, color: COLORS.ink });
      } else if (p.style === 'venom') {
        gfx.circle(p.x, p.y, p.radius + 3).fill({ color: 0x22c55e, alpha: 0.35 });
        gfx.circle(p.x, p.y, p.radius).fill({ color: 0x4ade80 }).stroke(LINE);
        gfx.circle(p.x - 1.5, p.y - 1.5, p.radius * 0.4).fill({ color: 0xfef08a });
      } else if (p.style === 'fireball') {
        gfx.circle(p.x, p.y, p.radius + 4).fill({ color: 0xea580c, alpha: 0.35 });
        gfx.circle(p.x, p.y, p.radius).fill({ color: 0xf97316 }).stroke({ width: 1.2, color: COLORS.ink });
        gfx.circle(p.x, p.y, p.radius * 0.5).fill({ color: 0xfef08a });
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

    for (let i = lootDrops.length - 1; i >= 0; i--) {
      const d = lootDrops[i];
      d.age += dt;
      d.life -= dt;
      if (d.age < 0.36) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vx *= 0.88;
        d.vy *= 0.88;
      }
      if (d.life <= 0) {
        d.node.destroy();
        lootDrops.splice(i, 1);
        continue;
      }
      const bob = Math.sin(d.age * 5 + d.id) * 2.5;
      const bounce = d.age < 0.32 ? Math.sin((d.age / 0.32) * Math.PI) * 16 : 0;
      const oy = d.y - bounce + bob;
      const blink = d.life < 6 ? (Math.sin(d.age * 14) > 0 ? 1 : 0.35) : 1;

      // ombre au sol
      gfx.ellipse(d.x, d.y + 6, 8, 3.8).fill({ color: COLORS.ink, alpha: 0.3 * blink });

      // pilier lumineux selon la rarete
      if (d.rarity === 'legendaire' || d.rarity === 'epique' || d.rarity === 'rare') {
        const beamH = d.rarity === 'legendaire' ? 56 : d.rarity === 'epique' ? 40 : 26;
        const beamW = d.rarity === 'legendaire' ? 10 : d.rarity === 'epique' ? 7 : 5;
        gfx.rect(d.x - beamW / 2, d.y - beamH, beamW, beamH).fill({ color: d.color, alpha: 0.22 * blink });
        gfx.circle(d.x, d.y + 3, 12 + Math.sin(d.age * 6) * 2).stroke({ width: 1.5, color: d.color, alpha: 0.6 * blink });
      }

      // orbe / gemme de butin
      const r = d.rarity === 'legendaire' ? 7.5 : d.rarity === 'epique' ? 6.5 : 5.5;
      gfx.poly([d.x, oy - r, d.x + r, oy, d.x, oy + r, d.x - r, oy])
        .fill({ color: d.color, alpha: blink })
        .stroke({ width: 1.4, color: COLORS.ink, alpha: blink });
      gfx.circle(d.x - 1.5, oy - 1.8, r * 0.28).fill({ color: 0xffffff, alpha: 0.85 * blink });

      d.node.position.set(d.x, oy - r - 6);
      d.node.alpha = blink;
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
    hazards,
    lootDrops,
    spawnText,
    spawnSlash,
    spawnProjectile,
    spawnHazard,
    spawnLootDrop,
    collectNearbyLoot,
    clear,
    render
  };
}

export interface InteractableSprite {
  def: ZoneInteractable;
  container: Container;
  update: (time: number, done: boolean, nearPlayer: boolean, sealed?: boolean) => void;
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
    base.circle(0, 0, 19).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 1.8 });
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
  } else if (def.kind === 'chest') {
    base.roundRect(-12, -8, 24, 16, 3).fill(shaded(0x7c5032, 0x4f321e)).stroke({ ...LINE, width: 1.5 });
    base.rect(-13, -2, 26, 3.5).fill(BRONZE_SHADE);
    base.rect(-3, -4, 6, 7).fill(COLORS.gold).stroke({ ...LINE, width: 0.7 });
    label.y = -18;
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
    update: (time, done, nearPlayer, sealed = false) => {
      if (def.kind === 'chest' && done) {
        container.alpha = 0.45;
        glow.clear();
        ring.clear();
        label.visible = false;
        return;
      }
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
      } else if (def.kind === 'chest') {
        if (sealed) {
          container.alpha = 0.8;
          glow.circle(0, 0, 14).stroke({ width: 1.5, color: 0x64748b, alpha: 0.6 });
          glow.moveTo(-6, -6).lineTo(6, 6).moveTo(6, -6).lineTo(-6, 6).stroke({ width: 1.5, color: 0x94a3b8, alpha: 0.7 });
        } else {
          container.alpha = 1;
          // Coffre discret : un leger reflet uniquement lorsqu'on est tout proche
          if (nearPlayer) {
            glow.circle(0, -2, 11).fill({ color: COLORS.gold, alpha: 0.14 });
          }
        }
      } else if (def.kind === 'bronze' || def.kind === 'herb') {
        // Objets discrets au sol : reflet tres subtil seulement de pres
        if (nearPlayer) {
          glow.circle(0, -3, 9).fill({ color: COLORS.gold, alpha: 0.12 });
        }
      } else {
        const pulse = 0.5 + 0.5 * Math.sin(time * 4.5 + def.x);
        glow.circle(0, -4, 10 + pulse * 3).fill({ color: COLORS.gold, alpha: 0.1 + pulse * 0.1 });
      }

      if (nearPlayer && !done) {
        ring.circle(0, def.kind === 'trial_stele' ? -14 : 0, 22 + Math.sin(time * 6) * 2)
          .stroke({ width: 1.8, color: COLORS.gold, alpha: 0.85 });
      }
      label.visible = nearPlayer;
    }
  };
}
