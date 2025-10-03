import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, lastValueFrom, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { Process, Workflow, Operation, Task, Objective, UserRepresentation, Poste } from '@/app/core/models/process.model';
import { IndicatorDTO } from '@/app/services/indicator.model';
import { Data } from '@/app/core/models/data.model';

@Injectable({
  providedIn: 'root',
})
export class ProcessService {
  private apiUrl = 'http://localhost:8089';
  private keycloakAdminUrl = 'http://localhost:8080/admin';
  private realm = 'test';

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  private async getSecureToken(): Promise<string | null> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn('⚠️ User not logged in, redirecting to Keycloak.');
        await this.keycloakService.login();
        return null;
      }
      await this.keycloakService.updateToken(30);
      const token = await this.keycloakService.getToken();
      return token;
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return null;
    }
  }

  private async getHeaders(isMultipart: boolean = false): Promise<HttpHeaders> {
    const token = await this.getSecureToken();
    if (!token) {
      throw new Error('User not logged in or invalid token');
    }

    let headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    if (!isMultipart) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  async loadUsersFromKeycloak(): Promise<Observable<UserRepresentation[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    const url = `${this.keycloakAdminUrl}/realms/${this.realm}/users`;
    return this.http.get<any[]>(url, { headers }).pipe(
      map((users) =>
        users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email || 'N/A',
          enabled: user.enabled,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName

          || ''} ${user.lastName || ''}`.trim() || user.username,
          status: user.enabled ? 'Active' : 'Inactive',
          last_active: 'N/A',
          role: 'N/A',
          image: 'assets/images/users/default-avatar.jpg',
        }))
      ),
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error fetching users from Keycloak:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async getAllIndicators(): Promise<Observable<IndicatorDTO[]>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('User not logged in or invalid token'));
    }

    return this.http.get<IndicatorDTO[]>(`${this.apiUrl}/api/indicators`, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error fetching indicators:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async getAllPostes(): Promise<Observable<Poste[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.get<Poste[]>(`${this.apiUrl}/postes`, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error fetching postes:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // ProcessService.ts
  async addWorkflow(work: Workflow): Promise<Observable<Workflow>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    // Remove operations and tasks from the payload, as they are nested under processes
    const payload: Workflow = {
      name: work.name,
      workflowData: work.workflowData,
      paperState: work.paperState,
      paperSnapshot: work.paperSnapshot,
      processes: work.processes,
    };

    return this.http.post<Workflow>(`${this.apiUrl}/workflow/save`, payload, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error saving workflow:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          body: error.error,
          requestBody: JSON.stringify(payload, null, 2),
        });
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async loadWorkflow(id: number): Promise<Observable<Workflow>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.get<Workflow>(`${this.apiUrl}/workflow/${id}`, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error loading workflow by ID:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async loadWorkflowByName(name: string): Promise<Observable<Workflow>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.get<Workflow>(`${this.apiUrl}/workflow/by-name/${encodeURIComponent(name)}`, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error loading workflow by name:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getAllWorkflowNames(): Observable<{ id: number; name: string }[]> {
    return from(this.getHeaders()).pipe(
      switchMap((headers) => {
        if (!headers) {
          return throwError(() => new Error('User not logged in or invalid token'));
        }

        return this.http.get<Workflow[]>(`${this.apiUrl}/workflow/all`, { headers }).pipe(
          map((workflows) =>
            workflows
              .filter((workflow) => workflow.id !== undefined && workflow.name) // Ensure id and name exist
              .map((workflow) => ({
                id: workflow.id!,
                name: workflow.name,
              }))
          ),
          catchError((error) => {
            const errorMessage = error.statusText
              ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
              : `Error: ${error.message || 'Unknown error'}`;
            console.error('❌ Error fetching workflow names:', errorMessage);
            return throwError(() => new Error(errorMessage));
          })
        );
      })
    );
  }

  async addProcess(process: Process): Promise<Observable<Process>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.post<Process>(`${this.apiUrl}/Process`, process, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error adding process:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async addOperation(operation: Operation): Promise<Observable<Operation>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.post<Operation>(`${this.apiUrl}/operations`, operation, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error adding operation:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async addTask(task: Task): Promise<Observable<Task>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.post<Task>(`${this.apiUrl}/tasks`, task, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error adding task:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async updateProcess(id: number, process: Process): Promise<Observable<Process>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.put<Process>(`${this.apiUrl}/Process/${id}`, process, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error updating process:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async deleteProcess(id: number): Promise<Observable<void>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.delete<void>(`${this.apiUrl}/Process/${id}`, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error deleting process:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async getAllProcesses(): Promise<Observable<Process[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.get<Process[]>(`${this.apiUrl}/Process`, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error fetching processes:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async assignOperationToProcess(processId: number, operationId: number): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http
      .post(`${this.apiUrl}/Process/${processId}/assignOperation/${operationId}`, {}, { headers })
      .pipe(
        catchError((error) => {
          const errorMessage = error.statusText
            ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
            : `Error: ${error.message || 'Unknown error'}`;
          console.error('❌ Error assigning operation to process:', errorMessage);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  async assignTaskToOperation(operationId: number, taskId: number): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http
      .post(`${this.apiUrl}/operations/${operationId}/assignTask/${taskId}`, {}, { headers })
      .pipe(
        catchError((error) => {
          const errorMessage = error.statusText
            ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
            : `Error: ${error.message || 'Unknown error'}`;
          console.error('❌ Error assigning task to operation:', errorMessage);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  async addObjective(objective: Objective): Promise<Observable<Objective>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.post<Objective>(`${this.apiUrl}/Objective`, objective, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error adding objective:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async getAllObjectives(): Promise<Observable<Objective[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.get<Objective[]>(`${this.apiUrl}/Objective/getObjectives`, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error fetching objectives:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async assignPostesToOperation(operationId: number, posteIds: Set<number>): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    const url = `${this.apiUrl}/operations/${operationId}/assignPostes`;
    return this.http.post(url, Array.from(posteIds), { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error assigning postes to operation:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async getPostesForOperation(operationId: number): Promise<Observable<Poste[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    const url = `${this.apiUrl}/operations/${operationId}/postes`;
    return this.http.get<Poste[]>(url, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error fetching postes for operation:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async getAllData(): Promise<Observable<Data[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    return this.http.get<Data[]>(`${this.apiUrl}/data`, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error fetching data:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async assignDataToTask(taskId: number, dataIds: Set<number>): Promise<Observable<Task>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not logged in or invalid token'));

    const url = `${this.apiUrl}/tasks/${taskId}/assigndata`;
    return this.http.post<Task>(url, Array.from(dataIds), { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error assigning data to task:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async createLinkAndAssign(
    sourceType: string,
    targetType: string,
    sourceId: number,
    targetId: number,
    processes: Process[],
    operations: Operation[],
    tasks: Task[]
  ): Promise<Observable<any>> {
    let assignResult: Observable<any>;
    if (sourceType === 'process' && targetType === 'operation') {
      assignResult = await this.assignOperationToProcess(sourceId, targetId);
      const process = processes.find((p) => p.id === sourceId);
      const operation = operations.find((op) => op.id === targetId);

      if (!process || process.id === undefined) {
        return throwError(() => new Error(`Process with ID ${sourceId} not found or ID is undefined`));
      }
      if (!operation || operation.id === undefined) {
        return throwError(() => new Error(`Operation with ID ${targetId} not found or ID is undefined`));
      }
      if (!process.operations) {
        process.operations = [];
      }
      if (!process.operations.some((op) => op.id === targetId)) {
        process.operations.push(operation);
      }
      operation.process = { id: process.id }; // Now safe because we checked process.id above
    } else if (sourceType === 'operation' && targetType === 'task') {
      assignResult = await this.assignTaskToOperation(sourceId, targetId);
      const operation = operations.find((op) => op.id === sourceId);
      const task = tasks.find((t) => t.id === targetId);
      if (!operation || operation.id === undefined) {
        return throwError(() => new Error(`Operation with ID ${sourceId} not found or ID is undefined`));
      }
      if (!task || task.id === undefined) {
        return throwError(() => new Error(`Task with ID ${targetId} not found or ID is undefined`));
      }
      if (!operation.tasks) {
        operation.tasks = [];
      }
      if (!operation.tasks.some((t) => t.id === targetId)) {
        operation.tasks.push(task);
      }
      task.operation = { id: operation.id }; // Now safe because we checked operation.id above
    } else {
      return throwError(() => new Error('Invalid assignment types'));
    }
    return assignResult;
  }
}
