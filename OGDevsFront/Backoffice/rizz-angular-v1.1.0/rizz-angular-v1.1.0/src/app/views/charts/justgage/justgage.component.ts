import { Component, ElementRef, ViewChild } from '@angular/core'
import { JustGageDirective } from '@/app/core/directive/justgage.directive'
import * as JustGage from 'justgage'
import { RandomService } from '@/app/core/service/random.service'
@Component({
    selector: 'app-justgage',
    imports: [JustGageDirective],
    templateUrl: './justgage.component.html',
    styles: ``
})
export class JustgageComponent {
  gaugeValue: number = 72 // Initial gauge value
  gaugeMin: number = 0
  gaugeMax: number = 100
  avtarValue: number = 1024
  avtarMin: number = 40960
  avtarMax: number = 100000
  @ViewChild(JustGageDirective, { static: true })
  gageDirective!: JustGageDirective

  constructor(private randomService: RandomService) {}

  refreshGauge(id: string): void {
    const randomValue = this.randomService.getRandomInt(
      this.gaugeMin,
      this.gaugeMax
    )
    const gaugeElement = document.getElementById(id)
    if (gaugeElement) {
      gaugeElement.dispatchEvent(
        new CustomEvent('refreshGauge', { detail: randomValue })
      )
    }
  }

  refreshAvatar(id: string): void {
    const randomValue = this.randomService.getRandomInt(
      this.avtarMin,
      this.avtarMax
    )
    const gaugeElement = document.getElementById(id)
    if (gaugeElement) {
      gaugeElement.dispatchEvent(
        new CustomEvent('refreshGauge', { detail: randomValue })
      )
    }
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  fontOption = {
    id: 'Custom_wether',
    value: 50,
    min: 0,
    max: 100,
    title: 'Target',
    label: 'temperature',
    pointer: true,
    gaugeColor: ['rgba(42, 118, 244, .1)'],
    levelColors: ['#22c55e'],
    textRenderer(val: number): string {
      if (val < 50) {
        return 'Cold'
      } else if (val > 50) {
        return 'Hot'
      } else {
        return 'OK'
      }
    },
  }

  animationEvents = {
    value: 45,
    min: 0,
    max: 100,
    symbol: '%',
    pointer: true,
    gaugeColor: ['rgba(42, 118, 244, .1)'],
    levelColors: ['#22c55e'],
    pointerOptions: {
      toplength: -15,
      bottomlength: 10,
      bottomwidth: 12,
      color: '#ff5da0',
      stroke: '#ffffff',
      stroke_width: 3,
      stroke_linecap: 'round',
    },
    gaugeWidthScale: 0.6,
    counter: true,
    onAnimationEnd: () => {
      const log = document.getElementById('log')
      if (log) {
        log.innerHTML = log.innerHTML + 'Animation just ended.<br/>'
      }
    },
  }
}
