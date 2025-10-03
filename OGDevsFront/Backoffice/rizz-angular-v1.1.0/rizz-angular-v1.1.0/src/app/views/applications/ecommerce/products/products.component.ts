import { Component } from '@angular/core'
import { ProductFilterComponent } from './components/product-filter/product-filter.component'
import { ProductTableComponent } from './components/product-table/product-table.component'

@Component({
    selector: 'app-products',
    imports: [ProductFilterComponent, ProductTableComponent],
    templateUrl: './products.component.html',
    styles: ``
})
export class ProductsComponent {}
