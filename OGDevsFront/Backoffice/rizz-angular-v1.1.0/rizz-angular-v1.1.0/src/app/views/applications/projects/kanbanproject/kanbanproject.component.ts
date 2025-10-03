import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbProgressbar, NgbProgressbarStacked } from '@ng-bootstrap/ng-bootstrap';
import { KeycloakService } from 'keycloak-angular';
import { ProjectService } from '../../../../services/project.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Bug, ProjectTaskDTO } from '@core/models/project.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


export interface TaskInfoDTO {
  projectName: string;
  operationName: string;
  deadline: string;
  phaseName: string;
}

@Component({
  selector: 'app-kanbanproject',
  templateUrl: './kanbanproject.component.html',
  imports: [NgForOf, DragDropModule, NgClass, NgIf, FormsModule, RouterLink, NgbProgressbar, NgbProgressbarStacked],
  styleUrls: ['./kanbanproject.component.scss'],
  standalone: true,
})
export class KanbanProjectComponent implements OnInit {
  taskInfoMap: { [taskId: number]: TaskInfoDTO } = {};
  bug: Bug = {
    priority: 'Low',
    description: '',
    source_issue: '',
    status: 'Open',
    repportDate: new Date().toISOString(),
  };

  currentUserEmail!: string;
  loading: boolean = true;
  errorMessage: string = '';
  columns: { title: string; tasks: ProjectTaskDTO[] }[] = [];
  selectedTaskId: number | null = null;

  constructor(
    private keycloakService: KeycloakService,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) await this.keycloakService.login();

      const userProfile = await this.keycloakService.loadUserProfile();
      this.currentUserEmail = userProfile.email || '';

      await this.keycloakService.updateToken(30);
      this.fetchProjects();
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      this.errorMessage = 'Erreur lors de l’authentification';
      this.loading = false;
    }
  }

  fetchProjects(): void {
    this.projectService.getProjectsByUser(this.currentUserEmail).subscribe({
      next: (projects) => {
        const normalizeStatus = (status: string) =>
          status.trim().toLowerCase().replace(/\s+/g, ' ');
        const tasks = projects.flatMap((p) => p.projectTasks || []);

        this.columns = [
          {
            title: 'To Do',
            tasks: tasks.filter((t) => normalizeStatus(t.status) === 'to do'),
          },
          {
            title: 'In Progress',
            tasks: tasks.filter((t) => normalizeStatus(t.status) === 'in progress'),
          },
          {
            title: 'Done',
            tasks: tasks.filter((t) => normalizeStatus(t.status) === 'done'),
          },
        ];
        this.loading = false;
        this.loadTaskInfoForTasks(tasks); // Charger les infos des tâches
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur API:', error);
        this.errorMessage = 'Impossible de récupérer les projets';
        this.loading = false;
      },
    });
  }

  // Charger les TaskInfoDTO pour toutes les tâches
  loadTaskInfoForTasks(tasks: ProjectTaskDTO[]): void {
    tasks.forEach((task) => {
      this.projectService.getTaskInfo(task.id).subscribe({
        next: (taskInfo) => {
          this.taskInfoMap[task.id] = taskInfo;
          this.cdr.detectChanges(); // Mettre à jour l'affichage
        },
        error: (err) => {
          console.error(`Erreur chargement info pour task ${task.id}:`, err);
        },
      });
    });
  }

  getColumnIds(): string[] {
    return this.columns.map((_, index) => `column-${index}`);
  }

  drop(
    event: CdkDragDrop<ProjectTaskDTO[]>,
    column: { title: string; tasks: ProjectTaskDTO[] }
  ): void {
    const fromColumn = this.columns.find((col) => col.tasks === event.previousContainer.data);
    const toColumn = column;

    if (fromColumn?.title === 'Done' && toColumn?.title !== 'Done') {
      console.warn('Déplacement depuis \'Done\' non autorisé.');
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.cdr.detectChanges();
    } else {
      const movedTask = { ...event.previousContainer.data[event.previousIndex] };
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const newStatus = column.title.trim().toLowerCase().replace(/\s+/g, ' ');
      movedTask.status =
        newStatus === 'to do'
          ? 'To Do'
          : newStatus === 'in progress'
            ? 'In Progress'
            : 'Done';

      event.container.data[event.currentIndex] = movedTask;
      this.cdr.detectChanges();
      this.updateTaskStatus(movedTask.id, movedTask.status, event);
    }
  }

  private updateTaskStatus(
    id: number,
    newStatus: string,
    event: CdkDragDrop<ProjectTaskDTO[]>
  ): void {
    this.projectService.updateTaskStatus(id, newStatus).subscribe({
      next: () => {
        console.log(`Tâche ${id} mise à jour vers ${newStatus}`);
      },
      error: (error) => {
        console.error(`Échec de la mise à jour:`, error);
        this.undoDrop(event);
        this.fetchProjects();
      },
    });
  }

  private undoDrop(event: CdkDragDrop<ProjectTaskDTO[]>): void {
    transferArrayItem(
      event.container.data,
      event.previousContainer.data,
      event.currentIndex,
      event.previousIndex
    );
    this.cdr.detectChanges();
  }

  getColumnTitles(): string[] {
    return this.columns.map((column, index) => `column-${index}`);
  }

  getStatusClasses(status: string): { [key: string]: boolean } {
    return {
      'text-to-do bg-to-do-subtle': status === 'To Do',
      'text-in-progress bg-in-progress-subtle': status === 'In Progress',
      'text-done bg-done-subtle': status === 'Done',
    };
  }

  openBugModal(content: any, taskId: number): void {
    this.selectedTaskId = taskId;
    this.resetBugForm();
    this.modalService.open(content).result.then(
      () => this.addBug(),
      () => {}
    );
  }

  addBug(): void {
    if (!this.selectedTaskId) return;

    const newBug: Bug = { ...this.bug };

    this.projectService.addBug(this.selectedTaskId, newBug).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.fetchProjects();
      },
      error: (error) => console.error('Failed to add bug:', error),
    });
  }

  private resetBugForm(): void {
    this.bug = {
      priority: 'Low',
      description: '',
      source_issue: '',
      status: 'Open',
      repportDate: new Date().toISOString(),
    };
  }

  getBugRatio(task: ProjectTaskDTO): string {
    const bugs = task.bugs || [];
    const fixedBugs = bugs.filter((bug) => bug.status === 'FIXED').length;
    const totalBugs = bugs.length;
    return `${fixedBugs}/${totalBugs}`;
  }

  getProgress(task: ProjectTaskDTO): number {
    const bugs = task.bugs || [];
    const fixedBugs = bugs.filter((bug) => bug.status === 'FIXED').length;
    const totalBugs = bugs.length;

    if (totalBugs === 0) {
      return 0;
    }

    return (fixedBugs / totalBugs) * 100;
  }

  dividePercentage(total: number): number {
    return total / 3;
  }
}
