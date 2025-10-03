import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TaskOperationProcessService, Task, Operation, Process } from '@/app/services/task-operation-process.service';
import { SharedSearchService } from '@/app/services/shared-search.service';
import { SearchResult } from '@/app/services/search.service';
import { Subscription, Observable, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-operation-process',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgbModule],
  templateUrl: './task-operation-process.component.html',
  styleUrls: ['./task-operation-process.component.scss'],
})
export class TaskOperationProcessComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  operations: Operation[] = [];
  processes: Process[] = [];
  filteredTasks: Task[] = [];
  filteredOperations: Operation[] = [];
  filteredProcesses: Process[] = [];
  selectedEntity: Task | Operation | Process | null = null;
  entityType: string | null = null;
  mode: string = 'list';

  private taskSubscription: Subscription | null = null;
  private operationSubscription: Subscription | null = null;
  private processSubscription: Subscription | null = null;
  private searchSubscription: Subscription | null = null;
  private entitySubscription: Subscription | null = null;

  constructor(
    private taskOperationProcessService: TaskOperationProcessService,
    private sharedSearchService: SharedSearchService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'] || 'list';

    if (this.mode === 'list') {
      // Load all data and then associate tasks with operations
      this.loadAllData();

      this.searchSubscription = this.sharedSearchService.searchResults$.subscribe((results: SearchResult[]) => {
        this.filterData(results);
      });
    } else if (this.mode === 'details') {
      const id = this.route.snapshot.paramMap.get('id');
      const entityType = this.route.snapshot.queryParams['entityType'];

      if (id && entityType && typeof entityType === 'string') {
        this.entityType = entityType;
        this.loadEntity(+id, this.entityType);
      } else {
        console.error('Invalid ID or entityType');
        this.showError('Invalid ID or entity type provided.');
      }
    }
  }

  isTask(entity: Task | Operation | Process): entity is Task {
    return (entity as Task).taskDescription !== undefined;
  }

  isOperation(entity: Task | Operation | Process): entity is Operation {
    return (entity as Operation).operationName !== undefined;
  }

  isProcess(entity: Task | Operation | Process): entity is Process {
    return (entity as Process).procName !== undefined;
  }

  ngOnDestroy(): void {
    if (this.taskSubscription) this.taskSubscription.unsubscribe();
    if (this.operationSubscription) this.operationSubscription.unsubscribe();
    if (this.processSubscription) this.processSubscription.unsubscribe();
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
    if (this.entitySubscription) this.entitySubscription.unsubscribe();
  }

  private showSuccess(message: string): void {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#5156be',
    });
  }

  private showError(message: string): void {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#5156be',
    });
  }

  loadAllData(): void {
    // Use forkJoin to load tasks, operations, and processes in parallel
    forkJoin({
      tasks: this.taskOperationProcessService.getAllTasks(),
      operations: this.taskOperationProcessService.getAllOperations(),
      processes: this.taskOperationProcessService.getAllProcesses(),
    }).subscribe({
      next: ({ tasks, operations, processes }) => {
        // Handle tasks
        tasks.subscribe({
          next: (taskData: Task[]) => {
            this.tasks = taskData;
            this.filteredTasks = [...this.tasks];
            console.log('Tasks loaded:', this.tasks);
            // Associate tasks with operations after loading
            this.associateTasksWithOperations();
          },
          error: (error: unknown) => {
            console.error('Error loading tasks:', error);
            this.showError('Error loading tasks.');
          },
        });

        // Handle operations
        operations.subscribe({
          next: (operationData: Operation[]) => {
            this.operations = operationData;
            this.filteredOperations = [...this.operations];
            console.log('Operations loaded:', this.operations);
            // Associate tasks with operations after loading
            this.associateTasksWithOperations();
          },
          error: (error: unknown) => {
            console.error('Error loading operations:', error);
            this.showError('Error loading operations.');
          },
        });

        // Handle processes
        processes.subscribe({
          next: (processData: Process[]) => {
            this.processes = processData;
            this.filteredProcesses = [...this.processes];
            console.log('Processes loaded:', this.processes);
          },
          error: (error: unknown) => {
            console.error('Error loading processes:', error);
            this.showError('Error loading processes.');
          },
        });
      },
      error: (error: unknown) => {
        console.error('Error loading data:', error);
        this.showError('Error loading data.');
      },
    });
  }

  private associateTasksWithOperations(): void {
    // Ensure both tasks and operations are loaded
    if (!this.tasks.length || !this.operations.length) {
      return;
    }

    // Associate tasks with operations based on operationId
    this.operations = this.operations.map(operation => {
      const associatedTasks = this.tasks.filter(task => task.operationId === operation.id);
      return { ...operation, tasks: associatedTasks };
    });

    // Update filteredOperations
    this.filteredOperations = [...this.operations];
    console.log('Operations with associated tasks:', this.operations);
  }

  loadEntity(id: number, entityType: string): void {
    let observablePromise: Promise<Observable<Task | Operation | Process>>;
    if (entityType === 'Process') {
      observablePromise = this.taskOperationProcessService.getProcessById(id);
    } else if (entityType === 'Operation') {
      observablePromise = this.taskOperationProcessService.getOperationById(id);
    } else if (entityType === 'Task') {
      observablePromise = this.taskOperationProcessService.getTaskById(id);
    } else {
      console.error('Invalid entity type');
      this.showError('Invalid entity type');
      return;
    }

    observablePromise
      .then((observable: Observable<Task | Operation | Process>) => {
        this.entitySubscription = observable.subscribe({
          next: (data: Task | Operation | Process) => {
            this.selectedEntity = data;
            this.entityType = entityType;
            console.log(`${entityType} loaded:`, this.selectedEntity);

            // Fetch associated data if needed
            if (this.isOperation(data)) {
              // Fetch tasks for the operation if not already present
              if (!data.tasks) {
                this.taskOperationProcessService.getAllTasks().then(tasksObservable => {
                  tasksObservable.subscribe(tasks => {
                    data.tasks = tasks.filter(task => task.operationId === data.id);
                    this.selectedEntity = { ...data }; // Update the selected entity
                  });
                });
              }
            } else if (this.isTask(data)) {
              // Fetch the operation for the task if not already present
              if (!data.operation && data.operationId) {
                this.taskOperationProcessService.getOperationById(data.operationId).then(operationObservable => {
                  operationObservable.subscribe(operation => {
                    data.operation = operation;
                    this.selectedEntity = { ...data }; // Update the selected entity
                  });
                });
              }
            }
          },
          error: (error: unknown) => {
            console.error(`Error loading ${entityType}:`, error);
            this.showError(`Error loading ${entityType.toLowerCase()}.`);
          },
        });
      })
      .catch((error: unknown) => {
        console.error(`Error initiating loadEntity for ${entityType}:`, error);
        this.showError(`Error initiating ${entityType.toLowerCase()} loading.`);
      });
  }

  private filterData(results: SearchResult[]): void {
    if (results.length === 0) {
      this.filteredTasks = [...this.tasks];
      this.filteredOperations = [...this.operations];
      this.filteredProcesses = [...this.processes];
      return;
    }

    this.filteredTasks = this.tasks.filter(task =>
      results.some(result => result.entityType === 'Task' && Number(result.id) === task.id)
    );

    this.filteredOperations = this.operations.filter(operation =>
      results.some(result => result.entityType === 'Operation' && Number(result.id) === operation.id)
    );

    this.filteredProcesses = this.processes.filter(process =>
      results.some(result => result.entityType === 'Process' && Number(result.id) === process.id)
    );
  }

  formatCreationDate(creationDate: string | null | undefined): string {
    if (!creationDate) return 'N/A';
    const date = new Date(creationDate);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  }

  getTaskDescriptions(entity: Task | Operation | Process): string {
    if (this.isOperation(entity)) {
      if (entity.tasks?.length) {
        return entity.tasks.map(task => task.taskDescription).join(', ');
      }
      if (entity.taskNames?.length) {
        return entity.taskNames.join(', ');
      }
    }
    return 'None';
  }
}
