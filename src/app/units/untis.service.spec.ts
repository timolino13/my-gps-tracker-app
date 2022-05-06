import { TestBed } from '@angular/core/testing';

import { UntisService } from './untis.service';

describe('UntisService', () => {
  let service: UntisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UntisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
