import { useState } from 'react';
import { Backpack, BookOpen, Coins, ScrollText, Shield, Sparkles, Swords, X } from 'lucide-react';
import { GODS_LORE } from '@greek-myth/shared';
import { HERO_CLASSES } from '../../game/data/classes';
import { ITEMS, RARITY_COLOR } from '../../game/data/items';
import { CODEX_ENTRIES, QUEST_ORDER, QUESTS } from '../../game/data/story';
import { GameProgressState, getComputedStats } from '../../game/state/gameState';
import { COLORS, css } from '../../game/scenes/palette';

export type ModalTab = 'inventory' | 'quests' | 'codex';

interface InventoryModalProps {
  state: GameProgressState;
  initialTab: ModalTab;
  onUseConsumable: (itemId: string) => void;
  onClose: () => void;
}

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);
const SKY = css(COLORS.sky);

export function InventoryModal({ state, initialTab, onUseConsumable, onClose }: InventoryModalProps) {
  const [tab, setTab] = useState<ModalTab>(initialTab);
  const stats = getComputedStats(state);
  const cls = HERO_CLASSES[state.heroClass];
  const god = GODS_LORE[state.god];

  const tabBtn = (id: ModalTab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(id)}
      style={{
        background: tab === id ? GOLD : 'rgba(15, 25, 42, 0.7)',
        color: tab === id ? '#1f3550' : MARBLE,
        border: `1px solid ${tab === id ? GOLD : SKY}`,
        borderRadius: 4,
        padding: '7px 14px',
        fontSize: 12.5,
        fontWeight: 700,
        fontFamily: 'Cinzel, serif',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(10, 16, 28, 0.65)',
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
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(24, 42, 66, 0.97)',
          border: `2px solid ${MARBLE}`,
          boxShadow: `inset 0 0 0 3px rgba(24, 42, 66, 0.97), inset 0 0 0 4px ${GOLD}, 0 20px 50px rgba(0,0,0,0.6)`,
          borderRadius: 6,
          padding: '20px 24px',
          color: MARBLE
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tabBtn('inventory', 'Sac & Héros', <Backpack size={15} />)}
            {tabBtn('quests', 'Quêtes', <ScrollText size={15} />)}
            {tabBtn('codex', 'Chroniques', <BookOpen size={15} />)}
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
            <X size={16} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', paddingRight: 4, flex: 1 }}>
          {tab === 'inventory' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div style={{ background: 'rgba(12, 22, 38, 0.72)', border: `1px solid ${SKY}`, borderRadius: 4, padding: 14 }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: GOLD, fontWeight: 700 }}>
                  {state.heroName}
                </div>
                <div style={{ fontSize: 12, color: SKY, marginBottom: 12 }}>
                  {cls.name} — Niveau {state.level} • Affinité {god.name}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12.5 }}>
                  <div style={{ background: 'rgba(31,53,80,0.6)', padding: 8, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8', fontSize: 10 }}>POINTS DE VIE</div>
                    <div style={{ color: '#4ade80', fontWeight: 700 }}>{Math.ceil(state.hp)} / {stats.maxHp}</div>
                  </div>
                  <div style={{ background: 'rgba(31,53,80,0.6)', padding: 8, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8', fontSize: 10 }}>ATTAQUE</div>
                    <div style={{ color: GOLD, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Swords size={13} /> {stats.attack}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(31,53,80,0.6)', padding: 8, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8', fontSize: 10 }}>EXPÉRIENCE</div>
                    <div style={{ color: '#e2e8f0', fontWeight: 700 }}>{state.xp} / {stats.xpToNext}</div>
                  </div>
                  <div style={{ background: 'rgba(31,53,80,0.6)', padding: 8, borderRadius: 4 }}>
                    <div style={{ color: '#94a3b8', fontSize: 10 }}>DRACHMES</div>
                    <div style={{ color: GOLD, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Coins size={13} /> {state.gold}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 11.5, color: '#cbd5e1', lineHeight: 1.5 }}>
                  <Sparkles size={12} color={GOLD} style={{ verticalAlign: 'middle' }} /> Don divin ({god.name}) : <b>{god.passiveBonus}</b>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {state.inventory.map((slot) => {
                  const item = ITEMS[slot.itemId];
                  if (!item) return null;
                  return (
                    <div
                      key={slot.itemId}
                      style={{
                        background: 'rgba(12, 22, 38, 0.72)',
                        border: `1px solid ${slot.equipped ? GOLD : 'rgba(143, 195, 230, 0.35)'}`,
                        borderRadius: 4,
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: RARITY_COLOR[item.rarity] }}>
                          {item.name} {slot.quantity > 1 ? `x${slot.quantity}` : ''}
                          {slot.equipped && (
                            <span style={{ marginLeft: 8, fontSize: 10, color: GOLD, border: `1px solid ${GOLD}`, padding: '1px 5px', borderRadius: 3 }}>
                              ÉQUIPÉ
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 2 }}>{item.description}</div>
                      </div>
                      {item.category === 'consommable' && (
                        <button
                          onClick={() => onUseConsumable(slot.itemId)}
                          style={{
                            background: 'rgba(74, 222, 128, 0.18)',
                            border: '1px solid #4ade80',
                            color: '#bbf7d0',
                            borderRadius: 4,
                            padding: '5px 10px',
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          Utiliser
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'quests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {QUEST_ORDER.map((id) => {
                const def = QUESTS[id];
                const prog = state.quests[id];
                if (prog.status === 'locked') return null;
                const badge =
                  prog.status === 'completed' ? { text: 'TERMINÉE', color: '#4ade80' } :
                  prog.status === 'ready' ? { text: 'À RENDRE', color: GOLD } :
                  prog.status === 'active' ? { text: 'EN COURS', color: SKY } :
                  { text: 'DISPONIBLE', color: '#cbd5e1' };

                return (
                  <div
                    key={id}
                    style={{
                      background: 'rgba(12, 22, 38, 0.72)',
                      border: `1px solid ${def.kind === 'main' ? GOLD : 'rgba(143,195,230,0.4)'}`,
                      borderRadius: 4,
                      padding: '12px 14px',
                      opacity: prog.status === 'completed' ? 0.72 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700, color: def.kind === 'main' ? GOLD : MARBLE }}>
                        [{def.kind === 'main' ? 'Principale' : 'Secondaire'}] {def.title}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: badge.color, border: `1px solid ${badge.color}`, padding: '2px 6px', borderRadius: 3 }}>
                        {badge.text}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 6 }}>{def.summary}</div>
                    {prog.status !== 'available' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {def.objectives.map((obj) => {
                          const cur = prog.counts[obj.id] ?? 0;
                          const done = cur >= obj.required || prog.status === 'completed';
                          return (
                            <div key={obj.id} style={{ fontSize: 12, color: done ? '#4ade80' : '#f1f5f9' }}>
                              {done ? '✓' : '•'} {obj.label} ({done ? obj.required : cur}/{obj.required})
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'codex' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CODEX_ENTRIES.map((entry) => {
                const unlocked = state.unlockedCodex.includes(entry.id);
                return (
                  <div
                    key={entry.id}
                    style={{
                      background: 'rgba(12, 22, 38, 0.72)',
                      border: `1px solid ${unlocked ? GOLD : '#334155'}`,
                      borderRadius: 4,
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700, color: unlocked ? GOLD : '#64748b' }}>
                        {unlocked ? entry.title : 'Chronique verrouillée'}
                      </span>
                      <span style={{ fontSize: 10, color: SKY, letterSpacing: 1 }}>{entry.chapter}</span>
                    </div>
                    <p style={{ fontSize: 12.5, lineHeight: 1.6, color: unlocked ? '#e2e8f0' : '#64748b' }}>
                      {unlocked ? entry.text : 'Poursuivez la quête de Prométhée pour révéler ce fragment d’histoire.'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(143,195,230,0.2)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
          <span><Shield size={11} style={{ verticalAlign: 'middle' }} /> Progression sauvegardée automatiquement en local</span>
          <span>Raccourcis : [I] Sac • [C] Chroniques • [Échap] Fermer</span>
        </div>
      </div>
    </div>
  );
}
