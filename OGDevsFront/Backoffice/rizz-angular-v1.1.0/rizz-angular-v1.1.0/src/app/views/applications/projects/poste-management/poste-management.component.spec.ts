import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosteManagementComponent } from './poste-management.component';

describe('PosteManagementComponent', () => {
  let component: PosteManagementComponent;
  let fixture: ComponentFixture<PosteManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosteManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosteManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
