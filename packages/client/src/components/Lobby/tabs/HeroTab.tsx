import { GodAffinity, GODS_LORE, MAX_NAME_LENGTH } from '@greek-myth/shared';
import { Shield, Swords } from 'lucide-react';
import { DIVINE_SKILLS, HERO_CLASS_LIST, HERO_CLASSES, HeroClassId } from '../../../game/data/classes';
import { box, Panel } from '../Panel';

interface HeroTabProps {
  heroName: string;
  onChangeHeroName: (name: string) => void;
  selectedClass: HeroClassId;
  onSelectClass: (cls: HeroClassId) => void;
  selectedGod: GodAffinity;
  onSelectGod: (god: GodAffinity) => void;
}

const GOD_LIST = Object.keys(GODS_LORE) as GodAffinity[];

export function HeroTab({
  heroName,
  onChangeHeroName,
  selectedClass,
  onSelectClass,
  selectedGod,
  onSelectGod
}: HeroTabProps) {
  const cls = HERO_CLASSES[selectedClass];
  const lore = GODS_LORE[selectedGod];
  const skill = DIVINE_SKILLS[selectedGod];

  return (
    <Panel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#facc15', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
          <Swords size={15} /> Création du Héros
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
              fontSize: 11,
              padding: '4px 8px',
              borderRadius: 4,
              outline: 'none',
              width: 145
            }}
          />
        </div>
      </div>

      {/* 4 classes de la BDD */}
      <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>Classe de combat</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
        {HERO_CLASS_LIST.map((id) => {
          const c = HERO_CLASSES[id];
          const active = id === selectedClass;
          return (
            <button
              key={id}
              onClick={() => onSelectClass(id)}
              style={{
                ...box,
                backgroundColor: active ? '#293a54' : '#0e1522',
                border: active ? `2px solid ${c.accentColor}` : box.border,
                padding: '7px 4px',
                cursor: 'pointer',
                textAlign: 'center',
                fontFamily: 'Silkscreen, monospace'
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 'bold', color: active ? c.accentColor : '#e2e8f0' }}>{c.name}</div>
              <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>PV {c.baseHp} • ATQ {c.baseAttack}</div>
            </button>
          );
        })}
      </div>

      <div style={{ ...box, backgroundColor: '#0c1320', padding: '7px 10px', marginBottom: 10, borderLeft: `3px solid ${cls.accentColor}` }}>
        <div style={{ fontSize: 10, color: cls.accentColor, fontWeight: 'bold' }}>{cls.name} — {cls.title}</div>
        <div style={{ fontSize: 9, color: '#cbd5e1', marginTop: 2 }}>{cls.description}</div>
      </div>

      {/* 6 Etincelles divines */}
      <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Shield size={11} color="#facc15" /> Étincelle dérobée (Affinité Divine)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
        {GOD_LIST.map((id) => {
          const g = GODS_LORE[id];
          const active = id === selectedGod;
          return (
            <button
              key={id}
              onClick={() => onSelectGod(id)}
              style={{
                ...box,
                backgroundColor: active ? '#293a54' : '#0e1522',
                border: active ? `2px solid ${g.color}` : box.border,
                padding: '6px 4px',
                cursor: 'pointer',
                textAlign: 'center',
                fontFamily: 'Silkscreen, monospace'
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 'bold', color: active ? g.color : '#e2e8f0' }}>{g.name}</div>
              <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 1 }}>{g.passiveBonus}</div>
            </button>
          );
        })}
      </div>

      <div style={{ ...box, backgroundColor: '#0c1320', padding: '7px 10px', borderLeft: `3px solid ${lore.color}` }}>
        <div style={{ fontSize: 10, fontWeight: 'bold', color: lore.color }}>{skill.skillName} ({lore.name})</div>
        <div style={{ fontSize: 9, color: '#cbd5e1', marginTop: 2 }}>{skill.description}</div>
      </div>
    </Panel>
  );
}
