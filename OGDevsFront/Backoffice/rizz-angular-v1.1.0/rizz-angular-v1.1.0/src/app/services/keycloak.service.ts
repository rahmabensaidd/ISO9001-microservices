import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UserRepresentation } from '@core/models/user.model';

export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private _keycloak: Keycloak | undefined;
  private _profile: UserProfile | undefined;
  private apiUrl = 'http://localhost:8080/admin/realms/test'; // Base URL Keycloak Admin REST

  constructor(private http: HttpClient) {}

  get keycloak(): Keycloak {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: 'http://localhost:8080',
        realm: 'test',
        clientId: 'angularid'
      });
    }
    return this._keycloak;
  }

  get profile(): UserProfile | undefined {
    return this._profile;
  }

  async init(): Promise<boolean> {
    const authenticated = await this.keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
    });

    if (authenticated) {
      this._profile = (await this.keycloak.loadUserProfile()) as UserProfile;
      this._profile.token = this.keycloak.token || '';
    }
    return authenticated;
  }

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: 'http://localhost:4200' });
  }

  getAllUsers(): Observable<UserRepresentation[]> {
    const token = this.keycloak.token; // Get the Keycloak token

    if (!token) {
      console.error('User not authenticated!');
      return of([]); // Return an empty array if no token
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<UserRepresentation[]>(`${this.apiUrl}/users`, { headers });
  }

  isAuthenticated(): boolean {
    return !!this.keycloak.token;
  }
}
