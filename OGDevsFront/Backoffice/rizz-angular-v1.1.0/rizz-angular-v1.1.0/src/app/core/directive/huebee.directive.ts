import {
  Directive,
  ElementRef,
  Input,
  AfterViewInit,
  OnDestroy,
} from '@angular/core'
import Huebee from 'huebee'

@Directive({
  selector: '[appHuebee]',
  standalone: true,
})
export class HuebeeDirective implements AfterViewInit, OnDestroy {
  private huebee: Huebee | null = null
  @Input('appHuebee') options: any

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    if (!Huebee) {
      throw new Error('Huebee not available')
    }

    if (this.options) {
      this.huebee = new Huebee(this.elementRef.nativeElement, this.options)
    } else {
      console.error('Huebee options not provided.')
    }
  }

  ngOnDestroy(): void {
    if (this.huebee) {
      this.huebee = null
    }
  }
}
