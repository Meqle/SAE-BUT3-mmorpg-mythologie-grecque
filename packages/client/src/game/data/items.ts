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
  sandales_cuir: {
    id: 'sandales_cuir',
    name: 'Sandales de cuir',
    description: 'Chaussures de marche renforcées des éclaireurs.',
    category: 'armure',
    rarity: 'commun',
    stackable: false,
    price: 48,
    bonusHp: 22
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
  lance_centaure: {
    id: 'lance_centaure',
    name: 'Lance de centaure',
    description: 'Hampe longue taillée dans le frêne des montagnes.',
    category: 'arme',
    rarity: 'rare',
    stackable: false,
    price: 175,
    bonusAttack: 12
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
  casque_corinthien: {
    id: 'casque_corinthien',
    name: 'Casque corinthien',
    description: 'Heaume de bronze à crête cramoisie.',
    category: 'armure',
    rarity: 'rare',
    stackable: false,
    price: 150,
    bonusHp: 45,
    bonusAttack: 4
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
  arc_artemis: {
    id: 'arc_artemis',
    name: "Arc d'argent lunaire",
    description: 'Arme svelte dont la corde vibre comme un croissant de lune.',
    category: 'arme',
    rarity: 'epique',
    stackable: false,
    price: 360,
    bonusAttack: 17
  },
  tunique_brumes: {
    id: 'tunique_brumes',
    name: 'Cuirasse des Brumes',
    description: 'Armure légère forgée dans les galeries crétoises.',
    category: 'armure',
    rarity: 'epique',
    stackable: false,
    price: 340,
    bonusHp: 85,
    bonusAttack: 6
  },
  anneau_olympe: {
    id: 'anneau_olympe',
    name: "Anneau d'orichalque",
    description: 'Bague antique gravée de runes solaires.',
    category: 'artefact',
    rarity: 'epique',
    stackable: false,
    price: 290,
    bonusHp: 40,
    bonusAttack: 7
  },
  labrys_minotaure: {
    id: 'labrys_minotaure',
    name: 'Labrys du Minotaure',
    description: 'Double hache légendaire arrachée au maître du Labyrinthe.',
    category: 'arme',
    rarity: 'legendaire',
    stackable: false,
    price: 750,
    bonusHp: 30,
    bonusAttack: 24
  },
  egide_egee: {
    id: 'egide_egee',
    name: "Égide d'Égée",
    description: 'Armure bénie par les profondeurs marines.',
    category: 'armure',
    rarity: 'legendaire',
    stackable: false,
    price: 720,
    bonusHp: 135,
    bonusAttack: 10
  },
  talisman_titans: {
    id: 'talisman_titans',
    name: 'Talisman des Titans',
    description: 'Relique rarissime forgée avant le règne de Zeus.',
    category: 'artefact',
    rarity: 'legendaire',
    stackable: false,
    price: 800,
    bonusHp: 90,
    bonusAttack: 14
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
  corne_satyre: {
    id: 'corne_satyre',
    name: 'Corne de satyre',
    description: 'Trophée recherché par les marchands de la cité.',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 18
  },
  plume_harpie: {
    id: 'plume_harpie',
    name: 'Plume de harpie',
    description: 'Plume acérée aux reflets de tempête.',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 22
  },
  ossement_ancien: {
    id: 'ossement_ancien',
    name: 'Ossement gravé',
    description: 'Vestige runique des anciens gardes du Labyrinthe.',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 26
  },
  ecaille_vipere: {
    id: 'ecaille_vipere',
    name: 'Écaille de Lerne',
    description: 'Écaille verdâtre imprégnée des brumes du marais.',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 28
  },
  rouage_hephaistos: {
    id: 'rouage_hephaistos',
    name: "Rouage d'Héphaïstos",
    description: 'Mécanisme de bronze encore tiède.',
    category: 'ressource',
    rarity: 'rare',
    stackable: true,
    price: 75
  },
  croc_hydre: {
    id: 'croc_hydre',
    name: "Croc d'Hydre",
    description: 'Croc venimeux capable de percer le bronze.',
    category: 'ressource',
    rarity: 'rare',
    stackable: true,
    price: 95
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
  },
  venin_orque: {
    id: 'venin_orque',
    name: "Venin d'Orque",
    description: "Essence primordiale scellée par l'Hydre de Lerne.",
    category: 'artefact',
    rarity: 'legendaire',
    stackable: false,
    price: 0,
    bonusHp: 60,
    bonusAttack: 15
  }
};

export const RARITY_COLOR: Record<ItemRarity, string> = {
  commun: '#e8dcc3',
  rare: '#58a7cf',
  epique: '#c084fc',
  legendaire: '#e9c35a'
};

export const RARITY_HEX: Record<ItemRarity, number> = {
  commun: 0xe8dcc3,
  rare: 0x58a7cf,
  epique: 0xc084fc,
  legendaire: 0xe9c35a
};

export const RARITY_LABEL: Record<ItemRarity, string> = {
  commun: 'Commun',
  rare: 'Rare',
  epique: 'Épique',
  legendaire: 'Légendaire'
};
