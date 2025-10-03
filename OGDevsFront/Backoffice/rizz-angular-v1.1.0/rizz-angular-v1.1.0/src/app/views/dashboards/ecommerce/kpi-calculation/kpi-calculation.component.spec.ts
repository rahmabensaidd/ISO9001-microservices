import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiCalculationComponent } from './kpi-calculation.component';

describe('KpiCalculationComponent', () => {
  let component: KpiCalculationComponent;
  let fixture: ComponentFixture<KpiCalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCalculationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiCalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
