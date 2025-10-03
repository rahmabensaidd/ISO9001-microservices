import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { ObjectiveDTO } from '@core/models/process.model';
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8089',
};

@Injectable({
  providedIn: 'root',
})
export class ObjectiveService {
  private apiUrl = `${environment.apiUrl}/Objective`;

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private async getSecureToken(): Promise<string | null> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn('⚠️ User not logged in, redirecting to Keycloak.');
        await this.keycloakService.login();
        return null;
      }
      await this.keycloakService.updateToken(30);
      const token = await this.keycloakService.getToken();
      return token;
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return null;
    }
  }

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.getSecureToken();
    if (!token) {
      throw new Error('User not logged in or invalid token');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  async getAllObjectives(): Promise<Observable<ObjectiveDTO[]>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('User not logged in or invalid token'));
    }

    return this.http.get<ObjectiveDTO[]>(`${this.apiUrl}/getObjectives`, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error fetching objectives:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async addObjective(objective: ObjectiveDTO): Promise<Observable<ObjectiveDTO>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('User not logged in or invalid token'));
    }

    return this.http.post<ObjectiveDTO>(`${this.apiUrl}`, objective, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error adding objective:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async deleteObjective(id: number): Promise<Observable<void>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('User not logged in or invalid token'));
    }

    return this.http.delete<void>(`${this.apiUrl}/deleteObjective/${id}`, { headers }).pipe(
      catchError((error) => {
        let errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        if (error.status === 404) {
          errorMessage = `Objective with ID ${id} not found`;
        }
        console.error('❌ Error deleting objective:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
