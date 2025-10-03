import { ComponentFixture, TestBed } from '@angular/core/testing'

import { KanbanTasksComponent } from './kanban-tasks.component'

describe('KanbanTasksComponent', () => {
  let component: KanbanTasksComponent
  let fixture: ComponentFixture<KanbanTasksComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanTasksComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(KanbanTasksComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
