import { Component } from '@angular/core'
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { CustomerCard } from '../../data'

@Component({
    selector: 'analytics-customer-card',
    imports: [NgbDropdownModule],
    templateUrl: './customer-card.component.html',
    styles: ``
})
export class CustomerCardComponent {
  customerCard = CustomerCard
}
