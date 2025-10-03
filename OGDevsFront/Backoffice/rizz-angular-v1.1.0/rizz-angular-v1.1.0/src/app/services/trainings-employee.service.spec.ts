import { TestBed } from '@angular/core/testing';

import { TrainingsEmployeeService } from './trainings-employee.service';

describe('TrainingsEmployeeService', () => {
  let service: TrainingsEmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingsEmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
