import type { ChartOptions } from '@/app/common/apexchart.model'
import { currency } from '@/app/common/constants'
import { Component } from '@angular/core'
import { NgApexchartsModule } from 'ng-apexcharts'

@Component({
    selector: 'ecommerce-state',
    imports: [NgApexchartsModule],
    templateUrl: './state.component.html',
    styles: ``
})
export class StateComponent {
  currency = currency
  line1Chart: Partial<ChartOptions> = {
    series: [
      {
        data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54],
      },
    ],
    chart: {
      type: 'line',
      width: 120,
      height: 35,
      sparkline: {
        enabled: true,
      },
      dropShadow: {
        enabled: true,
        top: 4,
        left: 0,
        // bottom: 0,
        // right: 0,
        blur: 2,
        color: 'rgba(132, 145, 183, 0.3)',
        opacity: 0.35,
      },
    },
    colors: ['#95a0c5'],
    stroke: {
      show: true,
      curve: 'smooth',
      width: [3],
      lineCap: 'round',
    },
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName) {
            return ''
          },
        },
      },
      marker: {
        show: false,
      },
    },
  }

  line2Chart: Partial<ChartOptions> = {
    series: [
      {
        data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54],
      },
    ],
    chart: {
      type: 'line',
      width: 120,
      height: 35,
      sparkline: {
        enabled: true,
      },
      dropShadow: {
        enabled: true,
        top: 4,
        left: 0,
        // bottom: 0,
        // right: 0,
        blur: 2,
        color: 'rgba(132, 145, 183, 0.3)',
        opacity: 0.35,
      },
    },
    colors: ['#95a0c5'],
    stroke: {
      show: true,
      curve: 'smooth',
      width: [3],
      lineCap: 'round',
    },
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName) {
            return ''
          },
        },
      },
      marker: {
        show: false,
      },
    },
  }
}
