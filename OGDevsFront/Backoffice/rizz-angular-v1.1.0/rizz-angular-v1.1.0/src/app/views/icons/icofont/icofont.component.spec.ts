import { ComponentFixture, TestBed } from '@angular/core/testing'

import { IcofontComponent } from './icofont.component'

describe('IcofontComponent', () => {
  let component: IcofontComponent
  let fixture: ComponentFixture<IcofontComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcofontComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(IcofontComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
