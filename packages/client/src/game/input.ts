import type { GameSettings } from './settings';

export interface Keyboard {
  isUp: () => boolean;
  isDown: () => boolean;
  isLeft: () => boolean;
  isRight: () => boolean;
  isJump: () => boolean;
  consumeAttack: () => boolean;
  consumeSpecial: () => boolean;
  consumeInteract: () => boolean;
  consumeDash: () => boolean;
  consumePotion: () => boolean;
  updateSettings: (settings: GameSettings) => void;
  setBlocked: (blocked: boolean) => void;
  dispose: () => void;
}

export const touch = {
  up: false,
  down: false,
  left: false,
  right: false,
  jump: false,
  attack: false,
  special: false,
  interact: false
};

export function createKeyboard(initialSettings: GameSettings): Keyboard {
  let settings = initialSettings;
  const pressed = new Set<string>();
  let blocked = false;
  let attackQueued = false;
  let specialQueued = false;
  let interactQueued = false;
  let dashQueued = false;
  let potionQueued = false;

  const matches = (code: string, action: keyof GameSettings['keys']) =>
    settings.keys[action].code === code ||
    (action === 'dash' && settings.keys.dash.code === 'ShiftLeft' && code === 'ShiftRight');

  const onKeyDown = (e: KeyboardEvent) => {
    if (blocked) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const isRepeat = pressed.has(e.code);
    pressed.add(e.code);
    if (!isRepeat) {
      if (matches(e.code, 'attack')) attackQueued = true;
      if (matches(e.code, 'special')) specialQueued = true;
      if (matches(e.code, 'interact')) interactQueued = true;
      if (matches(e.code, 'dash')) dashQueued = true;
      if (matches(e.code, 'potion')) potionQueued = true;
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    pressed.delete(e.code);
  };

  const releaseAll = () => {
    pressed.clear();
    touch.up = touch.down = touch.left = touch.right = touch.jump = false;
    touch.attack = touch.special = touch.interact = false;
  };

  const onVisibility = () => {
    if (document.hidden) releaseAll();
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', onVisibility);

  const isUp = () => !blocked && (pressed.has(settings.keys.up.code) || pressed.has('ArrowUp') || touch.up);
  const isDown = () => !blocked && (pressed.has(settings.keys.down.code) || pressed.has('ArrowDown') || touch.down);
  const isLeft = () => !blocked && (pressed.has(settings.keys.left.code) || pressed.has('ArrowLeft') || touch.left);
  const isRight = () => !blocked && (pressed.has(settings.keys.right.code) || pressed.has('ArrowRight') || touch.right);

  return {
    isUp,
    isDown,
    isLeft,
    isRight,
    isJump: () => !blocked && (pressed.has(settings.keys.jump.code) || touch.jump || isUp()),
    consumeAttack: () => {
      if (blocked) return false;
      const v = attackQueued || touch.attack;
      attackQueued = false;
      touch.attack = false;
      return v;
    },
    consumeSpecial: () => {
      if (blocked) return false;
      const v = specialQueued || touch.special;
      specialQueued = false;
      touch.special = false;
      return v;
    },
    consumeInteract: () => {
      if (blocked) return false;
      const v = interactQueued || touch.interact;
      interactQueued = false;
      touch.interact = false;
      return v;
    },
    consumeDash: () => {
      if (blocked) return false;
      const v = dashQueued;
      dashQueued = false;
      return v;
    },
    consumePotion: () => {
      if (blocked) return false;
      const v = potionQueued;
      potionQueued = false;
      return v;
    },
    updateSettings: (next) => {
      settings = next;
    },
    setBlocked: (b) => {
      blocked = b;
      if (b) releaseAll();
    },
    dispose: () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', releaseAll);
      document.removeEventListener('visibilitychange', onVisibility);
      releaseAll();
    }
  };
}
