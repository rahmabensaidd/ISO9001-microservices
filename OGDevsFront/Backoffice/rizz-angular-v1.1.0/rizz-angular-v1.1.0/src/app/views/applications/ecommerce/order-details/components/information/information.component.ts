import { Component } from '@angular/core'
import { OrderInfo } from '../../data'
import { currency } from '@/app/common/constants'

@Component({
    selector: 'order-details-information',
    imports: [],
    templateUrl: './information.component.html',
    styles: ``
})
export class InformationComponent {
  orderInfo = OrderInfo
  currency = currency
}
