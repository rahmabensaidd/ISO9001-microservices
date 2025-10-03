import { Component, OnInit } from '@angular/core';
import { DragulaModule } from "ng2-dragula";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TaskService } from "@views/applications/projects/kanban-project/task.service";
import { KeycloakService } from "keycloak-angular";
import { ProjectTaskDTO } from "@core/models/project.model";

@Component({
  selector: 'app-kanban-project',
  standalone: true,
  imports: [
    DragulaModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './kanban-project.component.html',
  styleUrls: ['./kanban-project.component.scss'],
})
export class KanbanProjectComponent implements OnInit {
  tasks: ProjectTaskDTO[] = [];
  toDoTasks: ProjectTaskDTO[] = [];
  inProgressTasks: ProjectTaskDTO[] = [];
  doneTasks: ProjectTaskDTO[] = [];

  constructor(
    private taskService: TaskService,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    this.keycloakService.loadUserProfile().then(
      (profile) => {
        if (profile.email) {
          this.loadTasks(profile.email);
        } else {
          console.error("Aucun email trouvé dans le profil utilisateur.");
        }
      },
      (error) => console.error("Erreur lors du chargement du profil utilisateur:", error)
    );
  }

  loadTasks(userEmail: string): void {
    this.taskService.fetchProjectTasks(userEmail).subscribe(
      (tasks) => {
        this.tasks = tasks;
        this.filterTasks();
      },
      (error) => console.error("Erreur lors du chargement des tâches :", error)
    );
  }

  filterTasks(): void {
    this.toDoTasks = this.tasks.filter(task => task.status === 'To Do');
    this.inProgressTasks = this.tasks.filter(task => task.status === 'In Progress');
    this.doneTasks = this.tasks.filter(task => task.status === 'Done');
  }

  onDrop(event: any, newStatus: 'To Do' | 'In Progress' | 'Done') {
    const taskId = Number(event.data);
    const task = this.tasks.find(t => t.id === taskId);

    if (task) {
      task.status = newStatus;
      this.filterTasks();
      // TODO: Ajouter un appel API pour mettre à jour le statut dans la base de données
    }
  }

  onDragStart(event: DragEvent, taskId: number) {
    if (event.dataTransfer) {
      event.dataTransfer.setData("text/plain", taskId.toString());
    }
  }
}
