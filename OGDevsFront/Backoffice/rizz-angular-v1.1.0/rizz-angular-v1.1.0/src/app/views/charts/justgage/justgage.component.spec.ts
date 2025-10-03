import { ComponentFixture, TestBed } from '@angular/core/testing'

import { JustgageComponent } from './justgage.component'

describe('JustgageComponent', () => {
  let component: JustgageComponent
  let fixture: ComponentFixture<JustgageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JustgageComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(JustgageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
