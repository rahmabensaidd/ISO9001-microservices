import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, map, catchError } from 'rxjs';
import { Kpi, Report } from '@core/models/Kpi.model';

@Injectable({
  providedIn: 'root',
})
export class IndicateurService {
  private apiUrl = 'http://localhost:8089/api/indicators';

  constructor(private http: HttpClient) {}

  getAllKpis(): Observable<Kpi[]> {
    return this.http.get<Kpi[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  createKpi(kpi: Kpi): Observable<Kpi> {
    return this.http.post<Kpi>(this.apiUrl, kpi).pipe(
      catchError(this.handleError)
    );
  }

  updateKpi(kpi: Kpi): Observable<Kpi> {
    if (!kpi.idIndicateur) throw new Error('ID de l’indicateur requis');
    return this.http.put<Kpi>(`${this.apiUrl}/${kpi.idIndicateur}`, kpi).pipe(
      catchError(this.handleError)
    );
  }
  updateReport(report: Report): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/reports/${report.id}`, report);
  }
  deleteKpi(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reports/${id}`);
  }
  uploadCsvIndicators(file: File): Observable<Kpi[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Kpi[]>(`${this.apiUrl}/upload/csv`, formData).pipe(
      catchError(this.handleError)
    );
  }

  uploadPdfIndicators(file: File): Observable<Kpi[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Kpi[]>(`${this.apiUrl}/upload/pdf`, formData).pipe(
      catchError(this.handleError)
    );
  }

  generatePeriodicReport(period: string): Observable<string> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/report`, { params, responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/reports`).pipe(
      catchError(this.handleError)
    );
  }

  createReport(report: Report): Observable<Report> {
    return this.http.post<Report>(`${this.apiUrl}/reports`, report).pipe(
      catchError(this.handleError)
    );
  }

  getIndicatorTrends(): Observable<Map<string, number[]>> {
    return this.http.get<{ [key: string]: number[] }>(`${this.apiUrl}/trends`).pipe(
      map(response => {
        const trendsMap = new Map<string, number[]>();
        Object.entries(response).forEach(([key, values]) => {
          trendsMap.set(key, values);
        });
        return trendsMap;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur client : ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Erreur serveur : ${error.status} - `;
      try {
        // Attempt to parse the error response body as JSON or check Report.content
        if (typeof error.error === 'string') {
          errorMessage += error.error; // Use plain text if available
        } else if (error.error && typeof error.error === 'object' && 'content' in error.error) {
          errorMessage += error.error.content || 'Erreur inconnue'; // Use Report.content for error message
        } else if (error.error && typeof error.error === 'object') {
          errorMessage += JSON.stringify(error.error); // Parse JSON object if available
        } else {
          errorMessage += 'Erreur inconnue';
        }
      } catch (e) {
        errorMessage += 'Erreur inconnue (parsing failed)';
      }
      if (error.status === 404) {
        errorMessage += ' - L’endpoint n’a pas été trouvé. Vérifiez l’URL ou le backend.';
      } else if (error.status === 500) {
        errorMessage += ' - Une erreur interne s’est produite sur le serveur. Vérifiez les logs backend.';
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
