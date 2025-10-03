// training.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from, throwError } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

export interface Training {
  trainingId?: number;
  trainingName: string;
  scheduledDate: string; // Compatible avec LocalDate (yyyy-MM-dd) du backend
  duration: number;
  completionRate: number;
}

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  private apiUrl = 'http://localhost:8089/trainings'; // Correspond au backend
  private googleCalendarApiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return from(Promise.resolve(this.keycloakService.isLoggedIn())).pipe(
      switchMap((isLoggedIn) => {
        if (!isLoggedIn) throw new Error('Utilisateur non authentifié');
        return from(this.keycloakService.getToken()).pipe(
          switchMap((token) => {
            if (!token) throw new Error('No token available');
            return of(new HttpHeaders().set('Authorization', `Bearer ${token}`));
          })
        );
      }),
      catchError((err) => throwError(() => err instanceof Error ? err : new Error('Erreur d’authentification')))
    );
  }

  getAllTrainings(): Observable<Training[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Training[]>(this.apiUrl, { headers })),
      tap((trainings) => console.log('Trainings récupérés du backend :', trainings)), // Debugging
      catchError((err) => throwError(() => new Error('Erreur lors de la récupération des formations')))
    );
  }

  createTraining(training: Training): Observable<Training> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.post<Training>(this.apiUrl, training, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la création de la formation')))
    );
  }

  updateTraining(id: number, training: Training): Observable<Training> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.put<Training>(`${this.apiUrl}/${id}`, training, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la mise à jour de la formation')))
    );
  }

  deleteTraining(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la suppression de la formation')))
    );
  }

  addToGoogleCalendar(training: Training, accessToken: string): Observable<any> {
    // Convertir LocalDate (yyyy-MM-dd) en format ISO 8601 avec heure par défaut si nécessaire
    let startDateTime = training.scheduledDate;
    if (startDateTime.length <= 10) { // Si c'est juste yyyy-MM-dd
      startDateTime = `${startDateTime}T09:00:00`; // Ajouter une heure par défaut
    }

    const event = {
      summary: training.trainingName,
      start: {
        dateTime: startDateTime,
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: new Date(new Date(startDateTime).getTime() + training.duration * 60 * 60 * 1000).toISOString(),
        timeZone: 'Europe/Paris',
      },
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.googleCalendarApiUrl, event, { headers }).pipe(
      tap(() => console.log('Événement envoyé à Google Calendar :', event)), // Debugging
      catchError((err) => {
        console.error('Erreur Google Calendar :', err);
        return throwError(() => new Error('Erreur lors de l’ajout à Google Calendar : ' + err.message));
      })
    );
  }
}
