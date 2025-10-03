import {  FormGroup, Validators, ReactiveFormsModule,  FormBuilder } from "@angular/forms"
import {  NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap"
import  { CrudClassiqueService } from "@/app/services/crudClassique.service"
import  { SweetAlertService } from "@/app/services/sweet-alert.service"
import  { ChangeDetectorRef } from "@angular/core"
import { Component,  OnInit,  OnDestroy,  TemplateRef, ViewChild } from "@angular/core"
import { forkJoin,  Subscription } from "rxjs"
import { CommonModule } from "@angular/common"
import {
   WorkFlow,
   Process,
   ProcessDTO,
   Objective,
   ObjectiveDTO,
   Operation,
   OperationDTO,
   Task,
   TaskDTO,
   Poste,
   Data,
   UserRepresentation,
  Axe,
} from "@/app/core/models/crudClassique.model"
import { DateValidator } from "@/app/services/date-validator"

@Component({
  selector: "app-workflow-classic-crud",
  templateUrl: "./workflow-classic-crud.component.html",
  styleUrls: ["./workflow-classic-crud.component.css"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModalModule],
})
export class WorkflowClassicCrudComponent implements OnInit, OnDestroy {
  @ViewChild("addProcessModal") addProcessModal!: TemplateRef<any>
  @ViewChild("addObjectiveModal") addObjectiveModal!: TemplateRef<any>
  @ViewChild("addOperationModal") addOperationModal!: TemplateRef<any>
  @ViewChild("addTaskModal") addTaskModal!: TemplateRef<any>
  @ViewChild("workflowNameModal") workflowNameModal!: TemplateRef<any>

  workflowNameForm: FormGroup
  processForm: FormGroup
  objectiveForm: FormGroup
  operationForm: FormGroup
  taskForm: FormGroup

  workflows: WorkFlow[] = []
  selectedWorkflow: WorkFlow | null = null
  processes: ProcessDTO[] = []
  objectives: ObjectiveDTO[] = []
  operations: OperationDTO[] = []
  tasks: TaskDTO[] = []
  users: UserRepresentation[] = []
  postes: Poste[] = []
  dataList: Data[] = []

  selectedProcess: ProcessDTO | null = null
  selectedObjective: ObjectiveDTO | null = null
  selectedOperation: OperationDTO | null = null
  selectedTask: TaskDTO | null = null
  selectedOperationTasks: TaskDTO[] = []

  submitted = false
  loading = false
  axes = Object.values(Axe)


  private subscriptions: Subscription[] = []

  constructor(
    private fb: FormBuilder,
    private crudService: CrudClassiqueService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private sweetAlertService: SweetAlertService,
  ) {
    this.workflowNameForm = this.fb.group({
      workflowName: ["", [Validators.required, Validators.minLength(3)]],
    })

    this.processForm = this.fb.group(
      {
        id: [null],
        procName: ["", Validators.required],
        creationDate: ["", [Validators.required, DateValidator.pastOrToday]],
        modifDate: ["", [DateValidator.pastOrToday]],
        finishDate: [""],
        description: ["", Validators.required],
        pilote: [null, Validators.required],
      },
      { validators: DateValidator.creationBeforeFinish("creationDate", "finishDate") },
    )

    this.objectiveForm = this.fb.group({
      idObjective: [null],
      title: ["", Validators.required],
      axe: ["", Validators.required],
    })

    this.operationForm = this.fb.group(
      {
        id: [null],
        operationName: ["", Validators.required],
        operationDescription: ["", Validators.required],
        creationDate: ["", [Validators.required, DateValidator.pastOrToday]],
        finishDate: [""],
        postes: [[]],
      },
      { validators: DateValidator.creationBeforeFinish("creationDate", "finishDate") },
    )

    this.taskForm = this.fb.group(
      {
        id: [null],
        taskName: ["", Validators.required],
        taskDescription: ["", Validators.required],
        taskStatus: ["TODO", Validators.required],
        creationDate: ["", [Validators.required, DateValidator.pastOrToday]],
        finishDate: [""],
        priority: ["MEDIUM"],
        dataIds: [[]],
      },
      { validators: DateValidator.creationBeforeFinish("creationDate", "finishDate") },
    )
  }

  ngOnInit(): void {
    this.loadInitialData()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  async loadInitialData(): Promise<void> {
    this.loading = true
    try {
      const processesPromise = this.crudService.getAllProcesses()
      const usersPromise = this.crudService.loadUsersFromKeycloak()
      const postesPromise = this.crudService.getAllPostes()
      const dataPromise = this.crudService.getAllData()
      const workflowsPromise = this.crudService.getAllWorkflows()

      const [processesObservable, usersObservable, postesObservable, dataObservable, workflowsObservable] =
        await Promise.all([processesPromise, usersPromise, postesPromise, dataPromise, workflowsPromise])

      const subscription = forkJoin({
        processes: processesObservable,
        users: usersObservable,
        postes: postesObservable,
        data: dataObservable,
        workflows: workflowsObservable,
      }).subscribe({
        next: ({ processes, users, postes, data, workflows }) => {
          this.processes = processes
          this.users = users
          this.postes = postes
          this.dataList = data
          this.workflows = workflows
          this.loading = false

          console.log("✅ Initial data loaded successfully")
          console.log("📊 Processes loaded:", this.processes)
          console.log("👥 Users loaded:", this.users)
          console.log("💼 Postes loaded:", this.postes)
          console.log("🔄 Workflows loaded:", this.workflows)

          setTimeout(() => this.showWorkflowInfoMessage(), 500)
        },
        error: (error: unknown) => {
          this.loading = false
          console.error("❌ Error loading initial data:", error)
          this.sweetAlertService.showError("Erreur lors du chargement des données initiales")
        },
      })

      this.subscriptions.push(subscription)
    } catch (error) {
      this.loading = false
      console.error("❌ Error in loadInitialData:", error)
      this.sweetAlertService.showError("Erreur lors du chargement des données")
    }
  }

  showWorkflowInfoMessage(): void {
    if (!this.selectedWorkflow && this.workflows.length > 0) {
      this.sweetAlertService.showInfo(
        "Sélectionnez un workflow ci-dessus pour voir ses processus, ou créez de nouveaux processus puis sauvegardez-les dans un workflow.",
      )
    }
  }

  async selectWorkflow(workflow: WorkFlow): Promise<void> {
    console.log("🔄 Workflow selected:", workflow)
    this.selectedWorkflow = workflow
    this.selectedProcess = null
    this.selectedOperation = null
    this.objectives = []
    this.operations = []
    this.selectedOperationTasks = []

    if (workflow.processes && workflow.processes.length > 0) {
      this.processes = workflow.processes.map((process) => ({
        id: process.id,
        procName: process.procName,
        creationDate: process.creationDate,
        modifDate: process.modifDate,
        finishDate: process.finishDate,
        description: process.description,
        piloteName: process.pilote?.username || "N/A",
      }))
      console.log("✅ Workflow processes loaded:", this.processes)
    } else {
      this.processes = []
      console.log("⚠️ No processes found in selected workflow")
    }
    this.cdr.detectChanges()
  }

  openWorkflowNameModal(): void {
    this.workflowNameForm.reset()
    this.modalService.open(this.workflowNameModal)
  }

  async submitWorkflowName(): Promise<void> {
    if (this.workflowNameForm.valid) {
      try {
        const workflowName = this.workflowNameForm.get("workflowName")?.value

        if (!this.processes || this.processes.length === 0) {
          this.sweetAlertService.showError(
            "Le workflow doit contenir au moins un processus. Veuillez d'abord créer des processus.",
          )
          return
        }

        const processesForWorkflow = await this.buildProcessesForWorkflow()
        const workflow: WorkFlow = {
          name: workflowName,
          workflowData: JSON.stringify({
            processCount: processesForWorkflow.length,
            createdAt: new Date().toISOString(),
          }),
          processes: processesForWorkflow,
        }

        console.log("💾 Saving workflow with processes:", workflow)
        const workflowObservable = await this.crudService.saveWorkflow(workflow)

        const subscription = workflowObservable.subscribe({
          next: (savedWorkflow) => {
            console.log("✅ Workflow saved successfully:", savedWorkflow)
            this.modalService.dismissAll()
            this.loadInitialData()
            this.sweetAlertService.showSuccess(`Workflow "${workflowName}" sauvegardé avec succès !`)
          },
          error: (error: unknown) => {
            console.error("❌ Error saving workflow:", error)
            let errorMessage = "Erreur lors de la sauvegarde du workflow."
            if (error instanceof Error) {
              const backendError = error.message.replace("API Error: ", "")
              errorMessage = backendError
            }
            this.sweetAlertService.showError(errorMessage)
          },
        })

        this.subscriptions.push(subscription)
      } catch (error) {
        console.error("❌ Error in submitWorkflowName:", error)
        this.sweetAlertService.showError("Erreur lors de la sauvegarde du workflow. Veuillez réessayer.")
      }
    }
  }

  private async buildProcessesForWorkflow(): Promise<Process[]> {
    const processesForWorkflow: Process[] = []
    for (const processDTO of this.processes) {
      try {
        const processObservable = await this.crudService.getProcessById(processDTO.id!)
        await new Promise<void>((resolve, reject) => {
          const subscription = processObservable.subscribe({
            next: (fullProcess) => {
              processesForWorkflow.push(fullProcess)
              resolve()
            },
            error: (error) => {
              console.error(`❌ Error loading process ${processDTO.id}:`, error)
              reject(error)
            },
          })
          this.subscriptions.push(subscription)
        })
      } catch (error) {
        console.error(`❌ Error building process ${processDTO.id} for workflow:`, error)
      }
    }
    return processesForWorkflow
  }

  openProcessModal(process?: ProcessDTO): void {
    this.submitted = false
    this.processForm.reset()
    if (process) {
      this.processForm.patchValue({
        id: process.id,
        procName: process.procName,
        creationDate: process.creationDate,
        modifDate: process.modifDate,
        finishDate: process.finishDate,
        description: process.description,
        pilote: this.users.find((u) => u.username === process.piloteName),
      })
    }
    this.modalService.open(this.addProcessModal)
  }

  async saveProcess(): Promise<void> {
    this.submitted = true
    if (this.processForm.invalid) return

    try {
      const process: Process = {
        id: this.processForm.value.id,
        procName: this.processForm.value.procName,
        creationDate: this.processForm.value.creationDate,
        modifDate: this.processForm.value.modifDate,
        finishDate: this.processForm.value.finishDate,
        description: this.processForm.value.description,
        pilote: {
          id: this.processForm.value.pilote.id,
          username: this.processForm.value.pilote.username,
        },
      }

      console.log("💾 Saving process:", process)
      const request = this.processForm.value.id
        ? await this.crudService.updateProcess(this.processForm.value.id, process)
        : await this.crudService.addProcess(process)

      const subscription = request.subscribe({
        next: (response) => {
          console.log("✅ Process saved successfully:", response)
          this.modalService.dismissAll()
          this.submitted = false
          if (this.selectedWorkflow) {
            this.selectWorkflow(this.selectedWorkflow)
          } else {
            this.loadInitialData()
          }
          this.sweetAlertService.showSuccess("Processus sauvegardé avec succès !")
        },
        error: (error: unknown) => {
          console.error("❌ Error saving process:", error)
          this.submitted = false
          this.sweetAlertService.showError("Erreur lors de la sauvegarde du processus")
        },
      })

      this.subscriptions.push(subscription)
    } catch (error) {
      console.error("❌ Error in saveProcess:", error)
      this.submitted = false
      this.sweetAlertService.showError("Erreur lors de la sauvegarde du processus")
    }
  }

  async deleteProcess(id: number): Promise<void> {
    const result = await this.sweetAlertService.showConfirm(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer ce processus ? Cette action est irréversible.",
      [
        { text: "Oui, supprimer", value: "confirm" },
        { text: "Annuler", value: "cancel" },
      ],
    )
    if (!result.isConfirmed) return

    try {
      const request = await this.crudService.deleteProcess(id)
      const subscription = request.subscribe({
        next: () => {
          console.log("✅ Process deleted successfully")
          this.processes = this.processes.filter((p) => p.id !== id)
          if (this.selectedProcess?.id === id) {
            this.selectedProcess = null
            this.objectives = []
            this.operations = []
            this.tasks = []
          }
          this.cdr.detectChanges()
          this.sweetAlertService.showSuccess("Processus supprimé avec succès !")
        },
        error: (error: unknown) => {
          console.error("❌ Error deleting process:", error)
          this.sweetAlertService.showError("Erreur lors de la suppression du processus")
        },
      })
      this.subscriptions.push(subscription)
    } catch (error) {
      console.error("❌ Error in deleteProcess:", error)
      this.sweetAlertService.showError("Erreur lors de la suppression du processus")
    }
  }

  selectProcess(process: ProcessDTO): void {
    console.log("🎯 Process selected:", process)
    this.selectedProcess = process
    this.loadProcessDetails(process.id!)
  }

  async loadProcessDetails(processId: number): Promise<void> {
    this.loading = true
    console.log("🔍 Loading details for processId:", processId)

    try {
      const objectivesObservable = await this.crudService.getAllObjectives()
      const operationsObservable = await this.crudService.getAllOperations()
      const tasksObservable = await this.crudService.getAllTasks()

      const subscription = forkJoin({
        allObjectives: objectivesObservable,
        allOperations: operationsObservable,
        allTasks: tasksObservable,
      }).subscribe({
        next: ({ allObjectives, allOperations, allTasks }) => {
          console.log("📥 All objectives DTO received:", allObjectives)
          console.log("📥 All operations received:", allOperations)
          console.log("📥 All tasks received:", allTasks)

          this.objectives = allObjectives.filter((obj: ObjectiveDTO) => {
            const objectiveProcessId = obj.processId
            const targetProcessId = Number(processId)
            const matches = objectiveProcessId === targetProcessId
            console.log(`🎯 Filtering objective "${obj.title}":`, {
              objectiveProcessId,
              targetProcessId,
              matches,
              objective: obj,
            })
            return matches
          })

          this.operations = allOperations.filter((operation: OperationDTO) => {
            const operationProcessId = Number(operation.processId)
            const targetProcessId = Number(processId)
            const matches = operationProcessId === targetProcessId
            console.log(`⚙️ Filtering operation "${operation.operationName}":`, {
              operationProcessId,
              targetProcessId,
              matches,
              operation,
            })
            return matches
          })

          this.tasks = allTasks
          this.selectedOperation = null
          this.selectedOperationTasks = []

          console.log("✅ Final objectives for display:", this.objectives)
          console.log("✅ Final operations for display:", this.operations)
          this.loading = false
          this.cdr.detectChanges()
        },
        error: (error: unknown) => {
          console.error("❌ Error loading process details:", error)
          this.loading = false
          this.cdr.detectChanges()
          this.sweetAlertService.showError("Erreur lors du chargement des détails du processus")
        },
      })

      this.subscriptions.push(subscription)
    } catch (error) {
      console.error("❌ Error awaiting observables:", error)
      this.loading = false
      this.cdr.detectChanges()
      this.sweetAlertService.showError("Erreur lors du chargement des détails")
    }
  }

  selectOperation(operation: OperationDTO): void {
    console.log("🎯 Operation selected:", operation)
    this.selectedOperation = operation
    this.selectedOperationTasks = this.tasks.filter((task: TaskDTO) => {
      const taskOperationId = Number(task.operationId)
      const targetOperationId = Number(operation.id)
      const matches = taskOperationId === targetOperationId
      console.log(`📋 Filtering task "${task.taskDescription}":`, {
        taskOperationId,
        targetOperationId,
        matches,
        task,
      })
      return matches
    })
    console.log("✅ Final tasks for operation:", this.selectedOperationTasks)
    this.cdr.detectChanges()
  }

  openObjectiveModal(objective?: ObjectiveDTO): void {
    if (!this.selectedProcess) {
      this.sweetAlertService.showWarning("Veuillez d'abord sélectionner un processus")
      return
    }
    this.submitted = false
    this.objectiveForm.reset()
    if (objective) {
      this.objectiveForm.patchValue({
        idObjective: objective.idObjective,
        title: objective.title,
        axe: objective.axe,
      })
    }
    this.modalService.open(this.addObjectiveModal)
  }

  async saveObjective(): Promise<void> {
    this.submitted = true
    if (this.objectiveForm.invalid || !this.selectedProcess) return

    try {
      const objective: Objective = {
        idObjective: this.objectiveForm.value.idObjective,
        title: this.objectiveForm.value.title,
        axe: this.objectiveForm.value.axe,
        process: { id: this.selectedProcess.id! },
      }

      console.log("💾 Saving objective:", objective)
      const request = this.objectiveForm.value.idObjective
        ? await this.crudService.updateObjective(this.objectiveForm.value.idObjective, objective)
        : await this.crudService.addObjective(objective)

      const subscription = request.subscribe({
        next: (response) => {
          console.log("✅ Objective saved successfully:", response)
          this.modalService.dismissAll()
          this.loadProcessDetails(this.selectedProcess!.id!)
          this.submitted = false
          this.sweetAlertService.showSuccess("Objectif sauvegardé avec succès !")
        },
        error: (error: unknown) => {
          console.error("❌ Error saving objective:", error)
          this.submitted = false
          this.sweetAlertService.showError("Erreur lors de la sauvegarde de l'objectif")
        },
      })

      this.subscriptions.push(subscription)
    } catch (error) {
      console.error("❌ Error in saveObjective:", error)
      this.submitted = false
      this.sweetAlertService.showError("Erreur lors de la sauvegarde de l'objectif")
    }
  }

  async deleteObjective(id: number): Promise<void> {
    const result = await this.sweetAlertService.showConfirm(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cet objectif ?",
      [
        { text: "Oui, supprimer", value: "confirm" },
        { text: "Annuler", value: "cancel" },
      ],
    )
    if (!result.isConfirmed) return

    try {
      const request = await this.crudService.deleteObjective(id)
      const subscription = request.subscribe({
        next: () => {
          console.log("✅ Objective deleted successfully")
          this.objectives = this.objectives.filter((o) => o.idObjective !== id)
          this.cdr.detectChanges()
          this.sweetAlertService.showSuccess("Objectif supprimé avec succès !")
        },
        error: (error: unknown) => {
          console.error("❌ Error deleting objective:", error)
          this.sweetAlertService.showError("Erreur lors de la suppression de l'objectif")
        },
      })
      this.subscriptions.push(subscription)
    } catch (error) {
      console.error("❌ Error in deleteObjective:", error)
      this.sweetAlertService.showError("Erreur lors de la suppression de l'objectif")
    }
  }

  openOperationModal(operation?: OperationDTO): void {
    if (!this.selectedProcess) {
      this.sweetAlertService.showWarning("Veuillez d'abord sélectionner un processus")
      return
    }
    this.submitted = false
    this.operationForm.reset()
    if (operation) {
      const assignedPosteIds: number[] = []
      if (operation.assignedUsers && operation.assignedUsers.length > 0) {
        for (const userInfo of operation.assignedUsers) {
          if (!isNaN(Number(userInfo))) {
            assignedPosteIds.push(Number(userInfo))
          } else {
            const poste = this.postes.find((p) => p.mission === userInfo)
            if (poste && poste.id) {
              assignedPosteIds.push(poste.id)
            }
          }
        }
      }

      this.operationForm.patchValue({
        id: operation.id,
        operationName: operation.operationName,
        operationDescription: operation.operationDescription,
        creationDate: operation.creationDate,
        finishDate: operation.finishDate,
        postes: assignedPosteIds,
      })
    }
    this.modalService.open(this.addOperationModal)
  }

  async saveOperation(): Promise<void> {
    this.submitted = true
    if (this.operationForm.invalid || !this.selectedProcess) return

    try {
      const operation: Operation = {
        id: this.operationForm.value.id,
        operationName: this.operationForm.value.operationName,
        operationDescription: this.operationForm.value.operationDescription,
        creationDate: this.operationForm.value.creationDate,
        finishDate: this.operationForm.value.finishDate,
        process: { id: this.selectedProcess.id! },
      }

      console.log("💾 Saving operation:", operation)
      const request = this.operationForm.value.id
        ? await this.crudService.updateOperation(this.operationForm.value.id, operation)
        : await this.crudService.addOperation(operation)

      const subscription = request.subscribe({
        next: async (response) => {
          console.log("✅ Operation saved successfully:", response)
          if (this.operationForm.value.postes && this.operationForm.value.postes.length > 0) {
            try {
              const assignRequest = await this.crudService.assignPostesToOperation(
                response.id!,
                new Set(this.operationForm.value.postes),
              )
              const assignSubscription = assignRequest.subscribe({
                next: () => console.log("✅ Postes assigned successfully"),
                error: (error: unknown) => console.error("❌ Error assigning postes:", error),
              })
              this.subscriptions.push(assignSubscription)
            } catch (error) {
              console.error("❌ Error in assignPostesToOperation:", error)
            }
          }
          this.modalService.dismissAll()
          this.loadProcessDetails(this.selectedProcess!.id!)
          this.submitted = false
          this.sweetAlertService.showSuccess("Opération sauvegardée avec succès !")
        },
        error: (error: unknown) => {
          console.error("❌ Error saving operation:", error)
          this.submitted = false
          this.sweetAlertService.showError("Erreur lors de la sauvegarde de l'opération")
        },
      })

      this.subscriptions.push(subscription)
    } catch (error) {
      console.error("❌ Error in saveOperation:", error)
      this.submitted = false
      this.sweetAlertService.showError("Erreur lors de la sauvegarde de l'opération")
    }
  }

  async deleteOperation(id: number): Promise<void> {
    const result = await this.sweetAlertService.showConfirm(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette opération ?",
      [
        { text: "Oui, supprimer", value: "confirm" },
        { text: "Annuler", value: "cancel" },
      ],
    )
    if (!result.isConfirmed) return

    try {
      const request = await this.crudService.deleteOperation(id)
      const subscription = request.subscribe({
        next: () => {
          console.log("✅ Operation deleted successfully")
          this.operations = this.operations.filter((o) => o.id !== id)
          this.cdr.detectChanges()
          this.sweetAlertService.showSuccess("Opération supprimée avec succès !")
        },
        error: (error: unknown) => {
          console.error("❌ Error deleting operation:", error)
          this.sweetAlertService.showError("Erreur lors de la suppression de l'opération")
        },
      })
      this.subscriptions.push(subscription)
    } catch (error) {
      console.error("❌ Error in deleteOperation:", error)
      this.sweetAlertService.showError("Erreur lors de la suppression de l'opération")
    }
  }

  openTaskModal(operation: OperationDTO, task?: TaskDTO): void {
    this.submitted = false
    this.taskForm.reset()
    if (task) {
      this.taskForm.patchValue({
        id: task.id,
        taskName: task.taskName || task.taskDescription,
        taskDescription: task.taskDescription,
        taskStatus: task.taskStatus,
        creationDate: task.creationDate,
        finishDate: task.finishDate,
        estimatedTime: 0,
        priority: "MEDIUM",
        dataIds: [],
      })
    }
    this.selectedOperation = operation
    this.modalService.open(this.addTaskModal)
  }

  async saveTask(): Promise<void> {
    this.submitted = true

    // Marquer tous les champs comme touchés pour afficher les erreurs
    this.markFormGroupTouched(this.taskForm)

    if (this.taskForm.invalid || !this.selectedOperation) {
      console.error("❌ Form invalid or no operation selected")

      // Afficher un message d'erreur spécifique
      if (this.taskForm.invalid) {
        this.sweetAlertService.showError("Veuillez corriger les erreurs dans le formulaire avant de continuer.")
      } else {
        this.sweetAlertService.showError("Aucune opération sélectionnée.")
      }

      this.submitted = false
      return
    }

    try {
      const taskName = this.taskForm.value.taskName?.trim()
      const taskDescription = this.taskForm.value.taskDescription?.trim()

      // Validation supplémentaire côté client
      if (!taskName || taskName.length < 3) {
        this.sweetAlertService.showWarning("Le nom de la tâche doit contenir au moins 3 caractères")
        this.submitted = false
        return
      }

      if (!taskDescription || taskDescription.length < 10) {
        this.sweetAlertService.showWarning("La description de la tâche doit contenir au moins 10 caractères")
        this.submitted = false
        return
      }

      const creationDate = this.taskForm.value.creationDate
      if (!creationDate) {
        this.sweetAlertService.showWarning("La date de création est requise")
        this.submitted = false
        return
      }

      const task: Task = {
        id: this.taskForm.value.id || null,
        taskName: taskName,
        taskDescription: taskDescription,
        taskStatus: this.taskForm.value.taskStatus || "TODO",
        creationDate: creationDate,
        finishDate: this.taskForm.value.finishDate || null,
        estimatedTime: this.taskForm.value.estimatedTime || 0,
        priority: this.taskForm.value.priority || "MEDIUM",
        operation: {
          id: this.selectedOperation.id!,
        },
      }

      console.log("💾 Saving task with all required fields:", task)
      console.log("🎯 Selected operation:", this.selectedOperation)

      const request = this.taskForm.value.id
        ? await this.crudService.updateTask(this.taskForm.value.id, task)
        : await this.crudService.addTask(task)

      const subscription = request.subscribe({
        next: async (response) => {
          console.log("✅ Task saved successfully:", response)

          // Assigner les données si sélectionnées
          if (this.taskForm.value.dataIds && this.taskForm.value.dataIds.length > 0) {
            try {
              const assignRequest = await this.crudService.assignDataToTask(
                response.id!,
                new Set(this.taskForm.value.dataIds),
              )
              const assignSubscription = assignRequest.subscribe({
                next: () => console.log("✅ Data assigned successfully"),
                error: (error: unknown) => console.error("❌ Error assigning data:", error),
              })
              this.subscriptions.push(assignSubscription)
            } catch (error) {
              console.error("❌ Error in assignDataToTask:", error)
            }
          }

          this.modalService.dismissAll()
          if (this.selectedProcess) {
            this.loadProcessDetails(this.selectedProcess.id!)
          }
          this.submitted = false
          this.sweetAlertService.showSuccess("Tâche sauvegardée avec succès !")
        },
        error: (error: unknown) => {
          console.error("❌ Detailed error saving task:", error)
          let errorMessage = "Erreur inconnue"
          if (error instanceof Error) {
            errorMessage = error.message.replace("API Error: ", "")
          } else if (typeof error === "string") {
            errorMessage = error
          }
          this.sweetAlertService.showError(`Erreur lors de la sauvegarde de la tâche: ${errorMessage}`)
          this.submitted = false
        },
      })
      this.subscriptions.push(subscription)
    } catch (error) {
      console.error("❌ Exception in saveTask:", error)
      this.sweetAlertService.showError(`Erreur lors de la sauvegarde de la tâche: ${error}`)
      this.submitted = false
    }
  }

// Méthode utilitaire pour marquer tous les champs comme touchés
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key)
      control?.markAsTouched()

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }

  async deleteTask(id: number): Promise<void> {
    const result = await this.sweetAlertService.showConfirm(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette tâche ?",
      [
        { text: "Oui, supprimer", value: "confirm" },
        { text: "Annuler", value: "cancel" },
      ],
    )
    if (!result.isConfirmed) return

    try {
      const request = await this.crudService.deleteTask(id)
      const subscription = request.subscribe({
        next: () => {
          console.log("✅ Task deleted successfully")
          if (this.selectedProcess) {
            this.loadProcessDetails(this.selectedProcess.id!)
          }
          this.cdr.detectChanges()
          this.sweetAlertService.showSuccess("Tâche supprimée avec succès !")
        },
        error: (error: unknown) => {
          console.error("❌ Error deleting task:", error)
          this.sweetAlertService.showError("Erreur lors de la suppression de la tâche")
        },
      })
      this.subscriptions.push(subscription)
    } catch (error) {
      console.error("❌ Error in deleteTask:", error)
      this.sweetAlertService.showError("Erreur lors de la suppression de la tâche")
    }
  }

  onWorkflowChange(event: Event): void {
    const target = event.target as HTMLSelectElement
    const workflowId = target.value
    if (workflowId && workflowId !== "") {
      const selectedWorkflow = this.workflows.find((w) => w.id?.toString() === workflowId)
      if (selectedWorkflow) {
        this.selectWorkflow(selectedWorkflow)
      }
    } else {
      this.selectedWorkflow = null
      this.processes = []
      this.objectives = []
      this.operations = []
      this.selectedOperationTasks = []
      this.selectedProcess = null
      this.selectedOperation = null
      this.cdr.detectChanges()
    }
  }


  getAssignedPostes(operation: OperationDTO): string[] {
    if (!operation.assignedUsers || operation.assignedUsers.length === 0) {
      return []
    }

    const assignedPostes: string[] = []

    for (const userInfo of operation.assignedUsers) {
      let posteFound = false


      if (!isNaN(Number(userInfo))) {
        const poste = this.postes.find((p) => p.id === Number(userInfo))
        if (poste) {
          assignedPostes.push(poste.mission)
          posteFound = true
        }
      }

      if (!posteFound) {
        const user = this.users.find((u) => u.username === userInfo)
        if (user) {

          const userPoste = this.postes.find((p) => p.userEntity?.username === user.username)
          if (userPoste) {
            assignedPostes.push(userPoste.mission)
            posteFound = true
          }
        }
      }

      if (!posteFound) {
        const directPoste = this.postes.find((p) => p.mission === userInfo)
        if (directPoste) {
          assignedPostes.push(directPoste.mission)
          posteFound = true
        }
      }

      if (!posteFound) {
        assignedPostes.push(`${userInfo} (Non résolu)`)
      }
    }

    return assignedPostes
  }

  getPosteNameById(posteId: number): string {
    const poste = this.postes.find((p) => p.id === posteId)
    return poste ? poste.mission : "Poste inconnu"
  }

  getTaskStatusLabel(status: string | undefined): string {
    if (!status) return "Unknown"
    switch (status) {
      case "TODO":
        return "To Do"
      case "IN_PROGRESS":
        return "In Progress"
      case "DONE":
        return "Done"
      default:
        return status
    }
  }

  getTaskStatusIcon(status: string | undefined): string {
    if (!status) return "fa-question"
    switch (status) {
      case "TODO":
        return "fa-clock"
      case "IN_PROGRESS":
        return "fa-spinner"
      case "DONE":
        return "fa-check"
      default:
        return "fa-question"
    }
  }

  getTaskStatusBadgeClass(status: string | undefined): string {
    if (!status) return "bg-secondary text-white"
    switch (status) {
      case "TODO":
        return "bg-warning text-dark"
      case "IN_PROGRESS":
        return "bg-info text-white"
      case "DONE":
        return "bg-success text-white"
      default:
        return "bg-secondary text-white"
    }
  }

  getPriorityBadgeClass(priority: string | undefined): string {
    if (!priority) return "bg-secondary"
    switch (priority) {
      case "LOW":
        return "bg-success"
      case "MEDIUM":
        return "bg-info"
      case "HIGH":
        return "bg-warning"
      case "URGENT":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  getPriorityLabel(priority: string | undefined): string {
    if (!priority) return "Unknown"
    switch (priority) {
      case "LOW":
        return "Faible"
      case "MEDIUM":
        return "Moyenne"
      case "HIGH":
        return "Élevée"
      case "URGENT":
        return "Urgente"
      default:
        return priority
    }
  }
}
