import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RefundSummaryComponent } from './refund-summary.component'

describe('RefundSummaryComponent', () => {
  let component: RefundSummaryComponent
  let fixture: ComponentFixture<RefundSummaryComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundSummaryComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(RefundSummaryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
