export enum TypeDocument {
  FICHE_PAIE = 'FICHE_PAIE',
  FICHE_POSTE = 'FICHE_POSTE',
  CONTRAT = 'CONTRAT',
  PROCESSUS_REALISATION = 'PROCESSUS_REALISATION'
}

export const TypeDocumentLabels: { [key in TypeDocument]: string } = {
  [TypeDocument.FICHE_PAIE]: 'Fiche de Paie',
  [TypeDocument.FICHE_POSTE]: 'Fiche de Poste',
  [TypeDocument.CONTRAT]: 'Contrat',
  [TypeDocument.PROCESSUS_REALISATION]: 'Processus de Réalisation Technique'
};

export interface Post {
  poste: string;
  codeProcessus: string;
  exigenceDePoste: string;
  taches: string[];
}

export const DefaultPosts: Record<string, Post> = {
  INGENIEUR: {
    poste: 'Ingénieur',
    codeProcessus: 'PCS-RET-01',
    exigenceDePoste: 'Exécuter les ordres des travaux lancés',
    taches: ['Comprendre l’architecture des projets', 'Créer des micro-services']
  },
  DEVELOPPEUR: {
    poste: 'Développeur',
    codeProcessus: 'PCS-RET-01',
    exigenceDePoste: 'Exécuter les ordres des travaux lancés',
    taches: ['Comprendre l’architecture des projets']
  },
  RESPONSABLE_TECHNIQUE: {
    poste: 'Responsable de Réalisation Technique',
    codeProcessus: 'PCS-RET-01',
    exigenceDePoste: 'Déterminer les besoins du client',
    taches: ['Mettre le projet dans son contexte']
  }
};

export interface Document {
  id?: number;
  title: string;
  content: string;
  dateCreation?: string;
  createdBy?: { id: string };
  type: TypeDocument;
  signature?: string;

  // Fiche de Paie
  employe?: string;
  poste?: string;
  salaireBrut?: number;
  salaireNet?: number;
  periode?: string;
  cotisationsSociales?: number;

  // Fiche de Poste
  objectifs?: string;
  polyvalence?: string;
  experiences?: string;
  formation?: string;
  exigenceDePoste?: string;
  taches?: string[];
  codeProcessus?: string;

  // Contrat
  typeContrat?: string; // Ex: CDD, CDI, Stage
  dateDebut?: string;
  dateFin?: string;
  salaire?: number;

  // Processus de Réalisation Technique
  designation?: string;
  axe?: string;
  pilote?: string;
  operations?: string[];
  predecesseurs?: string[];
  successeurs?: string[];

}
export interface Version {
  id: number;
  numeroVersion: number;
  dateCreation: string;
  contenu: string;
  modifiePar: string;
  modificationDetails: string;
  statut: StatutDocument;
}
export enum StatutDocument {
  ACTIF = 'ACTIF',
  ARCHIVE = 'ARCHIVE'}
