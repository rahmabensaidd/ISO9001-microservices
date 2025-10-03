import { TableService } from '@/app/core/service/table.service'
import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap'
import type { Observable } from 'rxjs'

@Component({
  selector: 'app-table-footer',
  imports: [CommonModule, NgbPaginationModule],
  templateUrl: './table-footer.component.html',
  standalone: true,
  styles: ``
})
export class TableFooterComponent {
  @Input() total!: Observable<number>

  constructor(public tableService: TableService<any>) {}
}
