// Description des tables PostgreSQL pour Drizzle.
//
// La source de vérité reste schema.sql : c'est lui qui crée les tables,
// les contraintes et les triggers. Ce fichier sert seulement à écrire des
// requêtes typées en TypeScript. Si on modifie schema.sql, on met à jour
// ce fichier en même temps.
//
// Convention : nom en camelCase côté TypeScript, en snake_case dans la base.
import {
  boolean,
  doublePrecision,
  inet,
  integer,
  pgTable,
  pgView,
  primaryKey,
  smallint,
  text,
  timestamp
} from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------
// Référentiels
// ---------------------------------------------------------------------

export const classe = pgTable('classe', {
  id: smallint('id').primaryKey().generatedAlwaysAsIdentity(),
  code: text('code').notNull().unique(),
  nom: text('nom').notNull().unique(),
  description: text('description').notNull().default(''),
  pvBase: integer('pv_base').notNull(),
  attaqueBase: integer('attaque_base').notNull()
});

export const divinite = pgTable('divinite', {
  code: text('code').primaryKey(),
  nom: text('nom').notNull().unique(),
  titre: text('titre').notNull(),
  royaume: text('royaume').notNull(),
  bonusPassif: text('bonus_passif').notNull(),
  attaqueSpeciale: text('attaque_speciale').notNull()
});

export const zone = pgTable('zone', {
  id: smallint('id').primaryKey().generatedAlwaysAsIdentity(),
  nom: text('nom').notNull().unique(),
  royaume: text('royaume').notNull(),
  niveauMin: smallint('niveau_min').notNull().default(1)
});

export const boss = pgTable('boss', {
  code: text('code').primaryKey(),
  diviniteCode: text('divinite_code').notNull().unique().references(() => divinite.code),
  zoneId: smallint('zone_id').notNull().unique().references(() => zone.id),
  nom: text('nom').notNull(),
  titre: text('titre').notNull(),
  niveau: smallint('niveau').notNull()
});

export const objet = pgTable('objet', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  nom: text('nom').notNull().unique(),
  description: text('description').notNull().default(''),
  categorie: text('categorie').notNull(),
  rarete: text('rarete').notNull().default('commun'),
  empilable: boolean('empilable').notNull().default(false),
  prix: integer('prix').notNull().default(0)
});

// ---------------------------------------------------------------------
// Joueurs et personnages
// ---------------------------------------------------------------------

export const compte = pgTable('compte', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: text('email').notNull(),
  pseudo: text('pseudo').notNull(),
  motDePasseHash: text('mot_de_passe_hash').notNull(),
  role: text('role').notNull().default('joueur'),
  banni: boolean('banni').notNull().default(false),
  dateCreation: timestamp('date_creation', { withTimezone: true }).notNull().defaultNow()
});

export const personnage = pgTable('personnage', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  compteId: integer('compte_id').notNull().references(() => compte.id, { onDelete: 'cascade' }),
  classeId: smallint('classe_id').notNull().references(() => classe.id),
  diviniteCode: text('divinite_code').notNull().references(() => divinite.code),
  zoneId: smallint('zone_id').notNull().references(() => zone.id),
  nom: text('nom').notNull(),
  niveau: smallint('niveau').notNull().default(1),
  experience: integer('experience').notNull().default(0),
  pv: integer('pv').notNull(),
  pvMax: integer('pv_max').notNull(),
  positionX: doublePrecision('position_x').notNull().default(400),
  positionY: doublePrecision('position_y').notNull().default(300),
  modeVue: text('mode_vue').notNull().default('top-down'),
  piecesOr: integer('pieces_or').notNull().default(0),
  dateCreation: timestamp('date_creation', { withTimezone: true }).notNull().defaultNow()
});

// ---------------------------------------------------------------------
// Activité en jeu
// ---------------------------------------------------------------------

export const sessionJeu = pgTable('session_jeu', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  personnageId: integer('personnage_id').notNull().references(() => personnage.id, { onDelete: 'cascade' }),
  debut: timestamp('debut', { withTimezone: true }).notNull().defaultNow(),
  fin: timestamp('fin', { withTimezone: true }),
  adresseIp: inet('adresse_ip')
});

export const victoireBoss = pgTable('victoire_boss', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  personnageId: integer('personnage_id').notNull().references(() => personnage.id, { onDelete: 'cascade' }),
  bossCode: text('boss_code').notNull().references(() => boss.code),
  dateVictoire: timestamp('date_victoire', { withTimezone: true }).notNull().defaultNow(),
  dureeCombatS: integer('duree_combat_s').notNull()
});

export const classementSaison = pgTable('classement_saison', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  personnageId: integer('personnage_id').notNull().references(() => personnage.id, { onDelete: 'cascade' }),
  saison: smallint('saison').notNull(),
  score: integer('score').notNull().default(0)
});

// Vue calculée par PostgreSQL (le rang n'est jamais stocké).
export const vClassementSaison = pgView('v_classement_saison', {
  saison: smallint('saison').notNull(),
  rang: integer('rang').notNull(),
  personnage: text('personnage').notNull(),
  score: integer('score').notNull()
}).existing();

export const progressionQuete = pgTable(
  'progression_quete',
  {
    personnageId: integer('personnage_id').notNull().references(() => personnage.id, { onDelete: 'cascade' }),
    queteId: text('quete_id').notNull(),
    statut: text('statut').notNull().default('en_cours'),
    dateMaj: timestamp('date_maj', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [primaryKey({ columns: [table.personnageId, table.queteId] })]
);

// ---------------------------------------------------------------------
// Inventaire et échanges
// ---------------------------------------------------------------------

export const instanceObjet = pgTable('instance_objet', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  objetId: integer('objet_id').notNull().references(() => objet.id),
  proprietaireId: integer('proprietaire_id').notNull().references(() => personnage.id, { onDelete: 'cascade' }),
  quantite: integer('quantite').notNull().default(1),
  equipe: boolean('equipe').notNull().default(false)
});

export const interaction = pgTable('interaction', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  emetteurId: integer('emetteur_id').notNull().references(() => personnage.id, { onDelete: 'cascade' }),
  destinataireId: integer('destinataire_id').notNull().references(() => personnage.id, { onDelete: 'cascade' }),
  sessionId: integer('session_id').references(() => sessionJeu.id, { onDelete: 'set null' }),
  type: text('type').notNull(),
  horodatage: timestamp('horodatage', { withTimezone: true }).notNull().defaultNow()
});

export const echange = pgTable('echange', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  interactionId: integer('interaction_id').notNull().unique().references(() => interaction.id, { onDelete: 'cascade' }),
  orEmetteur: integer('or_emetteur').notNull().default(0),
  orDestinataire: integer('or_destinataire').notNull().default(0),
  statut: text('statut').notNull().default('propose')
});

export const ligneEchange = pgTable(
  'ligne_echange',
  {
    echangeId: integer('echange_id').notNull().references(() => echange.id, { onDelete: 'cascade' }),
    instanceId: integer('instance_id').notNull().references(() => instanceObjet.id),
    donneurId: integer('donneur_id').notNull().references(() => personnage.id)
  },
  (table) => [primaryKey({ columns: [table.echangeId, table.instanceId] })]
);
