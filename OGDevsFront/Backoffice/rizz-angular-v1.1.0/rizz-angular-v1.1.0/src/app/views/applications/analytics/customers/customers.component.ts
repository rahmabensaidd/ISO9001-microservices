import { Component } from '@angular/core'
import { CustomerCardComponent } from './components/customer-card/customer-card.component'
import { CustomerDetailComponent } from './components/customer-detail/customer-detail.component'
import { CustomerGrowthComponent } from './components/customer-growth/customer-growth.component'
import { CustomerDataComponent } from './components/customer-data/customer-data.component'

@Component({
    selector: 'app-customers',
    imports: [
        CustomerCardComponent,
        CustomerDetailComponent,
        CustomerGrowthComponent,
        CustomerDataComponent,
    ],
    templateUrl: './customers.component.html',
    styles: ``
})
export class CustomersComponent {}
