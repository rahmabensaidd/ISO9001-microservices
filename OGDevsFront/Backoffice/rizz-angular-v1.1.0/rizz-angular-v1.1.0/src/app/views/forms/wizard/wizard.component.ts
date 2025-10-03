import { Component } from '@angular/core'
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap'

@Component({
    selector: 'app-wizard',
    imports: [NgbNavModule],
    templateUrl: './wizard.component.html',
    styles: ``
})
export class WizardComponent {
  active = 1
  activeId = 1
}
