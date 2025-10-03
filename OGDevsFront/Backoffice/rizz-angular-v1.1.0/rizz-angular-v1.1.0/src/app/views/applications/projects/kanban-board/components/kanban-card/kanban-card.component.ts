import { UtilsService } from '@/app/core/service/utils.service'
import { CommonModule } from '@angular/common'
import { Component, inject, Input } from '@angular/core'
import {
  NgbDropdownModule,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap'
import type { KanbanTaskType } from '../../data'

@Component({
    selector: 'app-kanban-card',
    imports: [CommonModule, NgbProgressbarModule, NgbDropdownModule],
    templateUrl: './kanban-card.component.html',
    styles: ``
})
export class KanbanCardComponent {
  @Input() task!: KanbanTaskType
  progress: number = 0

  public service = inject(UtilsService)

  calculateProgress(compleTask: number, totalTask: number) {
    this.progress = (compleTask / totalTask) * 100
    return Math.round(this.progress)
  }
}
