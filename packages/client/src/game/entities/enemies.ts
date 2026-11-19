import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { ViewMode } from '@greek-myth/shared';
import type { EnemyType, ZoneEnemySpawn } from '../data/zones';
import { BRONZE, BRONZE_LIT, BRONZE_SHADE, LINE, WOOD, dome, shaded } from '../hero/look';
import { COLORS } from '../scenes/palette';

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
    maxHp: 58,
    attack: 9,
    speed: 108,
    aggroRange: 210,
    attackRange: 34,
    attackCooldown: 1.25,
    windupDuration: 0.35,
    xpReward: 34,
    goldReward: 14,
    radius: 15
  },
  harpie: {
    type: 'harpie',
    name: 'Harpie des tempêtes',
    maxHp: 48,
    attack: 11,
    speed: 138,
    aggroRange: 250,
    attackRange: 38,
    attackCooldown: 1.35,
    windupDuration: 0.38,
    xpReward: 42,
    goldReward: 18,
    radius: 15,
    flying: true
  },
  centaure: {
    type: 'centaure',
    name: 'Centaure corrompu',
    maxHp: 175,
    attack: 19,
    speed: 122,
    aggroRange: 270,
    attackRange: 50,
    attackCooldown: 1.6,
    windupDuration: 0.55,
    xpReward: 115,
    goldReward: 55,
    radius: 22
  },
  automate: {
    type: 'automate',
    name: "Automate d'Héphaïstos",
    maxHp: 150,
    attack: 20,
    speed: 82,
    aggroRange: 230,
    attackRange: 44,
    attackCooldown: 1.75,
    windupDuration: 0.6,
    xpReward: 95,
    goldReward: 42,
    radius: 20
  },
  gardien_airain: {
    type: 'gardien_airain',
    name: "Gardien d'Airain",
    maxHp: 310,
    attack: 25,
    speed: 92,
    aggroRange: 290,
    attackRange: 56,
    attackCooldown: 1.7,
    windupDuration: 0.62,
    xpReward: 210,
    goldReward: 110,
    radius: 26,
    isBoss: true
  },
  sentinelle_poseidon: {
    type: 'sentinelle_poseidon',
    name: 'Sentinelle de Poséidon',
    maxHp: 460,
    attack: 26,
    speed: 95,
    aggroRange: 520,
    attackRange: 64,
    attackCooldown: 1.85,
    windupDuration: 0.65,
    xpReward: 340,
    goldReward: 180,
    radius: 28,
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
  state: 'patrol' | 'chase' | 'windup' | 'cooldown';
  stateTimer: number;
  waveCooldown: number;
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
    // cornes recourbees
    g.moveTo(-3, -4).quadraticCurveTo(-8, -10, -10, -5).stroke({ width: 2.2, color: COLORS.marbleShade, cap: 'round' });
    g.moveTo(3, -4).quadraticCurveTo(8, -10, 10, -5).stroke({ width: 2.2, color: COLORS.marbleShade, cap: 'round' });
    // gourdin
    g.moveTo(7, 2).lineTo(14, -6).stroke({ width: 3, color: WOOD, cap: 'round' });
  } else if (type === 'harpie') {
    const wing = mode === 'side-view' ? 16 : 18;
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
    // grande lance de guerre
    g.moveTo(2, 9).lineTo(24, 9).stroke({ width: 2.8, color: WOOD, cap: 'round' });
    g.poly([23, 6, 30, 9, 23, 12]).fill(BRONZE_LIT).stroke(LINE);
  } else if (type === 'automate' || type === 'gardien_airain') {
    const sc = type === 'gardien_airain' ? 1.3 : 1;
    g.scale.set(sc);
    g.roundRect(-12, -11, 24, 22, 6).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke({ ...LINE, width: 1.5 });
    g.circle(0, 0, 6.5).fill(0xf97316).stroke(LINE);
    g.circle(0, 0, 3.2).fill(0xfff7ed);
    g.roundRect(-16, -6, 6, 12, 2).fill(BRONZE).stroke(LINE);
    g.roundRect(10, -6, 6, 12, 2).fill(BRONZE).stroke(LINE);
  } else if (type === 'sentinelle_poseidon') {
    // grand colosse en vue de profil (marbre marin, bronze et trident lumineux)
    g.roundRect(-14, -34, 28, 36, 6).fill(shaded(COLORS.marbleLit, COLORS.seaLight)).stroke({ ...LINE, width: 1.8 });
    g.roundRect(-16, -34, 32, 10, 4).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke(LINE);
    // jambes
    g.roundRect(-11, 0, 8, 16, 3).fill(COLORS.marbleShade).stroke(LINE);
    g.roundRect(3, 0, 8, 16, 3).fill(COLORS.marbleShade).stroke(LINE);
    // tete et couronne
    g.circle(0, -42, 9).fill(dome(COLORS.marbleLit, COLORS.marble, COLORS.seaLight)).stroke(LINE);
    g.poly([-9, -48, -6, -56, -2, -49, 0, -58, 2, -49, 6, -56, 9, -48]).fill(COLORS.gold).stroke(LINE);
    // trident d'or et d'eau
    g.moveTo(18, -54).lineTo(18, 14).stroke({ width: 3.4, color: COLORS.ink, cap: 'round' });
    g.moveTo(18, -54).lineTo(18, 14).stroke({ width: 2, color: COLORS.gold, cap: 'round' });
    g.moveTo(11, -46).lineTo(11, -57).moveTo(25, -46).lineTo(25, -57).moveTo(11, -46).lineTo(25, -46)
      .stroke({ width: 2.2, color: COLORS.gold, cap: 'round' });
    g.circle(18, -55, 5).fill({ color: COLORS.seaLight, alpha: 0.6 });
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

  const barY = spawn.type === 'sentinelle_poseidon' ? -72 : -arch.radius - 16;
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
      stroke: { color: COLORS.ink, width: 2.8, join: 'round' }
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
    waveCooldown: 3.5,
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
  const barY = enemy.type === 'sentinelle_poseidon' ? -72 : -arch.radius - 16;
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
  if (enemy.shielded) {
    enemy.shieldRing.alpha = 0.6 + Math.sin(time * 4) * 0.25;
  }

  if (enemy.state === 'windup') {
    enemy.telegraph.visible = true;
    enemy.telegraph.clear();
    const pulse = 0.5 + 0.5 * Math.sin(time * 24);
    enemy.telegraph
      .circle(0, 0, arch.attackRange)
      .fill({ color: 0xef4444, alpha: 0.14 + pulse * 0.12 })
      .stroke({ width: 2, color: 0xf87171, alpha: 0.85 });
  } else {
    enemy.telegraph.visible = false;
  }
}
