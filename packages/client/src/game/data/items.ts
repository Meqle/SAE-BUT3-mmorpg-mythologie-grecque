export type ItemCategory = 'arme' | 'armure' | 'consommable' | 'ressource' | 'artefact';
export type ItemRarity = 'commun' | 'rare' | 'epique' | 'legendaire';

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  stackable: boolean;
  price: number;
  bonusHp?: number;
  bonusAttack?: number;
  healAmount?: number;
}

export const ITEMS: Record<string, ItemDef> = {
  epee_bronze: {
    id: 'epee_bronze',
    name: 'Épée de bronze',
    description: 'Arme de base des hoplites.',
    category: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 4
  },
  arc_olivier: {
    id: 'arc_olivier',
    name: "Arc en bois d'olivier",
    description: 'Arc souple et léger taillé dans les bosquets sacrés.',
    category: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 4
  },
  baton_oracle: {
    id: 'baton_oracle',
    name: "Bâton de l'oracle",
    description: 'Canalise les sorts et l’Étincelle des mages.',
    category: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 5
  },
  dagues_jumelles: {
    id: 'dagues_jumelles',
    name: 'Dagues jumelles',
    description: 'Deux lames rapides forgées pour les embuscades.',
    category: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 5
  },
  bouclier_hoplite: {
    id: 'bouclier_hoplite',
    name: "Bouclier d'hoplite",
    description: 'Bouclier rond en bronze renforcé par Damon.',
    category: 'armure',
    rarity: 'rare',
    stackable: false,
    price: 120,
    bonusHp: 35,
    bonusAttack: 3
  },
  lame_promethee: {
    id: 'lame_promethee',
    name: 'Arme trempée dans la Braise',
    description: 'Arme imprégnée du Cœur de Braise, capable de fissurer le marbre divin.',
    category: 'arme',
    rarity: 'epique',
    stackable: false,
    price: 300,
    bonusAttack: 14
  },
  potion_ambroisie: {
    id: 'potion_ambroisie',
    name: "Potion d'ambroisie",
    description: 'Rend 45% de vos points de vie maximum.',
    category: 'consommable',
    rarity: 'commun',
    stackable: true,
    price: 15,
    healAmount: 0.45
  },
  nectar_divin: {
    id: 'nectar_divin',
    name: 'Nectar divin',
    description: 'Restaure intégralement vos points de vie.',
    category: 'consommable',
    rarity: 'rare',
    stackable: true,
    price: 60,
    healAmount: 1
  },
  eclat_foudre: {
    id: 'eclat_foudre',
    name: 'Éclat de foudre',
    description: "Fragment laissé par la colère de Zeus, utile à l'artisanat.",
    category: 'ressource',
    rarity: 'epique',
    stackable: true,
    price: 200
  },
  fragment_bronze: {
    id: 'fragment_bronze',
    name: 'Fragment de bronze',
    description: "Débris d'armes antiques récupérés dans les ruines.",
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 12
  },
  herbe_ambroisie: {
    id: 'herbe_ambroisie',
    name: "Herbe d'ambroisie",
    description: 'Plante dorée poussant près des oliviers frappés par le feu céleste.',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 10
  },
  coeur_braise: {
    id: 'coeur_braise',
    name: 'Cœur de Braise',
    description: 'Fragment incandescent arraché au Gardien d’Airain du Sanctuaire Brisé.',
    category: 'artefact',
    rarity: 'epique',
    stackable: false,
    price: 0
  },
  vestige_egee: {
    id: 'vestige_egee',
    name: "Vestige d'Égée",
    description: 'Premier Vestige Primordial des Titans, arraché à la Sentinelle de Poséidon.',
    category: 'artefact',
    rarity: 'legendaire',
    stackable: false,
    price: 0,
    bonusHp: 50,
    bonusAttack: 8
  }
};

export const RARITY_COLOR: Record<ItemRarity, string> = {
  commun: '#e8dcc3',
  rare: '#58a7cf',
  epique: '#c084fc',
  legendaire: '#e9c35a'
};
