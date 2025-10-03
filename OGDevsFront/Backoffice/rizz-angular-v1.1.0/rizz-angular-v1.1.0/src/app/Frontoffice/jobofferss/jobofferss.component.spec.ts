import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobofferssComponent } from './jobofferss.component';

describe('JobofferssComponent', () => {
  let component: JobofferssComponent;
  let fixture: ComponentFixture<JobofferssComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobofferssComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobofferssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
