import { Component } from '@angular/core'
import { CustomerTable } from '../../data'

@Component({
    selector: 'analytics-customer-detail',
    imports: [],
    templateUrl: './customer-detail.component.html',
    styles: ``
})
export class CustomerDetailComponent {
  customerDataTable = CustomerTable
}
