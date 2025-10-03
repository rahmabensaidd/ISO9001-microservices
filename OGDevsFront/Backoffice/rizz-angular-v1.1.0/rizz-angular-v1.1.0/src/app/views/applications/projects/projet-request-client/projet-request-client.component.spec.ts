import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetRequestClientComponent } from './projet-request-client.component';

describe('ProjetRequestClientComponent', () => {
  let component: ProjetRequestClientComponent;
  let fixture: ComponentFixture<ProjetRequestClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetRequestClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetRequestClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
