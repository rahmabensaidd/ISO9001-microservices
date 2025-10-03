import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ToastUiComponent } from './toast-ui.component'

describe('ToastUiComponent', () => {
  let component: ToastUiComponent
  let fixture: ComponentFixture<ToastUiComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastUiComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ToastUiComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
