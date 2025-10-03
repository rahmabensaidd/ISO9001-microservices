import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditCalendarComponent } from './audit-calendar.component';

describe('AuditCalandarComponent', () => {
  let component: AuditCalendarComponent;
  let fixture: ComponentFixture<AuditCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
