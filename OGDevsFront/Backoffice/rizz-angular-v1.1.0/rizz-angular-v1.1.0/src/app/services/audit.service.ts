import { Injectable } from '@angular/core';
import {from, Observable} from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { throwError } from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import { Audit } from '@/app/core/models/audit.model';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private apiUrl = 'http://localhost:8089';

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

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

  createAudit(audit: Audit): Observable<Audit> {
    return from(this.getHeaders()).pipe(
      switchMap((headers) => {
        if (!headers) {
          return throwError(() => new Error('User not logged in or invalid token'));
        }
        return this.http.post<Audit>(`${this.apiUrl}/audits`, audit, { headers }).pipe(
          catchError((error) => {
            const errorMessage = error.statusText
              ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
              : `Error: ${error.message || 'Unknown error'}`;
            console.error('❌ Error creating audit:', errorMessage);
            return throwError(() => new Error(errorMessage));
          })
        );
      })
    );
  }

  getAudits(): Observable<Audit[]> {
    return from(this.getHeaders()).pipe(
      switchMap((headers) => {
        if (!headers) {
          return throwError(() => new Error('User not logged in or invalid token'));
        }
        return this.http.get<Audit[]>(`${this.apiUrl}/audits`, { headers }).pipe(
          catchError((error) => {
            const errorMessage = error.statusText
              ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
              : `Error: ${error.message || 'Unknown error'}`;
            console.error('❌ Error fetching audits:', errorMessage);
            return throwError(() => new Error(errorMessage));
          })
        );
      })
    );
  }

  getAuditById(id: number): Observable<Audit> {
    return from(this.getHeaders()).pipe(
      switchMap((headers) => {
        if (!headers) {
          return throwError(() => new Error('User not logged in or invalid token'));
        }
        return this.http.get<Audit>(`${this.apiUrl}/audits/${id}`, { headers }).pipe(
          catchError((error) => {
            const errorMessage = error.statusText
              ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
              : `Error: ${error.message || 'Unknown error'}`;
            console.error('❌ Error fetching audit by ID:', errorMessage);
            return throwError(() => new Error(errorMessage));
          })
        );
      })
    );
  }

  updateAudit(id: number, audit: Audit): Observable<Audit> {
    return from(this.getHeaders()).pipe(
      switchMap((headers) => {
        if (!headers) {
          return throwError(() => new Error('User not logged in or invalid token'));
        }
        return this.http.put<Audit>(`${this.apiUrl}/audits/${id}`, audit, { headers }).pipe(
          catchError((error) => {
            const errorMessage = error.statusText
              ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
              : `Error: ${error.message || 'Unknown error'}`;
            console.error('❌ Error updating audit:', errorMessage);
            return throwError(() => new Error(errorMessage));
          })
        );
      })
    );
  }
  deleteAudit(id: number): Observable<any> {
    console.log('deleteAudit called with ID:', id);
    return from(this.getHeaders()).pipe(
      switchMap((headers) => {
        console.log('Headers received:', headers);
        if (!headers) {
          console.error('No headers, user not logged in or invalid token');
          return throwError(() => new Error('User not logged in or invalid token'));
        }
        console.log('Sending DELETE request to:', `${this.apiUrl}/audits/${id}`);
        return this.http.delete(`${this.apiUrl}/audits/${id}`, { headers }).pipe(
          catchError((error) => {
            const errorMessage = error.statusText
              ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
              : `Error: ${error.message || 'Unknown error'}`;
            console.error('❌ Error deleting audit:', errorMessage);
            return throwError(() => new Error(errorMessage));
          })
        );
      }),
      catchError((error) => {
        console.error('❌ Global error in deleteAudit:', error);
        return throwError(() => error);
      })
    );
  }
}
