import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
export interface User {
  id: number;
  username: string;
}

export interface Task {
  id: number;
  taskDescription: string;
  taskStatus: string;
  operationId?: number;
  operationName?: string;
  operation?: Operation;
}

export interface Operation {
  id: number;
  operationName: string;
  operationDescription: string;
  processId?: number;
  processName?: string;
  process?: Process;
  tasks?: Task[];
  taskNames?: string[];
}

export interface Process {
  id: number;
  procName: string;
  creationDate: string;
  modifDate: string;
  description: string;
  x: number;
  y: number;
  piloteId?: number;
  piloteName?: string;
  pilote?: User;
}
@Injectable({
  providedIn: 'root'
})
export class TaskOperationProcessService {
  private taskApiUrl = 'http://localhost:8089/tasks';
  private operationApiUrl = 'http://localhost:8089/operations';
  private processApiUrl = 'http://localhost:8089/Process';

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

  async getAllTasks(): Promise<Observable<Task[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Task[]>(this.taskApiUrl, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching tasks:', err);
        return throwError(() => err);
      })
    );
  }

  async getTaskById(id: number): Promise<Observable<Task>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Task>(`${this.taskApiUrl}/${id}`, { headers }).pipe(
      catchError(err => {
        console.error(`Error fetching task with ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  async getAllOperations(): Promise<Observable<Operation[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Operation[]>(this.operationApiUrl, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching operations:', err);
        return throwError(() => err);
      })
    );
  }

  async getOperationById(id: number): Promise<Observable<Operation>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Operation>(`${this.operationApiUrl}/${id}`, { headers }).pipe(
      catchError(err => {
        console.error(`Error fetching operation with ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  async getAllProcesses(): Promise<Observable<Process[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Process[]>(this.processApiUrl, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching processes:', err);
        return throwError(() => err);
      })
    );
  }

  async getProcessById(id: number): Promise<Observable<Process>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Process>(`${this.processApiUrl}/${id}`, { headers }).pipe(
      catchError(err => {
        console.error(`Error fetching process with ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
