import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RefundOrderComponent } from './refund-order.component'

describe('RefundOrderComponent', () => {
  let component: RefundOrderComponent
  let fixture: ComponentFixture<RefundOrderComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundOrderComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(RefundOrderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
