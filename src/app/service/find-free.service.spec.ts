import { TestBed } from '@angular/core/testing';

import { FindFreeService } from './find-free.service';

describe('FindFreeService', () => {
  let service: FindFreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FindFreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
