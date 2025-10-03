import type { ChartOptions } from '@/app/common/apexchart.model'
import { CardTitleComponent } from '@/app/components/card-title.component'
import { Component } from '@angular/core'
import { NgApexchartsModule } from 'ng-apexcharts'

@Component({
    selector: 'analytics-customer-growth',
    imports: [NgApexchartsModule, CardTitleComponent],
    templateUrl: './customer-growth.component.html',
    styles: ``
})
export class CustomerGrowthComponent {
  growthChart: Partial<ChartOptions> = {
    series: [
      {
        name: 'New Customers ',
        data: [0, 20, 15, 19, 14, 25, 30],
      },
      {
        name: 'Returning Customers',
        data: [0, 8, 7, 13, 26, 16, 25],
      },
    ],
    chart: {
      fontFamily: 'inherit',
      height: 233,
      type: 'line',
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    colors: ['var(--bs-primary)', 'var(--bs-primary-bg-subtle)'],
    grid: {
      show: true,
      strokeDashArray: 3,
    },
    stroke: {
      curve: 'smooth',
      colors: ['var(--bs-primary)', 'var(--bs-primary-bg-subtle)'],
      width: 2,
    },
    markers: {
      colors: ['var(--bs-primary)', 'var(--bs-primary-bg-subtle)'],
      strokeColors: 'transparent',
    },
    tooltip: {
      x: {
        show: false,
      },
      followCursor: true,
    },
  }
}
