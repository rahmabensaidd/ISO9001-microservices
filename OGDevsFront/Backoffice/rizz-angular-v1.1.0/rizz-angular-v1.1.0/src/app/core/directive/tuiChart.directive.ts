import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener,
} from '@angular/core'
import tuiChart from 'tui-chart'

// Register the map manually
import 'tui-chart/dist/maps/usa.js'

@Directive({
  selector: '[appTuiChart]',
  standalone: true,
})
export class TuiChartDirective implements OnInit, OnChanges {
  @Input() chartType!: string
  @Input() data: any
  @Input() options: any
  @Input() theme: any

  private chartInstance: any

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.registerTheme()
    this.renderChart()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['data'] ||
      changes['options'] ||
      changes['chartType'] ||
      changes['theme']
    ) {
      this.registerTheme()
      this.renderChart()
    }
  }

  private registerTheme() {
    if (this.theme) {
      tuiChart.registerTheme('myTheme', this.theme)
      this.options.theme = 'myTheme'
    }
  }

  private renderChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy()
    }

    const container = this.el.nativeElement
    const chartMethodName = `${this.chartType}Chart`
    const chartFactory = (tuiChart as any)[chartMethodName]

    if (typeof chartFactory === 'function') {
      this.chartInstance = chartFactory(container, this.data, this.options)
    } else {
      console.error(`Unknown chart type: ${this.chartType}`)
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.chartInstance) {
      const container = this.el.nativeElement
      const width = container.offsetWidth
      this.chartInstance.resize({
        width: width,
        height: 350,
      })
    }
  }
}
