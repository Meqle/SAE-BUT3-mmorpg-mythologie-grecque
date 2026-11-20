import { useEffect, useRef, useState } from 'react';
import { Compass, Map, MapPin, Navigation, X } from 'lucide-react';
import { NPCS } from '../../game/data/story';
import { ZoneId, ZONES } from '../../game/data/zones';
import { COLORS, css } from '../../game/scenes/palette';
import type { MinimapMarker } from './Minimap';

interface WorldMapModalProps {
  currentZone: ZoneId;
  discoveredZones: ZoneId[];
  markers?: MinimapMarker[];
  mapKeyLabel?: string;
  onFastTravel: (zoneId: ZoneId) => void;
  onClose: () => void;
}

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);
const SKY = css(COLORS.sky);

const NODES: { id: ZoneId; x: number; y: number; tag: string }[] = [
  { id: 'rivage', x: 13, y: 50, tag: 'Vue de profil • Boss' },
  { id: 'agora', x: 34, y: 50, tag: 'Cité-Refuge' },
  { id: 'plaines', x: 56, y: 50, tag: 'Niv. 1 - 4' },
  { id: 'sanctuaire', x: 78, y: 50, tag: 'Niv. 4 - 7' },
  { id: 'labyrinthe', x: 78, y: 18, tag: 'Donjon • Niv. 7 - 10' },
  { id: 'marecages', x: 78, y: 82, tag: 'Donjon • Niv. 7 - 10' }
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [3, 5],
  [3, 0]
];

export function WorldMapModal({
  currentZone,
  discoveredZones,
  markers = [],
  mapKeyLabel = 'M',
  onFastTravel,
  onClose
}: WorldMapModalProps) {
  const [tab, setTab] = useState<'zone' | 'world'>('zone');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zone = ZONES[currentZone];

  const canvasW = 680;
  const canvasH = Math.max(250, Math.min(410, Math.round((zone.height / zone.width) * canvasW)));

  useEffect(() => {
    if (tab !== 'zone') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sx = canvasW / zone.width;
    const sy = canvasH / zone.height;
    ctx.clearRect(0, 0, canvasW, canvasH);

    // 1. Fond terrain detaille par zone
    if (zone.id === 'agora') {
      ctx.fillStyle = '#d9ccb2';
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.fillStyle = '#2579a8';
      ctx.fillRect(0, 780 * sy, 240 * sx, (zone.height - 780) * sy);
      ctx.fillStyle = '#7e8f4e';
      ctx.fillRect(320 * sx, 840 * sy, 540 * sx, 460 * sy);
      ctx.fillStyle = '#f2eadc';
      ctx.fillRect(990 * sx, 0, 180 * sx, canvasH);
      ctx.fillRect(0, 610 * sy, canvasW, 160 * sy);
      ctx.beginPath();
      ctx.arc(1080 * sx, 660 * sy, 235 * sx, 0, Math.PI * 2);
      ctx.fillStyle = '#f8f2e6';
      ctx.fill();
      ctx.strokeStyle = '#c08a3e';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (zone.id === 'plaines') {
      ctx.fillStyle = '#d4c39d';
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.fillStyle = '#e5dac2';
      ctx.fillRect(70 * sx, 450 * sy, 240 * sx, 220 * sy);
      ctx.fillStyle = '#e8dec9';
      ctx.fillRect(0, 505 * sy, canvasW, 110 * sy);
      ctx.fillStyle = '#5c4e41';
      for (const [cx, cy, r] of [[520, 420, 46], [880, 620, 56], [1290, 460, 50], [790, 210, 40]]) {
        ctx.beginPath();
        ctx.arc(cx * sx, cy * sy, r * sx, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (zone.id === 'sanctuaire') {
      ctx.fillStyle = '#c5baa5';
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.fillStyle = '#dfd5c3';
      ctx.fillRect(0, 456 * sy, canvasW, 108 * sy);
      ctx.beginPath();
      ctx.arc(1210 * sx, 510 * sy, 175 * sx, 0, Math.PI * 2);
      ctx.fillStyle = '#d5c9b2';
      ctx.fill();
      ctx.strokeStyle = '#c08a3e';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 3;
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
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.beginPath();
      ctx.arc(1330 * sx, 560 * sy, 235 * sx, 0, Math.PI * 2);
      ctx.fillStyle = '#3f4a5e';
      ctx.fill();
      ctx.strokeStyle = '#c08a3e';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (zone.id === 'taverne_interieur' || zone.id === 'forge_interieur' || zone.id === 'apothicairerie_interieur') {
      ctx.fillStyle = zone.id === 'forge_interieur' ? '#403c38' : zone.id === 'apothicairerie_interieur' ? '#e4d9c3' : '#7c5433';
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else if (zone.id === 'marecages') {
      ctx.fillStyle = '#354737';
      ctx.fillRect(0, 0, canvasW, canvasH);
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
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#7bb4db';
      ctx.fillRect(0, 0, canvasW, canvasH * 0.65);
      ctx.fillStyle = '#1f6f9e';
      ctx.fillRect(0, canvasH * 0.55, canvasW, canvasH * 0.35);
      ctx.fillStyle = '#e5cfa0';
      ctx.fillRect(0, 472 * sy, canvasW, (zone.height - 472) * sy);
    }

    // 2. Decors & obstacles
    for (const s of zone.solids) {
      if (s.look === 'water') continue;
      const rx = s.x * sx;
      const ry = s.y * sy;
      const rw = Math.max(4, s.w * sx);
      const rh = Math.max(4, s.h * sy);
      if (s.look === 'house') {
        ctx.fillStyle = '#b5523b';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#1f3550';
        ctx.lineWidth = 1.4;
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
        ctx.arc(rx + rw / 2, ry + rh / 2, Math.max(4, rw / 2), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#8b8378';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#1f3550';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(rx, ry, rw, rh);
      }
    }

    // 3. Portails nommes
    ctx.font = '700 10.5px Outfit, sans-serif';
    ctx.textAlign = 'center';
    for (const p of zone.portals) {
      const px = (p.x + p.w / 2) * sx;
      const py = (p.y + p.h / 2) * sy;
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#1f3550';
      ctx.lineWidth = 1.6;
      ctx.fillRect(px - 6, py - 8, 12, 16);
      ctx.strokeRect(px - 6, py - 8, 12, 16);
      const labelX = Math.max(58, Math.min(canvasW - 58, px));
      const labelY = py < 35 ? py + 22 : py > canvasH - 35 ? py - 14 : py - 14;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeText(p.label, labelX, labelY);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillText(p.label, labelX, labelY);
    }

    // 4. PNJ nommes
    for (const placement of zone.npcs) {
      const npc = NPCS[placement.npcId];
      if (!npc) continue;
      const nx = placement.x * sx;
      const ny = placement.y * sy;
      ctx.fillStyle = '#4ade80';
      ctx.strokeStyle = '#1f3550';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(nx, ny, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeText(npc.name, nx, ny - 10);
      ctx.fillStyle = '#fef9c3';
      ctx.fillText(npc.name, nx, ny - 10);
    }

    // 5. Marqueurs dynamiques (coffres/objectifs, ennemis, boss, butin, joueur)
    for (const m of markers) {
      const mx = m.x * sx;
      const my = m.y * sy;
      if (m.kind === 'interact') {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#1f3550';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(mx, my, 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (m.kind === 'loot') {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#1f3550';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(mx, my - 6);
        ctx.lineTo(mx + 5.5, my);
        ctx.lineTo(mx, my + 6);
        ctx.lineTo(mx - 5.5, my);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (m.kind === 'enemy' || m.kind === 'boss') {
        ctx.fillStyle = m.kind === 'boss' ? '#f97316' : '#dc2626';
        ctx.strokeStyle = '#1f3550';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(mx, my, m.kind === 'boss' ? 8 : 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (m.kind === 'boss') {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.strokeText('BOSS', mx, my - 12);
          ctx.fillStyle = '#fdba74';
          ctx.fillText('BOSS', mx, my - 12);
        }
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
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-7, -6);
      ctx.lineTo(-3.5, 0);
      ctx.lineTo(-7, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }, [tab, zone, markers, canvasW, canvasH]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 95,
        background: 'rgba(10, 16, 28, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: 'Outfit, sans-serif'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(760px, 95vw)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(24, 42, 66, 0.97)',
          border: `2px solid ${MARBLE}`,
          boxShadow: `inset 0 0 0 3px rgba(24, 42, 66, 0.97), inset 0 0 0 4px ${GOLD}, 0 20px 50px rgba(0,0,0,0.65)`,
          borderRadius: 6,
          padding: '18px 22px',
          color: MARBLE
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setTab('zone')}
              style={{
                background: tab === 'zone' ? GOLD : 'rgba(12, 22, 38, 0.72)',
                color: tab === 'zone' ? '#1f3550' : MARBLE,
                border: `1px solid ${tab === 'zone' ? GOLD : SKY}`,
                borderRadius: 4,
                padding: '6px 13px',
                fontSize: 12.5,
                fontWeight: 700,
                fontFamily: 'Cinzel, serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Map size={14} /> {zone.name}
            </button>
            <button
              onClick={() => setTab('world')}
              style={{
                background: tab === 'world' ? GOLD : 'rgba(12, 22, 38, 0.72)',
                color: tab === 'world' ? '#1f3550' : MARBLE,
                border: `1px solid ${tab === 'world' ? GOLD : SKY}`,
                borderRadius: 4,
                padding: '6px 13px',
                fontSize: 12.5,
                fontWeight: 700,
                fontFamily: 'Cinzel, serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Compass size={14} /> Carte du monde
            </button>
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: 'transparent',
              border: `1px solid ${SKY}`,
              color: MARBLE,
              borderRadius: 4,
              padding: 5,
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {tab === 'zone' ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              background: '#0e2438',
              border: `1.5px solid ${GOLD}`,
              borderRadius: 4,
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              padding: 6
            }}>
              <canvas
                ref={canvasRef}
                width={canvasW}
                height={canvasH}
                style={{ width: '100%', height: 'auto', maxHeight: 410, display: 'block', borderRadius: 2 }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 9, fontSize: 11, color: '#cbd5e1', justifyContent: 'center' }}>
              <span><b style={{ color: '#ffe761' }}>▶</b> Vous</span>
              <span><b style={{ color: '#4ade80' }}>●</b> PNJ</span>
              <span><b style={{ color: '#38bdf8' }}>■</b> Portail</span>
              <span><b style={{ color: '#facc15' }}>●</b> Coffre / Objectif</span>
              <span><b style={{ color: '#dc2626' }}>●</b> Ennemi</span>
              <span><b style={{ color: '#f97316' }}>●</b> Boss</span>
              <span><b style={{ color: '#facc15' }}>◆</b> Butin au sol</span>
            </div>
          </div>
        ) : (
          <div style={{
            position: 'relative',
            width: '100%',
            height: 330,
            background: 'radial-gradient(circle at 45% 50%, #1d4e6e 0%, #143652 55%, #0e2438 100%)',
            border: `1.5px solid ${GOLD}`,
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 14
          }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path d="M 26 35 Q 48 16 92 10 L 94 90 Q 58 92 28 74 Z" fill="#cbb994" fillOpacity="0.2" stroke="#e9c35a" strokeOpacity="0.28" strokeWidth="0.4" />
              <ellipse cx="13" cy="50" rx="8" ry="13" fill="#cbb994" fillOpacity="0.2" stroke="#e9c35a" strokeOpacity="0.28" strokeWidth="0.4" />
              {EDGES.map(([a, b], idx) => {
                const na = NODES[a];
                const nb = NODES[b];
                const isArc = a === 3 && b === 0;
                if (isArc) {
                  return (
                    <path
                      key={idx}
                      d={`M ${na.x} ${na.y} Q 45 92 ${nb.x} ${nb.y}`}
                      fill="none"
                      stroke="#58a7cf"
                      strokeWidth="0.5"
                      strokeDasharray="1.8 1.4"
                      strokeOpacity="0.55"
                    />
                  );
                }
                return (
                  <line
                    key={idx}
                    x1={na.x}
                    y1={na.y}
                    x2={nb.x}
                    y2={nb.y}
                    stroke="#e9c35a"
                    strokeWidth="0.65"
                    strokeDasharray="1.5 1.2"
                    strokeOpacity="0.75"
                  />
                );
              })}
            </svg>

            {NODES.map((n) => {
              const z = ZONES[n.id];
              const isHere = currentZone === n.id || (n.id === 'agora' && (currentZone === 'taverne_interieur' || currentZone === 'forge_interieur' || currentZone === 'apothicairerie_interieur'));
              const unlocked = n.id === 'agora' || discoveredZones.includes(n.id);
              const canTravel = unlocked && !isHere;
              return (
                <div
                  key={n.id}
                  onClick={() => canTravel && onFastTravel(n.id)}
                  title={canTravel ? `Voyage rapide vers ${z.name}` : isHere ? 'Position actuelle' : 'Zone à découvrir'}
                  style={{
                    position: 'absolute',
                    left: `${n.x}%`,
                    top: `${n.y}%`,
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    minWidth: 124,
                    cursor: canTravel ? 'pointer' : 'default',
                    opacity: unlocked ? 1 : 0.55
                  }}
                >
                  <div style={{
                    width: isHere ? 26 : 19,
                    height: isHere ? 26 : 19,
                    margin: '0 auto 4px',
                    borderRadius: '50%',
                    background: isHere ? GOLD : z.safeZone ? '#4ade80' : unlocked ? '#26466d' : '#1b263b',
                    border: `2px solid ${isHere ? '#fff' : unlocked ? GOLD : '#64748b'}`,
                    boxShadow: isHere ? '0 0 14px rgba(233, 195, 90, 0.9)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isHere && <MapPin size={14} color="#1f3550" />}
                  </div>
                  <div style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: 11,
                    fontWeight: 700,
                    color: isHere ? GOLD : unlocked ? MARBLE : '#94a3b8',
                    textShadow: '0 2px 4px #000'
                  }}>
                    {z.name}
                  </div>
                  <div style={{ fontSize: 9.5, color: SKY, textShadow: '0 1px 3px #000' }}>{n.tag}</div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, color: '#cbd5e1' }}>
            {tab === 'zone'
              ? <>Raccourci carte : <b style={{ color: GOLD }}>[{mapKeyLabel}]</b> • {zone.recommendedLevel}</>
              : <>Cliquez sur une zone visitée pour voyager rapidement.</>}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {currentZone !== 'agora' && (
              <button
                onClick={() => onFastTravel('agora')}
                style={{
                  background: GOLD,
                  color: '#1f3550',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 15px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: 'Cinzel, serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Navigation size={14} /> Retour : Cité de l'Agora
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: `1px solid ${MARBLE}`,
                color: MARBLE,
                borderRadius: 4,
                padding: '8px 14px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
