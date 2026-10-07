// decalage du monde pour que la camera suive le joueur sans sortir de la carte
// si la carte est plus petite que l'ecran, on la centre
export function cameraOffset(playerPos: number, mapSize: number, screenSize: number): number {
  if (mapSize <= screenSize) return (screenSize - mapSize) / 2;
  const follow = screenSize / 2 - playerPos;
  return Math.min(0, Math.max(screenSize - mapSize, follow));
}
