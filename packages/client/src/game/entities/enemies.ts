import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { ViewMode } from '@greek-myth/shared';
import type { EnemyType, ZoneEnemySpawn } from '../data/zones';
import { BRONZE, BRONZE_LIT, BRONZE_SHADE, LINE, WOOD, dome, shaded } from '../hero/look';
import { COLORS } from '../scenes/palette';

export type EnemyAttackStyle = 'lunge' | 'ranged_fan' | 'charge' | 'fire_slam' | 'boss_burst' | 'poseidon' | 'minotaur' | 'venom_spit' | 'hydra';

export interface EnemyArchetype {
  type: EnemyType;
  name: string;
  maxHp: number;
  attack: number;
  speed: number;
  aggroRange: number;
  attackRange: number;
  attackCooldown: number;
  windupDuration: number;
  attackStyle: EnemyAttackStyle;
  xpReward: number;
  goldReward: number;
  radius: number;
  flying?: boolean;
  isBoss?: boolean;
}

export const ENEMY_ARCHETYPES: Record<EnemyType, EnemyArchetype> = {
  satyre: {
    type: 'satyre',
    name: 'Satyre belliqueux',
    maxHp: 60,
    attack: 14,
    speed: 132,
    aggroRange: 245,
    attackRange: 105,
    attackCooldown: 1.05,
    windupDuration: 0.28,
    attackStyle: 'lunge',
    xpReward: 36,
    goldReward: 16,
    radius: 15
  },
  harpie: {
    type: 'harpie',
    name: 'Harpie des tempêtes',
    maxHp: 50,
    attack: 14,
    speed: 158,
    aggroRange: 295,
    attackRange: 245,
    attackCooldown: 1.35,
    windupDuration: 0.3,
    attackStyle: 'ranged_fan',
    xpReward: 44,
    goldReward: 20,
    radius: 15,
    flying: true
  },
  centaure: {
    type: 'centaure',
    name: 'Centaure corrompu',
    maxHp: 185,
    attack: 27,
    speed: 148,
    aggroRange: 310,
    attackRange: 235,
    attackCooldown: 1.55,
    windupDuration: 0.44,
    attackStyle: 'charge',
    xpReward: 120,
    goldReward: 65,
    radius: 22
  },
  automate: {
    type: 'automate',
    name: "Automate d'Héphaïstos",
    maxHp: 155,
    attack: 25,
    speed: 98,
    aggroRange: 280,
    attackRange: 220,
    attackCooldown: 1.45,
    windupDuration: 0.42,
    attackStyle: 'fire_slam',
    xpReward: 95,
    goldReward: 48,
    radius: 20
  },
  gardien_airain: {
    type: 'gardien_airain',
    name: "Gardien d'Airain",
    maxHp: 320,
    attack: 30,
    speed: 112,
    aggroRange: 330,
    attackRange: 250,
    attackCooldown: 1.35,
    windupDuration: 0.45,
    attackStyle: 'boss_burst',
    xpReward: 220,
    goldReward: 120,
    radius: 26,
    isBoss: true
  },
  sentinelle_poseidon: {
    type: 'sentinelle_poseidon',
    name: 'Sentinelle de Poséidon',
    maxHp: 460,
    attack: 26,
    speed: 92,
    aggroRange: 520,
    attackRange: 72,
    attackCooldown: 1.85,
    windupDuration: 0.65,
    attackStyle: 'poseidon',
    xpReward: 350,
    goldReward: 200,
    radius: 28,
    isBoss: true
  },
  squelette: {
    type: 'squelette',
    name: 'Squelette hoplite',
    maxHp: 135,
    attack: 18,
    speed: 112,
    aggroRange: 230,
    attackRange: 96,
    attackCooldown: 1.35,
    windupDuration: 0.42,
    attackStyle: 'lunge',
    xpReward: 88,
    goldReward: 38,
    radius: 16
  },
  minotaure: {
    type: 'minotaure',
    name: 'Minotaure des Brumes',
    maxHp: 580,
    attack: 36,
    speed: 128,
    aggroRange: 360,
    attackRange: 260,
    attackCooldown: 1.35,
    windupDuration: 0.46,
    attackStyle: 'minotaur',
    xpReward: 480,
    goldReward: 260,
    radius: 30,
    isBoss: true
  },
  serpent_lerne: {
    type: 'serpent_lerne',
    name: 'Vipère de Lerne',
    maxHp: 195,
    attack: 27,
    speed: 144,
    aggroRange: 300,
    attackRange: 240,
    attackCooldown: 1.25,
    windupDuration: 0.34,
    attackStyle: 'venom_spit',
    xpReward: 135,
    goldReward: 68,
    radius: 17
  },
  hydre_lerne: {
    type: 'hydre_lerne',
    name: 'Hydre de Lerne',
    maxHp: 680,
    attack: 38,
    speed: 114,
    aggroRange: 380,
    attackRange: 285,
    attackCooldown: 1.4,
    windupDuration: 0.46,
    attackStyle: 'hydra',
    xpReward: 560,
    goldReward: 320,
    radius: 34,
    isBoss: true
  }
};

export interface EnemyEntity {
  spawnId: string;
  type: EnemyType;
  level: number;
  name: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  respawnTimer: number;
  respawnSeconds: number;
  patrolRadius: number;
  patrolAngle: number;
  state: 'patrol' | 'chase' | 'windup' | 'dashing' | 'cooldown';
  stateTimer: number;
  aimAngle: number;
  dashVx: number;
  dashVy: number;
  dashHitDone: boolean;
  patternStep: number;
  waveCooldown: number;
  skyCooldown: number;
  hitFlash: number;
  stunTimer: number;
  shielded: boolean;
  container: Container;
  body: Container;
  hpFill: Graphics;
  telegraph: Graphics;
  shieldRing: Graphics;
}

function drawEnemyVisual(type: EnemyType, mode: ViewMode): Container {
  const c = new Container();
  const g = new Graphics();

  if (type === 'satyre') {
    g.ellipse(0, 0, 9.5, 7.5).fill(shaded(0x9a6338, 0x5c361c)).stroke(LINE);
    g.circle(0, -1, 5.5).fill(dome(0xb87a4b, 0x87532d, 0x4f2e18)).stroke(LINE);
    g.moveTo(-3, -4).quadraticCurveTo(-8, -10, -10, -5).stroke({ width: 2.2, color: COLORS.marbleShade, cap: 'round' });
    g.moveTo(3, -4).quadraticCurveTo(8, -10, 10, -5).stroke({ width: 2.2, color: COLORS.marbleShade, cap: 'round' });
    g.moveTo(7, 2).lineTo(14, -6).stroke({ width: 3, color: WOOD, cap: 'round' });
  } else if (type === 'harpie') {
    const wing = mode === 'side-view' ? 16 : 19;
    g.poly([0, -2, -wing, -10, -wing + 4, 4, 0, 3]).fill(shaded(0x475569, 0x1e293b)).stroke(LINE);
    g.poly([0, -2, wing, -10, wing - 4, 4, 0, 3]).fill(shaded(0x475569, 0x1e293b)).stroke(LINE);
    g.ellipse(0, 0, 7, 9).fill(shaded(COLORS.tile, 0x7c2d12)).stroke(LINE);
    g.circle(0, -5, 4.5).fill(dome(0xf3c79e, 0xd89f72, 0x8a5a3a)).stroke(LINE);
    g.poly([0, -1, -2.5, 3, 2.5, 3]).fill(COLORS.gold);
  } else if (type === 'centaure') {
    g.ellipse(-4, 2, 16, 10).fill(shaded(0x7c4a26, 0x452611)).stroke(LINE);
    g.ellipse(6, -1, 9, 10).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke(LINE);
    g.circle(8, -2, 6).fill(dome(BRONZE_LIT, BRONZE, BRONZE_SHADE)).stroke(LINE);
    g.ellipse(8, -2, 2.2, 8).fill(0xdc2626).stroke({ ...LINE, width: 0.7 });
    g.moveTo(2, 9).lineTo(25, 9).stroke({ width: 2.8, color: WOOD, cap: 'round' });
    g.poly([24, 6, 31, 9, 24, 12]).fill(BRONZE_LIT).stroke(LINE);
  } else if (type === 'automate' || type === 'gardien_airain') {
    const sc = type === 'gardien_airain' ? 1.32 : 1;
    g.scale.set(sc);
    g.roundRect(-12, -11, 24, 22, 6).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 1.5 });
    g.circle(0, 0, 6.5).fill(0xf97316).stroke(LINE);
    g.circle(0, 0, 3.2).fill(0xfff7ed);
    g.roundRect(-16, -6, 6, 12, 2).fill(BRONZE).stroke(LINE);
    g.roundRect(10, -6, 6, 12, 2).fill(BRONZE).stroke(LINE);
  } else if (type === 'sentinelle_poseidon') {
    g.roundRect(-14, -34, 28, 36, 6).fill(shaded(COLORS.marbleLit, COLORS.seaLight)).stroke({ ...LINE, width: 1.8 });
    g.roundRect(-16, -34, 32, 10, 4).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke(LINE);
    g.roundRect(-11, 0, 8, 16, 3).fill(COLORS.marbleShade).stroke(LINE);
    g.roundRect(3, 0, 8, 16, 3).fill(COLORS.marbleShade).stroke(LINE);
    g.circle(0, -42, 9).fill(dome(COLORS.marbleLit, COLORS.marble, COLORS.seaLight)).stroke(LINE);
    g.poly([-9, -48, -6, -56, -2, -49, 0, -58, 2, -49, 6, -56, 9, -48]).fill(COLORS.gold).stroke(LINE);
    g.moveTo(18, -54).lineTo(18, 14).stroke({ width: 3.4, color: COLORS.ink, cap: 'round' });
    g.moveTo(18, -54).lineTo(18, 14).stroke({ width: 2, color: COLORS.gold, cap: 'round' });
    g.moveTo(11, -46).lineTo(11, -57).moveTo(25, -46).lineTo(25, -57).moveTo(11, -46).lineTo(25, -46)
      .stroke({ width: 2.2, color: COLORS.gold, cap: 'round' });
    g.circle(18, -55, 5).fill({ color: COLORS.seaLight, alpha: 0.6 });
  } else if (type === 'squelette') {
    g.ellipse(0, 0, 8.5, 6.5).fill(COLORS.marbleShade).stroke(LINE);
    g.circle(0, -1, 5.4).fill(COLORS.marbleLit).stroke(LINE);
    g.circle(-2, -1.5, 1.1).fill(COLORS.ink);
    g.circle(2, -1.5, 1.1).fill(COLORS.ink);
    // bouclier fissure et lance
    g.circle(-9, 1, 6).fill(shaded(BRONZE, BRONZE_SHADE)).stroke(LINE);
    g.moveTo(8, -10).lineTo(8, 12).stroke({ width: 2.2, color: WOOD, cap: 'round' });
    g.poly([8, -14, 10.5, -9, 5.5, -9]).fill(BRONZE_LIT).stroke({ ...LINE, width: 0.7 });
  } else if (type === 'minotaure') {
    // epaules massives de taureau
    g.ellipse(0, 2, 22, 16).fill(shaded(0x6b3f23, 0x3b1f10)).stroke({ ...LINE, width: 1.8 });
    g.roundRect(-16, -6, 32, 12, 4).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke(LINE);
    // tete bovine + grandes cornes d'ivoire
    g.circle(0, -4, 10.5).fill(dome(0x7c4a2a, 0x522e18, 0x2b160a)).stroke({ ...LINE, width: 1.5 });
    g.moveTo(-7, -9).quadraticCurveTo(-22, -20, -24, -4).stroke({ width: 4, color: COLORS.marbleLit, cap: 'round' });
    g.moveTo(7, -9).quadraticCurveTo(22, -20, 24, -4).stroke({ width: 4, color: COLORS.marbleLit, cap: 'round' });
    g.circle(0, -1, 3.2).stroke({ width: 1.6, color: COLORS.gold });
    // double hache (Labrys) en bronze
    g.moveTo(16, -18).lineTo(16, 18).stroke({ width: 3.2, color: WOOD, cap: 'round' });
    g.poly([16, -12, 27, -18, 25, -4, 16, -8]).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke(LINE);
    g.poly([16, -12, 5, -18, 7, -4, 16, -8]).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke(LINE);
  } else if (type === 'serpent_lerne') {
    // corps sinueux de vipere emeraude
    g.ellipse(0, 6, 15, 9).fill(shaded(0x3f8f4d, 0x1e4d2b)).stroke({ ...LINE, width: 1.5 });
    g.moveTo(-12, 6).quadraticCurveTo(0, -14, 10, -6).stroke({ width: 7, color: 0x2f7d42, cap: 'round' });
    g.moveTo(-12, 6).quadraticCurveTo(0, -14, 10, -6).stroke({ width: 1.4, color: COLORS.ink, cap: 'round' });
    // tete triangulaire + yeux dores + langue
    g.poly([4, -12, 16, -8, 12, -1, 3, -5]).fill(shaded(0x4ade80, 0x166534)).stroke(LINE);
    g.circle(11, -8, 1.6).fill(COLORS.gold);
    g.moveTo(16, -7).lineTo(22, -9).moveTo(16, -7).lineTo(21, -4).stroke({ width: 1.2, color: 0xef4444 });
  } else if (type === 'hydre_lerne') {
    // corps massif ecailleux dans le marais
    g.ellipse(0, 8, 28, 18).fill(shaded(0x2d7a47, 0x123822)).stroke({ ...LINE, width: 2 });
    g.ellipse(0, 10, 18, 10).fill({ color: 0x4ade80, alpha: 0.25 });
    // trois cous et trois tetes serpentines
    const heads = [
      { cx: -20, cy: -16, neckX: -12, neckY: -2 },
      { cx: 0, cy: -24, neckX: 0, neckY: -6 },
      { cx: 20, cy: -16, neckX: 12, neckY: -2 }
    ];
    for (const h of heads) {
      g.moveTo(h.neckX * 0.5, 4).quadraticCurveTo(h.neckX, h.neckY, h.cx, h.cy)
        .stroke({ width: 8.5, color: 0x1e5c34, cap: 'round' });
      g.moveTo(h.neckX * 0.5, 4).quadraticCurveTo(h.neckX, h.neckY, h.cx, h.cy)
        .stroke({ width: 1.4, color: COLORS.ink, cap: 'round' });
      // tete et crete venimeuse
      g.ellipse(h.cx, h.cy, 8.5, 6.5).fill(dome(0x4ade80, 0x227541, 0x11361f)).stroke({ ...LINE, width: 1.5 });
      g.poly([h.cx - 4, h.cy - 6, h.cx, h.cy - 12, h.cx + 4, h.cy - 6]).fill(COLORS.gold).stroke({ ...LINE, width: 0.8 });
      g.circle(h.cx - 2.6, h.cy - 1, 1.8).fill(0xfef08a);
      g.circle(h.cx + 2.6, h.cy - 1, 1.8).fill(0xfef08a);
    }
  }

  c.addChild(g);
  return c;
}

export function createEnemyEntity(spawn: ZoneEnemySpawn, mode: ViewMode): EnemyEntity {
  const arch = ENEMY_ARCHETYPES[spawn.type];
  const container = new Container();
  container.position.set(spawn.x, spawn.y);

  const shadowY = mode === 'side-view' ? (spawn.type === 'sentinelle_poseidon' ? 16 : 12) : 6;
  const shadow = new Graphics()
    .ellipse(2, shadowY, arch.radius * 0.9, arch.radius * 0.45)
    .fill({ color: COLORS.shadow, alpha: 0.28 });

  const telegraph = new Graphics();
  telegraph.visible = false;

  const shieldRing = new Graphics();
  if (spawn.type === 'sentinelle_poseidon') {
    shieldRing.ellipse(0, -18, 38, 46).fill({ color: COLORS.seaLight, alpha: 0.18 });
    shieldRing.ellipse(0, -18, 38, 46).stroke({ width: 2.5, color: 0x7dd3fc, alpha: 0.9 });
  }
  shieldRing.visible = spawn.type === 'sentinelle_poseidon';

  const body = drawEnemyVisual(spawn.type, mode);

  const barY = spawn.type === 'sentinelle_poseidon' ? -72 : -arch.radius - 15;
  const barW = arch.isBoss ? 56 : 36;
  const hpBg = new Graphics()
    .roundRect(-barW / 2, barY, barW, 5, 2)
    .fill({ color: COLORS.ink, alpha: 0.85 })
    .stroke({ width: 1, color: COLORS.marbleShade });
  const hpFill = new Graphics();

  const label = new Text({
    text: `${arch.name} (N.${spawn.level})`,
    resolution: 3,
    style: new TextStyle({
      fontFamily: 'Outfit, sans-serif',
      fontSize: arch.isBoss ? 10 : 8.5,
      fontWeight: '700',
      fill: arch.isBoss ? COLORS.gold : COLORS.marbleLit,
      stroke: { color: COLORS.ink, width: 2.6, join: 'round' }
    })
  });
  label.anchor.set(0.5, 1);
  label.y = barY - 3;

  container.addChild(shadow, telegraph, body, shieldRing, hpBg, hpFill, label);

  const entity: EnemyEntity = {
    spawnId: spawn.id,
    type: spawn.type,
    level: spawn.level,
    name: arch.name,
    x: spawn.x,
    y: spawn.y,
    homeX: spawn.x,
    homeY: spawn.y,
    vx: 0,
    vy: 0,
    hp: arch.maxHp,
    maxHp: arch.maxHp,
    alive: true,
    respawnTimer: 0,
    respawnSeconds: spawn.respawnSeconds,
    patrolRadius: spawn.patrolRadius,
    patrolAngle: Math.random() * Math.PI * 2,
    state: 'patrol',
    stateTimer: 0,
    aimAngle: 0,
    dashVx: 0,
    dashVy: 0,
    dashHitDone: false,
    patternStep: 0,
    waveCooldown: 3.4,
    skyCooldown: 5.2,
    hitFlash: 0,
    stunTimer: 0,
    shielded: spawn.type === 'sentinelle_poseidon',
    container,
    body,
    hpFill,
    telegraph,
    shieldRing
  };

  redrawEnemyHp(entity);
  return entity;
}

export function redrawEnemyHp(enemy: EnemyEntity): void {
  const arch = ENEMY_ARCHETYPES[enemy.type];
  const barY = enemy.type === 'sentinelle_poseidon' ? -72 : -arch.radius - 15;
  const barW = arch.isBoss ? 56 : 36;
  const ratio = Math.max(0, enemy.hp / enemy.maxHp);
  enemy.hpFill.clear();
  if (ratio > 0) {
    const color = enemy.shielded ? COLORS.seaLight : arch.isBoss ? COLORS.gold : 0xdc2626;
    enemy.hpFill.roundRect(-barW / 2 + 1, barY + 1, (barW - 2) * ratio, 3, 1.5).fill({ color });
  }
}

export function updateEnemyVisual(enemy: EnemyEntity, time: number, mode: ViewMode): void {
  enemy.container.visible = enemy.alive;
  if (!enemy.alive) return;

  enemy.container.position.set(enemy.x, enemy.y);
  const arch = ENEMY_ARCHETYPES[enemy.type];

  if (arch.flying) {
    enemy.body.y = Math.sin(time * 6 + enemy.homeX) * 5;
  } else {
    const moving = Math.hypot(enemy.vx, enemy.vy) > 5;
    enemy.body.y = moving ? Math.abs(Math.sin(time * 12)) * -3 : Math.sin(time * 2.5) * 1;
  }

  if (mode === 'side-view' && Math.abs(enemy.vx) > 2) {
    enemy.body.scale.x = enemy.vx >= 0 ? 1 : -1;
  }

  enemy.body.tint = enemy.hitFlash > 0 ? 0xffc7c7 : enemy.stunTimer > 0 ? 0x93c5fd : 0xffffff;
  enemy.shieldRing.visible = enemy.shielded;
  if (enemy.shielded) enemy.shieldRing.alpha = 0.6 + Math.sin(time * 4) * 0.25;

  if (enemy.state === 'windup') {
    enemy.telegraph.visible = true;
    enemy.telegraph.clear();
    const pulse = 0.5 + 0.5 * Math.sin(time * 24);
    const a = enemy.aimAngle;
    const cx = Math.cos(a);
    const sy = Math.sin(a);
    const px = -sy;
    const py = cx;

    if (arch.attackStyle === 'lunge' || arch.attackStyle === 'charge' || (arch.attackStyle === 'minotaur' && enemy.patternStep === 0)) {
      const len = arch.attackStyle === 'charge' || arch.attackStyle === 'minotaur' ? 220 : 105;
      const halfW = arch.attackStyle === 'charge' || arch.attackStyle === 'minotaur' ? 24 : 13;
      enemy.telegraph.poly([
        px * halfW, py * halfW,
        cx * len + px * halfW, sy * len + py * halfW,
        cx * len - px * halfW, sy * len - py * halfW,
        -px * halfW, -py * halfW
      ]).fill({ color: 0xef4444, alpha: 0.16 + pulse * 0.14 }).stroke({ width: 1.8, color: 0xf87171, alpha: 0.9 });
    } else if (arch.attackStyle === 'ranged_fan') {
      enemy.telegraph.moveTo(0, 0).arc(0, 0, 120, a - 0.38, a + 0.38).closePath()
        .fill({ color: 0x38bdf8, alpha: 0.14 + pulse * 0.1 })
        .stroke({ width: 1.5, color: 0x7dd3fc, alpha: 0.85 });
    } else {
      const r = arch.attackStyle === 'boss_burst' || arch.attackStyle === 'minotaur' ? 115 : 74;
      enemy.telegraph.circle(0, 0, r)
        .fill({ color: 0xf97316, alpha: 0.15 + pulse * 0.12 })
        .stroke({ width: 2, color: 0xfb923c, alpha: 0.9 });
    }
  } else {
    enemy.telegraph.visible = false;
  }
}
