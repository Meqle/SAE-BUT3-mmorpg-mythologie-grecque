import { Compass, MapPin, Navigation, X } from 'lucide-react';
import { ZoneId, ZONES } from '../../game/data/zones';
import { COLORS, css } from '../../game/scenes/palette';

interface WorldMapModalProps {
  currentZone: ZoneId;
  discoveredZones: ZoneId[];
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

export function WorldMapModal({ currentZone, discoveredZones, onFastTravel, onClose }: WorldMapModalProps) {
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
          background: 'rgba(24, 42, 66, 0.97)',
          border: `2px solid ${MARBLE}`,
          boxShadow: `inset 0 0 0 3px rgba(24, 42, 66, 0.97), inset 0 0 0 4px ${GOLD}, 0 20px 50px rgba(0,0,0,0.65)`,
          borderRadius: 6,
          padding: '20px 24px',
          color: MARBLE
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={18} color={GOLD} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 700, color: GOLD }}>
              Carte de la Mer Égée
            </span>
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
            const isHere = currentZone === n.id;
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, color: '#cbd5e1' }}>
            Position : <b style={{ color: GOLD }}>{ZONES[currentZone].name}</b> — cliquez sur une zone visitée pour voyager.
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
