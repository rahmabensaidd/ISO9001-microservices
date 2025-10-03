import { Component, type OnInit } from '@angular/core'
import { OrderList } from '../../data'
import { currency } from '@/app/common/constants'

@Component({
    selector: 'order-details-summary',
    imports: [],
    templateUrl: './summary.component.html',
    styles: ``
})
export class SummaryComponent implements OnInit {
  itemSubTotal: number = 0
  subTotal: number = 0
  netAmount: number = 0
  currency = currency

  ngOnInit(): void {
    OrderList.forEach((order) => {
      this.itemSubTotal += order.total
    })

    this.subTotal = this.itemSubTotal - 80 + 180.7
    this.netAmount = this.subTotal + 20
  }
}
