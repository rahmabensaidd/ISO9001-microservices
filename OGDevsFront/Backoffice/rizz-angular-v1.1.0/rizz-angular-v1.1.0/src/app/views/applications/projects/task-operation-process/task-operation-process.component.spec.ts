import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskOperationProcessComponent } from './task-operation-process.component';

describe('TaskOperationProcessComponent', () => {
  let component: TaskOperationProcessComponent;
  let fixture: ComponentFixture<TaskOperationProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskOperationProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskOperationProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
