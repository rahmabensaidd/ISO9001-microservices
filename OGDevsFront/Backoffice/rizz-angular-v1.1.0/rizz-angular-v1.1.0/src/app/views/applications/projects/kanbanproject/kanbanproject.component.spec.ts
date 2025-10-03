import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanProjectComponent } from './kanbanproject.component';

describe('KanbanprojectComponent', () => {
  let component: KanbanProjectComponent;
  let fixture: ComponentFixture<KanbanProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KanbanProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
