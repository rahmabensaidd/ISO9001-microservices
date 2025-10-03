import Data = Cropper.Data;

export interface Workflow {
  id?: number;
  name: string;
  workflowData: string;
  processes?: Process[];
  operations?: Operation[];
  tasks?: Task[];
  paperState?: string;
  paperSnapshot?: string;
}
export interface Process {
  id?: number;
  procName?: string;
  description?: string;
  creationDate?: string | null;
  modifDate?: string | null;
  finishDate?: string | null;
  pilote?: UserRepresentation | null;
  operations?: Operation[];
  objectives?: Objective[];
  workflow?: Workflow | null;
  x?: number;
  y?: number;
}

export interface Operation {
  id?: number;
  operationName?: string;
  operationDescription?: string;
  creationDate?: string | null;
  finishDate?: string | null;
  postes?: Poste[];
  userEntities?: UserRepresentation[];
  process?: { id: number } | null;
  tasks?: Task[];
  x?: number;
  y?: number;
}

export interface Task {
  id?: number;
  taskDescription?: string;
  taskStatus?: string;
  creationDate?: string | null;
  finishDate?: string | null;
  operation?: { id: number } | null;
  x?: number;
  y?: number;
  dataIds?: number[];
}

export interface Objective {
  idObjective?: number;
  title: string;
  axe: string;
  process?: Process | null;
}
export interface ObjectiveDTO {
  idObjective?: number; // Maps to Long idObjective
  title: string;
  axe: string; // Enum as string (e.g., "STRATEGIC", "OPERATIONAL")
  process?: { idProcess?: number }; // Optional, for Many-to-One
  indicators?: { idIndicateur?: number }[]; // Optional, for One-to-Many
  isoClauses?: { idClause?: number }[]; // Optional, for One-to-Many
}
export const AxeOptions = [
  'STRATEGIC',
  'OPERATIONAL',
  'FINANCIAL',
  'QUALITY',
] as const;

export type Axe = typeof AxeOptions[number];
export interface UserRepresentation {
  id: string;
  username: string;
  email?: string;
}

export interface Poste {
  id: number;
  name: string;
  mission?: string;
  salaire?: number;
}
