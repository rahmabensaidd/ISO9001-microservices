import { Component } from '@angular/core'
import { CustomerFilterComponent } from './component/customer-filter/customer-filter.component'
import { CustomerTableComponent } from './component/customer-table/customer-table.component'

@Component({
    selector: 'app-customers',
    imports: [CustomerFilterComponent, CustomerTableComponent],
    templateUrl: './customers.component.html',
    styles: ``
})
export class CustomersComponent {}
