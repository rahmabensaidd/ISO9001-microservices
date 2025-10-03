import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeFileComponent } from './resume-file.component';

describe('ResumeFileComponent', () => {
  let component: ResumeFileComponent;
  let fixture: ComponentFixture<ResumeFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
