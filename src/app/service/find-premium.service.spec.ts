import { TestBed } from '@angular/core/testing';

import { FindPremiumService } from './find-premium.service';

describe('FindPremiumService', () => {
  let service: FindPremiumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FindPremiumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
