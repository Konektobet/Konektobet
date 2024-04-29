import { TestBed } from '@angular/core/testing';

import { InitialRecommendService } from './initial-recommend.service';

describe('InitialRecommendService', () => {
  let service: InitialRecommendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InitialRecommendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
