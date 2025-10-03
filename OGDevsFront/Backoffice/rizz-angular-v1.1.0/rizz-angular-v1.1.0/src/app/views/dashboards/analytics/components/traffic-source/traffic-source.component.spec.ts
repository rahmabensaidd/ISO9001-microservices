import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TrafficSourceComponent } from './traffic-source.component'

describe('TrafficSourceComponent', () => {
  let component: TrafficSourceComponent
  let fixture: ComponentFixture<TrafficSourceComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficSourceComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(TrafficSourceComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
