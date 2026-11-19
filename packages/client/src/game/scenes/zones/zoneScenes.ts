import { AlphaFilter, Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { ZoneDefinition, ZonePortal, ZoneSolid } from '../../data/zones';
import { placeLayer, View } from '../../camera';
import type { Scene } from '../index';
import { COLORS, mix } from '../palette';
import { drawMeander, drawLaurel } from '../shapes';
import { createTopDown } from '../topDown';
import { createSideView } from '../sideView';
import { castShadow, random } from '../top/util';
import { drawColumn, drawLowWall, drawOlive } from '../top/props';
import { BRONZE_LIT, BRONZE_SHADE, LINE, LINEN, LINEN_SHADE, shaded } from '../../hero/look';

function makePortalLabel(portal: ZonePortal): Text {
  const label = new Text({
    text: portal.label,
    resolution: 3,
    style: new TextStyle({
      fontFamily: 'Cinzel, serif',
      fontSize: 9.5,
      fontWeight: '700',
      fill: COLORS.gold,
      stroke: { color: COLORS.ink, width: 3, join: 'round' }
    })
  });
  label.anchor.set(0.5, 0.5);
  const cx = portal.x + portal.w / 2;
  const cy = portal.y + portal.h / 2;
  const offsetX = cx < 200 ? 64 : -64;
  label.position.set(cx + offsetX, cy - 48);
  return label;
}

function drawAnvilProp(g: Graphics, shadows: Graphics, s: ZoneSolid): void {
  castShadow(shadows, s.x, s.y, s.w, s.h, 16);
  // tapis de pierres et enclume de Damon
  g.roundRect(s.x, s.y, s.w, s.h, 4).fill(COLORS.marbleShade).stroke({ width: 1.6, color: COLORS.ink });
  // foyer ardent a droite
  g.circle(s.x + s.w - 11, s.y + s.h / 2, 8).fill({ color: 0x3b1f14 }).stroke({ width: 1.2, color: COLORS.ink });
  g.circle(s.x + s.w - 11, s.y + s.h / 2, 5).fill({ color: 0xf97316 });
  g.circle(s.x + s.w - 11, s.y + s.h / 2, 2.5).fill({ color: 0xfef08a });
  // enclume en bronze
  g.roundRect(s.x + 6, s.y + 7, 20, 14, 3).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke(LINE);
}

function drawHealerTent(g: Graphics, shadows: Graphics, s: ZoneSolid): void {
  castShadow(shadows, s.x, s.y, s.w, s.h, 20);
  // auvent de lin des survivants + amphores
  g.roundRect(s.x, s.y, s.w, s.h, 5).fill(shaded(LINEN, LINEN_SHADE)).stroke({ width: 1.8, color: COLORS.ink });
  g.moveTo(s.x + 4, s.y + s.h / 2).lineTo(s.x + s.w - 4, s.y + s.h / 2).stroke({ width: 1.4, color: COLORS.olive });
  drawMeander(g, s.x + 6, s.y + 4, s.w - 12, 1.5, COLORS.olive);
  g.circle(s.x + s.w - 10, s.y + s.h - 9, 4.5).fill(COLORS.tile).stroke({ width: 1, color: COLORS.ink });
}

function drawRock(g: Graphics, shadows: Graphics, s: ZoneSolid, seed: number): void {
  const rand = random(seed);
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  castShadow(shadows, s.x + 4, s.y + 4, s.w - 8, s.h - 8, 18);
  const pts: number[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rx = (s.w / 2) * (0.85 + rand() * 0.25);
    const ry = (s.h / 2) * (0.85 + rand() * 0.25);
    pts.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
  }
  g.poly(pts).fill(shaded(0x9ca3af, 0x4b5563)).stroke({ width: 1.8, color: COLORS.ink });
  g.ellipse(cx - s.w * 0.12, cy - s.h * 0.14, s.w * 0.22, s.h * 0.16).fill({ color: COLORS.marbleShade, alpha: 0.45 });
}

function drawRuinWall(g: Graphics, shadows: Graphics, s: ZoneSolid): void {
  castShadow(shadows, s.x, s.y, s.w, s.h, 22);
  g.rect(s.x, s.y, s.w, s.h).fill(COLORS.marbleShadow);
  g.rect(s.x, s.y, s.w, Math.max(4, s.h - 5)).fill(COLORS.marble);
  g.rect(s.x, s.y, s.w, 3).fill(COLORS.marbleLit);
  if (s.w > s.h) {
    for (let x = s.x + 28; x < s.x + s.w - 8; x += 28) {
      g.rect(x, s.y + 2, 1.2, s.h - 6).fill(COLORS.marbleShade);
    }
  } else {
    for (let y = s.y + 26; y < s.y + s.h - 8; y += 26) {
      g.rect(s.x + 2, y, s.w - 4, 1.2).fill(COLORS.marbleShade);
    }
  }
  g.rect(s.x, s.y, s.w, s.h).stroke({ width: 1.8, color: COLORS.ink });
}

function drawAltar(g: Graphics, shadows: Graphics, s: ZoneSolid): void {
  castShadow(shadows, s.x, s.y, s.w, s.h, 20);
  g.roundRect(s.x, s.y, s.w, s.h, 3).fill(shaded(COLORS.marbleLit, COLORS.marbleShade)).stroke({ width: 1.8, color: COLORS.ink });
  drawMeander(g, s.x + 6, s.y + 6, s.w - 12, 1.6, COLORS.gold);
  g.circle(s.x + s.w / 2, s.y + s.h / 2 + 2, 7).fill({ color: 0xf97316, alpha: 0.55 });
  g.circle(s.x + s.w / 2, s.y + s.h / 2 + 2, 3.5).fill({ color: 0xfef08a });
}

function createPortalMarker(portal: ZonePortal) {
  const cx = portal.x + portal.w / 2;
  const cy = portal.y + portal.h / 2;
  const floor = new Container();
  floor.position.set(cx, cy);
  const g = new Graphics();
  g.circle(0, 0, 34).fill({ color: COLORS.gold, alpha: 0.18 });
  g.circle(0, 0, 31).stroke({ width: 1.6, color: COLORS.gold, alpha: 0.9 });
  drawLaurel(g, 0, 0, 25, 0xd9a93f);
  g.circle(0, 0, 17).fill({ color: COLORS.gold, alpha: 0.35 });
  floor.addChild(g);

  const glow = new Graphics();
  glow.position.set(cx, cy);
  glow.blendMode = 'add';
  glow.circle(0, 0, 44).fill({ color: COLORS.gold, alpha: 0.25 });

  return {
    floor,
    glow,
    update: (time: number) => {
      glow.alpha = 0.65 + Math.sin(time * 2.6 + cx) * 0.3;
      glow.scale.set(1 + Math.sin(time * 2.2) * 0.08);
    }
  };
}

function createAgoraScene(zone: ZoneDefinition): Scene {
  const base = createTopDown();

  const overlayShadows = new Graphics();
  overlayShadows.filters = [new AlphaFilter({ alpha: 0.26 })];
  const overlayProps = new Graphics();

  // cicatrice de foudre au nord-ouest de l'Agora (rappel du chatiment de Zeus)
  overlayProps.ellipse(215, 165, 42, 26).fill({ color: 0x292524, alpha: 0.24 });
  overlayProps.moveTo(188, 152).lineTo(212, 166).lineTo(205, 174).lineTo(238, 180)
    .stroke({ width: 2.2, color: 0x1c1917, alpha: 0.65 });
  overlayProps.moveTo(212, 166).lineTo(232, 150).stroke({ width: 1.4, color: 0x1c1917, alpha: 0.5 });

  for (const solid of zone.solids) {
    if (solid.look === 'anvil') drawAnvilProp(overlayProps, overlayShadows, solid);
    else if (solid.look === 'tent') drawHealerTent(overlayProps, overlayShadows, solid);
  }

  base.back.addChild(overlayShadows, overlayProps);
  for (const p of zone.portals) {
    base.front.addChild(makePortalLabel(p));
  }

  return base;
}

function createPlainesScene(zone: ZoneDefinition): Scene {
  const back = new Container();
  const front = new Container();
  const rand = random(73);

  const terrain = new Graphics();
  // fond terres seches et herbes brulee par la foudre
  terrain.rect(-240, -240, zone.width + 480, zone.height + 480).fill({ color: mix(COLORS.sand, COLORS.oliveDark, 0.42) });
  terrain.rect(0, 0, zone.width, zone.height).fill({ color: mix(COLORS.sand, COLORS.stone, 0.35) });

  // plaques d'herbe aride
  for (let i = 0; i < 48; i++) {
    const x = rand() * zone.width;
    const y = rand() * zone.height;
    terrain.ellipse(x, y, 40 + rand() * 70, 26 + rand() * 44)
      .fill({ color: i % 2 === 0 ? COLORS.grass : COLORS.olive, alpha: 0.22 });
  }

  // ancienne route pavee d'est en ouest (entre l'Agora et le Sanctuaire)
  terrain.rect(0, 392, zone.width, 112).fill({ color: COLORS.stoneJoint, alpha: 0.85 });
  for (let x = 0; x < zone.width; x += 58) {
    for (let row = 0; row < 2; row++) {
      const y = 398 + row * 50;
      const tone = mix(COLORS.stone, COLORS.marbleShade, rand() * 0.5);
      terrain.roundRect(x + 3, y, 52, 44, 3).fill({ color: tone });
    }
  }

  // crateres de foudre de Zeus et terre brulee
  const craters: [number, number, number][] = [
    [390, 580, 52],
    [710, 340, 60],
    [1040, 410, 56],
    [610, 145, 44]
  ];
  for (const [cx, cy, r] of craters) {
    terrain.circle(cx, cy, r).fill({ color: 0x3f3730, alpha: 0.38 });
    terrain.circle(cx, cy, r * 0.62).fill({ color: 0x1c1917, alpha: 0.48 });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + rand();
      terrain.moveTo(cx, cy).lineTo(cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r * 1.15)
        .stroke({ width: 1.5, color: 0x1c1917, alpha: 0.55 });
    }
  }

  // bordure de pierre de la zone
  terrain.rect(0, 0, zone.width, zone.height).stroke({ width: 6, color: COLORS.ink, alpha: 0.7 });

  const shadows = new Graphics();
  shadows.filters = [new AlphaFilter({ alpha: 0.26 })];
  const solids = new Graphics();

  let oliveIdx = 0;
  let rockIdx = 0;
  for (const s of zone.solids) {
    if (s.look === 'column') drawColumn(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h, look: 'column' });
    else if (s.look === 'olive') drawOlive(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h, look: 'olive' }, 90 + oliveIdx++);
    else if (s.look === 'wall') drawLowWall(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h }, s.x < zone.width / 2 ? 1 : -1);
    else if (s.look === 'ruin') drawRuinWall(solids, shadows, s);
    else if (s.look === 'rock') drawRock(solids, shadows, s, 140 + rockIdx++);
  }

  const portals = zone.portals.map(createPortalMarker);
  back.addChild(terrain, ...portals.map((p) => p.floor), shadows, solids);

  // effets d'orage et cendres derivantes
  const stormFlash = new Graphics().rect(0, 0, zone.width, zone.height).fill({ color: 0xfff8dc });
  stormFlash.alpha = 0;
  const embers: Graphics[] = [];
  for (let i = 0; i < 24; i++) {
    const e = new Graphics().circle(0, 0, 1.8).fill({ color: i % 3 === 0 ? 0xf97316 : COLORS.gold });
    front.addChild(e);
    embers.push(e);
  }
  front.addChild(...portals.map((p) => p.glow), ...zone.portals.map(makePortalLabel), stormFlash);

  return {
    back,
    front,
    update: (view: View, time: number) => {
      placeLayer(back, view);
      placeLayer(front, view);
      portals.forEach((p) => p.update(time));
      embers.forEach((e, i) => {
        const px = ((i * 197 + time * (18 + (i % 4) * 7)) % zone.width);
        const py = ((i * 131 + Math.sin(time + i) * 35 + time * 8) % zone.height);
        e.position.set(px, py);
        e.alpha = 0.35 + Math.sin(time * 3 + i) * 0.3;
      });
      const cycle = time % 9;
      stormFlash.alpha = cycle > 8.65 && cycle < 8.85 ? 0.14 : 0;
    }
  };
}

function createSanctuaireScene(zone: ZoneDefinition): Scene {
  const back = new Container();
  const front = new Container();
  const rand = random(199);

  const floor = new Graphics();
  floor.rect(-240, -240, zone.width + 480, zone.height + 480).fill({ color: 0x1c2536 });
  floor.rect(0, 0, zone.width, zone.height).fill({ color: mix(COLORS.marbleShade, COLORS.stone, 0.5) });

  // grandes dalles de marbre fissure du temple des Titans
  for (let y = 0; y < zone.height; y += 64) {
    for (let x = 0; x < zone.width; x += 64) {
      const tone = mix(COLORS.stone, COLORS.marbleShadow, rand() * 0.4);
      floor.rect(x + 2, y + 2, 60, 60).fill({ color: tone });
    }
  }

  // cercle sacre au centre ou rode le Gardien d'Airain
  floor.circle(980, 420, 145).fill({ color: COLORS.marbleShade, alpha: 0.7 });
  floor.circle(980, 420, 145).stroke({ width: 3, color: COLORS.gold, alpha: 0.75 });
  drawLaurel(floor, 980, 420, 118, 0xc08a3e);

  // failles tectoniques incandescentes (seismes des dieux)
  const riftGlow = new Graphics();
  const rifts = [
    [430, 80, 470, 200, 445, 310],
    [760, 480, 810, 630, 780, 790],
    [1120, 70, 1160, 190, 1210, 260]
  ];
  for (const pts of rifts) {
    floor.poly(pts, false).stroke({ width: 16, color: 0x1f1715, cap: 'round', join: 'round' });
    riftGlow.poly(pts, false).stroke({ width: 6, color: 0xea580c, cap: 'round', join: 'round' });
    riftGlow.poly(pts, false).stroke({ width: 2.2, color: 0xfef08a, cap: 'round', join: 'round' });
  }

  floor.rect(0, 0, zone.width, zone.height).stroke({ width: 6, color: COLORS.ink });

  const shadows = new Graphics();
  shadows.filters = [new AlphaFilter({ alpha: 0.28 })];
  const solids = new Graphics();

  let rockIdx = 0;
  for (const s of zone.solids) {
    if (s.look === 'column') drawColumn(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h, look: 'column' });
    else if (s.look === 'wall') drawLowWall(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h }, s.x < zone.width / 2 ? 1 : -1);
    else if (s.look === 'ruin') drawRuinWall(solids, shadows, s);
    else if (s.look === 'altar') drawAltar(solids, shadows, s);
    else if (s.look === 'rock') drawRock(solids, shadows, s, 220 + rockIdx++);
  }

  const portals = zone.portals.map(createPortalMarker);
  back.addChild(floor, riftGlow, ...portals.map((p) => p.floor), shadows, solids);

  const embers: Graphics[] = [];
  for (let i = 0; i < 28; i++) {
    const e = new Graphics().circle(0, 0, 2).fill({ color: i % 2 === 0 ? 0xf97316 : 0xfef08a });
    front.addChild(e);
    embers.push(e);
  }
  front.addChild(...portals.map((p) => p.glow), ...zone.portals.map(makePortalLabel));

  return {
    back,
    front,
    update: (view: View, time: number) => {
      placeLayer(back, view);
      placeLayer(front, view);
      portals.forEach((p) => p.update(time));
      riftGlow.alpha = 0.72 + Math.sin(time * 3.4) * 0.25;
      embers.forEach((e, i) => {
        const px = (i * 157 + Math.sin(time * 1.4 + i) * 30 + zone.width) % zone.width;
        const py = (zone.height - ((i * 97 + time * (22 + (i % 4) * 6)) % zone.height));
        e.position.set(px, py);
        e.alpha = 0.35 + Math.sin(time * 4 + i) * 0.35;
      });
    }
  };
}

function createRivageScene(zone: ZoneDefinition): Scene {
  const base = createSideView();
  for (const p of zone.portals) {
    const label = new Text({
      text: p.label,
      resolution: 3,
      style: new TextStyle({
        fontFamily: 'Cinzel, serif',
        fontSize: 9.5,
        fontWeight: '700',
        fill: COLORS.gold,
        stroke: { color: COLORS.ink, width: 3, join: 'round' }
      })
    });
    label.anchor.set(0.5, 1);
    label.position.set(p.x + p.w / 2 + (p.x < 200 ? 34 : -34), p.y - 26);
    base.front.addChild(label);
  }
  return base;
}

export function createZoneScene(zone: ZoneDefinition): Scene {
  if (zone.id === 'agora') return createAgoraScene(zone);
  if (zone.id === 'plaines') return createPlainesScene(zone);
  if (zone.id === 'sanctuaire') return createSanctuaireScene(zone);
  return createRivageScene(zone);
}
