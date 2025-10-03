import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class StatistiquesService {
  private processApiUrl = 'http://localhost:8089/Process';
  private operationApiUrl = 'http://localhost:8089/operations';
  private taskApiUrl = 'http://localhost:8089/tasks';

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  private async getHeaders(): Promise<HttpHeaders | undefined> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User not logged in, redirecting to Keycloak.");
        await this.keycloakService.login();
        return undefined;
      }
      await this.keycloakService.updateToken(30);
      const token = await this.keycloakService.getToken();
      console.log('✅ Retrieved token:', token);
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return undefined;
    }
  }

  async getTotalProcesses(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.processApiUrl}/stats/total`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching total processes:', err);
        return throwError(() => err);
      })
    );
  }

  async getAverageOperationsPerProcess(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.processApiUrl}/stats/avg-operations`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching average operations per process:', err);
        return throwError(() => err);
      })
    );
  }

  async getAverageProcessDuration(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.processApiUrl}/stats/avg-duration`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching average process duration:', err);
        return throwError(() => err);
      })
    );
  }

  async getCompletionRate(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.processApiUrl}/stats/completion-rate`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching process completion rate:', err);
        return throwError(() => err);
      })
    );
  }

  async getProcessesByPilote(): Promise<Observable<{ [key: string]: number }>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<{ [key: string]: number }>(`${this.processApiUrl}/stats/by-pilote`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching processes by pilote:', err);
        return throwError(() => err);
      })
    );
  }

  async getOperationsDurationCorrelation(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.processApiUrl}/stats/operations-duration-correlation`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching process operations-duration correlation:', err);
        return throwError(() => err);
      })
    );
  }

  async getTotalOperations(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.operationApiUrl}/stats/total`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching total operations:', err);
        return throwError(() => err);
      })
    );
  }

  async getAverageTasksPerOperation(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.operationApiUrl}/stats/avg-tasks`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching average tasks per operation:', err);
        return throwError(() => err);
      })
    );
  }

  async getAverageOperationDuration(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.operationApiUrl}/stats/avg-duration`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching average operation duration:', err);
        return throwError(() => err);
      })
    );
  }

  async getOperationCompletionRate(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.operationApiUrl}/stats/completion-rate`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching operation completion rate:', err);
        return throwError(() => err);
      })
    );
  }

  async getOperationsByUser(): Promise<Observable<{ [key: string]: number }>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<{ [key: string]: number }>(`${this.operationApiUrl}/stats/by-user`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching operations by user:', err);
        return throwError(() => err);
      })
    );
  }

  async getTasksDurationCorrelation(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.operationApiUrl}/stats/tasks-duration-correlation`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching tasks-duration correlation:', err);
        return throwError(() => err);
      })
    );
  }

  async getTotalTasks(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.taskApiUrl}/stats/total`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching total tasks:', err);
        return throwError(() => err);
      })
    );
  }

  async getAverageDataPerTask(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.taskApiUrl}/stats/avg-data`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching average data per task:', err);
        return throwError(() => err);
      })
    );
  }

  async getAverageTaskDuration(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.taskApiUrl}/stats/avg-duration`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching average task duration:', err);
        return throwError(() => err);
      })
    );
  }

  async getTaskCompletionRate(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.taskApiUrl}/stats/completion-rate`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching task completion rate:', err);
        return throwError(() => err);
      })
    );
  }

  async getTasksByOperation(): Promise<Observable<{ [key: string]: number }>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<{ [key: string]: number }>(`${this.taskApiUrl}/stats/by-operation`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching tasks by operation:', err);
        return throwError(() => err);
      })
    );
  }

  async getDataDurationCorrelation(): Promise<Observable<number>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<number>(`${this.taskApiUrl}/stats/data-duration-correlation`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching data-duration correlation:', err);
        return throwError(() => err);
      })
    );
  }
}
