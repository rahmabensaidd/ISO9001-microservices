import { Component } from '@angular/core'
import { RefundSummaryComponent } from './components/refund-summary/refund-summary.component'
import { RefundOrderComponent } from './components/refund-order/refund-order.component'

@Component({
    selector: 'app-refunds',
    imports: [RefundOrderComponent, RefundSummaryComponent],
    templateUrl: './refunds.component.html',
    styles: ``
})
export class RefundsComponent {}
