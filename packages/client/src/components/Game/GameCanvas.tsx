import { useCallback, useEffect, useRef, useState } from 'react';
import { Application, Container } from 'pixi.js';
import { GODS_LORE, ServerInfo, ViewMode } from '@greek-myth/shared';
import { placeLayer, View, viewAround } from '../../game/camera';
import { DIVINE_SKILLS, HERO_CLASSES } from '../../game/data/classes';
import { ITEMS, RARITY_HEX, RARITY_LABEL } from '../../game/data/items';
import { rollMonsterLoot } from '../../game/data/loot';
import { NPCS } from '../../game/data/story';
import { stepZoneMovement, ZoneDefinition, ZoneId, zonePortalAt, ZONES } from '../../game/data/zones';
import { sound } from '../../game/audio';
import { createDust } from '../../game/effects';
import { createCombatFxLayer, createInteractableSprite, InteractableSprite } from '../../game/entities/combat';
import { createEnemyEntity, ENEMY_ARCHETYPES, EnemyEntity, redrawEnemyHp, updateEnemyVisual } from '../../game/entities/enemies';
import { createNpcSprite, NpcSprite } from '../../game/entities/npcs';
import { createKeyboard } from '../../game/input';
import { connect } from '../../game/network';
import { createHero, hexColor, HeroSprite, stackLabels } from '../../game/players';
import { createZoneScene, Scene } from '../../game/scenes';
import { COLORS, css } from '../../game/scenes/palette';
import { GameSettings, loadSettings, saveSettings } from '../../game/settings';
import {
  acceptQuest,
  addItemToState,
  completeQuest,
  consumeItem,
  equipItem,
  GameProgressState,
  getComputedStats,
  getNpcBadge,
  grantXp,
  markZoneDiscovered,
  NpcDialogueView,
  recordBestiaryKill,
  recordQuestEvent,
  resolveNpcDialogue,
  saveGameState,
  sellItem
} from '../../game/state/gameState';
import { useScreen } from '../../game/useScreen';
import { PrologueOverlay } from '../Story/PrologueOverlay';
import { DialogueModal } from './DialogueModal';
import { BossHudInfo, Hud } from './Hud';
import { InventoryModal, ModalTab } from './InventoryModal';
import { MinimapMarker } from './Minimap';
import { PauseMenuModal } from './PauseMenuModal';
import { TouchControls } from './TouchControls';
import { WorldMapModal } from './WorldMapModal';

interface GameCanvasProps {
  server: ServerInfo;
  initialState: GameProgressState;
  onLeave: () => void;
}

const INPUT_INTERVAL_MS = 50;

export function GameCanvas({ server, initialState, onLeave }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const screen = useScreen();

  const stateRef = useRef<GameProgressState>(JSON.parse(JSON.stringify(initialState)) as GameProgressState);
  const [uiState, setUiState] = useState<GameProgressState>(() => JSON.parse(JSON.stringify(initialState)) as GameProgressState);
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const settingsRef = useRef<GameSettings>(settings);
  settingsRef.current = settings;

  const [showPrologue, setShowPrologue] = useState(!initialState.prologueSeen);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [worldMapOpen, setWorldMapOpen] = useState(false);
  const [status, setStatus] = useState('Connexion…');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogue, setDialogue] = useState<NpcDialogueView | null>(null);
  const [modalTab, setModalTab] = useState<ModalTab | null>(null);
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [zoneBanner, setZoneBanner] = useState(true);
  const [specialCd, setSpecialCd] = useState(0);
  const [dashCd, setDashCd] = useState(0);
  const [bossInfo, setBossInfo] = useState<BossHudInfo | null>(null);
  const [minimapMarkers, setMinimapMarkers] = useState<MinimapMarker[]>([]);

  const pausedRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const keyboardRef = useRef<ReturnType<typeof createKeyboard> | null>(null);
  const actionsRef = useRef<{
    attack: (angle?: number) => void;
    special: () => void;
    dash: () => void;
    potion: (itemId?: string) => void;
    interact: () => void;
    refreshNpcBadges: () => void;
    travelToZone: (zoneId: ZoneId) => void;
  } | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const flashZoneBanner = useCallback(() => {
    setZoneBanner(true);
    if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = window.setTimeout(() => setZoneBanner(false), 2600);
  }, []);

  const syncUi = useCallback((persist = false) => {
    const snapshot = JSON.parse(JSON.stringify(stateRef.current)) as GameProgressState;
    setUiState(snapshot);
    if (persist) saveGameState(stateRef.current);
    actionsRef.current?.refreshNpcBadges();
  }, []);

  const handleSettingsChange = useCallback((next: GameSettings) => {
    setSettings(next);
    settingsRef.current = next;
    saveSettings(next);
    keyboardRef.current?.updateSettings(next);
    sound.setEnabled(next.soundEnabled);
  }, []);

  const modalOpen = showPrologue || pauseOpen || worldMapOpen || dialogue !== null || modalTab !== null;
  pausedRef.current = showPrologue || pauseOpen || worldMapOpen;

  useEffect(() => {
    keyboardRef.current?.setBlocked(modalOpen);
  }, [modalOpen]);

  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Escape') {
        if (showPrologue) {
          stateRef.current.prologueSeen = true;
          saveGameState(stateRef.current);
          setShowPrologue(false);
        } else if (dialogue) {
          setDialogue(null);
        } else if (worldMapOpen) {
          setWorldMapOpen(false);
        } else if (modalTab) {
          setModalTab(null);
        } else {
          setPauseOpen((p) => !p);
        }
        return;
      }
      if (showPrologue || pauseOpen || dialogue) return;
      const keys = settingsRef.current.keys;
      if (e.code === keys.inventory.code) setModalTab((prev) => (prev === 'inventory' ? null : 'inventory'));
      if (e.code === keys.quests.code) setModalTab((prev) => (prev === 'quests' ? null : 'quests'));
      if (e.code === keys.codex.code) setModalTab((prev) => (prev === 'codex' ? null : 'codex'));
      if (e.code === keys.map.code || (keys.map.code === 'KeyM' && e.key.toLowerCase() === 'm')) { setModalTab(null); setWorldMapOpen((prev) => !prev); }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [showPrologue, pauseOpen, worldMapOpen, dialogue, modalTab]);

  useEffect(() => {
    let app: Application | null = null;
    let cleanedUp = false;

    const currentZone = (): ZoneDefinition => ZONES[stateRef.current.zoneId];
    const godLore = GODS_LORE[stateRef.current.god];
    const cls = HERO_CLASSES[stateRef.current.heroClass];
    const skill = DIVINE_SKILLS[stateRef.current.god];

    const connection = connect({
      roomId: server.id,
      username: stateRef.current.heroName,
      god: stateRef.current.god,
      getViewMode: () => currentZone().viewMode,
      onStatus: (s) => { if (!cleanedUp) setStatus(s); }
    });
    sound.setEnabled(settingsRef.current.soundEnabled);
    const keyboard = createKeyboard(settingsRef.current);
    keyboardRef.current = keyboard;
    keyboard.setBlocked(!stateRef.current.prologueSeen);

    let lastView: View | null = null;

    const start = async () => {
      app = new Application();
      await app.init({
        resizeTo: window,
        backgroundColor: COLORS.sea,
        antialias: true,
        preference: 'webgl',
        autoDensity: true,
        resolution: window.devicePixelRatio || 1
      });
      if (cleanedUp || !containerRef.current) {
        app.destroy(true, { children: true });
        return;
      }
      app.canvas.style.display = 'block';
      containerRef.current.appendChild(app.canvas);

      const actors = new Container();
      const interactLayer = new Container();
      const npcLayer = new Container();
      const enemyLayer = new Container();
      const playerLayer = new Container();
      const dust = createDust();
      const fx = createCombatFxLayer();
      actors.addChild(interactLayer, npcLayer, enemyLayer, playerLayer, dust.graphics, fx.container);

      const hero = createHero(stateRef.current.heroName, hexColor(godLore.color), true, stateRef.current.heroClass);
      playerLayer.addChild(hero.container);
      const others = new Map<string, HeroSprite>();

      let npcs: NpcSprite[] = [];
      let interactables: InteractableSprite[] = [];
      let enemies: EnemyEntity[] = [];
      let scene: Scene | null = null;

      const startZone = currentZone();
      const player = {
        x: startZone.defaultSpawn.x,
        y: startZone.defaultSpawn.y,
        vx: 0,
        vy: 0,
        isGrounded: true
      };

      let facingAngle = -Math.PI / 2;
      let facingDir = 1;
      let attackCooldown = 0;
      let specialCooldown = 0;
      let dashCooldown = 0;
      let dashTimer = 0;
      let iFrames = 0;
      let portalLockTimer = 0;
      let previousJump = false;
      let comboCount = 0;
      let hasteTimer = 0;
      let cameraShake = 0;
      let regenTimer = 0;

      const refreshNpcBadges = () => {
        for (const npc of npcs) {
          npc.setBadge(getNpcBadge(stateRef.current, npc.npcId));
        }
      };

      const loadZone = (zoneId: ZoneId, spawnX?: number, spawnY?: number) => {
        stateRef.current.zoneId = zoneId;
        markZoneDiscovered(stateRef.current, zoneId);
        const zone = ZONES[zoneId];

        setBossInfo(null);

        if (scene) {
          sound.playPortal();
          app?.stage.removeChildren();
          scene.back.destroy({ children: true });
          scene.front.destroy({ children: true });
        }

        npcLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
        interactLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
        enemyLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
        dust.clear();
        fx.clear();

        scene = createZoneScene(zone);
        app?.stage.addChild(scene.back, actors, scene.front);

        npcs = zone.npcs.map((n) => {
          const sprite = createNpcSprite(n.npcId, n.x, n.y);
          npcLayer.addChild(sprite.container);
          return sprite;
        });
        refreshNpcBadges();

        interactables = zone.interactables.map((inter) => {
          const sprite = createInteractableSprite(inter);
          interactLayer.addChild(sprite.container);
          return sprite;
        });

        enemies = zone.spawns.map((sp) => {
          const entity = createEnemyEntity(sp, zone.viewMode);
          if (entity.type === 'sentinelle_poseidon') {
            entity.shielded = stateRef.current.activatedTrialSteles.length < 3;
            redrawEnemyHp(entity);
          }
          enemyLayer.addChild(entity.container);
          return entity;
        });

        player.x = spawnX ?? zone.defaultSpawn.x;
        player.y = spawnY ?? zone.defaultSpawn.y;
        player.vx = 0;
        player.vy = 0;
        lastView = null;
        portalLockTimer = 0.65;

        const readyQuests = recordQuestEvent(stateRef.current, 'enter_zone', zoneId);
        if (readyQuests.length > 0) showToast(`Objectif accompli : ${readyQuests[0]}`);
        flashZoneBanner();
        syncUi(true);
      };

      const damageEnemy = (enemy: EnemyEntity, rawDamage: number, isCrit = false, stunSec = 0) => {
        if (!enemy.alive) return;
        let dmg = rawDamage;
        if (enemy.shielded) {
          dmg = Math.max(2, Math.round(rawDamage * 0.15));
          if (settingsRef.current.showDamageNumbers) {
            fx.spawnText(enemy.x, enemy.y - 42, `Bouclier -${dmg}`, COLORS.sky, 11);
          }
        } else if (settingsRef.current.showDamageNumbers) {
          fx.spawnText(enemy.x, enemy.y - 26, isCrit ? `CRIT -${dmg}` : `-${dmg}`, isCrit ? COLORS.gold : 0xfff1f2, isCrit ? 15 : 13);
        }
        enemy.hp = Math.max(0, enemy.hp - dmg);
        enemy.hitFlash = 0.15;
        sound.playHit(isCrit);
        cameraShake = Math.max(cameraShake, isCrit ? 4.5 : 2.2);
        if (isCrit && stateRef.current.heroClass === 'ASSASSIN') hasteTimer = 1.5;
        if (stunSec > 0 && !enemy.shielded) enemy.stunTimer = Math.max(enemy.stunTimer, stunSec);
        redrawEnemyHp(enemy);

        if (enemy.hp <= 0) {
          enemy.alive = false;
          enemy.respawnTimer = enemy.respawnSeconds;
          enemy.container.visible = false;
          const arch = ENEMY_ARCHETYPES[enemy.type];
          dust.burst(enemy.x, enemy.y);

          stateRef.current.gold += arch.goldReward;
          const { leveledUp, newLevel } = grantXp(stateRef.current, arch.xpReward);
          if (settingsRef.current.showDamageNumbers) {
            fx.spawnText(enemy.x, enemy.y - 12, `+${arch.xpReward} XP  +${arch.goldReward}g`, COLORS.gold, 12);
          }

          if (arch.isBoss) {
            setBossInfo(null);
            if (!stateRef.current.defeatedBosses.includes(enemy.type)) {
              stateRef.current.defeatedBosses.push(enemy.type);
            }
          }

          recordBestiaryKill(stateRef.current, enemy.type);
          const readyQuests = recordQuestEvent(stateRef.current, 'kill', enemy.type);
          const lootDrops = rollMonsterLoot(enemy.type);
          if (lootDrops.length > 0) {
            let bestRarity: 'commun' | 'rare' | 'epique' | 'legendaire' = 'commun';
            const rank = { commun: 0, rare: 1, epique: 2, legendaire: 3 };
            for (const drop of lootDrops) {
              const def = ITEMS[drop.itemId];
              if (!def) continue;
              fx.spawnLootDrop(enemy.x, enemy.y, def.id, def.name, def.rarity, RARITY_HEX[def.rarity]);
              if (rank[def.rarity] > rank[bestRarity]) bestRarity = def.rarity;
            }
            sound.playLoot(bestRarity);
          }
          if (leveledUp) {
            sound.playLevelUp();
            fx.spawnSlash(player.x, player.y, 0, 75, COLORS.gold, 'ring');
            showToast(`Niveau ${newLevel} atteint !`);
          } else if (readyQuests.length > 0) {
            showToast(`Quête prête : ${readyQuests[0]}`);
          } else if (enemy.type === 'sentinelle_poseidon') {
            showToast('Sentinelle de Poséidon vaincue !');
          }
          syncUi(true);
        }
      };

      const damagePlayer = (amount: number, sourceX: number) => {
        if (iFrames > 0) return;
        const zone = currentZone();
        if (zone.safeZone) return;

        const parry = stateRef.current.god === 'ATHENA' && Math.random() < 0.18;
        if (parry) {
          if (settingsRef.current.showDamageNumbers) fx.spawnText(player.x, player.y - 26, 'Paré', COLORS.sky, 12);
          iFrames = 0.35;
          return;
        }

        stateRef.current.hp = Math.max(0, stateRef.current.hp - amount);
        iFrames = 0.55;
        sound.playPlayerHurt();
        cameraShake = Math.max(cameraShake, 6);
        hero.setHitFlash(true);
        if (settingsRef.current.showDamageNumbers) {
          fx.spawnText(player.x, player.y - 24, `-${amount}`, 0xf87171, 13);
        }
        const knockDir = player.x >= sourceX ? 1 : -1;
        player.vx += knockDir * 160;

        if (stateRef.current.hp <= 0) {
          const stats = getComputedStats(stateRef.current);
          stateRef.current.hp = stats.maxHp;
          showToast("Cassandre vous ramène à la cité de l'Agora.");
          loadZone('agora', ZONES.agora.defaultSpawn.x, ZONES.agora.defaultSpawn.y);
          return;
        }
        syncUi(false);
      };

      const performAttack = (overrideAngle?: number) => {
        if (attackCooldown > 0) return;
        const zone = currentZone();
        const stats = getComputedStats(stateRef.current);
        attackCooldown = cls.attackCooldown;
        comboCount = (comboCount + 1) % 3;
        const isFinisher = comboCount === 0;
        hero.pulseAttack();
        sound.playAttack(stateRef.current.heroClass === 'ARCHER' ? 'bow' : stateRef.current.heroClass === 'MAGE' ? 'magic' : stateRef.current.heroClass === 'ASSASSIN' ? 'dagger' : 'melee');

        const angle =
          overrideAngle !== undefined
            ? overrideAngle
            : zone.viewMode === 'side-view'
              ? (facingDir >= 0 ? 0 : Math.PI)
              : facingAngle;

        facingAngle = angle;
        facingDir = Math.cos(angle) >= 0 ? 1 : -1;
        hero.face(facingDir);
        if (zone.viewMode === 'top-down') hero.aimAngle(angle);

        if (cls.isRanged) {
          const speed = cls.projectileSpeed;
          const offsets = stateRef.current.heroClass === 'ARCHER' && isFinisher ? [-0.09, 0.09] : [0];
          for (const off of offsets) {
            const a = angle + off;
            fx.spawnProjectile({
              x: player.x + Math.cos(a) * 16,
              y: player.y + Math.sin(a) * 16,
              vx: Math.cos(a) * speed,
              vy: Math.sin(a) * speed,
              damage: Math.round(stats.attack * (isFinisher && stateRef.current.heroClass === 'MAGE' ? 1.25 : 1)),
              radius: stateRef.current.heroClass === 'MAGE' ? (isFinisher ? 9 : 7) : 5,
              fromPlayer: true,
              life: cls.attackRange / speed,
              color: stateRef.current.heroClass === 'MAGE' ? hexColor(godLore.color) : COLORS.gold,
              style: stateRef.current.heroClass === 'ARCHER' ? 'arrow' : 'orb'
            });
          }
          return;
        }

        const isCrit = (stateRef.current.heroClass === 'ASSASSIN' && Math.random() < 0.32) || (stateRef.current.heroClass === 'GUERRIER' && isFinisher);
        const range = cls.attackRange + (stateRef.current.heroClass === 'GUERRIER' && isFinisher ? 14 : 0);
        const dmg = Math.round(stats.attack * (isCrit ? (stateRef.current.heroClass === 'ASSASSIN' ? 1.55 : 1.32) : 1));
        fx.spawnSlash(player.x, player.y, angle, range, isFinisher ? COLORS.gold : hexColor(cls.accentColor), 'arc');

        for (const enemy of enemies) {
          if (!enemy.alive) continue;
          const arch = ENEMY_ARCHETYPES[enemy.type];
          const dx = enemy.x - player.x;
          const dy = enemy.y - player.y;
          const dist = Math.hypot(dx, dy);
          if (dist > range + arch.radius) continue;
          const dirAngle = Math.atan2(dy, dx);
          const diff = Math.abs(Math.atan2(Math.sin(dirAngle - angle), Math.cos(dirAngle - angle)));
          if (dist < arch.radius + 26 || diff < 1.25) {
            damageEnemy(enemy, dmg, isCrit, 0.12);
          }
        }
      };

      const performSpecial = () => {
        if (specialCooldown > 0) return;
        const stats = getComputedStats(stateRef.current);
        specialCooldown = skill.cooldown;
        hero.pulseAttack();
        sound.playSpecial();
        cameraShake = Math.max(cameraShake, 5.5);
        const dmg = Math.round(stats.attack * skill.damageMultiplier);
        const color = hexColor(godLore.color);
        fx.spawnSlash(player.x, player.y, 0, skill.radius, color, stateRef.current.god === 'ZEUS' ? 'bolt' : 'ring');

        let hitCount = 0;
        for (const enemy of enemies) {
          if (!enemy.alive) continue;
          const arch = ENEMY_ARCHETYPES[enemy.type];
          const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
          if (dist <= skill.radius + arch.radius) {
            damageEnemy(enemy, dmg, true, stateRef.current.god === 'ZEUS' || stateRef.current.god === 'ATHENA' ? 1.1 : 0.35);
            hitCount++;
          }
        }

        if (skill.healRatio && (hitCount > 0 || stateRef.current.god === 'ATHENA')) {
          const heal = Math.round(stats.maxHp * skill.healRatio);
          stateRef.current.hp = Math.min(stats.maxHp, stateRef.current.hp + heal);
          if (settingsRef.current.showDamageNumbers) fx.spawnText(player.x, player.y - 30, `+${heal} PV`, 0x4ade80, 13);
          syncUi(false);
        }
      };

      const performDash = () => {
        if (dashCooldown > 0) return;
        dashCooldown = 2.2;
        dashTimer = 0.22;
        sound.playDash();
        iFrames = Math.max(iFrames, 0.35);
        dust.burst(player.x, player.y + 10);
      };

      const performPotion = (preferredId?: string) => {
        const stats = getComputedStats(stateRef.current);
        if (stateRef.current.hp >= stats.maxHp) return;
        const itemId = preferredId ?? (
          stateRef.current.inventory.some((s) => s.itemId === 'potion_ambroisie')
            ? 'potion_ambroisie'
            : 'nectar_divin'
        );
        const item = ITEMS[itemId];
        if (!item?.healAmount || !consumeItem(stateRef.current, itemId)) {
          showToast('Aucune potion disponible.');
          return;
        }
        const heal = Math.round(stats.maxHp * item.healAmount);
        stateRef.current.hp = Math.min(stats.maxHp, stateRef.current.hp + heal);
        sound.playHeal();
        if (settingsRef.current.showDamageNumbers) fx.spawnText(player.x, player.y - 26, `+${heal} PV`, 0x4ade80, 14);
        syncUi(true);
      };

      const findNearestInteraction = (): { kind: 'npc'; npcId: string; label: string } | { kind: 'obj'; sprite: InteractableSprite; label: string } | null => {
        let bestDist = 66;
        let bestNpc: string | null = null;
        for (const npc of npcs) {
          const d = Math.hypot(npc.x - player.x, npc.y - player.y);
          if (d < bestDist) {
            bestDist = d;
            bestNpc = npc.npcId;
          }
        }
        if (bestNpc) {
          const def = NPCS[bestNpc];
          return { kind: 'npc', npcId: bestNpc, label: `Parler à ${def.name}` };
        }

        for (const sprite of interactables) {
          const def = sprite.def;
          const isDone = def.kind === 'trial_stele'
            ? stateRef.current.activatedTrialSteles.includes(def.id)
            : stateRef.current.collectedInteractables.includes(def.id);
          if (isDone) continue;
          const d = Math.hypot(def.x - player.x, def.y - player.y);
          if (d <= def.radius + 16) {
            return { kind: 'obj', sprite, label: def.label };
          }
        }
        return null;
      };

      const performInteract = () => {
        const nearest = findNearestInteraction();
        if (!nearest) return;

        if (nearest.kind === 'npc') {
          setDialogue(resolveNpcDialogue(stateRef.current, nearest.npcId));
          return;
        }

        const def = nearest.sprite.def;
        if (def.kind === 'trial_stele') {
          if (!stateRef.current.activatedTrialSteles.includes(def.id)) {
            stateRef.current.activatedTrialSteles.push(def.id);
            sound.playQuest();
            cameraShake = Math.max(cameraShake, 4.5);
            fx.spawnSlash(def.x, def.y - 16, 0, 68, COLORS.gold, 'ring');
            const count = stateRef.current.activatedTrialSteles.length;
            const ready = recordQuestEvent(stateRef.current, 'interact', def.targetId);
            if (count >= 3) {
              for (const enemy of enemies) {
                if (enemy.type === 'sentinelle_poseidon') {
                  enemy.shielded = false;
                  redrawEnemyHp(enemy);
                  fx.spawnSlash(enemy.x, enemy.y - 18, 0, 110, 0x7dd3fc, 'ring');
                }
              }
              showToast('Le bouclier divin de la Sentinelle est brisé !');
            } else {
              showToast(`Stèle activée (${count}/3)`);
            }
            if (ready.length > 0) showToast(`Objectif accompli : ${ready[0]}`);
            syncUi(true);
          }
          return;
        }

        if (def.questId && stateRef.current.quests[def.questId]?.status === 'available') {
          showToast("Parlez d'abord au donneur de quête dans la cité.");
          return;
        }

        if (!stateRef.current.collectedInteractables.includes(def.id)) {
          stateRef.current.collectedInteractables.push(def.id);
          if (def.kind === 'chest') {
            const goldLoot = stateRef.current.zoneId === 'marecages' ? 90 : stateRef.current.zoneId === 'labyrinthe' ? 75 : stateRef.current.zoneId === 'sanctuaire' ? 60 : 40;
            const bonusItem = stateRef.current.zoneId === 'labyrinthe' || stateRef.current.zoneId === 'marecages' ? 'nectar_divin' : 'potion_ambroisie';
            stateRef.current.gold += goldLoot;
            addItemToState(stateRef.current, bonusItem, 1);
            sound.playChest();
            fx.spawnSlash(def.x, def.y, 0, 56, COLORS.gold, 'ring');
            showToast(`Coffre ouvert : +${goldLoot} drachmes & ${ITEMS[bonusItem].name}`);
            syncUi(true);
            return;
          }
          sound.playQuest();
          if (def.kind === 'bronze') addItemToState(stateRef.current, 'fragment_bronze', 1);
          if (def.kind === 'herb') addItemToState(stateRef.current, 'herbe_ambroisie', 1);
          fx.spawnSlash(def.x, def.y, 0, 52, COLORS.gold, 'ring');
          const ready = recordQuestEvent(stateRef.current, 'interact', def.targetId);
          showToast(ready.length > 0 ? `Quête prête : ${ready[0]}` : `${def.label} récupéré`);
          syncUi(true);
        }
      };

      actionsRef.current = {
        attack: performAttack,
        special: performSpecial,
        dash: performDash,
        potion: performPotion,
        interact: performInteract,
        refreshNpcBadges,
        travelToZone: (targetZone: ZoneId) => {
          if (stateRef.current.zoneId !== targetZone) {
            const dest = ZONES[targetZone];
            loadZone(targetZone, dest.defaultSpawn.x, dest.defaultSpawn.y);
            showToast(`Voyage rapide : ${dest.name}`);
          }
        }
      };

      const onPointerDown = (e: PointerEvent) => {
        if (pausedRef.current || e.target !== app?.canvas) return;
        if (e.button === 2) {
          performSpecial();
          return;
        }
        if (e.button === 0 && lastView) {
          const rect = app.canvas.getBoundingClientRect();
          const worldX = (e.clientX - rect.left) / lastView.zoom + lastView.x;
          const worldY = (e.clientY - rect.top) / lastView.zoom + lastView.y;
          const angle = Math.atan2(worldY - player.y, worldX - player.x);
          performAttack(angle);
        }
      };
      const onContextMenu = (e: MouseEvent) => e.preventDefault();
      app.canvas.addEventListener('pointerdown', onPointerDown);
      app.canvas.addEventListener('contextmenu', onContextMenu);

      loadZone(stateRef.current.zoneId);

      const syncOthers = (mode: ViewMode, time: number) => {
        const myId = connection.getPlayerId();
        const showRemotes = stateRef.current.zoneId === 'agora';
        for (const [id, state] of connection.players) {
          if (id === myId) continue;
          let other = others.get(id);
          if (!other) {
            const lore = GODS_LORE[state.god];
            other = createHero(state.username, hexColor(lore.color), false);
            playerLayer.addChild(other.container);
            others.set(id, other);
          }
          other.container.visible = showRemotes;
          if (!showRemotes) continue;
          const c = other.container;
          const dx = state.position.x - c.x;
          const dy = state.position.y - c.y;
          other.setView(mode);
          other.face(dx);
          other.animate(Math.abs(dx) + Math.abs(dy) > 1, mode === 'side-view' && Math.abs(dy) > 1, time);
          c.position.set(c.x + (state.position.x - c.x) * 0.45, c.y + (state.position.y - c.y) * 0.45);
        }
        for (const [id, other] of others) {
          if (!connection.players.has(id)) {
            other.container.destroy({ children: true });
            others.delete(id);
          }
        }
        stackLabels([hero, ...others.values()]);
      };

      let inputTimer = 0;
      let hudSyncTimer = 0;

      app.ticker.add((ticker) => {
        if (pausedRef.current) return;

        const dt = Math.min(ticker.deltaMS / 1000, 0.05);
        const time = performance.now() / 1000;
        const zone = currentZone();
        const mode = zone.viewMode;
        const stats = getComputedStats(stateRef.current);

        attackCooldown = Math.max(0, attackCooldown - dt);
        specialCooldown = Math.max(0, specialCooldown - dt);
        dashCooldown = Math.max(0, dashCooldown - dt);
        dashTimer = Math.max(0, dashTimer - dt);
        hasteTimer = Math.max(0, hasteTimer - dt);
        cameraShake = Math.max(0, cameraShake - dt * 18);
        portalLockTimer = Math.max(0, portalLockTimer - dt);
        if (iFrames > 0) {
          iFrames = Math.max(0, iFrames - dt);
          if (iFrames === 0) hero.setHitFlash(false);
        }

        // 1. Envoi des entrees reseau
        inputTimer += ticker.deltaMS;
        if (inputTimer >= INPUT_INTERVAL_MS) {
          inputTimer %= INPUT_INTERVAL_MS;
          connection.sendInput({
            up: keyboard.isUp(),
            down: keyboard.isDown(),
            left: keyboard.isLeft(),
            right: keyboard.isRight(),
            jump: keyboard.isJump()
          });
        }

        // 2. Actions joueur
        if (keyboard.consumeInteract()) performInteract();
        if (keyboard.consumeAttack()) performAttack();
        if (keyboard.consumeSpecial()) performSpecial();
        if (keyboard.consumeDash()) performDash();
        if (keyboard.consumePotion()) performPotion();

        // 3. Deplacement et physique de zone
        const jump = keyboard.isJump();
        const jumpStarted = jump && !previousJump;
        const wasGrounded = player.isGrounded;
        const speedMult = stats.speedMultiplier * (dashTimer > 0 ? 2.4 : 1) * (hasteTimer > 0 ? 1.28 : 1);

        stepZoneMovement(player, {
          up: keyboard.isUp(),
          down: keyboard.isDown(),
          left: keyboard.isLeft(),
          right: keyboard.isRight(),
          jumpStarted
        }, zone, dt, speedMult);

        if (mode === 'top-down' && jumpStarted) performAttack();
        if (mode === 'side-view' && ((jumpStarted && wasGrounded) || (!wasGrounded && player.isGrounded))) {
          dust.burst(player.x, player.y + 16);
        }
        previousJump = jump;

        if (Math.hypot(player.vx, player.vy) > 12) {
          if (mode === 'top-down') facingAngle = Math.atan2(player.vy, player.vx);
          if (Math.abs(player.vx) > 4) facingDir = Math.sign(player.vx);
        }

        // 4. Portails de changement de zone
        if (portalLockTimer <= 0) {
          const portal = zonePortalAt(player, zone);
          if (portal) {
            if (portal.requiredQuestCompleted && stateRef.current.quests[portal.requiredQuestCompleted]?.status !== 'completed') {
              showToast(portal.lockedHint ?? 'Passage verrouillé.');
              portalLockTimer = 1.6;
              player.x += portal.x < zone.width / 2 ? 48 : -48;
            } else {
              loadZone(portal.toZone, portal.spawnX, portal.spawnY);
              return;
            }
          }
        }

        // 5. IA ennemis diversifiee par archetype
        for (const enemy of enemies) {
          const arch = ENEMY_ARCHETYPES[enemy.type];
          if (!enemy.alive) {
            enemy.respawnTimer -= dt;
            if (enemy.respawnTimer <= 0) {
              enemy.alive = true;
              enemy.hp = enemy.maxHp;
              enemy.x = enemy.homeX;
              enemy.y = enemy.homeY;
              enemy.state = 'patrol';
              if (enemy.type === 'sentinelle_poseidon') {
                enemy.shielded = stateRef.current.activatedTrialSteles.length < 3;
              }
              redrawEnemyHp(enemy);
            }
            continue;
          }

          enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
          if (enemy.stunTimer > 0) {
            enemy.stunTimer = Math.max(0, enemy.stunTimer - dt);
            enemy.vx = 0;
            enemy.vy = 0;
            updateEnemyVisual(enemy, time, mode);
            continue;
          }

          const dx = player.x - enemy.x;
          const dy = player.y - enemy.y;
          const dist = Math.hypot(dx, dy);

          // Capacites speciales du boss Sentinelle de Poseidon
          if (enemy.type === 'sentinelle_poseidon' && dist < 580) {
            enemy.waveCooldown -= dt;
            if (enemy.waveCooldown <= 0) {
              enemy.waveCooldown = enemy.shielded ? 4.2 : 3.0;
              const waveDir = dx >= 0 ? 1 : -1;
              fx.spawnProjectile({
                x: enemy.x + waveDir * 24,
                y: 454,
                vx: waveDir * 245,
                vy: 0,
                damage: 18,
                radius: 18,
                fromPlayer: false,
                life: 3.4,
                color: COLORS.seaLight,
                style: 'wave',
                piercing: true
              });
            }
            enemy.skyCooldown -= dt;
            if (enemy.skyCooldown <= 0) {
              enemy.skyCooldown = enemy.shielded ? 5.6 : 4.2;
              fx.spawnHazard(player.x, player.y, 44, 1.05, 20, COLORS.seaLight);
            }
          }

          if (enemy.state === 'dashing') {
            enemy.x += enemy.dashVx * dt;
            enemy.y += enemy.dashVy * dt;
            enemy.stateTimer -= dt;
            dust.trail(enemy.x, enemy.y + 8);
            if (!enemy.dashHitDone && Math.hypot(player.x - enemy.x, player.y - enemy.y) <= arch.radius + 18) {
              enemy.dashHitDone = true;
              damagePlayer(arch.attack, enemy.x);
            }
            if (enemy.stateTimer <= 0) {
              enemy.state = 'cooldown';
              enemy.stateTimer = arch.attackCooldown;
            }
          } else if (enemy.state === 'windup') {
            enemy.vx = 0;
            enemy.vy = 0;
            enemy.stateTimer -= dt;
            if (enemy.stateTimer <= 0) {
              const a = enemy.aimAngle;
              if (arch.attackStyle === 'lunge') {
                enemy.state = 'dashing';
                enemy.stateTimer = 0.28;
                enemy.dashVx = Math.cos(a) * 320;
                enemy.dashVy = Math.sin(a) * 320;
                enemy.dashHitDone = false;
                dust.burst(enemy.x, enemy.y + 8);
              } else if (arch.attackStyle === 'charge') {
                enemy.state = 'dashing';
                enemy.stateTimer = 0.46;
                enemy.dashVx = Math.cos(a) * 410;
                enemy.dashVy = Math.sin(a) * 410;
                enemy.dashHitDone = false;
                dust.burst(enemy.x, enemy.y + 10);
              } else if (arch.attackStyle === 'ranged_fan') {
                for (const offset of [-0.26, 0, 0.26]) {
                  fx.spawnProjectile({
                    x: enemy.x,
                    y: enemy.y,
                    vx: Math.cos(a + offset) * 265,
                    vy: Math.sin(a + offset) * 265,
                    damage: arch.attack,
                    radius: 7,
                    fromPlayer: false,
                    life: 1.4,
                    color: COLORS.sky,
                    style: 'feather'
                  });
                }
                enemy.state = 'cooldown';
                enemy.stateTimer = arch.attackCooldown;
              } else if (arch.attackStyle === 'fire_slam') {
                if (dist <= 86) {
                  fx.spawnSlash(enemy.x, enemy.y, 0, 88, 0xf97316, 'ring');
                  damagePlayer(arch.attack, enemy.x);
                } else {
                  fx.spawnProjectile({
                    x: enemy.x,
                    y: enemy.y,
                    vx: Math.cos(a) * 250,
                    vy: Math.sin(a) * 250,
                    damage: arch.attack - 2,
                    radius: 9,
                    fromPlayer: false,
                    life: 1.5,
                    color: 0xf97316,
                    style: 'fireball'
                  });
                }
                enemy.state = 'cooldown';
                enemy.stateTimer = arch.attackCooldown;
              } else if (arch.attackStyle === 'boss_burst') {
                enemy.patternStep = (enemy.patternStep + 1) % 2;
                if (enemy.patternStep === 0) {
                  for (let k = 0; k < 6; k++) {
                    const ra = a + (k / 6) * Math.PI * 2;
                    fx.spawnProjectile({
                      x: enemy.x,
                      y: enemy.y,
                      vx: Math.cos(ra) * 225,
                      vy: Math.sin(ra) * 225,
                      damage: 18,
                      radius: 9,
                      fromPlayer: false,
                      life: 1.6,
                      color: 0xf97316,
                      style: 'fireball'
                    });
                  }
                } else {
                  fx.spawnSlash(enemy.x, enemy.y, 0, 112, 0xf97316, 'ring');
                  if (dist <= 116) damagePlayer(arch.attack, enemy.x);
                }
                enemy.state = 'cooldown';
                enemy.stateTimer = arch.attackCooldown;
              } else if (arch.attackStyle === 'minotaur') {
                const step = enemy.patternStep;
                enemy.patternStep = (enemy.patternStep + 1) % 3;
                if (step === 0) {
                  enemy.state = 'dashing';
                  enemy.stateTimer = 0.48;
                  enemy.dashVx = Math.cos(a) * 425;
                  enemy.dashVy = Math.sin(a) * 425;
                  enemy.dashHitDone = false;
                  dust.burst(enemy.x, enemy.y + 10);
                } else if (step === 1) {
                  fx.spawnSlash(enemy.x, enemy.y, 0, 120, COLORS.gold, 'ring');
                  cameraShake = Math.max(cameraShake, 6);
                  if (dist <= 122) damagePlayer(arch.attack, enemy.x);
                  enemy.state = 'cooldown';
                  enemy.stateTimer = arch.attackCooldown;
                } else {
                  for (const [ox, oy] of [[0, 0], [72, -35], [-72, 35]]) {
                    fx.spawnHazard(player.x + ox, player.y + oy, 42, 0.95, 22, 0xf97316);
                  }
                  enemy.state = 'cooldown';
                  enemy.stateTimer = arch.attackCooldown;
                }
              } else if (arch.attackStyle === 'venom_spit') {
                fx.spawnProjectile({
                  x: enemy.x,
                  y: enemy.y - 6,
                  vx: Math.cos(a) * 285,
                  vy: Math.sin(a) * 285,
                  damage: arch.attack,
                  radius: 6,
                  fromPlayer: false,
                  life: 1.4,
                  color: 0x4ade80,
                  style: 'venom'
                });
                fx.spawnHazard(player.x, player.y, 32, 0.95, Math.round(arch.attack * 0.75), 0x4ade80);
                enemy.state = 'cooldown';
                enemy.stateTimer = arch.attackCooldown;
              } else if (arch.attackStyle === 'hydra') {
                const step = enemy.patternStep;
                enemy.patternStep = (enemy.patternStep + 1) % 3;
                if (step === 0) {
                  for (const offset of [-0.42, -0.21, 0, 0.21, 0.42]) {
                    const ang = a + offset;
                    fx.spawnProjectile({
                      x: enemy.x,
                      y: enemy.y - 10,
                      vx: Math.cos(ang) * 295,
                      vy: Math.sin(ang) * 295,
                      damage: Math.round(arch.attack * 0.8),
                      radius: 6.5,
                      fromPlayer: false,
                      life: 1.5,
                      color: 0x4ade80,
                      style: 'venom'
                    });
                  }
                } else if (step === 1) {
                  for (const offset of [-0.35, 0, 0.35]) {
                    fx.spawnSlash(enemy.x, enemy.y - 4, a + offset, 118, 0x4ade80, 'arc');
                  }
                  cameraShake = Math.max(cameraShake, 6);
                  if (dist <= 122) damagePlayer(arch.attack, enemy.x);
                } else {
                  for (const [ox, oy] of [[0, 0], [82, -40], [-82, -40], [0, 78]]) {
                    fx.spawnHazard(player.x + ox, player.y + oy, 44, 1.0, 24, 0x4ade80);
                  }
                }
                enemy.state = 'cooldown';
                enemy.stateTimer = arch.attackCooldown;
              } else {
                // poseidon coup de trident rapproche
                fx.spawnSlash(enemy.x, enemy.y - 10, a, 76, COLORS.seaLight, 'arc');
                if (dist <= 84) damagePlayer(arch.attack, enemy.x);
                enemy.state = 'cooldown';
                enemy.stateTimer = arch.attackCooldown;
              }
            }
          } else if (enemy.state === 'cooldown') {
            enemy.vx *= 0.85;
            enemy.vy *= 0.85;
            enemy.stateTimer -= dt;
            if (enemy.stateTimer <= 0) enemy.state = 'chase';
          } else if (dist <= arch.aggroRange) {
            if (dist <= arch.attackRange) {
              enemy.state = 'windup';
              enemy.stateTimer = arch.windupDuration;
              enemy.aimAngle = Math.atan2(dy, dx);
            } else {
              enemy.state = 'chase';
              if (mode === 'side-view' && !arch.flying) {
                enemy.vx = Math.sign(dx) * arch.speed;
                enemy.vy = 0;
              } else {
                enemy.vx = (dx / (dist || 1)) * arch.speed;
                enemy.vy = (dy / (dist || 1)) * arch.speed;
              }
              enemy.x += enemy.vx * dt;
              enemy.y += enemy.vy * dt;
            }
          } else {
            enemy.state = 'patrol';
            enemy.patrolAngle += dt * 0.8;
            const targetX = enemy.homeX + Math.cos(enemy.patrolAngle) * enemy.patrolRadius;
            const targetY = mode === 'side-view' && !arch.flying
              ? enemy.homeY
              : enemy.homeY + Math.sin(enemy.patrolAngle) * (enemy.patrolRadius * 0.6);
            enemy.vx = (targetX - enemy.x) * 1.1;
            enemy.vy = (targetY - enemy.y) * 1.1;
            enemy.x += enemy.vx * dt;
            enemy.y += enemy.vy * dt;
          }

          enemy.x = Math.min(Math.max(enemy.x, 40), zone.width - 40);
          if (mode === 'top-down') {
            enemy.y = Math.min(Math.max(enemy.y, 40), zone.height - 40);
          }

          updateEnemyVisual(enemy, time, mode);
        }

        // 6. Zones de danger telegraphees (foudre/eau du boss)
        for (let i = fx.hazards.length - 1; i >= 0; i--) {
          const h = fx.hazards[i];
          h.delay -= dt;
          if (h.delay <= 0) {
            fx.spawnSlash(h.x, h.y, 0, h.radius, h.color, 'bolt');
            if (Math.hypot(player.x - h.x, player.y - h.y) <= h.radius + 14) {
              damagePlayer(h.damage, h.x);
            }
            fx.hazards.splice(i, 1);
          }
        }

        // 7. Projectiles
        for (let i = fx.projectiles.length - 1; i >= 0; i--) {
          const p = fx.projectiles[i];
          p.life -= dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.life <= 0 || p.x < 0 || p.x > zone.width || p.y < 0 || p.y > zone.height) {
            fx.projectiles.splice(i, 1);
            continue;
          }

          if (p.fromPlayer) {
            let hit = false;
            for (const enemy of enemies) {
              if (!enemy.alive || p.hitIds.has(enemy.spawnId)) continue;
              const arch = ENEMY_ARCHETYPES[enemy.type];
              if (Math.hypot(enemy.x - p.x, enemy.y - p.y) <= arch.radius + p.radius) {
                p.hitIds.add(enemy.spawnId);
                damageEnemy(enemy, p.damage);
                if (p.style === 'orb') {
                  fx.spawnSlash(p.x, p.y, 0, 44, p.color, 'ring');
                  for (const splash of enemies) {
                    if (!splash.alive || splash.spawnId === enemy.spawnId) continue;
                    if (Math.hypot(splash.x - p.x, splash.y - p.y) <= 46 + ENEMY_ARCHETYPES[splash.type].radius) {
                      damageEnemy(splash, Math.round(p.damage * 0.45));
                    }
                  }
                }
                hit = true;
                if (!p.piercing) break;
              }
            }
            if (hit && !p.piercing) fx.projectiles.splice(i, 1);
          } else {
            if (Math.hypot(player.x - p.x, player.y - p.y) <= 16 + p.radius) {
              damagePlayer(p.damage, p.x);
              if (!p.piercing) fx.projectiles.splice(i, 1);
            }
          }
        }

        // 8. PNJ & Objets
        for (const npc of npcs) {
          const near = Math.hypot(npc.x - player.x, npc.y - player.y) < 66;
          npc.update(time, near);
        }
        for (const inter of interactables) {
          const done = inter.def.kind === 'trial_stele'
            ? stateRef.current.activatedTrialSteles.includes(inter.def.id)
            : stateRef.current.collectedInteractables.includes(inter.def.id);
          const near = Math.hypot(inter.def.x - player.x, inter.def.y - player.y) <= inter.def.radius + 16;
          inter.update(time, done, near);
        }

        // 9. Rendu heros, poussiere et effets
        const moving = Math.abs(player.vx) + Math.abs(player.vy) > 1;
        const airborne = mode === 'side-view' && !player.isGrounded;
        hero.setView(mode);
        hero.face(player.vx);
        hero.animate(moving, airborne, time);
        hero.container.position.set(player.x, player.y);
        syncOthers(mode, time);
        if (moving && !airborne) dust.trail(player.x, mode === 'top-down' ? player.y + 8 : player.y + 16);
        const pickedLoot = fx.collectNearbyLoot(player.x, player.y, 44);
        if (pickedLoot.length > 0) {
          for (const drop of pickedLoot) {
            const def = ITEMS[drop.itemId];
            if (!def) continue;
            addItemToState(stateRef.current, def.id, 1);
            fx.spawnText(player.x, player.y - 28, `+1 ${def.name}`, RARITY_HEX[def.rarity], def.rarity === 'legendaire' ? 14 : 11.5);
            if (def.rarity !== 'commun') {
              showToast(`Butin ${RARITY_LABEL[def.rarity]} : ${def.name}`);
            }
          }
          sound.playCoin();
          syncUi(true);
        }

        dust.update();
        fx.render(dt);

        // 10. Camera
        const target = viewAround(
          player.x,
          player.y,
          { width: zone.width, height: zone.height, solids: [], portals: [] },
          window.innerWidth,
          window.innerHeight,
          zone.cameraMargin
        );
        lastView = lastView
          ? { ...target, x: lastView.x + (target.x - lastView.x) * 0.12, y: lastView.y + (target.y - lastView.y) * 0.12 }
          : target;
        // Regen douce pres de la fontaine de Cassandre ou du brasero dans la cite
        if (zone.id === 'agora' && stateRef.current.hp < stats.maxHp) {
          const nearFountain = Math.hypot(player.x - 634, player.y - 984) < 110;
          const nearBrazier = Math.hypot(player.x - 1080, player.y - 660) < 105;
          if (nearFountain || nearBrazier) {
            regenTimer += dt;
            if (regenTimer >= 1) {
              regenTimer = 0;
              stateRef.current.hp = Math.min(stats.maxHp, stateRef.current.hp + 10);
              if (settingsRef.current.showDamageNumbers) fx.spawnText(player.x, player.y - 24, '+10 PV', 0x4ade80, 11);
              syncUi(false);
            }
          }
        }
        const shakenView: View = cameraShake > 0.2
          ? { ...lastView, x: lastView.x + (Math.random() - 0.5) * cameraShake, y: lastView.y + (Math.random() - 0.5) * cameraShake }
          : lastView;
        scene?.update(shakenView, time);
        placeLayer(actors, shakenView);

        // 11. Mise a jour HUD (uniquement si un boss de la zone est reellement proche/engage)
        hudSyncTimer += dt;
        if (hudSyncTimer >= 0.12) {
          hudSyncTimer = 0;
          setSpecialCd(specialCooldown > 0.05 ? specialCooldown : 0);
          setDashCd(dashCooldown > 0.05 ? dashCooldown : 0);

          const nearest = findNearestInteraction();
          setInteractPrompt(nearest ? nearest.label : null);

          const engageDist = zone.id === 'rivage' ? 680 : 460;
          const boss = enemies.find(
            (e) => e.alive && ENEMY_ARCHETYPES[e.type].isBoss && Math.hypot(e.x - player.x, e.y - player.y) < engageDist
          );
          if (boss) {
            setBossInfo({
              name: boss.name,
              hp: boss.hp,
              maxHp: boss.maxHp,
              shielded: boss.shielded,
              stelesActivated: stateRef.current.activatedTrialSteles.length,
              stelesTotal: 3
            });
          } else {
            setBossInfo(null);
          }

          const markers: MinimapMarker[] = [
            { x: player.x, y: player.y, kind: 'player', angle: mode === 'side-view' ? (facingDir >= 0 ? 0 : Math.PI) : facingAngle },
            ...zone.portals.map((p): MinimapMarker => ({ x: p.x + p.w / 2, y: p.y + p.h / 2, kind: 'portal' })),
            ...npcs.map((n): MinimapMarker => {
              const b = getNpcBadge(stateRef.current, n.npcId);
              return { x: n.x, y: n.y, kind: b && b !== 'active' ? 'npc_quest' : 'npc' };
            }),
            ...interactables
              .filter((inter) => !(inter.def.kind === 'trial_stele'
                ? stateRef.current.activatedTrialSteles.includes(inter.def.id)
                : stateRef.current.collectedInteractables.includes(inter.def.id)))
              .map((inter): MinimapMarker => ({ x: inter.def.x, y: inter.def.y, kind: 'interact' })),
            ...enemies
              .filter((e) => e.alive)
              .map((e): MinimapMarker => ({
                x: e.x,
                y: e.y,
                kind: ENEMY_ARCHETYPES[e.type].isBoss ? 'boss' : 'enemy'
              })),
            ...fx.lootDrops.map((d): MinimapMarker => ({ x: d.x, y: d.y, kind: 'loot' }))
          ];
          setMinimapMarkers(markers);
        }
      });
    };

    start().catch((err) => {
      console.error('Erreur initialisation PixiJS:', err);
      setLoadError(err instanceof Error ? err.message : String(err));
    });

    return () => {
      cleanedUp = true;
      saveGameState(stateRef.current);
      connection.close();
      keyboard.dispose();
      keyboardRef.current = null;
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
      try {
        app?.destroy(true, { children: true });
      } catch {
        // ignore
      }
    };
  }, [server.id, showToast, flashZoneBanner, syncUi]);

  const handleFinishPrologue = () => {
    stateRef.current.prologueSeen = true;
    saveGameState(stateRef.current);
    setShowPrologue(false);
  };

  const handleAcceptQuest = (questId: string) => {
    if (acceptQuest(stateRef.current, questId)) {
      sound.playQuest();
      syncUi(true);
      if (dialogue) setDialogue(resolveNpcDialogue(stateRef.current, dialogue.npcId));
      showToast('Quête acceptée');
    }
  };

  const handleCompleteQuest = (questId: string) => {
    const res = completeQuest(stateRef.current, questId);
    if (res.completed) {
      if (res.leveledUp) sound.playLevelUp();
      else sound.playQuest();
      syncUi(true);
      if (dialogue) setDialogue(resolveNpcDialogue(stateRef.current, dialogue.npcId));
      showToast(res.leveledUp ? `Niveau ${res.newLevel} ! ${res.rewardSummary}` : `Quête terminée • ${res.rewardSummary}`);
    }
  };

  const handleHeal = () => {
    const stats = getComputedStats(stateRef.current);
    stateRef.current.hp = stats.maxHp;
    sound.playHeal();
    syncUi(true);
    showToast('Points de vie restaurés');
  };

  const handleBuyItem = (itemId: string) => {
    const item = ITEMS[itemId];
    if (!item || stateRef.current.gold < item.price) return;
    if (!item.stackable && stateRef.current.inventory.some((s) => s.itemId === itemId)) return;
    stateRef.current.gold -= item.price;
    addItemToState(stateRef.current, itemId, 1);
    sound.playChest();
    syncUi(true);
    showToast(`${item.name} acquis`);
  };

  const handleSellItem = (itemId: string) => {
    const item = ITEMS[itemId];
    const payout = sellItem(stateRef.current, itemId);
    if (payout > 0 && item) {
      sound.playCoin();
      syncUi(true);
      showToast(`${item.name} vendu (+${payout} drachmes)`);
    }
  };

  const handleEquipItem = (itemId: string) => {
    if (equipItem(stateRef.current, itemId)) {
      sound.playQuest();
      syncUi(true);
      showToast(`${ITEMS[itemId]?.name ?? 'Objet'} équipé`);
    }
  };

  const activeZone = ZONES[uiState.zoneId];
  const stats = getComputedStats(uiState);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh', overflow: 'hidden', background: css(COLORS.sea), touchAction: 'none' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      <Hud
        server={server}
        god={GODS_LORE[uiState.god]}
        status={status}
        zone={activeZone}
        state={uiState}
        settings={settings}
        specialCooldown={specialCd}
        dashCooldown={dashCd}
        interactPrompt={modalOpen ? null : interactPrompt}
        toast={toast}
        zoneBanner={zoneBanner}
        bossInfo={bossInfo}
        minimapMarkers={minimapMarkers}
        loadError={loadError}
        compact={screen.compact}
        touch={screen.touch}
        onTriggerAttack={() => actionsRef.current?.attack()}
        onTriggerSpecial={() => actionsRef.current?.special()}
        onTriggerDash={() => actionsRef.current?.dash()}
        onTriggerPotion={() => actionsRef.current?.potion()}
        onTriggerInteract={() => actionsRef.current?.interact()}
        onOpenModal={(tab) => setModalTab(tab)}
        onOpenPause={() => setPauseOpen(true)}
        onOpenWorldMap={() => setWorldMapOpen(true)}
        onLeave={() => {
          saveGameState(stateRef.current);
          onLeave();
        }}
      />

      {screen.touch && !modalOpen && <TouchControls viewMode={activeZone.viewMode} />}

      {showPrologue && (
        <PrologueOverlay heroName={uiState.heroName} onFinish={handleFinishPrologue} />
      )}

      {pauseOpen && !showPrologue && (
        <PauseMenuModal
          settings={settings}
          bestiaryKills={uiState.bestiaryKills}
          onChangeSettings={handleSettingsChange}
          onSaveNow={() => {
            saveGameState(stateRef.current);
            showToast('Partie sauvegardée');
          }}
          onResume={() => setPauseOpen(false)}
          onQuitToLobby={() => {
            saveGameState(stateRef.current);
            onLeave();
          }}
        />
      )}

      {dialogue && !showPrologue && !pauseOpen && (
        <DialogueModal
          view={dialogue}
          gold={uiState.gold}
          hp={uiState.hp}
          maxHp={stats.maxHp}
          inventory={uiState.inventory}
          onAcceptQuest={handleAcceptQuest}
          onCompleteQuest={handleCompleteQuest}
          onHeal={handleHeal}
          onBuyItem={handleBuyItem}
          onSellItem={handleSellItem}
          onClose={() => setDialogue(null)}
        />
      )}

      {modalTab && !showPrologue && !pauseOpen && !worldMapOpen && (
        <InventoryModal
          state={uiState}
          initialTab={modalTab}
          onUseConsumable={(itemId) => actionsRef.current?.potion(itemId)}
          onEquipItem={handleEquipItem}
          onClose={() => setModalTab(null)}
        />
      )}

      {worldMapOpen && !showPrologue && !pauseOpen && (
        <WorldMapModal
          currentZone={uiState.zoneId}
          discoveredZones={uiState.discoveredZones ?? ['agora']}
          markers={minimapMarkers}
          mapKeyLabel={settings.keys.map.label}
          onFastTravel={(targetZone) => {
            setWorldMapOpen(false);
            actionsRef.current?.travelToZone(targetZone);
          }}
          onClose={() => setWorldMapOpen(false)}
        />
      )}
    </div>
  );
}
