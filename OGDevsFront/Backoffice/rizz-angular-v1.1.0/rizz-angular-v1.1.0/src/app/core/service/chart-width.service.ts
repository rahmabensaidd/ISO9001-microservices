import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class ChartWidthService {
  constructor() {}

  setChartWidth(chartData: any, elementId: string): void {
    const element = document.getElementById(elementId)
    const chartWidth = element ? element.offsetWidth : 0

    if (chartData && chartData.options && chartData.options.chart) {
      chartData.options.chart.width = chartWidth
    }
  }
}
