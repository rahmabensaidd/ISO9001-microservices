import type { ChartOptions } from '@/app/common/apexchart.model'
import { currency } from '@/app/common/constants'
import { CardTitleComponent } from '@/app/components/card-title.component'
import { Component } from '@angular/core'
import { NgApexchartsModule } from 'ng-apexcharts'

@Component({
    selector: 'ecommerce-monthly-average',
    imports: [NgApexchartsModule, CardTitleComponent],
    templateUrl: './monthly-average.component.html',
    styles: ``
})
export class MonthlyAverageComponent {
  currency = currency
  colors = [
    '#95a0c5',
    '#95a0c5',
    '#95a0c5',
    '#22c55e',
    '#95a0c5',
    '#95a0c5',
    '#95a0c5',
    '#95a0c5',
    '#95a0c5',
    '#95a0c5',
    '#95a0c5',
    '#95a0c5',
  ]

  monthlyChart: Partial<ChartOptions> = {
    chart: {
      height: 270,
      type: 'bar',

      toolbar: {
        show: false,
      },
      dropShadow: {
        enabled: true,
        top: 0,
        left: 5,
        // bottom:0,
        // right: 0,
        blur: 5,
        color: '#45404a2e',
        opacity: 0.35,
      },
    },
    colors: this.colors,
    plotOptions: {
      bar: {
        borderRadius: 6,
        dataLabels: {
          position: 'top', // top, center, bottom
        },
        columnWidth: '20',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + '%'
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#8997bd'],
      },
    },
    series: [
      {
        name: 'Inflation',
        data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2],
      },
    ],
    xaxis: {
      categories: [
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
      position: 'top',
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        fill: {
          type: 'gradient',
          gradient: {
            colorFrom: '#D8E3F0',
            colorTo: '#BED1E6',
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: true,
        formatter: function (val) {
          return '$' + val + 'k'
        },
      },
    },
    grid: {
      row: {
        colors: ['transparent', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.2,
      },
      strokeDashArray: 2.5,
    },
    legend: {
      show: false,
    },
  }
}
