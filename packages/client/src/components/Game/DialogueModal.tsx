import { useState } from 'react';
import { CheckCircle2, Coins, Heart, ScrollText, ShoppingBag, X } from 'lucide-react';
import { ITEMS, RARITY_COLOR } from '../../game/data/items';
import type { InventorySlot, NpcDialogueView } from '../../game/state/gameState';
import { COLORS, css } from '../../game/scenes/palette';

interface DialogueModalProps {
  view: NpcDialogueView;
  gold: number;
  hp: number;
  maxHp: number;
  inventory: InventorySlot[];
  onAcceptQuest: (questId: string) => void;
  onCompleteQuest: (questId: string) => void;
  onHeal: () => void;
  onBuyItem: (itemId: string) => void;
  onSellItem?: (itemId: string) => void;
  onClose: () => void;
}

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);
const SKY = css(COLORS.sky);

export function DialogueModal({
  view,
  gold,
  hp,
  maxHp,
  inventory,
  onAcceptQuest,
  onCompleteQuest,
  onHeal,
  onBuyItem,
  onSellItem,
  onClose
}: DialogueModalProps) {
  const [shopTab, setShopTab] = useState<'buy' | 'sell'>('buy');
  const quest = view.readyQuest ?? view.availableQuest ?? view.activeQuest;
  const sellable = inventory.filter((s) => {
    const def = ITEMS[s.itemId];
    return Boolean(def && def.price > 0 && !s.equipped);
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 80,
      background: 'rgba(10, 16, 28, 0.45)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      padding: '0 16px 26px',
      fontFamily: 'Outfit, sans-serif'
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(700px, 95vw)',
          maxHeight: '80vh',
          overflowY: 'auto',
          background: 'rgba(24, 42, 66, 0.96)',
          border: `2px solid ${MARBLE}`,
          boxShadow: `inset 0 0 0 3px rgba(24, 42, 66, 0.96), inset 0 0 0 4px ${GOLD}, 0 12px 32px rgba(0,0,0,0.5)`,
          borderRadius: 6,
          padding: '18px 22px',
          color: MARBLE
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, color: GOLD }}>
              {view.npcName}
            </div>
            <div style={{ fontSize: 10.5, color: SKY, letterSpacing: 1.2, textTransform: 'uppercase' }}>
              {view.npcRole}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: 'transparent',
              border: `1px solid ${SKY}`,
              color: MARBLE,
              borderRadius: 4,
              padding: 4,
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <X size={15} />
          </button>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#f8fafc', marginBottom: 14 }}>
          « {view.text} »
        </p>

        {quest && (
          <div style={{
            background: 'rgba(12, 22, 38, 0.72)',
            border: `1px solid ${quest.kind === 'main' ? GOLD : SKY}`,
            borderRadius: 4,
            padding: '10px 13px',
            marginBottom: 14
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 13.5,
                fontWeight: 700,
                color: quest.kind === 'main' ? GOLD : SKY,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <ScrollText size={14} /> {quest.title}
              </span>
              <span style={{ fontSize: 10.5, color: '#cbd5e1' }}>Niv. {quest.level}</span>
            </div>
            <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 7 }}>{quest.summary}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 11.5, color: GOLD }}>
              <span>+{quest.reward.xp} XP</span>
              <span>+{quest.reward.gold} drachmes</span>
              {quest.reward.items?.map((ri) => (
                <span key={ri.itemId} style={{ color: '#e2e8f0' }}>
                  • {ri.quantity > 1 ? `${ri.quantity}x ` : ''}{ITEMS[ri.itemId]?.name ?? ri.itemId}
                </span>
              ))}
            </div>
          </div>
        )}

        {view.shopItems.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 11, color: SKY, letterSpacing: 1, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShoppingBag size={13} /> Échoppe ({gold} drachmes)
              </div>
              {onSellItem && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['buy', 'sell'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setShopTab(t)}
                      style={{
                        background: shopTab === t ? GOLD : 'rgba(12, 22, 38, 0.72)',
                        color: shopTab === t ? '#1f3550' : MARBLE,
                        border: `1px solid ${shopTab === t ? GOLD : SKY}`,
                        borderRadius: 4,
                        padding: '3px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {t === 'buy' ? 'Acheter' : `Vendre (${sellable.length})`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {shopTab === 'buy' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                {view.shopItems.map((itemId) => {
                  const item = ITEMS[itemId];
                  if (!item) return null;
                  const owned = !item.stackable && inventory.some((s) => s.itemId === itemId);
                  const canAfford = gold >= item.price && !owned;
                  return (
                    <div
                      key={itemId}
                      style={{
                        background: 'rgba(12, 22, 38, 0.72)',
                        border: `1px solid ${owned ? '#4ade80' : 'rgba(143,195,230,0.35)'}`,
                        borderRadius: 4,
                        padding: '8px 10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: RARITY_COLOR[item.rarity] }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: '#cbd5e1' }}>{item.description}</div>
                      </div>
                      <button
                        disabled={!canAfford}
                        onClick={() => onBuyItem(itemId)}
                        style={{
                          background: owned ? 'rgba(34,197,94,0.2)' : canAfford ? GOLD : 'rgba(100,116,139,0.25)',
                          color: owned ? '#86efac' : canAfford ? '#1f3550' : '#94a3b8',
                          border: 'none',
                          borderRadius: 4,
                          padding: '5px 9px',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: canAfford ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          flexShrink: 0
                        }}
                      >
                        {owned ? 'Acquis' : <><Coins size={12} /> {item.price}</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                {sellable.length === 0 ? (
                  <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 4px' }}>
                    Aucun objet vendable (les objets équipés ou reliques de quête ne peuvent pas être vendus).
                  </div>
                ) : (
                  sellable.map((slot) => {
                    const item = ITEMS[slot.itemId];
                    if (!item) return null;
                    const payout = Math.max(1, Math.floor(item.price * 0.5));
                    return (
                      <div
                        key={slot.itemId}
                        style={{
                          background: 'rgba(12, 22, 38, 0.72)',
                          border: '1px solid rgba(143,195,230,0.35)',
                          borderRadius: 4,
                          padding: '8px 10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: RARITY_COLOR[item.rarity] }}>
                            {item.name} {slot.quantity > 1 ? `×${slot.quantity}` : ''}
                          </div>
                          <div style={{ fontSize: 11, color: '#cbd5e1' }}>{item.description}</div>
                        </div>
                        <button
                          onClick={() => onSellItem?.(slot.itemId)}
                          style={{
                            background: 'rgba(233, 195, 90, 0.18)',
                            color: GOLD,
                            border: `1px solid ${GOLD}`,
                            borderRadius: 4,
                            padding: '5px 9px',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            flexShrink: 0
                          }}
                        >
                          <Coins size={12} /> +{payout}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}>
          {view.canHeal && hp < maxHp && (
            <button
              onClick={onHeal}
              style={{
                background: 'rgba(34, 197, 94, 0.18)',
                border: '1px solid #4ade80',
                color: '#86efac',
                borderRadius: 4,
                padding: '7px 13px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Heart size={13} /> Soigner
            </button>
          )}

          {view.readyQuest && (
            <button
              onClick={() => onCompleteQuest(view.readyQuest!.id)}
              style={{
                background: GOLD,
                color: '#1f3550',
                border: 'none',
                borderRadius: 4,
                padding: '7px 16px',
                fontSize: 12.5,
                fontWeight: 700,
                fontFamily: 'Cinzel, serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <CheckCircle2 size={14} /> Terminer
            </button>
          )}

          {!view.readyQuest && view.availableQuest && (
            <button
              onClick={() => onAcceptQuest(view.availableQuest!.id)}
              style={{
                background: GOLD,
                color: '#1f3550',
                border: 'none',
                borderRadius: 4,
                padding: '7px 16px',
                fontSize: 12.5,
                fontWeight: 700,
                fontFamily: 'Cinzel, serif',
                cursor: 'pointer'
              }}
            >
              Accepter
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${MARBLE}`,
              color: MARBLE,
              borderRadius: 4,
              padding: '7px 13px',
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
