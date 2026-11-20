import type { GodAffinity } from '@greek-myth/shared';

export type HeroClassId = 'GUERRIER' | 'ARCHER' | 'MAGE' | 'ASSASSIN';

export interface HeroClassDef {
  id: HeroClassId;
  name: string;
  title: string;
  description: string;
  baseHp: number;
  baseAttack: number;
  speedBonus: number;
  attackRange: number;
  attackCooldown: number;
  isRanged: boolean;
  projectileSpeed: number;
  starterWeaponId: string;
  accentColor: string;
}

export const HERO_CLASSES: Record<HeroClassId, HeroClassDef> = {
  GUERRIER: {
    id: 'GUERRIER',
    name: 'Guerrier',
    title: 'Hoplite de la Phalange',
    description: 'Combattant au corps à corps, encaisse les coups en première ligne.',
    baseHp: 105,
    baseAttack: 14,
    speedBonus: 0,
    attackRange: 58,
    attackCooldown: 0.45,
    isRanged: false,
    projectileSpeed: 0,
    starterWeaponId: 'epee_bronze',
    accentColor: '#d29a4c'
  },
  ARCHER: {
    id: 'ARCHER',
    name: 'Archer',
    title: 'Chasseur d’Artémis',
    description: 'Attaque à distance avec précision, rapide et mobile.',
    baseHp: 100,
    baseAttack: 16,
    speedBonus: 18,
    attackRange: 280,
    attackCooldown: 0.42,
    isRanged: true,
    projectileSpeed: 520,
    starterWeaponId: 'arc_olivier',
    accentColor: '#7d8c4a'
  },
  MAGE: {
    id: 'MAGE',
    name: 'Mage',
    title: 'Porteur de l’Étincelle',
    description: 'Lance des sorts puissants à distance, mais reste fragile.',
    baseHp: 85,
    baseAttack: 20,
    speedBonus: 6,
    attackRange: 250,
    attackCooldown: 0.55,
    isRanged: true,
    projectileSpeed: 420,
    starterWeaponId: 'baton_oracle',
    accentColor: '#38bdf8'
  },
  ASSASSIN: {
    id: 'ASSASSIN',
    name: 'Assassin',
    title: 'Ombre des Ruines',
    description: 'Frappe vite et fort par surprise, esquive plutôt que d’encaisser.',
    baseHp: 74,
    baseAttack: 21,
    speedBonus: 26,
    attackRange: 46,
    attackCooldown: 0.28,
    isRanged: false,
    projectileSpeed: 0,
    starterWeaponId: 'dagues_jumelles',
    accentColor: '#b5523b'
  }
};

export const HERO_CLASS_LIST: HeroClassId[] = ['GUERRIER', 'ARCHER', 'MAGE', 'ASSASSIN'];

export interface DivineSkillDef {
  id: GodAffinity;
  skillName: string;
  description: string;
  cooldown: number;
  damageMultiplier: number;
  radius: number;
  healRatio?: number;
}

export const DIVINE_SKILLS: Record<GodAffinity, DivineSkillDef> = {
  ZEUS: {
    id: 'ZEUS',
    skillName: "Foudre de l'Olympe",
    description: 'Fait tomber un éclair massif autour de vous, étourdissant les bêtes.',
    cooldown: 6,
    damageMultiplier: 2.2,
    radius: 120
  },
  POSEIDON: {
    id: 'POSEIDON',
    skillName: 'Raz-de-marée',
    description: 'Onde aquatique qui repousse et blesse tous les ennemis proches.',
    cooldown: 6.5,
    damageMultiplier: 1.9,
    radius: 135
  },
  HADES: {
    id: 'HADES',
    skillName: 'Étreinte des ombres',
    description: 'Draine la vitalité des ennemis alentour pour restaurer vos PV.',
    cooldown: 7,
    damageMultiplier: 1.8,
    radius: 115,
    healRatio: 0.22
  },
  ATHENA: {
    id: 'ATHENA',
    skillName: 'Égide protectrice',
    description: 'Onde dorée qui brise la garde ennemie et restaure une part de vos PV.',
    cooldown: 7,
    damageMultiplier: 1.7,
    radius: 120,
    healRatio: 0.25
  },
  ARES: {
    id: 'ARES',
    skillName: 'Rage du champ de bataille',
    description: 'Frappe sismique dévastatrice infligeant de lourds dégâts de zone.',
    cooldown: 6,
    damageMultiplier: 2.5,
    radius: 110
  },
  APOLLO: {
    id: 'APOLLO',
    skillName: 'Flèche solaire',
    description: 'Libère une rafale solaire radieuse qui brûle tout autour du héros.',
    cooldown: 5.5,
    damageMultiplier: 2.1,
    radius: 140
  }
};
