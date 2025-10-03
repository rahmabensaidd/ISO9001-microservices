import { Component } from '@angular/core'
import { ProductList } from '../../data'
import { CommonModule } from '@angular/common'
import { CardTitleComponent } from '@/app/components/card-title.component'
import { currency } from '@/app/common/constants'

@Component({
    selector: 'ecommerce-popular-product',
    imports: [CommonModule, CardTitleComponent],
    templateUrl: './popular-product.component.html',
    styles: ``
})
export class PopularProductComponent {
  ProductList = ProductList
  currency = currency
}
