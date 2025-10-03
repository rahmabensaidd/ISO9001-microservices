import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [BaseChartDirective, CommonModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  totalDocuments: number = 0;
  avgSalary: number = 0;
  avgDuration: number = 0;
  completionRate: number = 0;
  documentsByCategory: { [key: string]: number } = {};
  documentsByCreator: { [key: string]: number } = {};
  documentCorrelation: number = 0;

  errorMessage: string | null = null;

  constructor(private http: HttpClient) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  async loadStatistics(): Promise<void> {
    try {
      // Total documents
      this.http.get<{ [key: string]: number }>('http://localhost:8080/documents/stats/by-type')
        .subscribe({
          next: data => {
            this.totalDocuments = Object.values(data).reduce((sum, val) => sum + val, 0);
          },
          error: err => this.handleError(err)
        });

      // Salaire brut moyen
      this.http.get<number>('http://localhost:8080/documents/stats/average-gross-salary')
        .subscribe({
          next: data => {
            this.avgSalary = data;
          },
          error: err => this.handleError(err)
        });

      // Durée moyenne
      this.http.get<Document[]>('http://localhost:8080/documents/getallDocuments')
        .subscribe({
          next: documents => {
            this.avgDuration = documents.length > 0
              ? documents.reduce((sum, d) => {
              const creationDate = new Date(d.dateCreation);
              const today = new Date();
              return sum + (today.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
            }, 0) / documents.length
              : 0;
          },
          error: err => this.handleError(err)
        });

      // Taux de complétion
      this.http.get<Document[]>('http://localhost:8080/documents/getallDocuments')
        .subscribe({
          next: documents => {
            const completed = documents.filter(d => d.content?.toLowerCase().includes('terminé')).length;
            this.completionRate = documents.length > 0 ? (completed / documents.length) * 100 : 0;
            this.updateDocumentDonutChart();
          },
          error: err => this.handleError(err)
        });

      // Documents par catégorie
      this.http.get<{ [key: string]: number }>('http://localhost:8080/documents/stats/by-category')
        .subscribe({
          next: data => {
            this.documentsByCategory = data;
            this.updateCategoryChart();
          },
          error: err => this.handleError(err)
        });

      // Documents par créateur
      this.http.get<{ [key: string]: number }>('http://localhost:8080/documents/stats/by-creator')
        .subscribe({
          next: data => {
            this.documentsByCreator = data;
            this.updateCreatorChart();
          },
          error: err => this.handleError(err)
        });

      // Corrélation salaire-durée
      this.http.get<Document[]>('http://localhost:8080/documents/getallDocuments')
        .subscribe({
          next: documents => {
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
          },
          error: err => this.handleError(err)
        });
    } catch (err) {
      this.handleError(err);
    }
  }

  // Configuration du graphique en donut pour le taux de complétion
  public documentDonutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: ['Complétés', 'Incomplets'],
      datasets: [{
        data: [0, 100],
        backgroundColor: ['#22c55e', '#f67f7f'],
        borderColor: 'transparent',
        borderRadius: 0,
        hoverBackgroundColor: ['#22c55e', '#f67f7f']
      }]
    },
    options: {
      radius: 100,
      cutout: 100,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#7c8ea7',
            font: { family: 'Be Vietnam Pro' }
          }
        }
      }
    }
  };

  // Configuration du graphique en barres pour les catégories
  public barChartCategory: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Documents par Catégorie',
        data: [],
        borderRadius: 10,
        borderSkipped: false,
        backgroundColor: '#00a6cb',
        borderColor: '#00a6cb',
        borderWidth: 1,
        barThickness: 15,
        maxBarThickness: 9
      }]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#7c8ea7',
            font: { family: 'Be Vietnam Pro' }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#7c8ea7' },
          grid: { color: 'rgba(132, 145, 183, 0.15)' }
        },
        x: {
          ticks: { color: '#7c8ea7' },
          grid: { display: false }
        }
      }
    }
  };

  // Configuration du graphique en barres pour les créateurs
  public barChartCreator: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Documents par Créateur',
        data: [],
        borderRadius: 10,
        borderSkipped: false,
        backgroundColor: '#00a6cb',
        borderColor: '#00a6cb',
        borderWidth: 1,
        barThickness: 15,
        maxBarThickness: 9
      }]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#7c8ea7',
            font: { family: 'Be Vietnam Pro' }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#7c8ea7' },
          grid: { color: 'rgba(132, 145, 183, 0.15)' }
        },
        x: {
          ticks: { color: '#7c8ea7' },
          grid: { display: false }
        }
      }
    }
  };

  // Mettre à jour le graphique en donut
  private updateDocumentDonutChart(): void {
    this.documentDonutChartConfig.data.datasets[0].data = [this.completionRate, 100 - this.completionRate];
  }

  // Mettre à jour le graphique en barres pour les catégories
  private updateCategoryChart(): void {
    this.barChartCategory.data.labels = Object.keys(this.documentsByCategory);
    this.barChartCategory.data.datasets[0].data = Object.values(this.documentsByCategory);
  }

  // Mettre à jour le graphique en barres pour les créateurs
  private updateCreatorChart(): void {
    this.barChartCreator.data.labels = Object.keys(this.documentsByCreator);
    this.barChartCreator.data.datasets[0].data = Object.values(this.documentsByCreator);
  }

  // Calculer la corrélation
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

  // Gérer les erreurs
  private handleError(error: any): void {
    this.errorMessage = 'Erreur lors du chargement des statistiques. Veuillez réessayer plus tard.';
    console.error('Erreur:', error);
  }
}

// Interface pour Document
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
