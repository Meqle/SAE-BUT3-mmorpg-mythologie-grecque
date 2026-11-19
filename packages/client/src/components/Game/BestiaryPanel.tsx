import { ITEMS, RARITY_COLOR, RARITY_LABEL } from '../../game/data/items';
import { formatDropChance, MONSTER_LOOT_TABLES } from '../../game/data/loot';
import type { EnemyType } from '../../game/data/zones';
import { ENEMY_ARCHETYPES } from '../../game/entities/enemies';
import { COLORS, css } from '../../game/scenes/palette';

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);
const SKY = css(COLORS.sky);

const BESTIARY_LIST: { type: EnemyType; zone: string }[] = [
  { type: 'satyre', zone: 'Plaines Foudroyées' },
  { type: 'harpie', zone: 'Plaines & Marécages' },
  { type: 'centaure', zone: 'Plaines Foudroyées' },
  { type: 'automate', zone: 'Sanctuaire Brisé' },
  { type: 'squelette', zone: 'Labyrinthe des Brumes' },
  { type: 'serpent_lerne', zone: 'Marécages de Lerne' },
  { type: 'gardien_airain', zone: 'Sanctuaire Brisé (Boss)' },
  { type: 'sentinelle_poseidon', zone: "Rivage d'Égée (Boss)" },
  { type: 'minotaure', zone: 'Labyrinthe des Brumes (Boss)' },
  { type: 'hydre_lerne', zone: 'Marécages de Lerne (Boss)' }
];

export function BestiaryPanel({ bestiaryKills }: { bestiaryKills?: Record<string, number> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 11 }}>
      {BESTIARY_LIST.map(({ type, zone }) => {
        const arch = ENEMY_ARCHETYPES[type];
        const kills = bestiaryKills?.[type] ?? 0;
        const drops = MONSTER_LOOT_TABLES[type] ?? [];
        return (
          <div
            key={type}
            style={{
              background: 'rgba(12, 22, 38, 0.78)',
              border: `1px solid ${arch.isBoss ? GOLD : 'rgba(143,195,230,0.38)'}`,
              borderRadius: 4,
              padding: '10px 12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13.5, fontWeight: 700, color: arch.isBoss ? GOLD : MARBLE }}>
                {arch.name}
              </span>
              <span style={{ fontSize: 10.5, color: kills > 0 ? '#4ade80' : '#94a3b8', fontWeight: 600 }}>
                Vaincus : {kills}
              </span>
            </div>
            <div style={{ fontSize: 11, color: SKY, marginBottom: 7 }}>
              {zone} • {arch.maxHp} PV • {arch.attack} ATK
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
              Probabilités de butin
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {drops.map((entry) => {
                const def = ITEMS[entry.itemId];
                if (!def) return null;
                return (
                  <div
                    key={entry.itemId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 11.5,
                      background: 'rgba(24, 42, 66, 0.55)',
                      padding: '3px 7px',
                      borderRadius: 3
                    }}
                  >
                    <span style={{ color: RARITY_COLOR[def.rarity], fontWeight: 600 }}>
                      {def.name}{' '}
                      <span style={{ fontSize: 10, opacity: 0.75 }}>({RARITY_LABEL[def.rarity]})</span>
                    </span>
                    <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: 11 }}>
                      {formatDropChance(entry.chance)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
