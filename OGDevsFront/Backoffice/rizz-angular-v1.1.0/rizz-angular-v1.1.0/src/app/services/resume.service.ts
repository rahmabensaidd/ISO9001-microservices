import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class ResumeService {
  private apiUrl = 'http://localhost:8080/api/resumes';

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  createResume(resume: any): Observable<any> {
    return new Observable((observer) => {
      this.keycloakService.getToken().then((token) => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        });

        // Log the payload for debugging
        console.log('Payload envoyé au backend :', resume);

        this.http.post(this.apiUrl, resume, { headers }).subscribe({
          next: (response) => {
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Erreur lors de la création du CV :', error);
            observer.error(error);
          },
        });
      }).catch((error) => {
        console.error('Erreur lors de la récupération du token Keycloak :', error);
        observer.error(error);
      });
    });
  }

  getResumeById(id: number): Observable<any> {
    return new Observable((observer) => {
      this.keycloakService.getToken().then((token) => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        });

        this.http.get(`${this.apiUrl}/${id}`, { headers }).subscribe({
          next: (response) => {
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Erreur lors de la récupération du CV :', error);
            observer.error(error);
          },
        });
      }).catch((error) => {
        console.error('Erreur lors de la récupération du token Keycloak :', error);
        observer.error(error);
      });
    });
  }
}
