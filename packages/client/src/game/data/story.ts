export interface PrologueSlide {
  chapter: string;
  title: string;
  body: string;
  accent: 'storm' | 'fire' | 'ruins' | 'agora';
}

export const PROLOGUE_SLIDES: PrologueSlide[] = [
  {
    chapter: 'PROLOGUE I',
    title: 'La Fin de la Soumission',
    body: "Pendant des siècles, l'humanité a prié et sacrifié ses récoltes par peur des colères de l'Olympe. Mais à mesure que les mortels ont appris à forger, soigner et bâtir par eux-mêmes, les autels se sont vidés.",
    accent: 'ruins'
  },
  {
    chapter: 'PROLOGUE II',
    title: 'Le Châtiment des Dieux',
    body: "Jugeant cette émancipation comme une offense intolérable, Zeus décrète le grand châtiment. Tempêtes, séismes et failles enflammées déchirent les cités grecques, tandis que des bêtes mythologiques sont lâchées sur les routes.",
    accent: 'storm'
  },
  {
    chapter: 'PROLOGUE III',
    title: 'Le Murmure de Prométhée',
    body: "Enchaîné au sommet du mont Caucase pour avoir jadis offert le feu aux hommes, le Titan Prométhée profite du chaos pour éveiller une braise ancienne en vous. Seuls les Vestiges Primordiaux, scellés par les dieux, permettront de tenir tête à l'Olympe.",
    accent: 'fire'
  },
  {
    chapter: 'PROLOGUE IV',
    title: "L'Agora Brisée",
    body: "Vous reprenez connaissance sur l'île de l'Agora de l'Olympe, dernier refuge épargné par les flots en furie. Là-bas, un messager de Prométhée attend celui ou celle qui portera l'Étincelle.",
    accent: 'agora'
  }
];

export type QuestKind = 'main' | 'side';

export type QuestObjectiveType = 'talk' | 'interact' | 'kill' | 'enter_zone';

export interface QuestObjectiveDef {
  id: string;
  label: string;
  type: QuestObjectiveType;
  targetId: string;
  required: number;
}

export interface QuestReward {
  xp: number;
  gold: number;
  items?: { itemId: string; quantity: number }[];
  unlocksCodex?: string;
}

export interface QuestDef {
  id: string;
  title: string;
  kind: QuestKind;
  level: number;
  giverNpcId: string;
  turnInNpcId: string;
  prerequisiteQuestId?: string;
  summary: string;
  offerDialogue: string;
  progressDialogue: string;
  completeDialogue: string;
  objectives: QuestObjectiveDef[];
  reward: QuestReward;
}

export const QUESTS: Record<string, QuestDef> = {
  mq_1_etincelle: {
    id: 'mq_1_etincelle',
    title: "L'Étincelle dans les Cendres",
    kind: 'main',
    level: 1,
    giverNpcId: 'lycos',
    turnInNpcId: 'lycos',
    summary: "Répondez à l'appel de Prométhée et ranimez le brasero sacré au centre de l'Agora.",
    offerDialogue:
      "Tu as donc entendu le murmure du Caucase... Je suis Lycos, messager de Prométhée. Zeus a brisé nos cités sous la foudre et les séismes, mais le feu des hommes n'est pas mort. Approche-toi du Brasero de Prométhée au centre de la mosaïque et éveille ton Étincelle.",
    progressDialogue:
      "Le Brasero attend juste derrière moi, au cœur de la mosaïque. Interagis avec lui [E] pour canaliser la braise du Titan.",
    completeDialogue:
      "La flamme a répondu ! Tu portes désormais la marque de Prométhée. Les portes de l'Agora s'ouvrent devant toi, mais le monde au-delà du pont n'est plus qu'un champ de ruines.",
    objectives: [
      {
        id: 'light_brasero',
        label: "Ranimer le Brasero de Prométhée sur l'Agora",
        type: 'interact',
        targetId: 'brasero_promethee',
        required: 1
      }
    ],
    reward: {
      xp: 90,
      gold: 40,
      items: [{ itemId: 'potion_ambroisie', quantity: 2 }],
      unlocksCodex: 'codex_promethee'
    }
  },

  mq_2_terres_foudroyees: {
    id: 'mq_2_terres_foudroyees',
    title: 'Les Terres Foudroyées',
    kind: 'main',
    level: 2,
    giverNpcId: 'lycos',
    turnInNpcId: 'lycos',
    prerequisiteQuestId: 'mq_1_etincelle',
    summary: "Franchissez la porte Est vers les Plaines Foudroyées, repoussez les fléaux et inspectez la Stèle du Châtiment.",
    offerDialogue:
      "À l'est de l'Agora s'étendent les Plaines Foudroyées. Les éclairs de Zeus y ont fendu la route antique et des satyres corrompus ainsi que des harpies y rôdent. Ouvre la voie, élimine ces créatures et examine la Stèle du Châtiment pour localiser le premier sanctuaire des Titans.",
    progressDialogue:
      "Franchis la porte Est vers les Plaines Foudroyées. Repousse les satyres et les harpies, puis examine la Stèle du Châtiment gravée au nord des ruines.",
    completeDialogue:
      "Ainsi le Sanctuaire Brisé a tenu bon malgré les tremblements de terre... Prométhée y a dissimulé un écho de sa voix. Prépare ton équipement : ce qui t'attend à l'est des plaines est d'une tout autre ampleur.",
    objectives: [
      {
        id: 'kill_satyres',
        label: 'Satyres belliqueux vaincus',
        type: 'kill',
        targetId: 'satyre',
        required: 3
      },
      {
        id: 'kill_harpies',
        label: 'Harpies des tempêtes vaincues',
        type: 'kill',
        targetId: 'harpie',
        required: 2
      },
      {
        id: 'read_stele',
        label: 'Inspecter la Stèle du Châtiment',
        type: 'interact',
        targetId: 'stele_chatiment',
        required: 1
      }
    ],
    reward: {
      xp: 180,
      gold: 85,
      items: [{ itemId: 'potion_ambroisie', quantity: 2 }],
      unlocksCodex: 'codex_fleaux'
    }
  },

  mq_3_sanctuaire: {
    id: 'mq_3_sanctuaire',
    title: 'Le Seuil des Vestiges',
    kind: 'main',
    level: 4,
    giverNpcId: 'lycos',
    turnInNpcId: 'echo_promethee',
    prerequisiteQuestId: 'mq_2_terres_foudroyees',
    summary: "Pénétrez dans le Sanctuaire Brisé, écoutez l'Écho de Prométhée et arrachez le Cœur de Braise au Gardien d'Airain.",
    offerDialogue:
      "Au bout des Plaines Foudroyées se dresse le Sanctuaire Brisé, un temple antérieur à l'Olympe. Les automates d'Héphaïstos y gardent un Cœur de Braise forgé par les Titans. Rends-toi auprès de l'Écho de Prométhée dans le sanctuaire et brise le Gardien d'Airain.",
    progressDialogue:
      "Traverse les Plaines jusqu'à la porte Est pour atteindre le Sanctuaire Brisé. Le Gardien d'Airain détient le Cœur de Braise.",
    completeDialogue:
      "Mortel... tu as arraché le Cœur de Braise aux chaînes d'Héphaïstos. Par cette flamme, je trempe ton arme. Le temps est venu d'affronter le premier sceau divin au Rivage d'Égée.",
    objectives: [
      {
        id: 'enter_sanctuaire',
        label: 'Atteindre le Sanctuaire Brisé',
        type: 'enter_zone',
        targetId: 'sanctuaire',
        required: 1
      },
      {
        id: 'kill_automates',
        label: "Automates d'Héphaïstos détruits",
        type: 'kill',
        targetId: 'automate',
        required: 2
      },
      {
        id: 'kill_gardien',
        label: "Vaincre le Gardien d'Airain",
        type: 'kill',
        targetId: 'gardien_airain',
        required: 1
      }
    ],
    reward: {
      xp: 280,
      gold: 140,
      items: [
        { itemId: 'coeur_braise', quantity: 1 },
        { itemId: 'lame_promethee', quantity: 1 }
      ],
      unlocksCodex: 'codex_vestiges'
    }
  },

  mq_4_rivage_epreuve: {
    id: 'mq_4_rivage_epreuve',
    title: "L'Épreuve du Rivage Brisé",
    kind: 'main',
    level: 6,
    giverNpcId: 'echo_promethee',
    turnInNpcId: 'lycos',
    prerequisiteQuestId: 'mq_3_sanctuaire',
    summary: "Affrontez la Sentinelle de Poséidon sur le Rivage d'Égée en activant les 3 Stèles de Prométhée pour briser son bouclier divin.",
    offerDialogue:
      "Au-delà du portail oriental s'ouvre le Rivage d'Égée, battu par la colère de Poséidon. Sa Sentinelle y protège le premier Vestige Primordial sous un bouclier divin invulnérable. Grimpe les plateformes de marbre pour activer les trois Stèles de Prométhée : elles feront tomber sa garde. Reviens ensuite voir Lycos à l'Agora.",
    progressDialogue:
      "Sur le Rivage d'Égée (vue de profil), saute sur les plateformes pour activer les 3 Stèles de Prométhée, puis terrasse la Sentinelle de Poséidon.",
    completeDialogue:
      "Incroyable... Le Vestige d'Égée brille entre tes mains ! La garde de Poséidon a fléchi devant un mortel. Grâce à cette relique, la Voie des Reliques s'ouvre : bientôt, les donjons du Labyrinthe, de l'Hydre et du Caucase tomberont à leur tour.",
    objectives: [
      {
        id: 'activate_steles',
        label: 'Activer les Stèles de Prométhée (Rivage)',
        type: 'interact',
        targetId: 'stele_rivage',
        required: 3
      },
      {
        id: 'kill_sentinel',
        label: 'Terrasser la Sentinelle de Poséidon',
        type: 'kill',
        targetId: 'sentinelle_poseidon',
        required: 1
      }
    ],
    reward: {
      xp: 450,
      gold: 250,
      items: [
        { itemId: 'vestige_egee', quantity: 1 },
        { itemId: 'nectar_divin', quantity: 2 }
      ],
      unlocksCodex: 'codex_egee'
    }
  },

  sq_bronze_ruines: {
    id: 'sq_bronze_ruines',
    title: 'Le Bronze des Ruines',
    kind: 'side',
    level: 1,
    giverNpcId: 'damon',
    turnInNpcId: 'damon',
    summary: "Récupérez 3 Fragments de bronze dans les Plaines Foudroyées pour permettre à Damon de forger un bouclier d'hoplite.",
    offerDialogue:
      "Le séisme a fissuré mon enclume et mes stocks de bronze ont sombré dans la mer. Si tu vas dans les Plaines Foudroyées, ramasse 3 Fragments de bronze parmi les décombres. Je t'en forgerai un véritable Bouclier d'hoplite.",
    progressDialogue:
      "Il me faut encore des Fragments de bronze. Tu les repéreras à leur éclat métallique dans les Plaines Foudroyées, à l'est de l'Agora.",
    completeDialogue:
      "Du bronze de première trempe ! Tiens, prends ce Bouclier d'hoplite. Avec ça au bras, même un centaure y réfléchira à deux fois avant de charger.",
    objectives: [
      {
        id: 'collect_bronze',
        label: 'Fragments de bronze récupérés',
        type: 'interact',
        targetId: 'fragment_bronze',
        required: 3
      }
    ],
    reward: {
      xp: 120,
      gold: 75,
      items: [{ itemId: 'bouclier_hoplite', quantity: 1 }]
    }
  },

  sq_ambroisie_perdue: {
    id: 'sq_ambroisie_perdue',
    title: "L'Ambroisie Perdue",
    kind: 'side',
    level: 1,
    giverNpcId: 'cassandre',
    turnInNpcId: 'cassandre',
    summary: "Cueillez 3 Herbes d'ambroisie près des oliviers des Plaines Foudroyées pour les blessés du refuge.",
    offerDialogue:
      "Les survivants arrivent blessés des cités voisines, et nos fioles s'épuisent. L'orage divin a fait pousser des Herbes d'ambroisie au pied des vieux oliviers dans les Plaines Foudroyées. Rapporte-m'en trois et je partagerai mes potions avec toi.",
    progressDialogue:
      "Cherche les pousses dorées d'Herbe d'ambroisie près des oliviers dans les Plaines Foudroyées. Si tu es blessé, reviens me voir : je te soignerai.",
    completeDialogue:
      "Merci, héros ! Ces herbes sauveront bien des vies sur l'Agora. Prends ces potions d'ambroisie et ce nectar divin pour tes prochains combats.",
    objectives: [
      {
        id: 'collect_herbs',
        label: "Herbes d'ambroisie cueillies",
        type: 'interact',
        targetId: 'herbe_ambroisie',
        required: 3
      }
    ],
    reward: {
      xp: 100,
      gold: 55,
      items: [
        { itemId: 'potion_ambroisie', quantity: 3 },
        { itemId: 'nectar_divin', quantity: 1 }
      ]
    }
  },

  sq_portes_chaos: {
    id: 'sq_portes_chaos',
    title: 'Aux Portes du Chaos',
    kind: 'side',
    level: 3,
    giverNpcId: 'theron',
    turnInNpcId: 'theron',
    prerequisiteQuestId: 'mq_1_etincelle',
    summary: "Abattez le Centaure corrompu qui bloque l'approche du pont à l'est des Plaines Foudroyées.",
    offerDialogue:
      "Tu vois la fumée à l'horizon ? Un Centaure corrompu par la rage d'Arès s'est installé devant la passe est des Plaines Foudroyées. Il écrase chaque éclaireur qui tente de passer vers le sanctuaire. Abats cette bête et l'Agora pourra respirer.",
    progressDialogue:
      "Le Centaure corrompu patrouille à l'est des Plaines Foudroyées. Méfie-toi de sa charge : utilise ton esquive [Shift] quand il prépare son attaque.",
    completeDialogue:
      "Par tous les Titans, tu l'as vraiment mis à terre ! La route vers le Sanctuaire Brisé est libre. Garde cet Éclat de foudre, je l'ai arraché d'un cratère après l'orage.",
    objectives: [
      {
        id: 'kill_centaure',
        label: 'Centaure corrompu vaincu',
        type: 'kill',
        targetId: 'centaure',
        required: 1
      }
    ],
    reward: {
      xp: 170,
      gold: 110,
      items: [{ itemId: 'eclat_foudre', quantity: 1 }]
    }
  }
};

export const QUEST_ORDER = [
  'mq_1_etincelle',
  'mq_2_terres_foudroyees',
  'mq_3_sanctuaire',
  'mq_4_rivage_epreuve',
  'sq_bronze_ruines',
  'sq_ambroisie_perdue',
  'sq_portes_chaos'
];

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  look: 'messenger' | 'smith' | 'healer' | 'guard' | 'prometheus';
  idleDialogue: string;
  canHeal?: boolean;
  sellsPotion?: boolean;
}

export const NPCS: Record<string, NpcDef> = {
  lycos: {
    id: 'lycos',
    name: 'Lycos',
    role: 'Messager de Prométhée',
    look: 'messenger',
    idleDialogue:
      "Le ciel gronde encore sur l'Olympe, mais l'Étincelle grandit en chaque mortel qui refuse de plier le genou."
  },
  damon: {
    id: 'damon',
    name: 'Damon',
    role: "Forgeron d'Airain",
    look: 'smith',
    idleDialogue:
      "Les dieux ont leurs éclairs, nous avons le bronze et la ténacité. Reviens me voir quand tu ramèneras de nouveaux minerais des donjons."
  },
  cassandre: {
    id: 'cassandre',
    name: 'Cassandre',
    role: 'Guérisseuse des Survivants',
    look: 'healer',
    idleDialogue:
      "Repose-toi un instant sur l'Agora. Tant que je tiendrai debout, aucun défenseur du refuge ne repartira blessé.",
    canHeal: true,
    sellsPotion: true
  },
  theron: {
    id: 'theron',
    name: 'Théron',
    role: 'Guetteur du Rempart',
    look: 'guard',
    idleDialogue:
      "Les Plaines Foudroyées sont plus calmes depuis ton passage, mais d'autres créatures descendent des montagnes chaque nuit."
  },
  echo_promethee: {
    id: 'echo_promethee',
    name: 'Écho de Prométhée',
    role: 'Voix du Titan Enchaîné',
    look: 'prometheus',
    idleDialogue:
      "Ma prison au sommet du Caucase tremble déjà... Continue de rassembler les Vestiges Primordiaux, porteur de flamme."
  }
};

export interface CodexEntry {
  id: string;
  title: string;
  chapter: string;
  text: string;
  unlockedByDefault?: boolean;
}

export const CODEX_ENTRIES: CodexEntry[] = [
  {
    id: 'codex_soumission',
    title: 'La Fin de la Soumission',
    chapter: 'Chronique I',
    unlockedByDefault: true,
    text: "Lorsque les cités mortelles apprirent à soigner, forger et naviguer sans implorer l'Olympe, Zeus y vit un acte d'Hybris. Le ciel se fendit, les mers montèrent et les monstres anciens furent relâchés pour ramener l'humanité dans l'obscurité."
  },
  {
    id: 'codex_agora',
    title: "L'Agora de l'Olympe",
    chapter: 'Lieu — Refuge',
    unlockedByDefault: true,
    text: "Bâtie sur un îlot de marbre ancien entouré par la mer Égée, l'Agora est le dernier refuge épargné par les grandes vagues. Survivants, forgerons et éclaireurs s'y rassemblent autour du Brasero de Prométhée."
  },
  {
    id: 'codex_promethee',
    title: 'Le Murmure de Prométhée',
    chapter: 'Chronique II',
    text: "Enchaîné au Caucase, le Titan qui donna le feu aux hommes chuchote à travers les braises. Le feu offert jadis n'était qu'une étincelle : la vraie force capable de briser l'armure divine dort dans les Vestiges Primordiaux."
  },
  {
    id: 'codex_fleaux',
    title: 'Les Fléaux des Plaines',
    chapter: 'Bestiaire — Early Game',
    text: "Satyres belliqueux, harpies des tempêtes et centaures pris de folie par Arès ont envahi les routes entre l'Agora et les anciens temples. Chaque cratère des Plaines Foudroyées porte encore la trace d'un éclair olympien."
  },
  {
    id: 'codex_vestiges',
    title: 'Le Sanctuaire Brisé',
    chapter: 'Chronique III',
    text: "Avant le règne de Zeus, les Titans avaient érigé des sanctuaires sur les failles telluriques. Héphaïstos y a posté ses automates d'airain pour empêcher les humains d'y récupérer le feu primordial."
  },
  {
    id: 'codex_egee',
    title: "L'Épreuve du Rivage d'Égée",
    chapter: 'Chronique IV — Mid Game',
    text: "Les avatars divins s'enveloppent d'une égide impossible à percer par la force brute. Seules les Stèles de Prométhée dressées dans leurs arènes permettent d'affaiblir leur bouclier et de rendre le combat équitable."
  }
];
