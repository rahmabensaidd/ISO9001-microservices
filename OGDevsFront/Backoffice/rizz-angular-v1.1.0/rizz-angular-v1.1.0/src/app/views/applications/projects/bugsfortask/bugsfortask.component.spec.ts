import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BugsfortaskComponent } from './bugsfortask.component';

describe('BugsfortaskComponent', () => {
  let component: BugsfortaskComponent;
  let fixture: ComponentFixture<BugsfortaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BugsfortaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BugsfortaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
