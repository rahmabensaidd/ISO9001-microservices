import { ComponentFixture, TestBed } from '@angular/core/testing'

import { IconoirComponent } from './iconoir.component'

describe('IconoirComponent', () => {
  let component: IconoirComponent
  let fixture: ComponentFixture<IconoirComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconoirComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(IconoirComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
