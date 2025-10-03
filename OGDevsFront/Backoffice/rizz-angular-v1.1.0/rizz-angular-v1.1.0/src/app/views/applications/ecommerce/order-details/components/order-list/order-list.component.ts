import { Component } from '@angular/core'
import { OrderList } from '../../data'
import { currency, currentYear } from '@/app/common/constants'

@Component({
    selector: 'order-list',
    imports: [],
    templateUrl: './order-list.component.html',
    styles: ``
})
export class OrderListComponent {
  orderData = OrderList
  currency = currency
  currentYear = currentYear
}
