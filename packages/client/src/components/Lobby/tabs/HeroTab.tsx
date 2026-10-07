// onglet PERSO : nom du heros et choix du dieu
import { GodAffinity, GODS_LORE, MAX_NAME_LENGTH } from '@greek-myth/shared';
import { Shield } from 'lucide-react';
import { box, Panel } from '../Panel';

interface HeroTabProps {
  heroName: string;
  onChangeHeroName: (name: string) => void;
  selectedGod: GodAffinity;
  onSelectGod: (god: GodAffinity) => void;
}

const GOD_LIST = Object.keys(GODS_LORE) as GodAffinity[];

export function HeroTab({ heroName, onChangeHeroName, selectedGod, onSelectGod }: HeroTabProps) {
  const lore = GODS_LORE[selectedGod];

  return (
    <Panel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, color: '#facc15', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
          <Shield size={16} /> Allégeance Divine
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>Nom :</span>
          <input
            type="text"
            value={heroName}
            maxLength={MAX_NAME_LENGTH}
            onChange={(e) => onChangeHeroName(e.target.value)}
            style={{
              backgroundColor: '#0c1320',
              border: '2px solid #2b3950',
              color: '#fff',
              fontFamily: 'Silkscreen, monospace',
              fontSize: 12,
              padding: '5px 8px',
              borderRadius: 4,
              outline: 'none',
              width: 150
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        {GOD_LIST.map((id) => {
          const g = GODS_LORE[id];
          const isSelected = id === selectedGod;
          return (
            <button
              key={id}
              onClick={() => onSelectGod(id)}
              style={{
                ...box,
                backgroundColor: isSelected ? '#293a54' : '#0e1522',
                border: isSelected ? `2px solid ${g.color}` : box.border,
                padding: '10px 6px',
                cursor: 'pointer',
                textAlign: 'center',
                fontFamily: 'Silkscreen, monospace'
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 'bold', color: isSelected ? g.color : '#e2e8f0' }}>{g.name}</div>
              <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{g.realm}</div>
            </button>
          );
        })}
      </div>

      <div style={{ ...box, backgroundColor: '#0c1320', borderLeft: `4px solid ${lore.color}` }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', color: lore.color }}>{lore.name} — {lore.title}</div>
        <div style={{ fontSize: 10, color: '#94a3b8', margin: '3px 0' }}>{lore.description}</div>
        <div style={{ fontSize: 11, color: '#facc15', fontWeight: 'bold' }}>Don Divin : {lore.passiveBonus}</div>
      </div>
    </Panel>
  );
}
