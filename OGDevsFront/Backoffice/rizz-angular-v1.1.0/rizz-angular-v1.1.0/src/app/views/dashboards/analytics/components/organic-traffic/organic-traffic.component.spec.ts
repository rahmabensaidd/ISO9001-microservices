import { ComponentFixture, TestBed } from '@angular/core/testing'

import { OrganicTrafficComponent } from './organic-traffic.component'

describe('OrganicTrafficComponent', () => {
  let component: OrganicTrafficComponent
  let fixture: ComponentFixture<OrganicTrafficComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganicTrafficComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(OrganicTrafficComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
