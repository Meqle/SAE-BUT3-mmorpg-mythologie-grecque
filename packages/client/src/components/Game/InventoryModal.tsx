import { useState } from 'react';
import {
  Backpack,
  BookOpen,
  Coins,
  Crown,
  FlaskConical,
  Footprints,
  Gem,
  Hammer,
  ScrollText,
  Shield,
  Skull,
  Sparkles,
  Swords,
  X
} from 'lucide-react';
import { GODS_LORE } from '@greek-myth/shared';
import { HERO_CLASSES } from '../../game/data/classes';
import { CRAFT_RECIPES } from '../../game/data/crafting';
import { EQUIP_SLOT_LABELS, EquipSlot, ItemDef, ITEMS, RARITY_COLOR, RARITY_LABEL } from '../../game/data/items';
import { CLASS_ROLE_LABEL } from '../../game/data/skillTrees';
import { CODEX_ENTRIES, QUEST_ORDER, QUESTS } from '../../game/data/story';
import {
  canCraftRecipe,
  countItem,
  GameProgressState,
  getComputedStats
} from '../../game/state/gameState';
import { COLORS, css } from '../../game/scenes/palette';
import { BestiaryPanel } from './BestiaryPanel';
import { SkillTreePanel } from './SkillTreePanel';

export type ModalTab = 'inventory' | 'craft' | 'talents' | 'quests' | 'codex' | 'bestiary';

interface InventoryModalProps {
  state: GameProgressState;
  initialTab: ModalTab;
  onUseConsumable: (itemId: string) => void;
  onEquipItem: (itemId: string) => void;
  onCraftRecipe?: (recipeId: string) => void;
  onUpgradeSkill?: (skillId: string) => void;
  onResetSkills?: () => void;
  onClose: () => void;
}

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);
const SKY = css(COLORS.sky);

function renderItemIcon(item: ItemDef, size = 20) {
  const color = RARITY_COLOR[item.rarity];
  if (item.slot === 'tete') return <Crown size={size} color={color} />;
  if (item.slot === 'torse' || item.slot === 'bouclier') return <Shield size={size} color={color} />;
  if (item.slot === 'pieds') return <Footprints size={size} color={color} />;
  if (item.slot === 'anneau' || item.slot === 'relique') return <Gem size={size} color={color} />;
  if (item.category === 'arme') return <Swords size={size} color={color} />;
  if (item.category === 'consommable') return <FlaskConical size={size} color="#4ade80" />;
  return <Sparkles size={size} color={color} />;
}

export function InventoryModal({
  state,
  initialTab,
  onUseConsumable,
  onEquipItem,
  onCraftRecipe,
  onUpgradeSkill,
  onResetSkills,
  onClose
}: InventoryModalProps) {
  const [tab, setTab] = useState<ModalTab>(initialTab);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(state.inventory[0]?.itemId ?? null);
  const [craftFilter, setCraftFilter] = useState<'all' | 'forge' | 'alchimie'>('all');

  const stats = getComputedStats(state);
  const cls = HERO_CLASSES[state.heroClass];
  const god = GODS_LORE[state.god];
  const roleInfo = CLASS_ROLE_LABEL[state.heroClass];

  // Resoudre les 8 emplacements d'equipement façon WoW
  const equippedBySlot = (slot: EquipSlot, index = 0): ItemDef | null => {
    const matches = state.inventory
      .filter((s) => s.equipped && ITEMS[s.itemId]?.slot === slot)
      .map((s) => ITEMS[s.itemId]);
    return matches[index] ?? null;
  };

  const selectedSlot = state.inventory.find((s) => s.itemId === selectedItemId) ?? null;
  const selectedItem = selectedSlot ? ITEMS[selectedSlot.itemId] : null;

  const tabBtn = (id: ModalTab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(id)}
      style={{
        background: tab === id ? GOLD : 'rgba(15, 25, 42, 0.72)',
        color: tab === id ? '#1f3550' : MARBLE,
        border: `1px solid ${tab === id ? GOLD : SKY}`,
        borderRadius: 4,
        padding: '6px 11px',
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'Cinzel, serif',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }}
    >
      {icon} {label}
    </button>
  );

  const renderEquipTile = (label: string, slot: EquipSlot, relicIdx = 0) => {
    const item = equippedBySlot(slot, relicIdx);
    const borderCol = item ? RARITY_COLOR[item.rarity] : 'rgba(143, 195, 230, 0.28)';
    return (
      <button
        key={`${slot}_${relicIdx}`}
        onClick={() => item && setSelectedItemId(item.id)}
        onDoubleClick={() => item && onEquipItem(item.id)}
        title={item ? `${item.name} (double-clic pour retirer)` : `Emplacement vide : ${label}`}
        style={{
          width: 48,
          height: 48,
          borderRadius: 5,
          background: item ? 'rgba(15, 28, 48, 0.94)' : 'rgba(10, 18, 32, 0.72)',
          border: `2px solid ${borderCol}`,
          boxShadow: item ? `inset 0 0 10px ${borderCol}33` : 'inset 0 0 6px rgba(0,0,0,0.55)',
          cursor: item ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          position: 'relative'
        }}
      >
        {item ? renderItemIcon(item, 21) : <span style={{ fontSize: 8.5, color: '#64748b', textAlign: 'center', lineHeight: 1.1 }}>{label}</span>}
      </button>
    );
  };

  // Remplir une grille de 20 emplacements de sac (4x5) façon WoW
  const bagGrid = Array.from({ length: Math.max(20, state.inventory.length) }, (_, idx) => state.inventory[idx] ?? null);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(10, 16, 28, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        fontFamily: 'Outfit, sans-serif'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(880px, 96vw)',
          maxHeight: '89vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(22, 38, 60, 0.98)',
          border: `2px solid ${MARBLE}`,
          boxShadow: `inset 0 0 0 3px rgba(22, 38, 60, 0.98), inset 0 0 0 4px ${GOLD}, 0 20px 55px rgba(0,0,0,0.65)`,
          borderRadius: 6,
          padding: '18px 22px',
          color: MARBLE
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {tabBtn('inventory', 'Héros & Sac', <Backpack size={14} />)}
            {tabBtn('craft', 'Forge & Alchimie', <Hammer size={14} />)}
            {tabBtn('talents', (state.skillPoints ?? 0) > 0 ? `Talents (${state.skillPoints})` : 'Talents', <Sparkles size={14} />)}
            {tabBtn('quests', 'Quêtes', <ScrollText size={14} />)}
            {tabBtn('codex', 'Chroniques', <BookOpen size={14} />)}
            {tabBtn('bestiary', 'Bestiaire', <Skull size={14} />)}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
              {/* COLONNE GAUCHE : Fiche Personnage style WoW Classic */}
              <div style={{
                background: 'rgba(11, 20, 35, 0.88)',
                border: `1.5px solid ${GOLD}`,
                borderRadius: 6,
                padding: 14
              }}>
                <div style={{ textAlign: 'center', marginBottom: 10 }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16.5, color: GOLD, fontWeight: 700 }}>
                    {state.heroName}
                  </div>
                  <div style={{ fontSize: 11.5, color: SKY }}>
                    {cls.name} ({roleInfo.role}) — Niv. {state.level} • {god.name}
                  </div>
                </div>

                {/* Paperdoll : 4 slots gauche | Silhouette Heros | 4 slots droite */}
                <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 52px', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    {renderEquipTile('Tête', 'tete')}
                    {renderEquipTile('Torse', 'torse')}
                    {renderEquipTile('Bouclier', 'bouclier')}
                    {renderEquipTile('Pieds', 'pieds')}
                  </div>

                  {/* Portrait stylise du heros grec */}
                  <div style={{
                    height: 214,
                    borderRadius: 6,
                    background: `radial-gradient(circle at 50% 42%, ${god.color}28 0%, rgba(15, 25, 42, 0.92) 72%)`,
                    border: '1px solid rgba(143, 195, 230, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <svg viewBox="0 0 120 155" width="118" height="150">
                      {/* Aura divine */}
                      <circle cx="60" cy="68" r="48" fill={god.color} fillOpacity="0.12" stroke={god.color} strokeOpacity="0.4" strokeWidth="1.2" />
                      {/* Cape */}
                      <path d="M 38 56 L 26 122 L 94 122 L 82 56 Z" fill="#8b2635" stroke="#1f3550" strokeWidth="2" />
                      {/* Corps / Cuirasse */}
                      <rect x="40" y="54" width="40" height="46" rx="8" fill={equippedBySlot('torse') ? '#c89b52' : '#d8ccb4'} stroke="#1f3550" strokeWidth="2" />
                      {/* Jambes / Sandales */}
                      <rect x="44" y="100" width="12" height="32" rx="4" fill="#d2a47a" stroke="#1f3550" strokeWidth="1.8" />
                      <rect x="64" y="100" width="12" height="32" rx="4" fill="#d2a47a" stroke="#1f3550" strokeWidth="1.8" />
                      <rect x="42" y="124" width="16" height="10" rx="3" fill={equippedBySlot('pieds') ? '#8b5a2b' : '#64748b'} stroke="#1f3550" strokeWidth="1.5" />
                      <rect x="62" y="124" width="16" height="10" rx="3" fill={equippedBySlot('pieds') ? '#8b5a2b' : '#64748b'} stroke="#1f3550" strokeWidth="1.5" />
                      {/* Tete & Casque */}
                      <circle cx="60" cy="36" r="15" fill="#e5b892" stroke="#1f3550" strokeWidth="2" />
                      {equippedBySlot('tete') || state.heroClass === 'GUERRIER' ? (
                        <>
                          <path d="M 45 35 Q 60 14 75 35 Z" fill="#d4a759" stroke="#1f3550" strokeWidth="1.8" />
                          <path d="M 55 17 Q 60 4 70 18" fill="none" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
                        </>
                      ) : (
                        <path d="M 46 31 Q 60 18 74 31" fill="#3b2416" stroke="#1f3550" strokeWidth="1.5" />
                      )}
                      {/* Arme selon classe */}
                      {state.heroClass === 'ARCHER' ? (
                        <path d="M 88 32 Q 106 66 88 102" fill="none" stroke="#a66a3c" strokeWidth="3.5" strokeLinecap="round" />
                      ) : state.heroClass === 'MAGE' ? (
                        <>
                          <line x1="92" y1="26" x2="88" y2="128" stroke="#8b5a2b" strokeWidth="3.5" />
                          <circle cx="92" cy="24" r="7" fill={god.color} stroke="#1f3550" strokeWidth="1.5" />
                        </>
                      ) : state.heroClass === 'ASSASSIN' ? (
                        <>
                          <line x1="28" y1="68" x2="18" y2="96" stroke="#cbd5e1" strokeWidth="3" />
                          <line x1="92" y1="68" x2="102" y2="96" stroke="#cbd5e1" strokeWidth="3" />
                        </>
                      ) : (
                        <>
                          <line x1="92" y1="22" x2="90" y2="128" stroke="#8b5a2b" strokeWidth="3.2" />
                          <polygon points="92,12 87,25 97,25" fill="#e9c35a" stroke="#1f3550" strokeWidth="1.2" />
                          <circle cx="30" cy="76" r="14" fill="#c89b52" stroke="#1f3550" strokeWidth="2" />
                        </>
                      )}
                    </svg>
                    <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, marginTop: 2 }}>
                      XP : {state.xp} / {stats.xpToNext}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    {renderEquipTile('Arme', 'arme')}
                    {renderEquipTile('Anneau', 'anneau')}
                    {renderEquipTile('Relique 1', 'relique', 0)}
                    {renderEquipTile('Relique 2', 'relique', 1)}
                  </div>
                </div>

                {/* Bloc statistiques detaille style WoW */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                  background: 'rgba(18, 32, 52, 0.85)',
                  border: '1px solid rgba(143,195,230,0.28)',
                  borderRadius: 4,
                  padding: '9px 11px',
                  fontSize: 11.5
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Points de vie</span>
                    <b style={{ color: '#4ade80' }}>{Math.ceil(state.hp)}/{stats.maxHp}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Attaque</span>
                    <b style={{ color: GOLD }}>{stats.attack}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Armure</span>
                    <b style={{ color: '#93c5fd' }}>{stats.armor} ({Math.round(stats.damageReduction * 100)}%)</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Critique</span>
                    <b style={{ color: '#fde047' }}>{Math.round(stats.critChance * 100)}%</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Vitesse</span>
                    <b style={{ color: '#e2e8f0' }}>{Math.round(stats.speedMultiplier * 100)}%</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Drachmes</span>
                    <b style={{ color: GOLD, display: 'flex', alignItems: 'center', gap: 3 }}><Coins size={11} /> {state.gold}</b>
                  </div>
                </div>
              </div>

              {/* COLONNE DROITE : Sac en grille (4x5 cases icones) + Infobulle detaillee */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{
                  background: 'rgba(11, 20, 35, 0.88)',
                  border: '1px solid rgba(143, 195, 230, 0.35)',
                  borderRadius: 6,
                  padding: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700, color: GOLD }}>
                      Sac d'aventure ({state.inventory.length}/{bagGrid.length})
                    </span>
                    <span style={{ fontSize: 10.5, color: '#94a3b8' }}>Clic : inspecter • Double-clic : équiper/utiliser</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7 }}>
                    {bagGrid.map((slot, i) => {
                      const item = slot ? ITEMS[slot.itemId] : null;
                      const isSel = Boolean(item && selectedItemId === item.id);
                      const borderCol = item ? RARITY_COLOR[item.rarity] : 'rgba(143, 195, 230, 0.16)';
                      return (
                        <button
                          key={slot ? slot.itemId : `empty_${i}`}
                          onClick={() => item && setSelectedItemId(item.id)}
                          onDoubleClick={() => {
                            if (!item) return;
                            if (item.category === 'consommable') onUseConsumable(item.id);
                            else if (item.slot) onEquipItem(item.id);
                          }}
                          style={{
                            aspectRatio: '1 / 1',
                            minHeight: 52,
                            borderRadius: 5,
                            background: item ? 'rgba(18, 33, 55, 0.95)' : 'rgba(9, 16, 28, 0.65)',
                            border: `2px solid ${isSel ? '#ffffff' : borderCol}`,
                            boxShadow: item ? `inset 0 0 10px ${borderCol}30` : 'none',
                            cursor: item ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            padding: 4
                          }}
                        >
                          {item && renderItemIcon(item, 22)}
                          {slot && slot.quantity > 1 && (
                            <span style={{
                              position: 'absolute',
                              bottom: 2,
                              right: 4,
                              fontSize: 10,
                              fontWeight: 800,
                              color: '#fff',
                              textShadow: '0 1px 3px #000'
                            }}>
                              {slot.quantity}
                            </span>
                          )}
                          {slot?.equipped && (
                            <span style={{
                              position: 'absolute',
                              top: 2,
                              left: 3,
                              fontSize: 8.5,
                              fontWeight: 800,
                              color: '#1f3550',
                              background: GOLD,
                              padding: '0 3px',
                              borderRadius: 2
                            }}>
                              E
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Panneau d'inspection / Infobulle style WoW */}
                <div style={{
                  background: 'rgba(10, 18, 32, 0.92)',
                  border: `1.5px solid ${selectedItem ? RARITY_COLOR[selectedItem.rarity] : 'rgba(143,195,230,0.28)'}`,
                  borderRadius: 6,
                  padding: '12px 14px',
                  minHeight: 132,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 8
                }}>
                  {selectedItem && selectedSlot ? (
                    <>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700, color: RARITY_COLOR[selectedItem.rarity] }}>
                            {selectedItem.name}
                          </span>
                          <span style={{ fontSize: 10.5, color: RARITY_COLOR[selectedItem.rarity], fontWeight: 700 }}>
                            {RARITY_LABEL[selectedItem.rarity]}{selectedItem.slot ? ` • ${EQUIP_SLOT_LABELS[selectedItem.slot]}` : ''}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: '#e2e8f0', marginTop: 4 }}>{selectedItem.description}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6, fontSize: 11.5, color: '#4ade80', fontWeight: 600 }}>
                          {selectedItem.bonusAttack ? <span>+{selectedItem.bonusAttack} Attaque</span> : null}
                          {selectedItem.bonusHp ? <span>+{selectedItem.bonusHp} PV max</span> : null}
                          {selectedItem.bonusArmor ? <span>+{selectedItem.bonusArmor} Armure</span> : null}
                        </div>
                        <div style={{ fontSize: 11, color: SKY, marginTop: 6 }}>
                          {selectedItem.usageHint}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(143,195,230,0.18)', paddingTop: 8 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                          {selectedItem.price > 0 ? `Valeur revente : ${Math.floor(selectedItem.price * 0.5)} drachmes` : 'Objet de quête / lié'}
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {selectedItem.category === 'consommable' && (
                            <button
                              onClick={() => onUseConsumable(selectedItem.id)}
                              style={{ background: '#4ade80', color: '#0f172a', border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Utiliser
                            </button>
                          )}
                          {selectedItem.slot && (
                            <button
                              onClick={() => onEquipItem(selectedItem.id)}
                              style={{
                                background: selectedSlot.equipped ? 'rgba(248, 113, 113, 0.2)' : GOLD,
                                color: selectedSlot.equipped ? '#fecaca' : '#1f3550',
                                border: selectedSlot.equipped ? '1px solid #f87171' : 'none',
                                borderRadius: 4,
                                padding: '5px 12px',
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {selectedSlot.equipped ? 'Retirer' : 'Équiper'}
                            </button>
                          )}
                          {selectedItem.category === 'ressource' && (
                            <button
                              onClick={() => setTab('craft')}
                              style={{ background: 'rgba(233,195,90,0.2)', color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 4, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Voir la Forge
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: '#94a3b8', margin: 'auto 0' }}>
                      Sélectionnez un objet dans votre sac ou sur votre personnage pour voir ses statistiques et son utilité.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'craft' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {([
                    { id: 'all' as const, label: 'Toutes les recettes' },
                    { id: 'forge' as const, label: 'Forge (Armes & Armures)' },
                    { id: 'alchimie' as const, label: 'Alchimie (Potions)' }
                  ]).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setCraftFilter(f.id)}
                      style={{
                        background: craftFilter === f.id ? GOLD : 'rgba(12, 22, 38, 0.78)',
                        color: craftFilter === f.id ? '#1f3550' : MARBLE,
                        border: `1px solid ${craftFilter === f.id ? GOLD : SKY}`,
                        borderRadius: 4,
                        padding: '5px 10px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: GOLD, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Coins size={13} /> {state.gold} drachmes
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 10 }}>
                {CRAFT_RECIPES.filter((r) => craftFilter === 'all' || r.station === craftFilter).map((recipe) => {
                  const res = ITEMS[recipe.resultItemId];
                  if (!res) return null;
                  const canCraft = canCraftRecipe(state, recipe.id);
                  const ownedUnique = !res.stackable && state.inventory.some((s) => s.itemId === res.id);
                  return (
                    <div
                      key={recipe.id}
                      style={{
                        background: 'rgba(11, 20, 35, 0.85)',
                        border: `1px solid ${canCraft ? GOLD : 'rgba(143,195,230,0.32)'}`,
                        borderRadius: 5,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 8
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13.5, fontWeight: 700, color: RARITY_COLOR[res.rarity] }}>
                            {res.name} {recipe.resultQuantity > 1 ? `×${recipe.resultQuantity}` : ''}
                          </span>
                          <span style={{ fontSize: 10, color: SKY, textTransform: 'uppercase' }}>{recipe.station}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 2 }}>{res.description}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
                          {recipe.ingredients.map((ing) => {
                            const have = countItem(state, ing.itemId);
                            const ok = have >= ing.quantity;
                            return (
                              <span
                                key={ing.itemId}
                                style={{
                                  fontSize: 10.8,
                                  padding: '2px 6px',
                                  borderRadius: 3,
                                  background: ok ? 'rgba(34,197,94,0.16)' : 'rgba(239,68,68,0.16)',
                                  color: ok ? '#86efac' : '#fca5a5',
                                  border: `1px solid ${ok ? '#4ade80' : '#f87171'}55`
                                }}
                              >
                                {ITEMS[ing.itemId]?.name ?? ing.itemId} ({have}/{ing.quantity})
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: state.gold >= recipe.goldCost ? GOLD : '#fca5a5', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Coins size={11} /> {recipe.goldCost} drachmes
                        </span>
                        <button
                          disabled={!canCraft}
                          onClick={() => onCraftRecipe?.(recipe.id)}
                          style={{
                            background: ownedUnique ? 'rgba(34,197,94,0.2)' : canCraft ? GOLD : 'rgba(100,116,139,0.28)',
                            color: ownedUnique ? '#86efac' : canCraft ? '#1f3550' : '#94a3b8',
                            border: 'none',
                            borderRadius: 4,
                            padding: '5px 12px',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: canCraft ? 'pointer' : 'default'
                          }}
                        >
                          {ownedUnique ? 'Déjà forgé' : recipe.station === 'forge' ? 'Forger' : 'Brasser'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'talents' && (
            <SkillTreePanel
              state={state}
              onUpgradeSkill={(id) => onUpgradeSkill?.(id)}
              onResetSkills={() => onResetSkills?.()}
            />
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

          {tab === 'bestiary' && <BestiaryPanel bestiaryKills={state.bestiaryKills} />}
        </div>

        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(143,195,230,0.2)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
          <span><Shield size={11} style={{ verticalAlign: 'middle' }} /> Progression sauvegardée en local</span>
          <span>Raccourcis : [I] Sac • [T] Talents • [M] Carte • [Échap] Pause</span>
        </div>
      </div>
    </div>
  );
}
