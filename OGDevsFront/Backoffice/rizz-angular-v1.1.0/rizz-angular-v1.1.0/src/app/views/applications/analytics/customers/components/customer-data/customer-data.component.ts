import { Component } from '@angular/core'
import { CustomerData } from '../../data'
import { CardTitleComponent } from '@/app/components/card-title.component'

@Component({
    selector: 'analytics-customer-data',
    imports: [CardTitleComponent],
    templateUrl: './customer-data.component.html',
    styles: ``
})
export class CustomerDataComponent {
  customerData = CustomerData
}
