import { CheckCircle2, Coins, Heart, ScrollText, ShoppingBag, X } from 'lucide-react';
import { ITEMS } from '../../game/data/items';
import type { NpcDialogueView } from '../../game/state/gameState';
import { COLORS, css } from '../../game/scenes/palette';

interface DialogueModalProps {
  view: NpcDialogueView;
  gold: number;
  hp: number;
  maxHp: number;
  onAcceptQuest: (questId: string) => void;
  onCompleteQuest: (questId: string) => void;
  onHeal: () => void;
  onBuyPotion: () => void;
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
  onAcceptQuest,
  onCompleteQuest,
  onHeal,
  onBuyPotion,
  onClose
}: DialogueModalProps) {
  const quest = view.readyQuest ?? view.availableQuest ?? view.activeQuest;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 80,
      background: 'rgba(10, 16, 28, 0.45)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      padding: '0 16px 28px',
      fontFamily: 'Outfit, sans-serif'
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(700px, 95vw)',
          background: 'rgba(24, 42, 66, 0.96)',
          border: `2px solid ${MARBLE}`,
          boxShadow: `inset 0 0 0 3px rgba(24, 42, 66, 0.96), inset 0 0 0 4px ${GOLD}, 0 12px 32px rgba(0,0,0,0.5)`,
          borderRadius: 6,
          padding: '20px 24px',
          color: MARBLE
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 19, fontWeight: 700, color: GOLD }}>
              {view.npcName}
            </div>
            <div style={{ fontSize: 11, color: SKY, letterSpacing: 1.4, textTransform: 'uppercase' }}>
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
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#f8fafc', marginBottom: 16 }}>
          « {view.text} »
        </p>

        {quest && (
          <div style={{
            background: 'rgba(12, 22, 38, 0.72)',
            border: `1px solid ${quest.kind === 'main' ? GOLD : SKY}`,
            borderRadius: 4,
            padding: '12px 14px',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 14,
                fontWeight: 700,
                color: quest.kind === 'main' ? GOLD : SKY,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <ScrollText size={15} />
                {quest.kind === 'main' ? 'Quête principale' : 'Quête secondaire'} : {quest.title}
              </span>
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>Niv. {quest.level}</span>
            </div>
            <div style={{ fontSize: 12.5, color: '#cbd5e1', marginBottom: 8 }}>{quest.summary}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 11.5, color: GOLD }}>
              <span>Récompenses : +{quest.reward.xp} XP</span>
              <span>+{quest.reward.gold} drachmes</span>
              {quest.reward.items?.map((ri) => (
                <span key={ri.itemId} style={{ color: '#e2e8f0' }}>
                  • {ri.quantity > 1 ? `${ri.quantity}x ` : ''}{ITEMS[ri.itemId]?.name ?? ri.itemId}
                </span>
              ))}
            </div>
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
                padding: '8px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Heart size={14} /> Se soigner gratuitement
            </button>
          )}

          {view.sellsPotion && (
            <button
              onClick={onBuyPotion}
              disabled={gold < 15}
              style={{
                background: gold >= 15 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                border: `1px solid ${gold >= 15 ? SKY : '#475569'}`,
                color: gold >= 15 ? '#e0f2fe' : '#64748b',
                borderRadius: 4,
                padding: '8px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: gold >= 15 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <ShoppingBag size={14} /> Potion d'ambroisie (<Coins size={12} /> 15)
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
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'Cinzel, serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <CheckCircle2 size={15} /> Terminer la quête
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
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'Cinzel, serif',
                cursor: 'pointer'
              }}
            >
              Accepter la quête
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
              fontSize: 12.5,
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
