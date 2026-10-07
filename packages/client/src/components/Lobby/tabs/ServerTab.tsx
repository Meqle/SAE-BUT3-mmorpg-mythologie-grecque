// onglet SERVEUR : choix du royaume
import { ServerInfo } from '@greek-myth/shared';
import { Globe, Users, Wifi } from 'lucide-react';
import { box, Panel, realmColor } from '../Panel';

interface ServerTabProps {
  servers: ServerInfo[];
  selected: ServerInfo;
  onSelect: (server: ServerInfo) => void;
}

export function ServerTab({ servers, selected, onSelect }: ServerTabProps) {
  return (
    <Panel title="Choix du Monde" icon={<Globe size={16} />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {servers.map((s) => {
          const isSelected = s.id === selected.id;
          const color = realmColor[s.realm];
          return (
            <div
              key={s.id}
              onClick={() => onSelect(s)}
              style={{
                ...box,
                backgroundColor: isSelected ? '#293a54' : '#0e1522',
                border: isSelected ? '2px solid #facc15' : box.border,
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.status === 'online' ? '#4ade80' : '#f59e0b' }} />
                  <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>{s.name}</span>
                  <span style={{ fontSize: 9, color, border: `1px solid ${color}`, padding: '1px 5px', borderRadius: 2 }}>
                    {s.realm.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{s.description}</div>
              </div>

              {/* chiffres fictifs pour l'instant (voir config/servers.ts) */}
              <div style={{ textAlign: 'right', fontSize: 11 }}>
                <div style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  <Users size={12} /> {s.playerCount}/{s.maxPlayers}
                </div>
                <div style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
                  <Wifi size={12} /> {s.pingMs}ms
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
