import { ComponentFixture, TestBed } from '@angular/core/testing'

import { InvoiceTermsComponent } from './invoice-terms.component'

describe('InvoiceTermsComponent', () => {
  let component: InvoiceTermsComponent
  let fixture: ComponentFixture<InvoiceTermsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceTermsComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(InvoiceTermsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
