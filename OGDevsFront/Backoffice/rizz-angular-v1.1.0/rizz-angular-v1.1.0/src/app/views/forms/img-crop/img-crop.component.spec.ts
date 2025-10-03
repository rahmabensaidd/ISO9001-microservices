import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ImgCropComponent } from './img-crop.component'

describe('ImgCropComponent', () => {
  let component: ImgCropComponent
  let fixture: ComponentFixture<ImgCropComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImgCropComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ImgCropComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
