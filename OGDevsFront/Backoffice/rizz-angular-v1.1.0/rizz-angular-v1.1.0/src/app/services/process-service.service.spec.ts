import { TestBed } from '@angular/core/testing';

import { ProcessService } from './process-service.service';

describe('ProcessServiceService', () => {
  let service: ProcessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
