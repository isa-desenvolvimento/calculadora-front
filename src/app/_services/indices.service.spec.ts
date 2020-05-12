import { TestBed } from '@angular/core/testing';

import { IndicesService } from './indices.service';

describe('IndicesService', () => {
  let service: IndicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
