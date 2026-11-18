// les 6 divinites jouables
import type { GodAffinity, RealmType } from './types.js';

export interface GodLore {
  id: GodAffinity;
  name: string;
  title: string;
  realm: RealmType;
  color: string;
  passiveBonus: string;
  description: string;
}

export const GODS_LORE: Record<GodAffinity, GodLore> = {
  ZEUS: {
    id: "ZEUS",
    name: "Zeus",
    title: "Roi de l'Olympe",
    realm: "olympus",
    color: "#facc15",
    passiveBonus: "+15% Vitesse",
    description: "Règne sur les cieux et les éclairs depuis le mont Olympe."
  },
  POSEIDON: {
    id: "POSEIDON",
    name: "Poséidon",
    title: "Souverain des Océans",
    realm: "olympus",
    color: "#38bdf8",
    passiveBonus: "+20% Résistance",
    description: "Dompte les flots et fait trembler la terre de son trident."
  },
  HADES: {
    id: "HADES",
    name: "Hadès",
    title: "Seigneur des Enfers",
    realm: "tartarus",
    color: "#a855f7",
    passiveBonus: "+10% Dégâts d'ombre",
    description: "Gouverne le royaume des morts et les profondeurs souterraines."
  },
  ATHENA: {
    id: "ATHENA",
    name: "Athéna",
    title: "Déesse de la Sagesse",
    realm: "elysium",
    color: "#2dd4bf",
    passiveBonus: "+15% Parade",
    description: "Protectrice des héros et stratège militaire sans égal."
  },
  ARES: {
    id: "ARES",
    name: "Arès",
    title: "Dieu de la Guerre",
    realm: "tartarus",
    color: "#ef4444",
    passiveBonus: "+25% Force brute",
    description: "Incarnation de la fureur guerrière et des champs de bataille."
  },
  APOLLO: {
    id: "APOLLO",
    name: "Apollon",
    title: "Dieu de la Lumière",
    realm: "elysium",
    color: "#fb923c",
    passiveBonus: "+15% Portée",
    description: "Guide les oracles et tire des flèches solaires à distance."
  }
};
