import type { ChartOptions } from '@/app/common/apexchart.model';
import { CardTitleComponent } from '@/app/components/card-title.component';
import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'analytics-audience',
  imports: [NgApexchartsModule, CardTitleComponent],
  templateUrl: './audience.component.html',
  styles: ``,
  standalone: true // Ajouté pour cohérence avec standalone
})
export class AudienceComponent {
  audienceCharts: Partial<ChartOptions> = {
    chart: {
      height: 280,
      type: 'area',
      toolbar: {
        show: false,
      },
      dropShadow: {
        enabled: true,
        top: 12,
        left: 0,
        blur: 2,
        color: 'rgba(132, 145, 183, 0.3)',
        opacity: 0.35,
      },
    },
    annotations: {
      xaxis: [
        {
          x: 312,
          strokeDashArray: 4,
          borderWidth: 1,
        },
      ],
      points: [
        {
          x: 312,
          y: 52,
          marker: {
            size: 6, // Taille définie ici, "radius" est inutile
            fillColor: 'var(--bs-primary)',
            strokeColor: 'var(--bs-card-bg)',
            strokeWidth: 4,
            // "radius: 5" supprimé car non valide
          },
          label: {
            borderWidth: 1,
            offsetY: -110,
            text: '50k',
            style: {
              background: 'var(--bs-primary)',
              fontSize: '14px',
              fontWeight: '600',
            },
          },
        },
      ],
    },
    colors: ['#22c55e', 'rgba(106, 155, 155, 0.3)'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      curve: 'smooth',
      width: [3, 3],
      dashArray: [0, 0],
      lineCap: 'round',
    },
    series: [
      {
        name: 'Income',
        data: [31, 40, 28, 51, 31, 40, 28, 51, 31, 40, 28, 51],
      },
      {
        name: 'Expenses',
        data: [0, 30, 10, 40, 30, 60, 50, 80, 70, 100, 90, 130],
      },
    ],
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    yaxis: {
      labels: {
        offsetX: -12,
        offsetY: 0,
        formatter: function (value) {
          return '$' + value;
        },
      },
    },
    grid: {
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    legend: {
      show: false,
    },
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        shadeIntensity: 1,
        inverseColors: !1,
        opacityFrom: 0.05,
        opacityTo: 0.05,
        stops: [45, 100],
      },
    },
  };
}
