import { useEffect, useRef } from 'react';
import type { ZoneDefinition } from '../../game/data/zones';
import { COLORS, css } from '../../game/scenes/palette';

export interface MinimapMarker {
  x: number;
  y: number;
  kind: 'player' | 'npc' | 'npc_quest' | 'enemy' | 'boss' | 'portal' | 'interact' | 'loot';
  angle?: number;
}

interface MinimapProps {
  zone: ZoneDefinition;
  markers: MinimapMarker[];
  onOpenWorldMap?: () => void;
}

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);

export function Minimap({ zone, markers, onOpenWorldMap }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapW = 176;
  const mapH = Math.max(66, Math.min(120, Math.round((zone.height / zone.width) * mapW)));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sx = mapW / zone.width;
    const sy = mapH / zone.height;

    ctx.clearRect(0, 0, mapW, mapH);

    // 1. Fond terrain specifique a chaque zone
    if (zone.id === 'agora') {
      ctx.fillStyle = '#d9ccb2';
      ctx.fillRect(0, 0, mapW, mapH);
      // port mer Egee (sud-ouest)
      ctx.fillStyle = '#2579a8';
      ctx.fillRect(0, 780 * sy, 240 * sx, (zone.height - 780) * sy);
      // jardin vert de Cassandre
      ctx.fillStyle = '#7e8f4e';
      ctx.fillRect(320 * sx, 840 * sy, 540 * sx, 460 * sy);
      // avenues en marbre clair
      ctx.fillStyle = '#f2eadc';
      ctx.fillRect(990 * sx, 0, 180 * sx, mapH);
      ctx.fillRect(0, 610 * sy, mapW, 160 * sy);
      // place centrale circulaire
      ctx.beginPath();
      ctx.arc(1080 * sx, 660 * sy, 235 * sx, 0, Math.PI * 2);
      ctx.fillStyle = '#f8f2e6';
      ctx.fill();
      ctx.strokeStyle = '#c08a3e';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (zone.id === 'plaines') {
      ctx.fillStyle = '#d4c39d';
      ctx.fillRect(0, 0, mapW, mapH);
      // avant-poste ouest
      ctx.fillStyle = '#e5dac2';
      ctx.fillRect(70 * sx, 450 * sy, 240 * sx, 220 * sy);
      // route est-ouest
      ctx.fillStyle = '#e8dec9';
      ctx.fillRect(0, 505 * sy, mapW, 110 * sy);
      // crateres
      ctx.fillStyle = '#5c4e41';
      for (const [cx, cy, r] of [[520, 420, 46], [880, 620, 56], [1290, 460, 50], [790, 210, 40]]) {
        ctx.beginPath();
        ctx.arc(cx * sx, cy * sy, r * sx, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (zone.id === 'sanctuaire') {
      ctx.fillStyle = '#c5baa5';
      ctx.fillRect(0, 0, mapW, mapH);
      ctx.fillStyle = '#dfd5c3';
      ctx.fillRect(0, 456 * sy, mapW, 108 * sy);
      ctx.beginPath();
      ctx.arc(1210 * sx, 510 * sy, 175 * sx, 0, Math.PI * 2);
      ctx.fillStyle = '#d5c9b2';
      ctx.fill();
      ctx.strokeStyle = '#c08a3e';
      ctx.lineWidth = 1;
      ctx.stroke();
      // failles volcaniques
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      for (const pts of [
        [[510, 70], [545, 165], [520, 250], [575, 340], [560, 395]],
        [[890, 580], [930, 670], [905, 765], [955, 870], [925, 960]],
        [[1320, 60], [1365, 140], [1410, 200], [1465, 255]]
      ]) {
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x * sx, y * sy) : ctx.lineTo(x * sx, y * sy)));
        ctx.stroke();
      }
    } else if (zone.id === 'labyrinthe') {
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(0, 0, mapW, mapH);
      ctx.beginPath();
      ctx.arc(1330 * sx, 560 * sy, 235 * sx, 0, Math.PI * 2);
      ctx.fillStyle = '#3f4a5e';
      ctx.fill();
      ctx.strokeStyle = '#c08a3e';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (zone.id === 'marecages') {
      ctx.fillStyle = '#354737';
      ctx.fillRect(0, 0, mapW, mapH);
      ctx.fillStyle = '#8e9984';
      ctx.fillRect(826 * sx, 40 * sy, 108 * sx, 700 * sy);
      ctx.fillRect(260 * sx, 286 * sy, 1240 * sx, 50 * sy);
      ctx.fillStyle = '#1f6b47';
      for (const [px, py, rx, ry] of [[290, 440, 120, 72], [1460, 440, 120, 72], [290, 760, 110, 64], [1470, 760, 110, 64]]) {
        ctx.beginPath();
        ctx.ellipse(px * sx, py * sy, rx * sx, ry * sy, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(880 * sx, 780 * sy, 200 * sx, 0, Math.PI * 2);
      ctx.fillStyle = '#1a543a';
      ctx.fill();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // vue de profil Rivage d'Egee
      ctx.fillStyle = '#7bb4db';
      ctx.fillRect(0, 0, mapW, mapH * 0.65);
      ctx.fillStyle = '#1f6f9e';
      ctx.fillRect(0, mapH * 0.55, mapW, mapH * 0.35);
      ctx.fillStyle = '#e5cfa0';
      ctx.fillRect(0, 472 * sy, mapW, (zone.height - 472) * sy);
    }

    // 2. Obstacles, maisons, etals, colonnes et plateformes a l'echelle
    for (const s of zone.solids) {
      const rx = s.x * sx;
      const ry = s.y * sy;
      const rw = Math.max(2, s.w * sx);
      const rh = Math.max(2, s.h * sy);

      if (s.look === 'house') {
        ctx.fillStyle = '#b5523b';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#1f3550';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(rx, ry, rw, rh);
      } else if (s.look === 'stall' || s.look === 'anvil' || s.look === 'tent') {
        ctx.fillStyle = '#c08a3e';
        ctx.fillRect(rx, ry, rw, rh);
      } else if (s.look === 'fountain') {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(rx + rw / 2, ry + rh / 2, rw / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (s.look === 'olive' || s.look === 'cypress') {
        ctx.fillStyle = s.look === 'cypress' ? '#2f4a2a' : '#65783a';
        ctx.beginPath();
        ctx.arc(rx + rw / 2, ry + rh / 2, Math.max(2.5, rw / 2), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#8b8378';
        ctx.fillRect(rx, ry, rw, rh);
      }
    }

    // 3. Marqueurs dynamiques (portails, objets, PNJ, ennemis, joueur)
    for (const m of markers) {
      const mx = m.x * sx;
      const my = m.y * sy;
      if (m.kind === 'portal') {
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#1f3550';
        ctx.lineWidth = 1;
        ctx.fillRect(mx - 3, my - 4, 6, 8);
        ctx.strokeRect(mx - 3, my - 4, 6, 8);
      } else if (m.kind === 'interact') {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(mx, my, 2.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.kind === 'npc' || m.kind === 'npc_quest') {
        ctx.fillStyle = m.kind === 'npc_quest' ? '#facc15' : '#4ade80';
        ctx.strokeStyle = '#1f3550';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mx, my, m.kind === 'npc_quest' ? 3.5 : 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (m.kind === 'loot') {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#1f3550';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(mx, my - 3.6);
        ctx.lineTo(mx + 3.4, my);
        ctx.lineTo(mx, my + 3.6);
        ctx.lineTo(mx - 3.4, my);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (m.kind === 'enemy' || m.kind === 'boss') {
        ctx.fillStyle = m.kind === 'boss' ? '#f97316' : '#dc2626';
        ctx.beginPath();
        ctx.arc(mx, my, m.kind === 'boss' ? 4.2 : 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const player = markers.find((m) => m.kind === 'player');
    if (player) {
      const px = player.x * sx;
      const py = player.y * sy;
      const a = player.angle ?? 0;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(a);
      ctx.fillStyle = '#ffe761';
      ctx.strokeStyle = '#1f3550';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(5.5, 0);
      ctx.lineTo(-4, -3.6);
      ctx.lineTo(-2.2, 0);
      ctx.lineTo(-4, 3.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }, [zone, markers, mapW, mapH]);

  return (
    <div onClick={onOpenWorldMap} title="Ouvrir la carte du monde" style={{ cursor: onOpenWorldMap ? 'pointer' : 'default',
      background: 'rgba(26, 45, 70, 0.92)',
      border: `2px solid ${MARBLE}`,
      boxShadow: `inset 0 0 0 2px rgba(26, 45, 70, 0.92), inset 0 0 0 3px ${GOLD}, 0 4px 12px rgba(0, 0, 0, 0.35)`,
      borderRadius: 4,
      padding: 6,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, padding: '0 2px' }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: 0.6 }}>
          {zone.name}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: MARBLE, opacity: 0.8 }}>[M] • N</span>
      </div>
      <canvas
        ref={canvasRef}
        width={mapW}
        height={mapH}
        style={{ display: 'block', borderRadius: 2, border: '1px solid rgba(31, 53, 80, 0.9)' }}
      />
    </div>
  );
}
