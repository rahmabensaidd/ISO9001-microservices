import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectiveManagementComponent } from './objective-management.component';

describe('ObjectiveManagementComponent', () => {
  let component: ObjectiveManagementComponent;
  let fixture: ComponentFixture<ObjectiveManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectiveManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjectiveManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
