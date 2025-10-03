export interface ProjetRequest {
  id?: number;
  email: string;
  budgetProposedByClient: number;
  desiredStartDate: string;
  desiredEndDate: string;
  heuresPrevues?: number;
  description?: string;
  statut: StatutRequestProjet;
  client?: UserEntity;
}

export enum StatutRequestProjet {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE'
}

export interface UserEntity {
  id: string;
  email: string;
  username?: string;
}

export interface ProjectStatsDTO {
  id: number;
  name: string;
  heuresPrevues: number;
  heuresRealisees: number;
  tauxIndRet02: number;
  projectType?: string; // Ajouté pour le template
  totalProjects?: number; // Ajouté pour le template
  averageBudget?: number; // Ajouté pour le template
}
