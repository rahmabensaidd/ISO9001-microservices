import type { ChartOptions } from '@/app/common/apexchart.model'
import { Component } from '@angular/core'
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { NgApexchartsModule } from 'ng-apexcharts'

@Component({
    selector: 'analytics-traffic-source',
    imports: [NgApexchartsModule, NgbDropdownModule],
    templateUrl: './traffic-source.component.html',
    styles: ``
})
export class TrafficSourceComponent {
  trafficChart: Partial<ChartOptions> = {
    series: [76],
    chart: {
      height: '325',
      type: 'radialBar',
      offsetY: -20,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: '75%',
          position: 'front',
        },
        track: {
          background: ['rgba(42, 118, 244, .18)'],
          strokeWidth: '80%',
          opacity: 0.5,
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: -2,
            fontSize: '20px',
          },
        },
      },
    },
    stroke: {
      lineCap: 'butt',
    },
    colors: ['#95a0c5'],
    grid: {
      padding: {
        top: -10,
      },
    },

    labels: ['Average Results'],
    responsive: [
      {
        breakpoint: 1150,
        options: {
          chart: {
            height: '150',
          },
        },
      },
    ],
  }
}
