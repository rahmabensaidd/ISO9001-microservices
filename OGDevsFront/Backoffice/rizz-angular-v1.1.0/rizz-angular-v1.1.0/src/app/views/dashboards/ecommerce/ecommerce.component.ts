import { Component } from '@angular/core'
import { StateComponent } from './compponents/state/state.component'
import { MonthlyAverageComponent } from './compponents/monthly-average/monthly-average.component'
import { PopularProductComponent } from './compponents/popular-product/popular-product.component'
import { CustomersComponent } from './compponents/customers/customers.component'
import { TopSellingComponent } from './compponents/top-selling/top-selling.component'
import { CategoriesComponent } from './compponents/categories/categories.component'
import { RecentOrderComponent } from './compponents/recent-order/recent-order.component'

@Component({
    selector: 'app-ecommerce',
    imports: [
        StateComponent,
        MonthlyAverageComponent,
        PopularProductComponent,
        CustomersComponent,
        TopSellingComponent,
        CategoriesComponent,
        RecentOrderComponent,
    ],
    templateUrl: './ecommerce.component.html',
    styles: ``
})
export class EcommerceComponent {}
