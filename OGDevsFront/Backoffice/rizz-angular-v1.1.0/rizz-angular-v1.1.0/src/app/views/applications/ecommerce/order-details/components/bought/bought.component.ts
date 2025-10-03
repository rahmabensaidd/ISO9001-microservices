import { currentYear } from '@/app/common/constants'
import { Component } from '@angular/core'
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap'

@Component({
    selector: 'order-details-bought',
    imports: [NgbProgressbarModule],
    templateUrl: './bought.component.html',
    styles: ``
})
export class BoughtComponent {
  currentYear = currentYear
}
