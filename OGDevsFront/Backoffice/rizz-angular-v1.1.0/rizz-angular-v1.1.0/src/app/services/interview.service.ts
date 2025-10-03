import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { JobOffer } from './job-offre.service';
import { Candidate } from '../core/models/candidate.model';
import { CandidateActivity } from '../core/models/candidate-activity.model';

export interface Interview {
  idInterview?: number;
  name: string;
  description: string;
  interviewDate: string;
  interviewType: 'EMBAUCHE' | 'ANNUEL';
  jobOffer?: { id: number; title: string };
  candidate?: { id: number; firstName: string; lastName: string; email: string };
}

@Injectable({
  providedIn: 'root',
})
export class InterviewService {
  private apiUrl = 'http://localhost:8089/interviews';
  private jobOfferUrl = 'http://localhost:8089/api/job-offers';
  private candidateUrl = 'http://localhost:8089/api/candidates';
  private googleCalendarApiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return from(this.checkAuthentication()).pipe(
      switchMap((token) => of(new HttpHeaders().set('Authorization', `Bearer ${token}`))),
      catchError((err) => throwError(() => new Error('Erreur lors de la récupération du token')))
    );
  }

  private async checkAuthentication(): Promise<string> {
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    if (!isLoggedIn) throw new Error('Utilisateur non authentifié');
    const token = await this.keycloakService.getToken();
    if (!token) throw new Error('Aucun token disponible');
    return token;
  }

  getAllInterviews(): Observable<Interview[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Interview[]>(this.apiUrl, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la récupération des entretiens')))
    );
  }

  getInterviewById(id: number): Observable<Interview> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Interview>(`${this.apiUrl}/${id}`, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la récupération de l’entretien')))
    );
  }

  createInterview(interview: Interview): Observable<Interview> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.post<Interview>(this.apiUrl, interview, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la création de l’entretien')))
    );
  }

  updateInterview(id: number, interview: Interview): Observable<Interview> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.put<Interview>(`${this.apiUrl}/${id}`, interview, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la mise à jour de l’entretien')))
    );
  }

  deleteInterview(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la suppression de l’entretien')))
    );
  }

  getAllJobOffers(): Observable<JobOffer[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<JobOffer[]>(this.jobOfferUrl, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la récupération des offres')))
    );
  }

  getCandidatesByJobOffer(jobOfferId: number): Observable<Candidate[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Candidate[]>(`${this.candidateUrl}?jobOfferId=${jobOfferId}`, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la récupération des candidats')))
    );
  }

  getAvailableSlots(startDate: string): Observable<string[]> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.get<string[]>(`${this.apiUrl}/available-slots?startDate=${startDate}`, { headers })
      ),
      catchError((err) => throwError(() => new Error('Erreur lors de la récupération des créneaux disponibles')))
    );
  }

  getCandidateActivities(candidateId: number): Observable<CandidateActivity[]> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.get<CandidateActivity[]>(`${this.candidateUrl}/${candidateId}/activities`, { headers })
      ),
      catchError((err) => throwError(() => new Error('Erreur lors de la récupération des activités du candidat')))
    );
  }

  addToGoogleCalendar(interview: Interview, accessToken: string): Observable<any> {
    const event = {
      summary: interview.name,
      description: interview.description,
      start: {
        dateTime: interview.interviewDate,
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: new Date(new Date(interview.interviewDate).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: 'Europe/Paris',
      },
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.googleCalendarApiUrl, event, { headers }).pipe(
      catchError((err) => {
        console.error('Erreur brute Google Calendar API:', err);
        return throwError(() => new Error('Erreur lors de l’ajout à Google Calendar : ' + (err.message || err.statusText || 'Erreur inconnue')));
      })
    );
  }
}
