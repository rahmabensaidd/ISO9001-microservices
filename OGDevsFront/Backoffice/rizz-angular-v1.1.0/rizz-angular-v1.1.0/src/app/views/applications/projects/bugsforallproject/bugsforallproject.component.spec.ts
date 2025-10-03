import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BugsforallprojectComponent } from './bugsforallproject.component';

describe('BugsforallprojectComponent', () => {
  let component: BugsforallprojectComponent;
  let fixture: ComponentFixture<BugsforallprojectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BugsforallprojectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BugsforallprojectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
