import { Component, inject, OnInit } from '@angular/core';
import { NgApexchartsModule } from "ng-apexcharts";
import type { ChartOptions } from "@common/apexchart.model";
import { Subscription } from 'rxjs';
import {
  NgbAccordionModule, NgbPagination,
  NgbProgressbar,
  NgbProgressbarStacked
} from "@ng-bootstrap/ng-bootstrap";
import { UtilsService } from '@/app/core/service/utils.service';
import { JsonPipe, NgClass, NgForOf, NgIf } from "@angular/common";
import { ProjectService } from "@/app/services/project.service";
import { ActivatedRoute, Router } from "@angular/router";
import {Project, ProjectOperation, ProjectTaskDTO} from "@core/models/project.model";
import { KeycloakProfile } from "keycloak-js";
import { KeycloakService } from "keycloak-angular";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-mywork',
  standalone: true,
  imports: [
    NgApexchartsModule,
    NgbProgressbar,
    NgbProgressbarStacked,
    NgClass,
    NgbAccordionModule,
    NgIf,
    NgForOf,
    NgbPagination,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './mywork.component.html',
  styleUrls: ['./mywork.component.scss'],
})
export class MyworkComponent implements OnInit {
  operations: ProjectOperation[] = []
  loading: boolean = false
  errorMessage: string | null = null
  currentUserEmail: string | undefined
  expandedIndexes: Set<number> = new Set<number>()
  projectTasks: ProjectTaskDTO[] = []
  private subscription?: Subscription
  currentPage: number = 1 // Current page
  itemsPerPage: number = 3 // Number of operations per page
  totalItems: number = 0 // Total number of operations
  totalTasks: number = 0
  inProgressTasks: number = 0
  donePercentage: number = 0
  totalBugs: number = 0
  pageSize: number = 3
  projectNamesMap = new Map<number, string>()
  collectionSize: number = 0
  operationsCurrentPage: number = 1;
  operationsPageSize: number = 4;
  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn()
      if (!isLoggedIn) {
        console.warn("⚠️ L'utilisateur n'est pas connecté.")
        await this.keycloakService.login()
        return
      }

      const userProfile: KeycloakProfile =
        await this.keycloakService.loadUserProfile()
      this.currentUserEmail = userProfile.email

      if (!this.currentUserEmail) {
        console.error("❌ L'email de l'utilisateur n'est pas disponible.")
        return
      }

      const token = await this.keycloakService.getToken()
      if (!token) {
        console.error('❌ Token manquant ou invalide')
        await this.keycloakService.login()
        return
      }

      this.fetchProjects()
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'authentification ou de la récupération du profil :",
        error
      )
    }
  }

  fetchProjects(): void {
    if (!this.currentUserEmail) {
      this.errorMessage = 'Email utilisateur non disponible.'
      return
    }

    this.loading = true
    this.errorMessage = null

    this.projectService.getProjectsByUser(this.currentUserEmail).subscribe({
      next: (operations) => {
        this.operations = operations.map((op) => ({
          ...op,
          totalBugsForOperation: this.calculateTotalBugsForOperation(op),
          calculatedProgress: this.calculateProgressForOperation(op),
        }))
        this.loadProjectNames(this.operations) // 👈 Ajouté ici
        this.calculateTaskStats()
        this.updateChart()
        this.loading = false
      },
      error: (error) => {
        console.error('❌ Erreur lors de la récupération des projets:', error)
        this.errorMessage = 'Impossible de récupérer les projets.'
        this.loading = false
      },
    })
  }

  calculateTaskStats(): void {
    this.projectTasks = this.operations.flatMap((op) => op.projectTasks || [])
    this.totalTasks = this.projectTasks.length
    this.inProgressTasks = this.projectTasks.filter(
      (task) => task.status === 'In Progress'
    ).length
    const doneTasks = this.projectTasks.filter(
      (task) => task.status === 'Done'
    ).length
    this.donePercentage =
      this.totalTasks > 0
        ? Number(((doneTasks / this.totalTasks) * 100).toFixed(1))
        : 0
    this.totalBugs = this.projectTasks.flatMap((task) => task.bugs || []).length
  }

  calculateTotalBugsForOperation(operation: ProjectOperation): number {
    return (operation.projectTasks || []).flatMap((task) => task.bugs || [])
      .length
  }

  calculateProgressForOperation(operation: ProjectOperation): number {
    const tasks = operation.projectTasks || []
    if (tasks.length === 0) return 0
    const doneTasks = tasks.filter((task) => task.status === 'Done').length
    return Number(((doneTasks / tasks.length) * 100).toFixed(1))
  }

  updateChart(): void {
    const activeTasks = this.projectTasks.filter(
      (task) => task.status === 'In Progress'
    ).length
    const completedTasks = this.projectTasks.filter(
      (task) => task.status === 'Done'
    ).length
    const assignedTasks = this.projectTasks.filter(
      (task) => task.status === 'To Do'
    ).length

    const total = this.totalTasks || 1
    const activePercentage = Number(((activeTasks / total) * 100).toFixed(1))
    const completedPercentage = Number(
      ((completedTasks / total) * 100).toFixed(1)
    )
    const assignedPercentage = Number(
      ((assignedTasks / total) * 100).toFixed(1)
    )

    this.summaryChart = {
      ...this.summaryChart,
      series: [activePercentage, completedPercentage, assignedPercentage],
    }
  }

  summaryChart: Partial<ChartOptions> = {
    chart: {
      height: 260,
      type: 'donut',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + '%'
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    series: [0, 0, 0],
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '13px',
      fontFamily: 'Be Vietnam Pro, sans-serif',
    },
    labels: ['Active', 'Completed', 'Assigned'],
    colors: ['#22c55e', '#08b0e7', '#ffc728'],
    responsive: [
      {
        breakpoint: 600,
        options: {
          plotOptions: {
            pie: {
              customScale: 0.2,
            },
          },
          chart: {
            height: 240,
          },
          legend: {
            show: false,
          },
        },
      },
    ],
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toFixed(1) + '%'
        },
      },
    },
  }

  public service = inject(UtilsService)

  trackByTaskId(index: number, task: ProjectTaskDTO): number {
    return task.id ?? index
  }

  trackByFn(index: number, item: any): number {
    return index
  }

  toggleCollapse(index: number): void {
    console.log(
      'Before toggle - Index:',
      index,
      'Expanded:',
      this.expandedIndexes.has(index)
    )
    if (this.expandedIndexes.has(index)) {
      this.expandedIndexes.delete(index)
    } else {
      this.expandedIndexes.add(index)
    }
    console.log(
      'After toggle - Index:',
      index,
      'Expanded:',
      this.expandedIndexes.has(index)
    )
  }

  isExpanded(index: number): boolean {
    const expanded = this.expandedIndexes.has(index)
    console.log('isExpanded - Index:', index, 'Result:', expanded)
    return expanded
  }
  updateStatusDone(taskId: number): void {
    const newStatus = 'Done'
    this.subscription = this.projectService
      .updateTaskStatus(taskId, newStatus)
      .subscribe({
        next: (response) => {
          console.log('✅ Statut mis à jour avec succès:', response)
          this.fetchProjects()
        },
        error: (error) =>
          console.error('❌ Erreur lors de la mise à jour:', error),
        complete: () => console.log('Opération terminée'),
      })
  }

  updateStatusInProgress(taskId: number): void {
    const newStatus = 'In Progress'
    this.subscription = this.projectService
      .updateTaskStatus(taskId, newStatus)
      .subscribe({
        next: (response) => {
          console.log('✅ Statut mis à jour avec succès:', response)
          this.fetchProjects()
        },
        error: (error) =>
          console.error('❌ Erreur lors de la mise à jour:', error),
        complete: () => console.log('Opération terminée'),
      })
  }

  updateStatustodo(taskId: number): void {
    const newStatus = 'To Do'
    this.subscription = this.projectService
      .updateTaskStatus(taskId, newStatus)
      .subscribe({
        next: (response) => {
          console.log('✅ Statut mis à jour avec succès:', response)
          this.fetchProjects()
        },
        error: (error) =>
          console.error('❌ Erreur lors de la mise à jour:', error),
        complete: () => console.log('Opération terminée'),
      })
  }

  viewKanban(): void {
    this.router.navigate(['/kanbanproject'])
  }

  loadProjectNames(operations: ProjectOperation[]) {
    operations.forEach((op) => {
      if (
        op.idProjectOperation &&
        !this.projectNamesMap.has(op.idProjectOperation)
      ) {
        this.projectService
          .getProjectByProjectOpp(op.idProjectOperation)
          .subscribe((project) => {
            this.projectNamesMap.set(op.idProjectOperation!, project.name)
          })
      }
    })
  }

  projectName(projectOppId: number | undefined): string | undefined {
    return this.projectNamesMap.get(<number>projectOppId)
  }

  refreshOperations(): void {
    // Réinitialiser à la première page si la page actuelle est invalide
    if (this.operationsCurrentPage > Math.ceil(this.operations.length / this.operationsPageSize)) {
      this.operationsCurrentPage = 1;
    }
  }

  get paginatedOperations(): ProjectOperation[] {
    const startIndex = (this.operationsCurrentPage - 1) * this.operationsPageSize;
    return this.operations.slice(startIndex, startIndex + this.operationsPageSize);
  }
}
