import { CardTitleComponent } from '@/app/components/card-title.component'
import { Component } from '@angular/core'
import { TopSelling } from '../../data'
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap'
import { currency } from '@/app/common/constants'

@Component({
    selector: 'ecommerce-top-selling',
    imports: [CardTitleComponent, NgbProgressbarModule],
    templateUrl: './top-selling.component.html',
    styles: ``
})
export class TopSellingComponent {
  sellingList = TopSelling
  currency = currency
}
