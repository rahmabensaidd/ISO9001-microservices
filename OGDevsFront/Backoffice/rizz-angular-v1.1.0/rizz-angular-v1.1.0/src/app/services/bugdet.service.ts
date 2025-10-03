import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { BudgetRequest, BudgetResponse } from '@core/models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = 'http://localhost:8000/predict';  // Updated to the new FastAPI endpoint

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private async getHeaders(): Promise<HttpHeaders | undefined> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn('⚠️ User not logged in, redirecting to Keycloak.');
        await this.keycloakService.login();
        return undefined;
      }
      await this.keycloakService.updateToken(30);
      const token = await this.keycloakService.getToken();
      console.log('✅ Retrieved token:', token);

      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return undefined;
    }
  }

  async estimateBudget(request: BudgetRequest): Promise<Observable<BudgetResponse>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.post<BudgetResponse>(this.apiUrl, request, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.detail || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error sending budget estimation request:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
