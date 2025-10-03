// src/app/core/models/auth.model.ts

export interface User {
  id: number;
  email: string;
  name: string;
  token: string;
  role?: 'user' | 'admin'; // ou string si tu préfères
}
