import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SurveyService } from '@/app/services/survey.service';
import { SurveyDTO, SurveyStats } from '@core/models/survey.model';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-admin-survey',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BaseChartDirective
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin-survey.component.css']
})
export class AdminComponent implements OnInit {
  surveys: SurveyDTO[] = [];
  stats: SurveyStats | null = null;
  statsForm: FormGroup;
  loading: boolean = false;

  // Chart Configurations
  public surveyCompletionDonutChart: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: { labels: ['Completed', 'Incomplete'], datasets: [{ data: [0, 100], backgroundColor: ['#22c55e', '#f67f7f'], borderColor: 'transparent', hoverBackgroundColor: ['#22c55e', '#f67f7f'] }] },
    options: { radius: 100, cutout: 100, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } } }
  };

  public scoreDistributionBarChart: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Score Distribution', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#00a6cb', borderColor: '#00a6cb', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  public questionAveragesBarChart: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Question Averages', data: [], borderRadius: 10, borderSkipped: false, backgroundColor: '#f59e0b', borderColor: '#f59e0b', borderWidth: 1, barThickness: 15, maxBarThickness: 9 }] },
    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { color: '#7c8ea7', font: { family: 'Be Vietnam Pro' } } } }, scales: { y: { beginAtZero: true, ticks: { color: '#7c8ea7' }, grid: { color: 'rgba(132, 145, 183, 0.15)' } }, x: { ticks: { color: '#7c8ea7' }, grid: { display: false } } } }
  };

  constructor(
    private surveyService: SurveyService,
    private fb: FormBuilder
  ) {
    this.statsForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });
    Chart.register(...registerables);
  }

  async ngOnInit(): Promise<void> {
    await this.loadSurveys();
  }

  async loadSurveys(): Promise<void> {
    this.loading = true;
    try {
      const surveysObservable = await this.surveyService.getAllSurveys();
      surveysObservable.subscribe({
        next: (data: SurveyDTO[]) => {
          this.surveys = data.filter(s => s.id != null);
          console.log('Surveys loaded for admin:', this.surveys);
          this.loading = false;
        },
        error: (error: unknown) => {
          console.error('Error loading surveys:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load surveys!', confirmButtonColor: '#5156be' });
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error initiating loadSurveys:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred!', confirmButtonColor: '#5156be' });
      this.loading = false;
    }
  }

  async markAsReviewed(surveyId: number): Promise<void> {
    if (surveyId == null) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Invalid survey ID!', confirmButtonColor: '#5156be' });
      return;
    }
    const result = await Swal.fire({
      title: 'Mark Survey as Reviewed',
      text: 'Are you sure you want to mark survey as reviewed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, mark as reviewed',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#5156be'
    });

    if (result.isConfirmed) {
      try {
        const reviewObservable = await this.surveyService.markSurveyAsReviewed(surveyId);
        reviewObservable.subscribe({
          next: (updatedSurvey: SurveyDTO) => {
            console.log('Survey marked as reviewed:', updatedSurvey);
            const index = this.surveys.findIndex(s => s.id === surveyId);
            if (index !== -1) {
              this.surveys[index] = updatedSurvey;
            }
            Swal.fire({ icon: 'success', title: 'Success', text: 'Survey marked as reviewed!', confirmButtonColor: '#5156be' });
          },
          error: (error: { error?: { message: string } }) => {
            console.error('Error marking survey as reviewed:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: error.error?.message || 'Failed to mark survey as reviewed!', confirmButtonColor: '#5156be' });
          }
        });
      } catch (error) {
        console.error('Error initiating markSurveyAsReviewed:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred!', confirmButtonColor: '#5156be' });
      }
    }
  }

  async fetchSurveyStats(): Promise<void> {
    const { startDate, endDate } = this.statsForm.value;
    try {
      const statsObservable = await this.surveyService.getSurveyStats(startDate || undefined, endDate || undefined);
      statsObservable.subscribe({
        next: (data: SurveyStats) => {
          this.stats = data;
          console.log('Survey stats loaded:', this.stats);
          this.updateCharts();
        },
        error: (error: { error?: { message: string } }) => {
          console.error('Error fetching survey stats:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: error.error?.message || 'Failed to fetch survey stats!', confirmButtonColor: '#5156be' });
        }
      });
    } catch (error) {
      console.error('Error initiating fetchSurveyStats:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred!', confirmButtonColor: '#5156be' });
    }
  }

  private updateCharts(): void {
    if (this.stats) {
      // Update Survey Completion Donut Chart (based on average score)
      const completed = this.stats.averageScore ? Math.min(100, Math.round(this.stats.averageScore * 20)) : 0; // Assuming 5 is 100%
      this.surveyCompletionDonutChart.data.datasets[0].data = [completed, 100 - completed];

      // Update Score Distribution Bar Chart
      this.scoreDistributionBarChart.data.labels = Object.keys(this.stats.scoreDistribution || {});
      this.scoreDistributionBarChart.data.datasets[0].data = Object.values(this.stats.scoreDistribution || {});

      // Update Question Averages Bar Chart
      this.questionAveragesBarChart.data.labels = Object.keys(this.stats.questionAverages || {}).map(key => `Q${key}`);
      this.questionAveragesBarChart.data.datasets[0].data = Object.values(this.stats.questionAverages || {});
    }
  }

  trackBySurveyId(index: number, survey: SurveyDTO): number {
    return survey.id ?? index;
  }

  getTotalSurveys(): number {
    if (!this.stats || !this.stats.scoreDistribution) return 0;
    return Object.values(this.stats.scoreDistribution).reduce((sum, count) => sum + count, 0);
  }
}
