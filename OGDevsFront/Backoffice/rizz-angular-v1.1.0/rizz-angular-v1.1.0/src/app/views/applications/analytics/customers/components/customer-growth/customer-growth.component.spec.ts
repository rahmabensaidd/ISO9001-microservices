import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CustomerGrowthComponent } from './customer-growth.component'

describe('CustomerGrowthComponent', () => {
  let component: CustomerGrowthComponent
  let fixture: ComponentFixture<CustomerGrowthComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerGrowthComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(CustomerGrowthComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
