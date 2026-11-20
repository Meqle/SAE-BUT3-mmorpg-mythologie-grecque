import { CSSProperties } from 'react';
import { GodLore, ServerInfo } from '@greek-myth/shared';
import { Backpack, BookOpen, Coins, Flame, Menu, ScrollText, Sparkles, Swords, Wind, Zap } from 'lucide-react';
import { HERO_CLASSES } from '../../game/data/classes';
import { getUnlockedActiveSkills } from '../../game/data/skillTrees';
import { QUEST_ORDER, QUESTS } from '../../game/data/story';
import type { ZoneDefinition } from '../../game/data/zones';
import type { GameSettings } from '../../game/settings';
import { countItem, GameProgressState, getComputedStats } from '../../game/state/gameState';
import { COLORS, css } from '../../game/scenes/palette';
import type { ModalTab } from './InventoryModal';
import { Minimap, MinimapMarker } from './Minimap';

export interface BossHudInfo {
  name: string;
  hp: number;
  maxHp: number;
  shielded: boolean;
  stelesActivated: number;
  stelesTotal: number;
}

interface HudProps {
  server: ServerInfo;
  god: GodLore;
  status: string;
  zone: ZoneDefinition;
  state: GameProgressState;
  settings: GameSettings;
  specialCooldown: number;
  dashCooldown: number;
  activeSkillCooldowns?: Record<string, number>;
  interactPrompt: string | null;
  toast: string | null;
  zoneBanner: boolean;
  bossInfo: BossHudInfo | null;
  minimapMarkers: MinimapMarker[];
  loadError: string | null;
  compact: boolean;
  touch: boolean;
  onTriggerAttack: () => void;
  onTriggerSpecial: () => void;
  onTriggerDash: () => void;
  onTriggerPotion: () => void;
  onTriggerActiveSkill?: (skillId: string) => void;
  onTriggerInteract: () => void;
  onOpenModal: (tab: ModalTab) => void;
  onOpenPause: () => void;
  onOpenWorldMap: () => void;
  onLeave: () => void;
}

const MARBLE = css(COLORS.marble);
const GOLD = css(COLORS.gold);
const SKY = css(COLORS.sky);

const panel: CSSProperties = {
  position: 'absolute',
  background: 'rgba(26, 45, 70, 0.88)',
  border: `1.5px solid ${MARBLE}`,
  boxShadow: `inset 0 0 0 2px rgba(26, 45, 70, 0.88), inset 0 0 0 3px ${GOLD}, 0 4px 12px rgba(0, 0, 0, 0.28)`,
  borderRadius: 4,
  color: MARBLE,
  zIndex: 10,
  fontFamily: 'Outfit, sans-serif'
};

export function Hud({
  god,
  status,
  zone,
  state,
  settings,
  specialCooldown,
  dashCooldown,
  activeSkillCooldowns = {},
  interactPrompt,
  toast,
  zoneBanner,
  bossInfo,
  minimapMarkers,
  loadError,
  compact,
  touch,
  onTriggerAttack,
  onTriggerSpecial,
  onTriggerDash,
  onTriggerPotion,
  onTriggerActiveSkill,
  onTriggerInteract,
  onOpenModal,
  onOpenPause,
  onOpenWorldMap,
  onLeave
}: HudProps) {
  const stats = getComputedStats(state);
  const cls = HERO_CLASSES[state.heroClass];
  const hpPct = Math.max(0, Math.min(100, (state.hp / stats.maxHp) * 100));
  const xpPct = Math.max(0, Math.min(100, (state.xp / stats.xpToNext) * 100));
  const potions = countItem(state, 'potion_ambroisie') + countItem(state, 'nectar_divin');

  const trackedQuests = QUEST_ORDER.filter((id) => {
    const s = state.quests[id]?.status;
    return s === 'active' || s === 'ready';
  }).slice(0, 2);

  const slotBtn = (
    keyLabel: string,
    icon: React.ReactNode,
    onClick: () => void,
    title: string,
    cooldown = 0,
    badge?: number,
    accent = GOLD
  ) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        position: 'relative',
        background: cooldown > 0 ? 'rgba(15, 23, 42, 0.85)' : 'rgba(20, 36, 58, 0.92)',
        border: `1.5px solid ${cooldown > 0 ? '#475569' : accent}`,
        color: cooldown > 0 ? '#64748b' : MARBLE,
        borderRadius: 4,
        width: compact ? 40 : 46,
        height: compact ? 40 : 46,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {icon}
      {badge !== undefined && (
        <span style={{ position: 'absolute', top: 2, right: 4, fontSize: 9.5, fontWeight: 800, color: GOLD }}>{badge}</span>
      )}
      {!touch && (
        <span style={{ position: 'absolute', bottom: 1, left: 4, fontSize: 8.5, color: SKY, fontWeight: 700 }}>{keyLabel}</span>
      )}
      {cooldown > 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10, 16, 28, 0.72)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: GOLD,
          borderRadius: 3
        }}>
          {cooldown.toFixed(1)}
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
          <h3 style={{ fontFamily: 'Cinzel, serif' }}>Erreur moteur 2D</h3>
          <p style={{ marginTop: 8, fontSize: 13 }}>{loadError}</p>
          <button onClick={onLeave} style={{
            marginTop: 14, padding: '8px 16px', background: '#fff', color: '#991b1b',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700
          }}>
            Retour au menu
          </button>
        </div>
      )}

      {/* Haut gauche : fiche heros compacte */}
      <div style={{
        ...panel,
        top: 12,
        left: 14,
        padding: '8px 12px',
        width: compact ? 'min(220px, 60vw)' : 232
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{
              background: GOLD,
              color: '#1f3550',
              fontSize: 10,
              fontWeight: 900,
              padding: '1px 5px',
              borderRadius: 3
            }}>
              {state.level}
            </span>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700, color: MARBLE, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {state.heroName}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              title={status}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: status === 'Connecté' ? '#4ade80' : '#94a3b8'
              }}
            />
            <button
              onClick={onOpenPause}
              title="Menu (Échap)"
              style={{
                background: 'transparent',
                border: 'none',
                color: MARBLE,
                cursor: 'pointer',
                padding: 2,
                display: 'flex'
              }}
            >
              <Menu size={15} />
            </button>
          </div>
        </div>

        {/* Barre PV */}
        <div style={{ position: 'relative', height: 11, background: 'rgba(10, 18, 30, 0.88)', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(244,237,224,0.28)', marginBottom: 4 }}>
          <div style={{
            width: `${hpPct}%`,
            height: '100%',
            background: hpPct < 30 ? 'linear-gradient(90deg, #b91c1c, #ef4444)' : 'linear-gradient(90deg, #15803d, #4ade80)',
            transition: 'width 0.15s'
          }} />
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8.5, fontWeight: 700, textShadow: '0 1px 2px #000' }}>
            {Math.ceil(state.hp)} / {stats.maxHp}
          </span>
        </div>

        {/* Barre XP fine */}
        <div style={{ height: 4, background: 'rgba(10, 18, 30, 0.85)', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
          <div style={{ width: `${xpPct}%`, height: '100%', background: GOLD, transition: 'width 0.2s' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10 }}>
          <span style={{ color: SKY }}>{cls.name}</span>
          <span style={{ color: GOLD, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Coins size={11} /> {state.gold}
          </span>
        </div>
      </div>

      {/* Haut centre : banniere fugace a l'entree de zone + barre de boss uniquement si engage */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
        width: 'min(380px, 85vw)'
      }}>
        {zoneBanner && (
          <div style={{
            background: 'rgba(20, 35, 58, 0.9)',
            borderTop: `1.5px solid ${GOLD}`,
            borderBottom: `1.5px solid ${GOLD}`,
            padding: '6px 26px',
            textAlign: 'center'
          }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, color: GOLD, letterSpacing: 1.5 }}>
              {zone.name}
            </div>
            <div style={{ fontSize: 10, color: SKY }}>{zone.subtitle}</div>
          </div>
        )}

        {bossInfo && (
          <div style={{
            width: '100%',
            background: 'rgba(18, 28, 48, 0.92)',
            border: `1.5px solid ${bossInfo.shielded ? SKY : GOLD}`,
            borderRadius: 4,
            padding: '7px 12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12.5, fontWeight: 700, color: GOLD }}>
                {bossInfo.name}
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: bossInfo.shielded ? '#7dd3fc' : '#f87171' }}>
                {bossInfo.shielded
                  ? `Bouclier divin • Stèles ${bossInfo.stelesActivated}/${bossInfo.stelesTotal}`
                  : `${Math.ceil(bossInfo.hp)} / ${bossInfo.maxHp}`}
              </span>
            </div>
            <div style={{ height: 8, background: '#0f172a', borderRadius: 2, overflow: 'hidden' }}>
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

      {/* Haut droite : vraie mini-carte + objectifs discrets */}
      {!compact && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 14,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
          width: 224
        }}>
          {settings.showMinimap && <Minimap zone={zone} markers={minimapMarkers} onOpenWorldMap={onOpenWorldMap} />}

          {settings.showQuestTracker && trackedQuests.length > 0 && (
            <div style={{ ...panel, position: 'relative', width: '100%', padding: '8px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 700, color: GOLD, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ScrollText size={12} /> Quêtes
                </span>
                <button
                  onClick={() => onOpenModal('quests')}
                  style={{ background: 'transparent', border: 'none', color: SKY, fontSize: 9.5, cursor: 'pointer' }}
                >
                  [{settings.keys.quests.label}]
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {trackedQuests.map((id) => {
                  const def = QUESTS[id];
                  const prog = state.quests[id];
                  return (
                    <div key={id} style={{ borderLeft: `2px solid ${def.kind === 'main' ? GOLD : SKY}`, paddingLeft: 7 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: def.kind === 'main' ? GOLD : MARBLE }}>
                        {def.title}
                      </div>
                      {prog.status === 'ready' ? (
                        <div style={{ fontSize: 10, color: '#4ade80' }}>✓ Prête à rendre</div>
                      ) : (
                        def.objectives.map((obj) => {
                          const cur = prog.counts[obj.id] ?? 0;
                          const done = cur >= obj.required;
                          return (
                            <div key={obj.id} style={{ fontSize: 10, color: done ? '#4ade80' : '#cbd5e1' }}>
                              {done ? '✓' : '·'} {obj.label} ({cur}/{obj.required})
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast discret */}
      {toast && (
        <div style={{
          position: 'absolute',
          top: 86,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'rgba(20, 35, 58, 0.94)',
          border: `1.5px solid ${GOLD}`,
          color: GOLD,
          padding: '6px 16px',
          borderRadius: 4,
          fontSize: 12.5,
          fontWeight: 700,
          fontFamily: 'Cinzel, serif',
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
        }}>
          {toast}
        </div>
      )}

      {/* Bas centre : invite d'interaction + barre d'actions epuree */}
      <div style={{
        position: 'absolute',
        bottom: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7
      }}>
        {interactPrompt && (
          <button
            onClick={onTriggerInteract}
            style={{
              background: 'rgba(20, 35, 58, 0.94)',
              border: `1.5px solid ${GOLD}`,
              color: MARBLE,
              borderRadius: 4,
              padding: '5px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7
            }}
          >
            <span style={{ background: GOLD, color: '#1f3550', padding: '1px 5px', borderRadius: 2, fontSize: 10.5, fontWeight: 900 }}>
              {settings.keys.interact.label}
            </span>
            <span>{interactPrompt}</span>
          </button>
        )}

        {!touch && (
          <div style={{ ...panel, position: 'relative', display: 'flex', alignItems: 'center', gap: 5, padding: 5 }}>
            {slotBtn(settings.keys.attack.label, <Swords size={18} color={GOLD} />, onTriggerAttack, 'Attaque (Clic gauche)')}
            {slotBtn(settings.keys.special.label, <Flame size={18} color={god.color} />, onTriggerSpecial, 'Pouvoir divin (Clic droit)', specialCooldown, undefined, god.color)}
            {slotBtn(settings.keys.dash.label, <Wind size={18} color={SKY} />, onTriggerDash, 'Esquive', dashCooldown, undefined, SKY)}
            {slotBtn(settings.keys.potion.label, <Sparkles size={18} color="#4ade80" />, onTriggerPotion, "Potion d'ambroisie", 0, potions, '#4ade80')}
            {getUnlockedActiveSkills(state.heroClass, state.god, state.unlockedSkills).map((sk, idx) => (
              <span key={sk.id} style={{ display: 'contents' }}>
                {slotBtn(
                  String(idx + 1),
                  <Sparkles size={16} color={sk.color} />,
                  () => onTriggerActiveSkill?.(sk.id),
                  `${sk.name} — ${sk.shortDesc}`,
                  activeSkillCooldowns[sk.id] ?? 0,
                  undefined,
                  sk.color
                )}
              </span>
            ))}
            <div style={{ width: 1, height: 28, background: 'rgba(143,195,230,0.3)', margin: '0 2px' }} />
            {slotBtn(settings.keys.inventory.label, <Backpack size={17} color={MARBLE} />, () => onOpenModal('inventory'), 'Inventaire', 0, undefined, SKY)}
            {slotBtn(settings.keys.quests.label, <ScrollText size={17} color={MARBLE} />, () => onOpenModal('quests'), 'Quêtes', 0, undefined, SKY)}
            {slotBtn(settings.keys.codex.label, <BookOpen size={17} color={MARBLE} />, () => onOpenModal('codex'), 'Chroniques', 0, undefined, SKY)}
            {slotBtn('T', <Sparkles size={17} color={(state.skillPoints ?? 0) > 0 ? GOLD : MARBLE} />, () => onOpenModal('talents'), 'Arbre de compétences', 0, (state.skillPoints ?? 0) > 0 ? state.skillPoints : undefined, (state.skillPoints ?? 0) > 0 ? GOLD : SKY)}
          </div>
        )}
      </div>

      {compact && (
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 20, display: 'flex', gap: 6 }}>
          <button onClick={() => onOpenModal('quests')} aria-label="Quêtes" style={{ ...panel, position: 'relative', padding: 7, cursor: 'pointer', display: 'flex' }}>
            <ScrollText size={15} color={GOLD} />
          </button>
          <button onClick={() => onOpenModal('inventory')} aria-label="Sac" style={{ ...panel, position: 'relative', padding: 7, cursor: 'pointer', display: 'flex' }}>
            <Backpack size={15} color={MARBLE} />
          </button>
          <button onClick={onTriggerPotion} aria-label="Potion" style={{ ...panel, position: 'relative', padding: '7px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}>
            <Zap size={13} color="#4ade80" /> {potions}
          </button>
        </div>
      )}
    </>
  );
}
