import { DatePipe } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NouisliderModule } from 'ng2-nouislider'

@Component({
    selector: 'app-rangeslider',
    imports: [NouisliderModule, FormsModule, DatePipe],
    templateUrl: './rangeslider.component.html',
    styles: ``
})
export class RangesliderComponent {
  options: number[] = []
  someRange = 5
  range = [20, 80]
  htmlRange = [10, 30]
  skipRange = [20, 90]
  dateRange = [this.timestamp('2011'), this.timestamp('2015')]

  constructor(public datePipe: DatePipe) {
    for (let i = -20; i <= 40; i++) {
      this.options.push(i)
    }
  }

  slider_2config = {
    start: [20, 80],
    tooltips: true,
    connect: true,
    range: {
      min: 0,
      max: 100,
    },
  }

  htmlRangeConfig = {
    start: [10, 30],
    connect: true,
    range: {
      min: -20,
      max: 40,
    },
  }

  skipConfig = {
    range: {
      min: 0,
      '10%': 10,
      '20%': 20,
      '30%': 30,
      // Nope, 40 is no fun.
      '50%': 50,
      '60%': 60,
      '70%': 70,
      // I never liked 80.
      '90%': 90,
      max: 100,
    },
    snap: true,
    start: [20, 90],
  }

  pipsSliderConfig = {
    range: {
      min: 0,
      max: 100,
    },
    start: [50],
    pips: { mode: 'count', values: 5 },
  }

  softSliderConfig = {
    start: 50,
    range: {
      min: 0,
      max: 100,
    },
    pips: {
      mode: 'values',
      values: [20, 80],
      density: 4,
    },
    tooltips: true,
  }

  timestamp(str: string) {
    return new Date(str).getTime()
  }

  htmlRangeSLiderChange() {
    let newRange = [this.htmlRange[0], this.htmlRange[1]]
    newRange[0] = newRange[0]
    newRange[1] = newRange[1]
    this.htmlRange = newRange
  }
}
