export interface Project {
  idProjet: number;
  name: string;
  description: string;
  projectType:string;
  start_Date: string;
  expected_endDate: string;
  requirements:string[];
  technologies:string[];
  responsable: UserDTO;
  phases:Phase[];
  resources:Resource[];
  client:UserDTO;
}

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  enabled: boolean;

}

export interface Phase {
  idPhase: number;
  phase_name: string;
  description: string;
  isCollapsed:boolean;
  projectOperations:ProjectOperation[];
}

export interface ProjectOperation {
  idProjectOperation?: number; // Rendu optionnel
  name?: string;               // Rendu optionnel
  description?: string;        // Rendu optionnel
  priority: string;
  deadline: string;
  status?: string;             // Rendu optionnel
  progress?: number;           // Rendu optionnel
  user?: { id: string; username: string; email: string };
  idoperation: number;
  projectTasks?: ProjectTaskDTO[];
  totalBugsForOperation?: number;
  calculatedProgress?: number;
}


export interface ProjectTaskDTO {
  id: number; // Identifiant unique de la tâche
  taskDescription: string; // Description de la tâche
  status: string; // Statut actuel de la tâche
  sectionId:string;
  bugs?:Bug[];
}

export interface Process {
  id: number;            // Correspond à l'ID du Process
  procName: string;      // Nom du processus
  creationDate: string;  // Date de création, type string car elle sera généralement renvoyée en format ISO
  modifDate: string;     // Date de modification, type string pour le même format ISO
  description: string;   // Description du processus
}
export interface Bug {
  idBug?: number;
  priority: string;
  description: string;
  source_issue: string;
  status: string;
  repportDate: string; // LocalDate → string (ISO format)
  developer?: UserDTO;

}


export interface Resource {
  resourceId?: number;
  resourceName: string;
  price: number;
  status: string;
  type: string;
  user?: UserDTO; // correspond aux userEntities au niveau du DTO côté backend
}
