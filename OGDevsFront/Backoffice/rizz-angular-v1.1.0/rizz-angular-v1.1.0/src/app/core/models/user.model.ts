// export interface User {
//   id: string; // String UUID to match backend
//   email: string;
//   username: string;
//   enabled: boolean;
//   roles: string[];
//   token: string;
//   name: string;
//   role: string;
//   profilePhotoPath?: string; // Optional for profile photo URL
// }
//
// export interface NewUser {
//   id?: string; // Optional for edit cases
//   username: string;
//   email: string;
//   password: string;
//   role: string; // Single role for form selection
//   roles?: string[]; // Array for backend compatibility
// }
//
// export interface UserRepresentation {
//   id: string;
//   email?: string;
//   username: string;
//   enabled: boolean;
//   roles?: string[];
// }
//
// export interface Role {
//   id: string;
//   roleName: string;
//   description?: string;
// }
// src/app/core/models/user.model.ts

// Interface for Role, matching backend Role entity and RoleRepresentation
export interface Role {
  id: string;
  roleName: string; // Matches backend Role (roleName), mapped from 'name' in RoleRepresentation
  description?: string;
}

// Interface for the raw API response from /api/users/all
export interface UserRepresentation {
  id: string;
  username: string;
  email: string;
  enabled: boolean;
  roles: string[];
}

// Interface for User objects, compatible with AuthenticationService and auth.model.ts
export interface User {
  id: string;          // Matches AuthenticationService (number)
  email: string;       // Matches AuthenticationService and UserEntity
  name?: string;       // Matches AuthenticationService
  token: string;       // Matches AuthenticationService
  role?: 'user' | 'admin'; // Matches auth.model.ts (literal union type)
  username?: string;   // Optional, for PersonalDetailComponent
  enabled?: boolean;   // Optional, for PersonalDetailComponent
  roles?: string[];    // Optional, for PersonalDetailComponent
}

// Interface for new user data (used in forms)
export interface NewUser {
  id?: string;         // String for backend
  username: string;
  email: string;
  password: string;
  roles: string[];
}
