import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core'
import Datepicker from 'vanillajs-datepicker/Datepicker'

@Directive({
  selector: '[appDatepicker]',
  standalone: true,
})
export class DatepickerDirective implements OnInit, OnDestroy {
  @Input() options: any = {}

  private datepicker!: Datepicker

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.datepicker = new Datepicker(this.el.nativeElement, this.options)
  }

  ngOnDestroy(): void {
    if (this.datepicker) {
      this.datepicker.destroy()
    }
  }
}
