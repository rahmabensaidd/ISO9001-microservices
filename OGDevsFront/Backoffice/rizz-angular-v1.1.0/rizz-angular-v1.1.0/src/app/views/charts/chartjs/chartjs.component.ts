import { Component } from '@angular/core'
import { BaseChartDirective } from 'ng2-charts'
import { ChartType } from './chartjs.model'
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  DoughnutController,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  PolarAreaController,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js'
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  PointElement,
  LineElement,
  BarController,
  DoughnutController,
  ArcElement,
  PolarAreaController,
  RadialLinearScale,
  PieController,
  RadarController
)

@Component({
  selector: 'app-chartjs',
  imports: [BaseChartDirective],
  templateUrl: './chartjs.component.html',
  standalone: true,
  styles: ``
})
export class ChartjsComponent {
  public lineAreaChart: ChartConfiguration = {
    type: 'line',
    data: {
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
      datasets: [
        {
          label: 'Monthly Report',
          data: [12, 19, 13, 9, 12, 11, 12, 19, 13, 9, 12, 11],
          backgroundColor: ['#22c55e'],
          borderColor: ['#22c55e'],
          borderWidth: 2,
          borderDash: [3],
          borderJoinStyle: 'round',
          borderCapStyle: 'round',
          pointBorderColor: '#22c55e',
          pointRadius: 3,
          pointBorderWidth: 1,
          tension: 0.3,
        },
        {
          label: 'Monthly Report',
          data: [8, 12, 15, 11, 8, 14, 16, 13, 10, 7, 19, 16],
          backgroundColor: ['#fac146'],
          borderColor: ['#fac146'],
          borderWidth: 2,
          borderDash: [0],
          borderJoinStyle: 'round',
          borderCapStyle: 'round',
          pointBorderColor: '#fac146',
          pointRadius: 3,
          pointBorderWidth: 1,
          tension: 0.3,
        },
      ],
    },

    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#7c8ea7',
            font: {
              family: 'sans-serif',
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value, index, values) {
              return '$' + value
            },
            color: '#7c8ea7',
          },
          grid: {
            color: 'rgba(132, 145, 183, 0.15)',
            tickColor: 'rgba(132, 145, 183, 0.15)',
          },
        },
        x: {
          ticks: {
            color: '#7c8ea7',
          },
          grid: {
            display: false,
            color: 'rgba(132, 145, 183, 0.09)',

            // borderDash: [3],
            // borderColor: 'rgba(132, 145, 183, 0.09)',
          },
        },
      },
    },
  }

  public barCharts: ChartType = {
    data: {
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
      datasets: [
        {
          label: 'Monthly Report',
          data: [12, 19, 13, 9, 12, 11, 12, 19, 13, 9, 12, 11],
          borderRadius: 100,
          borderSkipped: false,
          backgroundColor: '#00a6cb',
          borderColor: '#00a6cb',
          borderWidth: 1,
          indexAxis: 'x',
          barThickness: 15,
          grouped: true,
          maxBarThickness: 9,
          barPercentage: 50,
        },
        {
          label: 'Monthly Report',
          data: [8, 12, 15, 11, 8, 14, 16, 13, 10, 7, 19, 16],
          borderRadius: 100,
          borderSkipped: false,
          backgroundColor: '#fac146',
          borderColor: '#fac146',
          borderWidth: 1,
          indexAxis: 'x',
          barThickness: 15,
          grouped: true,
          maxBarThickness: 9,
        },
      ],
    },

    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#7c8ea7',
            font: {
              family: 'Be Vietnam Pro',
            },
          },
        },

        // title: {
        //   display: false,
        //   text: 'Chart.js Bar Chart',
        // },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value, index, values) {
              return '$' + value
            },
            color: '#7c8ea7',
          },
          grid: {
            // drawBorder: 'border',
            color: 'rgba(132, 145, 183, 0.15)',
            tickBorderDash: [3],
            tickColor: 'rgba(132, 145, 183, 0.15)',
          },
        },
        x: {
          ticks: {
            color: '#7c8ea7',
          },
          grid: {
            display: false,
            color: 'rgba(132, 145, 183, 0.09)',
            tickBorderDash: [3],
            tickColor: 'rgba(132, 145, 183, 0.09)',
          },
        },
      },
    },
  }

  public donutChartConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: ['Desktops', 'Laptop', 'Tablets', 'Mobiles'],
      datasets: [
        {
          data: [80, 50, 100, 121],
          backgroundColor: ['#f67f7f', '#7777f0', '#fac146', '#22c55e'],
          borderColor: 'transparent',
          borderRadius: 0,
          hoverBackgroundColor: ['#4d79f6', '#ff5da0', '#e0e7fd', '#4ac7ec'],
        },
      ],
    },
    options: {
      radius: 100,
      cutout: 100,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#7c8ea7',
            font: {
              family: 'Be Vietnam Pro',
            },
          },
        },
      },
    },
  }

  public polarChart: ChartType = {
    data: {
      labels: ['Desktops', 'Laptop', 'Tablets', 'Mobiles'],
      datasets: [
        {
          data: [80, 50, 100, 121],
          backgroundColor: ['#4d79f6', '#ff5da0', '#e0e7fd', '#4ac7ec'],
          borderColor: 'transparent',
          hoverBackgroundColor: ['#4d79f6', '#ff5da0', '#e0e7fd', '#4ac7ec'],
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#7c8ea7',
            font: {
              family: 'Be Vietnam Pro',
            },
          },
        },
      },
    },
  }

  public pieChart: ChartType = {
    // type: 'pie',
    data: {
      labels: ['Desktops', 'Laptop', 'Tablets', 'Mobiles'],
      datasets: [
        {
          data: [80, 50, 100, 121],
          backgroundColor: ['#4d79f6', '#ff5da0', '#e0e7fd', '#4ac7ec'],
          // cutout: 0,
          radius: 100,
          borderColor: 'transparent',
          borderRadius: 0,
          hoverBackgroundColor: ['#4d79f6', '#ff5da0', '#e0e7fd', '#4ac7ec'],
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#7c8ea7',
            font: {
              family: 'Be Vietnam Pro',
            },
          },
        },
      },
    },
  }
  public radarChart: ChartType = {
    data: {
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
      datasets: [
        {
          label: 'Monthly Report',
          data: [12, 19, 13, 9, 12, 11, 12, 19, 13, 9, 12, 11],
          backgroundColor: ['rgba(11, 81, 183, 0.1)'],
          borderColor: ['rgba(11, 81, 183, 1)'],
          borderWidth: 2,
          borderDash: [3],
          borderJoinStyle: 'round',
          borderCapStyle: 'round',
          pointBorderColor: 'rgba(11, 81, 183, 1)',
          pointRadius: 3,
          pointBorderWidth: 1,
          fill: true,
          hitRadius: 5,
        },
        {
          label: 'Monthly Report',
          data: [8, 12, 15, 11, 8, 14, 16, 13, 10, 7, 19, 16],
          backgroundColor: ['rgba(28, 202, 184, 0.1)'],
          borderColor: ['rgba(137, 153, 175, 0.3)'],
          borderWidth: 2,
          borderDash: [0],
          borderJoinStyle: 'round',
          borderCapStyle: 'round',
          pointBorderColor: 'rgba(137, 153, 175, 0.3)',
          pointRadius: 3,
          pointBorderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: '#7c8ea7',
            font: {
              family: 'Be Vietnam Pro',
            },
          },
        },
      },
      elements: {
        line: {
          borderWidth: 3,
        },
      },
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            display: true,
            color: 'rgba(137, 153, 175, 0.3)',
            borderDash: [2],
          },
          grid: {
            color: 'rgba(137, 153, 175, 0.3)',
          },
        },
      },
    },
  }
}
