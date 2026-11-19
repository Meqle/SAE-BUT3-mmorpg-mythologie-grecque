import { CSSProperties } from 'react';
import { GodLore, ServerInfo } from '@greek-myth/shared';
import { ArrowLeft, Backpack, BookOpen, Coins, Flame, Heart, ScrollText, Shield, Sparkles, Swords, Wind, Zap } from 'lucide-react';
import { DIVINE_SKILLS, HERO_CLASSES } from '../../game/data/classes';
import { QUEST_ORDER, QUESTS } from '../../game/data/story';
import type { ZoneDefinition } from '../../game/data/zones';
import { countItem, GameProgressState, getComputedStats } from '../../game/state/gameState';
import { COLORS, css } from '../../game/scenes/palette';
import type { ModalTab } from './InventoryModal';

export interface BossHudInfo {
  name: string;
  hp: number;
  maxHp: number;
  shielded: boolean;
  stelesActivated: number;
  stelesTotal: number;
}

export interface MinimapDot {
  x: number;
  y: number;
  kind: 'player' | 'npc' | 'enemy' | 'boss' | 'portal' | 'interact';
}

interface HudProps {
  server: ServerInfo;
  god: GodLore;
  status: string;
  zone: ZoneDefinition;
  state: GameProgressState;
  specialCooldown: number;
  dashCooldown: number;
  interactPrompt: string | null;
  toast: string | null;
  zoneBanner: boolean;
  bossInfo: BossHudInfo | null;
  minimapDots: MinimapDot[];
  loadError: string | null;
  compact: boolean;
  touch: boolean;
  onTriggerAttack: () => void;
  onTriggerSpecial: () => void;
  onTriggerDash: () => void;
  onTriggerPotion: () => void;
  onTriggerInteract: () => void;
  onOpenModal: (tab: ModalTab) => void;
  onLeave: () => void;
}

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);
const SKY = css(COLORS.sky);

const panel: CSSProperties = {
  position: 'absolute',
  background: 'rgba(26, 45, 70, 0.92)',
  border: `2px solid ${MARBLE}`,
  boxShadow: `inset 0 0 0 3px rgba(26, 45, 70, 0.92), inset 0 0 0 4px ${GOLD}, 0 4px 14px rgba(0, 0, 0, 0.32)`,
  borderRadius: 4,
  color: MARBLE,
  zIndex: 10,
  fontFamily: 'Outfit, sans-serif'
};

export function Hud({
  server,
  god,
  status,
  zone,
  state,
  specialCooldown,
  dashCooldown,
  interactPrompt,
  toast,
  zoneBanner,
  bossInfo,
  minimapDots,
  loadError,
  compact,
  touch,
  onTriggerAttack,
  onTriggerSpecial,
  onTriggerDash,
  onTriggerPotion,
  onTriggerInteract,
  onOpenModal,
  onLeave
}: HudProps) {
  const stats = getComputedStats(state);
  const cls = HERO_CLASSES[state.heroClass];
  const skill = DIVINE_SKILLS[state.god];
  const hpPct = Math.max(0, Math.min(100, (state.hp / stats.maxHp) * 100));
  const xpPct = Math.max(0, Math.min(100, (state.xp / stats.xpToNext) * 100));
  const potions = countItem(state, 'potion_ambroisie') + countItem(state, 'nectar_divin');

  const trackedQuests = QUEST_ORDER.filter((id) => {
    const s = state.quests[id]?.status;
    return s === 'active' || s === 'ready';
  }).slice(0, 3);

  const nextAvailableMain = QUEST_ORDER.find((id) => {
    const def = QUESTS[id];
    return def.kind === 'main' && state.quests[id]?.status === 'available';
  });

  const actionBtn = (
    label: string,
    keyHint: string,
    icon: React.ReactNode,
    onClick: () => void,
    cooldown = 0,
    badge?: string | number,
    accent = GOLD
  ) => (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        background: cooldown > 0 ? 'rgba(15, 23, 42, 0.85)' : 'rgba(20, 36, 58, 0.94)',
        border: `1.5px solid ${cooldown > 0 ? '#475569' : accent}`,
        color: cooldown > 0 ? '#64748b' : MARBLE,
        borderRadius: 4,
        padding: compact ? '6px 8px' : '7px 11px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: compact ? 46 : 62,
        gap: 2
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon}
        {badge !== undefined && (
          <span style={{ fontSize: 10, fontWeight: 700, color: GOLD }}>{badge}</span>
        )}
      </div>
      <span style={{ fontSize: 9.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
      {!touch && (
        <span style={{ fontSize: 8.5, color: SKY, letterSpacing: 0.5 }}>{keyHint}</span>
      )}
      {cooldown > 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10, 16, 28, 0.72)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          color: GOLD,
          borderRadius: 3
        }}>
          {cooldown.toFixed(1)}s
        </div>
      )}
    </button>
  );

  return (
    <>
      {loadError && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(185, 28, 28, 0.95)', padding: '20px 28px', borderRadius: 8,
          color: '#fff', textAlign: 'center', width: 'min(420px, 90vw)', zIndex: 120
        }}>
          <h3 style={{ fontFamily: 'Cinzel, serif' }}>Erreur de chargement du moteur 2D</h3>
          <p style={{ marginTop: 8, fontSize: 13 }}>{loadError}</p>
          <button onClick={onLeave} style={{
            marginTop: 14, padding: '8px 16px', background: '#fff', color: '#991b1b',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700
          }}>
            Retour au menu
          </button>
        </div>
      )}

      {/* Haut gauche : fiche heros, PV, XP, drachmes, quitter */}
      <div style={{
        ...panel,
        top: compact ? 8 : 14,
        left: compact ? 8 : 16,
        padding: compact ? '8px 10px' : '10px 14px',
        width: compact ? 'min(260px, 68vw)' : 292
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: compact ? 12.5 : 14.5, fontWeight: 700, color: GOLD, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {state.heroName}
            </div>
            <div style={{ fontSize: 10.5, color: SKY }}>
              {cls.name} • Niv. {state.level} • <span style={{ color: god.color }}>{god.name}</span>
            </div>
          </div>
          <button
            onClick={onLeave}
            title="Retour au menu"
            style={{
              background: 'transparent',
              border: `1px solid ${SKY}`,
              borderRadius: 3,
              color: MARBLE,
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              fontSize: 11,
              flexShrink: 0
            }}
          >
            <ArrowLeft size={13} /> {!compact && 'Menu'}
          </button>
        </div>

        {/* Barre PV */}
        <div style={{ marginBottom: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
            <span style={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Heart size={10} /> PV
            </span>
            <span style={{ fontWeight: 700 }}>{Math.ceil(state.hp)} / {stats.maxHp}</span>
          </div>
          <div style={{ height: 8, background: 'rgba(10, 18, 30, 0.85)', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(244,237,224,0.3)' }}>
            <div style={{
              width: `${hpPct}%`,
              height: '100%',
              background: hpPct < 30 ? 'linear-gradient(90deg, #dc2626, #f87171)' : 'linear-gradient(90deg, #16a34a, #4ade80)',
              transition: 'width 0.15s'
            }} />
          </div>
        </div>

        {/* Barre XP */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: '#cbd5e1', marginBottom: 2 }}>
            <span>Expérience</span>
            <span>{state.xp} / {stats.xpToNext} XP</span>
          </div>
          <div style={{ height: 5, background: 'rgba(10, 18, 30, 0.85)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${xpPct}%`, height: '100%', background: GOLD, transition: 'width 0.2s' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10.5, color: '#cbd5e1' }}>
          <span style={{ color: GOLD, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Coins size={12} /> {state.gold} drachmes
          </span>
          <span style={{ fontSize: 9.5, color: status === 'Connecté' ? '#86efac' : '#94a3b8' }}>
            {server.name} • {status === 'Connecté' ? 'En ligne' : 'Solo local'}
          </span>
        </div>
      </div>

      {/* Haut centre : nom de zone + barre de boss si present */}
      <div style={{
        position: 'absolute',
        top: compact ? 96 : 14,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
        width: 'min(420px, 88vw)'
      }}>
        <div style={{
          background: zoneBanner ? 'rgba(20, 35, 58, 0.94)' : 'rgba(20, 35, 58, 0.78)',
          border: `1.5px solid ${GOLD}`,
          borderRadius: 4,
          padding: zoneBanner ? '8px 22px' : '4px 14px',
          textAlign: 'center',
          transition: 'all 0.3s'
        }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: zoneBanner ? 17 : 13, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>
            {zone.name}
          </div>
          <div style={{ fontSize: 10, color: SKY }}>
            {zone.subtitle} ({zone.recommendedLevel})
          </div>
        </div>

        {bossInfo && (
          <div style={{
            width: '100%',
            background: 'rgba(18, 28, 48, 0.94)',
            border: `2px solid ${bossInfo.shielded ? SKY : GOLD}`,
            borderRadius: 5,
            padding: '8px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700, color: GOLD }}>
                {bossInfo.name}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: bossInfo.shielded ? '#7dd3fc' : '#f87171' }}>
                {bossInfo.shielded
                  ? `BOUCLIER DIVIN • Stèles : ${bossInfo.stelesActivated}/${bossInfo.stelesTotal}`
                  : `${Math.ceil(bossInfo.hp)} / ${bossInfo.maxHp} PV`}
              </span>
            </div>
            <div style={{ height: 10, background: '#0f172a', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{
                width: `${Math.max(0, (bossInfo.hp / bossInfo.maxHp) * 100)}%`,
                height: '100%',
                background: bossInfo.shielded
                  ? 'linear-gradient(90deg, #0284c7, #7dd3fc)'
                  : 'linear-gradient(90deg, #b91c1c, #f97316)',
                transition: 'width 0.12s'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Haut droite : suivi de quetes + mini-carte */}
      {!compact && (
        <div style={{
          position: 'absolute',
          top: 14,
          right: 16,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          width: 266
        }}>
          {/* Minimap */}
          <div style={{
            ...panel,
            position: 'relative',
            width: 176,
            padding: '6px 8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: SKY, marginBottom: 4, letterSpacing: 1 }}>
              <span>CARTE</span>
              <span>{zone.viewMode === 'top-down' ? 'EXPLORATION' : 'ÉPREUVE'}</span>
            </div>
            <div style={{
              position: 'relative',
              width: 156,
              height: Math.max(54, Math.min(98, Math.round((zone.height / zone.width) * 156))),
              background: 'rgba(12, 22, 38, 0.9)',
              border: `1px solid rgba(233, 195, 90, 0.45)`,
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              {minimapDots.map((dot, idx) => {
                const left = `${(dot.x / zone.width) * 100}%`;
                const top = `${(dot.y / zone.height) * 100}%`;
                const color =
                  dot.kind === 'player' ? '#facc15' :
                  dot.kind === 'npc' ? '#4ade80' :
                  dot.kind === 'portal' ? '#38bdf8' :
                  dot.kind === 'boss' ? '#f97316' :
                  dot.kind === 'interact' ? '#fde047' :
                  '#ef4444';
                const size = dot.kind === 'player' ? 6 : dot.kind === 'boss' ? 7 : dot.kind === 'portal' ? 6 : 4;
                return (
                  <span
                    key={idx}
                    style={{
                      position: 'absolute',
                      left,
                      top,
                      width: size,
                      height: size,
                      borderRadius: dot.kind === 'portal' ? 1 : '50%',
                      background: color,
                      transform: 'translate(-50%, -50%)',
                      boxShadow: dot.kind === 'player' ? '0 0 6px #facc15' : 'none'
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Suivi des quetes */}
          <div style={{ ...panel, position: 'relative', width: '100%', padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 700, color: GOLD, display: 'flex', alignItems: 'center', gap: 5 }}>
                <ScrollText size={13} /> Objectifs
              </span>
              <button
                onClick={() => onOpenModal('quests')}
                style={{ background: 'transparent', border: 'none', color: SKY, fontSize: 10, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Journal
              </button>
            </div>

            {trackedQuests.length === 0 && nextAvailableMain && (
              <div style={{ fontSize: 11.5, color: '#f1f5f9', lineHeight: 1.45 }}>
                <div style={{ color: GOLD, fontWeight: 700 }}>Quête principale disponible</div>
                <div>Parlez à <b>{QUESTS[nextAvailableMain].giverNpcId === 'lycos' ? 'Lycos' : 'l’Écho de Prométhée'}</b> pour poursuivre l’histoire.</div>
              </div>
            )}

            {trackedQuests.length === 0 && !nextAvailableMain && (
              <div style={{ fontSize: 11.5, color: '#86efac', lineHeight: 1.45 }}>
                Chapitre Early/Mid Game accompli ! Explorez librement les zones ou complétez les quêtes secondaires de l'Agora.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {trackedQuests.map((id) => {
                const def = QUESTS[id];
                const prog = state.quests[id];
                return (
                  <div key={id} style={{ borderLeft: `2px solid ${def.kind === 'main' ? GOLD : SKY}`, paddingLeft: 8 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: def.kind === 'main' ? GOLD : MARBLE }}>
                      {def.title}
                    </div>
                    {prog.status === 'ready' ? (
                      <div style={{ fontSize: 10.5, color: '#4ade80' }}>
                        ✓ Prête : retournez voir {def.turnInNpcId === 'lycos' ? 'Lycos' : def.turnInNpcId === 'damon' ? 'Damon' : def.turnInNpcId === 'cassandre' ? 'Cassandre' : def.turnInNpcId === 'theron' ? 'Théron' : "l'Écho de Prométhée"}
                      </div>
                    ) : (
                      def.objectives.map((obj) => {
                        const cur = prog.counts[obj.id] ?? 0;
                        const done = cur >= obj.required;
                        return (
                          <div key={obj.id} style={{ fontSize: 10.5, color: done ? '#4ade80' : '#cbd5e1' }}>
                            {done ? '✓' : '•'} {obj.label} ({cur}/{obj.required})
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notification toast */}
      {toast && (
        <div style={{
          position: 'absolute',
          top: compact ? 156 : 112,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'rgba(20, 35, 58, 0.96)',
          border: `1.5px solid ${GOLD}`,
          color: GOLD,
          padding: '8px 18px',
          borderRadius: 4,
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'Cinzel, serif',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          textAlign: 'center',
          maxWidth: '90vw'
        }}>
          {toast}
        </div>
      )}

      {/* Bas centre : invite d'interaction + barre d'actions */}
      <div style={{
        position: 'absolute',
        bottom: compact ? 10 : 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8
      }}>
        {interactPrompt && (
          <button
            onClick={onTriggerInteract}
            style={{
              background: 'rgba(20, 35, 58, 0.96)',
              border: `2px solid ${GOLD}`,
              color: MARBLE,
              borderRadius: 4,
              padding: '6px 16px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span style={{ background: GOLD, color: '#1f3550', padding: '1px 6px', borderRadius: 2, fontSize: 11, fontWeight: 900 }}>E</span>
            <span>{interactPrompt}</span>
          </button>
        )}

        {!touch && (
          <div style={{
            ...panel,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 8px'
          }}>
            {actionBtn('Attaque', 'Clic / J', <Swords size={15} color={GOLD} />, onTriggerAttack)}
            {actionBtn(skill.skillName.split(' ')[0], 'K', <Flame size={15} color={god.color} />, onTriggerSpecial, specialCooldown, undefined, god.color)}
            {actionBtn('Esquive', 'Shift', <Wind size={15} color={SKY} />, onTriggerDash, dashCooldown, undefined, SKY)}
            {actionBtn('Potion', 'R', <Sparkles size={15} color="#4ade80" />, onTriggerPotion, 0, potions, '#4ade80')}
            <div style={{ width: 1, height: 34, background: 'rgba(143,195,230,0.35)', margin: '0 2px' }} />
            {actionBtn('Sac', 'I', <Backpack size={15} color={MARBLE} />, () => onOpenModal('inventory'), 0, undefined, SKY)}
            {actionBtn('Chroniques', 'C', <BookOpen size={15} color={MARBLE} />, () => onOpenModal('codex'), 0, undefined, SKY)}
          </div>
        )}

        {!compact && !touch && (
          <div style={{ fontSize: 10, color: MARBLE, textShadow: '0 1px 4px #000', opacity: 0.9 }}>
            <Shield size={10} style={{ verticalAlign: 'middle' }} /> ZQSD / Flèches : Déplacer • {zone.viewMode === 'side-view' ? 'Espace : Sauter • ' : ''}Clic gauche / J : Attaquer • K : Pouvoir divin • E : Interagir
          </div>
        )}
      </div>

      {/* Boutons compacts d'inventaire/quetes sur mobile */}
      {compact && (
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 20, display: 'flex', gap: 6 }}>
          <button
            onClick={() => onOpenModal('quests')}
            aria-label="Quêtes"
            style={{ ...panel, position: 'relative', padding: 8, cursor: 'pointer', display: 'flex' }}
          >
            <ScrollText size={16} color={GOLD} />
          </button>
          <button
            onClick={() => onOpenModal('inventory')}
            aria-label="Sac"
            style={{ ...panel, position: 'relative', padding: 8, cursor: 'pointer', display: 'flex' }}
          >
            <Backpack size={16} color={MARBLE} />
          </button>
          <button
            onClick={onTriggerPotion}
            aria-label="Potion"
            style={{ ...panel, position: 'relative', padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
          >
            <Zap size={14} color="#4ade80" /> {potions}
          </button>
        </div>
      )}
    </>
  );
}
