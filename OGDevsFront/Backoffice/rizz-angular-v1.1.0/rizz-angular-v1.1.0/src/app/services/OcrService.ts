import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap, tap, map } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  private flaskUrl = 'http://localhost:5000/ocr';
  private springUrl = 'http://localhost:8089/api/ocr/save';

  constructor(private http: HttpClient, private keycloak: KeycloakService) {}

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    console.log('Envoi de la requête OCR à Flask:', file.name);
    return this.http.post<any>(this.flaskUrl, formData, { responseType: 'json' }).pipe(
      tap(response => console.log('Réponse Flask:', response)),
      catchError(this.handleError('OCR processing'))
    );
  }

  saveOcrData(data: any): Observable<{ message: string } | string> {
    return from(this.keycloak.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          throw new Error('Token is null or undefined');
        }
        console.log('Retrieved Token:', token);
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        console.log('Envoi des données à Spring Boot:', data);
        return this.http.post(this.springUrl, data, { headers, responseType: 'text' }).pipe(
          map(response => {
            try {
              // Tenter de parser la réponse comme JSON
              return JSON.parse(response) as { message: string };
            } catch (e) {
              // Si parsing échoue, retourner la réponse brute comme chaîne
              return response;
            }
          }),
          tap(response => console.log('Réponse Spring Boot:', response)),
          catchError(this.handleError('Save OCR data'))
        );
      }),
      catchError(err => {
        console.error('Erreur Keycloak token:', err);
        return throwError(() => new Error(`Keycloak token error: ${err.message || 'Unknown error'}`));
      })
    );
  }

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMsg = `${operation} failed: ${error.status} - ${error.statusText}`;
      if (error.error instanceof ErrorEvent) {
        errorMsg += ` (Client-side error: ${error.error.message})`;
      } else {
        errorMsg += ` (Server error: ${error.error?.message || 'No details'})`;
      }
      console.error(errorMsg, {
        status: error.status,
        statusText: error.statusText,
        error: error.error,
        message: error.message
      });
      return throwError(() => new Error(errorMsg));
    };
  }
}
