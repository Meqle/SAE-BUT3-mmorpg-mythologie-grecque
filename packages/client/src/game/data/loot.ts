import { ITEMS, ItemRarity } from './items';
import type { EnemyType } from './zones';

export interface LootEntry {
  itemId: string;
  chance: number; // probabilite entre 0 et 1 (ex: 0.08 = 8%)
}

export interface LootDropResult {
  itemId: string;
  rarity: ItemRarity;
}

/**
 * Tables de butin par monstre.
 * Les probabilites restent volontairement faibles meme pour les objets communs,
 * et decroissent fortement selon la rarete (commun > rare > epique > legendaire).
 */
export const MONSTER_LOOT_TABLES: Record<EnemyType, LootEntry[]> = {
  satyre: [
    { itemId: 'corne_satyre', chance: 0.09 },
    { itemId: 'potion_ambroisie', chance: 0.07 },
    { itemId: 'sandales_cuir', chance: 0.05 },
    { itemId: 'bouclier_hoplite', chance: 0.022 }
  ],
  harpie: [
    { itemId: 'plume_harpie', chance: 0.09 },
    { itemId: 'potion_ambroisie', chance: 0.065 },
    { itemId: 'nectar_divin', chance: 0.025 },
    { itemId: 'eclat_foudre', chance: 0.005 }
  ],
  centaure: [
    { itemId: 'corne_satyre', chance: 0.1 },
    { itemId: 'lance_centaure', chance: 0.035 },
    { itemId: 'casque_corinthien', chance: 0.028 },
    { itemId: 'arc_artemis', chance: 0.005 },
    { itemId: 'talisman_titans', chance: 0.001 }
  ],
  automate: [
    { itemId: 'fragment_bronze', chance: 0.095 },
    { itemId: 'rouage_hephaistos', chance: 0.035 },
    { itemId: 'arme_airain', chance: 0.025 },
    { itemId: 'anneau_olympe', chance: 0.005 },
    { itemId: 'talisman_titans', chance: 0.001 }
  ],
  squelette: [
    { itemId: 'ossement_ancien', chance: 0.09 },
    { itemId: 'nectar_divin', chance: 0.032 },
    { itemId: 'cuirasse_hoplite', chance: 0.026 },
    { itemId: 'tunique_brumes', chance: 0.006 },
    { itemId: 'talisman_titans', chance: 0.0015 }
  ],
  serpent_lerne: [
    { itemId: 'ecaille_vipere', chance: 0.09 },
    { itemId: 'croc_hydre', chance: 0.032 },
    { itemId: 'nectar_divin', chance: 0.028 },
    { itemId: 'anneau_olympe', chance: 0.006 },
    { itemId: 'talisman_titans', chance: 0.0015 }
  ],
  gardien_airain: [
    { itemId: 'potion_ambroisie', chance: 0.16 },
    { itemId: 'rouage_hephaistos', chance: 0.085 },
    { itemId: 'cuirasse_hoplite', chance: 0.065 },
    { itemId: 'eclat_foudre', chance: 0.032 },
    { itemId: 'talisman_titans', chance: 0.005 }
  ],
  sentinelle_poseidon: [
    { itemId: 'potion_ambroisie', chance: 0.15 },
    { itemId: 'nectar_divin', chance: 0.09 },
    { itemId: 'casque_corinthien', chance: 0.075 },
    { itemId: 'arc_artemis', chance: 0.035 },
    { itemId: 'egide_egee', chance: 0.007 }
  ],
  minotaure: [
    { itemId: 'ossement_ancien', chance: 0.16 },
    { itemId: 'nectar_divin', chance: 0.09 },
    { itemId: 'tunique_brumes', chance: 0.038 },
    { itemId: 'labrys_minotaure', chance: 0.005 },
    { itemId: 'talisman_titans', chance: 0.005 }
  ],
  hydre_lerne: [
    { itemId: 'ecaille_vipere', chance: 0.16 },
    { itemId: 'croc_hydre', chance: 0.09 },
    { itemId: 'anneau_olympe', chance: 0.04 },
    { itemId: 'egide_egee', chance: 0.007 },
    { itemId: 'talisman_titans', chance: 0.006 }
  ]
};

export function rollMonsterLoot(enemyType: EnemyType): LootDropResult[] {
  const table = MONSTER_LOOT_TABLES[enemyType] ?? [];
  const drops: LootDropResult[] = [];
  for (const entry of table) {
    if (Math.random() < entry.chance) {
      const def = ITEMS[entry.itemId];
      if (!def) continue;
      drops.push({ itemId: entry.itemId, rarity: def.rarity });
      if (drops.length >= 2) break;
    }
  }
  return drops;
}

export function formatDropChance(chance: number): string {
  const pct = chance * 100;
  if (pct >= 1) {
    return (Number.isInteger(pct) ? pct.toFixed(0) : pct.toFixed(1).replace('.', ',')) + '%';
  }
  return pct.toFixed(2).replace(/0$/, '').replace('.', ',') + '%';
}
