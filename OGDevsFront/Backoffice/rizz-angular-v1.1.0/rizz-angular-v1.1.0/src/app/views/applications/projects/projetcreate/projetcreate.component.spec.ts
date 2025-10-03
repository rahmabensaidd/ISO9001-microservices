import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetcreateComponent } from './projetcreate.component';

describe('ProjetcreateComponent', () => {
  let component: ProjetcreateComponent;
  let fixture: ComponentFixture<ProjetcreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetcreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetcreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
