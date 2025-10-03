import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfcDashboardComponentComponent } from './afc-dashboard.component.component';

describe('AfcDashboardComponentComponent', () => {
  let component: AfcDashboardComponentComponent;
  let fixture: ComponentFixture<AfcDashboardComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfcDashboardComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfcDashboardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
