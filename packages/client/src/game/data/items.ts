export type ItemCategory = 'arme' | 'armure' | 'consommable' | 'ressource' | 'artefact';
export type ItemRarity = 'commun' | 'rare' | 'epique' | 'legendaire';
export type EquipSlot = 'arme' | 'tete' | 'torse' | 'bouclier' | 'pieds' | 'anneau' | 'relique';

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  usageHint: string;
  category: ItemCategory;
  slot?: EquipSlot;
  rarity: ItemRarity;
  stackable: boolean;
  price: number;
  bonusHp?: number;
  bonusAttack?: number;
  bonusArmor?: number;
  healAmount?: number;
}

export const EQUIP_SLOT_LABELS: Record<EquipSlot, string> = {
  arme: 'Arme',
  tete: 'Tête',
  torse: 'Torse',
  bouclier: 'Main gauche',
  pieds: 'Pieds',
  anneau: 'Anneau',
  relique: 'Relique'
};

export const ITEMS: Record<string, ItemDef> = {
  epee_bronze: {
    id: 'epee_bronze',
    name: 'Épée de bronze',
    description: 'Arme courte des hoplites.',
    usageHint: 'Équipement (Arme) : augmente votre Attaque.',
    category: 'arme',
    slot: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 4
  },
  arc_olivier: {
    id: 'arc_olivier',
    name: "Arc en bois d'olivier",
    description: 'Arc souple taillé dans les bosquets sacrés.',
    usageHint: 'Équipement (Arme) : augmente votre Attaque.',
    category: 'arme',
    slot: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 4
  },
  baton_oracle: {
    id: 'baton_oracle',
    name: "Bâton de l'oracle",
    description: 'Canalise les braises et les sorts.',
    usageHint: 'Équipement (Arme) : augmente votre Attaque et vos sorts.',
    category: 'arme',
    slot: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 5
  },
  dagues_jumelles: {
    id: 'dagues_jumelles',
    name: 'Dagues jumelles',
    description: 'Lames courbes rapides et légères.',
    usageHint: 'Équipement (Arme) : augmente votre Attaque.',
    category: 'arme',
    slot: 'arme',
    rarity: 'commun',
    stackable: false,
    price: 50,
    bonusAttack: 5
  },
  sandales_cuir: {
    id: 'sandales_cuir',
    name: 'Sandales de cuir',
    description: 'Chaussures de marche renforcées des éclaireurs.',
    usageHint: 'Équipement (Pieds) : augmente vos PV et votre Armure.',
    category: 'armure',
    slot: 'pieds',
    rarity: 'commun',
    stackable: false,
    price: 48,
    bonusHp: 22,
    bonusArmor: 3
  },
  arme_airain: {
    id: 'arme_airain',
    name: "Arme forgée d'airain",
    description: 'Ouvrage renforcé par Damon, équilibré pour le combat.',
    usageHint: 'Équipement (Arme) : forte hausse d’Attaque.',
    category: 'arme',
    slot: 'arme',
    rarity: 'rare',
    stackable: false,
    price: 130,
    bonusAttack: 10
  },
  lance_centaure: {
    id: 'lance_centaure',
    name: 'Lance de centaure',
    description: 'Hampe longue taillée dans le frêne des montagnes.',
    usageHint: 'Équipement (Arme) : butin rare ou forgeable chez Damon.',
    category: 'arme',
    slot: 'arme',
    rarity: 'rare',
    stackable: false,
    price: 175,
    bonusAttack: 12
  },
  cuirasse_hoplite: {
    id: 'cuirasse_hoplite',
    name: "Cuirasse d'hoplite",
    description: 'Plastron en bronze battu résistant aux griffes et flèches.',
    usageHint: 'Équipement (Torse) : augmente PV, Armure et Attaque.',
    category: 'armure',
    slot: 'torse',
    rarity: 'rare',
    stackable: false,
    price: 160,
    bonusHp: 55,
    bonusAttack: 2,
    bonusArmor: 8
  },
  bouclier_hoplite: {
    id: 'bouclier_hoplite',
    name: "Bouclier d'hoplite",
    description: 'Bouclier rond en bronze renforcé par Damon.',
    usageHint: 'Équipement (Main gauche) : améliore survie et défense.',
    category: 'armure',
    slot: 'bouclier',
    rarity: 'rare',
    stackable: false,
    price: 120,
    bonusHp: 35,
    bonusAttack: 3,
    bonusArmor: 7
  },
  casque_corinthien: {
    id: 'casque_corinthien',
    name: 'Casque corinthien',
    description: 'Heaume de bronze à crête cramoisie.',
    usageHint: 'Équipement (Tête) : protège et renforce vos frappes.',
    category: 'armure',
    slot: 'tete',
    rarity: 'rare',
    stackable: false,
    price: 150,
    bonusHp: 42,
    bonusAttack: 4,
    bonusArmor: 6
  },
  lame_promethee: {
    id: 'lame_promethee',
    name: 'Arme trempée dans la Braise',
    description: 'Imprégnée du Cœur de Braise, fend le marbre divin.',
    usageHint: 'Équipement (Arme épique) : puissant bonus d’Attaque.',
    category: 'arme',
    slot: 'arme',
    rarity: 'epique',
    stackable: false,
    price: 300,
    bonusAttack: 15
  },
  arc_artemis: {
    id: 'arc_artemis',
    name: "Arc d'argent lunaire",
    description: 'Arme svelte dont la corde vibre comme un croissant de lune.',
    usageHint: 'Équipement (Arme épique) : butin rare ou forgeable.',
    category: 'arme',
    slot: 'arme',
    rarity: 'epique',
    stackable: false,
    price: 360,
    bonusAttack: 17
  },
  tunique_brumes: {
    id: 'tunique_brumes',
    name: 'Cuirasse des Brumes',
    description: 'Armure légère forgée dans les galeries crétoises.',
    usageHint: 'Équipement (Torse épique) : fort bonus de PV et d’Armure.',
    category: 'armure',
    slot: 'torse',
    rarity: 'epique',
    stackable: false,
    price: 340,
    bonusHp: 85,
    bonusAttack: 6,
    bonusArmor: 12
  },
  anneau_olympe: {
    id: 'anneau_olympe',
    name: "Anneau d'orichalque",
    description: 'Bague antique gravée de runes solaires.',
    usageHint: 'Équipement (Anneau) : renforce PV et Attaque.',
    category: 'artefact',
    slot: 'anneau',
    rarity: 'epique',
    stackable: false,
    price: 290,
    bonusHp: 40,
    bonusAttack: 7,
    bonusArmor: 4
  },
  labrys_minotaure: {
    id: 'labrys_minotaure',
    name: 'Labrys du Minotaure',
    description: 'Double hache légendaire arrachée au maître du Labyrinthe.',
    usageHint: 'Équipement (Arme légendaire) : dégâts colossaux.',
    category: 'arme',
    slot: 'arme',
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
    usageHint: 'Équipement (Torse légendaire) : défense ultime.',
    category: 'armure',
    slot: 'torse',
    rarity: 'legendaire',
    stackable: false,
    price: 720,
    bonusHp: 135,
    bonusAttack: 10,
    bonusArmor: 18
  },
  talisman_titans: {
    id: 'talisman_titans',
    name: 'Talisman des Titans',
    description: 'Relique rarissime forgée avant le règne de Zeus.',
    usageHint: 'Équipement (Relique légendaire) : puissant bonus global.',
    category: 'artefact',
    slot: 'relique',
    rarity: 'legendaire',
    stackable: false,
    price: 800,
    bonusHp: 90,
    bonusAttack: 14,
    bonusArmor: 8
  },
  potion_ambroisie: {
    id: 'potion_ambroisie',
    name: "Potion d'ambroisie",
    description: 'Rend 38% des PV maximum.',
    usageHint: 'Consommable [R] : soin rapide en combat. Brassable en Alchimie.',
    category: 'consommable',
    rarity: 'commun',
    stackable: true,
    price: 15,
    healAmount: 0.38
  },
  vin_chios: {
    id: 'vin_chios',
    name: 'Vin de Chios',
    description: 'Vin rouge miellé servi à la taverne.',
    usageHint: 'Boisson : rend 35% PV.',
    category: 'consommable',
    rarity: 'commun',
    stackable: true,
    price: 18,
    healAmount: 0.35
  },
  posca: {
    id: 'posca',
    name: 'Posca des Hoplites',
    description: 'Breuvage frais au vinaigre de vin et herbes.',
    usageHint: 'Boisson : rend 45% PV.',
    category: 'consommable',
    rarity: 'commun',
    stackable: true,
    price: 24,
    healAmount: 0.45
  },
  hydromel_olympe: {
    id: 'hydromel_olympe',
    name: "Hydromel d'Attique",
    description: 'Miel fermenté parfumé au thym des collines.',
    usageHint: 'Boisson : rend 60% PV.',
    category: 'consommable',
    rarity: 'rare',
    stackable: true,
    price: 36,
    healAmount: 0.6
  },
  kykeon: {
    id: 'kykeon',
    name: "Kykèon d'Éleusis",
    description: 'Boisson sacrée à l’orge, au miel et à la menthe.',
    usageHint: 'Boisson rare : rend 80% PV.',
    category: 'consommable',
    rarity: 'rare',
    stackable: true,
    price: 48,
    healAmount: 0.8
  },
  nectar_divin: {
    id: 'nectar_divin',
    name: 'Nectar divin',
    description: 'Restaure tous les PV.',
    usageHint: 'Consommable : soin complet. Brassable en Alchimie.',
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
    usageHint: 'Matériau de Forge : sert à forger Bouclier, Casque et Cuirasse.',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 12
  },
  herbe_ambroisie: {
    id: 'herbe_ambroisie',
    name: "Herbe d'ambroisie",
    description: 'Plante dorée poussant près des oliviers.',
    usageHint: 'Ingrédient d’Alchimie : sert à brasser Potions et Nectar.',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 10
  },
  corne_satyre: {
    id: 'corne_satyre',
    name: 'Corne de satyre',
    description: 'Trophée robuste pris aux satyres des plaines.',
    usageHint: 'Matériau de Forge : sert à forger Sandales, Casque et Lance (ou revente).',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 18
  },
  plume_harpie: {
    id: 'plume_harpie',
    name: 'Plume de harpie',
    description: 'Plume acérée aux reflets de tempête.',
    usageHint: 'Matériau de Forge & Alchimie : sert pour Nectar, Lance et Arc lunaire.',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 22
  },
  ossement_ancien: {
    id: 'ossement_ancien',
    name: 'Ossement gravé',
    description: 'Vestige runique des anciens gardes du Labyrinthe.',
    usageHint: 'Matériau de Forge : sert à forger la Cuirasse des Brumes.',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 26
  },
  ecaille_vipere: {
    id: 'ecaille_vipere',
    name: 'Écaille de Lerne',
    description: 'Écaille verdâtre imprégnée des brumes du marais.',
    usageHint: 'Matériau de Forge : sert à forger l’Égide d’Égée et des potions.',
    category: 'ressource',
    rarity: 'commun',
    stackable: true,
    price: 28
  },
  rouage_hephaistos: {
    id: 'rouage_hephaistos',
    name: "Rouage d'Héphaïstos",
    description: 'Mécanisme de bronze encore tiède.',
    usageHint: 'Matériau rare de Forge : sert pour Cuirasses et Anneau d’orichalque.',
    category: 'ressource',
    rarity: 'rare',
    stackable: true,
    price: 75
  },
  croc_hydre: {
    id: 'croc_hydre',
    name: "Croc d'Hydre",
    description: 'Croc venimeux capable de percer le bronze.',
    usageHint: 'Matériau rare de Forge : sert pour Anneau d’orichalque et Labrys.',
    category: 'ressource',
    rarity: 'rare',
    stackable: true,
    price: 95
  },
  eclat_foudre: {
    id: 'eclat_foudre',
    name: 'Éclat de foudre',
    description: 'Fragment cristallisé laissé par un éclair olympien.',
    usageHint: 'Matériau épique de Forge : sert pour les objets épiques et légendaires.',
    category: 'ressource',
    rarity: 'epique',
    stackable: true,
    price: 180
  },
  coeur_braise: {
    id: 'coeur_braise',
    name: 'Cœur de Braise',
    description: "Fragment incandescent arraché au Gardien d'Airain.",
    usageHint: 'Relique de quête : forgeable en arme ou équipable en Relique.',
    category: 'artefact',
    slot: 'relique',
    rarity: 'epique',
    stackable: false,
    price: 0,
    bonusAttack: 5,
    bonusHp: 25
  },
  coeur_airain: {
    id: 'coeur_airain',
    name: "Cœur d'Airain",
    description: 'Relique forgée des Titans arrachée au Minotaure des Brumes.',
    usageHint: 'Équipement (Relique légendaire) : puissant bonus PV et Attaque.',
    category: 'artefact',
    slot: 'relique',
    rarity: 'legendaire',
    stackable: false,
    price: 0,
    bonusHp: 75,
    bonusAttack: 12,
    bonusArmor: 6
  },
  vestige_egee: {
    id: 'vestige_egee',
    name: "Vestige d'Égée",
    description: 'Premier Vestige Primordial, pris à la Sentinelle de Poséidon.',
    usageHint: 'Équipement (Relique légendaire) : bonus PV, Attaque et Armure.',
    category: 'artefact',
    slot: 'relique',
    rarity: 'legendaire',
    stackable: false,
    price: 0,
    bonusHp: 55,
    bonusAttack: 8,
    bonusArmor: 6
  },
  venin_orque: {
    id: 'venin_orque',
    name: "Venin d'Orque",
    description: "Essence primordiale scellée par l'Hydre de Lerne.",
    usageHint: 'Équipement (Relique légendaire) : énorme bonus d’Attaque.',
    category: 'artefact',
    slot: 'relique',
    rarity: 'legendaire',
    stackable: false,
    price: 0,
    bonusHp: 60,
    bonusAttack: 15
  }
};

export const RARITY_COLOR: Record<ItemRarity, string> = {
  commun: '#cbd5e1',
  rare: '#38bdf8',
  epique: '#c084fc',
  legendaire: '#f59e0b'
};

export const RARITY_HEX: Record<ItemRarity, number> = {
  commun: 0xe8dcc3,
  rare: 0x38bdf8,
  epique: 0xc084fc,
  legendaire: 0xf59e0b
};

export const RARITY_LABEL: Record<ItemRarity, string> = {
  commun: 'Commun',
  rare: 'Rare',
  epique: 'Épique',
  legendaire: 'Légendaire'
};
