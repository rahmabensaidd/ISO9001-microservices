// src/app/core/models/operation.model.ts
export interface Operation {
  id?: number;
  operationName: string;
  operationDescription?: string;
  x?: number;
  y?: number;
  process?: any; // Ajuste selon ton modèle
  tasks?: any[];
  workflow?: any;
}
