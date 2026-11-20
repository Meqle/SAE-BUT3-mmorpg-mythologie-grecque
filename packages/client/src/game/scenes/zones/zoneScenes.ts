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

function drawAmphoraCluster(g: Graphics, x: number, y: number, seed: number): void {
  const rand = random(seed);
  const count = 2 + Math.floor(rand() * 3);
  for (let i = 0; i < count; i++) {
    const ax = x + (rand() - 0.5) * 24;
    const ay = y + (rand() - 0.5) * 18;
    const r = 4.5 + rand() * 2.2;
    g.ellipse(ax + 2, ay + 3, r, r * 0.65).fill({ color: COLORS.ink, alpha: 0.2 });
    g.circle(ax, ay, r).fill({ color: i % 2 === 0 ? 0xb5593b : 0xc97b4b }).stroke({ width: 1.2, color: COLORS.ink });
    g.circle(ax - 1, ay - 1, r * 0.38).fill({ color: 0x3b2416 });
  }
}

function drawMarketCrates(g: Graphics, x: number, y: number): void {
  g.rect(x + 2, y + 3, 20, 16).fill({ color: COLORS.ink, alpha: 0.22 });
  g.roundRect(x, y, 20, 16, 2).fill({ color: 0x9b6b43 }).stroke({ width: 1.3, color: COLORS.ink });
  g.moveTo(x, y + 8).lineTo(x + 20, y + 8).stroke({ width: 0.9, color: COLORS.ink, alpha: 0.45 });
  g.circle(x + 27, y + 9, 7.5).fill({ color: 0x7c4d2b }).stroke({ width: 1.3, color: COLORS.ink });
  g.circle(x + 27, y + 9, 4).stroke({ width: 0.8, color: COLORS.bronze });
}

function drawMosaicMedallion(g: Graphics, cx: number, cy: number, r: number, accent: number): void {
  g.circle(cx, cy, r).fill({ color: COLORS.marbleLit, alpha: 0.72 }).stroke({ width: 1.8, color: COLORS.ink, alpha: 0.55 });
  g.circle(cx, cy, r * 0.74).stroke({ width: 2.2, color: accent, alpha: 0.65 });
  g.circle(cx, cy, r * 0.42).fill({ color: accent, alpha: 0.22 }).stroke({ width: 1.2, color: COLORS.ink, alpha: 0.4 });
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    g.moveTo(cx + Math.cos(a) * r * 0.44, cy + Math.sin(a) * r * 0.44)
      .lineTo(cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.72)
      .stroke({ width: 1.2, color: COLORS.ink, alpha: 0.3 });
  }
}

function drawFlowerBed(g: Graphics, x: number, y: number, w: number, h: number, seed: number): void {
  const rand = random(seed);
  g.roundRect(x, y, w, h, 8).fill({ color: COLORS.oliveDark, alpha: 0.45 }).stroke({ width: 1.2, color: COLORS.ink, alpha: 0.45 });
  const colors = [0xfef08a, 0xf9a8d4, 0xf8fafc, 0xfdba74];
  for (let i = 0; i < 12; i++) {
    const fx = x + 6 + rand() * (w - 12);
    const fy = y + 6 + rand() * (h - 12);
    g.circle(fx, fy, 2.3).fill({ color: colors[i % colors.length] });
  }
}

function drawBrokenColumn(g: Graphics, x: number, y: number, angle: number): void {
  const dx = Math.cos(angle) * 26;
  const dy = Math.sin(angle) * 26;
  g.moveTo(x - dx + 3, y - dy + 4).lineTo(x + dx + 3, y + dy + 4).stroke({ width: 14, color: COLORS.ink, alpha: 0.22, cap: 'round' });
  g.moveTo(x - dx, y - dy).lineTo(x + dx, y + dy).stroke({ width: 13, color: COLORS.marbleShade, cap: 'round' });
  g.moveTo(x - dx, y - dy).lineTo(x + dx, y + dy).stroke({ width: 1.5, color: COLORS.ink, cap: 'round' });
  g.circle(x + dx, y + dy, 6.5).fill({ color: COLORS.marbleLit }).stroke({ width: 1.2, color: COLORS.ink });
}

function drawStoneBench(g: Graphics, x: number, y: number, horizontal = true): void {
  const w = horizontal ? 46 : 14;
  const h = horizontal ? 14 : 46;
  g.roundRect(x + 2, y + 3, w, h, 3).fill({ color: COLORS.ink, alpha: 0.22 });
  g.roundRect(x, y, w, h, 3).fill({ color: COLORS.marbleLit }).stroke({ width: 1.3, color: COLORS.ink });
}

function drawFallenRelic(g: Graphics, x: number, y: number, seed: number): void {
  const rand = random(seed);
  g.circle(x + 2, y + 2, 9).fill({ color: COLORS.ink, alpha: 0.2 });
  g.circle(x, y, 8.5).fill({ color: COLORS.bronze }).stroke({ width: 1.2, color: COLORS.ink });
  g.circle(x, y, 4.5).stroke({ width: 1, color: COLORS.gold, alpha: 0.7 });
  const a = rand() * Math.PI;
  g.moveTo(x - Math.cos(a) * 16, y - Math.sin(a) * 16).lineTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16)
    .stroke({ width: 2, color: WOOD });
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
  castShadow(shadows, s.x, s.y, s.w, s.h, 36);
  const v = s.variant ?? 0;
  const roofLit = v === 1 ? 0xc26d3a : v === 2 ? 0xa95338 : 0xb85239;
  const roofDark = mix(roofLit, COLORS.ink, 0.34);
  const stucco = v === 1 ? 0xf6efe1 : 0xefe7d6;
  const facadeH = 26;
  const roofH = s.h - facadeH;
  const midY = s.y + roofH * 0.5;

  // Socle en pierre de taille + petites marches devant l'entree
  g.rect(s.x - 3, s.y + s.h - 4, s.w + 6, 7).fill(COLORS.marbleShadow).stroke({ width: 1.2, color: COLORS.ink });
  g.rect(s.x + s.w / 2 - 18, s.y + s.h + 1, 36, 7).fill(COLORS.marbleLit).stroke({ width: 1.2, color: COLORS.ink });

  // Facade sud en chaux blanche grecque (stucco)
  g.rect(s.x, s.y + roofH, s.w, facadeH).fill(stucco).stroke({ width: 1.5, color: COLORS.ink });
  g.rect(s.x, s.y + roofH, s.w, 5).fill({ color: COLORS.ink, alpha: 0.16 }); // ombre de l'avant-toit

  // Deux fenetres a volets bleu egeen + lueur chaude interieure
  const winOffsets = [s.x + 24, s.x + s.w - 44];
  for (const wx of winOffsets) {
    g.rect(wx - 4, s.y + roofH + 7, 4, 12).fill(COLORS.seaLight).stroke({ width: 0.9, color: COLORS.ink });
    g.rect(wx + 14, s.y + roofH + 7, 4, 12).fill(COLORS.seaLight).stroke({ width: 0.9, color: COLORS.ink });
    g.rect(wx, s.y + roofH + 7, 14, 12).fill(0xfbbf24).stroke({ width: 1.1, color: COLORS.ink });
    g.rect(wx + 2, s.y + roofH + 9, 10, 8).fill({ color: 0xfef08a, alpha: 0.7 });
  }

  // Porche central avec porte en bois cintree + 2 mini-colonnes doriques + lanterne
  const doorX = s.x + s.w / 2 - 11;
  g.roundRect(doorX, s.y + roofH + 5, 22, facadeH - 5, 4).fill(0x5c361e).stroke({ width: 1.4, color: COLORS.ink });
  g.circle(doorX + 16, s.y + roofH + 16, 1.8).fill(COLORS.gold);
  // 2 petites colonnes encadrant la porte
  g.rect(doorX - 7, s.y + roofH + 3, 5, facadeH - 3).fill(COLORS.marbleLit).stroke({ width: 1, color: COLORS.ink });
  g.rect(doorX + 24, s.y + roofH + 3, 5, facadeH - 3).fill(COLORS.marbleLit).stroke({ width: 1, color: COLORS.ink });

  // Toit en croupe en tuiles canal mediterraneennes
  g.poly([s.x - 4, s.y + roofH + 2, s.x + 14, midY, s.x + s.w - 14, midY, s.x + s.w + 4, s.y + roofH + 2])
    .fill(roofDark).stroke({ width: 1.5, color: COLORS.ink });
  g.poly([s.x - 4, s.y, s.x + s.w + 4, s.y, s.x + s.w - 14, midY, s.x + 14, midY])
    .fill(roofLit).stroke({ width: 1.5, color: COLORS.ink });
  // Pignons laterales
  g.poly([s.x - 4, s.y, s.x + 14, midY, s.x - 4, s.y + roofH + 2]).fill(mix(roofLit, roofDark, 0.45)).stroke({ width: 1.3, color: COLORS.ink });
  g.poly([s.x + s.w + 4, s.y, s.x + s.w - 14, midY, s.x + s.w + 4, s.y + roofH + 2]).fill(mix(roofDark, COLORS.ink, 0.15)).stroke({ width: 1.3, color: COLORS.ink });

  // Rangees de tuiles canal
  for (let x = s.x + 12; x < s.x + s.w - 10; x += 11) {
    g.moveTo(x, s.y + 3).lineTo(x, s.y + roofH).stroke({ width: 0.9, color: COLORS.ink, alpha: 0.22 });
  }
  for (let y = s.y + 12; y < s.y + roofH - 4; y += 13) {
    g.moveTo(s.x + 6, y).lineTo(s.x + s.w - 6, y).stroke({ width: 0.85, color: COLORS.marbleLit, alpha: 0.2 });
  }

  // Faitage en marbre + ornements dores aux extremites
  g.rect(s.x + 12, midY - 3, s.w - 24, 6).fill(COLORS.marbleLit).stroke({ width: 1.2, color: COLORS.ink });
  g.circle(s.x + 12, midY, 3.5).fill(COLORS.gold).stroke({ width: 1, color: COLORS.ink });
  g.circle(s.x + s.w - 12, midY, 3.5).fill(COLORS.gold).stroke({ width: 1, color: COLORS.ink });
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
  // Enrichissement des coins et ruelles de la cite (mosaiques, amphores, bancs, caisses, parterres)
  drawMosaicMedallion(ground, 220, 365, 42, COLORS.bronze);
  drawMosaicMedallion(ground, 1790, 365, 46, COLORS.sky);
  drawMosaicMedallion(ground, 1545, 955, 38, COLORS.gold);
  drawMosaicMedallion(ground, 540, 1045, 36, COLORS.seaLight);
  drawMosaicMedallion(ground, 1745, 1320, 42, COLORS.bronze);
  drawMosaicMedallion(ground, 830, 150, 36, COLORS.gold);

  // Parterres fleuris et bancs en marbre dans les quartiers
  drawFlowerBed(ground, 355, 865, 86, 36, 401);
  drawFlowerBed(ground, 680, 1020, 74, 34, 402);
  drawFlowerBed(ground, 490, 1275, 95, 34, 403);
  drawFlowerBed(ground, 1250, 130, 96, 36, 404);
  drawFlowerBed(ground, 1750, 495, 84, 34, 405);
  drawStoneBench(ground, 855, 515, true);
  drawStoneBench(ground, 1265, 515, true);
  drawStoneBench(ground, 855, 805, true);
  drawStoneBench(ground, 1265, 805, true);
  drawStoneBench(ground, 610, 880, true);
  drawStoneBench(ground, 150, 540, true);

  // Amphores, caisses du port et du marche, et tapis d'etals
  for (const [ax, ay, sd] of [
    [290, 175, 11], [540, 295, 12], [775, 165, 13], [1345, 185, 14], [1840, 185, 15],
    [1310, 1040, 16], [1765, 965, 17], [1865, 1245, 18], [415, 1230, 19], [280, 825, 20],
    [275, 980, 21], [275, 1150, 22], [1840, 560, 23], [140, 595, 24]
  ]) {
    drawAmphoraCluster(ground, ax, ay, sd);
  }
  for (const [cx2, cy2] of [[265, 890], [265, 1075], [1465, 1105], [1615, 1105], [1820, 845], [185, 245]]) {
    drawMarketCrates(ground, cx2, cy2);
  }
  // Bordure de quai nord du port (empeche visuellement de descendre dans l'eau)
  ground.rect(0, 774, 254, 10).fill(COLORS.marbleShade).stroke({ width: 1.8, color: COLORS.ink });
  // Fissures et dalles patinees dans les coins
  for (let i = 0; i < 60; i++) {
    const fx = 60 + rand() * (W - 120);
    const fy = 60 + rand() * (H - 120);
    if (fx < 260 && fy > 760) continue;
    ground.ellipse(fx, fy, 4 + rand() * 5, 2.5 + rand() * 3).fill({ color: COLORS.marbleShadow, alpha: 0.28 });
  }

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

  // Sentiers secondaires vers les coins et ruines antiques
  for (let i = 0; i < 18; i++) {
    drawSlab(terrain, 260 + i * 24, 460 - i * 18, 22, 20, mix(COLORS.stone, COLORS.sand, 0.5));
    drawSlab(terrain, 1280 + i * 24, 520 - i * 22, 22, 20, mix(COLORS.stone, COLORS.sand, 0.5));
    drawSlab(terrain, 560 - i * 22, 620 + i * 20, 22, 20, mix(COLORS.stone, COLORS.sand, 0.5));
    drawSlab(terrain, 1340 + i * 22, 610 + i * 20, 22, 20, mix(COLORS.stone, COLORS.sand, 0.5));
  }
  // Colonnes brisees, boucliers abandonnes, amphores et buissons dans les coins
  for (const [bx, by, ba] of [
    [140, 160, 0.4], [1640, 185, -0.5], [170, 920, 0.7], [1630, 945, -0.3],
    [980, 145, 0.2], [1120, 970, -0.6], [420, 190, 1.1], [1480, 860, 0.9]
  ]) {
    drawBrokenColumn(terrain, bx, by, ba);
  }
  for (const [rx, ry, sd] of [[240, 240, 51], [1560, 220, 52], [320, 880, 53], [1520, 920, 54], [940, 900, 55]]) {
    drawFallenRelic(terrain, rx, ry, sd);
  }
  for (const [ax, ay, sd] of [[115, 310, 61], [1720, 310, 62], [220, 790, 63], [1690, 800, 64], [160, 510, 65]]) {
    drawAmphoraCluster(terrain, ax, ay, sd);
  }
  for (let i = 0; i < 95; i++) {
    const gx = 30 + rand() * (W - 60);
    const gy = 30 + rand() * (H - 60);
    drawGrassTuft(terrain, gx, gy, rand, i % 4 === 0);
  }
  drawFlowerBed(terrain, 105, 845, 76, 36, 601);
  drawFlowerBed(terrain, 1610, 80, 84, 34, 602);
  drawFlowerBed(terrain, 1590, 995, 90, 36, 603);
  drawFlowerBed(terrain, 95, 95, 84, 36, 604);

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
  // Mosaiques d'angle, colonnes brisees et reliques de guerre dans le Sanctuaire
  drawMosaicMedallion(floor, 155, 145, 42, COLORS.bronze);
  drawMosaicMedallion(floor, 1445, 145, 42, COLORS.bronze);
  drawMosaicMedallion(floor, 155, 875, 42, COLORS.gold);
  drawMosaicMedallion(floor, 1445, 875, 42, COLORS.gold);
  for (const [bx, by, ba] of [[240, 120, 0.3], [1360, 120, -0.4], [250, 910, 0.8], [1340, 910, -0.5], [620, 110, 0.1], [620, 910, -0.2]]) {
    drawBrokenColumn(floor, bx, by, ba);
  }
  for (const [ax, ay, sd] of [[110, 260, 71], [1480, 260, 72], [110, 760, 73], [1480, 760, 74]]) {
    drawAmphoraCluster(floor, ax, ay, sd);
  }
  for (const [rx, ry, sd] of [[390, 130, 81], [1140, 130, 82], [390, 880, 83], [1140, 880, 84]]) {
    drawFallenRelic(floor, rx, ry, sd);
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

  // grande salle du Minotaure a l'est (2060, 860)
  floor.circle(2060, 860, 235).fill({ color: 0x3b4454, alpha: 0.85 });
  floor.circle(2060, 860, 235).stroke({ width: 3, color: COLORS.bronze, alpha: 0.8 });
  drawLaurel(floor, 2060, 860, 185, COLORS.bronze);
  floor.circle(2060, 860, 95).fill({ color: 0x2a3140 }).stroke({ width: 2, color: COLORS.gold, alpha: 0.7 });

  // meandres graves dans le vestibule d'entree
  
  // fissures de sol
  for (let i = 0; i < 36; i++) {
    const x = 40 + rand() * (W - 80);
    const y = 40 + rand() * (H - 80);
    floor.moveTo(x, y).lineTo(x + (rand() - 0.5) * 40, y + (rand() - 0.5) * 40)
      .stroke({ width: 1.2, color: 0x111827, alpha: 0.45 });
  }

  // Braseros muraux et reliques discretement places aux intersections du dedale
  drawMosaicMedallion(floor, 1380, 105, 48, COLORS.gold);
  for (const [rx, ry, sd] of [[190, 1350, 91], [560, 740, 92], [970, 920, 93], [1400, 760, 94], [1920, 380, 95], [2200, 1350, 96]]) {
    drawFallenRelic(floor, rx, ry, sd);
  }
  for (const [ax, ay, sd] of [[95, 1500, 95], [430, 1290, 96], [840, 1280, 97], [1250, 1180, 98]]) {
    drawAmphoraCluster(floor, ax, ay, sd);
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

function createMarecagesScene(zone: ZoneDefinition): Scene {
  const back = new Container();
  const front = new Container();
  const W = zone.width;
  const H = zone.height;

  const ground = new Graphics();
  // Sol vaseux vert-olive de Lerne
  ground.rect(0, 0, W, H).fill({ color: 0x3b4d3b });
  // Zones d'herbe sombre et terre humide
  for (let x = 0; x < W; x += 64) {
    for (let y = 0; y < H; y += 64) {
      const tint = (Math.floor(x / 64) + Math.floor(y / 64)) % 2 === 0 ? 0x445741 : 0x354737;
      ground.rect(x, y, 64, 64).fill({ color: tint, alpha: 0.45 });
    }
  }

  // Etangs toxiques emeraude (decors non-bloquants mais tres lisibles)
  const pools: [number, number, number, number][] = [
    [290, 440, 120, 72],
    [1460, 440, 120, 72],
    [520, 660, 96, 58],
    [1240, 660, 96, 58],
    [290, 760, 110, 64],
    [1470, 760, 110, 64]
  ];
  for (const [px, py, rx, ry] of pools) {
    ground.ellipse(px, py, rx + 8, ry + 6).fill({ color: 0x263327 });
    ground.ellipse(px, py, rx, ry).fill({ color: 0x1f6b47 }).stroke({ width: 2, color: COLORS.ink });
    ground.ellipse(px - rx * 0.2, py - ry * 0.15, rx * 0.55, ry * 0.45).fill({ color: 0x34d399, alpha: 0.25 });
  }

  // Chaussees antiques en marbre moussu (Nord -> centre -> bassins est/ouest)
  for (let y = 40; y < 740; y += 54) {
    drawSlab(ground, 826, y, 54, 52, 0x9aa38f);
    drawSlab(ground, 880, y, 54, 52, 0x8e9984);
  }
  for (let x = 260; x < 1500; x += 56) {
    drawSlab(ground, x, 286, 54, 50, 0x8e9984);
  }

  // Bassin central de l'Hydre de Lerne
  ground.circle(880, 780, 215).fill({ color: 0x1a543a }).stroke({ width: 3, color: COLORS.ink });
  ground.circle(880, 780, 185).fill({ color: 0x2a6b49 }).stroke({ width: 2, color: 0x4ade80, alpha: 0.5 });
  ground.circle(880, 780, 115).stroke({ width: 2, color: COLORS.gold, alpha: 0.45 });

  // Brins de roseaux et mousses
  for (let i = 0; i < 48; i++) {
    const rx = (i * 197 + 90) % (W - 140) + 70;
    const ry = (i * 131 + 110) % (H - 140) + 70;
    ground.moveTo(rx, ry).lineTo(rx - 4, ry - 12).moveTo(rx, ry).lineTo(rx + 4, ry - 10)
      .stroke({ width: 1.5, color: 0x65a30d, alpha: 0.65 });
  }

  // Nenuphars, pierres moussues, colonnes englouties et reliques dans les coins du marais
  for (const [bx, by, ba] of [[145, 290, 0.5], [1600, 290, -0.5], [175, 860, 0.8], [1585, 860, -0.7], [560, 150, 0.2], [1200, 150, -0.2]]) {
    drawBrokenColumn(ground, bx, by, ba);
  }
  for (const [rx, ry, sd] of [[360, 155, 101], [1400, 155, 102], [430, 1010, 103], [1330, 1010, 104]]) {
    drawFallenRelic(ground, rx, ry, sd);
  }
  for (const [px, py] of [[250, 425], [330, 455], [1425, 425], [1500, 455], [260, 755], [1445, 765], [820, 730], [945, 825]]) {
    ground.circle(px, py, 11).fill({ color: 0x3f8f4d, alpha: 0.78 }).stroke({ width: 1.2, color: COLORS.ink });
    ground.circle(px + 3, py - 2, 2.5).fill({ color: 0xfef08a });
  }
  const shadows = new Graphics();
  shadows.filters = [new AlphaFilter({ alpha: 0.34 })];
  const solids = new Graphics();
  let rockIdx = 0;
  let cypressIdx = 0;
  for (const s of zone.solids) {
    if (s.look === 'column') drawColumn(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h, look: 'column' });
    else if (s.look === 'wall') drawLowWall(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h }, s.x < W / 2 ? 1 : -1);
    else if (s.look === 'ruin') drawRuinWall(solids, shadows, s);
    else if (s.look === 'rock') drawRock(solids, shadows, s, 60 + rockIdx++);
    else if (s.look === 'cypress') drawCypress(solids, shadows, s, 180 + cypressIdx++);
  }

  const portals = zone.portals.map(createPortalMarker);
  const bubbles = new Graphics();
  back.addChild(ground, bubbles, ...portals.map((p) => p.floor), shadows, solids);

  const mists: Graphics[] = [];
  for (let i = 0; i < 16; i++) {
    const m = new Graphics().ellipse(0, 0, 56 + (i % 3) * 24, 18 + (i % 2) * 8).fill({ color: 0x4ade80, alpha: 0.08 });
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

      bubbles.clear();
      for (let i = 0; i < pools.length; i++) {
        const [px, py] = pools[i];
        const phase = (time * 1.4 + i * 0.6) % 1;
        const r = 4 + phase * 18;
        bubbles.circle(px + Math.sin(i * 3) * 28, py + Math.cos(i * 2) * 16, r)
          .stroke({ width: 1.5, color: 0x86efac, alpha: (1 - phase) * 0.7 });
      }
      const bPhase = (time * 1.1) % 1;
      bubbles.circle(880 + Math.cos(time) * 65, 780 + Math.sin(time * 1.3) * 45, 5 + bPhase * 20)
        .stroke({ width: 1.8, color: 0x86efac, alpha: (1 - bPhase) * 0.65 });

      mists.forEach((m, i) => {
        m.position.set(((i * 233 + time * 14) % (W + 140)) - 70, (i * 157 + Math.sin(time * 0.7 + i) * 22) % H);
      });
    }
  };
}

function createInteriorScene(zone: ZoneDefinition): Scene {
  const back = new Container();
  const front = new Container();
  const W = zone.width;
  const H = zone.height;
  const isForge = zone.id === 'forge_interieur';
  const isApoth = zone.id === 'apothicairerie_interieur';

  const floor = new Graphics();
  floor.rect(-320, -320, W + 640, H + 640).fill({ color: 0x111827 });

  // Sol chaleureux selon le batiment (parquet taverne / basalte forge / marbre infirmerie)
  if (isForge) {
    floor.rect(0, 0, W, H).fill({ color: 0x3b3835 });
    for (let x = 36; x < W - 36; x += 52) {
      for (let y = 48; y < H - 36; y += 52) {
        drawSlab(floor, x, y, 52, 52, (Math.floor(x / 52) + Math.floor(y / 52)) % 2 === 0 ? 0x4b4642 : 0x403c38);
      }
    }
    // Tapis d'etincelles devant le fourneau
    floor.circle(W / 2, 165, 115).fill({ color: 0xf97316, alpha: 0.14 });
    drawMosaicMedallion(floor, W / 2, 345, 76, COLORS.bronze);
  } else if (isApoth) {
    floor.rect(0, 0, W, H).fill({ color: 0xe9e1cf });
    for (let x = 36; x < W - 36; x += 52) {
      for (let y = 48; y < H - 36; y += 52) {
        drawSlab(floor, x, y, 52, 52, (Math.floor(x / 52) + Math.floor(y / 52)) % 2 === 0 ? 0xf2ead9 : 0xe4d9c3);
      }
    }
    drawMosaicMedallion(floor, W / 2, 255, 110, COLORS.seaLight);
    drawFlowerBed(floor, 80, 500, 120, 44, 701);
    drawFlowerBed(floor, W - 200, 500, 120, 44, 702);
  } else {
    // Taverne : plancher en bois chaleureux + grand tapis rouge-or
    floor.rect(0, 0, W, H).fill({ color: 0x7c5433 });
    for (let y = 48; y < H - 36; y += 26) {
      floor.rect(36, y, W - 72, 24).fill({ color: y % 52 === 0 ? 0x8a5e3a : 0x724c2e });
      floor.moveTo(36, y).lineTo(W - 36, y).stroke({ width: 1, color: 0x3b2416, alpha: 0.45 });
    }
    floor.roundRect(W / 2 - 140, 210, 280, 340, 10).fill({ color: 0x8b2635, alpha: 0.82 }).stroke({ width: 3, color: COLORS.gold });
    floor.roundRect(W / 2 - 126, 224, 252, 312, 6).stroke({ width: 1.5, color: COLORS.marbleLit, alpha: 0.65 });
    // Coin recit d'Homere (tapis circulaire au nord-est) + cheminee au nord-ouest
    floor.circle(760, 195, 76).fill({ color: 0x1e3a5f, alpha: 0.85 }).stroke({ width: 2.5, color: COLORS.gold });
    floor.roundRect(120, 48, 124, 34, 4).fill({ color: 0x4b5563 }).stroke({ width: 2, color: COLORS.ink });
    floor.ellipse(182, 74, 34, 12).fill({ color: 0x3b2416 });
    // Foule assise ecoutant Homere (4 citoyens) + 2 paires de clients discutant aux tables
    const drawPatron = (px: number, py: number, tunic: number) => {
      floor.ellipse(px + 2, py + 3, 10, 8).fill({ color: COLORS.ink, alpha: 0.25 });
      floor.circle(px, py, 9.5).fill({ color: tunic }).stroke({ width: 1.4, color: COLORS.ink });
      floor.circle(px, py - 1, 5).fill({ color: 0xd9a77e }).stroke({ width: 1, color: COLORS.ink });
    };
    // Auditoire d'Homere
    drawPatron(708, 224, 0x58a7cf);
    drawPatron(755, 246, 0xb5523b);
    drawPatron(806, 232, 0x7e8f4e);
    drawPatron(824, 184, 0xc08a3e);
    // Clients discutant aux tables ouest et sud
    drawPatron(155, 254, 0x6b7280);
    drawPatron(235, 254, 0x9b6b43);
    drawPatron(155, 424, 0x4b6b52);
    drawPatron(235, 424, 0x8b3a3a);
    drawPatron(715, 424, 0x5b6b8a);
    drawPatron(800, 424, 0xa16207);
  }

  // Amphores et caisses decoratives aux coins de l'interieur
  drawAmphoraCluster(floor, 82, 92, 811);
  drawAmphoraCluster(floor, W - 82, 92, 812);
  drawMarketCrates(floor, 70, H - 96);
  drawMarketCrates(floor, W - 115, H - 96);

  // Tapis d'entree / sortie au sud
  floor.roundRect(W / 2 - 58, H - 62, 116, 44, 6).fill({ color: COLORS.gold, alpha: 0.28 }).stroke({ width: 2, color: COLORS.gold });

  const shadows = new Graphics();
  shadows.filters = [new AlphaFilter({ alpha: 0.3 })];
  const solids = new Graphics();
  for (const s of zone.solids) {
    if (s.look === 'wall') drawLowWall(solids, shadows, { x: s.x, y: s.y, w: s.w, h: s.h }, 1);
    else if (s.look === 'stall') drawStall(solids, shadows, s);
    else if (s.look === 'anvil') drawAnvilProp(solids, shadows, s);
    else if (s.look === 'fountain') drawFountain(solids, shadows, s);
    else if (s.look === 'altar') drawAltar(solids, shadows, s);
  }

  const portals = zone.portals.map(createPortalMarker);
  const hearthGlow = new Graphics();
  const isTavern = zone.id === 'taverne_interieur';
  const bubbleStyle = new TextStyle({
    fontFamily: 'Outfit, sans-serif',
    fontSize: 10.5,
    fontWeight: '600',
    fill: 0xfef9c3,
    stroke: { color: COLORS.ink, width: 3, join: 'round' }
  });
  const homereBubble = isTavern ? new Text({ text: '', resolution: 3, style: bubbleStyle }) : null;
  const patronBubble = isTavern ? new Text({ text: '', resolution: 3, style: bubbleStyle }) : null;
  if (homereBubble) { homereBubble.anchor.set(0.5, 1); homereBubble.position.set(760, 148); }
  if (patronBubble) { patronBubble.anchor.set(0.5, 1); patronBubble.position.set(195, 232); }

  const homereLines = [
    '« Chante, ô Muse, la colère des dieux... »',
    '« Et le Titan offrit la braise aux mortels... »',
    '« Sous le Sanctuaire dort le Minotaure... »',
    '« Trois reliques briseront le Caucase... »'
  ];
  const patronLines = [
    '« Encore un pichet de Chios, Dionysios ! »',
    '« Paraît que Damon forge des cuirasses rares... »',
    '« Un centaure a failli m’embrocher hier ! »',
    '« Quelle voix cet Homère... »'
  ];

  back.addChild(floor, ...portals.map((p) => p.floor), shadows, solids, hearthGlow);
  front.addChild(...portals.map((p) => p.glow), ...zone.portals.map(makePortalLabel));
  if (homereBubble) front.addChild(homereBubble);
  if (patronBubble) front.addChild(patronBubble);

  return {
    back,
    front,
    update: (view: View, time: number) => {
      placeLayer(back, view);
      placeLayer(front, view);
      portals.forEach((p) => p.update(time));
      hearthGlow.clear();
      const pulse = 0.8 + Math.sin(time * 7) * 0.2;
      if (isForge) {
        hearthGlow.circle(W / 2, 112, 34 * pulse).fill({ color: 0xf97316, alpha: 0.35 });
        hearthGlow.circle(W / 2, 112, 16 * pulse).fill({ color: 0xfef08a, alpha: 0.75 });
      } else if (isApoth) {
        hearthGlow.circle(W / 2, 255, 22 * pulse).fill({ color: 0x38bdf8, alpha: 0.22 });
      } else {
        hearthGlow.circle(182, 74, 26 * pulse).fill({ color: 0xf97316, alpha: 0.38 });
        hearthGlow.circle(182, 74, 12 * pulse).fill({ color: 0xfef08a, alpha: 0.78 });
        if (homereBubble) {
          const idx = Math.floor(time / 5.5) % homereLines.length;
          homereBubble.text = homereLines[idx];
          homereBubble.alpha = 0.75 + Math.sin(time * 2) * 0.25;
        }
        if (patronBubble) {
          const idx = Math.floor((time + 2.7) / 6) % patronLines.length;
          patronBubble.text = patronLines[idx];
          patronBubble.alpha = 0.75 + Math.cos(time * 2) * 0.25;
        }
      }
    }
  };
}

export function createZoneScene(zone: ZoneDefinition): Scene {
  if (zone.id === 'agora') return createAgoraScene(zone);
  if (zone.id === 'plaines') return createPlainesScene(zone);
  if (zone.id === 'sanctuaire') return createSanctuaireScene(zone);
  if (zone.id === 'labyrinthe') return createLabyrintheScene(zone);
  if (zone.id === 'marecages') return createMarecagesScene(zone);
  if (zone.id === 'taverne_interieur' || zone.id === 'forge_interieur' || zone.id === 'apothicairerie_interieur') return createInteriorScene(zone);
  return createRivageScene(zone);
}
