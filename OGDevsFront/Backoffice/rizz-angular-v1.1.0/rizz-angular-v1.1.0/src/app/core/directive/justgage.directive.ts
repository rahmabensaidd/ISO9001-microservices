import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core'
import * as Raphael from 'raphael'
import JustGage from 'justgage'

declare global {
  interface Window {
    Raphael: any
  }
}

@Directive({
  selector: '[appJustGage]',
  standalone: true,
})
export class JustGageDirective implements OnInit {
  @Input('appJustGage') config: any
  private gauge: any

  constructor(private el: ElementRef) {
    window.Raphael = Raphael
  }

  ngOnInit(): void {
    this.gauge = new JustGage({
      id: this.el.nativeElement.id,
      ...this.config,
    })
  }

  refresh(value: number): void {
    if (this.gauge) {
      this.gauge.refresh(value)
    }
  }

  @HostListener('refreshGauge', ['$event.detail'])
  onRefreshGauge(value: number): void {
    this.refresh(value)
  }
}
