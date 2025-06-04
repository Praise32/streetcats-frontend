import { TestBed } from '@angular/core/testing';

import { RevgeocodingService } from './revgeocoding.service';

describe('RevgeocodingService', () => {
  let service: RevgeocodingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevgeocodingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
