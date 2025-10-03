import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

export interface SearchResult {
  entityType: string;
  id: string; // Standardized to string
  displayName: string;
  description: string;
  processName?: string;
  piloteName?: string;
  taskNames?: string[];
  assignedUsers?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private apiUrl = 'http://localhost:8089/search';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private async getSecureToken(): Promise<string | null> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User not logged in, redirecting to Keycloak.");
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

  private async getHeaders(): Promise<HttpHeaders | undefined> {
    const token = await this.getSecureToken();
    if (!token) return undefined;

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  async search(query: string): Promise<Observable<SearchResult[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    const url = `${this.apiUrl}?query=${encodeURIComponent(query)}`;
    return this.http.get<SearchResult[]>(url, { headers }).pipe(
      catchError(error => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error fetching search results:', errorMessage);
        return throwError(() => new Error('Failed to fetch search results'));
      })
    );
  }
}
