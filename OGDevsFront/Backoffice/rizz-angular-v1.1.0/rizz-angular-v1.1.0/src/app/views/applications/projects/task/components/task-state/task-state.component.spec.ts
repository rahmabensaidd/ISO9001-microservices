import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TaskStateComponent } from './task-state.component'

describe('TaskStateComponent', () => {
  let component: TaskStateComponent
  let fixture: ComponentFixture<TaskStateComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskStateComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TaskStateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
