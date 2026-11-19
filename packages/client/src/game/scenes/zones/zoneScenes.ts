import { AlphaFilter, Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { ZoneDefinition, ZonePortal, ZoneSolid } from '../../data/zones';
import { placeLayer, View } from '../../camera';
import type { Scene } from '../index';
import { COLORS, mix } from '../palette';
import { drawMeander, drawLaurel } from '../shapes';
import { createSideView } from '../sideView';
import { castShadow, random, SHADOW_DX, SHADOW_DY } from '../top/util';
import { drawColumn, drawLowWall, drawOlive } from '../top/props';
import { BRONZE, BRONZE_LIT, BRONZE_SHADE, LINE, LINEN, LINEN_SHADE, WOOD, shaded } from '../../hero/look';

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
  const isTop = cy < 120;
  const isBottom = cy > 980;
  const offsetX = isTop || isBottom ? 0 : cx < 200 ? 68 : -68;
  const offsetY = isTop ? 48 : isBottom ? -46 : -52;
  label.position.set(cx + offsetX, cy + offsetY);
  return label;
}

function drawSlab(g: Graphics, x: number, y: number, w: number, h: number, color: number): void {
  g.rect(x + 1, y + 1, w - 2, h - 2).fill({ color });
  g.rect(x + 1, y + 1, w - 2, 1.5).fill({ color: COLORS.marbleLit, alpha: 0.4 });
  g.rect(x + 1, y + h - 2.5, w - 2, 1.5).fill({ color: COLORS.marbleShadow, alpha: 0.28 });
}

function drawGrassTuft(g: Graphics, x: number, y: number, rand: () => number, flower = false): void {
  g.ellipse(x + 1, y + 1, 5.5, 3).fill({ color: COLORS.olive, alpha: 0.3 });
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (rand() - 0.5) * 2.3;
    const len = 3.5 + rand() * 4.5;
    g.moveTo(x, y).quadraticCurveTo(x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len);
  }
  g.stroke({ width: 1.2, color: COLORS.oliveDark, cap: 'round' });
  if (flower) {
    g.circle(x + 2, y - 3, 1.4).fill({ color: COLORS.gold });
    g.circle(x - 3, y - 2, 1.2).fill({ color: COLORS.marbleLit });
  }
}

function drawCypress(g: Graphics, shadows: Graphics, s: ZoneSolid, seed: number): void {
  const rand = random(seed);
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  shadows.ellipse(cx + SHADOW_DX * 36, cy + SHADOW_DY * 36, 12, 8).fill({ color: 0x000000 });
  shadows.poly([cx - 6, cy + 4, cx + 6, cy - 4, cx + SHADOW_DX * 44, cy + SHADOW_DY * 44]).fill({ color: 0x000000 });

  g.circle(cx, cy, 14.5).fill({ color: COLORS.ink });
  g.circle(cx, cy, 12.8).fill({ color: 0x1e3520 });
  g.circle(cx - 2, cy - 2, 10).fill({ color: COLORS.cypress });
  g.circle(cx - 4, cy - 4, 6.2).fill({ color: mix(COLORS.cypress, COLORS.olive, 0.5) });
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const d = 3 + rand() * 8;
    g.circle(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.6).fill({
      color: Math.cos(a + 0.8) < 0 ? COLORS.olive : 0x1a2e1c,
      alpha: 0.85
    });
  }
}

function drawHouse(g: Graphics, shadows: Graphics, s: ZoneSolid): void {
  castShadow(shadows, s.x, s.y, s.w, s.h, 34);
  const v = s.variant ?? 0;
  const roofLit = v === 1 ? mix(COLORS.tile, COLORS.bronze, 0.35) : v === 2 ? mix(COLORS.tile, COLORS.sand, 0.2) : COLORS.tile;
  const roofDark = mix(roofLit, COLORS.ink, 0.32);

  // socle en marbre visible au sud
  g.rect(s.x, s.y + s.h - 14, s.w, 14).fill(COLORS.marbleShade);
  g.rect(s.x, s.y + s.h - 14, s.w, 4).fill(COLORS.marbleShadow);

  // toit a deux pans en terre cuite
  const midY = s.y + (s.h - 12) / 2;
  g.rect(s.x, s.y, s.w, midY - s.y).fill(roofLit);
  g.rect(s.x, midY, s.w, s.y + s.h - 12 - midY).fill(roofDark);

  // rangees de tuiles
  for (let x = s.x + 12; x < s.x + s.w - 4; x += 12) {
    g.moveTo(x, s.y + 2).lineTo(x, s.y + s.h - 13).stroke({ width: 0.9, color: COLORS.ink, alpha: 0.22 });
  }
  for (let y = s.y + 14; y < s.y + s.h - 14; y += 14) {
    g.moveTo(s.x + 2, y).lineTo(s.x + s.w - 2, y).stroke({ width: 0.8, color: COLORS.marbleLit, alpha: 0.18 });
  }

  // faitage en marbre/terre cuite claire
  g.rect(s.x + 4, midY - 3, s.w - 8, 6).fill(COLORS.marbleLit);
  g.rect(s.x + 4, midY + 1, s.w - 8, 2).fill(COLORS.marbleShadow);
  g.rect(s.x, s.y, s.w, s.h).stroke({ width: 2, color: COLORS.ink });

  // petite porte d'entree au sud
  const dx = s.x + s.w / 2 - 10;
  g.rect(dx, s.y + s.h - 11, 20, 11).fill(WOOD).stroke({ width: 1.2, color: COLORS.ink });
}

function drawStall(g: Graphics, shadows: Graphics, s: ZoneSolid): void {
  castShadow(shadows, s.x, s.y, s.w, s.h, 18);
  const stripes = [COLORS.tile, COLORS.sea, COLORS.bronze];
  const accent = stripes[(s.variant ?? 0) % stripes.length];

  // auvent raye du marche
  const bandW = 12;
  let idx = 0;
  for (let x = s.x; x < s.x + s.w; x += bandW) {
    const w = Math.min(bandW, s.x + s.w - x);
    g.rect(x, s.y, w, s.h).fill(idx % 2 === 0 ? accent : LINEN);
    idx++;
  }
  // ombre sur la partie basse de la toile
  g.rect(s.x, s.y + s.h - 9, s.w, 9).fill({ color: COLORS.shadow, alpha: 0.22 });
  g.rect(s.x, s.y, s.w, 3).fill({ color: COLORS.marbleLit, alpha: 0.55 });
  g.rect(s.x, s.y, s.w, s.h).stroke({ width: 1.8, color: COLORS.ink });

  // amphores et caisses devant l'etal
  g.circle(s.x + 12, s.y + s.h + 5, 4.5).fill(COLORS.tile).stroke({ width: 1, color: COLORS.ink });
  g.circle(s.x + 22, s.y + s.h + 4, 3.5).fill(BRONZE).stroke({ width: 1, color: COLORS.ink });
  g.rect(s.x + s.w - 22, s.y + s.h + 1, 14, 9).fill(WOOD).stroke({ width: 1, color: COLORS.ink });
}

function drawFountain(g: Graphics, shadows: Graphics, s: ZoneSolid): void {
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  const r = s.w / 2;
  shadows.circle(cx + SHADOW_DX * 14, cy + SHADOW_DY * 14, r).fill({ color: 0x000000 });
  g.circle(cx, cy, r).fill(COLORS.marble).stroke({ width: 2, color: COLORS.ink });
  g.circle(cx, cy, r - 6).fill(COLORS.seaLight).stroke({ width: 1.2, color: COLORS.marbleShadow });
  g.circle(cx, cy, r - 13).fill({ color: COLORS.sea, alpha: 0.5 });
  g.circle(cx, cy, 8).fill(COLORS.marbleLit).stroke({ width: 1.2, color: COLORS.ink });
  g.circle(cx, cy, 3).fill(COLORS.foam);
}

function drawAnvilProp(g: Graphics, shadows: Graphics, s: ZoneSolid): void {
  castShadow(shadows, s.x, s.y, s.w, s.h, 16);
  g.roundRect(s.x, s.y, s.w, s.h, 4).fill(COLORS.marbleShade).stroke({ width: 1.8, color: COLORS.ink });
  g.circle(s.x + s.w - 14, s.y + s.h / 2, 10).fill({ color: 0x3b1f14 }).stroke({ width: 1.2, color: COLORS.ink });
  g.circle(s.x + s.w - 14, s.y + s.h / 2, 6.5).fill({ color: 0xf97316 });
  g.circle(s.x + s.w - 14, s.y + s.h / 2, 3).fill({ color: 0xfef08a });
  g.roundRect(s.x + 8, s.y + 9, 24, 16, 3).fill(shaded(BRONZE_LIT, BRONZE_SHADE)).stroke(LINE);
}

function drawHealerTent(g: Graphics, shadows: Graphics, s: ZoneSolid): void {
  castShadow(shadows, s.x, s.y, s.w, s.h, 22);
  g.roundRect(s.x, s.y, s.w, s.h, 5).fill(shaded(LINEN, LINEN_SHADE)).stroke({ width: 1.8, color: COLORS.ink });
  g.moveTo(s.x + 4, s.y + s.h / 2).lineTo(s.x + s.w - 4, s.y + s.h / 2).stroke({ width: 1.5, color: COLORS.olive });
  drawMeander(g, s.x + 6, s.y + 5, s.w - 12, 1.6, COLORS.olive);
  g.circle(s.x + s.w - 12, s.y + s.h - 10, 5).fill(COLORS.tile).stroke({ width: 1, color: COLORS.ink });
}

function drawRock(g: Graphics, shadows: Graphics, s: ZoneSolid, seed: number): void {
  const rand = random(seed);
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  castShadow(shadows, s.x + 4, s.y + 4, s.w - 8, s.h - 8, 20);
  const pts: number[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const rx = (s.w / 2) * (0.82 + rand() * 0.28);
    const ry = (s.h / 2) * (0.82 + rand() * 0.28);
    pts.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
  }
  g.poly(pts).fill(shaded(0xc4b8a3, 0x7b7265)).stroke({ width: 1.8, color: COLORS.ink });
  // facette eclairee haut-gauche
  g.poly([
    cx - s.w * 0.3, cy - s.h * 0.1,
    cx - s.w * 0.1, cy - s.h * 0.34,
    cx + s.w * 0.18, cy - s.h * 0.18,
    cx - s.w * 0.05, cy + s.h * 0.05
  ]).fill({ color: COLORS.marbleLit, alpha: 0.45 });
  // facette ombre bas-droite
  g.poly([
    cx, cy + s.h * 0.02,
    cx + s.w * 0.32, cy - s.h * 0.04,
    cx + s.w * 0.22, cy + s.h * 0.32,
    cx - s.w * 0.12, cy + s.h * 0.28
  ]).fill({ color: COLORS.ink, alpha: 0.2 });
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

function drawOrganicCrater(g: Graphics, cx: number, cy: number, r: number, seed: number): void {
  const rand = random(seed);
  const outer: number[] = [];
  const inner: number[] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const j1 = 0.78 + rand() * 0.42;
    const j2 = 0.48 + rand() * 0.25;
    outer.push(cx + Math.cos(a) * r * j1, cy + Math.sin(a) * r * j1 * 0.78);
    inner.push(cx + Math.cos(a) * r * j2, cy + Math.sin(a) * r * j2 * 0.78);
  }
  g.poly(outer).fill({ color: 0x5c5144, alpha: 0.48 });
  g.poly(inner).fill({ color: 0x2c241e, alpha: 0.72 });
  // petits blocs de pierre projetes autour du cratere
  for (let i = 0; i < 8; i++) {
    const a = rand() * Math.PI * 2;
    const d = r * (0.75 + rand() * 0.55);
    g.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.78, 3 + rand() * 4, 2 + rand() * 3)
      .fill({ color: COLORS.marbleShadow, alpha: 0.8 })
      .stroke({ width: 0.8, color: COLORS.ink, alpha: 0.6 });
  }
  // legere braise au fond
  g.ellipse(cx, cy, r * 0.22, r * 0.14).fill({ color: 0xea580c, alpha: 0.35 });
}

function drawVolcanicRift(g: Graphics, glowG: Graphics, points: [number, number][], width: number): void {
  const leftEdge: number[] = [];
  const rightEdge: number[] = [];
  const coreLeft: number[] = [];
  const coreRight: number[] = [];

  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    const [nx, ny] = i < points.length - 1 ? points[i + 1] : points[i - 1];
    const dx = i < points.length - 1 ? nx - x : x - nx;
    const dy = i < points.length - 1 ? ny - y : y - ny;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len;
    const py = dx / len;
    const taper = i === 0 || i === points.length - 1 ? 0.2 : 1;
    const w = width * taper;
    leftEdge.push(x + px * w, y + py * w);
    rightEdge.unshift(x - px * w, y - py * w);
    coreLeft.push(x + px * (w * 0.42), y + py * (w * 0.42));
    coreRight.unshift(x - px * (w * 0.42), y - py * (w * 0.42));
  }

  g.poly([...leftEdge, ...rightEdge]).fill({ color: 0x1c1917 }).stroke({ width: 2, color: COLORS.marbleShadow });
  glowG.poly([...coreLeft, ...coreRight]).fill({ color: 0xea580c, alpha: 0.85 });
  const centerLine: number[] = [];
  for (const [x, y] of points) centerLine.push(x, y);
  glowG.poly(centerLine, false).stroke({ width: 2.5, color: 0xfef08a, alpha: 0.9, cap: 'round' });
}

function createPortalMarker(portal: ZonePortal) {
  const cx = portal.x + portal.w / 2;
  const cy = portal.y + portal.h / 2;
  const floor = new Container();
  floor.position.set(cx, cy);
  const g = new Graphics();
  g.circle(0, 0, 36).fill({ color: COLORS.gold, alpha: 0.2 });
  g.circle(0, 0, 32).stroke({ width: 1.6, color: COLORS.gold, alpha: 0.9 });
  drawLaurel(g, 0, 0, 26, 0xd9a93f);
  g.circle(0, 0, 17).fill({ color: COLORS.gold, alpha: 0.35 });
  floor.addChild(g);

  const glow = new Graphics();
  glow.position.set(cx, cy);
  glow.blendMode = 'add';
  glow.circle(0, 0, 48).fill({ color: COLORS.gold, alpha: 0.24 });

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
  const back = new Container();
  const front = new Container();
  const rand = random(42);
  const W = zone.width;
  const H = zone.height;

  // Mer Egee tout autour de la cite (surtout visible a l'ouest et au sud)
  const sea = new Graphics();
  sea.rect(-500, -500, W + 1000, H + 1000).fill({ color: COLORS.sea });
  const waves = new Graphics();
  for (let i = 0; i < 65; i++) {
    const wx = -240 + rand() * (W + 480);
    const wy = -240 + rand() * (H + 480);
    waves.ellipse(wx, wy, 22 + rand() * 30, 3.5).fill({ color: COLORS.seaLight, alpha: 0.35 });
  }

  // Plage / quai naturel a l'ouest et au sud
  const ground = new Graphics();
  ground.roundRect(-24, -24, W + 48, H + 48, 36).fill({ color: COLORS.sand });
  ground.roundRect(0, 0, W, H, 16).fill({ color: COLORS.stoneJoint });

  // Sol de la cite : dalles variees
  const tile = 60;
  for (let y = 0; y < H; y += tile) {
    for (let x = 0; x < W; x += tile) {
      const inWestHarbor = x < 240 && y > 780;
      if (inWestHarbor) {
        ground.rect(x, y, tile, tile).fill({ color: COLORS.seaLight });
        continue;
      }
      const inGarden = x > 320 && x < 860 && y > 840 && y < 1300;
      const onNSRoad = x >= 990 && x < 1170;
      const onEWRoad = y >= 610 && y < 770;
      let color: number;
      if (onNSRoad || onEWRoad) {
        color = mix(COLORS.marble, COLORS.stone, 0.25 + rand() * 0.25);
      } else if (inGarden) {
        color = mix(COLORS.grass, COLORS.sand, 0.35 + rand() * 0.25);
      } else {
        color = mix(COLORS.stone, COLORS.sand, 0.2 + rand() * 0.45);
      }
      drawSlab(ground, x, y, tile, tile, color);
    }
  }

  // Quais en bois et barques grecques dans le port Sud-Ouest
  ground.rect(240, 780, 14, 520).fill(COLORS.marbleShade).stroke({ width: 2, color: COLORS.ink });
  for (const py of [860, 1020, 1180]) {
    ground.rect(100, py, 142, 34).fill(WOOD).stroke({ width: 1.6, color: COLORS.ink });
    for (let px = 112; px < 238; px += 14) {
      ground.moveTo(px, py).lineTo(px, py + 34).stroke({ width: 0.9, color: COLORS.ink, alpha: 0.35 });
    }
  }
  // 2 bateaux amarres
  for (const [bx, by] of [[125, 925], [140, 1090]]) {
    ground.poly([bx - 36, by, bx - 16, by - 14, bx + 26, by - 14, bx + 42, by, bx + 26, by + 14, bx - 16, by + 14])
      .fill(shaded(0xa66a3c, WOOD)).stroke({ width: 1.8, color: COLORS.ink });
    ground.ellipse(bx + 2, by, 22, 7).fill(0x5c361c);
    ground.circle(bx + 2, by, 3).fill(COLORS.marbleLit);
  }

  // Grande Place Centrale de l'Agora (1080, 660) avec mosaique et meandre
  const cx = 1080;
  const cy = 660;
  ground.circle(cx, cy, 240).fill(COLORS.marble).stroke({ width: 2.5, color: COLORS.marbleLit });
  ground.circle(cx, cy, 175).fill(COLORS.stone).stroke({ width: 2, color: COLORS.gold, alpha: 0.85 });
  ground.circle(cx, cy, 130).fill(COLORS.marbleShade);
  drawLaurel(ground, cx, cy, 106, COLORS.bronze);
  ground.circle(cx, cy, 72).fill(COLORS.marbleLit).stroke({ width: 1.8, color: COLORS.gold });
  drawMeander(ground, cx - 150, cy - 224, 300, 2.2, COLORS.bronze);
  drawMeander(ground, cx - 150, cy + 214, 300, 2.2, COLORS.bronze);

  // Place du Marche (Sud-Est) pavee de marbre clair
  ground.roundRect(1310, 810, 480, 320, 12).fill({ color: COLORS.marble, alpha: 0.55 }).stroke({ width: 1.5, color: COLORS.marbleLit, alpha: 0.6 });

  // Touffes d'herbe et fleurs dans le jardin et au bord des dalles
  for (let i = 0; i < 65; i++) {
    const gx = 320 + rand() * 540;
    const gy = 840 + rand() * 440;
    drawGrassTuft(ground, gx, gy, rand, i % 3 === 0);
  }
  for (let i = 0; i < 40; i++) {
    const gx = 280 + rand() * (W - 360);
    const gy = 80 + rand() * (H - 160);
    if (Math.hypot(gx - cx, gy - cy) < 250) continue;
    drawGrassTuft(ground, gx, gy, rand, i % 5 === 0);
  }

  // Cicatrice d'eclair sur la cour nord-ouest
  drawOrganicCrater(ground, 780, 390, 34, 88);

  // Remparts exterieurs de la cite
  const shadows = new Graphics();
  shadows.filters = [new AlphaFilter({ alpha: 0.25 })];
  const solids = new Graphics();

  // Muret d'enceinte nord et sud
  solids.rect(0, -18, W, 22).fill(COLORS.marble).stroke({ width: 2, color: COLORS.ink });
  solids.rect(0, H - 4, W, 22).fill(COLORS.marble).stroke({ width: 2, color: COLORS.ink });

  let oliveIdx = 0;
  let cypressIdx = 0;
  for (const s of zone.solids) {
    if (s.look === 'column') drawColumn(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h, look: 'column' });
    else if (s.look === 'olive') drawOlive(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h, look: 'olive' }, 30 + oliveIdx++);
    else if (s.look === 'cypress') drawCypress(solids, shadows, s, 60 + cypressIdx++);
    else if (s.look === 'wall') drawLowWall(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h }, s.x < W / 2 ? 1 : -1);
    else if (s.look === 'house') drawHouse(solids, shadows, s);
    else if (s.look === 'stall') drawStall(solids, shadows, s);
    else if (s.look === 'fountain') drawFountain(solids, shadows, s);
    else if (s.look === 'anvil') drawAnvilProp(solids, shadows, s);
    else if (s.look === 'tent') drawHealerTent(solids, shadows, s);
  }

  const portals = zone.portals.map(createPortalMarker);
  const fountainRipple = new Graphics();
  back.addChild(sea, waves, ground, ...portals.map((p) => p.floor), shadows, solids, fountainRipple);

  // Petits oiseaux / feuilles dorees flottantes
  const motes: Graphics[] = [];
  for (let i = 0; i < 20; i++) {
    const m = new Graphics().ellipse(0, 0, 2.5, 1.2).fill({ color: i % 2 === 0 ? COLORS.gold : COLORS.marbleLit });
    front.addChild(m);
    motes.push(m);
  }
  front.addChild(...portals.map((p) => p.glow), ...zone.portals.map(makePortalLabel));

  return {
    back,
    front,
    update: (view: View, time: number) => {
      placeLayer(back, view);
      placeLayer(front, view);
      waves.x = Math.sin(time * 0.9) * 14;
      portals.forEach((p) => p.update(time));

      fountainRipple.clear();
      const r = 8 + ((time * 12) % 16);
      fountainRipple.circle(634, 984, r).stroke({ width: 1.2, color: COLORS.foam, alpha: Math.max(0, 1 - (r - 8) / 16) });

      motes.forEach((m, i) => {
        m.position.set((i * 223 + time * 16) % W, (i * 151 + Math.sin(time + i) * 28) % H);
        m.alpha = 0.4 + Math.sin(time * 2.5 + i) * 0.25;
      });
    }
  };
}

function createPlainesScene(zone: ZoneDefinition): Scene {
  const back = new Container();
  const front = new Container();
  const rand = random(73);
  const W = zone.width;
  const H = zone.height;

  const terrain = new Graphics();
  terrain.rect(-300, -300, W + 600, H + 600).fill({ color: mix(COLORS.sand, COLORS.oliveDark, 0.45) });
  terrain.rect(0, 0, W, H).fill({ color: mix(COLORS.sand, COLORS.stone, 0.28) });

  // Patches organiques de terre seche, herbe d'olivier et calcaire
  for (let i = 0; i < 85; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const c = i % 3 === 0 ? COLORS.grass : i % 3 === 1 ? COLORS.olive : 0xdcc59b;
    terrain.ellipse(x, y, 24 + rand() * 55, 16 + rand() * 34).fill({ color: c, alpha: 0.16 + rand() * 0.1 });
  }

  // Avant-poste ruine a l'entree ouest (sol pave + feu de camp)
  terrain.roundRect(70, 450, 240, 220, 14).fill({ color: COLORS.stone, alpha: 0.72 });

  // Route antique sinueuse et usee (dalles de tailles variees, certaines brisees)
  for (let x = 0; x < W; x += 48) {
    const curveY = 560 + Math.sin(x * 0.0045) * 24;
    terrain.rect(x, curveY - 56, 50, 112).fill({ color: COLORS.stoneJoint, alpha: 0.65 });
    for (let row = 0; row < 3; row++) {
      if (rand() < 0.1) continue; // dalle manquante
      const sw = 36 + rand() * 14;
      const sh = 30 + rand() * 6;
      const sy = curveY - 52 + row * 35 + (rand() - 0.5) * 3;
      const tone = mix(COLORS.stone, COLORS.marbleShade, rand() * 0.55);
      drawSlab(terrain, x + (rand() - 0.5) * 4, sy, sw, sh, tone);
    }
  }

  // Crateres organiques de foudre
  drawOrganicCrater(terrain, 520, 420, 46, 101);
  drawOrganicCrater(terrain, 880, 620, 56, 102);
  drawOrganicCrater(terrain, 1290, 460, 50, 103);
  drawOrganicCrater(terrain, 790, 210, 40, 104);

  // Touffes d'herbe, fleurs et cailloux partout
  for (let i = 0; i < 120; i++) {
    const gx = 30 + rand() * (W - 60);
    const gy = 30 + rand() * (H - 60);
    drawGrassTuft(terrain, gx, gy, rand, i % 6 === 0);
  }
  for (let i = 0; i < 70; i++) {
    terrain.ellipse(rand() * W, rand() * H, 3 + rand() * 4, 2 + rand() * 2.5)
      .fill({ color: COLORS.marbleShadow, alpha: 0.5 });
  }

  terrain.rect(0, 0, W, H).stroke({ width: 6, color: COLORS.ink, alpha: 0.7 });

  const shadows = new Graphics();
  shadows.filters = [new AlphaFilter({ alpha: 0.26 })];
  const solids = new Graphics();

  // Feu de camp de l'avant-poste ouest
  const campFire = new Graphics();
  solids.circle(235, 510, 12).fill(0x4b5563).stroke({ width: 1.4, color: COLORS.ink });

  let oliveIdx = 0;
  let cypressIdx = 0;
  let rockIdx = 0;
  for (const s of zone.solids) {
    if (s.look === 'column') drawColumn(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h, look: 'column' });
    else if (s.look === 'olive') drawOlive(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h, look: 'olive' }, 90 + oliveIdx++);
    else if (s.look === 'cypress') drawCypress(solids, shadows, s, 130 + cypressIdx++);
    else if (s.look === 'wall') drawLowWall(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h }, s.x < W / 2 ? 1 : -1);
    else if (s.look === 'ruin') drawRuinWall(solids, shadows, s);
    else if (s.look === 'rock') drawRock(solids, shadows, s, 160 + rockIdx++);
  }

  const portals = zone.portals.map(createPortalMarker);
  back.addChild(terrain, ...portals.map((p) => p.floor), shadows, solids, campFire);

  const stormFlash = new Graphics().rect(0, 0, W, H).fill({ color: 0xfff8dc });
  stormFlash.alpha = 0;
  const embers: Graphics[] = [];
  for (let i = 0; i < 24; i++) {
    const e = new Graphics().circle(0, 0, 1.7).fill({ color: i % 3 === 0 ? 0xf97316 : COLORS.gold });
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

      campFire.clear();
      const fr = 6 + Math.sin(time * 10) * 1.5;
      campFire.circle(235, 510, fr * 2).fill({ color: 0xf97316, alpha: 0.25 });
      campFire.circle(235, 510, fr).fill({ color: 0xf97316 });
      campFire.circle(235, 510, fr * 0.5).fill({ color: 0xfef08a });

      embers.forEach((e, i) => {
        e.position.set((i * 197 + time * (18 + (i % 4) * 6)) % W, (i * 131 + Math.sin(time + i) * 35 + time * 8) % H);
        e.alpha = 0.32 + Math.sin(time * 3 + i) * 0.28;
      });
      const cycle = time % 11;
      stormFlash.alpha = cycle > 10.65 && cycle < 10.82 ? 0.12 : 0;
    }
  };
}

function createSanctuaireScene(zone: ZoneDefinition): Scene {
  const back = new Container();
  const front = new Container();
  const rand = random(199);
  const W = zone.width;
  const H = zone.height;

  const floor = new Graphics();
  floor.rect(-320, -320, W + 640, H + 640).fill({ color: 0x162030 });
  floor.rect(0, 0, W, H).fill({ color: COLORS.stoneJoint });

  // Dalles de marbre antique variees
  for (let y = 0; y < H; y += 64) {
    for (let x = 0; x < W; x += 64) {
      const tone = mix(COLORS.stone, COLORS.marbleShadow, 0.15 + rand() * 0.42);
      drawSlab(floor, x, y, 64, 64, tone);
    }
  }

  // Corridor d'honneur orne de meandres grecs
  floor.rect(0, 456, W, 108).fill({ color: COLORS.marble, alpha: 0.35 });
  drawMeander(floor, 80, 444, W - 160, 2.2, COLORS.bronze);
  drawMeander(floor, 80, 566, W - 160, 2.2, COLORS.bronze);

  // Arene sacree du Gardien d'Airain (est)
  floor.circle(1210, 510, 175).fill({ color: COLORS.marbleShade, alpha: 0.72 });
  floor.circle(1210, 510, 175).stroke({ width: 3, color: COLORS.gold, alpha: 0.8 });
  drawLaurel(floor, 1210, 510, 142, COLORS.bronze);

  // Failles tectoniques organiques et ramifiees
  const riftGlow = new Graphics();
  drawVolcanicRift(floor, riftGlow, [[510, 70], [545, 165], [520, 250], [575, 340], [560, 395]], 14);
  drawVolcanicRift(floor, riftGlow, [[890, 580], [930, 670], [905, 765], [955, 870], [925, 960]], 16);
  drawVolcanicRift(floor, riftGlow, [[1320, 60], [1365, 140], [1410, 200], [1465, 255]], 13);

  // Mousses et fissures discretes
  for (let i = 0; i < 45; i++) {
    drawGrassTuft(floor, 40 + rand() * (W - 80), 40 + rand() * (H - 80), rand, false);
  }
  floor.rect(0, 0, W, H).stroke({ width: 6, color: COLORS.ink });

  const shadows = new Graphics();
  shadows.filters = [new AlphaFilter({ alpha: 0.28 })];
  const solids = new Graphics();

  let rockIdx = 0;
  for (const s of zone.solids) {
    if (s.look === 'column') drawColumn(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h, look: 'column' });
    else if (s.look === 'wall') drawLowWall(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h }, s.x < W / 2 ? 1 : -1);
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
        e.position.set((i * 157 + Math.sin(time * 1.4 + i) * 30 + W) % W, H - ((i * 97 + time * (22 + (i % 4) * 6)) % H));
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

function createLabyrintheScene(zone: ZoneDefinition): Scene {
  const back = new Container();
  const front = new Container();
  const rand = random(311);
  const W = zone.width;
  const H = zone.height;

  const floor = new Graphics();
  floor.rect(-320, -320, W + 640, H + 640).fill({ color: 0x101826 });
  floor.rect(0, 0, W, H).fill({ color: 0x243042 });

  // dalles cretoises sombres et humides
  for (let y = 0; y < H; y += 56) {
    for (let x = 0; x < W; x += 56) {
      const tone = mix(0x4b5563, COLORS.marbleShadow, 0.25 + rand() * 0.32);
      drawSlab(floor, x, y, 56, 56, tone);
    }
  }

  // grande salle du Minotaure a l'est (1330, 560)
  floor.circle(1330, 560, 235).fill({ color: 0x3b4454, alpha: 0.85 });
  floor.circle(1330, 560, 235).stroke({ width: 3, color: COLORS.bronze, alpha: 0.8 });
  drawLaurel(floor, 1330, 560, 185, COLORS.bronze);
  floor.circle(1330, 560, 95).fill({ color: 0x2a3140 }).stroke({ width: 2, color: COLORS.gold, alpha: 0.7 });

  // meandres graves dans le vestibule d'entree
  drawMeander(floor, 80, 900, 220, 2, COLORS.bronze);

  // fissures de sol
  for (let i = 0; i < 36; i++) {
    const x = 40 + rand() * (W - 80);
    const y = 40 + rand() * (H - 80);
    floor.moveTo(x, y).lineTo(x + (rand() - 0.5) * 40, y + (rand() - 0.5) * 40)
      .stroke({ width: 1.2, color: 0x111827, alpha: 0.45 });
  }

  floor.rect(0, 0, W, H).stroke({ width: 8, color: COLORS.ink });

  const shadows = new Graphics();
  shadows.filters = [new AlphaFilter({ alpha: 0.34 })];
  const solids = new Graphics();

  for (const s of zone.solids) {
    if (s.look === 'column') drawColumn(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h, look: 'column' });
    else if (s.look === 'wall') drawLowWall(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h }, 1);
    else if (s.look === 'ruin') drawRuinWall(solids, shadows, s);
  }

  // braseros muraux dans la salle du Minotaure et les couloirs
  const torchCoords: [number, number][] = [
    [130, 920], [290, 920], [500, 620], [820, 440],
    [1140, 380], [1520, 380], [1140, 740], [1520, 740]
  ];
  const torches = new Graphics();
  for (const [tx, ty] of torchCoords) {
    solids.circle(tx, ty, 9).fill(BRONZE_SHADE).stroke({ width: 1.4, color: COLORS.ink });
  }

  const portals = zone.portals.map(createPortalMarker);
  back.addChild(floor, ...portals.map((p) => p.floor), shadows, solids, torches);

  // nappes de brume derivantes dans le labyrinthe
  const mists: Graphics[] = [];
  for (let i = 0; i < 14; i++) {
    const m = new Graphics().ellipse(0, 0, 90 + rand() * 80, 40 + rand() * 35).fill({ color: 0xcbd5e1, alpha: 0.08 });
    front.addChild(m);
    mists.push(m);
  }
  front.addChild(...portals.map((p) => p.glow), ...zone.portals.map(makePortalLabel));

  return {
    back,
    front,
    update: (view: View, time: number) => {
      placeLayer(back, view);
      placeLayer(front, view);
      portals.forEach((p) => p.update(time));

      torches.clear();
      for (let i = 0; i < torchCoords.length; i++) {
        const [tx, ty] = torchCoords[i];
        const r = 6 + Math.sin(time * 9 + i * 2) * 1.6;
        torches.circle(tx, ty, r * 3).fill({ color: 0xf97316, alpha: 0.16 });
        torches.circle(tx, ty, r).fill({ color: 0xf97316 });
        torches.circle(tx, ty, r * 0.45).fill({ color: 0xfef08a });
      }

      mists.forEach((m, i) => {
        m.position.set(((i * 211 + time * (10 + (i % 3) * 5)) % (W + 180)) - 90, (i * 149) % H);
      });
    }
  };
}

export function createZoneScene(zone: ZoneDefinition): Scene {
  if (zone.id === 'agora') return createAgoraScene(zone);
  if (zone.id === 'plaines') return createPlainesScene(zone);
  if (zone.id === 'sanctuaire') return createSanctuaireScene(zone);
  if (zone.id === 'labyrinthe') return createLabyrintheScene(zone);
  return createRivageScene(zone);
}
