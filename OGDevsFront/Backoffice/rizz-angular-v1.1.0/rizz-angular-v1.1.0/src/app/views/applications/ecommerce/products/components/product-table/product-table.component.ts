import { TableFooterComponent } from '@/app/components/table/table-footer/table-footer.component'
import { TableHeaderComponent } from '@/app/components/table/table-header/table-header.component'
import {
  NgbdSortableHeader,
  type SortEvent,
} from '@/app/core/directive/sortable.directive'
import { AsyncPipe, CommonModule } from '@angular/common'
import { Component, ViewChildren, type QueryList } from '@angular/core'
import type { Observable } from 'rxjs'
import { ProductData, type ProductType } from '../../data'
import { TableService } from '@/app/core/service/table.service'
import { currency } from '@/app/common/constants'
import { RouterLink } from '@angular/router'

@Component({
    selector: 'product-table',
    imports: [
        CommonModule,
        TableFooterComponent,
        TableHeaderComponent,
        NgbdSortableHeader,
        AsyncPipe,
        RouterLink,
    ],
    templateUrl: './product-table.component.html',
    styles: ``
})
export class ProductTableComponent {
  currency = currency
  product$: Observable<ProductType[]>
  total$: Observable<number>

  @ViewChildren(NgbdSortableHeader) headers!: QueryList<
    NgbdSortableHeader<ProductType>
  >

  constructor(public tableService: TableService<ProductType>) {
    this.product$ = tableService.items$
    this.total$ = tableService.total$
  }

  ngOnInit(): void {
    this.tableService.setItems(ProductData, 10)
  }

  onSort(event: SortEvent<ProductType>) {
    const { column, direction } = event
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = ''
      }
    })

    this.tableService.sortColumn = column
    this.tableService.sortDirection = direction
  }
}
