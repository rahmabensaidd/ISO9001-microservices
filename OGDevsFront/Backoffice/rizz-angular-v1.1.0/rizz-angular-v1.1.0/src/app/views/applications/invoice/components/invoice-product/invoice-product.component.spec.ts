import { ComponentFixture, TestBed } from '@angular/core/testing'

import { InvoiceProductComponent } from './invoice-product.component'

describe('InvoiceProductComponent', () => {
  let component: InvoiceProductComponent
  let fixture: ComponentFixture<InvoiceProductComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceProductComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(InvoiceProductComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
