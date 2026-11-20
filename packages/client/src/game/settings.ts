export type ActionKey =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'jump'
  | 'attack'
  | 'special'
  | 'dash'
  | 'interact'
  | 'potion'
  | 'inventory'
  | 'quests'
  | 'codex'
  | 'map';

export interface KeyBinding {
  code: string;
  label: string;
}

export interface GameSettings {
  keys: Record<ActionKey, KeyBinding>;
  showMinimap: boolean;
  showQuestTracker: boolean;
  showDamageNumbers: boolean;
  soundEnabled: boolean;
}

export const ACTION_LABELS: Record<ActionKey, string> = {
  up: 'Avancer / Haut',
  down: 'Reculer / Bas',
  left: 'Gauche',
  right: 'Droite',
  jump: 'Sauter (vue de profil)',
  attack: 'Attaque principale',
  special: 'Pouvoir divin',
  dash: 'Esquive',
  interact: 'Interagir / Parler',
  potion: 'Boire une potion',
  inventory: 'Inventaire',
  quests: 'Journal de quêtes',
  codex: 'Chroniques',
  map: 'Carte (zone & monde)'
};

export const ACTION_ORDER: ActionKey[] = [
  'up',
  'down',
  'left',
  'right',
  'jump',
  'attack',
  'special',
  'dash',
  'interact',
  'potion',
  'inventory',
  'quests',
  'codex',
  'map'
];

export const DEFAULT_SETTINGS: GameSettings = {
  keys: {
    up: { code: 'KeyW', label: 'Z' },
    down: { code: 'KeyS', label: 'S' },
    left: { code: 'KeyA', label: 'Q' },
    right: { code: 'KeyD', label: 'D' },
    jump: { code: 'Space', label: 'Espace' },
    attack: { code: 'Mouse0', label: 'Clic G' },
    special: { code: 'Mouse2', label: 'Clic D' },
    dash: { code: 'ShiftLeft', label: 'Maj' },
    interact: { code: 'KeyE', label: 'E' },
    potion: { code: 'KeyR', label: 'R' },
    inventory: { code: 'KeyI', label: 'I' },
    quests: { code: 'KeyL', label: 'L' },
    codex: { code: 'KeyC', label: 'C' },
    map: { code: 'KeyM', label: 'M' }
  },
  showMinimap: true,
  showQuestTracker: true,
  showDamageNumbers: true,
  soundEnabled: true
};

const STORAGE_KEY = 'mythologia_settings_v2';

export function formatKeyEvent(e: KeyboardEvent): KeyBinding {
  if (e.code === 'Space') return { code: 'Space', label: 'Espace' };
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') return { code: e.code, label: 'Maj' };
  if (e.code === 'ControlLeft' || e.code === 'ControlRight') return { code: e.code, label: 'Ctrl' };
  if (e.code === 'ArrowUp') return { code: 'ArrowUp', label: '↑' };
  if (e.code === 'ArrowDown') return { code: 'ArrowDown', label: '↓' };
  if (e.code === 'ArrowLeft') return { code: 'ArrowLeft', label: '←' };
  if (e.code === 'ArrowRight') return { code: 'ArrowRight', label: '→' };
  if (e.code === 'Tab') return { code: 'Tab', label: 'Tab' };
  const label = e.key.length === 1 ? e.key.toUpperCase() : e.code.replace(/^Key/, '');
  return { code: e.code, label };
}

export function formatMouseButton(button: number): KeyBinding {
  if (button === 0) return { code: 'Mouse0', label: 'Clic G' };
  if (button === 2) return { code: 'Mouse2', label: 'Clic D' };
  if (button === 1) return { code: 'Mouse1', label: 'Clic M' };
  return { code: `Mouse${button}`, label: `Souris ${button}` };
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return {
      keys: { ...DEFAULT_SETTINGS.keys, ...(parsed.keys ?? {}) },
      showMinimap: parsed.showMinimap ?? DEFAULT_SETTINGS.showMinimap,
      showQuestTracker: parsed.showQuestTracker ?? DEFAULT_SETTINGS.showQuestTracker,
      showDamageNumbers: parsed.showDamageNumbers ?? DEFAULT_SETTINGS.showDamageNumbers,
      soundEnabled: parsed.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled
    };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
