import type { ChartOptions } from '@/app/common/apexchart.model'
import { Component } from '@angular/core'
import { NgApexchartsModule } from 'ng-apexcharts'

@Component({
    selector: 'analytics-visitors',
    imports: [NgApexchartsModule],
    templateUrl: './visitors.component.html',
    styles: ``
})
export class VisitorsComponent {
  visitorChart: Partial<ChartOptions> = {
    series: [
      {
        name: 'Visitors',
        data: [20, 38, 38, 72, 55, 63, 43],
      },
    ],
    chart: {
      height: 230,
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 1,
        colorStops: [
          {
            offset: 0,
            color: 'rgba(106, 155, 155, 0.4)',
            opacity: 1,
          },
          {
            offset: 100,
            color: 'rgba(106, 155, 155, 0.4)',
            opacity: 1,
          },
        ],
      },
    },

    plotOptions: {
      bar: {
        columnWidth: '55%',
        // endingShape: "rounded",
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    grid: {
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    xaxis: {
      // type: "week",
      categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      axisBorder: {
        show: false,
        color: 'rgba(119, 119, 142, 0.05)',
        offsetX: 0,
        offsetY: 0,
      },
      axisTicks: {
        show: false,
        borderType: 'solid',
        color: 'rgba(119, 119, 142, 0.05)',
        // width: 6,
        offsetX: 0,
        offsetY: 0,
      },
      labels: {
        rotate: -90,
        style: {
          colors: 'rgb(107 ,114 ,128)',
          fontSize: '12px',
        },
      },
    },
  }
}
