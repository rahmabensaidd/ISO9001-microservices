// src/app/core/models/Kpi.model.ts
export interface Kpi {
  idIndicateur?: number;
  code: string;
  libelle: string;
  methodeCalcul?: string;
  frequence: string; // e.g., "Mensuelle" or "Annuelle"
  unite: string;
  cible: number;
  currentValue?: number;
  actif: string; // e.g., "Oui" or "Non"
}

export interface Report {
  id?: number;
  title: string;
  content: string;
  dateCreation: string;
  createdBy: string;
  impactLevel: string;
  statut: string; // e.g., "DRAFT" or "FINAL"
  indicators?: Kpi[];
  indicatorIds?: number[];
  performanceScore?: number;
  tauxConformite?: number;
  tendances?: string;
}
