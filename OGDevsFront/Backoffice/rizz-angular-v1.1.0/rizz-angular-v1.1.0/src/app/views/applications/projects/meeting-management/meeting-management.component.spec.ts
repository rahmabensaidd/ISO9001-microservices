import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingManagementComponent } from './meeting-management.component';

describe('MeetingManagementComponent', () => {
  let component: MeetingManagementComponent;
  let fixture: ComponentFixture<MeetingManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
