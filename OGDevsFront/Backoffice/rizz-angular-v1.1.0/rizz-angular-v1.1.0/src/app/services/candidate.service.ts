import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { Candidate } from '@/app/core/models/candidate.model';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  private apiUrl = 'http://localhost:8089/api/candidates'

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return from(Promise.resolve(this.keycloakService.isLoggedIn())).pipe(
      switchMap((isLoggedIn) => {
        console.log('Utilisateur connecté ?', isLoggedIn)
        if (isLoggedIn) {
          return from(this.keycloakService.getToken()).pipe(
            switchMap((token) => {
              console.log('Token récupéré :', token ? 'Oui' : 'Non')
              if (!token) {
                throw new Error('No token available')
              }
              return new Observable<HttpHeaders>((observer) => {
                observer.next(
                  new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  })
                )
                observer.complete()
              })
            })
          )
        } else {
          return new Observable<HttpHeaders>((observer) => {
            observer.next(
              new HttpHeaders({
                'Content-Type': 'application/json',
              })
            )
            observer.complete()
          })
        }
      }),
      catchError((err) => {
        console.error('Erreur lors de la récupération du token', err)
        return throwError(() =>
          err instanceof Error ? err : new Error('Erreur d’authentification')
        )
      })
    )
  }

  createCandidate(candidate: Candidate): Observable<Candidate> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        console.log('Données envoyées pour création candidat :', candidate)
        return this.http.post<Candidate>(this.apiUrl, candidate, { headers })
      }),
      catchError((err) =>
        throwError(() => new Error('Erreur lors de la création du candidat'))
      )
    )
  }

  assignCandidateToJobOffer(
    candidateId: number,
    jobOfferId: number | undefined
  ): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        console.log(
          `Assigning candidate ${candidateId} to job offer ${jobOfferId}`
        )
        return this.http.post<void>(
          `${this.apiUrl}/${candidateId}/assign-job-offer/${jobOfferId}`,
          null,
          { headers }
        )
      }),
      catchError((err) =>
        throwError(() => new Error('Erreur lors de l’affectation du candidat'))
      )
    )
  }

  getAllCandidates(): Observable<Candidate[]> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.get<Candidate[]>(this.apiUrl, { headers })
      ),
      tap((response) => console.log('Réponse de getAllCandidates :', response)),
      catchError((err) =>
        throwError(
          () => new Error('Erreur lors de la récupération des candidats')
        )
      )
    )
  }

  deleteCandidate(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })
      ),
      catchError((err) =>
        throwError(() => new Error('Erreur lors de la suppression du candidat'))
      )
    )
  }

  acceptCandidate(candidateId: number): Observable<Candidate> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const body = {
          status: 'Accepted',
          acceptDate: new Date().toISOString(),
        }
        console.log(
          `Envoi de la requête POST pour accepter le candidat ${candidateId} avec body :`,
          body
        )
        return this.http
          .post<Candidate>(`${this.apiUrl}/${candidateId}/accept`, body, {
            headers,
          })
          .pipe(
            tap((response) =>
              console.log(
                `Réponse pour acceptCandidate ${candidateId} :`,
                response
              )
            ),
            catchError((err) => {
              console.error(
                `Erreur HTTP dans acceptCandidate pour ${candidateId} :`,
                err
              )
              return throwError(
                () =>
                  new Error(
                    `Erreur HTTP : ${err.status} - ${err.message || 'Erreur inconnue'}`
                  )
              )
            })
          )
      }),
      catchError((err) => {
        console.error('Erreur générale dans acceptCandidate :', err)
        return throwError(
          () =>
            new Error(
              'Erreur lors de l’acceptation du candidat : ' +
                (err.message || err)
            )
        )
      })
    )
  }

  getCandidatesSortedByScore(jobOfferId: number): Observable<Candidate[]> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.get<Candidate[]>(
          `${this.apiUrl}/sorted-by-score/${jobOfferId}`,
          { headers }
        )
      ),
      catchError((err) =>
        throwError(
          () => new Error('Erreur lors de la récupération des candidats triés')
        )
      )
    )
  }
}
