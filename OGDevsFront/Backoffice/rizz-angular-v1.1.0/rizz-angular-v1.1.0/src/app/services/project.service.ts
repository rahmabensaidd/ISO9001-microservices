import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, Observable, of, throwError } from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {catchError, map, switchMap} from "rxjs/operators";
import {Phase, ProjectOperation, UserDTO, Bug, Project, Resource} from '../core/models/project.model';
import {Operation} from "@core/models/operation.model";
type TechnologyStack = { [key: string]: string };
export interface Phasesugg {
  name: string;
  description: string;
}
export interface TaskInfoDTO {
  projectName: string;
  operationName: string;
  deadline: string; // ⚠️ Attention: c’est une date ISO string côté Angular
  phaseName: string;
}
@Injectable({
  providedIn: 'root',
})
// Un stack est un objet où les clés sont les types de technologies et les valeurs sont les noms
export class ProjectService {
  private apiUrl = 'http://localhost:8089/api/projects'
  private apiprocessUrl = 'http://localhost:8089/Process'
  constructor(
    private keycloakService: KeycloakService,
    private http: HttpClient
  ) {}

  /** ⬇️ Méthode pour créer un projet ⬇️ **/
  createProject(
    projectData: any,
    email: string,
    idprocess: number[]
  ): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        // 🔹 Convertir la liste idprocess en chaîne séparée par des virgules (ex: "10,12,15")
        const idprocessString = idprocess.join(',')

        // 🔹 Construire l'URL avec les paramètres `email` et `idprocess`
        const backendUrl = `${this.apiUrl}/create/${email}/${idprocessString}`

        return this.http
          .post(backendUrl, projectData, {
            headers,
            observe: 'response',
            responseType: 'json',
          })
          .pipe(
            catchError((error) => {
              console.error('❌ Erreur lors de la création du projet :', error)
              return throwError(() => error)
            })
          )
      })
    )
  }

  /** ⬇️ Méthode pour obtenir les headers avec l'authentification ⬇️ **/
  private getHeaders(): Observable<HttpHeaders> {
    // Convertit isLoggedIn() (qui peut être un Promise<boolean>) en Observable<boolean>
    return from(Promise.resolve(this.keycloakService.isLoggedIn())).pipe(
      switchMap((isLoggedIn) => {
        if (!isLoggedIn) {
          throw new Error('Utilisateur non authentifié')
        }
        // Convertit getToken() (qui retourne un Promise<string>) en Observable<string>
        return from(this.keycloakService.getToken()).pipe(
          switchMap((token) => {
            if (!token) {
              throw new Error('No token available')
            }
            return of(new HttpHeaders().set('Authorization', `Bearer ${token}`))
          })
        )
      }),
      catchError((err) => {
        console.error('Erreur lors de la récupération du token', err)
        return throwError(() =>
          err instanceof Error ? err : new Error('Erreur d’authentification')
        )
      })
    )
  }

  /** ⬇️ Méthode pour supprimer un projet ⬇️ **/
  deleteProject(idProjet: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const backendUrl = `${this.apiUrl}/delete/${idProjet}`
        return this.http.delete(backendUrl, { headers }).pipe(
          catchError((error) => {
            console.error('❌ Erreur lors de la suppression du projet :', error)
            return throwError(() => error)
          })
        )
      })
    )
  }

  /** ⬇️ Méthode pour obtenir tous les projets ⬇️ **/
  getAllProjects(): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.http.get(this.apiUrl, { headers }).pipe(
          catchError((error) => {
            console.error(
              '❌ Erreur lors de la récupération des projets :',
              error
            )
            return throwError(() => error)
          })
        )
      })
    )
  }

  createPhase(phaseData: any, projectId: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const backendUrl = `${this.apiUrl}/createphase/${projectId}`

        return this.http
          .post(backendUrl, phaseData, {
            headers,
            observe: 'response',
            responseType: 'json',
          })
          .pipe(
            catchError((error) => {
              console.error(
                '❌ Erreur lors de la création de la phase :',
                error
              )
              return throwError(() => error)
            })
          )
      })
    )
  }
  getProjectById(projectId: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const backendUrl = `${this.apiUrl}/${projectId}`

        return this.http.get(backendUrl, { headers }).pipe(
          catchError((error) => {
            console.error(
              '❌ Erreur lors de la récupération du projet :',
              error
            )
            return throwError(() => error)
          })
        )
      })
    )
  }
  getPhasesByProjectId(projectId: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const backendUrl = `${this.apiUrl}/${projectId}/phases` // Endpoint pour récupérer les phases par projet

        // Afficher l'URL et les en-têtes pour debug
        console.log('URL:', backendUrl)
        console.log('Headers:', headers)

        return this.http.get(backendUrl, { headers }).pipe(
          catchError((error) => {
            console.error(
              '❌ Erreur lors de la récupération des phases du projet :',
              error
            )
            return throwError(() => error)
          })
        )
      })
    )
  }

  addPhase(projectId: number, newPhase: Phase): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const backendUrl = `${this.apiUrl}/createphase/${projectId}`

        return this.http
          .post(backendUrl, newPhase, {
            headers,
            observe: 'response',
            responseType: 'json',
          })
          .pipe(
            catchError((error) => {
              console.error("❌ Erreur lors de l'ajout de la phase :", error)
              return throwError(() => error)
            })
          )
      })
    )
  }

  /** ⬇️ Méthode pour créer une opération de projet par ID de phase ⬇️ **/
  createOperationByPhaseId(
    phaseId: number,
    projectOperation: ProjectOperation
  ): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const backendUrl = `${this.apiUrl}/createprojectOperation/${phaseId}`

        return this.http.post(backendUrl, projectOperation, { headers }).pipe(
          catchError((error) => {
            console.error(
              "❌ Erreur lors de la création de l'opération :",
              error
            )
            return throwError(() => error)
          })
        )
      })
    )
  }
  getOperationsByPhase(phaseId: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const backendUrl = `${this.apiUrl}/getoperationsphase/${phaseId}`

        return this.http.get(backendUrl, { headers }).pipe(
          catchError((error) => {
            console.error(
              '❌ Erreur lors de la récupération des opérations :',
              error
            )
            return throwError(() => error)
          })
        )
      })
    )
  }
  getAllUsers(): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const backendUrl = `${this.apiUrl}/allusers` // URL to fetch users

        return this.http.get(backendUrl, { headers }).pipe(
          catchError((error) => {
            console.error(
              '❌ Erreur lors de la récupération des utilisateurs :',
              error
            )
            return throwError(() => error)
          })
        )
      })
    )
  }

  getAllProcesses(): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const url = `${this.apiprocessUrl}` // Endpoint backend
        return this.http.get(url, { headers }).pipe(
          catchError((error) => {
            console.error(
              '❌ Erreur lors de la récupération des processus :',
              error
            )
            return throwError(() => error)
          })
        )
      })
    )
  }
  getOperationsByProject(idProject: number): Observable<Operation[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const url = `${this.apiUrl}/operations/${idProject}`

        // Effectuer une requête HTTP GET pour récupérer les opérations du projet avec les en-têtes
        return this.http.get<Operation[]>(url, { headers }).pipe(
          catchError((error) => {
            console.error(
              '❌ Erreur lors de la récupération des opérations :',
              error
            )
            return throwError(() => error)
          })
        )
      })
    )
  }

  createProjectOperation(
    phaseId: number,
    idoperation: number,
    projectOperation: Partial<ProjectOperation>
  ): Observable<ProjectOperation> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const url = `${this.apiUrl}/createprojectOperation/${phaseId}/${idoperation}`

        // Envoie de la requête POST pour créer une opération de projet
        return this.http
          .post<ProjectOperation>(url, projectOperation, { headers })
          .pipe(
            catchError((error) => {
              console.error(
                "❌ Erreur lors de la création de l'opération de projet:",
                error
              )
              return throwError(() => error)
            })
          )
      })
    )
  }

  getUsersByProjectOperation(
    idProjectOperation: number | undefined
  ): Observable<UserDTO[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const url = `${this.apiUrl}/users/${idProjectOperation}`

        // Envoie de la requête GET pour récupérer les utilisateurs associés à l'opération de projet
        return this.http.get<UserDTO[]>(url, { headers }).pipe(
          catchError((error) => {
            console.error(
              '❌ Erreur lors de la récupération des utilisateurs:',
              error
            )
            return throwError(() => error)
          })
        )
      })
    )
  }

  assignUserToProjectOperation(
    idProjectOperation: number | string | Object | boolean,
    email: string
  ): Observable<ProjectOperation> {
    const encodedEmail = encodeURIComponent(email)
    const url = `${this.apiUrl}/assignUser/${idProjectOperation}/${encodedEmail}`

    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.post<ProjectOperation>(url, {}, { headers }).pipe(
          catchError((error) => {
            console.error(
              "❌ Erreur lors de l'affectation de l'utilisateur :",
              error
            )
            return throwError(() => error)
          })
        )
      )
    )
  }
  deletePhase(idPhase: number): Observable<void> {
    const url = `${this.apiUrl}/phase/${idPhase}`

    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.delete<void>(url, { headers }).pipe(
          catchError((error) => {
            // Affichage de la réponse complète pour diagnostiquer l'erreur
            console.error(
              '❌ Erreur lors de la suppression de la phase:',
              error
            )

            if (error.error) {
              console.error('Contenu de la réponse:', error.error)
            }

            // Retourner une erreur avec un message détaillé
            return throwError(
              () =>
                new Error(
                  `Impossible de supprimer la phase. Détail : ${error.message || error.statusText}`
                )
            )
          })
        )
      )
    )
  }

  deleteProjectOperation(
    id: number | undefined
  ): Observable<{ message: string }> {
    const url = `${this.apiUrl}/projectOperation/${id}` // URL de l'API pour supprimer l'opération de projet

    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.delete<{ message: string }>(url, { headers }).pipe(
          catchError((error) => {
            // Loggez l'erreur complète pour avoir plus de détails
            console.error(
              "❌ Erreur lors de la suppression de l'opération de projet:",
              error
            )

            // Retourner une erreur personnalisée pour l'utilisateur
            return throwError(
              () => new Error("Impossible de supprimer l'opération de projet.")
            )
          })
        )
      )
    )
  }

  getProjectsByUser(email: string): Observable<ProjectOperation[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const url = `${this.apiUrl}/by-user/${email}`

        return this.http.get<ProjectOperation[]>(url, { headers }).pipe(
          catchError((error) => {
            console.error(
              '❌ Erreur lors de la récupération des projets:',
              error
            )
            return throwError(() => error)
          })
        )
      })
    )
  }

  updateTaskStatus(taskId: number, newStatus: string): Observable<any> {
    const url = `${this.apiUrl}/status/${taskId}/${newStatus}`

    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.http.put(url, null, { headers }).pipe(
          catchError((error) => {
            console.error('❌ Erreur lors de la mise à jour du statut :', error)
            if (error.error) {
              console.error('Détails de la réponse du serveur:', error.error)
            }
            return throwError(() => error)
          })
        )
      })
    )
  }

  addBug(taskid: number, bug: Bug): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const backendUrl = `${this.apiUrl}/addbug/${taskid}` // Corrigé "addBug" en "addbug" pour correspondre au contrôleur
        return this.http.post(backendUrl, bug, { headers }).pipe(
          // Ajout du paramètre `bug` comme corps de la requête
          catchError((error) => {
            console.error("❌ Erreur lors de l'ajout du bug :", error)
            return throwError(() => error)
          })
        )
      })
    )
  }

  getProjectByTaskId(idProjectTask: number): Observable<Project> {
    const url = `${this.apiUrl}/by-task/${idProjectTask}`

    return this.http.get<Project>(url).pipe(
      switchMap((project) => {
        console.log('✅ Projet récupéré:', project)
        return new Observable<Project>((observer) => {
          observer.next(project)
          observer.complete()
        })
      }),
      catchError((error) => {
        console.error('❌ Erreur lors de la récupération du projet :', error)
        return throwError(() => error)
      })
    )
  }
  private extractBugsFromProject(project: Project, taskId: number): Bug[] {
    let bugs: Bug[] = []

    project.phases?.forEach((phase) => {
      phase.projectOperations?.forEach((operation) => {
        operation.projectTasks?.forEach((task) => {
          if (task.id === taskId) {
            bugs = task.bugs || [] // Récupérer les bugs si la tâche correspond
          }
        })
      })
    })

    return bugs
  }
  getBugsForProject(idProject: number): Observable<
    (Bug & {
      phaseName: string
      operationId: number
      taskId: number
      projectName: string
    })[]
  > {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const url = `${this.apiUrl}/getprojectdto/${idProject}`
        return this.http.get<Project>(url, { headers }).pipe(
          map((project: Project) => {
            return project.phases.flatMap((phase) =>
              phase.projectOperations.flatMap(
                (operation) =>
                  operation.projectTasks?.flatMap(
                    (task) =>
                      task.bugs?.map((bug) => ({
                        ...bug,
                        phaseName: phase.phase_name,
                        operationId: operation.idoperation,
                        taskId: task.id,
                        projectName: project.name, // Ajout de projectName basé sur project.name
                      })) || []
                  ) || []
              )
            )
          }),
          catchError((error) => {
            console.error(
              `❌ Erreur lors de la récupération des bugs pour le projet ID ${idProject} :`,
              error
            )
            return throwError(() => error)
          })
        )
      })
    )
  }

  updateBugStatus(bugId: number, newStatus: string): Observable<Bug> {
    const url = `${this.apiUrl}/${bugId}/bugstatus` // URL correspondant au @PutMapping

    return this.getHeaders().pipe(
      switchMap((headers) => {
        // Les @RequestParam dans Spring sont envoyés comme query parameters
        const params = new HttpParams().set('newStatus', newStatus)

        return this.http
          .put<Bug>(url, null, {
            headers,
            params,
          })
          .pipe(
            map((response: Bug) => {
              console.log('✅ Statut du bug mis à jour:', response)
              return response
            }),
            catchError((error) => {
              console.error(
                '❌ Erreur lors de la mise à jour du statut du bug :',
                error
              )
              if (error.error) {
                console.error('Détails de la réponse du serveur:', error.error)
              }
              return throwError(() => error)
            })
          )
      })
    )
  }
  getTechnologySuggestions(
    projectType: string,
    description: string,
    requirements: string[],
    deadline: string
  ): Observable<TechnologyStack[]> {
    const url = `${this.apiUrl}/suggest-technologies`

    let params = new HttpParams()
      .set('projectType', projectType)
      .set('description', description)
      .set('deadline', deadline)

    requirements.forEach((requirement) => {
      params = params.append('requirements', requirement)
    })

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.get<any>(url, { headers, params }).pipe(
          map((response: any) => {
            console.log('✅ Suggestions de technologies reçues:', response)
            if (response && response.stacks) {
              return response.stacks // Retourne TechnologyStack[]
            }
            return []
          }),
          catchError((error) => {
            console.error(
              '❌ Erreur lors de la récupération des suggestions de technologies :',
              error
            )
            if (error.error) {
              console.error('Détails de la réponse du serveur:', error.error)
            }
            return throwError(() => error)
          })
        )
      })
    )
  }
  addTechnologiesToProject(
    projectId: number,
    technologies: (string | number | boolean | null | Object)[]
  ): Observable<Project> {
    const url = `${this.apiUrl}/${projectId}/add-technologies` // Correspond au @PostMapping du controller

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.post<Project>(url, technologies, { headers }).pipe(
          map((response: Project) => {
            console.log('✅ Technologies ajoutées au projet:', response)
            return response
          }),
          catchError((error) => {
            console.error(
              "❌ Erreur lors de l'ajout des technologies au projet :",
              error
            )
            if (error.error) {
              console.error('Détails de la réponse du serveur:', error.error)
            }
            return throwError(() => error)
          })
        )
      })
    )
  }

  // Suggest a bug fix by providing the bug ID
  // Suggest a bug fix by providing the bug ID
  suggestBugFix(idbug: number): Observable<any> {
    const url = `${this.apiUrl}/suggest-fix/${idbug}`

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.post<any>(url, {}, { headers }).pipe(
          map((response: any) => {
            console.log('✅ Bug fix suggestion received:', response)

            // Retourner directement les informations de la réponse
            return {
              rootCauseAnalysis:
                response.rootCauseAnalysis ||
                'No root cause analysis available.',
              codeCorrectionSuggestion:
                response.codeCorrectionSuggestion ||
                'No code correction suggestion available.',
              performanceImprovementTips:
                response.performanceImprovementTips ||
                'No performance improvement tips available.',
            }
          }),
          catchError((error) => {
            console.error(
              '❌ Erreur lors de la récupération de la suggestion de correction de bug :',
              error
            )
            return throwError(
              () =>
                new Error(
                  'Erreur survenue lors de la récupération de la suggestion de correction de bug'
                )
            )
          })
        )
      })
    )
  }

  ///////////////////:::::resources ////////////////////////////////

  // Ajout d'une ressource
  addResource(dto: Resource): Observable<Resource> {
    const url = `${this.apiUrl}/resources`

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http
          .post<Resource>(url, dto, { headers })
          .pipe(catchError(this.handleError))
      })
    )
  }

  // Mise à jour d'une ressource
  updateResource(dto: Resource): Observable<Resource> {
    const url = `${this.apiUrl}/resources/${dto.resourceId}`

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http
          .put<Resource>(url, dto, { headers })
          .pipe(catchError(this.handleError))
      })
    )
  }

  // Suppression d'une ressource
  deleteResource(resourceId: number | undefined): Observable<void> {
    const url = `${this.apiUrl}/resources/${resourceId}`

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http
          .delete<void>(url, { headers })
          .pipe(catchError(this.handleError))
      })
    )
  }

  // Récupérer une ressource par ID
  getResourceById(resourceId: number): Observable<Resource> {
    const url = `${this.apiUrl}/resources/${resourceId}`

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http
          .get<Resource>(url, { headers })
          .pipe(catchError(this.handleError))
      })
    )
  }

  // Récupérer toutes les ressources
  getAllResources(): Observable<Resource[]> {
    const url = `${this.apiUrl}/resources`

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http
          .get<Resource[]>(url, { headers })
          .pipe(catchError(this.handleError))
      })
    )
  }

  // Affecter une ressource à un utilisateur
  assignResourceToUser(
    resourceId: number | undefined,
    userId: string
  ): Observable<Resource> {
    const url = `${this.apiUrl}/resources/${resourceId}/assign/${userId}`

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http
          .post<Resource>(url, {}, { headers })
          .pipe(catchError(this.handleError))
      })
    )
  }
  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error)
    return throwError(
      () => new Error('Une erreur est survenue. Veuillez réessayer plus tard.')
    )
  }

  assignResourcesToProject(
    projectId: number,
    resourceIds: (number | undefined)[]
  ): Observable<Project> {
    const url = `${this.apiUrl}/${projectId}/assign-resources`

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) =>
        this.http
          .post<Project>(url, resourceIds, { headers })
          .pipe(catchError(this.handleError))
      )
    )
  }
  unassignResourceFromProject(
    projectId: number,
    resourceId: number
  ): Observable<Project> {
    const url = `${this.apiUrl}/${projectId}/resources/${resourceId}` // Matches DELETE /api/projects/{projectId}/resources/{resourceId}

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) =>
        this.http
          .delete<Project>(url, { headers })
          .pipe(catchError(this.handleError))
      )
    )
  }

  unassignResourceFromUser(
    resourceId: number | undefined,
    userId: string
  ): Observable<Resource> {
    const url = `${this.apiUrl}/resources/${resourceId}/unassign/${userId}`

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http
          .post<Resource>(url, {}, { headers })
          .pipe(catchError(this.handleError))
      })
    )
  }

  // Method to get a project by projectOppId
  getProjectByProjectOpp(
    projectOppId: number | undefined
  ): Observable<Project> {
    const url = `${this.apiUrl}/by-project-opp/${projectOppId}`

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http
          .get<Project>(url, { headers })
          .pipe(catchError(this.handleError))
      })
    )
  }

  updateProjectDates(
    projectId: number,
    startDate: string,
    endDate: string
  ): Observable<Project> {
    const url = `${this.apiUrl}/${projectId}/update-dates`
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http
          .put<Project>(url, null, { headers, params })
          .pipe(catchError(this.handleError))
      })
    )
  }

  predictProjectDuration(projectId: number): Observable<string> {
    const url = `${this.apiUrl}/predictprojectdurationn/${projectId}`

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http
          .post(url, null, { headers, responseType: 'text' }) // responseType: 'text' car le backend retourne une chaîne
          .pipe(catchError(this.handleError))
      })
    )
  }
  updateProject(idProjet: number, updatedProject: any): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const backendUrl = `${this.apiUrl}/${idProjet}` // L'URL de mise à jour
        return this.http.put(backendUrl, updatedProject, { headers }).pipe(
          catchError((error) => {
            console.error('❌ Erreur lors de la mise à jour du projet :', error)
            return throwError(() => error)
          })
        )
      })
    )
  }

  deleterequirement(
    idProject: number | undefined | string | null | Object | boolean,
    requirement: string
  ): Observable<any> {
    // On commence par récupérer les headers, puis on effectue la suppression via switchMap
    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        // Construire l'URL de l'API pour la suppression de l'exigence
        const url = `${this.apiUrl}/deleteRequirement/${idProject}/${requirement}`
        // Envoie de la requête DELETE avec les headers
        return this.http.delete(url, { headers })
      })
    )
  }

  deletertechnology(
    idProject: number | undefined | string | null | Object | boolean,
    tech: string
  ): Observable<any> {
    // On commence par récupérer les headers, puis on effectue la suppression via switchMap
    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        // Construire l'URL de l'API pour la suppression de l'exigence
        const url = `${this.apiUrl}/deleteTechnology/${idProject}/${tech}`
        // Envoie de la requête DELETE avec les headers
        return this.http.delete(url, { headers })
      })
    )
  }

  addManyRequirements(
    idProject: number | undefined | string | null | Object  | boolean,
    reqs: string[]
  ): Observable<any> {
    // Définir les headers si nécessaire
    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        const url = `${this.apiUrl}/addRequirements/${idProject}` // URL avec idProject
        return this.http.post(url, reqs, { headers }) // Envoi de la requête POST
      })
    )
  }

  addManytechs(
    idProject: number | undefined | string | null | Object  | boolean,
    reqs: string[]
  ): Observable<any> {
    // Définir les headers si nécessaire
    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        const url = `${this.apiUrl}/addTechnologies/${idProject}` // URL avec idProject
        return this.http.post(url, reqs, { headers }) // Envoi de la requête POST
      })
    )
  }


  suggestPhases(idProject: number): Observable<Phasesugg[]> {
    const url = `${this.apiUrl}/suggestphases/${idProject}`;

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.post<any>(url, {}, { headers }).pipe(
          map((response: any) => {
            console.log('✅ Phases suggérées reçues:', response);
            if (response && response.phases) {
              return response.phases as Phasesugg[]; // Conversion explicite
            }
            return [];
          }),
          catchError((error) => {
            console.error('❌ Erreur lors de la récupération des phases suggérées:', error);
            if (error.error) {
              console.error('Détails de la réponse du serveur:', error.error);
            }
            return throwError(() => error);
          })
        );
      })
    );
  }


  addPhasesToProject(projectId: number, phases: Phasesugg[]): Observable<any> {
    const url = `${this.apiUrl}/${projectId}/addPhasessuggtoproject`;

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.post(url, phases, { headers, responseType: 'text' }).pipe(
          map((response: string) => {
            console.log('✅ Réponse texte reçue :', response);
            return response; // c'est du texte
          }),
          catchError((error) => {
            console.error('❌ Erreur lors de l\'ajout des phases au projet:', error);
            if (error.error) {
              console.error('Détails de la réponse du serveur:', error.error);
            }
            return throwError(() => error);
          })
        );
      })
    );
  }

  deleteAllPhasesFromProject(
    idProject: number
  ): Observable<any> {
    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        const url = `${this.apiUrl}/${idProject}/delete-all-phases`;
        return this.http.delete(url, { headers, responseType: 'text' });
      }),
      catchError(err => {
        console.error('Error deleting phases:', err);
        return throwError(() => err);
      })
    );
  }

  updatePhase(idPhase: number, name: string, description: string): Observable<any> {
    const url = `${this.apiUrl}/phase/${idPhase}?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`;

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.put(url, {}, { headers, responseType: 'text' }).pipe( // body vide car PUT sans body
          map((response: string) => {
            console.log('✅ Phase mise à jour avec succès :', response);
            return response; // C'est du texte
          }),
          catchError((error) => {
            console.error('❌ Erreur lors de la mise à jour de la phase:', error);
            if (error.error) {
              console.error('Détails de la réponse du serveur:', error.error);
            }
            return throwError(() => error);
          })
        );
      })
    );
  }
// 🛠️ Mise à jour du Bug
  updateBug(idBug: number | undefined, updatedBug: Bug): Observable<any> {
    const url = `${this.apiUrl}/bug/${idBug}`;

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.put(url, updatedBug, { headers, responseType: 'json' }).pipe(
          map((response: any) => {
            console.log('✅ Bug mis à jour avec succès :', response);
            return response;
          }),
          catchError((error) => {
            console.error('❌ Erreur lors de la mise à jour du bug :', error);
            if (error.error) {
              console.error('Détails de la réponse du serveur:', error.error);
            }
            return throwError(() => error);
          })
        );
      })
    );
  }

  // 🛠️ Suppression du Bug
  deleteBug(idBug: number | undefined): Observable<any> {
    const url = `${this.apiUrl}/bug/${idBug}`;

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.delete(url, { headers, responseType: 'text' }).pipe(
          map((response: string) => {
            console.log('✅ Bug supprimé avec succès');
            return response;  // C’est juste du texte (vide normalement)
          }),
          catchError((error) => {
            console.error('❌ Erreur lors de la suppression du bug :', error);
            if (error.error) {
              console.error('Détails de la réponse du serveur:', error.error);
            }
            return throwError(() => error);
          })
        );
      })
    );
  }
  getClients(): Observable<UserDTO[]> {
    const url = `${this.apiUrl}/clients`;

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.get<UserDTO[]>(url, { headers }).pipe(
          catchError(this.handleError)
        );
      })
    );
  }



  getTaskInfo(idtask: number): Observable<TaskInfoDTO> {
    const url = `${this.apiUrl}/getinfo/${idtask}`;

    return this.getHeaders().pipe(
      switchMap((headers: HttpHeaders) => {
        return this.http.get<TaskInfoDTO>(url, { headers }).pipe(
          catchError(this.handleError)
        );
      })
    );
  }




}
