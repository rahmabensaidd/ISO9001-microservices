import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetRequestAdminComponent } from './projet-request-admin.component';

describe('ProjetRequestAdminComponent', () => {
  let component: ProjetRequestAdminComponent;
  let fixture: ComponentFixture<ProjetRequestAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetRequestAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetRequestAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
