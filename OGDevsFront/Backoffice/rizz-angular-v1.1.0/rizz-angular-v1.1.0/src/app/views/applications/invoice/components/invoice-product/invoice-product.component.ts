import { Component } from '@angular/core'
import { InvoiceData } from '../../data'
import { currency } from '@/app/common/constants'

@Component({
  selector: 'invoice-product',
  imports: [],
  templateUrl: './invoice-product.component.html',
  standalone: true,
  styles: ``
})
export class InvoiceProductComponent {
  productList = InvoiceData
  currency = currency
}
