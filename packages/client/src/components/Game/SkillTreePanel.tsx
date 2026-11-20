import { useState } from 'react';
import { Lock, RotateCcw } from 'lucide-react';
import { GODS_LORE } from '@greek-myth/shared';
import { HERO_CLASSES } from '../../game/data/classes';
import {
  CLASS_ROLE_LABEL,
  CLASS_SKILL_TREES,
  GOD_SKILL_TREES,
  SkillNodeDef
} from '../../game/data/skillTrees';
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
  const [branch, setBranch] = useState<'class' | 'god'>('class');
  const god = GODS_LORE[state.god];
  const cls = HERO_CLASSES[state.heroClass];
  const meta = CLASS_ROLE_LABEL[state.heroClass];
  const nodes = branch === 'class' ? CLASS_SKILL_TREES[state.heroClass] : GOD_SKILL_TREES[state.god];
  const points = state.skillPoints ?? 0;
  const spentTotal = Object.values(state.unlockedSkills ?? {}).reduce((a, b) => a + b, 0);

  const leftNodes = nodes.filter((n) => n.path === 'left').sort((a, b) => a.tier - b.tier);
  const rightNodes = nodes.filter((n) => n.path === 'right').sort((a, b) => a.tier - b.tier);

  const renderColumn = (title: string, colNodes: SkillNodeDef[]) => (
    <div style={{
      background: 'rgba(10, 18, 32, 0.7)',
      border: '1px solid rgba(143, 195, 230, 0.25)',
      borderRadius: 5,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 10 }}>
        {title}
      </div>

      {colNodes.map((node, idx) => {
        const rank = state.unlockedSkills?.[node.id] ?? 0;
        const maxed = rank >= node.maxRank;
        const reqMet = !node.requires || (state.unlockedSkills?.[node.requires] ?? 0) > 0;
        const levelMet = state.level >= node.minLevel;
        const upgradable = canUpgradeSkill(state, node.id);
        const isActive = Boolean(node.unlocksActive);

        return (
          <div key={node.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {idx > 0 && (
              <div style={{
                width: 2,
                height: 14,
                background: reqMet ? GOLD : 'rgba(148,163,184,0.3)'
              }} />
            )}
            <div style={{
              width: '100%',
              background: maxed
                ? 'rgba(233, 195, 90, 0.16)'
                : rank > 0
                  ? 'rgba(28, 54, 86, 0.85)'
                  : 'rgba(15, 26, 44, 0.85)',
              border: `1.5px solid ${maxed ? GOLD : upgradable ? '#4ade80' : isActive && reqMet ? node.unlocksActive!.color : 'rgba(143,195,230,0.28)'}`,
              borderRadius: 5,
              padding: '8px 10px',
              opacity: reqMet && levelMet ? 1 : 0.55
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12.5, fontWeight: 700, color: isActive ? node.unlocksActive!.color : MARBLE }}>
                  {node.name}
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: maxed ? GOLD : rank > 0 ? '#86efac' : '#94a3b8' }}>
                  {rank}/{node.maxRank}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 3 }}>
                {node.description}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 10, color: levelMet ? '#94a3b8' : '#fca5a5' }}>
                  {isActive ? 'Sort actif' : 'Passif'} • Niv. {node.minLevel}
                </span>
                {maxed ? (
                  <span style={{ fontSize: 10, color: GOLD, fontWeight: 700 }}>Max</span>
                ) : !levelMet || !reqMet ? (
                  <Lock size={11} color="#94a3b8" />
                ) : (
                  <button
                    disabled={!upgradable}
                    onClick={() => onUpgradeSkill(node.id)}
                    style={{
                      background: upgradable ? GOLD : 'rgba(100,116,139,0.25)',
                      color: upgradable ? '#1f3550' : '#94a3b8',
                      border: 'none',
                      borderRadius: 3,
                      padding: '2.5px 8px',
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: upgradable ? 'pointer' : 'default'
                    }}
                  >
                    +1
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setBranch('class')}
            style={{
              background: branch === 'class' ? GOLD : 'rgba(12, 22, 38, 0.8)',
              color: branch === 'class' ? '#1f3550' : MARBLE,
              border: `1px solid ${branch === 'class' ? GOLD : SKY}`,
              borderRadius: 4,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'Cinzel, serif',
              cursor: 'pointer'
            }}
          >
            {cls.name}
          </button>
          <button
            onClick={() => setBranch('god')}
            style={{
              background: branch === 'god' ? GOLD : 'rgba(12, 22, 38, 0.8)',
              color: branch === 'god' ? '#1f3550' : MARBLE,
              border: `1px solid ${branch === 'god' ? GOLD : SKY}`,
              borderRadius: 4,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'Cinzel, serif',
              cursor: 'pointer'
            }}
          >
            {god.name}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: points > 0 ? GOLD : MARBLE }}>
            Points : {points}
          </span>
          {spentTotal > 0 && (
            <button
              onClick={onResetSkills}
              style={{
                background: 'transparent',
                border: `1px solid ${SKY}`,
                color: SKY,
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 12 }}>
        {renderColumn(branch === 'class' ? meta.leftName : `Offensif (${god.name})`, leftNodes)}
        {renderColumn(branch === 'class' ? meta.rightName : `Soutien (${god.name})`, rightNodes)}
      </div>
    </div>
  );
}
