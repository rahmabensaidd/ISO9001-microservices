import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { ProjetRequest, ProjectStatsDTO } from '@core/models/projet-request.model';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ProjetRequestService {
  private apiUrl = 'http://localhost:8089/api/projet-requests';

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  private async getHeaders(): Promise<HttpHeaders | undefined> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User not logged in, redirecting to Keycloak.");
        await this.keycloakService.login();
        return undefined;
      }
      await this.keycloakService.updateToken(30); // Refresh token if expiring within 30 seconds
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

  async createProjetRequest(projetRequest: Partial<ProjetRequest>): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.post(this.apiUrl, projetRequest, { headers, responseType: 'text' }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error creating projet request:', err);
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expirée',
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            confirmButtonColor: '#5156be'
          }).then(() => {
            this.keycloakService.logout();
          });
          return throwError(() => new Error('Session expired'));
        }
        return throwError(() => new Error(err.error || 'Échec de la création de la demande'));
      })
    );
  }

  async getProjetRequestById(id: number): Promise<Observable<ProjetRequest>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<ProjetRequest>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error fetching projet request by ID:', err);
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expirée',
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            confirmButtonColor: '#5156be'
          }).then(() => {
            this.keycloakService.logout();
          });
          return throwError(() => new Error('Session expired'));
        }
        return throwError(() => new Error('Failed to fetch project request'));
      })
    );
  }

  async getAllProjetRequests(): Promise<Observable<ProjetRequest[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<ProjetRequest[]>(`${this.apiUrl}/admin/all`, { headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error fetching all projet requests:', err);
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expirée',
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            confirmButtonColor: '#5156be'
          }).then(() => {
            this.keycloakService.logout();
          });
          return throwError(() => new Error('Session expired'));
        }
        return throwError(() => new Error('Failed to fetch all project requests'));
      })
    );
  }

  async getProjetRequestsByCurrentUser(): Promise<Observable<ProjetRequest[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<ProjetRequest[]>(`${this.apiUrl}/my-requests`, { headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error fetching user projet requests:', err);
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expirée',
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            confirmButtonColor: '#5156be'
          }).then(() => {
            this.keycloakService.logout();
          });
          return throwError(() => new Error('Session expired'));
        }
        return throwError(() => new Error('Failed to fetch project requests'));
      })
    );
  }

  async updateProjetRequest(id: number, projetRequest: Partial<ProjetRequest>): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.put(`${this.apiUrl}/${id}`, projetRequest, { headers, responseType: 'text' }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error updating projet request:', err);
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expirée',
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            confirmButtonColor: '#5156be'
          }).then(() => {
            this.keycloakService.logout();
          });
          return throwError(() => new Error('Session expired'));
        }
        return throwError(() => new Error(err.error || 'Échec de la modification de la demande'));
      })
    );
  }

  async deleteProjetRequest(id: number): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.delete(`${this.apiUrl}/${id}`, { headers, responseType: 'text' }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error deleting projet request:', err);
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expirée',
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            confirmButtonColor: '#5156be',
          }).then(() => {
            this.keycloakService.logout()
          })
          return throwError(() => new Error('Session expired'))
        }
        return throwError(
          () => new Error(err.error || 'Échec de la suppression de la demande')
        )
      })
    );
  }

  async acceptProjetRequest(id: number, email: string | undefined): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.post(`${this.apiUrl}/accept/${email}/${id}`, null, {
      headers,
      responseType: 'text'
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error accepting projet request:', err);
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expirée',
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            confirmButtonColor: '#5156be'
          }).then(() => {
            this.keycloakService.logout();
          });
          return throwError(() => new Error('Session expired'));
        }
        return throwError(() => new Error(err.error || 'Échec de l\'acceptation de la demande'));
      })
    );
  }


  async getProjectStats(): Promise<Observable<ProjectStatsDTO[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<ProjectStatsDTO[]>(`${this.apiUrl}/stats`, { headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Error fetching project stats:', err);
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expirée',
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            confirmButtonColor: '#5156be'
          }).then(() => {
            this.keycloakService.logout();
          });
          return throwError(() => new Error('Session expired'));
        }
        return throwError(() => new Error('Failed to fetch project stats'));
      })
    );
  }
}
