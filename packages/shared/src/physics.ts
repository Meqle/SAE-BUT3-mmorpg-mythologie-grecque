// regles de deplacement et de collision
// vitesse, gravite et saut : memes valeurs que le serveur
import { GameMap, MAPS, Portal, Rect } from './map.js';
import type { ViewMode } from './types.js';

export const PLAYER_SPEED = 220;
export const GRAVITY = 900;
export const JUMP_VELOCITY = -480;
export const MAX_FALL_SPEED = 700; // evite de traverser une plateforme en tombant trop vite
export const PLAYER_HALF = 16; // le joueur est un carre de 32 px
export const MAX_NAME_LENGTH = 20;

export interface MoveInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  jumpStarted: boolean;
}

export interface MovingBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded?: boolean;
}

// le carre du joueur touche le rectangle ?
function overlaps(body: MovingBody, r: Rect): boolean {
  return (
    Math.abs(body.x - (r.x + r.w / 2)) < PLAYER_HALF + r.w / 2 &&
    Math.abs(body.y - (r.y + r.h / 2)) < PLAYER_HALF + r.h / 2
  );
}

// avance sur l'axe X puis recule si on est dans un obstacle ou hors de la carte
function moveX(body: MovingBody, map: GameMap, dt: number): void {
  body.x += body.vx * dt;
  for (const solid of map.solids) {
    if (!overlaps(body, solid)) continue;
    body.x = body.vx > 0 ? solid.x - PLAYER_HALF : solid.x + solid.w + PLAYER_HALF;
    body.vx = 0;
  }
  const clamped = Math.min(Math.max(body.x, PLAYER_HALF), map.width - PLAYER_HALF);
  if (clamped !== body.x) {
    body.x = clamped;
    body.vx = 0;
  }
}

// pareil sur l'axe Y (en tombant sur un obstacle, on est "au sol")
function moveY(body: MovingBody, map: GameMap, dt: number): void {
  body.y += body.vy * dt;
  for (const solid of map.solids) {
    if (!overlaps(body, solid)) continue;
    if (body.vy > 0) {
      body.y = solid.y - PLAYER_HALF;
      body.isGrounded = true;
    } else {
      body.y = solid.y + solid.h + PLAYER_HALF;
    }
    body.vy = 0;
  }
  const clamped = Math.min(Math.max(body.y, PLAYER_HALF), map.height - PLAYER_HALF);
  if (clamped !== body.y) {
    body.y = clamped;
    body.vy = 0;
  }
}

// avance un corps de dt secondes selon les touches et la vue
export function stepMovement(body: MovingBody, input: MoveInput, mode: ViewMode, dt: number): void {
  const map = MAPS[mode];
  const horizontal = Number(input.right) - Number(input.left);
  const vertical = Number(input.down) - Number(input.up);
  const acceleration = 1 - Math.pow(0.75, dt * 60);

  if (mode === 'top-down') {
    // diagonale normalisee pour ne pas aller plus vite
    const length = Math.hypot(horizontal, vertical) || 1;
    body.vx += ((horizontal / length) * PLAYER_SPEED - body.vx) * acceleration;
    body.vy += ((vertical / length) * PLAYER_SPEED - body.vy) * acceleration;
    body.isGrounded = true;
  } else {
    body.vx += (horizontal * PLAYER_SPEED - body.vx) * acceleration;
    body.vy = Math.min(body.vy + GRAVITY * dt, MAX_FALL_SPEED);
    body.isGrounded = false;
  }

  moveX(body, map, dt);
  moveY(body, map, dt);

  if (mode === 'side-view' && input.jumpStarted && body.isGrounded) {
    body.vy = JUMP_VELOCITY;
    body.isGrounded = false;
  }
}

// portail dans lequel se trouve le joueur (s'il y en a un)
export function portalAt(body: MovingBody, mode: ViewMode): Portal | undefined {
  return MAPS[mode].portals.find((portal) => overlaps(body, portal));
}
