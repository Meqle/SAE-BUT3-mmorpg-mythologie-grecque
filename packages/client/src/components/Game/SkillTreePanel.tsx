import { useState } from 'react';
import { Flame, Lock, RotateCcw, Shield, Sparkles, Swords } from 'lucide-react';
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
  const roleInfo = CLASS_ROLE_LABEL[state.heroClass];
  const nodes = branch === 'class' ? CLASS_SKILL_TREES[state.heroClass] : GOD_SKILL_TREES[state.god];
  const points = state.skillPoints ?? 0;
  const spentTotal = Object.values(state.unlockedSkills ?? {}).reduce((a, b) => a + b, 0);
  const spentClass = CLASS_SKILL_TREES[state.heroClass].reduce((sum, n) => sum + (state.unlockedSkills?.[n.id] ?? 0), 0);
  const spentGod = GOD_SKILL_TREES[state.god].reduce((sum, n) => sum + (state.unlockedSkills?.[n.id] ?? 0), 0);

  const byTier = (tier: 1 | 2 | 3 | 4 | 5) => nodes.filter((n) => n.tier === tier);

  const renderNode = (node: SkillNodeDef) => {
    const rank = state.unlockedSkills?.[node.id] ?? 0;
    const maxed = rank >= node.maxRank;
    const reqMet = !node.requires || (state.unlockedSkills?.[node.requires] ?? 0) > 0;
    const levelMet = state.level >= node.minLevel;
    const upgradable = canUpgradeSkill(state, node.id);
    const isActive = Boolean(node.unlocksActive);

    return (
      <div
        key={node.id}
        style={{
          background: maxed
            ? 'rgba(233, 195, 90, 0.17)'
            : rank > 0
              ? 'rgba(30, 58, 92, 0.88)'
              : 'rgba(12, 22, 38, 0.8)',
          border: `1.5px solid ${maxed ? GOLD : isActive ? (upgradable ? '#4ade80' : node.unlocksActive!.color) : upgradable ? '#4ade80' : reqMet && levelMet ? SKY : 'rgba(148,163,184,0.32)'}`,
          borderRadius: 6,
          padding: '9px 11px',
          opacity: reqMet && levelMet ? 1 : 0.56,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 5
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12.5, fontWeight: 700, color: maxed ? GOLD : isActive ? node.unlocksActive!.color : MARBLE }}>
              {node.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {isActive && (
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: '#0f172a',
                  background: node.unlocksActive!.color,
                  padding: '1px 5px',
                  borderRadius: 3,
                  textTransform: 'uppercase'
                }}>
                  Actif • {node.unlocksActive!.roleTag}
                </span>
              )}
              <span style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: maxed ? GOLD : rank > 0 ? '#86efac' : '#94a3b8',
                background: 'rgba(15, 25, 42, 0.85)',
                padding: '1px 6px',
                borderRadius: 3
              }}>
                {rank}/{node.maxRank}
              </span>
            </div>
          </div>
          <div style={{ fontSize: 11.2, color: '#cbd5e1', lineHeight: 1.42 }}>
            {node.description}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: levelMet ? '#94a3b8' : '#fca5a5' }}>
            Niv. {node.minLevel}+
          </span>
          {maxed ? (
            <span style={{ fontSize: 10.5, color: GOLD, fontWeight: 700 }}>Maîtrisé</span>
          ) : !levelMet ? (
            <span style={{ fontSize: 10, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Lock size={10} /> Niveau {node.minLevel}
            </span>
          ) : !reqMet ? (
            <span style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Lock size={10} /> Palier précédent
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
                padding: '3.5px 9px',
                fontSize: 10.8,
                fontWeight: 700,
                cursor: upgradable ? 'pointer' : 'default'
              }}
            >
              Débloquer (1 pt)
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {/* En-tete Points & Switch Branche Classe / Faction Divine */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        background: 'rgba(12, 22, 38, 0.85)',
        border: `1px solid ${GOLD}`,
        borderRadius: 5,
        padding: '10px 14px'
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setBranch('class')}
            style={{
              background: branch === 'class' ? GOLD : 'rgba(24, 42, 66, 0.85)',
              color: branch === 'class' ? '#1f3550' : MARBLE,
              border: `1px solid ${branch === 'class' ? GOLD : SKY}`,
              borderRadius: 4,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'Cinzel, serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {state.heroClass === 'GUERRIER' ? <Shield size={14} /> : <Swords size={14} />}
            {cls.name} ({roleInfo.role}) • {spentClass} pts
          </button>
          <button
            onClick={() => setBranch('god')}
            style={{
              background: branch === 'god' ? GOLD : 'rgba(24, 42, 66, 0.85)',
              color: branch === 'god' ? '#1f3550' : MARBLE,
              border: `1px solid ${branch === 'god' ? GOLD : SKY}`,
              borderRadius: 4,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'Cinzel, serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Flame size={14} /> Faction {god.name} • {spentGod} pts
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            background: points > 0 ? 'rgba(233, 195, 90, 0.22)' : 'rgba(30, 41, 59, 0.7)',
            border: `1px solid ${points > 0 ? GOLD : SKY}`,
            borderRadius: 4,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 700,
            color: points > 0 ? GOLD : MARBLE
          }}>
            Points : {points} <span style={{ opacity: 0.7, fontWeight: 400 }}>(Niv. {state.level}/40)</span>
          </div>
          {spentTotal > 0 && (
            <button
              onClick={onResetSkills}
              style={{
                background: 'transparent',
                border: `1px solid ${SKY}`,
                color: SKY,
                borderRadius: 4,
                padding: '4px 8px',
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

      <div style={{ fontSize: 11.5, color: SKY, padding: '0 2px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <span>
          <Sparkles size={12} color={GOLD} style={{ verticalAlign: 'middle' }} />{' '}
          {branch === 'class' ? roleInfo.subtitle : `Bénédictions et sorts actifs de ${god.name}.`}
        </span>
        <span style={{ color: '#cbd5e1' }}>Les compétences <b>[ACTIF]</b> s’ajoutent aux touches <b>[1] [2] [3] [4]</b>.</span>
      </div>

      {/* 5 Paliers (Niv. 1 -> 40) */}
      {([
        { tier: 1 as const, label: 'Palier I — Éveil (Niv. 1+)', centered: true },
        { tier: 2 as const, label: 'Palier II — Spécialisation (Niv. 3+)', centered: false },
        { tier: 3 as const, label: 'Palier III — Maîtrise Coop (Niv. 10+)', centered: false },
        { tier: 4 as const, label: 'Palier IV — Héroïsme (Niv. 20+)', centered: false },
        { tier: 5 as const, label: 'Palier V — Pouvoir Ultime (Niv. 30+)', centered: true }
      ]).map((row) => (
        <div key={row.tier}>
          <div style={{ fontSize: 10, color: row.tier === 5 ? GOLD : SKY, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5, textAlign: 'center' }}>
            {row.label}
          </div>
          {row.centered ? (
            <div style={{ maxWidth: 420, margin: '0 auto' }}>
              {byTier(row.tier).map(renderNode)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
              {byTier(row.tier).map(renderNode)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
