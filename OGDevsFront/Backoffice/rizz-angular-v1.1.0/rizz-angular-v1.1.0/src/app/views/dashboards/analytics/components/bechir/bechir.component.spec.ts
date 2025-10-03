import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BechirComponent } from './bechir.component';

describe('BechirComponent', () => {
  let component: BechirComponent;
  let fixture: ComponentFixture<BechirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BechirComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BechirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
