import { Component, type AfterViewInit } from '@angular/core'
import * as Prism from 'prismjs'

@Component({
    selector: 'app-typography',
    imports: [],
    templateUrl: './typography.component.html',
    styles: ``
})
export class TypographyComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    Prism.highlightAll()
  }
}
