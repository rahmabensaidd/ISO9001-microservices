import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerContractsComponent } from './manager-contracts.component';

describe('ManagerContractsComponent', () => {
  let component: ManagerContractsComponent;
  let fixture: ComponentFixture<ManagerContractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerContractsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
