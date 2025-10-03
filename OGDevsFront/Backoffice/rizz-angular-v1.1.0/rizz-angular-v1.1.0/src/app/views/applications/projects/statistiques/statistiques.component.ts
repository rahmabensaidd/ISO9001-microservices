// src/app/views/applications/projects/statistiques/statistiques.component.ts
import { Component, OnInit } from '@angular/core';
import { StatistiquesService } from '@/app/services/statistiques.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { ChartConfiguration } from 'chart.js';
import { CommonModule, NgIf } from '@angular/common';
import { NonConformityService } from '@/app/services/non-conformity.service';
import { NonConformityDTO } from '@core/models/nonconformance.model';
import { ProjectService } from '@/app/services/project.service';
import { Project } from '@core/models/project.model';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [BaseChartDirective, CommonModule, FormsModule, NgIf],
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.scss']
})
export class StatistiquesComponent implements OnInit {
  // Existing Process Statistics
  totalProcesses: number = 0;
  avgOperations: number = 0;
  avgDuration: number = 0;
  completionRate: number = 0;
  processesByPilote: { [key: string]: number } = {};
  processCorrelation: number = 0;
  filteredProcessesByPilote: { [key: string]: number } = {};

  // Existing Operation Statistics
  totalOperations: number = 0;
  avgTasksPerOperation: number = 0;
  avgOperationDuration: number = 0;
  operationCompletionRate: number = 0;
  operationsByUser: { [key: string]: number } = {};
  operationCorrelation: number = 0;
  filteredOperationsByUser: { [key: string]: number } = {};

  // Existing Task Statistics
  totalTasks: number = 0;
  avgDataPerTask: number = 0;
  avgTaskDuration: number = 0;
  taskCompletionRate: number = 0;
  tasksByOperation: { [key: string]: number } = {};
  taskCorrelation: number = 0;
  filteredTasksByOperation: { [key: string]: number } = {};

  // Existing Non-Conformity Statistics
  totalNonConformities: number = 0;
  fixedNonConformities: number = 0;
  openNonConformities: number = 0;
  filteredTotalNonConformities: number = 0;
  filteredFixedNonConformities: number = 0;
  filteredOpenNonConformities: number = 0;

  // Existing Project Statistics
  projects: Project[] = [];
  totalProjects: number = 0;
  avgPhases: number = 0;
  avgDurationProjects: number = 0;
  overdueOperations: number = 0;
  totalBugs: number = 0;
  projectCompletionRate: number = 0;
  phaseCompletionRate: number = 0;
  taskCompletionRateProjects: number = 0;
  projectsByResponsible: { [key: string]: number } = {};
  projectsByType: { [key: string]: number } = {};
  bugsByStatus: { [key: string]: number } = {};
  bugsByProject: { [key: string]: number } = {};
  filteredProjects: Project[] = [];
  filteredTotalProjects: number = 0;
  filteredAvgPhases: number = 0;
  filteredAvgDurationProjects: number = 0;
  filteredOverdueOperations: number = 0;
  filteredTotalBugs: number = 0;
  filteredProjectCompletionRate: number = 0;
  filteredPhaseCompletionRate: number = 0;
  filteredTaskCompletionRateProjects: number = 0;
  filteredProjectsByResponsible: { [key: string]: number } = {};
  filteredProjectsByType: { [key: string]: number } = {};
  filteredBugsByStatus: { [key: string]: number } = {};
  filteredBugsByProject: { [key: string]: number } = {};

  // Document Statistics
  totalDocuments: number = 0;
  avgSalary: number = 0;
  avgDurationDocuments: number = 0;
  completionRateDocuments: number = 0;
  documentsByCategory: { [key: string]: number } = {};
  documentsByCreator: { [key: string]: number } = {};
  documentCorrelation: number = 0;
  errorMessage: string | null = null;
  filteredTotalDocuments: number = 0;
  filteredAvgSalary: number = 0;
  filteredAvgDurationDocuments: number = 0;
  filteredCompletionRateDocuments: number = 0;
  filteredDocumentCorrelation: number = 0;

  // Chart Configurations
  public processDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: { labels: ['Completed', 'Incomplete'], datasets: [{ data: [0, 100], backgroundColor: ['#22c55e', '#f67f7f'], borderColor: 'transparent', borderRadius: 0, hoverBackgroundColor: ['#22c55e', '#f67f7f'] }] },
    options: { radius: 100, cutout: 100, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } } }
  };

  public operationDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: { labels: ['Completed', 'Incomplete'], datasets: [{ data: [0, 100], backgroundColor: ['#22c55e', '#f67f7f'], borderColor: 'transparent', borderRadius: 0, hoverBackgroundColor: ['#22c55e', '#f67f7f'] }] },
    options: { radius: 100, cutout: 100, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } } }
  };

  public taskDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: { labels: ['Completed', 'Incomplete'], datasets: [{ data: [0, 100], backgroundColor: ['#22c55e', '#f67f7f'], borderColor: 'transparent', borderRadius: 0, hoverBackgroundColor: ['#22c55e', '#f67f7f'] }] },
    options: { radius: 100, cutout: 100, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } } }
  };

  public barChartPilote: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Processes by Pilote', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#00a6cb', borderColor: '#00a6cb', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  public barChartUser: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Operations by User', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#00a6cb', borderColor: '#00a6cb', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  public barChartOperation: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Tasks by Operation', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#00a6cb', borderColor: '#00a6cb', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  public nonConformityDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: { labels: ['Fixed', 'Open'], datasets: [{ data: [0, 0], backgroundColor: ['#22c55e', '#f67f7f'], borderColor: 'transparent', borderRadius: 0, hoverBackgroundColor: ['#22c55e', '#f67f7f'] }] },
    options: { radius: 100, cutout: 100, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } } }
  };

  public projectDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: { labels: ['Completed', 'Incomplete'], datasets: [{ data: [0, 100], backgroundColor: ['#22c55e', '#f67f7f'], borderColor: 'transparent', hoverBackgroundColor: ['#22c55e', '#f67f7f'] }] },
    options: { radius: 100, cutout: 100, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } } }
  };

  public phaseDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: { labels: ['Completed', 'Incomplete'], datasets: [{ data: [0, 100], backgroundColor: ['#22c55e', '#f67f7f'], borderColor: 'transparent', hoverBackgroundColor: ['#22c55e', '#f67f7f'] }] },
    options: { radius: 100, cutout: 100, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } } }
  };

  public taskDonutChartConfigProjects: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: { labels: ['Completed', 'Incomplete'], datasets: [{ data: [0, 100], backgroundColor: ['#22c55e', '#f67f7f'], borderColor: 'transparent', hoverBackgroundColor: ['#22c55e', '#f67f7f'] }] },
    options: { radius: 100, cutout: 100, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } } }
  };

  public barChartType: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Projects by Type', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#00a6cb', borderColor: '#00a6cb', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  public barChartResponsible: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Projects by Responsible', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#00a6cb', borderColor: '#00a6cb', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  public barChartBugs: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Bugs by Status', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#00a6cb', borderColor: '#00a6cb', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  public barChartBugsByProject: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Bugs by Project', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#f59e0b', borderColor: '#f59e0b', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  public documentDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: { labels: ['Complétés', 'Incomplets'], datasets: [{ data: [0, 100], backgroundColor: ['#22c55e', '#f67f7f'], borderColor: 'transparent', borderRadius: 0, hoverBackgroundColor: ['#22c55e', '#f67f7f'] }] },
    options: { radius: 100, cutout: 100, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } } }
  };

  public filteredDocumentDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: { labels: ['Complétés', 'Incomplets'], datasets: [{ data: [0, 100], backgroundColor: ['#22c55e', '#f67f7f'], borderColor: 'transparent', borderRadius: 0, hoverBackgroundColor: ['#22c55e', '#f67f7f'] }] },
    options: { radius: 100, cutout: 100, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } } }
  };

  public barChartCategory: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Documents par Catégorie', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#00a6cb', borderColor: '#00a6cb', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  public filteredBarChartCategory: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Documents par Catégorie', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#00a6cb', borderColor: '#00a6cb', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  public barChartCreator: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Documents par Créateur', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#00a6cb', borderColor: '#00a6cb', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  public filteredBarChartCreator: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Documents par Créateur', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#00a6cb', borderColor: '#00a6cb', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  // Filter State
  showFilters: boolean = false;
  selectedName: string = '';
  uniqueNames: string[] = [];
  allDocuments: Document[] = [];
  isFilterActive: boolean = false; // New flag to track if filtering is active

  constructor(
    private statsService: StatistiquesService,
    private nonConformityService: NonConformityService,
    private projectService: ProjectService,
    private http: HttpClient
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadNonConformityStats();
    this.loadProjectStats();
    this.loadDocumentStats();
  }

  async loadStatistics(): Promise<void> {
    try {
      (await this.statsService.getTotalProcesses()).subscribe({ next: (data) => (this.totalProcesses = data), error: (err) => console.error('Error loading total processes:', err) });
      (await this.statsService.getAverageOperationsPerProcess()).subscribe({ next: (data) => (this.avgOperations = data), error: (err) => console.error('Error loading avg operations:', err) });
      (await this.statsService.getAverageProcessDuration()).subscribe({ next: (data) => (this.avgDuration = data), error: (err) => console.error('Error loading avg duration:', err) });
      (await this.statsService.getCompletionRate()).subscribe({ next: (data) => { this.completionRate = data; this.updateProcessDonutChart(); }, error: (err) => console.error('Error loading completion rate:', err) });
      (await this.statsService.getProcessesByPilote()).subscribe({ next: (data) => { this.processesByPilote = data; this.updatePiloteChart(); }, error: (err) => console.error('Error loading processes by pilote:', err) });
      (await this.statsService.getOperationsDurationCorrelation()).subscribe({ next: (data) => { this.processCorrelation = data; }, error: (err) => { console.error('Error loading process correlation:', err); this.processCorrelation = 0; } });

      (await this.statsService.getTotalOperations()).subscribe({ next: (data) => (this.totalOperations = data), error: (err) => console.error('Error loading total operations:', err) });
      (await this.statsService.getAverageTasksPerOperation()).subscribe({ next: (data) => (this.avgTasksPerOperation = data), error: (err) => console.error('Error loading avg tasks:', err) });
      (await this.statsService.getAverageOperationDuration()).subscribe({ next: (data) => (this.avgOperationDuration = data), error: (err) => console.error('Error loading avg operation duration:', err) });
      (await this.statsService.getOperationCompletionRate()).subscribe({ next: (data) => { this.operationCompletionRate = data; this.updateOperationDonutChart(); }, error: (err) => console.error('Error loading operation completion rate:', err) });
      (await this.statsService.getOperationsByUser()).subscribe({ next: (data) => { this.operationsByUser = data; this.updateUserChart(); }, error: (err) => console.error('Error loading operations by user:', err) });
      (await this.statsService.getTasksDurationCorrelation()).subscribe({ next: (data) => { this.operationCorrelation = data; }, error: (err) => { console.error('Error loading operation correlation:', err); this.operationCorrelation = 0; } });

      (await this.statsService.getTotalTasks()).subscribe({ next: (data) => (this.totalTasks = data), error: (err) => console.error('Error loading total tasks:', err) });
      (await this.statsService.getAverageDataPerTask()).subscribe({ next: (data) => (this.avgDataPerTask = data), error: (err) => console.error('Error loading avg data per task:', err) });
      (await this.statsService.getAverageTaskDuration()).subscribe({ next: (data) => (this.avgTaskDuration = data), error: (err) => console.error('Error loading avg task duration:', err) });
      (await this.statsService.getTaskCompletionRate()).subscribe({ next: (data) => { this.taskCompletionRate = data; this.updateTaskDonutChart(); }, error: (err) => console.error('Error loading task completion rate:', err) });
      (await this.statsService.getTasksByOperation()).subscribe({ next: (data) => { this.tasksByOperation = data; this.updateOperationChart(); }, error: (err) => console.error('Error loading tasks by operation:', err) });
      (await this.statsService.getDataDurationCorrelation()).subscribe({ next: (data) => { this.taskCorrelation = data; }, error: (err) => { console.error('Error loading task correlation:', err); this.taskCorrelation = 0; } });
    } catch (err) {
      console.error('Error in loadStatistics:', err);
    }
  }

  async loadNonConformityStats(): Promise<void> {
    try {
      const nonConformitiesObservable = await this.nonConformityService.getAllNonConformities();
      const nonConformities = await lastValueFrom(nonConformitiesObservable);
      this.calculateNonConformityStats(nonConformities);
      this.updateNonConformityDonutChart();
    } catch (err) {
      console.error('Error loading non-conformity stats:', err);
      this.totalNonConformities = 0;
      this.fixedNonConformities = 0;
      this.openNonConformities = 0;
    }
  }

  async loadProjectStats(): Promise<void> {
    try {
      const projectsObservable = await this.projectService.getAllProjects();
      const projects = await lastValueFrom(projectsObservable);
      this.projects = projects;
      this.calculateProjectStats();
      this.updateProjectCharts();
    } catch (err) {
      console.error('Error loading project stats:', err);
      this.totalProjects = 0;
      this.avgPhases = 0;
      this.avgDurationProjects = 0;
      this.overdueOperations = 0;
      this.totalBugs = 0;
      this.projectCompletionRate = 0;
      this.phaseCompletionRate = 0;
      this.taskCompletionRateProjects = 0;
      this.projectsByResponsible = {};
      this.projectsByType = {};
      this.bugsByStatus = {};
      this.bugsByProject = {};
    }
  }

  async loadDocumentStats(): Promise<void> {
    try {
      const documents = await lastValueFrom(this.http.get<Document[]>('http://localhost:8080/documents/getallDocuments'));
      this.allDocuments = documents;
      this.uniqueNames = [...new Set(documents.map(doc => doc.createdBy?.username || ''))].filter(name => name);
      console.log('Unique names for filter:', this.uniqueNames); // Debug log

      this.http.get<{ [key: string]: number }>('http://localhost:8080/documents/stats/by-type')
        .subscribe({
          next: data => {
            this.totalDocuments = Object.values(data).reduce((sum, val) => sum + val, 0);
            this.applyFilter();
          },
          error: err => this.handleError(err)
        });

      this.http.get<number>('http://localhost:8080/documents/stats/average-gross-salary')
        .subscribe({
          next: data => {
            this.avgSalary = data;
            this.applyFilter();
          },
          error: err => this.handleError(err)
        });

      this.avgDurationDocuments = documents.length > 0
        ? documents.reduce((sum, d) => {
        const creationDate = new Date(d.dateCreation);
        const today = new Date();
        return sum + (today.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
      }, 0) / documents.length
        : 0;

      const completed = documents.filter(d => d.content?.toLowerCase().includes('terminé')).length;
      this.completionRateDocuments = documents.length > 0 ? (completed / documents.length) * 100 : 0;
      this.updateDocumentDonutChart();

      this.http.get<{ [key: string]: number }>('http://localhost:8080/documents/stats/by-category')
        .subscribe({
          next: data => {
            this.documentsByCategory = data;
            this.updateCategoryChart();
            this.applyFilter();
          },
          error: err => this.handleError(err)
        });

      this.http.get<{ [key: string]: number }>('http://localhost:8080/documents/stats/by-creator')
        .subscribe({
          next: data => {
            this.documentsByCreator = data;
            this.updateCreatorChart();
            this.applyFilter();
          },
          error: err => this.handleError(err)
        });

      const fichesPaie = documents.filter(d => d.type === 'FICHE_PAIE' && d.salaireBrut);
      if (fichesPaie.length >= 2) {
        const salaries = fichesPaie.map(d => d.salaireBrut!);
        const durations = fichesPaie.map(d => {
          const creationDate = new Date(d.dateCreation);
          const today = new Date();
          return (today.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
        });
        this.documentCorrelation = this.calculateCorrelation(salaries, durations);
      } else {
        this.documentCorrelation = 0;
      }

      this.applyFilter();
    } catch (err) {
      this.handleError(err);
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
      filterSection.classList.toggle('active', this.showFilters);
    }
    if (!this.showFilters) {
      this.selectedName = '';
      this.isFilterActive = false;
      this.applyFilter();
    }
  }

  async applyFilter(): Promise<void> {
    this.isFilterActive = !!this.selectedName;

    // Filter Document Stats
    const filteredDocs = this.selectedName
      ? this.allDocuments.filter(doc => doc.createdBy?.username === this.selectedName)
      : this.allDocuments;

    this.filteredTotalDocuments = filteredDocs.length;

    const salaries = filteredDocs
      .filter(doc => doc.type === 'FICHE_PAIE' && doc.salaireBrut)
      .map(doc => doc.salaireBrut!);
    this.filteredAvgSalary = salaries.length > 0 ? salaries.reduce((sum, val) => sum + val, 0) / salaries.length : 0;

    this.filteredAvgDurationDocuments = filteredDocs.length > 0
      ? filteredDocs.reduce((sum, d) => {
      const creationDate = new Date(d.dateCreation);
      const today = new Date();
      return sum + (today.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
    }, 0) / filteredDocs.length
      : 0;

    const completedDocs = filteredDocs.filter(d => d.content?.toLowerCase().includes('terminé')).length;
    this.filteredCompletionRateDocuments = filteredDocs.length > 0 ? (completedDocs / filteredDocs.length) * 100 : 0;
    this.updateFilteredDocumentDonutChart();

    const filteredCategories = filteredDocs.reduce((acc, doc) => {
      acc[doc.category || 'Unknown'] = (acc[doc.category || 'Unknown'] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    this.filteredBarChartCategory.data.labels = Object.keys(filteredCategories);
    this.filteredBarChartCategory.data.datasets[0].data = Object.values(filteredCategories);

    const filteredCreators = filteredDocs.reduce((acc, doc) => {
      acc[doc.createdBy?.username || 'Unknown'] = (acc[doc.createdBy?.username || 'Unknown'] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    this.filteredBarChartCreator.data.labels = Object.keys(filteredCreators);
    this.filteredBarChartCreator.data.datasets[0].data = Object.values(filteredCreators);

    const fichesPaie = filteredDocs.filter(d => d.type === 'FICHE_PAIE' && d.salaireBrut);
    if (fichesPaie.length >= 2) {
      const salaries = fichesPaie.map(d => d.salaireBrut!);
      const durations = fichesPaie.map(d => {
        const creationDate = new Date(d.dateCreation);
        const today = new Date();
        return (today.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
      });
      this.filteredDocumentCorrelation = this.calculateCorrelation(salaries, durations);
    } else {
      this.filteredDocumentCorrelation = 0;
    }

    // Filter Project Stats
    this.filteredProjects = this.selectedName
      ? this.projects.filter(project => project.responsable.username === this.selectedName)
      : this.projects;
    this.calculateFilteredProjectStats();
    this.updateProjectCharts();

    // Filter Non-Conformity Stats
    const nonConformitiesObservable = this.nonConformityService.getAllNonConformities();
    const nonConformities = await lastValueFrom(await nonConformitiesObservable);
    const filteredNonConformities = this.selectedName
      ? nonConformities.filter((nc: NonConformityDTO) => nc.detectedBy === this.selectedName)
      : nonConformities;
    this.calculateFilteredNonConformityStats(filteredNonConformities);
    this.updateNonConformityDonutChart();

    // Filter Process Stats
    this.filteredProcessesByPilote = this.selectedName
      ? Object.fromEntries(
        Object.entries(this.processesByPilote).filter(([pilote]) => pilote === this.selectedName)
      )
      : this.processesByPilote;
    this.updatePiloteChart();

    // Filter Operation Stats
    this.filteredOperationsByUser = this.selectedName
      ? Object.fromEntries(
        Object.entries(this.operationsByUser).filter(([user]) => user === this.selectedName)
      )
      : this.operationsByUser;
    this.updateUserChart();

    // Filter Task Stats
    this.filteredTasksByOperation = this.selectedName
      ? Object.fromEntries(
        Object.entries(this.tasksByOperation).filter(([operation]) => operation.includes(this.selectedName))
      )
      : this.tasksByOperation;
    this.updateOperationChart();
  }

  private calculateNonConformityStats(nonConformities: NonConformityDTO[]): void {
    this.totalNonConformities = nonConformities.length;
    this.fixedNonConformities = nonConformities.filter(nc => nc.status === 'FIXED').length;
    this.openNonConformities = nonConformities.filter(nc => nc.status === 'OPEN').length;
  }

  private calculateFilteredNonConformityStats(nonConformities: NonConformityDTO[]): void {
    this.filteredTotalNonConformities = nonConformities.length;
    this.filteredFixedNonConformities = nonConformities.filter(nc => nc.status === 'FIXED').length;
    this.filteredOpenNonConformities = nonConformities.filter(nc => nc.status === 'OPEN').length;
  }

  private calculateProjectStats(): void {
    this.totalProjects = this.projects.length;
    const totalPhases = this.projects.reduce((sum, project) => sum + project.phases.length, 0);
    this.avgPhases = totalPhases / (this.totalProjects || 1);

    const durations = this.projects.map((project) => {
      const start = new Date(project.start_Date);
      const end = new Date(project.expected_endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });
    this.avgDurationProjects = durations.reduce((sum, dur) => sum + dur, 0) / (durations.length || 1);

    const allOperations = this.projects.flatMap((project) => project.phases).flatMap((phase) => phase.projectOperations);
    this.overdueOperations = allOperations.filter((op) => op.status !== 'Done' && op.deadline && new Date(op.deadline) < new Date()).length;

    const allTasks = this.projects.flatMap((project) => project.phases).flatMap((phase) => phase.projectOperations).flatMap((op) => op.projectTasks || []);
    const completedTasks = allTasks.filter((task) => task.status === 'Done').length;
    this.taskCompletionRateProjects = Math.round((completedTasks / (allTasks.length || 1)) * 100);

    const bugs = allTasks.flatMap((task) => task.bugs || []);
    this.totalBugs = bugs.length;
    this.bugsByStatus = bugs.reduce((acc, bug) => { acc[bug.status] = (acc[bug.status] || 0) + 1; return acc; }, {} as { [key: string]: number });

    this.bugsByProject = this.projects.reduce((acc, project) => {
      const bugCount = project.phases.flatMap((phase) => phase.projectOperations).flatMap((op) => op.projectTasks || []).flatMap((task) => task.bugs || []).length;
      acc[project.name] = bugCount;
      return acc;
    }, {} as { [key: string]: number });

    const completedProjects = this.projects.filter((project) => project.phases.some((phase) => phase.phase_name === 'Closure')).length;
    this.projectCompletionRate = Math.round((completedProjects / (this.totalProjects || 1)) * 100);

    const allPhases = this.projects.flatMap((project) => project.phases);
    const completedPhases = allPhases.filter((phase) => phase.projectOperations.every((op) => op.status === 'Done')).length;
    this.phaseCompletionRate = Math.round((completedPhases / (allPhases.length || 1)) * 100);

    this.projectsByResponsible = this.projects.reduce((acc, project) => { const responsible = project.responsable.username; acc[responsible] = (acc[responsible] || 0) + 1; return acc; }, {} as { [key: string]: number });
    this.projectsByType = this.projects.reduce((acc, project) => { const type = project.projectType || 'Unknown'; acc[type] = (acc[type] || 0) + 1; return acc; }, {} as { [key: string]: number });
  }

  private calculateFilteredProjectStats(): void {
    this.filteredTotalProjects = this.filteredProjects.length;
    const totalPhases = this.filteredProjects.reduce((sum, project) => sum + project.phases.length, 0);
    this.filteredAvgPhases = totalPhases / (this.filteredTotalProjects || 1);

    const durations = this.filteredProjects.map((project) => {
      const start = new Date(project.start_Date);
      const end = new Date(project.expected_endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });
    this.filteredAvgDurationProjects = durations.reduce((sum, dur) => sum + dur, 0) / (durations.length || 1);

    const allOperations = this.filteredProjects.flatMap((project) => project.phases).flatMap((phase) => phase.projectOperations);
    this.filteredOverdueOperations = allOperations.filter((op) => op.status !== 'Done' && op.deadline && new Date(op.deadline) < new Date()).length;

    const allTasks = this.filteredProjects.flatMap((project) => project.phases).flatMap((phase) => phase.projectOperations).flatMap((op) => op.projectTasks || []);
    const completedTasks = allTasks.filter((task) => task.status === 'Done').length;
    this.filteredTaskCompletionRateProjects = Math.round((completedTasks / (allTasks.length || 1)) * 100);

    const bugs = allTasks.flatMap((task) => task.bugs || []);
    this.filteredTotalBugs = bugs.length;
    this.filteredBugsByStatus = bugs.reduce((acc, bug) => { acc[bug.status] = (acc[bug.status] || 0) + 1; return acc; }, {} as { [key: string]: number });

    this.filteredBugsByProject = this.filteredProjects.reduce((acc, project) => {
      const bugCount = project.phases.flatMap((phase) => phase.projectOperations).flatMap((op) => op.projectTasks || []).flatMap((task) => task.bugs || []).length;
      acc[project.name] = bugCount;
      return acc;
    }, {} as { [key: string]: number });

    const completedProjects = this.filteredProjects.filter((project) => project.phases.some((phase) => phase.phase_name === 'Closure')).length;
    this.filteredProjectCompletionRate = Math.round((completedProjects / (this.filteredTotalProjects || 1)) * 100);

    const allPhases = this.filteredProjects.flatMap((project) => project.phases);
    const completedPhases = allPhases.filter((phase) => phase.projectOperations.every((op) => op.status === 'Done')).length;
    this.filteredPhaseCompletionRate = Math.round((completedPhases / (allPhases.length || 1)) * 100);

    this.filteredProjectsByResponsible = this.filteredProjects.reduce((acc, project) => { const responsible = project.responsable.username; acc[responsible] = (acc[responsible] || 0) + 1; return acc; }, {} as { [key: string]: number });
    this.filteredProjectsByType = this.filteredProjects.reduce((acc, project) => { const type = project.projectType || 'Unknown'; acc[type] = (acc[type] || 0) + 1; return acc; }, {} as { [key: string]: number });
  }

  private updateProcessDonutChart(): void { this.processDonutChartConfig.data.datasets[0].data = [this.completionRate, 100 - this.completionRate]; }
  private updateOperationDonutChart(): void { this.operationDonutChartConfig.data.datasets[0].data = [this.operationCompletionRate, 100 - this.operationCompletionRate]; }
  private updateTaskDonutChart(): void { this.taskDonutChartConfig.data.datasets[0].data = [this.taskCompletionRate, 100 - this.taskCompletionRate]; }
  private updatePiloteChart(): void {
    this.barChartPilote.data.labels = Object.keys(this.isFilterActive ? this.filteredProcessesByPilote : this.processesByPilote);
    this.barChartPilote.data.datasets[0].data = Object.values(this.isFilterActive ? this.filteredProcessesByPilote : this.processesByPilote);
  }
  private updateUserChart(): void {
    this.barChartUser.data.labels = Object.keys(this.isFilterActive ? this.filteredOperationsByUser : this.operationsByUser);
    this.barChartUser.data.datasets[0].data = Object.values(this.isFilterActive ? this.filteredOperationsByUser : this.operationsByUser);
  }
  private updateOperationChart(): void {
    this.barChartOperation.data.labels = Object.keys(this.isFilterActive ? this.filteredTasksByOperation : this.tasksByOperation);
    this.barChartOperation.data.datasets[0].data = Object.values(this.isFilterActive ? this.filteredTasksByOperation : this.tasksByOperation);
  }
  private updateNonConformityDonutChart(): void {
    this.nonConformityDonutChartConfig.data.datasets[0].data = this.isFilterActive
      ? [this.filteredFixedNonConformities, this.filteredOpenNonConformities]
      : [this.fixedNonConformities, this.openNonConformities];
  }
  private updateProjectCharts(): void {
    this.projectDonutChartConfig.data.datasets[0].data = this.isFilterActive
      ? [this.filteredProjectCompletionRate, 100 - this.filteredProjectCompletionRate]
      : [this.projectCompletionRate, 100 - this.projectCompletionRate];
    this.phaseDonutChartConfig.data.datasets[0].data = this.isFilterActive
      ? [this.filteredPhaseCompletionRate, 100 - this.filteredPhaseCompletionRate]
      : [this.phaseCompletionRate, 100 - this.phaseCompletionRate];
    this.taskDonutChartConfigProjects.data.datasets[0].data = this.isFilterActive
      ? [this.filteredTaskCompletionRateProjects, 100 - this.filteredTaskCompletionRateProjects]
      : [this.taskCompletionRateProjects, 100 - this.taskCompletionRateProjects];
    this.barChartType.data.labels = Object.keys(this.isFilterActive ? this.filteredProjectsByType : this.projectsByType);
    this.barChartType.data.datasets[0].data = Object.values(this.isFilterActive ? this.filteredProjectsByType : this.projectsByType);
    this.barChartResponsible.data.labels = Object.keys(this.isFilterActive ? this.filteredProjectsByResponsible : this.projectsByResponsible);
    this.barChartResponsible.data.datasets[0].data = Object.values(this.isFilterActive ? this.filteredProjectsByResponsible : this.projectsByResponsible);
    this.barChartBugs.data.labels = Object.keys(this.isFilterActive ? this.filteredBugsByStatus : this.bugsByStatus);
    this.barChartBugs.data.datasets[0].data = Object.values(this.isFilterActive ? this.filteredBugsByStatus : this.bugsByStatus);
    this.barChartBugsByProject.data.labels = Object.keys(this.isFilterActive ? this.filteredBugsByProject : this.bugsByProject);
    this.barChartBugsByProject.data.datasets[0].data = Object.values(this.isFilterActive ? this.filteredBugsByProject : this.bugsByProject);
  }

  private updateDocumentDonutChart(): void {
    this.documentDonutChartConfig.data.datasets[0].data = [this.completionRateDocuments, 100 - this.completionRateDocuments];
  }

  private updateFilteredDocumentDonutChart(): void {
    this.filteredDocumentDonutChartConfig.data.datasets[0].data = [this.filteredCompletionRateDocuments, 100 - this.filteredCompletionRateDocuments];
  }

  private updateCategoryChart(): void {
    this.barChartCategory.data.labels = Object.keys(this.documentsByCategory);
    this.barChartCategory.data.datasets[0].data = Object.values(this.documentsByCategory);
  }

  private updateCreatorChart(): void {
    this.barChartCreator.data.labels = Object.keys(this.documentsByCreator);
    this.barChartCreator.data.datasets[0].data = Object.values(this.documentsByCreator);
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n < 2) return 0;

    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }

    return denomX > 0 && denomY > 0 ? numerator / Math.sqrt(denomX * denomY) : 0;
  }

  private handleError(error: any): void {
    this.errorMessage = 'Erreur lors du chargement des statistiques. Veuillez réessayer plus tard.';
    console.error('Erreur:', error);
  }
}

interface Document {
  id: number;
  dateCreation: string;
  title: string;
  content: string;
  type: string;
  category?: string;
  salaireBrut?: number;
  createdBy?: { username: string };
}
