import type { GodAffinity } from '@greek-myth/shared';
import { HERO_CLASSES, HeroClassId } from '../data/classes';
import { ITEMS } from '../data/items';
import { CODEX_ENTRIES, NPCS, QUEST_ORDER, QUESTS, QuestDef, QuestObjectiveType } from '../data/story';
import type { ZoneId } from '../data/zones';

export type QuestStatus = 'locked' | 'available' | 'active' | 'ready' | 'completed';

export interface QuestProgress {
  status: QuestStatus;
  counts: Record<string, number>;
}

export interface InventorySlot {
  itemId: string;
  quantity: number;
  equipped?: boolean;
}

export interface GameProgressState {
  heroName: string;
  heroClass: HeroClassId;
  god: GodAffinity;
  level: number;
  xp: number;
  hp: number;
  gold: number;
  zoneId: ZoneId;
  prologueSeen: boolean;
  inventory: InventorySlot[];
  quests: Record<string, QuestProgress>;
  collectedInteractables: string[];
  activatedTrialSteles: string[];
  unlockedCodex: string[];
  defeatedBosses: string[];
}

export interface ComputedHeroStats {
  maxHp: number;
  attack: number;
  speedMultiplier: number;
  xpToNext: number;
}

const SAVE_PREFIX = 'mythologia_save_v1_';

const saveKey = (heroName: string) =>
  SAVE_PREFIX + heroName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');

export function xpRequiredForLevel(level: number): number {
  return Math.round(100 * Math.pow(1.38, level - 1));
}

export function getComputedStats(state: GameProgressState): ComputedHeroStats {
  const cls = HERO_CLASSES[state.heroClass];
  let bonusHp = 0;
  let bonusAttack = 0;

  for (const slot of state.inventory) {
    if (!slot.equipped) continue;
    const item = ITEMS[slot.itemId];
    if (!item) continue;
    if (item.bonusHp) bonusHp += item.bonusHp;
    if (item.bonusAttack) bonusAttack += item.bonusAttack;
  }

  const godHp = state.god === 'POSEIDON' ? 25 : 0;
  const godAtk = state.god === 'ARES' ? 4 : state.god === 'HADES' ? 2 : 0;
  const godSpeed = state.god === 'ZEUS' ? 0.12 : 0;

  const maxHp = cls.baseHp + (state.level - 1) * 18 + bonusHp + godHp;
  const attack = cls.baseAttack + (state.level - 1) * 3 + bonusAttack + godAtk;
  const speedMultiplier = 1 + cls.speedBonus / 220 + godSpeed;

  return {
    maxHp,
    attack,
    speedMultiplier,
    xpToNext: xpRequiredForLevel(state.level)
  };
}

function buildInitialQuests(): Record<string, QuestProgress> {
  const quests: Record<string, QuestProgress> = {};
  for (const id of QUEST_ORDER) {
    const def = QUESTS[id];
    const counts: Record<string, number> = {};
    for (const obj of def.objectives) counts[obj.id] = 0;
    quests[id] = {
      status: def.prerequisiteQuestId ? 'locked' : 'available',
      counts
    };
  }
  return quests;
}

export function createNewGameState(
  heroName: string,
  heroClass: HeroClassId,
  god: GodAffinity
): GameProgressState {
  const cls = HERO_CLASSES[heroClass];
  const state: GameProgressState = {
    heroName,
    heroClass,
    god,
    level: 1,
    xp: 0,
    hp: cls.baseHp,
    gold: 25,
    zoneId: 'agora',
    prologueSeen: false,
    inventory: [
      { itemId: cls.starterWeaponId, quantity: 1, equipped: true },
      { itemId: 'potion_ambroisie', quantity: 3 }
    ],
    quests: buildInitialQuests(),
    collectedInteractables: [],
    activatedTrialSteles: [],
    unlockedCodex: CODEX_ENTRIES.filter((c) => c.unlockedByDefault).map((c) => c.id),
    defeatedBosses: []
  };
  state.hp = getComputedStats(state).maxHp;
  return state;
}

export function saveGameState(state: GameProgressState): void {
  try {
    localStorage.setItem(saveKey(state.heroName), JSON.stringify(state));
  } catch {
    // stockage local indisponible
  }
}

export function loadGameState(heroName: string): GameProgressState | null {
  try {
    const raw = localStorage.getItem(saveKey(heroName));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameProgressState;
    if (!parsed || !parsed.heroClass || !HERO_CLASSES[parsed.heroClass]) return null;
    const baseQuests = buildInitialQuests();
    for (const id of QUEST_ORDER) {
      if (!parsed.quests[id]) parsed.quests[id] = baseQuests[id];
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedGameState(heroName: string): void {
  try {
    localStorage.removeItem(saveKey(heroName));
  } catch {
    // ignore
  }
}

export function addItemToState(state: GameProgressState, itemId: string, quantity: number): void {
  const def = ITEMS[itemId];
  if (!def || quantity <= 0) return;

  if (def.stackable) {
    const existing = state.inventory.find((s) => s.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
      return;
    }
    state.inventory.push({ itemId, quantity });
    return;
  }

  const alreadyHas = state.inventory.some((s) => s.itemId === itemId);
  if (alreadyHas) return;

  const autoEquip = def.category === 'arme' || def.category === 'armure' || (def.category === 'artefact' && (def.bonusAttack || def.bonusHp));
  if (autoEquip && (def.category === 'arme' || def.category === 'armure')) {
    for (const slot of state.inventory) {
      const slotDef = ITEMS[slot.itemId];
      if (slotDef && slotDef.category === def.category) slot.equipped = false;
    }
  }
  state.inventory.push({ itemId, quantity: 1, equipped: Boolean(autoEquip) });
}

export function countItem(state: GameProgressState, itemId: string): number {
  return state.inventory.find((s) => s.itemId === itemId)?.quantity ?? 0;
}

export function consumeItem(state: GameProgressState, itemId: string): boolean {
  const idx = state.inventory.findIndex((s) => s.itemId === itemId);
  if (idx === -1) return false;
  const slot = state.inventory[idx];
  if (slot.quantity > 1) {
    slot.quantity -= 1;
  } else {
    state.inventory.splice(idx, 1);
  }
  return true;
}

export function grantXp(state: GameProgressState, amount: number): { leveledUp: boolean; newLevel: number } {
  state.xp += amount;
  let leveledUp = false;
  while (state.xp >= xpRequiredForLevel(state.level)) {
    state.xp -= xpRequiredForLevel(state.level);
    state.level += 1;
    leveledUp = true;
  }
  if (leveledUp) {
    state.hp = getComputedStats(state).maxHp;
  }
  return { leveledUp, newLevel: state.level };
}

function syncQuestReadiness(state: GameProgressState, questId: string): boolean {
  const q = state.quests[questId];
  const def = QUESTS[questId];
  if (!q || !def || q.status !== 'active') return false;
  const allDone = def.objectives.every((obj) => (q.counts[obj.id] ?? 0) >= obj.required);
  if (allDone) {
    q.status = 'ready';
    return true;
  }
  return false;
}

export function acceptQuest(state: GameProgressState, questId: string): boolean {
  const q = state.quests[questId];
  const def = QUESTS[questId];
  if (!q || !def || q.status !== 'available') return false;
  q.status = 'active';

  for (const obj of def.objectives) {
    if (obj.type === 'enter_zone' && state.zoneId === obj.targetId) {
      q.counts[obj.id] = obj.required;
    }
    if (obj.type === 'interact' && obj.targetId === 'stele_rivage') {
      q.counts[obj.id] = Math.min(obj.required, state.activatedTrialSteles.length);
    }
    if (obj.type === 'kill' && state.defeatedBosses.includes(obj.targetId)) {
      q.counts[obj.id] = obj.required;
    }
  }
  syncQuestReadiness(state, questId);
  return true;
}

export function recordQuestEvent(
  state: GameProgressState,
  type: QuestObjectiveType,
  targetId: string
): string[] {
  const newlyReadyTitles: string[] = [];
  for (const id of QUEST_ORDER) {
    const q = state.quests[id];
    const def = QUESTS[id];
    if (!q || !def || q.status !== 'active') continue;
    let changed = false;
    for (const obj of def.objectives) {
      if (obj.type === type && obj.targetId === targetId && (q.counts[obj.id] ?? 0) < obj.required) {
        q.counts[obj.id] = (q.counts[obj.id] ?? 0) + 1;
        changed = true;
      }
    }
    if (changed && syncQuestReadiness(state, id)) {
      newlyReadyTitles.push(def.title);
    }
  }
  return newlyReadyTitles;
}

export function completeQuest(
  state: GameProgressState,
  questId: string
): { completed: boolean; leveledUp: boolean; newLevel: number; rewardSummary: string } {
  const q = state.quests[questId];
  const def = QUESTS[questId];
  if (!q || !def || q.status !== 'ready') {
    return { completed: false, leveledUp: false, newLevel: state.level, rewardSummary: '' };
  }

  q.status = 'completed';
  state.gold += def.reward.gold;
  const parts: string[] = [`+${def.reward.xp} XP`, `+${def.reward.gold} drachmes`];

  if (def.reward.items) {
    for (const rewardItem of def.reward.items) {
      addItemToState(state, rewardItem.itemId, rewardItem.quantity);
      const itemDef = ITEMS[rewardItem.itemId];
      if (itemDef) {
        parts.push(rewardItem.quantity > 1 ? `${rewardItem.quantity}x ${itemDef.name}` : itemDef.name);
      }
    }
  }

  if (def.reward.unlocksCodex && !state.unlockedCodex.includes(def.reward.unlocksCodex)) {
    state.unlockedCodex.push(def.reward.unlocksCodex);
  }

  for (const nextId of QUEST_ORDER) {
    const nextDef = QUESTS[nextId];
    if (nextDef.prerequisiteQuestId === questId && state.quests[nextId].status === 'locked') {
      state.quests[nextId].status = 'available';
    }
  }

  const { leveledUp, newLevel } = grantXp(state, def.reward.xp);
  const stats = getComputedStats(state);
  if (state.hp > stats.maxHp) state.hp = stats.maxHp;

  return {
    completed: true,
    leveledUp,
    newLevel,
    rewardSummary: parts.join(' • ')
  };
}

export type NpcQuestBadge = 'turnin' | 'main_available' | 'side_available' | 'active' | null;

export function getNpcBadge(state: GameProgressState, npcId: string): NpcQuestBadge {
  for (const id of QUEST_ORDER) {
    const def = QUESTS[id];
    const q = state.quests[id];
    if (def.turnInNpcId === npcId && q.status === 'ready') return 'turnin';
  }
  for (const id of QUEST_ORDER) {
    const def = QUESTS[id];
    const q = state.quests[id];
    if (def.giverNpcId === npcId && q.status === 'available' && def.kind === 'main') return 'main_available';
  }
  for (const id of QUEST_ORDER) {
    const def = QUESTS[id];
    const q = state.quests[id];
    if (def.giverNpcId === npcId && q.status === 'available' && def.kind === 'side') return 'side_available';
  }
  for (const id of QUEST_ORDER) {
    const def = QUESTS[id];
    const q = state.quests[id];
    if ((def.giverNpcId === npcId || def.turnInNpcId === npcId) && q.status === 'active') return 'active';
  }
  return null;
}

export interface NpcDialogueView {
  npcId: string;
  npcName: string;
  npcRole: string;
  text: string;
  canHeal: boolean;
  sellsPotion: boolean;
  readyQuest?: QuestDef;
  availableQuest?: QuestDef;
  activeQuest?: QuestDef;
}

export function resolveNpcDialogue(state: GameProgressState, npcId: string): NpcDialogueView {
  const npc = NPCS[npcId];
  let readyQuest: QuestDef | undefined;
  let availableQuest: QuestDef | undefined;
  let activeQuest: QuestDef | undefined;

  for (const id of QUEST_ORDER) {
    const def = QUESTS[id];
    const q = state.quests[id];
    if (!readyQuest && def.turnInNpcId === npcId && q.status === 'ready') readyQuest = def;
    if (!availableQuest && def.giverNpcId === npcId && q.status === 'available') {
      availableQuest = def;
    }
    if (!activeQuest && (def.giverNpcId === npcId || def.turnInNpcId === npcId) && q.status === 'active') {
      activeQuest = def;
    }
  }

  let text = npc.idleDialogue;
  if (readyQuest) text = readyQuest.completeDialogue;
  else if (availableQuest) text = availableQuest.offerDialogue;
  else if (activeQuest) text = activeQuest.progressDialogue;

  return {
    npcId: npc.id,
    npcName: npc.name,
    npcRole: npc.role,
    text,
    canHeal: Boolean(npc.canHeal),
    sellsPotion: Boolean(npc.sellsPotion),
    readyQuest,
    availableQuest,
    activeQuest
  };
}
