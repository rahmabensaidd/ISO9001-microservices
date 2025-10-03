import { Component } from '@angular/core'
import { OrderListComponent } from './components/order-list/order-list.component'
import { BoughtComponent } from './components/bought/bought.component'
import { SummaryComponent } from './components/summary/summary.component'
import { InformationComponent } from './components/information/information.component'

@Component({
    selector: 'app-order-details',
    imports: [
        OrderListComponent,
        BoughtComponent,
        SummaryComponent,
        InformationComponent,
    ],
    templateUrl: './order-details.component.html',
    styles: ``
})
export class OrderDetailsComponent {}
