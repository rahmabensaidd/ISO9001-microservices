import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core'
import Tobii from 'tobii'

@Directive({
  selector: '[appTobii]',
  standalone: true,
})
export class TobiiDirective {
  private tobiiInstance: any

  ngOnInit(): void {
    const tobii = new Tobii()
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.tobiiInstance) {
      event.preventDefault()

      if (this.tobiiInstance.isOpen()) {
        this.tobiiInstance.close()
      } else {
        this.tobiiInstance.open()
      }
    }
  }
}
