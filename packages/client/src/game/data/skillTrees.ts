import type { GodAffinity } from '@greek-myth/shared';
import type { HeroClassId } from './classes';

export type ActiveSkillEffect =
  | 'tank_taunt'
  | 'tank_shield_wall'
  | 'tank_fortress'
  | 'heal_light'
  | 'heal_sanctuary'
  | 'heal_revive_grace'
  | 'dps_arrow_rain'
  | 'dps_piercing_mark'
  | 'dps_artemis_storm'
  | 'dps_shadow_step'
  | 'dps_venom_spin'
  | 'dps_styx_execute'
  | 'divine_zeus_chain'
  | 'divine_zeus_tempest'
  | 'divine_pos_geyser'
  | 'divine_pos_maelstrom'
  | 'divine_had_pact'
  | 'divine_had_legion'
  | 'divine_ath_aegis'
  | 'divine_ath_spear'
  | 'divine_ares_warcry'
  | 'divine_ares_rampage'
  | 'divine_apo_hymn'
  | 'divine_apo_nova';

export interface ActiveSkillDef {
  id: string;
  name: string;
  shortDesc: string;
  cooldown: number;
  effect: ActiveSkillEffect;
  color: string;
  roleTag: 'Tank' | 'Soin' | 'DPS' | 'Divin';
}

export interface SkillBonus {
  attack?: number;
  maxHp?: number;
  armor?: number;
  speedPct?: number;
  critChance?: number;
  damageReduction?: number;
  lifeOnKill?: number;
  healPowerPct?: number;
  specialDamagePct?: number;
  specialCooldownPct?: number;
  dashCooldownPct?: number;
  potionHealPct?: number;
}

export interface SkillNodeDef {
  id: string;
  tree: 'class' | 'god';
  name: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  col: 0 | 1 | 2;
  minLevel: number;
  maxRank: number;
  requires?: string;
  bonusPerRank?: SkillBonus;
  unlocksActive?: ActiveSkillDef;
}

export const CLASS_ROLE_LABEL: Record<HeroClassId, { role: string; subtitle: string; color: string }> = {
  GUERRIER: { role: 'Tank / Avant-garde', subtitle: 'Provocation, boucliers et protection du groupe en donjon', color: '#f59e0b' },
  MAGE: { role: 'Soigneur / Soutien', subtitle: 'Soins de zone, sanctuaires et bénédictions pour le groupe', color: '#4ade80' },
  ARCHER: { role: 'DPS Distance', subtitle: 'Volées de flèches, tirs critiques et contrôle à distance', color: '#38bdf8' },
  ASSASSIN: { role: 'DPS Mêlée / Burst', subtitle: 'Mobilité fulgurante, poisons et exécutions critiques', color: '#c084fc' }
};

export const CLASS_SKILL_TREES: Record<HeroClassId, SkillNodeDef[]> = {
  GUERRIER: [
    {
      id: 'w_taunt',
      tree: 'class',
      name: 'Cri de Défi',
      description: '[ACTIF Tank] Provoque et étourdit les ennemis proches, octroie +30% réduction de dégâts pendant 5 s.',
      tier: 1, col: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 'w_taunt', name: 'Cri de Défi', shortDesc: 'Provocation + bouclier 5 s', cooldown: 8, effect: 'tank_taunt', color: '#f59e0b', roleTag: 'Tank' }
    },
    {
      id: 'w_plate', tree: 'class', name: 'Peau de Bronze', description: '+16 PV max et +3 Armure par rang.',
      tier: 2, col: 0, minLevel: 3, maxRank: 3, requires: 'w_taunt', bonusPerRank: { maxHp: 16, armor: 3 }
    },
    {
      id: 'w_spear', tree: 'class', name: 'Maîtrise de la Lance', description: '+4 Attaque par rang.',
      tier: 2, col: 2, minLevel: 3, maxRank: 3, requires: 'w_taunt', bonusPerRank: { attack: 4 }
    },
    {
      id: 'w_wall', tree: 'class', name: 'Mur de Bouclier',
      description: '[ACTIF Tank] Barrière d’airain pendant 4,5 s (-60% dégâts subis) et onde de choc défensive.',
      tier: 3, col: 0, minLevel: 10, maxRank: 1, requires: 'w_plate',
      unlocksActive: { id: 'w_wall', name: 'Mur de Bouclier', shortDesc: '-60% dégâts subis (4,5 s)', cooldown: 13, effect: 'tank_shield_wall', color: '#fbbf24', roleTag: 'Tank' }
    },
    {
      id: 'w_resolve', tree: 'class', name: 'Détermination Spartiate', description: '-4% dégâts subis et +12% soin des potions par rang.',
      tier: 3, col: 2, minLevel: 10, maxRank: 3, requires: 'w_spear', bonusPerRank: { damageReduction: 0.04, potionHealPct: 0.12 }
    },
    {
      id: 'w_bastion', tree: 'class', name: 'Bastion Vivant', description: '+24 PV max et +4 Armure par rang.',
      tier: 4, col: 0, minLevel: 20, maxRank: 3, requires: 'w_wall', bonusPerRank: { maxHp: 24, armor: 4 }
    },
    {
      id: 'w_counter', tree: 'class', name: 'Contre-Attaque', description: '+5 Attaque et +5% critique par rang.',
      tier: 4, col: 2, minLevel: 20, maxRank: 3, requires: 'w_resolve', bonusPerRank: { attack: 5, critChance: 0.05 }
    },
    {
      id: 'w_fortress', tree: 'class', name: 'Forteresse d’Hoplite',
      description: '[ACTIF Ultime Tank] Onde protectrice rendant 35% PV et réduisant les dégâts de 50% pendant 6 s.',
      tier: 5, col: 1, minLevel: 30, maxRank: 1, requires: 'w_bastion',
      unlocksActive: { id: 'w_fortress', name: 'Forteresse', shortDesc: '+35% PV + barrière 6 s', cooldown: 18, effect: 'tank_fortress', color: '#fde047', roleTag: 'Tank' }
    }
  ],
  MAGE: [
    {
      id: 'm_heal', tree: 'class', name: 'Lumière de Soin',
      description: '[ACTIF Soigneur] Restaure immédiatement 30% PV dans une aura de lumière (soigne aussi les alliés en coop).',
      tier: 1, col: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 'm_heal', name: 'Lumière de Soin', shortDesc: 'Soin de zone +30% PV', cooldown: 8, effect: 'heal_light', color: '#4ade80', roleTag: 'Soin' }
    },
    {
      id: 'm_mend', tree: 'class', name: 'Souffle d’Ambroisie', description: '+14% puissance des soins et +12 PV max par rang.',
      tier: 2, col: 0, minLevel: 3, maxRank: 3, requires: 'm_heal', bonusPerRank: { healPowerPct: 0.14, maxHp: 12 }
    },
    {
      id: 'm_arcana', tree: 'class', name: 'Sagesse de Delphes', description: '+4 Attaque et -8% recharge du pouvoir divin par rang.',
      tier: 2, col: 2, minLevel: 3, maxRank: 3, requires: 'm_heal', bonusPerRank: { attack: 4, specialCooldownPct: 0.08 }
    },
    {
      id: 'm_sanctuary', tree: 'class', name: 'Sanctuaire d’Ambroisie',
      description: '[ACTIF Soigneur] Trace un cercle sacré au sol qui soigne en continu pendant 5 s et repousse les monstres.',
      tier: 3, col: 0, minLevel: 10, maxRank: 1, requires: 'm_mend',
      unlocksActive: { id: 'm_sanctuary', name: 'Sanctuaire', shortDesc: 'Zone de soin continu 5 s', cooldown: 14, effect: 'heal_sanctuary', color: '#34d399', roleTag: 'Soin' }
    },
    {
      id: 'm_clarity', tree: 'class', name: 'Clarté Mentale', description: '+5% critique et +5% vitesse par rang.',
      tier: 3, col: 2, minLevel: 10, maxRank: 3, requires: 'm_arcana', bonusPerRank: { critChance: 0.05, speedPct: 0.05 }
    },
    {
      id: 'm_blessing', tree: 'class', name: 'Bénédiction d’Asclépios', description: '+18% puissance des soins et -4% dégâts subis par rang.',
      tier: 4, col: 0, minLevel: 20, maxRank: 3, requires: 'm_sanctuary', bonusPerRank: { healPowerPct: 0.18, damageReduction: 0.04 }
    },
    {
      id: 'm_surge', tree: 'class', name: 'Déferlante Astrale', description: '+15% dégâts du pouvoir divin et +5 Attaque par rang.',
      tier: 4, col: 2, minLevel: 20, maxRank: 3, requires: 'm_clarity', bonusPerRank: { specialDamagePct: 0.15, attack: 5 }
    },
    {
      id: 'm_grace', tree: 'class', name: 'Grâce Immortelle',
      description: '[ACTIF Ultime Soigneur] Soin massif (+65% PV), bouclier sacré 5 s et onde lumineuse purificatrice.',
      tier: 5, col: 1, minLevel: 30, maxRank: 1, requires: 'm_blessing',
      unlocksActive: { id: 'm_grace', name: 'Grâce Immortelle', shortDesc: 'Grand soin +65% PV + bouclier', cooldown: 20, effect: 'heal_revive_grace', color: '#86efac', roleTag: 'Soin' }
    }
  ],
  ARCHER: [
    {
      id: 'a_rain', tree: 'class', name: 'Volée de Flèches',
      description: '[ACTIF DPS] Tire un éventail rapide de 5 flèches perçantes devant vous.',
      tier: 1, col: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 'a_rain', name: 'Volée de Flèches', shortDesc: '5 flèches perçantes', cooldown: 6.5, effect: 'dps_arrow_rain', color: '#38bdf8', roleTag: 'DPS' }
    },
    {
      id: 'a_keen', tree: 'class', name: 'Œil de Faucon', description: '+5% critique et +3 Attaque par rang.',
      tier: 2, col: 0, minLevel: 3, maxRank: 3, requires: 'a_rain', bonusPerRank: { critChance: 0.05, attack: 3 }
    },
    {
      id: 'a_wind', tree: 'class', name: 'Foulée du Zéphyr', description: '+5% vitesse et -10% recharge d’esquive par rang.',
      tier: 2, col: 2, minLevel: 3, maxRank: 3, requires: 'a_rain', bonusPerRank: { speedPct: 0.05, dashCooldownPct: 0.1 }
    },
    {
      id: 'a_mark', tree: 'class', name: 'Tir Perçant',
      description: '[ACTIF DPS] Flèche surpuissante à coup critique garanti traversant tous les ennemis en ligne.',
      tier: 3, col: 0, minLevel: 10, maxRank: 1, requires: 'a_keen',
      unlocksActive: { id: 'a_mark', name: 'Tir Perçant', shortDesc: 'Flèche critique perçante', cooldown: 9, effect: 'dps_piercing_mark', color: '#7dd3fc', roleTag: 'DPS' }
    },
    {
      id: 'a_quiver', tree: 'class', name: 'Carquois d’Orichalque', description: '+6 Attaque par rang.',
      tier: 3, col: 2, minLevel: 10, maxRank: 3, requires: 'a_wind', bonusPerRank: { attack: 6 }
    },
    {
      id: 'a_lethal', tree: 'class', name: 'Précision Mortelle', description: '+6% critique et +12% dégâts pouvoir divin par rang.',
      tier: 4, col: 0, minLevel: 20, maxRank: 3, requires: 'a_mark', bonusPerRank: { critChance: 0.06, specialDamagePct: 0.12 }
    },
    {
      id: 'a_hunter', tree: 'class', name: 'Endurance du Chasseur', description: '+16 PV max et +4 PV rendus par élimination par rang.',
      tier: 4, col: 2, minLevel: 20, maxRank: 3, requires: 'a_quiver', bonusPerRank: { maxHp: 16, lifeOnKill: 4 }
    },
    {
      id: 'a_storm', tree: 'class', name: 'Tempête d’Artémis',
      description: '[ACTIF Ultime DPS] Salve circulaire de 12 flèches lunaires perçantes tout autour de vous.',
      tier: 5, col: 1, minLevel: 30, maxRank: 1, requires: 'a_lethal',
      unlocksActive: { id: 'a_storm', name: 'Tempête Artémis', shortDesc: '12 flèches circulaires', cooldown: 14, effect: 'dps_artemis_storm', color: '#bae6fd', roleTag: 'DPS' }
    }
  ],
  ASSASSIN: [
    {
      id: 's_step', tree: 'class', name: 'Foulée d’Ombre',
      description: '[ACTIF DPS] Ruée fulgurante vers l’avant infligeant une frappe critique sur le trajet.',
      tier: 1, col: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 's_step', name: 'Foulée d’Ombre', shortDesc: 'Ruée + frappe critique', cooldown: 6.5, effect: 'dps_shadow_step', color: '#c084fc', roleTag: 'DPS' }
    },
    {
      id: 's_edge', tree: 'class', name: 'Lames Affûtées', description: '+5 Attaque et +4% critique par rang.',
      tier: 2, col: 0, minLevel: 3, maxRank: 3, requires: 's_step', bonusPerRank: { attack: 5, critChance: 0.04 }
    },
    {
      id: 's_agile', tree: 'class', name: 'Pas Fantôme', description: '+6% vitesse et -10% recharge d’esquive par rang.',
      tier: 2, col: 2, minLevel: 3, maxRank: 3, requires: 's_step', bonusPerRank: { speedPct: 0.06, dashCooldownPct: 0.1 }
    },
    {
      id: 's_spin', tree: 'class', name: 'Tourbillon Venimeux',
      description: '[ACTIF DPS] Double tourbillon de dagues infligeant de lourds dégâts à tous les ennemis proches.',
      tier: 3, col: 0, minLevel: 10, maxRank: 1, requires: 's_edge',
      unlocksActive: { id: 's_spin', name: 'Tourbillon', shortDesc: 'Dagues de zone critiques', cooldown: 9.5, effect: 'dps_venom_spin', color: '#a855f7', roleTag: 'DPS' }
    },
    {
      id: 's_siphon', tree: 'class', name: 'Lame Sanguinaire', description: '+6 PV par élimination et +4% critique par rang.',
      tier: 3, col: 2, minLevel: 10, maxRank: 3, requires: 's_agile', bonusPerRank: { lifeOnKill: 6, critChance: 0.04 }
    },
    {
      id: 's_ambush', tree: 'class', name: 'Coup Fatal', description: '+7 Attaque et +5% critique par rang.',
      tier: 4, col: 0, minLevel: 20, maxRank: 3, requires: 's_spin', bonusPerRank: { attack: 7, critChance: 0.05 }
    },
    {
      id: 's_shadow', tree: 'class', name: 'Voile Nocturne', description: '-5% dégâts subis et +12% dégâts pouvoir divin par rang.',
      tier: 4, col: 2, minLevel: 20, maxRank: 3, requires: 's_siphon', bonusPerRank: { damageReduction: 0.05, specialDamagePct: 0.12 }
    },
    {
      id: 's_execute', tree: 'class', name: 'Exécution du Styx',
      description: '[ACTIF Ultime DPS] Frappe dévastatrice (x3,6 ATK) autour de vous et réinitialise votre esquive.',
      tier: 5, col: 1, minLevel: 30, maxRank: 1, requires: 's_ambush',
      unlocksActive: { id: 's_execute', name: 'Exécution', shortDesc: 'Burst x3,6 + reset esquive', cooldown: 15, effect: 'dps_styx_execute', color: '#e879f9', roleTag: 'DPS' }
    }
  ]
};

function makeGodTree(
  _god: GodAffinity,
  cfg: {
    t1: [string, string, string, SkillBonus];
    t2a: [string, string, string, SkillBonus];
    t2b: [string, string, string, SkillBonus];
    act1: ActiveSkillDef;
    t3b: [string, string, string, SkillBonus];
    t4a: [string, string, string, SkillBonus];
    t4b: [string, string, string, SkillBonus];
    act2: ActiveSkillDef;
  }
): SkillNodeDef[] {
  return [
    { id: cfg.t1[0], tree: 'god', name: cfg.t1[1], description: cfg.t1[2], tier: 1, col: 1, minLevel: 1, maxRank: 3, bonusPerRank: cfg.t1[3] },
    { id: cfg.t2a[0], tree: 'god', name: cfg.t2a[1], description: cfg.t2a[2], tier: 2, col: 0, minLevel: 4, maxRank: 3, requires: cfg.t1[0], bonusPerRank: cfg.t2a[3] },
    { id: cfg.t2b[0], tree: 'god', name: cfg.t2b[1], description: cfg.t2b[2], tier: 2, col: 2, minLevel: 4, maxRank: 3, requires: cfg.t1[0], bonusPerRank: cfg.t2b[3] },
    { id: cfg.act1.id, tree: 'god', name: cfg.act1.name, description: `[ACTIF Divin] ${cfg.act1.shortDesc}`, tier: 3, col: 0, minLevel: 12, maxRank: 1, requires: cfg.t2a[0], unlocksActive: cfg.act1 },
    { id: cfg.t3b[0], tree: 'god', name: cfg.t3b[1], description: cfg.t3b[2], tier: 3, col: 2, minLevel: 12, maxRank: 3, requires: cfg.t2b[0], bonusPerRank: cfg.t3b[3] },
    { id: cfg.t4a[0], tree: 'god', name: cfg.t4a[1], description: cfg.t4a[2], tier: 4, col: 0, minLevel: 22, maxRank: 3, requires: cfg.act1.id, bonusPerRank: cfg.t4a[3] },
    { id: cfg.t4b[0], tree: 'god', name: cfg.t4b[1], description: cfg.t4b[2], tier: 4, col: 2, minLevel: 22, maxRank: 3, requires: cfg.t3b[0], bonusPerRank: cfg.t4b[3] },
    { id: cfg.act2.id, tree: 'god', name: cfg.act2.name, description: `[ACTIF Divin Ultime] ${cfg.act2.shortDesc}`, tier: 5, col: 1, minLevel: 32, maxRank: 1, requires: cfg.t4a[0], unlocksActive: cfg.act2 }
  ];
}

export const GOD_SKILL_TREES: Record<GodAffinity, SkillNodeDef[]> = {
  ZEUS: makeGodTree('ZEUS', {
    t1: ['zeus_swift', 'Pas de Foudre', '+5% vitesse et -8% recharge esquive par rang.', { speedPct: 0.05, dashCooldownPct: 0.08 }],
    t2a: ['zeus_spark', 'Arc Électrique', '+4 Attaque par rang.', { attack: 4 }],
    t2b: ['zeus_storm', 'Ciel d’Orage', '-10% recharge du pouvoir divin par rang.', { specialCooldownPct: 0.1 }],
    act1: { id: 'zeus_chain', name: 'Chaîne d’Éclairs', shortDesc: 'Foudroie et étourdit 4 cibles autour de vous.', cooldown: 10, effect: 'divine_zeus_chain', color: '#facc15', roleTag: 'Divin' },
    t3b: ['zeus_crit', 'Éclair Fulgurant', '+6% critique par rang.', { critChance: 0.06 }],
    t4a: ['zeus_wrath', 'Fureur du Ciel', '+18% dégâts du pouvoir divin par rang.', { specialDamagePct: 0.18 }],
    t4b: ['zeus_aura', 'Conducteur Divin', '+5 Attaque et +4% vitesse par rang.', { attack: 5, speedPct: 0.04 }],
    act2: { id: 'zeus_tempest', name: 'Tempête de l’Olympe', shortDesc: 'Orage dévastateur de zone + étourdissement 1,5 s.', cooldown: 16, effect: 'divine_zeus_tempest', color: '#fde047', roleTag: 'Divin' }
  }),
  POSEIDON: makeGodTree('POSEIDON', {
    t1: ['pos_vitality', 'Sang des Marées', '+18 PV max par rang.', { maxHp: 18 }],
    t2a: ['pos_shell', 'Carapace Marine', '-5% dégâts subis et +3 Armure par rang.', { damageReduction: 0.05, armor: 3 }],
    t2b: ['pos_tide', 'Force du Ressac', '+4 Attaque et -8% recharge pouvoir par rang.', { attack: 4, specialCooldownPct: 0.08 }],
    act1: { id: 'pos_geyser', name: 'Geyser Protecteur', shortDesc: 'Repousse les ennemis, soigne 22% PV et réduit les dégâts 4 s.', cooldown: 11, effect: 'divine_pos_geyser', color: '#38bdf8', roleTag: 'Divin' },
    t3b: ['pos_regen', 'Source Profonde', '+15% soin des potions et +12% puissance de soin par rang.', { potionHealPct: 0.15, healPowerPct: 0.12 }],
    t4a: ['pos_abyss', 'Armure des Abysses', '+22 PV max et +4 Armure par rang.', { maxHp: 22, armor: 4 }],
    t4b: ['pos_tsunami', 'Fureur d’Égée', '+18% dégâts du pouvoir divin par rang.', { specialDamagePct: 0.18 }],
    act2: { id: 'pos_maelstrom', name: 'Maelström d’Égée', shortDesc: 'Vague colossale circulaire infligeant x3 ATK + soin 25% PV.', cooldown: 16, effect: 'divine_pos_maelstrom', color: '#0ea5e9', roleTag: 'Divin' }
  }),
  HADES: makeGodTree('HADES', {
    t1: ['had_drain', 'Soif des Enfers', '+5 PV rendus à chaque élimination par rang.', { lifeOnKill: 5 }],
    t2a: ['had_blade', 'Lame du Styx', '+4 Attaque et +4% critique par rang.', { attack: 4, critChance: 0.04 }],
    t2b: ['had_veil', 'Voile Spectral', '-10% recharge esquive et +4% vitesse par rang.', { dashCooldownPct: 0.1, speedPct: 0.04 }],
    act1: { id: 'had_pact', name: 'Pacte du Styx', shortDesc: 'Draine tous les ennemis proches (dégâts + vol de vie 35%).', cooldown: 10, effect: 'divine_had_pact', color: '#a855f7', roleTag: 'Divin' },
    t3b: ['had_curse', 'Malédiction d’Ombre', '+15% dégâts pouvoir divin par rang.', { specialDamagePct: 0.15 }],
    t4a: ['had_reap', 'Moisson des Âmes', '+7 PV/kill et +5 Attaque par rang.', { lifeOnKill: 7, attack: 5 }],
    t4b: ['had_wraith', 'Linceul Funeste', '-5% dégâts subis et +5% critique par rang.', { damageReduction: 0.05, critChance: 0.05 }],
    act2: { id: 'had_legion', name: 'Légion des Ombres', shortDesc: 'Vague spectrale x3,2 ATK + soin complet sur les cibles touchées.', cooldown: 16, effect: 'divine_had_legion', color: '#c084fc', roleTag: 'Divin' }
  }),
  ATHENA: makeGodTree('ATHENA', {
    t1: ['ath_aegis', 'Rempart d’Égide', '+14 PV max et -4% dégâts subis par rang.', { maxHp: 14, damageReduction: 0.04 }],
    t2a: ['ath_tactics', 'Frappe Tactique', '+4 Attaque et +4% critique par rang.', { attack: 4, critChance: 0.04 }],
    t2b: ['ath_reflex', 'Réflexes de Pallas', '-10% recharge esquive et -8% recharge pouvoir par rang.', { dashCooldownPct: 0.1, specialCooldownPct: 0.08 }],
    act1: { id: 'ath_aegis_act', name: 'Égide Collective', shortDesc: 'Bouclier doré (-55% dégâts 5 s) et soin 20% PV.', cooldown: 12, effect: 'divine_ath_aegis', color: '#60a5fa', roleTag: 'Divin' },
    t3b: ['ath_mastery', 'Discipline de Sparte', '+14% soin potions et +4 Armure par rang.', { potionHealPct: 0.14, armor: 4 }],
    t4a: ['ath_wisdom', 'Stratège Immortel', '+16% puissance de soin et +5 Attaque par rang.', { healPowerPct: 0.16, attack: 5 }],
    t4b: ['ath_judgment', 'Jugement d’Athéna', '+18% dégâts pouvoir divin par rang.', { specialDamagePct: 0.18 }],
    act2: { id: 'ath_spear', name: 'Lance de Pallas', shortDesc: 'Rayon doré massif (x3,1 ATK) étourdissant tous les ennemis.', cooldown: 16, effect: 'divine_ath_spear', color: '#93c5fd', roleTag: 'Divin' }
  }),
  ARES: makeGodTree('ARES', {
    t1: ['ares_fury', 'Fureur Martiale', '+5 Attaque par rang.', { attack: 5 }],
    t2a: ['ares_blood', 'Sang Bouillant', '+6% critique par rang.', { critChance: 0.06 }],
    t2b: ['ares_charge', 'Assaut Implacable', '+4% vitesse et +4 PV/kill par rang.', { speedPct: 0.04, lifeOnKill: 4 }],
    act1: { id: 'ares_warcry', name: 'Cri de Guerre', shortDesc: 'Onde brutale x2,4 ATK et +30% vitesse pendant 5 s.', cooldown: 10, effect: 'divine_ares_warcry', color: '#ef4444', roleTag: 'Divin' },
    t3b: ['ares_cleave', 'Frappe Sismique', '+16% dégâts pouvoir divin par rang.', { specialDamagePct: 0.16 }],
    t4a: ['ares_brutal', 'Soif de Carnage', '+7 Attaque et +5% critique par rang.', { attack: 7, critChance: 0.05 }],
    t4b: ['ares_iron', 'Corps de Fer', '+18 PV max et +3 Armure par rang.', { maxHp: 18, armor: 3 }],
    act2: { id: 'ares_rampage', name: 'Cataclysme d’Arès', shortDesc: 'Explosion sismique x3,8 ATK autour du héros.', cooldown: 16, effect: 'divine_ares_rampage', color: '#f87171', roleTag: 'Divin' }
  }),
  APOLLO: makeGodTree('APOLLO', {
    t1: ['apo_aim', 'Œil de Delphes', '+5% critique par rang.', { critChance: 0.05 }],
    t2a: ['apo_sun', 'Rayon d’Or', '+4 Attaque et -8% recharge pouvoir par rang.', { attack: 4, specialCooldownPct: 0.08 }],
    t2b: ['apo_warmth', 'Chaleur Bienfaisante', '+14 PV max et +15% puissance de soin par rang.', { maxHp: 14, healPowerPct: 0.15 }],
    act1: { id: 'apo_hymn', name: 'Chant de Delphes', shortDesc: 'Aura solaire qui soigne 28% PV et brûle les ennemis proches.', cooldown: 11, effect: 'divine_apo_hymn', color: '#fbbf24', roleTag: 'Divin' },
    t3b: ['apo_grace', 'Grâce Solaire', '+5% vitesse et -10% recharge esquive par rang.', { speedPct: 0.05, dashCooldownPct: 0.1 }],
    t4a: ['apo_solar', 'Flamme d’Hélios', '+18% dégâts pouvoir divin et +5 Attaque par rang.', { specialDamagePct: 0.18, attack: 5 }],
    t4b: ['apo_clarity', 'Bénédiction Solaire', '+16% soin potions et +14 PV max par rang.', { potionHealPct: 0.16, maxHp: 14 }],
    act2: { id: 'apo_nova', name: 'Supernova Solaire', shortDesc: 'Éruption radieuse x3,2 ATK + soin 30% PV.', cooldown: 16, effect: 'divine_apo_nova', color: '#fef08a', roleTag: 'Divin' }
  })
};

export interface AggregatedSkillBonuses {
  attack: number;
  maxHp: number;
  armor: number;
  speedPct: number;
  critChance: number;
  damageReduction: number;
  lifeOnKill: number;
  healPowerPct: number;
  specialDamagePct: number;
  specialCooldownPct: number;
  dashCooldownPct: number;
  potionHealPct: number;
}

export function getAllNodesForHero(heroClass: HeroClassId, god: GodAffinity): SkillNodeDef[] {
  return [...(CLASS_SKILL_TREES[heroClass] ?? []), ...(GOD_SKILL_TREES[god] ?? [])];
}

export function getUnlockedActiveSkills(
  heroClass: HeroClassId,
  god: GodAffinity,
  unlockedSkills: Record<string, number> = {}
): ActiveSkillDef[] {
  const out: ActiveSkillDef[] = [];
  for (const node of getAllNodesForHero(heroClass, god)) {
    if (node.unlocksActive && (unlockedSkills[node.id] ?? 0) > 0) {
      out.push(node.unlocksActive);
    }
  }
  return out.slice(0, 4);
}

export function computeSkillBonuses(
  heroClass: HeroClassId,
  god: GodAffinity,
  unlockedSkills: Record<string, number> = {}
): AggregatedSkillBonuses {
  const out: AggregatedSkillBonuses = {
    attack: 0,
    maxHp: 0,
    armor: 0,
    speedPct: 0,
    critChance: 0,
    damageReduction: 0,
    lifeOnKill: 0,
    healPowerPct: 0,
    specialDamagePct: 0,
    specialCooldownPct: 0,
    dashCooldownPct: 0,
    potionHealPct: 0
  };
  for (const node of getAllNodesForHero(heroClass, god)) {
    const rank = Math.min(node.maxRank, unlockedSkills[node.id] ?? 0);
    if (rank <= 0 || !node.bonusPerRank) continue;
    const b = node.bonusPerRank;
    if (b.attack) out.attack += b.attack * rank;
    if (b.maxHp) out.maxHp += b.maxHp * rank;
    if (b.armor) out.armor += b.armor * rank;
    if (b.speedPct) out.speedPct += b.speedPct * rank;
    if (b.critChance) out.critChance += b.critChance * rank;
    if (b.damageReduction) out.damageReduction += b.damageReduction * rank;
    if (b.lifeOnKill) out.lifeOnKill += b.lifeOnKill * rank;
    if (b.healPowerPct) out.healPowerPct += b.healPowerPct * rank;
    if (b.specialDamagePct) out.specialDamagePct += b.specialDamagePct * rank;
    if (b.specialCooldownPct) out.specialCooldownPct += b.specialCooldownPct * rank;
    if (b.dashCooldownPct) out.dashCooldownPct += b.dashCooldownPct * rank;
    if (b.potionHealPct) out.potionHealPct += b.potionHealPct * rank;
  }
  out.damageReduction = Math.min(0.55, out.damageReduction);
  out.specialCooldownPct = Math.min(0.45, out.specialCooldownPct);
  out.dashCooldownPct = Math.min(0.45, out.dashCooldownPct);
  return out;
}
