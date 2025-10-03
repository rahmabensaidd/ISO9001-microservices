import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsstatComponent } from './projectsstat.component';

describe('ProjectsstatComponent', () => {
  let component: ProjectsstatComponent;
  let fixture: ComponentFixture<ProjectsstatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsstatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsstatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
