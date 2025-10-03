import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiRcomponentComponent } from './kpi-rcomponent.component';

describe('KpiRcomponentComponent', () => {
  let component: KpiRcomponentComponent;
  let fixture: ComponentFixture<KpiRcomponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiRcomponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiRcomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
