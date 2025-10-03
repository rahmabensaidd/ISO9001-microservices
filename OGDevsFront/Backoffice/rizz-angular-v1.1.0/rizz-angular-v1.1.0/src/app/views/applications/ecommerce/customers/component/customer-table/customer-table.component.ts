import { Component, ViewChildren, type QueryList } from '@angular/core'
import type { Observable } from 'rxjs'
import { CustomerData, type CustomerType } from '../../data'
import {
  NgbdSortableHeader,
  type SortEvent,
} from '@/app/core/directive/sortable.directive'
import { TableService } from '@/app/core/service/table.service'
import { TableHeaderComponent } from '@/app/components/table/table-header/table-header.component'
import { TableFooterComponent } from '@/app/components/table/table-footer/table-footer.component'
import { AsyncPipe, CommonModule } from '@angular/common'

@Component({
    selector: 'customer-table',
    imports: [
        NgbdSortableHeader,
        TableHeaderComponent,
        TableFooterComponent,
        AsyncPipe,
        CommonModule,
    ],
    templateUrl: './customer-table.component.html',
    styles: ``
})
export class CustomerTableComponent {
  customer$: Observable<CustomerType[]>
  total$: Observable<number>

  @ViewChildren(NgbdSortableHeader) headers!: QueryList<
    NgbdSortableHeader<CustomerType>
  >

  constructor(public tableService: TableService<CustomerType>) {
    this.customer$ = tableService.items$
    this.total$ = tableService.total$
  }

  ngOnInit(): void {
    this.tableService.setItems(CustomerData, 10)
  }

  onSort(event: SortEvent<CustomerType>) {
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
