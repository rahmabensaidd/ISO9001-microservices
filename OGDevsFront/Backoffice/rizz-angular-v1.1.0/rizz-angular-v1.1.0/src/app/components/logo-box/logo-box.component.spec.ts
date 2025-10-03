import { ComponentFixture, TestBed } from '@angular/core/testing'

import { LogoBoxComponent } from './logo-box.component'

describe('LogoBoxComponent', () => {
  let component: LogoBoxComponent
  let fixture: ComponentFixture<LogoBoxComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoBoxComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(LogoBoxComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
