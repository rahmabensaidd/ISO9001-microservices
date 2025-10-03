import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

export interface Evaluation {
  idEvaluation?: number;
  evalution_date: string; // Format YYYY-MM-DD
  performanceScore: number;
  comment: string;
  trainingName: string; // Utilise trainingName au lieu de trainingId
}

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private apiUrl = 'http://localhost:8089/api/evaluations';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return from(this.checkAuthentication()).pipe(
      switchMap((token) => of(new HttpHeaders().set('Authorization', `Bearer ${token}`))),
      catchError((err) => {
        console.error('Erreur d’authentification:', err);
        return throwError(() => new Error('Erreur lors de la récupération du token'));
      })
    );
  }

  private async checkAuthentication(): Promise<string> {
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    if (!isLoggedIn) throw new Error('Utilisateur non authentifié');
    const token = await this.keycloakService.getToken();
    if (!token) throw new Error('Aucun token disponible');
    return token;
  }

  getAllEvaluations(): Observable<Evaluation[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Evaluation[]>(this.apiUrl, { headers })),
      catchError((err) => {
        console.error('Erreur lors de la récupération des évaluations:', err);
        return throwError(() => new Error('Erreur lors de la récupération des évaluations'));
      })
    );
  }

  getEvaluationById(id: number): Observable<Evaluation> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Evaluation>(`${this.apiUrl}/${id}`, { headers })),
      catchError((err) => {
        console.error(`Erreur lors de la récupération de l’évaluation (ID: ${id}) :`, err);
        return throwError(() => new Error('Erreur lors de la récupération de l’évaluation'));
      })
    );
  }

  createEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        console.log('Données envoyées pour création :', evaluation); // Log pour déboguer
        return this.http.post<Evaluation>(this.apiUrl, evaluation, { headers });
      }),
      catchError((err) => {
        console.error('Erreur lors de la création de l’évaluation:', err);
        return throwError(() => new Error('Erreur lors de la création de l’évaluation'));
      })
    );
  }

  updateEvaluation(id: number, evaluation: Evaluation): Observable<Evaluation> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        console.log('Données envoyées pour mise à jour (ID: ${id}) :', evaluation); // Log pour déboguer
        return this.http.put<Evaluation>(`${this.apiUrl}/${id}`, evaluation, { headers });
      }),
      catchError((err) => {
        console.error(`Erreur lors de la mise à jour de l’évaluation (ID: ${id}) :`, err);
        return throwError(() => new Error('Erreur lors de la mise à jour de l’évaluation'));
      })
    );
  }

  deleteEvaluation(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })),
      catchError((err) => {
        console.error(`Erreur lors de la suppression de l’évaluation (ID: ${id}) :`, err);
        return throwError(() => new Error('Erreur lors de la suppression de l’évaluation'));
      })
    );
  }
}
