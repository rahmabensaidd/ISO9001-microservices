import { CardTitleComponent } from '@/app/components/card-title.component'
import { Component } from '@angular/core'
import { OrderList } from '../../data'
import { currency } from '@/app/common/constants'

@Component({
    selector: 'ecommerce-recent-order',
    imports: [CardTitleComponent],
    templateUrl: './recent-order.component.html',
    styles: ``
})
export class RecentOrderComponent {
  orderList = OrderList
  currency = currency
}
