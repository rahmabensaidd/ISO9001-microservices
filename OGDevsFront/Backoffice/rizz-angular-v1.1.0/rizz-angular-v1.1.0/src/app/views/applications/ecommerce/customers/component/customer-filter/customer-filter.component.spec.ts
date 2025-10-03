import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CustomerFilterComponent } from './customer-filter.component'

describe('CustomerFilterComponent', () => {
  let component: CustomerFilterComponent
  let fixture: ComponentFixture<CustomerFilterComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerFilterComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(CustomerFilterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
