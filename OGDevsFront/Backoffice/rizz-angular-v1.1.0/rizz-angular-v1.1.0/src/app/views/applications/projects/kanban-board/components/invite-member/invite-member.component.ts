import { Component, inject, type OnInit, type TemplateRef } from '@angular/core'
import { FormsModule } from '@angular/forms'
import {
  NgbDropdownModule,
  NgbModal,
  NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap'
import { kanbanSectionsData, type KanbanSectionType } from '../../data'
import { Store } from '@ngrx/store'
import { addBoard, fetchKanbanBoard } from '@/app/store/kanban/kanban.action'
import { getKanbanBoard } from '@/app/store/kanban/kanban.selectors'

@Component({
  selector: 'kanban-invite-member',
  imports: [NgbModalModule, FormsModule, NgbDropdownModule],
  templateUrl: './invite-member.component.html',
  styles: ``
})
export class InviteMemberComponent implements OnInit {
  title!: string
  sectionsData!: KanbanSectionType[]

  private store = inject(Store)
  private modalService = inject(NgbModal)

  ngOnInit(): void {
    this.store.dispatch(fetchKanbanBoard())
    this.store.select(getKanbanBoard).subscribe((data) => {
      this.sectionsData = data
    })
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content)
  }

  addTaskBoard() {
    let taskNumber = this.sectionsData.length + 1
    let taskNumberStr = taskNumber.toString()
    const newData = {
      id: taskNumberStr,
      title: this.title,
    }
    this.store.dispatch(addBoard({ newData }))
    this.title = ''
    this.modalService.dismissAll()
  }
}
