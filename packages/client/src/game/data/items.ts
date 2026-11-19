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
    description: 'Arme courte des hoplites.',
    category: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 4
  },
  arc_olivier: {
    id: 'arc_olivier',
    name: "Arc en bois d'olivier",
    description: 'Arc souple taillé dans les bosquets sacrés.',
    category: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 4
  },
  baton_oracle: {
    id: 'baton_oracle',
    name: "Bâton de l'oracle",
    description: 'Canalise les braises et les sorts.',
    category: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 5
  },
  dagues_jumelles: {
    id: 'dagues_jumelles',
    name: 'Dagues jumelles',
    description: 'Lames courbes rapides et légères.',
    category: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 5
  },
  arme_airain: {
    id: 'arme_airain',
    name: "Arme forgée d'airain",
    description: 'Ouvrage renforcé par Damon, équilibré pour le combat.',
    category: 'arme',
    rarity: 'rare',
    stackable: false,
    price: 130,
    bonusAttack: 10
  },
  cuirasse_hoplite: {
    id: 'cuirasse_hoplite',
    name: "Cuirasse d'hoplite",
    description: 'Plastron en bronze battu résistant aux griffes et flèches.',
    category: 'armure',
    rarity: 'rare',
    stackable: false,
    price: 160,
    bonusHp: 60,
    bonusAttack: 2
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
    description: 'Imprégnée du Cœur de Braise, fend le marbre divin.',
    category: 'arme',
    rarity: 'epique',
    stackable: false,
    price: 300,
    bonusAttack: 15
  },
  potion_ambroisie: {
    id: 'potion_ambroisie',
    name: "Potion d'ambroisie",
    description: 'Rend 45% des PV maximum.',
    category: 'consommable',
    rarity: 'commun',
    stackable: true,
    price: 15,
    healAmount: 0.45
  },
  nectar_divin: {
    id: 'nectar_divin',
    name: 'Nectar divin',
    description: 'Restaure tous les PV.',
    category: 'consommable',
    rarity: 'rare',
    stackable: true,
    price: 55,
    healAmount: 1
  },
  eclat_foudre: {
    id: 'eclat_foudre',
    name: 'Éclat de foudre',
    description: 'Fragment cristallisé laissé par un éclair olympien.',
    category: 'ressource',
    rarity: 'epique',
    stackable: true,
    price: 180
  },
  fragment_bronze: {
    id: 'fragment_bronze',
    name: 'Fragment de bronze',
    description: "Débris d'armes récupérés dans les ruines.",
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 12
  },
  herbe_ambroisie: {
    id: 'herbe_ambroisie',
    name: "Herbe d'ambroisie",
    description: 'Plante dorée poussant près des oliviers.',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 10
  },
  coeur_braise: {
    id: 'coeur_braise',
    name: 'Cœur de Braise',
    description: "Fragment incandescent arraché au Gardien d'Airain.",
    category: 'artefact',
    rarity: 'epique',
    stackable: false,
    price: 0
  },
  coeur_airain: {
    id: 'coeur_airain',
    name: "Cœur d'Airain",
    description: 'Relique forgée des Titans arrachée au Minotaure des Brumes.',
    category: 'artefact',
    rarity: 'legendaire',
    stackable: false,
    price: 0,
    bonusHp: 75,
    bonusAttack: 12
  },
  vestige_egee: {
    id: 'vestige_egee',
    name: "Vestige d'Égée",
    description: 'Premier Vestige Primordial, pris à la Sentinelle de Poséidon.',
    category: 'artefact',
    rarity: 'legendaire',
    stackable: false,
    price: 0,
    bonusHp: 55,
    bonusAttack: 8
  }
};

export const RARITY_COLOR: Record<ItemRarity, string> = {
  commun: '#e8dcc3',
  rare: '#58a7cf',
  epique: '#c084fc',
  legendaire: '#e9c35a'
};
