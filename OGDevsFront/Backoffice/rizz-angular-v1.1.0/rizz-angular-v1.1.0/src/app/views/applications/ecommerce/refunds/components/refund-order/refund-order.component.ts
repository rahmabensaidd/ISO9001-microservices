import { Component } from '@angular/core'
import { OrderList } from '../../data'
import { RouterLink } from '@angular/router'
import { currency } from '@/app/common/constants'

@Component({
    selector: 'refund-order',
    imports: [RouterLink],
    templateUrl: './refund-order.component.html',
    styles: ``
})
export class RefundOrderComponent {
  orderData = OrderList
  currency = currency
}
