import { Component } from '@angular/core'
import { OrderList } from '../../data'
import { currency } from '@/app/common/constants'

@Component({
    selector: 'refund-summary',
    imports: [],
    templateUrl: './refund-summary.component.html',
    styles: ``
})
export class RefundSummaryComponent {
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
