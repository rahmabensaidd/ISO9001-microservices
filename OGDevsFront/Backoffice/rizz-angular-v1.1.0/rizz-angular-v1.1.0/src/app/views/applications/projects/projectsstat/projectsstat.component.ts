import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { Project } from "@core/models/project.model";
import { ProjectService } from "@/app/services/project.service";

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-projectsstat',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './projectsstat.component.html',
  styleUrls: ['./projectsstat.component.scss'],
})
export class ProjectsstatComponent implements OnInit {
  projects: Project[] = [];
  totalProjects: number = 0;
  avgPhases: number = 0;
  avgDuration: number = 0;
  overdueOperations: number = 0;
  totalBugs: number = 0;
  projectCompletionRate: number = 0;
  phaseCompletionRate: number = 0;
  taskCompletionRate: number = 0;
  projectsByResponsible: { [key: string]: number } = {};
  projectsByType: { [key: string]: number } = {};
  bugsByStatus: { [key: string]: number } = {};
  bugsByProject: { [key: string]: number } = {};
  dataLoaded: boolean = false;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.fetchProjects();
  }

  fetchProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects: Project[]) => {
        this.projects = projects;
        this.calculateStatistics();
        this.updateCharts();
        this.dataLoaded = true;
      },
      error: (error) => {
        console.error('❌ Failed to fetch projects:', error);
      },
    });
  }

  calculateStatistics(): void {
    this.totalProjects = this.projects.length;
    const totalPhases = this.projects.reduce((sum, project) => sum + project.phases.length, 0);
    this.avgPhases = totalPhases / (this.totalProjects || 1);

    const durations = this.projects.map((project) => {
      const start = new Date(project.start_Date);
      const end = new Date(project.expected_endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });
    this.avgDuration = durations.reduce((sum, dur) => sum + dur, 0) / (durations.length || 1);

    const allOperations = this.projects
      .flatMap((project) => project.phases)
      .flatMap((phase) => phase.projectOperations);
    this.overdueOperations = allOperations.filter(
      (op) =>
        op.status !== 'Done' &&
        op.deadline &&
        new Date(op.deadline) < new Date()
    ).length;

    const allTasks = this.projects
      .flatMap((project) => project.phases)
      .flatMap((phase) => phase.projectOperations)
      .flatMap((op) => op.projectTasks || []);
    const completedTasks = allTasks.filter((task) => task.status === 'Done').length;
    this.taskCompletionRate = Math.round((completedTasks / (allTasks.length || 1)) * 100);

    const bugs = allTasks.flatMap((task) => task.bugs || []);
    this.totalBugs = bugs.length;
    this.bugsByStatus = bugs.reduce((acc, bug) => {
      acc[bug.status] = (acc[bug.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    this.bugsByProject = this.projects.reduce((acc, project) => {
      const bugCount = project.phases
        .flatMap((phase) => phase.projectOperations)
        .flatMap((op) => op.projectTasks || [])
        .flatMap((task) => task.bugs || []).length;
      acc[project.name] = bugCount;
      return acc;
    }, {} as { [key: string]: number });

    const completedProjects = this.projects.filter((project) =>
      project.phases.some((phase) => phase.phase_name === 'Closure')
    ).length;
    this.projectCompletionRate = Math.round((completedProjects / (this.totalProjects || 1)) * 100);

    const allPhases = this.projects.flatMap((project) => project.phases);
    const completedPhases = allPhases.filter((phase) =>
      phase.projectOperations.every((op) => op.status === 'Done')
    ).length;
    this.phaseCompletionRate = Math.round((completedPhases / (allPhases.length || 1)) * 100);

    this.projectsByResponsible = this.projects.reduce((acc, project) => {
      const responsible = project.responsable.username;
      acc[responsible] = (acc[responsible] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    this.projectsByType = this.projects.reduce((acc, project) => {
      const type = project.projectType || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  public projectDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Incomplete'],
      datasets: [
        {
          data: [0, 100],
          backgroundColor: ['#22c55e', '#f67f7f'],
          borderColor: 'transparent',
          hoverBackgroundColor: ['#22c55e', '#f67f7f'],
        },
      ],
    },
    options: {
      radius: 60,
      cutout: 40,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#666',
            font: { family: 'Be Vietnam Pro', size: 10 },
          },
        },
        tooltip: { enabled: true },
      },
      animation: { animateScale: true, animateRotate: true },
    },
  };

  public phaseDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Incomplete'],
      datasets: [
        {
          data: [0, 100],
          backgroundColor: ['#22c55e', '#f67f7f'],
          borderColor: 'transparent',
          hoverBackgroundColor: ['#22c55e', '#f67f7f'],
        },
      ],
    },
    options: {
      radius: 60,
      cutout: 40,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#666',
            font: { family: 'Be Vietnam Pro', size: 10 },
          },
        },
        tooltip: { enabled: true },
      },
      animation: { animateScale: true, animateRotate: true },
    },
  };

  public taskDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Incomplete'],
      datasets: [
        {
          data: [0, 100],
          backgroundColor: ['#22c55e', '#f67f7f'],
          borderColor: 'transparent',
          hoverBackgroundColor: ['#22c55e', '#f67f7f'],
        },
      ],
    },
    options: {
      radius: 60,
      cutout: 40,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#666',
            font: { family: 'Be Vietnam Pro', size: 10 },
          },
        },
        tooltip: { enabled: true },
      },
      animation: { animateScale: true, animateRotate: true },
    },
  };

  public barChartType: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Projects by Type',
          data: [],
          borderRadius: 12,
          borderSkipped: false,
          backgroundColor: '#00a6cb',
          borderColor: '#00a6cb',
          borderWidth: 1,
          barThickness: 12,
          maxBarThickness: 8,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#666',
            font: { family: 'Be Vietnam Pro', size: 10 },
          },
        },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#666', font: { size: 10 } },
          grid: { color: 'rgba(132, 145, 183, 0.1)' },
        },
        x: {
          ticks: { color: '#666', font: { size: 10 } },
          grid: { display: false },
        },
      },
      animation: { duration: 1000, easing: 'easeOutQuart' },
    },
  };

  public barChartResponsible: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Projects by Responsible',
          data: [],
          borderRadius: 12,
          borderSkipped: false,
          backgroundColor: '#00a6cb',
          borderColor: '#00a6cb',
          borderWidth: 1,
          barThickness: 12,
          maxBarThickness: 8,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#666',
            font: { family: 'Be Vietnam Pro', size: 10 },
          },
        },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#666', font: { size: 10 } },
          grid: { color: 'rgba(132, 145, 183, 0.1)' },
        },
        x: {
          ticks: { color: '#666', font: { size: 10 } },
          grid: { display: false },
        },
      },
      animation: { duration: 1000, easing: 'easeOutQuart' },
    },
  };

  public barChartBugs: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Bugs by Status',
          data: [],
          borderRadius: 12,
          borderSkipped: false,
          backgroundColor: '#00a6cb',
          borderColor: '#00a6cb',
          borderWidth: 1,
          barThickness: 12,
          maxBarThickness: 8,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#666',
            font: { family: 'Be Vietnam Pro', size: 10 },
          },
        },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#666', font: { size: 10 } },
          grid: { color: 'rgba(132, 145, 183, 0.1)' },
        },
        x: {
          ticks: { color: '#666', font: { size: 10 } },
          grid: { display: false },
        },
      },
      animation: { duration: 1000, easing: 'easeOutQuart' },
    },
  };

  public barChartBugsByProject: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Bugs by Project',
          data: [],
          borderRadius: 12,
          borderSkipped: false,
          backgroundColor: '#f59e0b',
          borderColor: '#f59e0b',
          borderWidth: 1,
          barThickness: 12,
          maxBarThickness: 8,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#666',
            font: { family: 'Be Vietnam Pro', size: 10 },
          },
        },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#666', font: { size: 10 } },
          grid: { color: 'rgba(132, 145, 183, 0.1)' },
        },
        x: {
          ticks: { color: '#666', font: { size: 10 } },
          grid: { display: false },
        },
      },
      animation: { duration: 1000, easing: 'easeOutQuart' },
    },
  };

  private updateCharts(): void {
    this.projectDonutChartConfig.data.datasets[0].data = [
      this.projectCompletionRate,
      100 - this.projectCompletionRate,
    ];
    this.phaseDonutChartConfig.data.datasets[0].data = [
      this.phaseCompletionRate,
      100 - this.phaseCompletionRate,
    ];
    this.taskDonutChartConfig.data.datasets[0].data = [
      this.taskCompletionRate,
      100 - this.taskCompletionRate,
    ];

    this.barChartType.data.labels = Object.keys(this.projectsByType);
    this.barChartType.data.datasets[0].data = Object.values(this.projectsByType);

    this.barChartResponsible.data.labels = Object.keys(this.projectsByResponsible);
    this.barChartResponsible.data.datasets[0].data = Object.values(this.projectsByResponsible);

    this.barChartBugs.data.labels = Object.keys(this.bugsByStatus);
    this.barChartBugs.data.datasets[0].data = Object.values(this.bugsByStatus);

    this.barChartBugsByProject.data.labels = Object.keys(this.bugsByProject);
    this.barChartBugsByProject.data.datasets[0].data = Object.values(this.bugsByProject);
  }
}
