import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingsEmployeeComponent } from './trainings-employee.component';

describe('TrainingsEmployeeComponent', () => {
  let component: TrainingsEmployeeComponent;
  let fixture: ComponentFixture<TrainingsEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingsEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingsEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
