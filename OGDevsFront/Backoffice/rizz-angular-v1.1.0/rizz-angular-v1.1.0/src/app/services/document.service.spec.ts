import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { Document } from '../core/models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8089/api/documents'; // Adjust to match your Spring Boot backend

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  // Helper method to get Authorization headers with Keycloak token
  private getHeaders(): Observable<HttpHeaders> {
    return from(Promise.resolve(this.keycloakService.isLoggedIn())).pipe(
      switchMap((isLoggedIn) => {
        if (!isLoggedIn) {
          throw new Error('Utilisateur non authentifié');
        }
        return from(this.keycloakService.getToken()).pipe(
          switchMap((token) => {
            if (!token) {
              throw new Error('Aucun token disponible');
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

  // Create a new document
  createDocument(document: Document): Observable<Document> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.post<Document>(`${this.apiUrl}/create`, document, { headers })),
      catchError((err) => {
        console.error('Erreur lors de la création du document', err);
        return throwError(() => new Error('Erreur lors de la création du document'));
      })
    );
  }

  // Get all documents
  getAllDocuments(): Observable<Document[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Document[]>(this.apiUrl, { headers })),
      catchError((err) => {
        console.error('Erreur lors de la récupération des documents', err);
        return throwError(() => new Error('Erreur lors de la récupération des documents'));
      })
    );
  }

  // Get a document by ID
  getDocumentById(id: number): Observable<Document> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Document>(`${this.apiUrl}/${id}`, { headers })),
      catchError((err) => {
        console.error('Erreur lors de la récupération du document', err);
        return throwError(() => new Error('Erreur lors de la récupération du document'));
      })
    );
  }

  // Update a document
  updateDocument(id: number, document: Document): Observable<Document> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.put<Document>(`${this.apiUrl}/${id}`, document, { headers })),
      catchError((err) => {
        console.error('Erreur lors de la mise à jour du document', err);
        return throwError(() => new Error('Erreur lors de la mise à jour du document'));
      })
    );
  }

  // Delete a document
  deleteDocument(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })),
      catchError((err) => {
        console.error('Erreur lors de la suppression du document', err);
        return throwError(() => new Error('Erreur lors de la suppression du document'));
      })
    );
  }
}
