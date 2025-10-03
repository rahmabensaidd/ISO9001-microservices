import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, lastValueFrom } from 'rxjs';
import { NonConformityDTO } from '@core/models/nonconformance.model';
import { IndicatorDTO } from '@/app/services/indicator.model'; // Use the updated IndicatorDTO
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class NonConformityService {
  private apiUrl = 'http://localhost:8089';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private async getHeaders(isMultipart: boolean = false): Promise<HttpHeaders | undefined> {
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

      let headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      if (!isMultipart) {
        headers = headers.set('Content-Type', 'application/json');
      }

      return headers;
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return undefined;
    }
  }

  async fixNonConformity(
    id: number,
    actionTaken: string,
    fixDate: string,
    isEffective: boolean,
    attachments?: File[]
  ): Promise<Observable<NonConformityDTO>> {
    const headers = await this.getHeaders(true);
    if (!headers) return throwError(() => new Error('User not authenticated'));

    const formData = new FormData();
    formData.append('actionTaken', actionTaken);
    formData.append('fixDate', fixDate);
    formData.append('isEffective', isEffective.toString());
    if (attachments && attachments.length > 0) {
      attachments.forEach((file, index) => {
        formData.append('attachments', file, file.name);
      });
    }

    return this.http
      .put<NonConformityDTO>(`${this.apiUrl}/api/nonconformities/${id}/fix`, formData, { headers })
      .pipe(
        catchError((error) => {
          const errorMessage = error.statusText
            ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
            : `Error: ${error.message || 'Unknown error'}`;
          console.error('❌ Error fixing non-conformity:', errorMessage);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  async deleteNonConformance(id: number): Promise<Observable<void>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.delete<void>(`${this.apiUrl}/api/nonconformities/${id}`, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error deleting non-conformance:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async getNonConformitiesByIndicator(indicatorId: number): Promise<NonConformityDTO[]> {
    const headers = await this.getHeaders();
    if (!headers) {
      console.error('❌ User not authenticated');
      throw new Error('User not authenticated');
    }

    return lastValueFrom(
      this.http
        .get<NonConformityDTO[]>(`${this.apiUrl}/api/indicators/${indicatorId}/nonconformities`, { headers })
        .pipe(
          catchError((error) => {
            const errorMessage = error.statusText
              ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
              : `Error: ${error.message || 'Unknown error'}`;
            console.error('❌ Error fetching non-conformities by indicator:', errorMessage);
            return throwError(() => new Error(errorMessage));
          })
        )
    );
  }

  async getIndicatorsForProcess(processId: number): Promise<IndicatorDTO[]> {
    const headers = await this.getHeaders();
    if (!headers) {
      console.error('❌ User not authenticated');
      throw new Error('User not authenticated');
    }

    return this.http
      .get<IndicatorDTO[]>(`${this.apiUrl}/api/indicators/process/${processId}`, { headers })
      .pipe(
        catchError((error) => {
          console.error('❌ Error fetching indicators:', error);
          return throwError(() => new Error(error.message || 'Failed to fetch indicators'));
        })
      )
      .toPromise()
      .then((data) => data ?? []);
  }

  async updateIndicatorValue(indicatorCode: string): Promise<void> {
    const headers = await this.getHeaders();
    if (!headers) {
      console.error('❌ User not authenticated');
      throw new Error('User not authenticated');
    }

    return lastValueFrom(
      this.http
        .post<void>(`${this.apiUrl}/api/indicators/update/${indicatorCode}`, {}, { headers })
        .pipe(
          catchError((error) => {
            const errorMessage = error.statusText
              ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
              : `Error: ${error.message || 'Unknown error'}`;
            console.error('❌ Error updating indicator:', errorMessage);
            return throwError(() => new Error(errorMessage));
          })
        )
    );
  }

  async getAllNonConformities(): Promise<Observable<NonConformityDTO[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<NonConformityDTO[]>(`${this.apiUrl}/api/nonconformities`, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error fetching non-conformities:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async addNonConformance(nonConformance: NonConformityDTO, isByIndicator: boolean = false): Promise<Observable<NonConformityDTO>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    const endpoint = isByIndicator ? 'by-indicator' : 'manual';
    return this.http.post<NonConformityDTO>(`${this.apiUrl}/api/nonconformities/${endpoint}`, nonConformance, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error adding non-conformance:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
