import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingCompComponent } from './loading-comp.component';

describe('LoadingCompComponent', () => {
  let component: LoadingCompComponent;
  let fixture: ComponentFixture<LoadingCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingCompComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
