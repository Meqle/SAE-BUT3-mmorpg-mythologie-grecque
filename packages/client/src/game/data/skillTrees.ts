import type { GodAffinity } from '@greek-myth/shared';
import type { HeroClassId } from './classes';

export type ActiveSkillEffect =
  | 'tank_taunt'
  | 'tank_shield_wall'
  | 'tank_fortress'
  | 'war_brutal'
  | 'war_whirlwind'
  | 'war_execute'
  | 'heal_light'
  | 'heal_sanctuary'
  | 'heal_revive_grace'
  | 'mage_bolt'
  | 'mage_meteor'
  | 'mage_cataclysm'
  | 'dps_piercing_mark'
  | 'dps_hunter_mark'
  | 'dps_apollo_arrow'
  | 'dps_arrow_rain'
  | 'dps_explosive'
  | 'dps_artemis_storm'
  | 'dps_shadow_step'
  | 'dps_backstab'
  | 'dps_styx_execute'
  | 'dps_venom_blades'
  | 'dps_venom_spin'
  | 'dps_viper_swarm'
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
  path: 'left' | 'right';
  name: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  minLevel: number;
  maxRank: number;
  requires?: string;
  bonusPerRank?: SkillBonus;
  unlocksActive?: ActiveSkillDef;
}

export interface ClassSpecMeta {
  leftName: string;
  rightName: string;
  role: string;
}

export const CLASS_ROLE_LABEL: Record<HeroClassId, ClassSpecMeta> = {
  GUERRIER: { leftName: 'Voie Tank', rightName: 'Voie DPS', role: 'Tank / DPS' },
  MAGE: { leftName: 'Voie Soigneur', rightName: 'Voie DPS', role: 'Soin / DPS' },
  ARCHER: { leftName: 'Voie Précision', rightName: 'Voie Rafale', role: 'DPS Distance' },
  ASSASSIN: { leftName: 'Voie Ombre', rightName: 'Voie Poison', role: 'DPS Mêlée' }
};

export const CLASS_SKILL_TREES: Record<HeroClassId, SkillNodeDef[]> = {
  GUERRIER: [
    // Voie Gauche : TANK
    { id: 'w_taunt', tree: 'class', path: 'left', name: 'Cri de Défi', description: 'Provoque, étourdit et +30% résistance (5s).', tier: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 'w_taunt', name: 'Cri de Défi', shortDesc: 'Provocation + bouclier 5s', cooldown: 8, effect: 'tank_taunt', color: '#f59e0b', roleTag: 'Tank' } },
    { id: 'w_plate', tree: 'class', path: 'left', name: 'Peau de Bronze', description: '+16 PV max, +3 Armure / rang.', tier: 2, minLevel: 3, maxRank: 3, requires: 'w_taunt', bonusPerRank: { maxHp: 16, armor: 3 } },
    { id: 'w_wall', tree: 'class', path: 'left', name: 'Mur de Bouclier', description: '-60% dégâts subis pendant 4,5s.', tier: 3, minLevel: 10, maxRank: 1, requires: 'w_plate',
      unlocksActive: { id: 'w_wall', name: 'Mur de Bouclier', shortDesc: '-60% dégâts subis (4,5s)', cooldown: 13, effect: 'tank_shield_wall', color: '#fbbf24', roleTag: 'Tank' } },
    { id: 'w_bastion', tree: 'class', path: 'left', name: 'Bastion Vivant', description: '+24 PV max, -4% dégâts subis / rang.', tier: 4, minLevel: 20, maxRank: 3, requires: 'w_wall', bonusPerRank: { maxHp: 24, damageReduction: 0.04 } },
    { id: 'w_fortress', tree: 'class', path: 'left', name: 'Forteresse', description: 'Rend 35% PV et -50% dégâts (6s).', tier: 5, minLevel: 30, maxRank: 1, requires: 'w_bastion',
      unlocksActive: { id: 'w_fortress', name: 'Forteresse', shortDesc: '+35% PV + barrière 6s', cooldown: 18, effect: 'tank_fortress', color: '#fde047', roleTag: 'Tank' } },

    // Voie Droite : DPS
    { id: 'w_brutal', tree: 'class', path: 'right', name: 'Frappe Brutale', description: 'Coup de lance puissant (x2,1 ATK).', tier: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 'w_brutal', name: 'Frappe Brutale', shortDesc: 'Estoc lourd x2,1 ATK', cooldown: 6, effect: 'war_brutal', color: '#ef4444', roleTag: 'DPS' } },
    { id: 'w_spear', tree: 'class', path: 'right', name: 'Maîtrise Lance', description: '+4 Attaque, +3% critique / rang.', tier: 2, minLevel: 3, maxRank: 3, requires: 'w_brutal', bonusPerRank: { attack: 4, critChance: 0.03 } },
    { id: 'w_whirl', tree: 'class', path: 'right', name: 'Tourbillon d’Airain', description: 'Frappe circulaire x2,5 ATK.', tier: 3, minLevel: 10, maxRank: 1, requires: 'w_spear',
      unlocksActive: { id: 'w_whirl', name: 'Tourbillon', shortDesc: 'Zone x2,5 ATK', cooldown: 9, effect: 'war_whirlwind', color: '#f97316', roleTag: 'DPS' } },
    { id: 'w_fury', tree: 'class', path: 'right', name: 'Fureur de Sparte', description: '+6 Attaque, +5% critique / rang.', tier: 4, minLevel: 20, maxRank: 3, requires: 'w_whirl', bonusPerRank: { attack: 6, critChance: 0.05 } },
    { id: 'w_exec', tree: 'class', path: 'right', name: 'Coup d’Achille', description: 'Exécution massive x3,8 ATK.', tier: 5, minLevel: 30, maxRank: 1, requires: 'w_fury',
      unlocksActive: { id: 'w_exec', name: 'Coup d’Achille', shortDesc: 'Frappe x3,8 ATK', cooldown: 15, effect: 'war_execute', color: '#dc2626', roleTag: 'DPS' } }
  ],
  MAGE: [
    // Voie Gauche : SOIGNEUR
    { id: 'm_heal', tree: 'class', path: 'left', name: 'Lumière de Soin', description: 'Restaure 30% PV dans une aura.', tier: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 'm_heal', name: 'Lumière de Soin', shortDesc: 'Soin +30% PV', cooldown: 8, effect: 'heal_light', color: '#4ade80', roleTag: 'Soin' } },
    { id: 'm_mend', tree: 'class', path: 'left', name: 'Souffle d’Ambroisie', description: '+15% soins, +12 PV max / rang.', tier: 2, minLevel: 3, maxRank: 3, requires: 'm_heal', bonusPerRank: { healPowerPct: 0.15, maxHp: 12 } },
    { id: 'm_sanctuary', tree: 'class', path: 'left', name: 'Sanctuaire', description: 'Cercle sacré soignant sur 5s.', tier: 3, minLevel: 10, maxRank: 1, requires: 'm_mend',
      unlocksActive: { id: 'm_sanctuary', name: 'Sanctuaire', shortDesc: 'Soin continu 5s', cooldown: 14, effect: 'heal_sanctuary', color: '#34d399', roleTag: 'Soin' } },
    { id: 'm_blessing', tree: 'class', path: 'left', name: 'Don d’Asclépios', description: '+18% soins, -4% dégâts subis / rang.', tier: 4, minLevel: 20, maxRank: 3, requires: 'm_sanctuary', bonusPerRank: { healPowerPct: 0.18, damageReduction: 0.04 } },
    { id: 'm_grace', tree: 'class', path: 'left', name: 'Grâce Immortelle', description: 'Grand soin +65% PV + bouclier 5s.', tier: 5, minLevel: 30, maxRank: 1, requires: 'm_blessing',
      unlocksActive: { id: 'm_grace', name: 'Grâce Immortelle', shortDesc: '+65% PV + bouclier', cooldown: 20, effect: 'heal_revive_grace', color: '#86efac', roleTag: 'Soin' } },

    // Voie Droite : DPS
    { id: 'm_bolt', tree: 'class', path: 'right', name: 'Éclair d’Or', description: 'Orbe rapide perçant (x2,0 ATK).', tier: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 'm_bolt', name: 'Éclair d’Or', shortDesc: 'Orbe perçant x2,0 ATK', cooldown: 5.5, effect: 'mage_bolt', color: '#facc15', roleTag: 'DPS' } },
    { id: 'm_fire', tree: 'class', path: 'right', name: 'Feu de Prométhée', description: '+5 Attaque, +4% critique / rang.', tier: 2, minLevel: 3, maxRank: 3, requires: 'm_bolt', bonusPerRank: { attack: 5, critChance: 0.04 } },
    { id: 'm_meteor', tree: 'class', path: 'right', name: 'Météore Solaire', description: 'Explosion de zone x2,8 ATK.', tier: 3, minLevel: 10, maxRank: 1, requires: 'm_fire',
      unlocksActive: { id: 'm_meteor', name: 'Météore', shortDesc: 'Explosion x2,8 ATK', cooldown: 10, effect: 'mage_meteor', color: '#f97316', roleTag: 'DPS' } },
    { id: 'm_arcana', tree: 'class', path: 'right', name: 'Maîtrise Arcanique', description: '+15% dégâts pouvoir, -8% recharge / rang.', tier: 4, minLevel: 20, maxRank: 3, requires: 'm_meteor', bonusPerRank: { specialDamagePct: 0.15, specialCooldownPct: 0.08 } },
    { id: 'm_cata', tree: 'class', path: 'right', name: 'Cataclysme Céleste', description: 'Déflagration radiale x3,8 ATK.', tier: 5, minLevel: 30, maxRank: 1, requires: 'm_arcana',
      unlocksActive: { id: 'm_cata', name: 'Cataclysme', shortDesc: 'Zone massive x3,8 ATK', cooldown: 16, effect: 'mage_cataclysm', color: '#fb923c', roleTag: 'DPS' } }
  ],
  ARCHER: [
    // Voie Gauche : PRECISION
    { id: 'a_mark', tree: 'class', path: 'left', name: 'Tir Perçant', description: 'Flèche critique traversant les cibles.', tier: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 'a_mark', name: 'Tir Perçant', shortDesc: 'Flèche critique perçante', cooldown: 7, effect: 'dps_piercing_mark', color: '#7dd3fc', roleTag: 'DPS' } },
    { id: 'a_keen', tree: 'class', path: 'left', name: 'Œil de Faucon', description: '+6% critique, +3 Attaque / rang.', tier: 2, minLevel: 3, maxRank: 3, requires: 'a_mark', bonusPerRank: { critChance: 0.06, attack: 3 } },
    { id: 'a_hmark', tree: 'class', path: 'left', name: 'Flèche Solaire', description: 'Tir rapide x2,6 ATK + vitesse.', tier: 3, minLevel: 10, maxRank: 1, requires: 'a_keen',
      unlocksActive: { id: 'a_hmark', name: 'Flèche Solaire', shortDesc: 'Tir x2,6 ATK + vitesse', cooldown: 9, effect: 'dps_hunter_mark', color: '#facc15', roleTag: 'DPS' } },
    { id: 'a_lethal', tree: 'class', path: 'left', name: 'Pointes Mortelles', description: '+6 Attaque, +5% critique / rang.', tier: 4, minLevel: 20, maxRank: 3, requires: 'a_hmark', bonusPerRank: { attack: 6, critChance: 0.05 } },
    { id: 'a_apollo', tree: 'class', path: 'left', name: 'Trait d’Apollon', description: 'Rayon perçant x4,0 ATK.', tier: 5, minLevel: 30, maxRank: 1, requires: 'a_lethal',
      unlocksActive: { id: 'a_apollo', name: 'Trait d’Apollon', shortDesc: 'Rayon x4,0 ATK', cooldown: 15, effect: 'dps_apollo_arrow', color: '#fde047', roleTag: 'DPS' } },

    // Voie Droite : RAFALE
    { id: 'a_rain', tree: 'class', path: 'right', name: 'Volée de Flèches', description: 'Éventail de 5 flèches perçantes.', tier: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 'a_rain', name: 'Volée', shortDesc: '5 flèches perçantes', cooldown: 6.5, effect: 'dps_arrow_rain', color: '#38bdf8', roleTag: 'DPS' } },
    { id: 'a_wind', tree: 'class', path: 'right', name: 'Pas du Zéphyr', description: '+5% vitesse, -10% esquive / rang.', tier: 2, minLevel: 3, maxRank: 3, requires: 'a_rain', bonusPerRank: { speedPct: 0.05, dashCooldownPct: 0.1 } },
    { id: 'a_exp', tree: 'class', path: 'right', name: 'Tir Explosif', description: 'Salve de 3 flèches explosives.', tier: 3, minLevel: 10, maxRank: 1, requires: 'a_wind',
      unlocksActive: { id: 'a_exp', name: 'Tir Explosif', shortDesc: '3 flèches explosives', cooldown: 9.5, effect: 'dps_explosive', color: '#f97316', roleTag: 'DPS' } },
    { id: 'a_quiver', tree: 'class', path: 'right', name: 'Carquois d’Airain', description: '+5 Attaque, +4 PV/kill / rang.', tier: 4, minLevel: 20, maxRank: 3, requires: 'a_exp', bonusPerRank: { attack: 5, lifeOnKill: 4 } },
    { id: 'a_storm', tree: 'class', path: 'right', name: 'Tempête d’Artémis', description: '12 flèches circulaires perçantes.', tier: 5, minLevel: 30, maxRank: 1, requires: 'a_quiver',
      unlocksActive: { id: 'a_storm', name: 'Tempête Artémis', shortDesc: '12 flèches circulaires', cooldown: 14, effect: 'dps_artemis_storm', color: '#bae6fd', roleTag: 'DPS' } }
  ],
  ASSASSIN: [
    // Voie Gauche : OMBRE
    { id: 's_step', tree: 'class', path: 'left', name: 'Foulée d’Ombre', description: 'Ruée éclair + frappe critique.', tier: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 's_step', name: 'Foulée d’Ombre', shortDesc: 'Ruée + coup critique', cooldown: 6, effect: 'dps_shadow_step', color: '#c084fc', roleTag: 'DPS' } },
    { id: 's_edge', tree: 'class', path: 'left', name: 'Lames Affûtées', description: '+5 Attaque, +5% critique / rang.', tier: 2, minLevel: 3, maxRank: 3, requires: 's_step', bonusPerRank: { attack: 5, critChance: 0.05 } },
    { id: 's_back', tree: 'class', path: 'left', name: 'Attaque Sournoise', description: 'Double frappe critique x2,6 ATK.', tier: 3, minLevel: 10, maxRank: 1, requires: 's_edge',
      unlocksActive: { id: 's_back', name: 'Sournoise', shortDesc: 'Double frappe x2,6 ATK', cooldown: 8.5, effect: 'dps_backstab', color: '#a855f7', roleTag: 'DPS' } },
    { id: 's_ambush', tree: 'class', path: 'left', name: 'Coup Fatal', description: '+7 Attaque, +5% critique / rang.', tier: 4, minLevel: 20, maxRank: 3, requires: 's_back', bonusPerRank: { attack: 7, critChance: 0.05 } },
    { id: 's_execute', tree: 'class', path: 'left', name: 'Exécution du Styx', description: 'Burst x3,8 ATK + reset esquive.', tier: 5, minLevel: 30, maxRank: 1, requires: 's_ambush',
      unlocksActive: { id: 's_execute', name: 'Exécution', shortDesc: 'Burst x3,8 + esquive', cooldown: 15, effect: 'dps_styx_execute', color: '#e879f9', roleTag: 'DPS' } },

    // Voie Droite : POISON
    { id: 's_vblade', tree: 'class', path: 'right', name: 'Lames Venimeuses', description: 'Jet de 3 dagues empoisonnées.', tier: 1, minLevel: 1, maxRank: 1,
      unlocksActive: { id: 's_vblade', name: 'Dagues Venin', shortDesc: '3 dagues empoisonnées', cooldown: 6.5, effect: 'dps_venom_blades', color: '#4ade80', roleTag: 'DPS' } },
    { id: 's_agile', tree: 'class', path: 'right', name: 'Pas Fantôme', description: '+6% vitesse, -10% esquive / rang.', tier: 2, minLevel: 3, maxRank: 3, requires: 's_vblade', bonusPerRank: { speedPct: 0.06, dashCooldownPct: 0.1 } },
    { id: 's_spin', tree: 'class', path: 'right', name: 'Tourbillon Toxique', description: 'Zone de dagues x2,4 ATK.', tier: 3, minLevel: 10, maxRank: 1, requires: 's_agile',
      unlocksActive: { id: 's_spin', name: 'Tourbillon', shortDesc: 'Zone dagues x2,4 ATK', cooldown: 9, effect: 'dps_venom_spin', color: '#22c55e', roleTag: 'DPS' } },
    { id: 's_siphon', tree: 'class', path: 'right', name: 'Siphon Sanguinaire', description: '+7 PV/kill, +4 Attaque / rang.', tier: 4, minLevel: 20, maxRank: 3, requires: 's_spin', bonusPerRank: { lifeOnKill: 7, attack: 4 } },
    { id: 's_swarm', tree: 'class', path: 'right', name: 'Nuée de Vipères', description: '10 dagues toxiques circulaires.', tier: 5, minLevel: 30, maxRank: 1, requires: 's_siphon',
      unlocksActive: { id: 's_swarm', name: 'Nuée Vipères', shortDesc: '10 dagues circulaires', cooldown: 14, effect: 'dps_viper_swarm', color: '#86efac', roleTag: 'DPS' } }
  ]
};

function makeGodTree(
  cfg: {
    l1: [string, string, string, SkillBonus];
    l2: [string, string, string, SkillBonus];
    act1: ActiveSkillDef;
    l4: [string, string, string, SkillBonus];
    r1: [string, string, string, SkillBonus];
    r2: [string, string, string, SkillBonus];
    r3: [string, string, string, SkillBonus];
    act2: ActiveSkillDef;
  }
): SkillNodeDef[] {
  return [
    // Voie Gauche : Offensive Divine
    { id: cfg.l1[0], tree: 'god', path: 'left', name: cfg.l1[1], description: cfg.l1[2], tier: 1, minLevel: 1, maxRank: 3, bonusPerRank: cfg.l1[3] },
    { id: cfg.l2[0], tree: 'god', path: 'left', name: cfg.l2[1], description: cfg.l2[2], tier: 2, minLevel: 4, maxRank: 3, requires: cfg.l1[0], bonusPerRank: cfg.l2[3] },
    { id: cfg.act1.id, tree: 'god', path: 'left', name: cfg.act1.name, description: cfg.act1.shortDesc, tier: 3, minLevel: 12, maxRank: 1, requires: cfg.l2[0], unlocksActive: cfg.act1 },
    { id: cfg.l4[0], tree: 'god', path: 'left', name: cfg.l4[1], description: cfg.l4[2], tier: 4, minLevel: 22, maxRank: 3, requires: cfg.act1.id, bonusPerRank: cfg.l4[3] },

    // Voie Droite : Soutien / Maitrise Divine
    { id: cfg.r1[0], tree: 'god', path: 'right', name: cfg.r1[1], description: cfg.r1[2], tier: 1, minLevel: 1, maxRank: 3, bonusPerRank: cfg.r1[3] },
    { id: cfg.r2[0], tree: 'god', path: 'right', name: cfg.r2[1], description: cfg.r2[2], tier: 2, minLevel: 4, maxRank: 3, requires: cfg.r1[0], bonusPerRank: cfg.r2[3] },
    { id: cfg.r3[0], tree: 'god', path: 'right', name: cfg.r3[1], description: cfg.r3[2], tier: 3, minLevel: 12, maxRank: 3, requires: cfg.r2[0], bonusPerRank: cfg.r3[3] },
    { id: cfg.act2.id, tree: 'god', path: 'right', name: cfg.act2.name, description: cfg.act2.shortDesc, tier: 5, minLevel: 28, maxRank: 1, requires: cfg.r3[0], unlocksActive: cfg.act2 }
  ];
}

export const GOD_SKILL_TREES: Record<GodAffinity, SkillNodeDef[]> = {
  ZEUS: makeGodTree({
    l1: ['zeus_spark', 'Arc Électrique', '+4 Attaque / rang.', { attack: 4 }],
    l2: ['zeus_crit', 'Éclair Fulgurant', '+6% critique / rang.', { critChance: 0.06 }],
    act1: { id: 'zeus_chain', name: 'Chaîne d’Éclairs', shortDesc: 'Foudroie et étourdit autour de vous.', cooldown: 10, effect: 'divine_zeus_chain', color: '#facc15', roleTag: 'Divin' },
    l4: ['zeus_wrath', 'Fureur du Ciel', '+18% dégâts pouvoir divin / rang.', { specialDamagePct: 0.18 }],
    r1: ['zeus_swift', 'Pas de Foudre', '+5% vitesse, -8% esquive / rang.', { speedPct: 0.05, dashCooldownPct: 0.08 }],
    r2: ['zeus_storm', 'Ciel d’Orage', '-10% recharge pouvoir / rang.', { specialCooldownPct: 0.1 }],
    r3: ['zeus_aura', 'Conducteur Divin', '+5 Attaque, +4% vitesse / rang.', { attack: 5, speedPct: 0.04 }],
    act2: { id: 'zeus_tempest', name: 'Tempête de l’Olympe', shortDesc: 'Orage x3,2 ATK + étourdissement.', cooldown: 16, effect: 'divine_zeus_tempest', color: '#fde047', roleTag: 'Divin' }
  }),
  POSEIDON: makeGodTree({
    l1: ['pos_tide', 'Force du Ressac', '+4 Attaque, -8% pouvoir / rang.', { attack: 4, specialCooldownPct: 0.08 }],
    l2: ['pos_tsunami', 'Fureur d’Égée', '+16% dégâts pouvoir / rang.', { specialDamagePct: 0.16 }],
    act1: { id: 'pos_geyser', name: 'Geyser Protecteur', shortDesc: 'Soigne 22% PV + bouclier 4s.', cooldown: 11, effect: 'divine_pos_geyser', color: '#38bdf8', roleTag: 'Divin' },
    l4: ['pos_abyss', 'Force Abyssale', '+6 Attaque, +16 PV / rang.', { attack: 6, maxHp: 16 }],
    r1: ['pos_vitality', 'Sang des Marées', '+18 PV max / rang.', { maxHp: 18 }],
    r2: ['pos_shell', 'Carapace Marine', '-5% dégâts subis, +3 Armure / rang.', { damageReduction: 0.05, armor: 3 }],
    r3: ['pos_regen', 'Source Profonde', '+15% potions, +12% soins / rang.', { potionHealPct: 0.15, healPowerPct: 0.12 }],
    act2: { id: 'pos_maelstrom', name: 'Maelström', shortDesc: 'Vague x3,0 ATK + soin 25% PV.', cooldown: 16, effect: 'divine_pos_maelstrom', color: '#0ea5e9', roleTag: 'Divin' }
  }),
  HADES: makeGodTree({
    l1: ['had_blade', 'Lame du Styx', '+4 Attaque, +4% critique / rang.', { attack: 4, critChance: 0.04 }],
    l2: ['had_curse', 'Malédiction', '+15% dégâts pouvoir / rang.', { specialDamagePct: 0.15 }],
    act1: { id: 'had_pact', name: 'Pacte du Styx', shortDesc: 'Draine les ennemis + vol de vie.', cooldown: 10, effect: 'divine_had_pact', color: '#a855f7', roleTag: 'Divin' },
    l4: ['had_reap', 'Moisson', '+7 PV/kill, +5 Attaque / rang.', { lifeOnKill: 7, attack: 5 }],
    r1: ['had_drain', 'Soif des Enfers', '+5 PV par élimination / rang.', { lifeOnKill: 5 }],
    r2: ['had_veil', 'Voile Spectral', '-10% esquive, +4% vitesse / rang.', { dashCooldownPct: 0.1, speedPct: 0.04 }],
    r3: ['had_wraith', 'Linceul Funeste', '-5% dégâts subis, +5% critique / rang.', { damageReduction: 0.05, critChance: 0.05 }],
    act2: { id: 'had_legion', name: 'Légion des Ombres', shortDesc: 'Onde x3,2 ATK + grand vol de vie.', cooldown: 16, effect: 'divine_had_legion', color: '#c084fc', roleTag: 'Divin' }
  }),
  ATHENA: makeGodTree({
    l1: ['ath_tactics', 'Frappe Tactique', '+4 Attaque, +4% critique / rang.', { attack: 4, critChance: 0.04 }],
    l2: ['ath_judgment', 'Jugement', '+16% dégâts pouvoir / rang.', { specialDamagePct: 0.16 }],
    act1: { id: 'ath_aegis_act', name: 'Égide Collective', shortDesc: 'Bouclier -55% (5s) + soin 20%.', cooldown: 12, effect: 'divine_ath_aegis', color: '#60a5fa', roleTag: 'Divin' },
    l4: ['ath_wisdom', 'Stratège', '+16% soins, +5 Attaque / rang.', { healPowerPct: 0.16, attack: 5 }],
    r1: ['ath_aegis', 'Rempart d’Égide', '+14 PV max, -4% dégâts / rang.', { maxHp: 14, damageReduction: 0.04 }],
    r2: ['ath_reflex', 'Réflexes', '-10% esquive, -8% pouvoir / rang.', { dashCooldownPct: 0.1, specialCooldownPct: 0.08 }],
    r3: ['ath_mastery', 'Discipline', '+14% potions, +4 Armure / rang.', { potionHealPct: 0.14, armor: 4 }],
    act2: { id: 'ath_spear', name: 'Lance de Pallas', shortDesc: 'Onde x3,1 ATK + étourdissement.', cooldown: 16, effect: 'divine_ath_spear', color: '#93c5fd', roleTag: 'Divin' }
  }),
  ARES: makeGodTree({
    l1: ['ares_fury', 'Fureur Martiale', '+5 Attaque / rang.', { attack: 5 }],
    l2: ['ares_blood', 'Sang Bouillant', '+6% critique / rang.', { critChance: 0.06 }],
    act1: { id: 'ares_warcry', name: 'Cri de Guerre', shortDesc: 'Onde x2,4 ATK + vitesse 5s.', cooldown: 10, effect: 'divine_ares_warcry', color: '#ef4444', roleTag: 'Divin' },
    l4: ['ares_brutal', 'Carnage', '+7 Attaque, +5% critique / rang.', { attack: 7, critChance: 0.05 }],
    r1: ['ares_charge', 'Assaut', '+4% vitesse, +4 PV/kill / rang.', { speedPct: 0.04, lifeOnKill: 4 }],
    r2: ['ares_iron', 'Corps de Fer', '+18 PV max, +3 Armure / rang.', { maxHp: 18, armor: 3 }],
    r3: ['ares_cleave', 'Frappe Sismique', '+16% dégâts pouvoir / rang.', { specialDamagePct: 0.16 }],
    act2: { id: 'ares_rampage', name: 'Cataclysme d’Arès', shortDesc: 'Explosion x3,8 ATK.', cooldown: 16, effect: 'divine_ares_rampage', color: '#f87171', roleTag: 'Divin' }
  }),
  APOLLO: makeGodTree({
    l1: ['apo_aim', 'Œil de Delphes', '+5% critique / rang.', { critChance: 0.05 }],
    l2: ['apo_sun', 'Rayon d’Or', '+4 Attaque, -8% pouvoir / rang.', { attack: 4, specialCooldownPct: 0.08 }],
    act1: { id: 'apo_hymn', name: 'Chant de Delphes', shortDesc: 'Soin 28% PV + brûlure zone.', cooldown: 11, effect: 'divine_apo_hymn', color: '#fbbf24', roleTag: 'Divin' },
    l4: ['apo_solar', 'Flamme d’Hélios', '+18% dégâts pouvoir, +5 ATK / rang.', { specialDamagePct: 0.18, attack: 5 }],
    r1: ['apo_warmth', 'Chaleur Solaire', '+14 PV max, +15% soins / rang.', { maxHp: 14, healPowerPct: 0.15 }],
    r2: ['apo_grace', 'Grâce Solaire', '+5% vitesse, -10% esquive / rang.', { speedPct: 0.05, dashCooldownPct: 0.1 }],
    r3: ['apo_clarity', 'Bénédiction', '+16% potions, +14 PV max / rang.', { potionHealPct: 0.16, maxHp: 14 }],
    act2: { id: 'apo_nova', name: 'Supernova', shortDesc: 'Éruption x3,2 ATK + soin 30%.', cooldown: 16, effect: 'divine_apo_nova', color: '#fef08a', roleTag: 'Divin' }
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
    attack: 0, maxHp: 0, armor: 0, speedPct: 0, critChance: 0,
    damageReduction: 0, lifeOnKill: 0, healPowerPct: 0,
    specialDamagePct: 0, specialCooldownPct: 0, dashCooldownPct: 0, potionHealPct: 0
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
