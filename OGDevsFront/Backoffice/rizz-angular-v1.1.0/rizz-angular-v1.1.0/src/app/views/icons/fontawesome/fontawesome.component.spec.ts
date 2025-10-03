import { ComponentFixture, TestBed } from '@angular/core/testing'

import { FontawesomeComponent } from './fontawesome.component'

describe('FontawesomeComponent', () => {
  let component: FontawesomeComponent
  let fixture: ComponentFixture<FontawesomeComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontawesomeComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(FontawesomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
