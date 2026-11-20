import { Lock, RotateCcw, Sparkles } from 'lucide-react';
import { GODS_LORE } from '@greek-myth/shared';
import { GOD_SKILL_TREES, SkillNodeDef } from '../../game/data/skillTrees';
import { canUpgradeSkill, GameProgressState } from '../../game/state/gameState';
import { COLORS, css } from '../../game/scenes/palette';

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);
const SKY = css(COLORS.sky);

interface SkillTreePanelProps {
  state: GameProgressState;
  onUpgradeSkill: (skillId: string) => void;
  onResetSkills: () => void;
}

export function SkillTreePanel({ state, onUpgradeSkill, onResetSkills }: SkillTreePanelProps) {
  const god = GODS_LORE[state.god];
  const nodes = GOD_SKILL_TREES[state.god] ?? [];
  const points = state.skillPoints ?? 0;
  const spent = Object.values(state.unlockedSkills ?? {}).reduce((a, b) => a + b, 0);

  const byTier = (tier: 1 | 2 | 3) => nodes.filter((n) => n.tier === tier);

  const renderNode = (node: SkillNodeDef) => {
    const rank = state.unlockedSkills?.[node.id] ?? 0;
    const maxed = rank >= node.maxRank;
    const reqMet = !node.requires || (state.unlockedSkills?.[node.requires] ?? 0) > 0;
    const upgradable = canUpgradeSkill(state, node.id);

    return (
      <div
        key={node.id}
        style={{
          background: maxed
            ? 'rgba(233, 195, 90, 0.16)'
            : rank > 0
              ? 'rgba(30, 56, 88, 0.85)'
              : 'rgba(12, 22, 38, 0.78)',
          border: `1.5px solid ${maxed ? GOLD : upgradable ? '#4ade80' : reqMet ? SKY : 'rgba(148,163,184,0.35)'}`,
          borderRadius: 6,
          padding: '10px 12px',
          opacity: reqMet ? 1 : 0.58,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 6
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700, color: maxed ? GOLD : MARBLE }}>
              {node.name}
            </span>
            <span style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: maxed ? GOLD : rank > 0 ? '#86efac' : '#94a3b8',
              background: 'rgba(15, 25, 42, 0.8)',
              padding: '1px 6px',
              borderRadius: 3
            }}>
              {rank}/{node.maxRank}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: '#cbd5e1', lineHeight: 1.45 }}>
            {node.description}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          {maxed ? (
            <span style={{ fontSize: 10.5, color: GOLD, fontWeight: 700 }}>Maîtrisé</span>
          ) : !reqMet ? (
            <span style={{ fontSize: 10.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lock size={11} /> Palier précédent requis
            </span>
          ) : (
            <button
              disabled={!upgradable}
              onClick={() => onUpgradeSkill(node.id)}
              style={{
                background: upgradable ? GOLD : 'rgba(100,116,139,0.28)',
                color: upgradable ? '#1f3550' : '#94a3b8',
                border: 'none',
                borderRadius: 4,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: upgradable ? 'pointer' : 'default'
              }}
            >
              Améliorer (1 pt)
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        background: 'rgba(12, 22, 38, 0.8)',
        border: `1px solid ${GOLD}`,
        borderRadius: 5,
        padding: '10px 14px'
      }}>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700, color: GOLD, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={15} /> Voie de {god.name}
          </div>
          <div style={{ fontSize: 11.5, color: SKY }}>
            +1 point de compétence à chaque niveau gagné.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: points > 0 ? 'rgba(233, 195, 90, 0.2)' : 'rgba(30, 41, 59, 0.7)',
            border: `1px solid ${points > 0 ? GOLD : SKY}`,
            borderRadius: 4,
            padding: '5px 11px',
            fontSize: 12.5,
            fontWeight: 700,
            color: points > 0 ? GOLD : MARBLE
          }}>
            Points disponibles : {points}
          </div>
          {spent > 0 && (
            <button
              onClick={onResetSkills}
              style={{
                background: 'transparent',
                border: `1px solid ${SKY}`,
                color: SKY,
                borderRadius: 4,
                padding: '5px 9px',
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RotateCcw size={12} /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Palier 1 : Racine */}
      <div>
        <div style={{ fontSize: 10, color: SKY, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' }}>
          Palier I — Éveil divin
        </div>
        <div style={{ maxWidth: 340, margin: '0 auto' }}>
          {byTier(1).map(renderNode)}
        </div>
      </div>

      {/* Connecteur visuel */}
      <div style={{ height: 14, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '52%', borderTop: `1.5px solid ${GOLD}`, borderLeft: `1.5px solid ${GOLD}`, borderRight: `1.5px solid ${GOLD}`, opacity: 0.45 }} />
      </div>

      {/* Palier 2 : 2 branches */}
      <div>
        <div style={{ fontSize: 10, color: SKY, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' }}>
          Palier II — Voies spécialisées
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {byTier(2).map(renderNode)}
        </div>
      </div>

      {/* Connecteur visuel */}
      <div style={{ height: 12, display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ width: 2, background: GOLD, opacity: 0.45 }} />
        <div style={{ width: 2, background: GOLD, opacity: 0.45 }} />
      </div>

      {/* Palier 3 : Maitrises ultimes */}
      <div>
        <div style={{ fontSize: 10, color: GOLD, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' }}>
          Palier III — Bénédictions suprêmes
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {byTier(3).map(renderNode)}
        </div>
      </div>
    </div>
  );
}
