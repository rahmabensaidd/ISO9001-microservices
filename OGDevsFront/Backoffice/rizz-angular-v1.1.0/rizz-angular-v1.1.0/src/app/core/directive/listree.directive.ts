import { Directive, ElementRef, OnInit } from '@angular/core'
import 'listree'

@Directive({
  selector: '[appListree]',
  standalone: true,
})
export class ListreeDirective implements OnInit {
  // private tobiiInstance: any;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    ;(window as any).listree(this.elementRef)
  }
}
