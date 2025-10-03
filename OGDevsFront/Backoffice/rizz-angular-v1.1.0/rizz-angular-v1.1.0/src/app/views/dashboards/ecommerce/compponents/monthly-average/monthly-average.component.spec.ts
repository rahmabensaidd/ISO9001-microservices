import { ComponentFixture, TestBed } from '@angular/core/testing'

import { MonthlyAverageComponent } from './monthly-average.component'

describe('MonthlyAverageComponent', () => {
  let component: MonthlyAverageComponent
  let fixture: ComponentFixture<MonthlyAverageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyAverageComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(MonthlyAverageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
