export interface PrologueSlide {
  chapter: string;
  title: string;
  body: string;
  accent: 'storm' | 'fire' | 'ruins' | 'agora';
}

export const PROLOGUE_SLIDES: PrologueSlide[] = [
  {
    chapter: 'I',
    title: 'La Fin de la Soumission',
    body: "Pendant des siècles, les mortels ont prié par crainte de l'Olympe. Mais à force de forger, soigner et bâtir par eux-mêmes, les temples se sont peu à peu vidés.",
    accent: 'ruins'
  },
  {
    chapter: 'II',
    title: 'Le Châtiment de Zeus',
    body: "Pour punir cet affront, Zeus a déchaîné la foudre, les séismes et les flots sur la Grèce. Des bêtes mythologiques rôdent désormais sur toutes les routes.",
    accent: 'storm'
  },
  {
    chapter: 'III',
    title: 'Le Murmure de Prométhée',
    body: "Enchaîné au Caucase, Prométhée souffle une braise ancienne à ceux qui refusent de plier. Seuls les Vestiges Primordiaux permettront de tenir tête aux dieux.",
    accent: 'fire'
  },
  {
    chapter: 'IV',
    title: "La Cité de l'Agora",
    body: "Vous accostez à la cité-refuge de l'Agora, dernier port libre de la mer Égée. Sur la place centrale, un messager du Titan attend celui qui portera l'Étincelle.",
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
    summary: "Ranimez le Brasero de Prométhée au centre de l'Agora.",
    offerDialogue:
      "Tu as entendu le murmure du Caucase, toi aussi ? Je suis Lycos. Les dieux brûlent nos cités, mais le feu de Prométhée n'est pas éteint. Touche le Brasero juste derrière moi pour éveiller ton Étincelle.",
    progressDialogue:
      "Le Brasero de Prométhée se trouve au centre de la mosaïque. Approche-toi pour ranimer la braise.",
    completeDialogue:
      "La flamme te reconnaît. Les portes de la cité s'ouvrent devant toi, mais passe d'abord au marché ou chez Cassandre si tu veux faire le plein avant de sortir.",
    objectives: [
      {
        id: 'light_brasero',
        label: 'Ranimer le Brasero de Prométhée',
        type: 'interact',
        targetId: 'brasero_promethee',
        required: 1
      }
    ],
    reward: {
      xp: 90,
      gold: 45,
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
    summary: 'Traversez la porte Est, repoussez les bêtes des Plaines et inspectez la Stèle du Châtiment.',
    offerDialogue:
      "Au-delà du rempart est, la route antique n'est plus que cratères et ruines. Des satyres et des harpies coupent tout passage. Nettoie le chemin et lis la Stèle du Châtiment au nord des plaines : elle mène à un vieux sanctuaire des Titans.",
    progressDialogue:
      "Sors par le rempart Est vers les Plaines Foudroyées. Repousse les bêtes et inspecte la Stèle du Châtiment.",
    completeDialogue:
      "Le Sanctuaire Brisé a donc résisté aux séismes. Prométhée y a laissé un écho de sa voix. Forge-toi une bonne arme chez Damon avant d'y entrer.",
    objectives: [
      { id: 'kill_satyres', label: 'Satyres vaincus', type: 'kill', targetId: 'satyre', required: 3 },
      { id: 'kill_harpies', label: 'Harpies vaincues', type: 'kill', targetId: 'harpie', required: 2 },
      { id: 'read_stele', label: 'Stèle du Châtiment', type: 'interact', targetId: 'stele_chatiment', required: 1 }
    ],
    reward: {
      xp: 185,
      gold: 95,
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
    summary: "Entrez dans le Sanctuaire Brisé et prenez le Cœur de Braise au Gardien d'Airain.",
    offerDialogue:
      "À l'extrémité est des plaines s'ouvre le Sanctuaire Brisé. Héphaïstos y a posté ses automates d'airain pour garder un Cœur de Braise. Trouve l'Écho de Prométhée à l'entrée du temple et abats le Gardien d'Airain.",
    progressDialogue:
      "Le Sanctuaire Brisé se trouve à l'est des Plaines Foudroyées. Détruis les automates et le Gardien d'Airain.",
    completeDialogue:
      "Le Cœur de Braise répond enfin à une main mortelle. Je trempe ton arme dans sa flamme. Le rivage d'Égée t'attend désormais au bout du sanctuaire.",
    objectives: [
      { id: 'enter_sanctuaire', label: 'Entrer dans le Sanctuaire Brisé', type: 'enter_zone', targetId: 'sanctuaire', required: 1 },
      { id: 'kill_automates', label: 'Automates détruits', type: 'kill', targetId: 'automate', required: 2 },
      { id: 'kill_gardien', label: "Vaincre le Gardien d'Airain", type: 'kill', targetId: 'gardien_airain', required: 1 }
    ],
    reward: {
      xp: 280,
      gold: 150,
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
    summary: "Activez les 3 Stèles de Prométhée sur le Rivage d'Égée et terrassez la Sentinelle de Poséidon.",
    offerDialogue:
      "Derrière la porte orientale gronde le Rivage d'Égée. La Sentinelle de Poséidon s'abrite sous un bouclier divin qu'aucune lame ordinaire ne perce. Gravis les plateformes de marbre pour allumer les trois Stèles de Prométhée, brise sa garde, puis rapporte le Vestige à Lycos.",
    progressDialogue:
      "Allume les 3 Stèles de Prométhée sur les plateformes du Rivage d'Égée pour faire tomber le bouclier de la Sentinelle.",
    completeDialogue:
      "Le Vestige d'Égée... Un dieu a reculé devant un mortel. La Voie des Reliques est ouverte : le Labyrinthe, l'Hydre et le Caucase tomberont à leur tour.",
    objectives: [
      { id: 'activate_steles', label: 'Stèles de Prométhée activées', type: 'interact', targetId: 'stele_rivage', required: 3 },
      { id: 'kill_sentinel', label: 'Sentinelle de Poséidon vaincue', type: 'kill', targetId: 'sentinelle_poseidon', required: 1 }
    ],
    reward: {
      xp: 450,
      gold: 260,
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
    summary: 'Ramassez 3 Fragments de bronze dans les Plaines Foudroyées pour Damon.',
    offerDialogue:
      "Mon stock de minerai a sombré avec le dernier navire. Si tu sors dans les Plaines Foudroyées, rapporte-moi 3 Fragments de bronze. Je te forgerai un bouclier solide en échange.",
    progressDialogue:
      "Tu trouveras des Fragments de bronze près des vieux murs écroulés dans les Plaines Foudroyées.",
    completeDialogue:
      "Bel alliage ! Tiens, prends ce Bouclier d'hoplite. J'ai aussi quelques pièces forgées à vendre si tu as des drachmes.",
    objectives: [
      { id: 'collect_bronze', label: 'Fragments de bronze', type: 'interact', targetId: 'fragment_bronze', required: 3 }
    ],
    reward: {
      xp: 120,
      gold: 80,
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
    summary: "Cueillez 3 Herbes d'ambroisie dans les Plaines Foudroyées.",
    offerDialogue:
      "Nos réserves s'épuisent avec l'afflux des réfugiés. Des Herbes d'ambroisie ont poussé au pied des oliviers dans les Plaines Foudroyées. Rapporte-m'en trois et je te préparerai plusieurs fioles.",
    progressDialogue:
      "Les Herbes d'ambroisie poussent près des oliviers dans les Plaines Foudroyées.",
    completeDialogue:
      "Parfait, les blessés vont pouvoir tenir. Prends ces potions et ce nectar, tu en auras besoin dehors.",
    objectives: [
      { id: 'collect_herbs', label: "Herbes d'ambroisie", type: 'interact', targetId: 'herbe_ambroisie', required: 3 }
    ],
    reward: {
      xp: 105,
      gold: 60,
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
    summary: "Abattez le Centaure corrompu qui tient la route à l'est des Plaines.",
    offerDialogue:
      "Un Centaure pris de folie barre la passe est des Plaines Foudroyées. Il charge tout ce qui bouge. Si tu parviens à le faire tomber, nos éclaireurs pourront enfin franchir le pont.",
    progressDialogue:
      "Méfie-toi de sa ruée en ligne droite : décale-toi dès qu'il baisse sa lance.",
    completeDialogue:
      "Beau travail ! La route est dégagée. Garde cet Éclat de foudre, il te servira sûrement plus qu'à moi.",
    objectives: [
      { id: 'kill_centaure', label: 'Centaure corrompu', type: 'kill', targetId: 'centaure', required: 1 }
    ],
    reward: {
      xp: 175,
      gold: 115,
      items: [{ itemId: 'eclat_foudre', quantity: 1 }]
    }
  },

  sq_ailes_tempete: {
    id: 'sq_ailes_tempete',
    title: 'Les Ailes de la Tempête',
    kind: 'side',
    level: 2,
    giverNpcId: 'iris',
    turnInNpcId: 'iris',
    summary: 'Éliminez 4 Harpies des tempêtes qui harcèlent les convois des Plaines.',
    offerDialogue:
      "Depuis la terrasse nord, je vois les harpies plonger sur tous les voyageurs qui approchent de la cité. Chasse-en quatre dans les Plaines Foudroyées et je te paierai en drachmes.",
    progressDialogue:
      "Les harpies attaquent à distance avec leurs rafales de plumes. Reste mobile.",
    completeDialogue:
      "Le ciel respire enfin au-dessus de la route est. Voici ta paie, héros.",
    objectives: [
      { id: 'kill_harpies_side', label: 'Harpies des tempêtes', type: 'kill', targetId: 'harpie', required: 4 }
    ],
    reward: {
      xp: 145,
      gold: 130,
      items: [{ itemId: 'potion_ambroisie', quantity: 2 }]
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
  'sq_ailes_tempete',
  'sq_portes_chaos'
];

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  look: 'messenger' | 'smith' | 'healer' | 'guard' | 'merchant' | 'citizen' | 'prometheus';
  idleDialogue: string;
  canHeal?: boolean;
  shopItems?: string[];
}

export const NPCS: Record<string, NpcDef> = {
  lycos: {
    id: 'lycos',
    name: 'Lycos',
    role: 'Messager de Prométhée',
    look: 'messenger',
    idleDialogue:
      "Tant que le brasero brûle sur cette place, l'Olympe sait que l'humanité n'a pas cédé."
  },
  damon: {
    id: 'damon',
    name: 'Damon',
    role: "Forgeron d'Airain",
    look: 'smith',
    idleDialogue:
      "Besoin d'une lame mieux trempée ou d'une cuirasse ? Mon enclume tourne jour et nuit.",
    shopItems: ['arme_airain', 'cuirasse_hoplite']
  },
  elena: {
    id: 'elena',
    name: 'Éléna',
    role: 'Marchande du Port',
    look: 'merchant',
    idleDialogue:
      "Mes bateaux ne naviguent plus loin depuis la colère de Poséidon, mais j'ai encore des fioles et du nectar pour les aventuriers.",
    shopItems: ['potion_ambroisie', 'nectar_divin', 'eclat_foudre']
  },
  cassandre: {
    id: 'cassandre',
    name: 'Cassandre',
    role: 'Guérisseuse',
    look: 'healer',
    idleDialogue:
      "Si tu reviens blessé des plaines, passe par le jardin. Mes soins sont gratuits pour ceux qui défendent la cité.",
    canHeal: true,
    shopItems: ['potion_ambroisie', 'nectar_divin']
  },
  theron: {
    id: 'theron',
    name: 'Théron',
    role: 'Guetteur du Rempart',
    look: 'guard',
    idleDialogue:
      "Au-delà de cette porte, les bêtes de Zeus tiennent la route. Reste sur tes gardes."
  },
  iris: {
    id: 'iris',
    name: 'Iris',
    role: 'Éclaireuse',
    look: 'guard',
    idleDialogue:
      "Je surveille l'horizon depuis le bastion nord. Les éclairs frappent encore loin à l'est."
  },
  philon: {
    id: 'philon',
    name: 'Philon',
    role: 'Ancien de Corinthe',
    look: 'citizen',
    idleDialogue:
      "Ma cité s'est effondrée en une nuit sous la foudre. Heureusement que les murailles de l'Agora ont tenu."
  },
  neree: {
    id: 'neree',
    name: 'Nérée',
    role: 'Passeur du Quai',
    look: 'citizen',
    idleDialogue:
      "Ce portail ouest mène droit au Rivage d'Égée. N'y mets pas les pieds sans l'Étincelle de Prométhée : les flots y sont déchaînés."
  },
  echo_promethee: {
    id: 'echo_promethee',
    name: 'Écho de Prométhée',
    role: 'Voix du Titan',
    look: 'prometheus',
    idleDialogue:
      "Mes chaînes sur le Caucase se fissurent déjà... Rassemble les Vestiges, mortel."
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
    text: "Lorsque les cités mortelles apprirent à soigner, forger et bâtir sans supplier l'Olympe, Zeus y vit un acte d'Hybris. Le ciel se fendit, les mers montèrent et les monstres anciens furent relâchés."
  },
  {
    id: 'codex_agora',
    title: "La Cité de l'Agora",
    chapter: 'Refuge',
    unlockedByDefault: true,
    text: "Érigée sur un promontoire de marbre bordé par la mer Égée, la cité de l'Agora accueille les survivants des cités détruites autour de son port, de son marché et du Brasero de Prométhée."
  },
  {
    id: 'codex_promethee',
    title: 'Le Murmure de Prométhée',
    chapter: 'Chronique II',
    text: "Enchaîné au Caucase, le Titan souffle à travers les braises. Le feu offert jadis n'était qu'une étincelle : la vraie force capable de briser l'armure divine dort dans les Vestiges Primordiaux."
  },
  {
    id: 'codex_fleaux',
    title: 'Les Fléaux des Plaines',
    chapter: 'Bestiaire',
    text: "Satyres, harpies des tempêtes et centaures pris de folie tiennent la route antique au-delà du rempart est. Chaque cratère porte encore l'odeur de la foudre olympienne."
  },
  {
    id: 'codex_vestiges',
    title: 'Le Sanctuaire Brisé',
    chapter: 'Chronique III',
    text: "Avant le règne de Zeus, les Titans avaient bâti des sanctuaires sur les failles telluriques. Héphaïstos y a posté ses automates d'airain pour verrouiller le feu primordial."
  },
  {
    id: 'codex_egee',
    title: "L'Épreuve du Rivage d'Égée",
    chapter: 'Chronique IV',
    text: "Les avatars divins s'abritent derrière une égide presque impénétrable. Seules les Stèles de Prométhée dressées dans leurs arènes permettent d'affaiblir leur bouclier."
  }
];
