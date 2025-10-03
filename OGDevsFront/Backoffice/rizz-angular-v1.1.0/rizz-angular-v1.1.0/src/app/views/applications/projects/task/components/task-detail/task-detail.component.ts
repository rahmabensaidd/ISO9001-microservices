import { Component, inject } from '@angular/core'
import { TaskDetails } from './data'
import {
  NgbAccordionModule,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { UtilsService } from '@/app/core/service/utils.service'

@Component({
  selector: 'task-detail',
  imports: [NgbAccordionModule, CommonModule, NgbProgressbarModule],
  templateUrl: './task-detail.component.html',
  standalone: true,
  styles: ``
})
export class TaskDetailComponent {
  taskList = TaskDetails

  public service = inject(UtilsService)
}
