import { Component, ViewChildren, type QueryList } from '@angular/core'
import type { Observable } from 'rxjs'
import { ContactData, type ContactType } from '../../data'
import {
  NgbdSortableHeader,
  type SortEvent,
} from '@/app/core/directive/sortable.directive'
import { TableService } from '@/app/core/service/table.service'
import { TableHeaderComponent } from '@/app/components/table/table-header/table-header.component'
import { TableFooterComponent } from '@/app/components/table/table-footer/table-footer.component'
import { AsyncPipe, CommonModule } from '@angular/common'

@Component({
    selector: 'contact-table',
    imports: [
        NgbdSortableHeader,
        TableHeaderComponent,
        TableFooterComponent,
        AsyncPipe,
        CommonModule,
    ],
    templateUrl: './contact-table.component.html',
    styles: ``
})
export class ContactTableComponent {
  contact$: Observable<ContactType[]>
  total$: Observable<number>

  @ViewChildren(NgbdSortableHeader) headers!: QueryList<
    NgbdSortableHeader<ContactType>
  >

  constructor(public tableService: TableService<ContactType>) {
    this.contact$ = tableService.items$
    this.total$ = tableService.total$
  }

  ngOnInit(): void {
    this.tableService.setItems(ContactData, 10)
  }

  onSort(event: SortEvent<ContactType>) {
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
