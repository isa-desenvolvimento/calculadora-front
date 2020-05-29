import { TestBed } from '@angular/core/testing';

import { ParceladoPreService } from './parcelado-pre.service';

describe('ParceladoPreService', () => {
  let service: ParceladoPreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParceladoPreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
