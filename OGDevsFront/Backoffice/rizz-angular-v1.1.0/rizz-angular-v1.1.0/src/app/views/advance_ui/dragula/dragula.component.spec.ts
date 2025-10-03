import { ComponentFixture, TestBed } from '@angular/core/testing'

import { DragulaComponent } from './dragula.component'

describe('DragulaComponent', () => {
  let component: DragulaComponent
  let fixture: ComponentFixture<DragulaComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragulaComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(DragulaComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
