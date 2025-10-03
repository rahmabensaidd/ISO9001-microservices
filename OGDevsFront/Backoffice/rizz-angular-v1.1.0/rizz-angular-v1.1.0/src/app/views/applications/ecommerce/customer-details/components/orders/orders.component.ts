import { Component } from '@angular/core'
import { CustomerOrder } from '../../data'
import { CommonModule } from '@angular/common'
import { currency } from '@/app/common/constants'
import { RouterLink } from '@angular/router'

@Component({
    selector: 'customer-details-orders',
    imports: [CommonModule, RouterLink],
    templateUrl: './orders.component.html',
    styles: ``
})
export class OrdersComponent {
  orderList = CustomerOrder
  currency = currency
}
