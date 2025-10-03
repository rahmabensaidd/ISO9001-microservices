import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobOffreComponent } from './job-offre.component';

describe('JobOffreComponent', () => {
  let component: JobOffreComponent;
  let fixture: ComponentFixture<JobOffreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOffreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobOffreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
