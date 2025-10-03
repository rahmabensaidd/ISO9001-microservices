import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { SurveyDTO, CreateSurveyRequest, GamificationInfo, SurveyStats, ContractClientDTO, MeetingResponseDTO, ProjectResponseDTO, TicketResponseDTO } from '@core/models/survey.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private apiUrl = 'http://localhost:8089/api/surveys';
  private contractsUrl = 'http://localhost:8089/api/contracts';
  private meetingsUrl = 'http://localhost:8089/api';
  private projectsUrl = 'http://localhost:8089/api/projects';
  private ticketsUrl = 'http://localhost:8089/api/tickets';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private async getHeaders(): Promise<HttpHeaders | undefined> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User not logged in, redirecting to Keycloak.");
        await this.keycloakService.login();
        return undefined;
      }
      await this.keycloakService.updateToken(30);
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

  async getSurveysForCurrentUser(): Promise<Observable<SurveyDTO[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<SurveyDTO[]>(`${this.apiUrl}/my-surveys`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching surveys:', err);
        return throwError(() => err);
      })
    );
  }

  async createAndSubmitSurvey(request: CreateSurveyRequest): Promise<Observable<SurveyDTO>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.post<SurveyDTO>(`${this.apiUrl}`, request, { headers }).pipe(
      catchError(err => {
        console.error('Error creating survey:', err);
        return throwError(() => err);
      })
    );
  }

  async getGamificationInfo(): Promise<Observable<GamificationInfo>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<GamificationInfo>(`${this.apiUrl}/gamification`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching gamification info:', err);
        return throwError(() => err);
      })
    );
  }

  async markSurveyAsReviewed(surveyId: number): Promise<Observable<SurveyDTO>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.put<SurveyDTO>(`${this.apiUrl}/${surveyId}/review`, {}, { headers }).pipe(
      catchError(err => {
        console.error('Error marking survey as reviewed:', err);
        return throwError(() => err);
      })
    );
  }

  async getSurveyStats(startDate?: string, endDate?: string): Promise<Observable<SurveyStats>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<SurveyStats>(`${this.apiUrl}/stats`, { headers, params }).pipe(
      catchError(err => {
        console.error('Error fetching survey stats:', err);
        return throwError(() => err);
      })
    );
  }

  async getContractsForCurrentUser(): Promise<Observable<ContractClientDTO[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<ContractClientDTO[]>(`${this.contractsUrl}/current-user`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching contracts:', err);
        return throwError(() => err);
      })
    );
  }

  async getMeetingsForCurrentUser(): Promise<Observable<MeetingResponseDTO[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<MeetingResponseDTO[]>(`${this.meetingsUrl}/current-user`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching meetings:', err);
        return throwError(() => err);
      })
    );
  }

  async getProjectsForCurrentUser(): Promise<Observable<ProjectResponseDTO[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<ProjectResponseDTO[]>(`${this.projectsUrl}/current-user`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching projects:', err);
        return throwError(() => err);
      })
    );
  }

  async getTicketsForCurrentUser(): Promise<Observable<TicketResponseDTO[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<TicketResponseDTO[]>(`${this.ticketsUrl}`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching tickets:', err);
        return throwError(() => err);
      })
    );
  }

  async getAllSurveys(): Promise<Observable<SurveyDTO[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<SurveyDTO[]>(`${this.apiUrl}/all-surveys`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching all surveys:', err);
        return throwError(() => err);
      })
    );
  }

}
