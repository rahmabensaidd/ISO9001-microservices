import type { ChartOptions } from '@/app/common/apexchart.model'
import { Component } from '@angular/core'
import { NgApexchartsModule } from 'ng-apexcharts'

@Component({
    selector: 'ecommerce-categories',
    imports: [NgApexchartsModule],
    templateUrl: './categories.component.html',
    styles: ``
})
export class CategoriesComponent {
  categoryChart: Partial<ChartOptions> = {
    series: [
      {
        name: 'Items',
        data: [1380, 1100, 990, 880, 740, 548, 330, 200],
      },
    ],
    chart: {
      type: 'bar',
      height: 275,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: true,
        distributed: true,
        barHeight: '85%',
        isFunnel: true,
        isFunnel3d: false,
      },
    },

    dataLabels: {
      enabled: true,
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex]
      },
      dropShadow: {
        enabled: false,
      },
      style: {
        colors: ['#22c55e'],
        fontWeight: 400,
        fontSize: '13px',
      },
    },
    xaxis: {
      categories: [
        'Mobile',
        'Men Fishion',
        'Women Fishion',
        'Beauty',
        'Health',
        'Sports',
        'Kids',
        'Music',
      ],
    },
    colors: [
      'rgba(34, 197, 94, 0.45)',
      'rgba(34, 197, 94, 0.4)',
      'rgba(34, 197, 94, 0.35)',
      'rgba(34, 197, 94, 0.3)',
      'rgba(34, 197, 94, 0.25)',
      'rgba(34, 197, 94, 0.2)',
      'rgba(34, 197, 94, 0.15)',
      'rgba(34, 197, 94, 0.1)',
    ],
    legend: {
      show: false,
    },
  }
}
