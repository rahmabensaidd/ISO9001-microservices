import { Component, inject, type OnInit, type TemplateRef } from '@angular/core'
import { kanbanSectionsData, kanbanTasksData } from '../../data'
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { KanbanCardComponent } from '../kanban-card/kanban-card.component'
import { DragulaModule, DragulaService } from 'ng2-dragula'
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
  type UntypedFormGroup,
} from '@angular/forms'
import { CommonModule } from '@angular/common'
import { Store } from '@ngrx/store'
import {
  addKanban,
  deleteBoard,
  fetchKanbanBoard,
  fetchKanbanTask,
  updateKanban,
} from '@/app/store/kanban/kanban.action'
import {
  getKanbanBoard,
  getKanbanData,
} from '@/app/store/kanban/kanban.selectors'
import type { KanbanSectionType, KanbanTaskType } from '@/app/store/kanban/data'
import { cloneDeep } from 'lodash'

@Component({
    selector: 'kanban-tasks',
    imports: [
        NgbDropdownModule,
        KanbanCardComponent,
        DragulaModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
    ],
    templateUrl: './kanban-tasks.component.html',
    styles: ``
})
export class KanbanTasksComponent implements OnInit {
  sectionsData!: KanbanSectionType[]
  taskList!: KanbanTaskType[]

  taskForm!: UntypedFormGroup
  submitted: boolean = false
  sectionId: string = ''

  private store = inject(Store)
  private modalService = inject(NgbModal)
  private fb = inject(UntypedFormBuilder)
  private dragulaService = inject(DragulaService)

  ngOnInit(): void {
    this.store.dispatch(fetchKanbanTask())
    this.store.select(getKanbanData).subscribe((data) => {
      this.taskList = cloneDeep(data)
    })

    this.store.dispatch(fetchKanbanBoard())
    this.store.select(getKanbanBoard).subscribe((data) => {
      this.sectionsData = data
    })

    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      id: ['', [Validators.required]],
      assigned: ['', [Validators.required]],
      description: ['', [Validators.required]],
      priority: ['low', [Validators.required]],
    })

    this.dragulaService
      .dropModel('DRAGULA_FACTS')
      .subscribe(({ el, target }) => {
        this.onDrop(el, target)
      })
  }

  getTaskVarient(title: string) {
    let variant = 'primary'
    if (title === 'To Do') variant = 'pink'
    else if (title === 'In Progress') variant = 'warning'
    else if (title === 'Review') variant = 'success'
    else if (title === 'Done') variant = 'info'
    return variant
  }

  onDrop(el: any, target: any): void {
    const taskId = el.getAttribute('data-task-id')
    const targetSectionId = target.getAttribute('data-section-id')
    if (taskId && targetSectionId) {
      const task = this.taskList.find((t) => t.id === taskId)
      if (task) {
        task.sectionId = targetSectionId
      }
    }
  }

  getTaskPerSection(id: string) {
    return this.taskList.filter((task) => task.sectionId == id)
  }

  get form() {
    return this.taskForm.controls
  }

  OpenTaskModel(content: TemplateRef<any>, id: string) {
    this.sectionId = id
    this.modalService.open(content)
  }

  addTask() {
    this.submitted = true
    if (this.taskForm.valid) {
      const newData = {
        sectionId: this.sectionId,
        totalTasks: 5,
        commentsCount: 0,
        completedTasks: 0,
        ...this.taskForm.value,
      }
      this.store.dispatch(addKanban({ newData }))
      this.modalService.dismissAll()
      this.taskForm.reset()
      this.submitted = false
    }
  }

  deleteTask(id: string) {
    this.store.dispatch(deleteBoard({ id }))
  }
}
