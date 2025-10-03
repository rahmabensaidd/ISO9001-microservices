import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsoClausesComponentComponent } from './iso-clauses-component.component';

describe('IsoClausesComponentComponent', () => {
  let component: IsoClausesComponentComponent;
  let fixture: ComponentFixture<IsoClausesComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IsoClausesComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IsoClausesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
