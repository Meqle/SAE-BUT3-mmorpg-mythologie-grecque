// onglet PLAY : resume du heros et bouton pour entrer en jeu
import { GodLore, ServerInfo } from '@greek-myth/shared';
import { Play, Zap } from 'lucide-react';
import { box, Panel, realmColor } from '../Panel';

interface PlayTabProps {
  heroName: string;
  god: GodLore;
  server: ServerInfo;
  onEnterGame: () => void;
}

export function PlayTab({ heroName, god, server, onEnterGame }: PlayTabProps) {
  const canPlay = heroName.trim() !== '';

  return (
    <Panel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2d3b52', paddingBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Héros Prêt au Combat</div>
          <div style={{ fontSize: 22, color: '#facc15', marginTop: 2, fontWeight: 'bold' }}>{heroName || '—'}</div>
        </div>
        <div style={{ background: '#0d131f', border: `2px solid ${god.color}`, padding: '6px 12px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={14} color={god.color} />
          <span style={{ color: god.color, fontSize: 12, fontWeight: 'bold' }}>{god.name}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '18px 0' }}>
        <div style={{ ...box, padding: 12 }}>
          <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>Royaume Actif</div>
          <div style={{ color: realmColor[server.realm], fontSize: 13, fontWeight: 'bold', marginTop: 4 }}>{server.name}</div>
          <div style={{ fontSize: 9, color: '#cbd5e1', marginTop: 4 }}>
            Ping: {server.pingMs}ms • {server.playerCount}/{server.maxPlayers}
          </div>
        </div>
        <div style={{ ...box, padding: 12 }}>
          <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>Bénédiction Divine</div>
          <div style={{ color: '#facc15', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>{god.passiveBonus}</div>
          <div style={{ fontSize: 9, color: '#cbd5e1', marginTop: 4 }}>{god.title}</div>
        </div>
      </div>

      <button
        onClick={onEnterGame}
        disabled={!canPlay}
        style={{
          width: '100%',
          backgroundColor: canPlay ? '#d4af37' : '#574e40',
          color: canPlay ? '#1a1406' : '#8a8070',
          border: '3px solid #241812',
          boxShadow: canPlay ? 'inset 2px 2px 0 #fef08a, inset -2px -2px 0 #854d0e, 0 4px 0 #140d09' : 'none',
          fontFamily: 'Silkscreen, monospace',
          fontSize: 16,
          fontWeight: 'bold',
          padding: 14,
          cursor: canPlay ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          borderRadius: 4
        }}
      >
        <Play size={18} fill="#1a1406" />
        <span>REJOINDRE LE ROYAUME</span>
      </button>
    </Panel>
  );
}
