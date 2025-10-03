import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { Poste } from '../core/models/poste.model';

@Injectable({
  providedIn: 'root'
})
export class PosteService {
  private apiUrl = 'http://localhost:8089/postes';

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  private async getHeaders(): Promise<HttpHeaders | undefined> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User not logged in, redirecting to Keycloak.");
        await this.keycloakService.login();
        return undefined;
      }
      await this.keycloakService.updateToken(30); // Refresh token if expiring soon
      const token = await this.keycloakService.getToken();
      console.log('✅ Retrieved token:', token);
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return undefined;
    }
  }

  async createPoste(poste: Poste): Promise<Observable<Poste>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.post<Poste>(this.apiUrl, poste, { headers }).pipe(
      catchError(err => {
        console.error('Error creating poste:', err);
        return throwError(() => err);
      })
    );
  }

  async getAllPostes(): Promise<Observable<Poste[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Poste[]>(this.apiUrl, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching postes:', err);
        return throwError(() => err);
      })
    );
  }

  async getPosteById(id: number): Promise<Observable<Poste>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Poste>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching poste by ID:', err);
        return throwError(() => err);
      })
    );
  }

  async updatePoste(id: number, poste: Poste): Promise<Observable<Poste>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.put<Poste>(`${this.apiUrl}/${id}`, poste, { headers }).pipe(
      catchError(err => {
        console.error('Error updating poste:', err);
        return throwError(() => err);
      })
    );
  }

  async deletePoste(id: number): Promise<Observable<void>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    const url = `${this.apiUrl}/${id}`;
    console.log('Sending DELETE request to:', url);
    return this.http.delete<void>(url, { headers }).pipe(
      catchError(err => {
        console.error('Error deleting poste:', err);
        return throwError(() => err);
      })
    );
  }

  async assignUserToPoste(posteId: number, userId: string): Promise<Observable<Poste>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.post<Poste>(`${this.apiUrl}/${posteId}/assign-user/${userId}`, {}, { headers }).pipe(
      catchError(err => {
        console.error('Error assigning user to poste:', err);
        return throwError(() => err);
      })
    );
  }
}
