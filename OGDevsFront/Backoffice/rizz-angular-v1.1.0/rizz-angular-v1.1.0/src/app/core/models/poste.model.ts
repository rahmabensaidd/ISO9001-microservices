export interface UserRepresentation {
  id: string;
  username: string;
  email: string;
  enabled?: boolean;
  firstName?: string;
  lastName?: string;
  name: string;
  status: string;
  role: string;
  last_active: string;
  image: string;
}

export interface Poste {
  id?: number;
  mission: string;
  salaire: number;
  operations?: any[];
  userEntity?: UserRepresentation; // Ajouté pour stocker l'utilisateur assigné
}
