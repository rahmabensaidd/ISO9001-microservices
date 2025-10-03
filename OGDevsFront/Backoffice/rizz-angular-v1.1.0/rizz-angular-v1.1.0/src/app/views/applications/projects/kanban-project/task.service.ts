import {HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, map, switchMap} from "rxjs/operators";
import {KeycloakService} from "keycloak-angular";
import {from, Observable, of, throwError} from "rxjs";
import {ProjectTaskDTO} from "@core/models/project.model";

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8089/api/projects';

  constructor(private http: HttpClient, private keycloackservice: KeycloakService) {
  }

  fetchProjectTasks(userEmail: string | undefined): Observable<ProjectTaskDTO[]> {
    if (!userEmail) {
      return throwError(() => new Error('L\'email de l\'utilisateur est requis'));
    }

    const encodedEmail = encodeURIComponent(userEmail);
    const url = `${this.apiUrl}/tasksbyuser/${encodedEmail}`;

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) =>
        this.http.get<ProjectTaskDTO[]>(url, {headers}).pipe(
          catchError((error) => {
            console.error('Erreur lors de la récupération des tâches du projet:', error);
            return of([]);  // Return an empty array in case of error
          })
        )
      )
    );
  }

  private getHeaders(): Observable<HttpHeaders> {
    return from(Promise.resolve(this.keycloackservice.isLoggedIn())).pipe(
      switchMap((isLoggedIn) => {
        if (!isLoggedIn) {
          return throwError(() => new Error('Utilisateur non authentifié'));
        }

        return from(this.keycloackservice.getToken()).pipe(
          switchMap((token) => {
            if (!token) {
              return throwError(() => new Error('No token available'));
            }
            return of(new HttpHeaders().set('Authorization', `Bearer ${token}`));
          })
        );
      }),
      catchError((err) => {
        console.error('Erreur lors de la récupération du token', err);
        return throwError(() => err instanceof Error ? err : new Error('Erreur d’authentification'));
      })
    );
  }



}
