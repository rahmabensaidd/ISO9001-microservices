import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import {Candidate} from "@core/models/candidate.model";

export interface JobOffer {
  id?: number;
  title: string;
  description: string;
  location: string;
  requirements: string;
  contractType: 'CDI' | 'CDD' | 'CVP' | 'FREELANCE' | 'INTERIM';
  salary: number;
  skillsAndExpertise: string;
  workType: 'PRESENTIAL' | 'REMOTE' | 'HYBRID';
  candidates?: Candidate[];
  companyLogo?: string;
}
@Injectable({
  providedIn: 'root',
})
export class JobOfferService {
  private apiUrl = 'http://localhost:8089/api/job-offers';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  // Méthode privée pour les headers avec authentification
  private getHeaders(): Observable<HttpHeaders> {
    return from(Promise.resolve(this.keycloakService.isLoggedIn())).pipe(
      switchMap((isLoggedIn) => {
        console.log('Utilisateur connecté ?', isLoggedIn);
        if (!isLoggedIn) {
          throw new Error('Utilisateur non authentifié');
        }
        return from(this.keycloakService.getToken()).pipe(
          switchMap((token) => {
            console.log('Token récupéré :', token ? 'Oui' : 'Non');
            if (!token) {
              throw new Error('No token available');
            }
            return new Observable<HttpHeaders>((observer) => {
              observer.next(
                new HttpHeaders({
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                })
              );
              observer.complete();
            });
          })
        );
      }),
      catchError((err) => {
        console.error('Erreur lors de la récupération du token', err);
        return throwError(() => err instanceof Error ? err : new Error('Erreur d’authentification'));
      })
    );
  }

  // Méthode publique pour récupérer les offres sans authentification
  getAllJobOffersPublic(): Observable<JobOffer[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get<JobOffer[]>(this.apiUrl, { headers }).pipe(
      tap((response) => console.log('Réponse de getAllJobOffersPublic :', response)),
      catchError((err) => {
        console.error('Erreur dans getAllJobOffersPublic :', err);
        return throwError(() => new Error('Erreur lors de la récupération des offres publiques'));
      })
    );
  }

  // Méthode authentifiée pour récupérer les offres (pour les utilisateurs connectés)
  getAllJobOffers(): Observable<JobOffer[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        console.log('Headers envoyés pour GET /api/job-offers :', headers);
        return this.http.get<JobOffer[]>(this.apiUrl, { headers }).pipe(
          tap((response) => console.log('Réponse de getAllJobOffers :', response)),
          catchError((err) => {
            console.error('Erreur dans le pipeline de getAllJobOffers :', err);
            return throwError(() => new Error('Erreur lors de la récupération des offres'));
          })
        );
      }),
      catchError((err) => {
        console.error('Détails de l’erreur HTTP pour getAllJobOffers :', err);
        return throwError(() => new Error('Erreur lors de la récupération des offres'));
      })
    );
  }

  // Les autres méthodes restent inchangées
  getJobOfferById(id: number): Observable<JobOffer> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<JobOffer>(`${this.apiUrl}/${id}`, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la récupération de l’offre')))
    );
  }

  createJobOffer(jobOffer: JobOffer): Observable<JobOffer> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        console.log('Données envoyées pour création offre :', jobOffer);
        return this.http.post<JobOffer>(this.apiUrl, jobOffer, { headers });
      }),
      catchError((err) => throwError(() => new Error('Erreur lors de la création de l’offre')))
    );
  }

  updateJobOffer(id: number, jobOffer: JobOffer): Observable<JobOffer> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        console.log('Données envoyées pour mise à jour offre :', jobOffer);
        return this.http.put<JobOffer>(`${this.apiUrl}/${id}`, jobOffer, { headers });
      }),
      catchError((err) => throwError(() => new Error('Erreur lors de la mise à jour de l’offre')))
    );
  }

  deleteJobOffer(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })),
      catchError((err) => throwError(() => new Error('Erreur lors de la suppression de l’offre')))
    );
  }
}

export class JobOffreService {
}
