import { Component } from '@angular/core'
import {
  NgbAccordionModule,
  NgbCollapseModule,
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap'

@Component({
    selector: 'app-accordions',
    imports: [NgbNavModule, NgbAccordionModule, NgbCollapseModule],
    templateUrl: './accordions.component.html',
    styles: ``
})
export class AccordionsComponent {
  isCollapsed = false
}
