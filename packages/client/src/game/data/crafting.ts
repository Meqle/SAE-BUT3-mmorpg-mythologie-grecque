export interface CraftIngredient {
  itemId: string;
  quantity: number;
}

export interface CraftRecipe {
  id: string;
  station: 'forge' | 'alchimie';
  pocket?: boolean; // true = disponible partout dans le menu; sinon obligatoire a l'atelier du PNJ
  resultItemId: string;
  resultQuantity: number;
  goldCost: number;
  ingredients: CraftIngredient[];
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  // --- Recettes simples (accessibles partout) ---
  {
    id: 'craft_potion',
    station: 'alchimie',
    pocket: true,
    resultItemId: 'potion_ambroisie',
    resultQuantity: 2,
    goldCost: 10,
    ingredients: [{ itemId: 'herbe_ambroisie', quantity: 2 }]
  },
  {
    id: 'craft_sandales',
    station: 'forge',
    pocket: true,
    resultItemId: 'sandales_cuir',
    resultQuantity: 1,
    goldCost: 25,
    ingredients: [
      { itemId: 'corne_satyre', quantity: 2 },
      { itemId: 'plume_harpie', quantity: 1 }
    ]
  },

  // --- Recettes avancees d'Alchimie (Infirmerie de Cassandre uniquement) ---
  {
    id: 'craft_nectar',
    station: 'alchimie',
    resultItemId: 'nectar_divin',
    resultQuantity: 1,
    goldCost: 25,
    ingredients: [
      { itemId: 'herbe_ambroisie', quantity: 2 },
      { itemId: 'plume_harpie', quantity: 1 }
    ]
  },
  {
    id: 'craft_nectar_ecaille',
    station: 'alchimie',
    resultItemId: 'nectar_divin',
    resultQuantity: 2,
    goldCost: 35,
    ingredients: [
      { itemId: 'ecaille_vipere', quantity: 2 },
      { itemId: 'herbe_ambroisie', quantity: 1 }
    ]
  },

  // --- Recettes avancees de Forge (Atelier de Damon uniquement) ---
  {
    id: 'craft_bouclier',
    station: 'forge',
    resultItemId: 'bouclier_hoplite',
    resultQuantity: 1,
    goldCost: 55,
    ingredients: [{ itemId: 'fragment_bronze', quantity: 3 }]
  },
  {
    id: 'craft_casque',
    station: 'forge',
    resultItemId: 'casque_corinthien',
    resultQuantity: 1,
    goldCost: 70,
    ingredients: [
      { itemId: 'fragment_bronze', quantity: 2 },
      { itemId: 'corne_satyre', quantity: 2 }
    ]
  },
  {
    id: 'craft_cuirasse',
    station: 'forge',
    resultItemId: 'cuirasse_hoplite',
    resultQuantity: 1,
    goldCost: 90,
    ingredients: [
      { itemId: 'fragment_bronze', quantity: 3 },
      { itemId: 'rouage_hephaistos', quantity: 1 }
    ]
  },
  {
    id: 'craft_lance',
    station: 'forge',
    resultItemId: 'lance_centaure',
    resultQuantity: 1,
    goldCost: 95,
    ingredients: [
      { itemId: 'corne_satyre', quantity: 2 },
      { itemId: 'plume_harpie', quantity: 2 },
      { itemId: 'fragment_bronze', quantity: 2 }
    ]
  },
  {
    id: 'craft_tunique_brumes',
    station: 'forge',
    resultItemId: 'tunique_brumes',
    resultQuantity: 1,
    goldCost: 170,
    ingredients: [
      { itemId: 'ossement_ancien', quantity: 3 },
      { itemId: 'rouage_hephaistos', quantity: 2 },
      { itemId: 'eclat_foudre', quantity: 1 }
    ]
  },
  {
    id: 'craft_arc_artemis',
    station: 'forge',
    resultItemId: 'arc_artemis',
    resultQuantity: 1,
    goldCost: 185,
    ingredients: [
      { itemId: 'plume_harpie', quantity: 3 },
      { itemId: 'eclat_foudre', quantity: 2 }
    ]
  },
  {
    id: 'craft_anneau',
    station: 'forge',
    resultItemId: 'anneau_olympe',
    resultQuantity: 1,
    goldCost: 160,
    ingredients: [
      { itemId: 'rouage_hephaistos', quantity: 2 },
      { itemId: 'croc_hydre', quantity: 1 },
      { itemId: 'eclat_foudre', quantity: 1 }
    ]
  },
  {
    id: 'craft_egide',
    station: 'forge',
    resultItemId: 'egide_egee',
    resultQuantity: 1,
    goldCost: 340,
    ingredients: [
      { itemId: 'ecaille_vipere', quantity: 4 },
      { itemId: 'croc_hydre', quantity: 2 },
      { itemId: 'eclat_foudre', quantity: 2 }
    ]
  },
  {
    id: 'craft_labrys',
    station: 'forge',
    resultItemId: 'labrys_minotaure',
    resultQuantity: 1,
    goldCost: 360,
    ingredients: [
      { itemId: 'ossement_ancien', quantity: 4 },
      { itemId: 'croc_hydre', quantity: 2 },
      { itemId: 'eclat_foudre', quantity: 2 }
    ]
  }
];
