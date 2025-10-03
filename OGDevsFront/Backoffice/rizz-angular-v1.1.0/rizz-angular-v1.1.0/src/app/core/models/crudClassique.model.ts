export enum Axe {
  STRATEGIC = "STRATEGIC",
  OPERATIONAL = "OPERATIONAL",
  FINANCIAL = "FINANCIAL",
  QUALITY = "QUALITY",
  QUALITY_MANAGEMENT_01 = "QUALITY_MANAGEMENT_01",
}

export enum TypeData {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT",
}

export interface WorkFlow {
  id?: number
  name: string
  processes?: Process[]
  workflowData?: string
}

export interface Process {
  id?: number
  procName: string
  creationDate?: string
  modifDate?: string
  finishDate?: string
  description?: string
  pilote?: UserEntity
  operations?: Operation[]
  objectives?: Objective[]
  workflow?: { id: number }
}

export interface ProcessDTO {
  id?: number
  procName: string
  creationDate?: string
  modifDate?: string
  finishDate?: string
  description?: string
  piloteName?: string
}

export interface Operation {
  id?: number
  operationName: string
  operationDescription?: string
  creationDate?: string
  finishDate?: string
  process?: { id: number }
  tasks?: Task[]
  userEntities?: UserEntity[]
}

export interface OperationDTO {
  id?: number
  operationName: string
  operationDescription?: string
  creationDate?: string
  finishDate?: string
  processId?: number
  processName?: string
  taskNames?: string[]
  assignedUsers?: string[]
}

export interface Objective {
  idObjective?: number
  title: string
  axe: Axe
  process?: { id: number }
}

export interface ObjectiveDTO {
  idObjective?: number
  title: string
  axe: Axe
  processId?: number
  processName?: string
}

export interface Task {
  id?: number
  taskDescription: string
  taskName: string
  taskStatus?: string
  creationDate?: string
  finishDate?: string
  estimatedTime?: number
  priority?: string
  operation?: { id: number }
  dataSet?: Data[]
  assignedUser?: UserEntity
}

export interface TaskDTO {
  id?: number
  taskName?: string
  taskDescription: string
  taskStatus?: string
  creationDate?: string
  finishDate?: string
  operationId?: number
  operationName?: string
  assignedUserName?: string
}

export interface Indicator {
  idIndicateur?: number
  code: string
  libelle: string
  methodeCalcul?: string
  frequence: string
  unite: string
  cible?: number
  currentValue?: number
  actif: string
  objective?: { idObjective: number }
}

export interface Data {
  id?: number
  datatype: TypeData
  content: string
  registrationDate?: string
  task?: { id: number }
}

export interface Poste {
  id?: number
  mission: string
  salaire: number
  userEntity?: UserEntity
}

export interface UserEntity {
  id?: number
  username: string
  poste?: Poste
  operations?: Operation[]
}

export interface UserRepresentation {
  id: string
  username: string
  email: string
  enabled: boolean
  firstName?: string
  lastName?: string
  name: string
  status: string
  last_active: string
  role: string
  image: string
}
