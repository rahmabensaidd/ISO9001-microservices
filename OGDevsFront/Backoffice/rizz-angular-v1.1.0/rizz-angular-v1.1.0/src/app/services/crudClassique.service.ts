import { Injectable } from "@angular/core"
import {  HttpClient, HttpHeaders,  HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import  { KeycloakService } from "keycloak-angular"
import  {
  WorkFlow,
  Process,
  ProcessDTO,
  Operation,
  OperationDTO,
  Objective,
  ObjectiveDTO as CrudObjectiveDTO,
  Task,
  TaskDTO,
  Poste,
  Data,
  UserRepresentation,
  Axe,
} from "@/app/core/models/crudClassique.model"

@Injectable({
  providedIn: "root",
})
export class CrudClassiqueService {
  private apiUrl = "http://localhost:8089"
  private keycloakAdminUrl = "http://localhost:8080/admin"
  private realm = "test"

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService,
  ) {}

  private async getSecureToken(): Promise<string | null> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn()
      if (!isLoggedIn) {
        console.warn("⚠️ User not logged in, redirecting to Keycloak.")
        await this.keycloakService.login()
        return null
      }
      await this.keycloakService.updateToken(30)
      const token = await this.keycloakService.getToken()
      return token
    } catch (error) {
      console.error("❌ Error retrieving token:", error)
      return null
    }
  }

  private async getHeaders(isMultipart = false): Promise<HttpHeaders> {
    const token = await this.getSecureToken()
    if (!token) {
      throw new Error("User not logged in or invalid token")
    }
    let headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    })
    if (!isMultipart) {
      headers = headers.set("Content-Type", "application/json")
    }
    return headers
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Unknown error occurred"

    console.error("❌ Full HTTP Error:", error)

    if (error.error) {

      if (typeof error.error === "string") {

        errorMessage = error.error
      }

      else if (typeof error.error === "object" && error.error.error) {
        errorMessage = error.error.error
      }

      else if (error.error.message) {
        errorMessage = error.error.message
      }

      else {
        try {
          errorMessage = JSON.stringify(error.error)
        } catch {
          errorMessage = "Invalid error format"
        }
      }
    }

    else if (error.message) {
      errorMessage = error.message
    }

    else if (error.status) {
      errorMessage = `HTTP ${error.status}: ${error.statusText || "Unknown Error"}`
    }

    const finalErrorMessage = `API Error: ${errorMessage}`
    console.error("❌", finalErrorMessage)
    return throwError(() => new Error(finalErrorMessage))
  }


  async loadUsersFromKeycloak(): Promise<Observable<UserRepresentation[]>> {
    const headers = await this.getHeaders()
    const url = `${this.keycloakAdminUrl}/realms/${this.realm}/users`
    return this.http.get<any[]>(url, { headers }).pipe(
      map((users) =>
        users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email || "N/A",
          enabled: user.enabled,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
          status: user.enabled ? "Active" : "Inactive",
          last_active: "N/A",
          role: "N/A",
          image: "assets/images/users/default-avatar.jpg",
        })),
      ),
      catchError(this.handleError.bind(this)),
    )
  }


  async saveWorkflow(workflow: WorkFlow): Promise<Observable<WorkFlow>> {
    const headers = await this.getHeaders()
    console.log("📤 Saving workflow:", workflow)


    const workflowToSend: WorkFlow = {
      id: workflow.id || undefined,
      name: workflow.name,
      workflowData: workflow.workflowData || "",
      processes: workflow.processes || [],
    }

    console.log("📤 Formatted workflow to send:", workflowToSend)

    return this.http
      .post<WorkFlow>(`${this.apiUrl}/workflow/save`, workflowToSend, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async getAllWorkflows(): Promise<Observable<WorkFlow[]>> {
    const headers = await this.getHeaders()
    console.log("📥 Getting all workflows")
    return this.http
      .get<WorkFlow[]>(`${this.apiUrl}/workflow/all`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async getWorkflowById(id: number): Promise<Observable<WorkFlow>> {
    const headers = await this.getHeaders()
    console.log(`📥 Getting workflow ${id}`)
    return this.http
      .get<WorkFlow>(`${this.apiUrl}/workflow/${id}`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async getWorkflowByName(name: string): Promise<Observable<WorkFlow>> {
    const headers = await this.getHeaders()
    console.log(`📥 Getting workflow by name: ${name}`)
    return this.http
      .get<WorkFlow>(`${this.apiUrl}/workflow/by-name/${encodeURIComponent(name)}`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async getWorkflowSnapshot(id: number): Promise<Observable<string>> {
    const headers = await this.getHeaders()
    console.log(`📥 Getting workflow snapshot ${id}`)
    return this.http
      .get<string>(`${this.apiUrl}/workflow/${id}/snapshot`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }


  async addProcess(process: Process): Promise<Observable<Process>> {
    const headers = await this.getHeaders()
    console.log("📤 Adding process:", process)
    return this.http
      .post<Process>(`${this.apiUrl}/Process`, process, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async updateProcess(id: number, process: Process): Promise<Observable<Process>> {
    const headers = await this.getHeaders()
    console.log(`📤 Updating process ${id}:`, process)
    return this.http
      .put<Process>(`${this.apiUrl}/Process/${id}`, process, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async deleteProcess(id: number): Promise<Observable<void>> {
    const headers = await this.getHeaders()
    console.log(`🗑️ Deleting process ${id}`)
    return this.http
      .delete<void>(`${this.apiUrl}/Process/${id}`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async getProcessById(id: number): Promise<Observable<Process>> {
    const headers = await this.getHeaders()
    console.log(`📥 Getting process ${id}`)
    return this.http
      .get<Process>(`${this.apiUrl}/Process/${id}`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async getAllProcesses(): Promise<Observable<ProcessDTO[]>> {
    const headers = await this.getHeaders()
    console.log("📥 Getting all processes")
    return this.http
      .get<ProcessDTO[]>(`${this.apiUrl}/Process`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async assignOperationToProcess(processId: number, operationId: number): Promise<Observable<{ message: string }>> {
    const headers = await this.getHeaders()
    console.log(`🔗 Assigning operation ${operationId} to process ${processId}`)
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/Process/${processId}/assignOperation/${operationId}`, {}, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async assignObjectiveToProcess(processId: number, objectiveId: number): Promise<Observable<{ message: string }>> {
    const headers = await this.getHeaders()
    console.log(`🔗 Assigning objective ${objectiveId} to process ${processId}`)
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/Process/${processId}/assignObjective/${objectiveId}`, {}, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  // Operation Endpoints
  async addOperation(operation: Operation): Promise<Observable<Operation>> {
    const headers = await this.getHeaders()
    console.log("📤 Adding operation:", operation)
    return this.http
      .post<Operation>(`${this.apiUrl}/operations`, operation, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async getAllOperations(): Promise<Observable<OperationDTO[]>> {
    const headers = await this.getHeaders()
    console.log("📥 Getting all operations")
    return this.http
      .get<OperationDTO[]>(`${this.apiUrl}/operations`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async getOperationById(id: number): Promise<Observable<Operation>> {
    const headers = await this.getHeaders()
    console.log(`📥 Getting operation ${id}`)
    return this.http
      .get<Operation>(`${this.apiUrl}/operations/${id}`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async updateOperation(id: number, operation: Operation): Promise<Observable<Operation>> {
    const headers = await this.getHeaders()
    console.log(`📤 Updating operation ${id}:`, operation)
    return this.http
      .put<Operation>(`${this.apiUrl}/operations/${id}`, operation, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async deleteOperation(id: number): Promise<Observable<{ message: string }>> {
    const headers = await this.getHeaders()
    console.log(`🗑️ Deleting operation ${id}`)
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/operations/${id}`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async assignTaskToOperation(operationId: number, taskId: number): Promise<Observable<{ message: string }>> {
    const headers = await this.getHeaders()
    console.log(`🔗 Assigning task ${taskId} to operation ${operationId}`)
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/operations/${operationId}/assignTask/${taskId}`, {}, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async getPostesForOperation(operationId: number): Promise<Observable<Poste[]>> {
    const headers = await this.getHeaders()
    console.log(`📥 Getting postes for operation ${operationId}`)
    return this.http
      .get<Poste[]>(`${this.apiUrl}/operations/${operationId}/postes`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async assignPostesToOperation(operationId: number, posteIds: Set<number>): Promise<Observable<{ message: string }>> {
    const headers = await this.getHeaders()
    console.log(`🔗 Assigning postes to operation ${operationId}:`, Array.from(posteIds))
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/operations/${operationId}/assignPostes`, Array.from(posteIds), {
        headers,
      })
      .pipe(catchError(this.handleError.bind(this)))
  }

  // Objective Endpoints
  async addObjective(objective: Objective): Promise<Observable<Objective>> {
    const headers = await this.getHeaders()
    console.log("📤 Adding objective:", objective)
    return this.http
      .post<Objective>(`${this.apiUrl}/Objective`, objective, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async updateObjective(id: number, objective: Objective): Promise<Observable<Objective>> {
    const headers = await this.getHeaders()
    console.log(`📤 Updating objective ${id}:`, objective)
    return this.http
      .put<Objective>(`${this.apiUrl}/Objective/updateObjective/${id}`, objective, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async getAllObjectives(): Promise<Observable<CrudObjectiveDTO[]>> {
    const headers = await this.getHeaders()
    console.log("📥 Getting all objectives DTO")
    return this.http.get<any[]>(`${this.apiUrl}/Objective/getAllObjectivesDTO`, { headers }).pipe(
      map((objectives: any[]) =>
        objectives.map(
          (obj: any): CrudObjectiveDTO => ({
            idObjective: obj.idObjective,
            title: obj.title,
            axe: obj.axe as Axe,
            processId: obj.processId,
            processName: obj.processName,
          }),
        ),
      ),
      catchError(this.handleError.bind(this)),
    )
  }

  async deleteObjective(id: number): Promise<Observable<void>> {
    const headers = await this.getHeaders()
    console.log(`🗑️ Deleting objective ${id}`)
    return this.http
      .delete<void>(`${this.apiUrl}/Objective/deleteObjective/${id}`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  // Task Endpoints
  async addTask(task: Task): Promise<Observable<Task>> {
    const headers = await this.getHeaders()
    console.log("📤 Adding task:", task)

    // Validation
    if (!task.taskDescription || task.taskDescription.trim() === "") {
      console.error("❌ Task description is required")
      return throwError(() => new Error("Task description is required"))
    }

    if (!task.taskName || task.taskName.trim() === "") {
      console.error("❌ Task name is required")
      return throwError(() => new Error("Task name is required"))
    }

    if (!task.operation?.id) {
      console.error("❌ Operation ID is required")
      return throwError(() => new Error("Operation ID is required"))
    }

    const taskToSend = {
      id: task.id || null,
      taskDescription: task.taskDescription.trim(),
      taskName: task.taskName.trim(),
      taskStatus: task.taskStatus || "TODO",
      creationDate: task.creationDate || null,
      finishDate: task.finishDate || null,
      estimatedTime: task.estimatedTime || 0,
      priority: task.priority || "MEDIUM",
      operation: {
        id: task.operation.id,
      },
    }

    console.log("📤 Formatted task to send:", taskToSend)

    return this.http
      .post<Task>(`${this.apiUrl}/tasks`, taskToSend, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async getAllTasks(): Promise<Observable<TaskDTO[]>> {
    const headers = await this.getHeaders()
    console.log("📥 Getting all tasks")
    return this.http.get<TaskDTO[]>(`${this.apiUrl}/tasks`, { headers }).pipe(catchError(this.handleError.bind(this)))
  }

  async getTaskById(id: number): Promise<Observable<Task>> {
    const headers = await this.getHeaders()
    console.log(`📥 Getting task ${id}`)
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`, { headers }).pipe(catchError(this.handleError.bind(this)))
  }

  async updateTask(id: number, task: Task): Promise<Observable<Task>> {
    const headers = await this.getHeaders()
    console.log(`📤 Updating task ${id}:`, task)

    const taskToSend = {
      id: task.id,
      taskDescription: task.taskDescription?.trim(),
      taskName: task.taskName?.trim(),
      taskStatus: task.taskStatus || "TODO",
      creationDate: task.creationDate,
      finishDate: task.finishDate,
      estimatedTime: task.estimatedTime || 0,
      priority: task.priority || "MEDIUM",
      operation: task.operation ? { id: task.operation.id } : null,
    }

    return this.http
      .put<Task>(`${this.apiUrl}/tasks/${id}`, taskToSend, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async deleteTask(id: number): Promise<Observable<{ message: string }>> {
    const headers = await this.getHeaders()
    console.log(`🗑️ Deleting task ${id}`)
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/tasks/${id}`, { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  async assignDataToTask(taskId: number, dataIds: Set<number>): Promise<Observable<Task>> {
    const headers = await this.getHeaders()
    console.log(`🔗 Assigning data to task ${taskId}:`, Array.from(dataIds))
    return this.http
      .post<Task>(`${this.apiUrl}/tasks/${taskId}/assigndata`, Array.from(dataIds), { headers })
      .pipe(catchError(this.handleError.bind(this)))
  }

  // Data Endpoints
  async getAllData(): Promise<Observable<Data[]>> {
    const headers = await this.getHeaders()
    console.log("📥 Getting all data")
    return this.http.get<Data[]>(`${this.apiUrl}/data`, { headers }).pipe(catchError(this.handleError.bind(this)))
  }

  // Poste Endpoints
  async getAllPostes(): Promise<Observable<Poste[]>> {
    const headers = await this.getHeaders()
    console.log("📥 Getting all postes")
    return this.http.get<Poste[]>(`${this.apiUrl}/postes`, { headers }).pipe(catchError(this.handleError.bind(this)))
  }
}
