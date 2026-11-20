import type { GodAffinity } from '@greek-myth/shared';

export interface SkillBonus {
  attack?: number;
  maxHp?: number;
  speedPct?: number;
  critChance?: number;
  damageReduction?: number;
  lifeOnKill?: number;
  specialDamagePct?: number;
  specialCooldownPct?: number;
  dashCooldownPct?: number;
  potionHealPct?: number;
}

export interface SkillNodeDef {
  id: string;
  god: GodAffinity;
  name: string;
  description: string;
  tier: 1 | 2 | 3;
  col: 0 | 1 | 2; // position visuelle dans l'arbre (gauche / centre / droite)
  maxRank: number;
  requires?: string;
  bonusPerRank: SkillBonus;
}

export const GOD_SKILL_TREES: Record<GodAffinity, SkillNodeDef[]> = {
  ZEUS: [
    {
      id: 'zeus_swift',
      god: 'ZEUS',
      name: 'Pas de Foudre',
      description: '+6% vitesse de déplacement et -10% recharge d’esquive par rang.',
      tier: 1,
      col: 1,
      maxRank: 3,
      bonusPerRank: { speedPct: 0.06, dashCooldownPct: 0.1 }
    },
    {
      id: 'zeus_spark',
      god: 'ZEUS',
      name: 'Arc Électrique',
      description: '+4 Attaque par rang.',
      tier: 2,
      col: 0,
      maxRank: 3,
      requires: 'zeus_swift',
      bonusPerRank: { attack: 4 }
    },
    {
      id: 'zeus_storm',
      god: 'ZEUS',
      name: 'Ciel d’Orage',
      description: '-12% recharge du pouvoir divin par rang.',
      tier: 2,
      col: 2,
      maxRank: 3,
      requires: 'zeus_swift',
      bonusPerRank: { specialCooldownPct: 0.12 }
    },
    {
      id: 'zeus_crit',
      god: 'ZEUS',
      name: 'Éclair Fulgurant',
      description: '+8% chances de coup critique par rang.',
      tier: 3,
      col: 0,
      maxRank: 2,
      requires: 'zeus_spark',
      bonusPerRank: { critChance: 0.08 }
    },
    {
      id: 'zeus_wrath',
      god: 'ZEUS',
      name: 'Courroux de l’Olympe',
      description: '+35% dégâts du pouvoir divin et +6 Attaque.',
      tier: 3,
      col: 2,
      maxRank: 1,
      requires: 'zeus_storm',
      bonusPerRank: { specialDamagePct: 0.35, attack: 6 }
    }
  ],
  POSEIDON: [
    {
      id: 'pos_vitality',
      god: 'POSEIDON',
      name: 'Sang des Marées',
      description: '+18 PV maximum par rang.',
      tier: 1,
      col: 1,
      maxRank: 3,
      bonusPerRank: { maxHp: 18 }
    },
    {
      id: 'pos_shell',
      god: 'POSEIDON',
      name: 'Carapace Marine',
      description: '-7% dégâts subis par rang.',
      tier: 2,
      col: 0,
      maxRank: 3,
      requires: 'pos_vitality',
      bonusPerRank: { damageReduction: 0.07 }
    },
    {
      id: 'pos_tide',
      god: 'POSEIDON',
      name: 'Force du Ressac',
      description: '+4 Attaque et -8% recharge du pouvoir divin par rang.',
      tier: 2,
      col: 2,
      maxRank: 3,
      requires: 'pos_vitality',
      bonusPerRank: { attack: 4, specialCooldownPct: 0.08 }
    },
    {
      id: 'pos_regen',
      god: 'POSEIDON',
      name: 'Source Profonde',
      description: '+15% efficacité des potions et +12 PV par rang.',
      tier: 3,
      col: 0,
      maxRank: 2,
      requires: 'pos_shell',
      bonusPerRank: { potionHealPct: 0.15, maxHp: 12 }
    },
    {
      id: 'pos_tsunami',
      god: 'POSEIDON',
      name: 'Fureur d’Égée',
      description: '+40% dégâts du Raz-de-marée et -10% dégâts subis.',
      tier: 3,
      col: 2,
      maxRank: 1,
      requires: 'pos_tide',
      bonusPerRank: { specialDamagePct: 0.4, damageReduction: 0.1 }
    }
  ],
  HADES: [
    {
      id: 'had_drain',
      god: 'HADES',
      name: 'Soif des Enfers',
      description: 'Restaure +5 PV à chaque monstre vaincu par rang.',
      tier: 1,
      col: 1,
      maxRank: 3,
      bonusPerRank: { lifeOnKill: 5 }
    },
    {
      id: 'had_blade',
      god: 'HADES',
      name: 'Lame du Styx',
      description: '+4 Attaque et +4% critique par rang.',
      tier: 2,
      col: 0,
      maxRank: 3,
      requires: 'had_drain',
      bonusPerRank: { attack: 4, critChance: 0.04 }
    },
    {
      id: 'had_veil',
      god: 'HADES',
      name: 'Voile Spectral',
      description: '-14% recharge d’esquive et +5% vitesse par rang.',
      tier: 2,
      col: 2,
      maxRank: 3,
      requires: 'had_drain',
      bonusPerRank: { dashCooldownPct: 0.14, speedPct: 0.05 }
    },
    {
      id: 'had_curse',
      god: 'HADES',
      name: 'Malédiction d’Ombre',
      description: '+20% dégâts du pouvoir divin par rang.',
      tier: 3,
      col: 0,
      maxRank: 2,
      requires: 'had_blade',
      bonusPerRank: { specialDamagePct: 0.2 }
    },
    {
      id: 'had_reap',
      god: 'HADES',
      name: 'Moisson des Âmes',
      description: '+12 PV par élimination, +8% critique et +6 Attaque.',
      tier: 3,
      col: 2,
      maxRank: 1,
      requires: 'had_veil',
      bonusPerRank: { lifeOnKill: 12, critChance: 0.08, attack: 6 }
    }
  ],
  ATHENA: [
    {
      id: 'ath_aegis',
      god: 'ATHENA',
      name: 'Rempart d’Égide',
      description: '+14 PV max et -6% dégâts subis par rang.',
      tier: 1,
      col: 1,
      maxRank: 3,
      bonusPerRank: { maxHp: 14, damageReduction: 0.06 }
    },
    {
      id: 'ath_tactics',
      god: 'ATHENA',
      name: 'Frappe Tactique',
      description: '+4 Attaque et +5% critique par rang.',
      tier: 2,
      col: 0,
      maxRank: 3,
      requires: 'ath_aegis',
      bonusPerRank: { attack: 4, critChance: 0.05 }
    },
    {
      id: 'ath_reflex',
      god: 'ATHENA',
      name: 'Réflexes de Pallas',
      description: '-12% recharge d’esquive et -8% recharge pouvoir par rang.',
      tier: 2,
      col: 2,
      maxRank: 3,
      requires: 'ath_aegis',
      bonusPerRank: { dashCooldownPct: 0.12, specialCooldownPct: 0.08 }
    },
    {
      id: 'ath_mastery',
      god: 'ATHENA',
      name: 'Discipline de Sparte',
      description: '+15% soin des potions et -6% dégâts subis par rang.',
      tier: 3,
      col: 0,
      maxRank: 2,
      requires: 'ath_tactics',
      bonusPerRank: { potionHealPct: 0.15, damageReduction: 0.06 }
    },
    {
      id: 'ath_judgment',
      god: 'ATHENA',
      name: 'Jugement d’Athéna',
      description: '+35% dégâts du pouvoir divin et +25 PV max.',
      tier: 3,
      col: 2,
      maxRank: 1,
      requires: 'ath_reflex',
      bonusPerRank: { specialDamagePct: 0.35, maxHp: 25 }
    }
  ],
  ARES: [
    {
      id: 'ares_fury',
      god: 'ARES',
      name: 'Fureur Martiale',
      description: '+5 Attaque par rang.',
      tier: 1,
      col: 1,
      maxRank: 3,
      bonusPerRank: { attack: 5 }
    },
    {
      id: 'ares_blood',
      god: 'ARES',
      name: 'Sang Bouillant',
      description: '+7% chances de coup critique par rang.',
      tier: 2,
      col: 0,
      maxRank: 3,
      requires: 'ares_fury',
      bonusPerRank: { critChance: 0.07 }
    },
    {
      id: 'ares_charge',
      god: 'ARES',
      name: 'Assaut Implacable',
      description: '+5% vitesse et +5 PV rendus par ennemi vaincu par rang.',
      tier: 2,
      col: 2,
      maxRank: 3,
      requires: 'ares_fury',
      bonusPerRank: { speedPct: 0.05, lifeOnKill: 5 }
    },
    {
      id: 'ares_cleave',
      god: 'ARES',
      name: 'Frappe Sismique',
      description: '+22% dégâts du pouvoir divin par rang.',
      tier: 3,
      col: 0,
      maxRank: 2,
      requires: 'ares_blood',
      bonusPerRank: { specialDamagePct: 0.22 }
    },
    {
      id: 'ares_avatar',
      god: 'ARES',
      name: 'Avatar de la Guerre',
      description: '+10 Attaque, +10% critique et -15% recharge du pouvoir.',
      tier: 3,
      col: 2,
      maxRank: 1,
      requires: 'ares_charge',
      bonusPerRank: { attack: 10, critChance: 0.1, specialCooldownPct: 0.15 }
    }
  ],
  APOLLO: [
    {
      id: 'apo_aim',
      god: 'APOLLO',
      name: 'Œil de Delphes',
      description: '+6% chances de coup critique par rang.',
      tier: 1,
      col: 1,
      maxRank: 3,
      bonusPerRank: { critChance: 0.06 }
    },
    {
      id: 'apo_sun',
      god: 'APOLLO',
      name: 'Rayon d’Or',
      description: '+4 Attaque et -10% recharge du pouvoir divin par rang.',
      tier: 2,
      col: 0,
      maxRank: 3,
      requires: 'apo_aim',
      bonusPerRank: { attack: 4, specialCooldownPct: 0.1 }
    },
    {
      id: 'apo_warmth',
      god: 'APOLLO',
      name: 'Chaleur Bienfaisante',
      description: '+14 PV max et +18% efficacité des potions par rang.',
      tier: 2,
      col: 2,
      maxRank: 3,
      requires: 'apo_aim',
      bonusPerRank: { maxHp: 14, potionHealPct: 0.18 }
    },
    {
      id: 'apo_grace',
      god: 'APOLLO',
      name: 'Grâce Solaire',
      description: '+6% vitesse et -12% recharge d’esquive par rang.',
      tier: 3,
      col: 0,
      maxRank: 2,
      requires: 'apo_sun',
      bonusPerRank: { speedPct: 0.06, dashCooldownPct: 0.12 }
    },
    {
      id: 'apo_helios',
      god: 'APOLLO',
      name: 'Éclat d’Hélios',
      description: '+40% dégâts de la Flèche solaire et +8% critique.',
      tier: 3,
      col: 2,
      maxRank: 1,
      requires: 'apo_warmth',
      bonusPerRank: { specialDamagePct: 0.4, critChance: 0.08 }
    }
  ]
};

export interface AggregatedSkillBonuses {
  attack: number;
  maxHp: number;
  speedPct: number;
  critChance: number;
  damageReduction: number;
  lifeOnKill: number;
  specialDamagePct: number;
  specialCooldownPct: number;
  dashCooldownPct: number;
  potionHealPct: number;
}

export function computeSkillBonuses(
  god: GodAffinity,
  unlockedSkills: Record<string, number> = {}
): AggregatedSkillBonuses {
  const out: AggregatedSkillBonuses = {
    attack: 0,
    maxHp: 0,
    speedPct: 0,
    critChance: 0,
    damageReduction: 0,
    lifeOnKill: 0,
    specialDamagePct: 0,
    specialCooldownPct: 0,
    dashCooldownPct: 0,
    potionHealPct: 0
  };
  const nodes = GOD_SKILL_TREES[god] ?? [];
  for (const node of nodes) {
    const rank = Math.min(node.maxRank, unlockedSkills[node.id] ?? 0);
    if (rank <= 0) continue;
    const b = node.bonusPerRank;
    if (b.attack) out.attack += b.attack * rank;
    if (b.maxHp) out.maxHp += b.maxHp * rank;
    if (b.speedPct) out.speedPct += b.speedPct * rank;
    if (b.critChance) out.critChance += b.critChance * rank;
    if (b.damageReduction) out.damageReduction += b.damageReduction * rank;
    if (b.lifeOnKill) out.lifeOnKill += b.lifeOnKill * rank;
    if (b.specialDamagePct) out.specialDamagePct += b.specialDamagePct * rank;
    if (b.specialCooldownPct) out.specialCooldownPct += b.specialCooldownPct * rank;
    if (b.dashCooldownPct) out.dashCooldownPct += b.dashCooldownPct * rank;
    if (b.potionHealPct) out.potionHealPct += b.potionHealPct * rank;
  }
  out.damageReduction = Math.min(0.5, out.damageReduction);
  out.specialCooldownPct = Math.min(0.45, out.specialCooldownPct);
  out.dashCooldownPct = Math.min(0.45, out.dashCooldownPct);
  return out;
}
