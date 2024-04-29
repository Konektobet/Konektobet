import { TestBed } from '@angular/core/testing';

import { FavClinicService } from './fav-clinic.service';

describe('FavClinicService', () => {
  let service: FavClinicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavClinicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
