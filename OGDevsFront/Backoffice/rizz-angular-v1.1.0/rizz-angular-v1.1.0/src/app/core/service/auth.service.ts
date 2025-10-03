import { Injectable } from '@angular/core';
import { User } from '@/app/core/models/user.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private currentUser: User | null = null;

  // Getter pour accéder à la session (currentUser)
  get session(): User | null {
    return this.currentUser;
  }

  login(email: string, password: string): Observable<User> {
    if (email === 'test@example.com' && password === 'password') {
      this.currentUser = {
        id: '550e8400-e29b-41d4-a716-446655440000', // UUID valide
        email,
        name: 'John Doe',
        token: 'fake-jwt-token',
        role: 'user',
      };

      // Gestion sécurisée du stockage du jeton avec vérification null
      if (this.currentUser.token) {
        localStorage.setItem('token', this.currentUser.token);
      } else {
        console.warn('Le jeton est indéfini, non stocké dans localStorage');
      }

      // Puisque la connexion est réussie, currentUser est garanti non-null
      return of(this.currentUser);
    } else {
      throw new Error('Identifiants incorrects');
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): User | null {
    return this.currentUser;
  }
}
